import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const token = req.cookies.get('auth_token')?.value ||
                req.headers.get('authorization')?.replace('Bearer ', '');

  // Strip the port to get the pure hostname
  const currentHost = hostname.split(':')[0];
  
  // Check if we are on the app subdomain (local or production)
  const isApp = currentHost === 'app.localhost' || currentHost.startsWith('app.');

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
  const isPublicRoute = publicRoutes.some(route => url.pathname === route || url.pathname.startsWith(route));

  // Auth routes (login, register, etc.)
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth-callback'];
  const isAuthRoute = authRoutes.some(route => url.pathname === route || url.pathname.startsWith(route));

  // Protected routes (everything under /app except auth pages)
  const isProtectedRoute = url.pathname.startsWith('/app') && !isAuthRoute;

  // Check authentication for protected routes
  if (isProtectedRoute && !token) {
    // Redirect to login if trying to access protected route without token
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/app', req.url));
  }

  // Rewrite non-auth requests on the app subdomain to the /app folder
  if (isApp && !url.pathname.startsWith('/app') && !isAuthRoute) {
    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
