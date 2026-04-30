import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge middleware: blocks unauthenticated access to / and /api/submit.
 *
 * Note: the actual token verification (which uses Node crypto) happens
 * inside the protected routes. The middleware just checks for the
 * cookie's presence and redirects/rejects early when it's absent.
 */

const AUTH_COOKIE_NAME = 'ph_auth';

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  const isApi = req.nextUrl.pathname.startsWith('/api/submit');

  if (!cookie?.value) {
    if (isApi) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/submit'],
};
