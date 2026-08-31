import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role; // 'ADMIN' | 'SUPER_ADMIN'
}

export const AUTH_ADMIN_COOKIE_NAME = 'prayog_admin_session';

/**
 * Server-side Helper: Extract & Verify Authenticated Admin Session
 * Returns AdminSessionUser if valid ADMIN or SUPER_ADMIN; null otherwise.
 */
export async function getAuthenticatedAdmin(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value) return null;

  try {
    const user: AdminSessionUser = JSON.parse(sessionCookie.value);
    const roleStr = String(user?.role);
    if (!user || (roleStr !== 'ADMIN' && roleStr !== 'SUPER_ADMIN')) {
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
