import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/', '/register', '/api/auth', '/favicon.ico']

export async function middleware(req: Request) {
  const url = new URL(req.url)
  const { pathname } = url

  // Allow public (exact or prefix for auth routes)
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Not logged in: block protected
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const isOnboarded = token.isOnboarded
  const isOnboardingRoute = pathname.startsWith('/onboarding')

  // If not onboarded, force /onboarding (allow its APIs)
  if (!isOnboarded) {
    if (!isOnboardingRoute && !pathname.startsWith('/api/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  } else {
    // If onboarded and tries to access root or onboarding -> send to dashboard
    if (pathname === '/' || isOnboardingRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|assets|favicon.ico).*)'
  ]
}