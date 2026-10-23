import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";
import { StaffSessionUser } from "@/lib/staffAuth";
import { AdminSessionUser } from "@/lib/adminAuth";
import { AuthSessionUser, AUTH_COOKIE_NAME } from "@/lib/authUtils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookies
  const customerCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const staffCookie = request.cookies.get("prayog_staff_session");
  const adminCookie = request.cookies.get("prayog_admin_session");

  // Cryptographically verify customer session token
  let customerUser: AuthSessionUser | null = null;
  if (customerCookie?.value) {
    customerUser = await verifySessionToken<AuthSessionUser>(customerCookie.value);
  }

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

  // Helper to create redirect response with no-cache headers
  const redirectWithNoCache = (destination: string) => {
    const url = new URL(destination, request.url);
    url.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(url);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  };

  // 1. Guard /account and /account/* routes (Customer authentication required)
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    if (!customerUser) {
      return redirectWithNoCache("/login");
    }
  }

  // 2. Guard /store/* and /storemanager/* routes (Only STORE_MANAGER & SUPER_ADMIN)
  if (pathname.startsWith("/store") || pathname.startsWith("/storemanager")) {
    if (
      !staffUser ||
      (staffUser.role !== "STORE_MANAGER" && staffUser.role !== "SUPER_ADMIN")
    ) {
      return redirectWithNoCache("/login-staff");
    }
  }

  // 3. Guard /kiosk/* routes (Only KIOSK_USER, STORE_MANAGER, SUPER_ADMIN)
  if (pathname.startsWith("/kiosk")) {
    if (
      !staffUser ||
      !["KIOSK_USER", "STORE_MANAGER", "SUPER_ADMIN"].includes(staffUser.role)
    ) {
      return redirectWithNoCache("/login-staff");
    }
  }

  // 4. Guard /admin/* routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isSuperAdmin = staffUser?.role === "SUPER_ADMIN";
    const isAdmin = adminUser?.role === "ADMIN";

    if (!isSuperAdmin && !isAdmin) {
      return redirectWithNoCache("/login-staff");
    }
  }

  const response = NextResponse.next();

  // Attach anti-caching headers on all protected areas so browser back button after logout cannot render stale data
  if (
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/store") ||
    pathname.startsWith("/storemanager") ||
    pathname.startsWith("/kiosk")
  ) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/admin/:path*",
    "/store/:path*",
    "/storemanager/:path*",
    "/kiosk/:path*",
  ],
};
