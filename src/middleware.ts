import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { nextUrl, token } = req
    const isLoggedIn = !!token

    const isApiRoute = nextUrl.pathname.startsWith('/api')
    const isAuthRoute = nextUrl.pathname.startsWith('/auth')
    const isPublicRoute = isAuthRoute || nextUrl.pathname === '/'

    if (isApiRoute) {
      return NextResponse.next()
    }

    if (isAuthRoute && isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }

    if (!isPublicRoute && !isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin', nextUrl))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}