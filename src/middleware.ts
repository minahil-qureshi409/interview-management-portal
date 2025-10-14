// src/middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
     const { pathname } = req.nextUrl;
    
    // --- NEW: ROLE-BASED REDIRECTION LOGIC ---
    // This runs for any logged-in user trying to access the root or a generic dashboard.
    if (token && (pathname === '/' || pathname === '/dashboard')) {
      if (token.role === 'HR_MANAGER') {
        return NextResponse.redirect(new URL('/hr/dashboard', req.url));
      }
      if (token.role === 'INTERVIEWER') {
        return NextResponse.redirect(new URL('/interviewer/dashboard', req.url));
      }
      if (token.role === 'CANDIDATE') {
        return NextResponse.redirect(new URL('/candidates', req.url));
      }
    }
    // --- END OF NEW LOGIC ---

    // --- Your existing role protection logic ---
    // const unauthorizedUrl = new URL('/unauthorized', req.url);

    // --- HR MANAGER Routes ---
    // If the user is trying to access HR routes but is not an HR_MANAGER
    if (req.nextUrl.pathname.startsWith("/hr") && token?.role !== "HR_MANAGER") {
      return new NextResponse("You are not authorized!"); // Or redirect
    }

    // --- INTERVIEWER Routes ---
    if (req.nextUrl.pathname.startsWith("/interviewer") && token?.role !== "INTERVIEWER") {
      return new NextResponse("You are not authorized!");
    }

    // --- CANDIDATE Routes ---
    if (req.nextUrl.pathname.startsWith("/candidate") && token?.role !== "CANDIDATE") {
      return new NextResponse("You are not authorized!");
    }

    // Allow the request to proceed if no rules match
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // User must be logged in to access any page matched by the matcher
    },
  }
);

// This matcher ensures the middleware runs on your protected routes
export const config = {
  matcher: [ '/', '/dashboard',"/hr/:path*", "/interviewer/:path*", "/candidate/:path*"],
};