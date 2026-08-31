import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeEmail, verifyPassword } from '@/lib/authUtils';
import { 
  AUTH_STAFF_COOKIE_NAME, 
  MOCK_STAFF_USERS, 
  sanitizeStaffUser,
  StaffSessionUser 
} from '@/lib/staffAuth';
import { checkRateLimit, getSecurityHeaders } from '@/lib/security';
import { StaffRole } from '@prisma/client';

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Rate Limiting (5 attempts / minute per IP)
  const rateLimit = checkRateLimit(`staff_login:${clientIp}`, 5, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        success: false, 
        message: `Too many login attempts. Please try again in ${rateLimit.resetInSeconds} seconds.` 
      },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please enter your username/email and password.' },
        { status: 400, headers }
      );
    }

    const cleanIdentifier = username.trim().toLowerCase();
    let staffUserRecord: any = null;

    // 2. Database Lookup if DB is configured (and not pointing to local dev machine)
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
      try {
        staffUserRecord = await db.staffUser.findFirst({
          where: {
            OR: [
              { username: cleanIdentifier },
              { email: cleanIdentifier },
            ],
          },
          include: {
            store: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        });
      } catch (dbErr) {
        console.warn('Prisma staff lookup warning, falling back to mock:', dbErr);
      }
    }

    // 3. Mock Fallback for local development or demo credentials
    if (!staffUserRecord) {
      // Check mock presets
      const mockKey = Object.keys(MOCK_STAFF_USERS).find(
        k => k === cleanIdentifier || MOCK_STAFF_USERS[k].email?.toLowerCase() === cleanIdentifier
      );

      if (mockKey) {
        const mockUser = MOCK_STAFF_USERS[mockKey];
        // Allow valid demo passwords
        const validPasswords: Record<string, string> = {
          superadmin: 'admin123',
          ranchi_manager: 'manager123',
          patna_manager: 'manager123',
          ranchi_kiosk: 'kiosk123',
          patna_kiosk: 'kiosk123',
        };

        if (password === validPasswords[mockKey] || password === 'admin123' || password === 'manager123' || password === 'kiosk123') {
          staffUserRecord = {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            username: mockUser.username,
            role: mockUser.role,
            storeId: mockUser.storeId,
            status: mockUser.status,
            store: mockUser.storeCode ? { id: mockUser.storeId, code: mockUser.storeCode, name: mockUser.storeName } : null,
          };
        }
      }
    } else {
      // 4. Verify DB Password Hash
      const isMatch = await verifyPassword(password, staffUserRecord.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials. Please verify username/password.' },
          { status: 401, headers }
        );
      }
    }

    if (!staffUserRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or account does not exist.' },
        { status: 401, headers }
      );
    }

    // 5. Verify Account Status
    if (staffUserRecord.status && staffUserRecord.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'This staff account is currently suspended. Please contact Super Admin.' },
        { status: 403, headers }
      );
    }

    // 6. Build Safe Session Payload
    const sessionPayload: StaffSessionUser = sanitizeStaffUser(staffUserRecord);

    // Determine redirect destination based on role
    let redirectTo = '/admin';
    if (sessionPayload.role === 'STORE_MANAGER') {
      redirectTo = '/store';
    } else if (sessionPayload.role === 'KIOSK_USER') {
      redirectTo = '/kiosk';
    }

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${sessionPayload.name}!`,
      user: sessionPayload,
      redirectTo,
    });

    // Session duration based on role:
    // SUPER_ADMIN: 12h, STORE_MANAGER: 10h, KIOSK_USER: 24h
    const maxAgeSeconds = 
      sessionPayload.role === 'KIOSK_USER' ? 60 * 60 * 24 :
      sessionPayload.role === 'STORE_MANAGER' ? 60 * 60 * 10 :
      60 * 60 * 12;

    response.cookies.set({
      name: AUTH_STAFF_COOKIE_NAME,
      value: JSON.stringify(sessionPayload),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return response;

  } catch (error: any) {
    console.error('Staff login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication server error. Please try again.' },
      { status: 500, headers }
    );
  }
}
