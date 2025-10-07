
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SessionPayload } from './lib/auth';
 
export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Define route types
  const isPublicPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/login');
  const isTenantPage = pathname.startsWith('/tenant-dashboard');
  const isEmployeePage = pathname.startsWith('/dashboard');

  let session: SessionPayload | null = null;
  if (cookie?.value) {
    try {
      session = JSON.parse(cookie.value);
      if (session && 'expires' in session && new Date((session as any).expires) < new Date()) {
        session = null; // Session expired
      }
    } catch {
      session = null; // Invalid session cookie
    }
  }

  // --- Handle invalid/expired cookies ---
  if (!session && cookie) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session', '', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(0)
    });
    return response;
  }
  
  // --- Handle Auth Page Access ---
  if (isAuthPage) {
    // If a logged-in user tries to access login, redirect them away.
    if (session) {
      const url = session.role === 'employee' ? '/dashboard' : '/tenant-dashboard';
      return NextResponse.redirect(new URL(url, request.url));
    }
    // Otherwise, allow access for non-logged-in users.
    return NextResponse.next();
  }

  // --- Handle Public Page Access ---
  if (isPublicPage) {
    return NextResponse.next();
  }

  // --- Handle Protected Route Access ---
  // If trying to access a protected route without a session, redirect to login.
  if (!session && (isEmployeePage || isTenantPage)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If a session exists, verify role access for protected routes.
  if (session) {
    if (isEmployeePage && session.role !== 'employee') {
      return NextResponse.redirect(new URL('/tenant-dashboard', request.url));
    }
    if (isTenantPage && session.role !== 'tenant') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
 
  // If no other rules matched, allow the request to proceed.
  return NextResponse.next();
}
 
// Run the middleware on all routes except for static assets.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads/).*)'],
}
