'use server'

import { after } from 'next/server'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionUser, requireUser, type SessionUser } from '@/server/auth'
import { encrypt, decrypt } from '@/lib/server/encryption'
import { generateCaseNumber } from '@/lib/server/case-number'

export type ChatMessage = {
  id: string
  text: string
  role: 'victim' | 'caseworker' | 'ai'
  created_at: string
}

export type ActionError = { error: string }

export type CaseDetails = {
  [key: string]: unknown
  id: string
  case_number: string
  victim_id: string | null
  created_by_user_id: string
  assigned_to: string | null
  ai_active: boolean
  status: string
  case_type: string | null
  incident_location: string | null
  narrative: string
}

type CaseRow = {
  id: string
  case_number: string
  victim_id: string | null
  created_by_user_id: string
  assigned_to: string | null
  ai_active: boolean
  status: string
  case_type: string
  incident_location: string | null
  narrative_encrypted: string | null
}

const AI_SYSTEM_PROMPT = `You are SafeVoice Assistant, a trauma-informed AI responder.
Your primary goal is to provide a calming, supportive, and safe environment for victims.
Do NOT give medical or legal advice.
Acknowledge their courage. Keep responses concise (1-3 sentences max).
If they indicate immediate life-threatening danger, tell them to call emergency services immediately.
If their situation is complex or they ask for a human, say you will notify a human caseworker to take over shortly.`

function toChatMessage(m: { id: string; message_encrypted: string; sender_role: string; created_at: string }): ChatMessage {
  let text = decrypt(m.message_encrypted)
  let role = m.sender_role as ChatMessage['role']
  // Legacy rows stored AI replies as caseworker messages prefixed with "[AI] ".
  if (text.startsWith('[AI] ')) {
    text = text.slice(5)
    role = 'ai'
  }
  return { id: m.id, text, role, created_at: m.created_at }
}

/**
 * View access: the case's victim/creator, or any staff member. Staff must be
 * able to open unassigned cases to triage and self-assign them (the admin
 * dashboard lists every case for staff), and analysts have read-only access.
 */
function canViewCase(user: SessionUser, caseRow: Pick<CaseRow, 'victim_id' | 'created_by_user_id' | 'assigned_to'>): boolean {
  if (caseRow.victim_id === user.id || caseRow.created_by_user_id === user.id) return true
  return user.role === 'caseworker' || user.role === 'admin' || user.role === 'analyst'
}

/** Send access: the victim, the assigned caseworker, or an admin — not analysts. */
function canSendToCase(user: SessionUser, caseRow: Pick<CaseRow, 'victim_id' | 'created_by_user_id' | 'assigned_to'>): boolean {
  if (caseRow.victim_id === user.id || caseRow.created_by_user_id === user.id) return true
  if (user.role === 'admin') return true
  return user.role === 'caseworker' && caseRow.assigned_to === user.id
}

async function fetchCaseById(caseId: string): Promise<CaseRow | null> {
  const { data } = await createAdminClient()
    .from('cases')
    .select('id, case_number, victim_id, created_by_user_id, assigned_to, ai_active, status, case_type, incident_location, narrative_encrypted')
    .eq('id', caseId)
    .single()
  return (data as CaseRow) ?? null
}

export async function triggerAIResponse(caseId: string): Promise<void> {
  try {
    const admin = createAdminClient()

    const { data: caseData } = await admin.from('cases').select('ai_active').eq('id', caseId).single()
    if (!caseData || caseData.ai_active === false) return

    const { data: messages } = await admin
      .from('case_messages')
      .select('id, message_encrypted, sender_role, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!messages || messages.length === 0) return

    const history = messages
      .reverse()
      .map(toChatMessage)
      .map((m) => ({
        role: m.role === 'victim' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }))

    const { text } = await generateText({
      // Plain "provider/model" strings route through the Vercel AI Gateway
      // using AI_GATEWAY_API_KEY.
      model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
      system: AI_SYSTEM_PROMPT,
      messages: history,
    })

    if (!text) return

    const { error } = await admin.from('case_messages').insert({
      case_id: caseId,
      sender_id: null,
      sender_role: 'ai',
      message_encrypted: encrypt(text),
    })
    if (error) console.error('[chat] failed to store AI reply:', error)
  } catch (err) {
    console.error('[chat] AI response failed:', err)
  }
}

/**
 * Starts an anonymous secure chat: gives the visitor an anonymous auth
 * session (or reuses their signed-in session), creates a case, stores the
 * first message, and triggers the AI responder.
 */
export async function initializeChatAction(initialMessage: string) {
  try {
    const message = initialMessage?.trim()
    if (!message || message.length > 4000) {
      return { error: 'Please enter a message to start the chat.' }
    }

    const supabase = await createClient()
    const admin = createAdminClient()

    let userId: string
    let email: string | null = null
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
      email = user.email ?? null
    } else {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      if (anonError || !anonData.user) {
        console.error('[chat] anonymous sign-in failed:', anonError)
        return { error: 'Failed to start secure chat. Please try again or use the full report form.' }
      }
      userId = anonData.user.id
    }

    const { data: existingProfile } = await admin.from('users').select('id').eq('id', userId).maybeSingle()
    if (!existingProfile) {
      const { error: userError } = await admin.from('users').insert({
        id: userId,
        email: email ?? `anon-${userId}@safevoice.local`,
        role: 'victim',
      })
      if (userError) throw userError
    }

    let newCase: { id: string; case_number: string } | null = null
    for (let attempt = 0; attempt < 3 && !newCase; attempt++) {
      const { data: inserted, error: caseError } = await admin
        .from('cases')
        .insert({
          case_number: generateCaseNumber(),
          victim_id: userId,
          created_by_user_id: userId,
          status: 'open',
          priority: 'high',
          case_type: 'general_abuse',
          narrative_encrypted: encrypt('Initiated via live chat'),
          ai_active: true,
        })
        .select('id, case_number')
        .single()
      if (inserted) newCase = inserted
      else if (caseError?.code !== '23505') throw caseError
    }
    if (!newCase) return { error: 'Failed to start secure chat. Please try again.' }

    const { error: msgError } = await admin.from('case_messages').insert({
      case_id: newCase.id,
      sender_id: userId,
      sender_role: 'victim',
      message_encrypted: encrypt(message),
    })
    if (msgError) throw msgError

    // AI reply reaches the client via realtime; don't block chat startup on it.
    after(() => triggerAIResponse(newCase.id))

    return { success: true as const, caseId: newCase.id, caseNumber: newCase.case_number }
  } catch (error) {
    console.error('[chat] initialization error:', error)
    return { error: 'Failed to start secure chat. Please try again or use the full report form.' }
  }
}

