import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role; // 'ADMIN' | 'SUPER_ADMIN'
}

import { AUTH_STAFF_COOKIE_NAME, StaffSessionUser } from "@/lib/staffAuth";
import { verifySessionToken } from "@/lib/jwt";

export const AUTH_ADMIN_COOKIE_NAME = "prayog_admin_session";
export { AUTH_STAFF_COOKIE_NAME };

/**
 * Server-side Helper: Extract & Verify Authenticated Admin Session
 * Cryptographically verifies JWT session tokens
 */
export async function getAuthenticatedAdmin(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();

  // 1. Check primary staff session cookie first
  const staffCookie = cookieStore.get(AUTH_STAFF_COOKIE_NAME);
  if (staffCookie?.value) {
    const staffUser = await verifySessionToken<StaffSessionUser>(
      staffCookie.value,
    );
    if (staffUser && staffUser.role === "SUPER_ADMIN") {
      return {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email || `${staffUser.username}@prayogindia.com`,
        phone: "",
        role: "ADMIN" as Role,
      };
    }
  }

  // 2. Check admin session cookie
  const sessionCookie = cookieStore.get(AUTH_ADMIN_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const user = await verifySessionToken<AdminSessionUser>(sessionCookie.value);
  if (!user) return null;

  const roleStr = String(user?.role);
  if (roleStr !== "ADMIN" && roleStr !== "SUPER_ADMIN") {
    return null;
  }
  return user;
}

/**
 * Sanitize admin user payload (excludes password hashes)
 */
export function sanitizeAdminUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
}): AdminSessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}
