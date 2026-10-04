import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  const sessionToken = request.cookies.get('kriti_session')?.value;

  // If user visits /login or /register while authenticated, optionally let them access or go to /dashboard
  // But strictly: if visiting protected dashboard areas without session, redirect to /login
  const protectedPrefixes = [
    '/dashboard',
    '/cbt',
    '/ncert',
    '/planner',
    '/dpp',
    '/pyq-vault',
    '/error-book',
    '/ai-tutor',
    '/analytics',
    '/settings',
    '/today',
    '/tests',
    '/drills',
    '/remediation',
    '/exam',
  ];

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If trying to access protected area without session cookie, redirect to /login
  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, stitch, ncert_figures, static assets
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|stitch|images|ncert_figures|extracted_figures|api).*)',
  ],
};
