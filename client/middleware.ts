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

  // Get CSRF cookie early for later use
  const csrfCookie = req.cookies.get('csrf_token')?.value;

  // CSRF Protection for state-changing methods
  const isStateMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  const isApiRoute = url.pathname.startsWith('/api/');
  
  if (isStateMutating && isApiRoute) {
    const csrfToken = req.headers.get('x-csrf-token');
    
    // Skip CSRF check for auth routes (login, register)
    const isAuthApiRoute = url.pathname.startsWith('/api/auth/');
    
    if (!isAuthApiRoute && (!csrfToken || !csrfCookie || csrfToken !== csrfCookie)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  // Strip the port to get the pure hostname
  const currentHost = hostname.split(':')[0];
  
  // Check if we are on the app subdomain (local or production)
  const isApp = currentHost === 'app.localhost' || currentHost.startsWith('app.');

  // Auth routes (login, register, etc.) - these are public
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth-callback'];
  const isAuthRoute = authRoutes.some(route => url.pathname === route || url.pathname.startsWith(route));

  // Check if accessing app subdomain or /app routes
  const isAppRoute = isApp || url.pathname.startsWith('/app');
  
  // Protected routes: app subdomain or /app routes, excluding auth pages
  const isProtectedRoute = isAppRoute && !isAuthRoute;

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

  // Add security headers to response
  const response = NextResponse.next();
  
  // Generate CSRF token if not present
  if (!csrfCookie && !isAuthRoute) {
    const newCsrfToken = crypto.randomUUID();
    response.cookies.set('csrf_token', newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  return response;
}
