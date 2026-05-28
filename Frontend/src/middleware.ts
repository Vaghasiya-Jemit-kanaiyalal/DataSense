import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected route patterns — any path starting with these requires authentication.
 */
const PROTECTED_ROUTES = ['/upload', '/cleaning', '/preview'];

/**
 * Auth routes — authenticated users should be redirected away from these.
 */
const AUTH_ROUTES = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('datasense-token')?.value;

  // Check if the current path is a protected route
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check if the current path is an auth route
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Unauthenticated user trying to access a protected route → redirect to signin
  if (isProtected && !token) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Authenticated user trying to access auth pages → redirect to upload
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/upload', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/upload/:path*',
    '/cleaning/:path*',
    '/preview/:path*',
    '/signin',
    '/signup',
  ],
};
