import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isVictimRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/chat')
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/signup'

  // Redirects must carry over any Set-Cookie headers written by the Supabase
  // client (rotated refresh tokens, sign-out deletions) or sessions corrupt.
  const redirectTo = (path: string, search = '') => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = search
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  if ((isVictimRoute || isAdminRoute) && !user) {
    return redirectTo('/auth/login')
  }

  if (user && (isVictimRoute || isAdminRoute || isAuthPage)) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = userData?.role

    // No profile/role: sign out and send to login — never bounce between
    // /admin and /dashboard (that redirect-loops and locks the user out).
    if (!role && (isVictimRoute || isAdminRoute)) {
      await supabase.auth.signOut()
      return redirectTo('/auth/login', '?error=account-setup')
    }

    const isStaff = ['caseworker', 'admin', 'analyst'].includes(role ?? '')

    if (isAdminRoute && !isStaff) return redirectTo('/dashboard')
    if (isVictimRoute && isStaff) return redirectTo('/admin')

    // Signed-in (non-anonymous) users don't need the login/signup pages.
    if (isAuthPage && role && !user.is_anonymous) {
      return redirectTo(isStaff ? '/admin' : '/dashboard')
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
