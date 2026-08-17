'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, AuthError } from '@/server/auth'

function toActionError(error: unknown, fallback: string): { error: string } {
  if (error instanceof AuthError) {
    return { error: error.code === 'UNAUTHENTICATED' ? 'Please sign in.' : 'You are not authorized to do this.' }
  }
  return { error: fallback }
}

export async function inviteCaseworkerAction(formData: FormData) {
  try {
    const admin = await requireRole('admin')

    const email = String(formData.get('email') ?? '').trim()
    const name = String(formData.get('name') ?? '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' }

    const supabaseAdmin = createAdminClient()
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name },
    })

    if (authError || !authData.user) {
      console.error('[admin] invite error:', authError)
      return { error: 'Failed to send invite email' }
    }

    const { error: upsertError } = await supabaseAdmin.from('users').upsert({
      id: authData.user.id,
      email,
      full_name: name || null,
      role: 'caseworker',
    })
    if (upsertError) {
      console.error('[admin] caseworker upsert error:', upsertError)
      return { error: 'Invite sent, but the account role could not be saved. Please retry.' }
    }

    await supabaseAdmin.from('audit_log').insert({
      user_id: admin.id,
      action: 'caseworker_invited',
      description: `Invited caseworker ${email}`,
    })

    return { success: true as const }
  } catch (error) {
    console.error('[admin] error inviting caseworker:', error)
    return toActionError(error, 'Unexpected error occurred')
  }
}

export async function assignCaseAction(caseId: string, caseworkerId: string) {
  try {
    const staff = await requireRole('caseworker', 'admin')
    const supabaseAdmin = createAdminClient()

    // The assignee must actually be staff.
    const { data: assignee } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', caseworkerId)
      .single()
    if (!assignee || !['caseworker', 'admin'].includes(assignee.role)) {
      return { error: 'The selected user is not a caseworker.' }
    }

    const { error } = await supabaseAdmin
      .from('cases')
      .update({ assigned_to: caseworkerId, status: 'in_progress' })
      .eq('id', caseId)
    if (error) throw error

    await supabaseAdmin.from('audit_log').insert({
      case_id: caseId,
      user_id: staff.id,
      action: 'case_assigned',
      description: `Case assigned to ${caseworkerId}`,
    })

    return { success: true as const }
  } catch (error) {
    console.error('[admin] assign case error:', error)
    return toActionError(error, 'Failed to assign case')
  }
}

export async function getAdminDataAction() {
  try {
    await requireRole('caseworker', 'admin', 'analyst')
    const supabaseAdmin = createAdminClient()

    const [{ data: cases }, { data: caseworkers }] = await Promise.all([
      supabaseAdmin
        .from('cases')
        .select('id, case_number, case_type, status, priority, created_at, incident_location, assigned_to, assigned_user:assigned_to(full_name)')
        .neq('status', 'archived')
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('users').select('id, full_name, email, role').eq('role', 'caseworker'),
    ])

    const totalCases = cases?.length || 0
    const openCases = cases?.filter((c) => c.status === 'open').length || 0

    return { success: true as const, cases: cases ?? [], caseworkers: caseworkers ?? [], analytics: { totalCases, openCases } }
  } catch (error) {
    console.error('[admin] fetch data error:', error)
    return toActionError(error, 'Failed to fetch admin data')
  }
}
