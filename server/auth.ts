import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type Role = 'victim' | 'caseworker' | 'admin' | 'analyst'

export type SessionUser = {
  id: string
  role: Role
  email: string | null
}

export class AuthError extends Error {
  constructor(public code: 'UNAUTHENTICATED' | 'FORBIDDEN') {
    super(code)
    this.name = 'AuthError'
  }
}

/** Returns the current session user with their role, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return null
  return { id: user.id, role: profile.role as Role, email: user.email ?? null }
}

/** Throws AuthError('UNAUTHENTICATED') if there is no session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new AuthError('UNAUTHENTICATED')
  return user
}

/** Throws unless the session user's role is one of the given roles. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser()
  if (!roles.includes(user.role)) throw new AuthError('FORBIDDEN')
  return user
}
