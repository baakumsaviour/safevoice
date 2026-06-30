'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getVictimCasesAction() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {}
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('victim_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, cases: data }
  } catch (error) {
    console.error('Error fetching victim cases:', error)
    return { error: 'Failed to fetch case history' }
  }
}
