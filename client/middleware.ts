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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Strip the port to get the pure hostname
  const currentHost = hostname.split(':')[0];
  
  // Check if we are on the app subdomain (local or production)
  const isApp = currentHost === 'app.localhost' || currentHost.startsWith('app.');

  // Exclude rewrites for paths that already start with /app to prevent infinite loops
  if (isApp && !url.pathname.startsWith('/app')) {
    // Rewrite requests to the `app.domain.com` to the `/app` folder
    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
