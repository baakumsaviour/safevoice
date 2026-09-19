'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const STAFF_ROLES = ['admin', 'caseworker', 'analyst']

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const portal = String(formData.get('portal') ?? '').trim()
  if (!email || !password) return { error: 'Please enter your email and password.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (!userRecord) {
    // Account exists in auth but has no profile/role — don't strand the user
    // in a redirect loop between /admin and /dashboard.
    await supabase.auth.signOut()
    return { error: 'Your account is not fully set up yet. Please contact support.' }
  }

  const isStaff = STAFF_ROLES.includes(userRecord.role)

  if (portal === 'staff' && !isStaff) {
    await supabase.auth.signOut()
    return { error: 'Access restricted. This portal is for authorized DOVVSU officers and caseworkers only.' }
  }

  redirect(isStaff ? '/admin' : '/dashboard')
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = formData.get('confirmPassword')
  const name = String(formData.get('name') ?? '').trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  if (password.length < 8) return { error: 'Your password must be at least 8 characters long.' }
  if (confirmPassword !== null && String(confirmPassword) !== password) {
    return { error: 'The passwords do not match.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const admin = createAdminClient()
    const { data: existing } = await admin.from('users').select('id').eq('id', data.user.id).maybeSingle()
    if (!existing) {
      const { error: insertError } = await admin.from('users').insert({
        id: data.user.id,
        email,
        full_name: name || null,
        role: 'victim',
      })
      if (insertError) {
        console.error('[auth] profile insert failed:', insertError)
        return { error: 'We could not finish creating your account. Please try again.' }
      }
    }
  }

  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    return { confirmEmail: true as const }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function adminLogoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/admin-login')
}

