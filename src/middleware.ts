import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Check for the auth cookie
    const authCookie = request.cookies.get('auth_session');

    // 2. Define protected paths (basically everything except login and static assets)
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isStaticAsset = request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.startsWith('/api') || // Allow API for seeding/internal use if needed
        request.nextUrl.pathname.includes('.'); // Files like favicon.ico

    // 3. Redirect logic

    // If user has NO cookie and is trying to access a protected page -> Redirect to Login
    if (!authCookie && !isLoginPage && !isStaticAsset) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user HAS cookie and is on Login page -> Redirect to Dashboard
    if (authCookie && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
