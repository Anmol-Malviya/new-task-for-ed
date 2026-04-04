import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/constants';

// Pages a user must be logged in to visit
const PROTECTED_ROUTES: string[] = [
  '/dashboard',
  '/bookings',
  '/profile',
];

// Pages a logged-in user should not see (login, register)
const GUEST_ONLY_ROUTES: string[] = [
  '/auth/Login',
  '/auth/Register',
  '/auth/VendorRegister',
];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // proxy.ts runs on the server — no localStorage access here
  // That is why we store the token in BOTH localStorage (for api.ts)
  // AND a cookie (for proxy.ts)
  const token: string | undefined =
    request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isGuestOnly = GUEST_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Not logged in + trying to access protected page
  if (isProtected && !token) {
    const loginUrl = new URL('/auth/Login', request.url);
    // Store where they were trying to go so we can redirect
    // back after successful login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in + trying to access login/register
  if (isGuestOnly && token) {
    return NextResponse.redirect(
      new URL('/profile', request.url)
    );
  }

  // All good — let the request through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run proxy on all routes EXCEPT Next.js internals and public files
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
