import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect /auth to /login for cleaner URLs
  if (request.nextUrl.pathname === '/auth') {
    const loginUrl = new URL('/login', request.url)
    // Preserve query parameters (like ?ref=code or ?redirect=/dashboard)
    request.nextUrl.searchParams.forEach((value, key) => {
      loginUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from login page to dashboard
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Public routes that don't require authentication
  const pathname = request.nextUrl.pathname
  const publicRoutes = [
    '/',                          // Landing page
    '/login',                     // Login page
    '/auth/callback',             // OAuth callback (Google, etc.)
    '/s/',                        // Public story viewer
    '/plans/',                    // Public plan library
    '/quiz/',                     // Quiz pages
    '/join/',                     // Invite link pages
    '/library/',                  // Public library browser
    '/api/cron/',                 // Vercel cron jobs
  ]

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route) || pathname === route)

  // Redirect unauthenticated users from protected routes to login
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
