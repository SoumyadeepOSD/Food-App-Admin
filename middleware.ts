import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthPath = path === "/auth";
  const isDashboardPath = path === "/dashboard";
  
  // Get the token from cookies
  const token = request.cookies.get("token")?.value;

  // If user has token and is trying to access /auth, redirect to /dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is trying to access /dashboard without a token, redirect to /auth
  if (isDashboardPath && (!token || token === "")) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Allow the request to proceed if it's a public path or token is valid
  return NextResponse.next();
}

// Define the paths the middleware should apply to
export const config = {
  matcher: [
    '/auth',          // Public auth path
    '/dashboard',     // Protected dashboard path
    '/',              // Index or other protected paths if needed
  ],
};
