'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function inviteCaseworkerAction(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const name = formData.get('name') as string

    // Send invite using Supabase Admin Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
       data: { name }
    })

    if (authError || !authData.user) {
       console.error("Invite Error", authError)
       return { error: 'Failed to send invite email' }
    }

    // Upsert into public.users
    await supabaseAdmin.from('users').upsert({
       id: authData.user.id,
       email: email,
       full_name: name,
       role: 'caseworker',
    })

    return { success: true }
  } catch (error) {
    console.error('Error inviting caseworker', error)
    return { error: 'Unexpected error occurred' }
  }
}

export async function assignCaseAction(caseId: string, caseworkerId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('cases')
      .update({ assigned_to: caseworkerId, status: 'in_progress' })
      .eq('id', caseId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Assign case error:', error)
    return { error: 'Failed to assign case' }
  }
}

export async function getAdminDataAction() {
  try {
    // Fetch all cases
    const { data: cases } = await supabaseAdmin.from('cases').select('*, assigned_user:assigned_to(full_name)')
    
    // Fetch all caseworkers
    const { data: caseworkers } = await supabaseAdmin.from('users').select('*').eq('role', 'caseworker')
    
    // Basic analytics
    const totalCases = cases?.length || 0
    const openCases = cases?.filter(c => c.status === 'open').length || 0
    
    return { success: true, cases, caseworkers, analytics: { totalCases, openCases } }
  } catch (error) {
    return { error: 'Failed to fetch admin data' }
  }
}
