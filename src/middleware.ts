import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";
import { StaffSessionUser } from "@/lib/staffAuth";
import { AdminSessionUser } from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookies
  const staffCookie = request.cookies.get("prayog_staff_session");
  const adminCookie = request.cookies.get("prayog_admin_session");

  // Cryptographically verify staff user token
  let staffUser: StaffSessionUser | null = null;
  if (staffCookie?.value) {
    staffUser = await verifySessionToken<StaffSessionUser>(staffCookie.value);
  }

  // Cryptographically verify admin user token
  let adminUser: AdminSessionUser | null = null;
  if (adminCookie?.value) {
    adminUser = await verifySessionToken<AdminSessionUser>(adminCookie.value);
  }

  // 1. Guard /store/* routes (Only STORE_MANAGER & SUPER_ADMIN)
  if (pathname.startsWith("/store")) {
    if (
      !staffUser ||
      (staffUser.role !== "STORE_MANAGER" && staffUser.role !== "SUPER_ADMIN")
    ) {
      const loginUrl = new URL("/login-staff", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Guard /kiosk/* routes (Only KIOSK_USER, STORE_MANAGER, SUPER_ADMIN)
  if (pathname.startsWith("/kiosk")) {
    if (
      !staffUser ||
      !["KIOSK_USER", "STORE_MANAGER", "SUPER_ADMIN"].includes(staffUser.role)
    ) {
      const loginUrl = new URL("/login-staff", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Guard /admin/* routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isSuperAdmin = staffUser?.role === "SUPER_ADMIN";
    const isAdmin = adminUser?.role === "ADMIN";

    if (!isSuperAdmin && !isAdmin) {
      const loginUrl = new URL("/login-staff", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/store/:path*", "/kiosk/:path*"],
};
