'use server'

import { supabase } from '@/lib/supabase'
import { encryptData, decryptData } from '@/lib/encryption'
import { redirect } from 'next/navigation'

interface CreateCaseInput {
  incident_date: string
  incident_location: string
  incident_location_geo?: { latitude: number; longitude: number }
  narrative: string
  case_type: string
  consent_given: boolean
  follow_up_consent: boolean
}

export async function createCase(input: CreateCaseInput) {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return { error: 'Unauthorized' }
    }

    // Encrypt narrative before storing
    const encryptedNarrative = encryptData(input.narrative)

    // Generate case number (timestamp-based)
    const caseNumber = `SV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data, error } = await supabase
      .from('cases')
      .insert({
        case_number: caseNumber,
        incident_date: input.incident_date,
        incident_location: input.incident_location,
        incident_location_geo: input.incident_location_geo || null,
        narrative_encrypted: encryptedNarrative,
        case_type: input.case_type,
        consent_given: input.consent_given,
        follow_up_consent: input.follow_up_consent,
        created_by_user_id: session.user.id,
        status: 'open',
        priority: 'medium',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Case creation error:', error)
      return { error: error.message }
    }

    // Log action to audit trail
    await supabase.from('audit_log').insert({
      case_id: data.id,
      user_id: session.user.id,
      action: 'CASE_CREATED',
      description: `Case ${caseNumber} created`,
    })

    return { success: true, caseId: data.id, caseNumber: data.case_number }
  } catch (error) {
    console.error('[v0] Create case action error:', error)
    return { error: 'Failed to create case' }
  }
}

export async function getCaseDetails(caseId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        case_messages:case_messages(id, created_at, sender_id, sender_role),
        case_notes:case_notes(id, created_at, author_id),
        evidence:evidence(id, file_name, file_type, file_size, uploaded_at)
      `)
      .eq('id', caseId)
      .single()

    if (error) {
      return { error: error.message }
    }

    // Decrypt sensitive fields
    if (data.narrative_encrypted) {
      try {
        data.narrative_encrypted = decryptData(data.narrative_encrypted)
      } catch {
        data.narrative_encrypted = '[Decryption failed]'
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Get case error:', error)
    return { error: 'Failed to fetch case' }
  }
}

export async function assignCase(caseId: string, caseworkerId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('cases')
      .update({ assigned_to: caseworkerId, status: 'in_progress' })
      .eq('id', caseId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Audit log
    await supabase.from('audit_log').insert({
      case_id: caseId,
      user_id: session.user.id,
      action: 'CASE_ASSIGNED',
      description: `Case assigned to ${caseworkerId}`,
    })

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Assign case error:', error)
    return { error: 'Failed to assign case' }
  }
}

export async function updateCaseStatus(caseId: string, status: 'open' | 'in_progress' | 'closed' | 'archived') {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const updateData: Record<string, any> = { status }
    
    if (status === 'closed') {
      updateData.closed_at = new Date().toISOString()
      // Set evidence expiration to 90 days from now
      updateData.evidence_expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }

    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', caseId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Audit log
    await supabase.from('audit_log').insert({
      case_id: caseId,
      user_id: session.user.id,
      action: 'CASE_STATUS_UPDATED',
      description: `Case status changed to ${status}`,
    })

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Update case status error:', error)
    return { error: 'Failed to update case status' }
  }
}

export async function addCaseMessage(caseId: string, message: string, senderRole: 'victim' | 'caseworker') {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const encryptedMessage = encryptData(message)

    const { data, error } = await supabase
      .from('case_messages')
      .insert({
        case_id: caseId,
        sender_id: session.user.id,
        message_encrypted: encryptedMessage,
        sender_role: senderRole,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Add message error:', error)
    return { error: 'Failed to send message' }
  }
}
