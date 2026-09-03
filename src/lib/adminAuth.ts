import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role; // 'ADMIN' | 'SUPER_ADMIN'
}

export const AUTH_ADMIN_COOKIE_NAME = "prayog_admin_session";
export const AUTH_STAFF_COOKIE_NAME = "prayog_staff_session";

/**
 * Server-side Helper: Extract & Verify Authenticated Admin Session
 * Supports legacy prayog_admin_session and new prayog_staff_session (SUPER_ADMIN)
 */
export async function getAuthenticatedAdmin(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();

  // 1. Check primary staff session cookie first
  const staffCookie = cookieStore.get(AUTH_STAFF_COOKIE_NAME);
  if (staffCookie?.value) {
    try {
      const staffUser = JSON.parse(staffCookie.value);
      if (staffUser && staffUser.role === "SUPER_ADMIN") {
        return {
          id: staffUser.id,
          name: staffUser.name,
          email: staffUser.email || `${staffUser.username}@prayogindia.com`,
          phone: staffUser.phone || "",
          role: "ADMIN" as Role,
        };
      }
    } catch {
      // Continue to check legacy cookie
    }
  }

  // 2. Check legacy admin session cookie
  const sessionCookie = cookieStore.get(AUTH_ADMIN_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  try {
    const user: AdminSessionUser = JSON.parse(sessionCookie.value);
    const roleStr = String(user?.role);
    if (!user || (roleStr !== "ADMIN" && roleStr !== "SUPER_ADMIN")) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
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
