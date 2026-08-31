import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER';
}

/**
 * Utility: Normalize email address to lowercase and strip leading/trailing spaces
 * Prevents duplicate accounts caused by casing differences (User@Domain.com vs user@domain.com)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Utility: Securely Hash Plaintext Password using bcryptjs with salt round 10
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Utility: Verify Plaintext Password against stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Cookie-based Session Cookie Name
 */
export const AUTH_COOKIE_NAME = 'prayog_customer_session';

/**
 * Helper to build safe user payload excluding password hashes
 */
export function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}): AuthSessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: 'CUSTOMER',
  };
}
