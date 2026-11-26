import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isSitePublic } from '@/lib/site';

function continueWithPath(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers);
  headers.set('x-pathname', request.nextUrl.pathname);
  return withRobots(NextResponse.next({ request: { headers } }), request.nextUrl.pathname);
}

function withRobots(response: NextResponse, pathname: string): NextResponse {
  const privateArea =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/employer') ||
    pathname.startsWith('/application-status') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/invites') ||
    pathname.startsWith('/interviews') ||
    pathname.startsWith('/api');
  if (!isSitePublic() || privateArea) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const login = request.nextUrl.clone();
      login.pathname = '/admin/login';
      login.search = '';
      return withRobots(NextResponse.redirect(login), pathname);
    }
  }

  return continueWithPath(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
