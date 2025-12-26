import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import type { Database } from './lib/supabase.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthRoute = req.nextUrl.pathname.startsWith('/login')
  const isApi = req.nextUrl.pathname.startsWith('/api')

  if (!session && !isAuthRoute && !isApi) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Security headers (CSP + referrer policy)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; ')
  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api/sync).*)'],
}
