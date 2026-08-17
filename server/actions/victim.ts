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
