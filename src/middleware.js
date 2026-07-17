import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except the login page
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('adminToken');
    
    if (!adminToken) {
      // If no token exists, redirect immediately to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on /admin routes to save performance
export const config = {
  matcher: ['/admin/:path*'],
};
