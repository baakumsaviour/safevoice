import { type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/report', '/analytics', '/auth/login']

  // Check if route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return
  }

  // Protected routes - check for session
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('sb-token')?.value

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      return Response.redirect(loginUrl)
    }

    // Verify token is valid by checking with Supabase
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        const loginUrl = new URL('/auth/login', request.url)
        return Response.redirect(loginUrl)
      }
    } catch (error) {
      console.error('[v0] Middleware auth error:', error)
      const loginUrl = new URL('/auth/login', request.url)
      return Response.redirect(loginUrl)
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
