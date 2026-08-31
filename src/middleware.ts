import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read staff session cookie
  const staffCookie = request.cookies.get('prayog_staff_session');
  const adminCookie = request.cookies.get('prayog_admin_session');

  // Helper to parse staff user
  let staffUser: any = null;
  if (staffCookie?.value) {
    try {
      staffUser = JSON.parse(staffCookie.value);
    } catch {
      staffUser = null;
    }
  }

  // 1. Guard /store/* routes (Only STORE_MANAGER & SUPER_ADMIN)
  if (pathname.startsWith('/store')) {
    if (!staffUser || (staffUser.role !== 'STORE_MANAGER' && staffUser.role !== 'SUPER_ADMIN')) {
      const loginUrl = new URL('/login-staff', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Guard /kiosk/* routes (Only KIOSK_USER, STORE_MANAGER, SUPER_ADMIN)
  if (pathname.startsWith('/kiosk')) {
    if (!staffUser || !['KIOSK_USER', 'STORE_MANAGER', 'SUPER_ADMIN'].includes(staffUser.role)) {
      const loginUrl = new URL('/login-staff', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Guard /admin/* routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const isSuperAdmin = staffUser?.role === 'SUPER_ADMIN';
    const hasLegacyAdmin = Boolean(adminCookie?.value);

    if (!isSuperAdmin && !hasLegacyAdmin) {
      const loginUrl = new URL('/login-staff', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/store/:path*', '/kiosk/:path*'],
};
