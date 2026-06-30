'use server'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function triggerAIResponse(caseId: string) {
  try {
    // Check if AI is active
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select('ai_active')
      .eq('id', caseId)
      .single()

    if (caseError || caseData?.ai_active === false) return

    // Fetch conversation history
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('case_messages')
      .select('message_encrypted, sender_role')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })
      .limit(10) // Only take the last 10 messages for context

    if (msgError || !messages) return

    const openRouterMessages = [
      {
        role: 'system',
        content: `You are SafeVoice Assistant, a trauma-informed AI responder. 
Your primary goal is to provide a calming, supportive, and safe environment for victims. 
Do NOT give medical or legal advice. 
Acknowledge their courage. Keep responses concise (1-3 sentences max).
If they indicate immediate life-threatening danger, tell them to call emergency services immediately.
If their situation is complex or they ask for a human, say you will notify a human caseworker to take over shortly.`
      },
      ...messages.map(m => ({
        role: m.sender_role === 'victim' ? 'user' : 'assistant',
        content: Buffer.from(m.message_encrypted, 'base64').toString('utf8')
      }))
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SafeVoice',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: openRouterMessages,
      }),
    })

    if (!response.ok) throw new Error('OpenRouter API failed')

    const responseData = await response.json()
    const aiMessage = responseData.choices[0].message.content

    // Use a special system ID or just use the case's creator ID but mark role as 'caseworker'
    // To identify AI, we will prepend a specific tag that the frontend will catch, 
    // or just insert as caseworker so it appears on the right side.
    const finalAiMessage = `[AI] ${aiMessage}`

    await supabaseAdmin
      .from('case_messages')
      .insert({
        case_id: caseId,
        sender_id: caseId, // Dummy sender ID since AI doesn't have a user ID. Or we can just use the victim ID as a hack since RLS is bypassed. Let's use the first admin or a dummy UUID.
        // Wait, schema requires sender_id to exist in users. 
        // We'll fetch a valid admin or just use the victim's ID but with caseworker role.
        sender_id: (await supabaseAdmin.from('users').select('id').eq('role', 'victim').limit(1).single()).data?.id,
        sender_role: 'caseworker',
        message_encrypted: Buffer.from(finalAiMessage).toString('base64')
      })

  } catch (err) {
    console.error('AI trigger error:', err)
  }
}

export async function initializeChatAction(initialMessage: string) {
  try {
    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {}
        }
      }
    )

    const { data: { user } } = await supabaseServer.auth.getUser()
    let victimId = ''

    if (user) {
      victimId = user.id
    } else {
      const { data: anonUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({ email: `anon-chat-${Date.now()}@safevoice.local`, role: 'victim' })
        .select('id')
        .single()

      if (userError || !anonUser) throw userError
      victimId = anonUser.id
    }

    const caseNumber = 'CAS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const { data: newCase, error: caseError } = await supabaseAdmin
      .from('cases')
      .insert({
        case_number: caseNumber,
        victim_id: victimId,
        created_by_user_id: victimId,
        status: 'open',
        priority: 'high',
        case_type: 'general_abuse',
        narrative_encrypted: Buffer.from("Initiated via live chat").toString('base64'),
        ai_active: true // default
      })
      .select('id, case_number')
      .single()

    if (caseError || !newCase) throw caseError

    const { error: msgError } = await supabaseAdmin
      .from('case_messages')
      .insert({
        case_id: newCase.id,
        sender_id: victimId,
        sender_role: 'victim',
        message_encrypted: Buffer.from(initialMessage).toString('base64')
      })

    if (msgError) throw msgError

    // Trigger AI
    await triggerAIResponse(newCase.id)

    return { success: true, caseId: newCase.id, caseNumber: newCase.case_number, userId: victimId }
  } catch (error) {
    console.error('Chat initialization error:', error)
    return { error: 'Failed to start secure chat. Please try again or use the full report form.' }
  }
}

export async function sendChatMessageAction(caseId: string, userId: string, message: string, role: 'victim' | 'caseworker' = 'victim') {
  try {
    // If a human caseworker replies, turn off AI
    if (role === 'caseworker') {
      await supabaseAdmin.from('cases').update({ ai_active: false }).eq('id', caseId)
    }

    const { data, error } = await supabaseAdmin
      .from('case_messages')
      .insert({
        case_id: caseId,
        sender_id: userId,
        sender_role: role,
        message_encrypted: Buffer.from(message).toString('base64')
      })
      .select()
      .single()

    if (error) throw error

    // If victim sent message, trigger AI
    if (role === 'victim') {
      await triggerAIResponse(caseId)
    }

    return { success: true, message: data }
  } catch (error) {
    console.error('Send message error:', error)
    return { error: 'Failed to send message.' }
  }
}

export async function getCaseDetailsAction(caseId: string) {
  try {
    // We use caseNumber instead of UUID for the URL parameter currently, let's fetch by case_number
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select('*')
      .eq('case_number', caseId)
      .single()
      
    if (caseError || !caseData) throw caseError

    const { data: messages, error: msgError } = await supabaseAdmin
      .from('case_messages')
      .select('*')
      .eq('case_id', caseData.id)
      .order('created_at', { ascending: true })

    if (msgError) throw msgError

    return { success: true, caseData, messages }
  } catch (e) {
    return { error: 'Failed to load case' }
  }
}
