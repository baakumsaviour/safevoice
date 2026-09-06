'use server'

import { createClient } from '@/lib/supabase/server'

export async function getVictimCasesAction() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // User-scoped client: RLS restricts rows to the caller's own cases.
    const { data, error } = await supabase
      .from('cases')
      .select('id, case_number, case_type, status, priority, created_at')
      .or(`victim_id.eq.${user.id},created_by_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, cases: data }
  } catch (error) {
    console.error('Error fetching victim cases:', error)
    return { error: 'Failed to fetch case history' }
  }
}

/**
 * Public status lookup by case reference code (e.g. "SV-U5S6-PPBA").
 * Safe for anonymous victims: returns high-level progress status without
 * exposing any encrypted narrative or personal contact information.
 */
export async function lookupAnonymousCaseAction(caseNumber: string) {
  try {
    const cleanNumber = caseNumber?.trim().toUpperCase()
    if (!cleanNumber || cleanNumber.length < 5) {
      return { error: 'Please provide a valid case reference code.' }
    }

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()

    const { data: caseRow, error } = await admin
      .from('cases')
      .select('case_number, status, priority, case_type, incident_location, incident_date, created_at')
      .eq('case_number', cleanNumber)
      .maybeSingle()

    if (error || !caseRow) {
      return { error: 'No report found matching that reference code. Please check the code and try again.' }
    }

    return {
      success: true as const,
      caseData: {
        caseNumber: caseRow.case_number,
        status: caseRow.status,
        priority: caseRow.priority,
        caseType: caseRow.case_type,
        location: caseRow.incident_location,
        date: caseRow.incident_date,
        createdAt: caseRow.created_at,
      },
    }
  } catch (err) {
    console.error('[lookup] error:', err)
    return { error: 'Could not lookup report status at this time. Please try again.' }
  }
}