/**
 * Sends a message into a case. The sender's identity and role come from the
 * session, never from the client. Staff replies pause the AI responder.
 */
export async function sendChatMessageAction(caseId: string, message: string) {
  try {
    const text = message?.trim()
    if (!text || text.length > 4000) return { error: 'Message is empty or too long.' }

    const user = await requireUser()
    const caseRow = await fetchCaseById(caseId)
    if (!caseRow || !canSendToCase(user, caseRow)) return { error: 'You do not have access to this case.' }

    const isVictim = caseRow.victim_id === user.id || caseRow.created_by_user_id === user.id
    const senderRole = isVictim ? 'victim' : 'caseworker'
    const admin = createAdminClient()

    if (senderRole === 'caseworker' && caseRow.ai_active) {
      await admin.from('cases').update({ ai_active: false }).eq('id', caseId)
    }

    const { data, error } = await admin
      .from('case_messages')
      .insert({
        case_id: caseId,
        sender_id: user.id,
        sender_role: senderRole,
        message_encrypted: encrypt(text),
      })
      .select('id, message_encrypted, sender_role, created_at')
      .single()

    if (error || !data) throw error

    // The AI reply is delivered to clients via realtime, not this return
    // value — run it after the response so a slow model never blocks the
    // sender's UI.
    if (senderRole === 'victim') {
      after(() => triggerAIResponse(caseId))
    }

    return { success: true as const, message: toChatMessage(data) }
  } catch (error) {
    console.error('[chat] send message error:', error)
    return { error: 'Failed to send message.' }
  }
}

/** Decrypted message list for a case the caller can access. */
export async function getCaseMessagesAction(
  caseId: string,
  afterIso?: string
): Promise<ActionError | { success: true; messages: ChatMessage[]; aiActive: boolean }> {
  try {
    const user = await requireUser()
    const caseRow = await fetchCaseById(caseId)
    if (!caseRow || !canViewCase(user, caseRow)) return { error: 'You do not have access to this case.' }

    let query = createAdminClient()
      .from('case_messages')
      .select('id, message_encrypted, sender_role, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })
    // Incremental fetch: realtime subscribers pass their newest timestamp so
    // each event costs one row, not a full-thread refetch + decrypt.
    if (afterIso) query = query.gt('created_at', afterIso)

    const { data: messages, error } = await query
    if (error) throw error

    return { success: true as const, messages: (messages ?? []).map(toChatMessage), aiActive: caseRow.ai_active }
  } catch (error) {
    console.error('[chat] fetch messages error:', error)
    return { error: 'Failed to load messages.' }
  }
}

/**
 * Case details + decrypted narrative and messages, looked up by case number.
 * Access: the case's victim/creator, the assigned staff member, or an admin.
 */
export async function getCaseDetailsAction(
  caseNumber: string
): Promise<ActionError | { success: true; caseData: CaseDetails; messages: ChatMessage[] }> {
  try {
    const user = await getSessionUser()
    if (!user) return { error: 'Please sign in to view this case.' }

    const admin = createAdminClient()
    const { data: caseData, error: caseError } = await admin
      .from('cases')
      .select('*')
      .eq('case_number', caseNumber)
      .single()
    if (caseError || !caseData) return { error: 'Case not found.' }

    if (!canViewCase(user, caseData)) return { error: 'You do not have access to this case.' }

    const { data: messages, error: msgError } = await admin
      .from('case_messages')
      .select('id, message_encrypted, sender_role, created_at')
      .eq('case_id', caseData.id)
      .order('created_at', { ascending: true })
    if (msgError) throw msgError

    await admin.from('audit_log').insert({
      case_id: caseData.id,
      user_id: user.id,
      action: 'case_viewed',
      description: `Case ${caseData.case_number} viewed`,
    })

    const { narrative_encrypted, ...rest } = caseData
    return {
      success: true as const,
      caseData: { ...rest, narrative: decrypt(narrative_encrypted) } as CaseDetails,
      messages: (messages ?? []).map(toChatMessage),
    }
  } catch (error) {
    console.error('[chat] case details error:', error)
    return { error: 'Failed to load case' }
  }
}
