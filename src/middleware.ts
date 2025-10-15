// src/middleware.ts

import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // The 'req' object is automatically typed, and we know token.role exists.
  async function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // --- INITIAL LOGIN REDIRECTION (NO DATABASE CALLS) ---
    // Redirects any user who lands on the root page.
    if (pathname === '/') {
      if (token.role === 'HR_MANAGER') {
        return NextResponse.redirect(new URL('/hr/applications', req.url));
      }
      if (token.role === 'INTERVIEWER') {
        return NextResponse.redirect(new URL('/interviewer/dashboard', req.url));
      }
      if (token.role === 'CANDIDATE') {
        // Always send a candidate to their main status page.
        // This page will then decide if a redirect to /apply is needed.
        return NextResponse.redirect(new URL('/candidate/status', req.url));
      }
    }

    // --- SIMPLE ROLE-BASED ROUTE PROTECTION ---
    const unauthorizedUrl = new URL('/unauthorized', req.url);

    // An INTERVIEWER needs to see candidate profiles, but not other HR pages.
    if (pathname.startsWith('/hr/applications/') && token.role === 'INTERVIEWER') {
      return NextResponse.next(); // Allow access to specific candidate profiles
    }

    if (pathname.startsWith('/hr') && token.role !== 'HR_MANAGER') {
      return NextResponse.redirect(unauthorizedUrl);
    }
    if (pathname.startsWith('/interviewer') && token.role !== 'INTERVIEWER') {
      return NextResponse.redirect(unauthorizedUrl);
    }
    if (pathname.startsWith('/candidate') && token.role !== 'CANDIDATE') {
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/auth/signin" },
  }
);

export const config = {
  matcher: [
    '/',
    '/hr/:path*',
    '/interviewer/:path*',
    '/candidate/:path*',
  ],
};