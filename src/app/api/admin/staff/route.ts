import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedStaff, hasRequiredRole, MOCK_STAFF_USERS } from '@/lib/staffAuth';
import { hashPassword, normalizeEmail } from '@/lib/authUtils';
import { getSecurityHeaders } from '@/lib/security';
import { StaffRole, StaffStatus } from '@prisma/client';

// GET /api/admin/staff - List all staff users (SUPER_ADMIN only)
export async function GET() {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || !hasRequiredRole(staff, 'SUPER_ADMIN')) {
    return NextResponse.json(
      { success: false, message: 'Forbidden. Super Admin access required.' },
      { status: 403, headers }
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const users = await db.staffUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          storeId: true,
          phone: true,
          status: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: users }, { headers });
    } catch (error: any) {
      console.warn('DB error fetching staff, falling back to mock:', error);
    }
  }

  // Fallback Mock Staff
  const mockList = Object.values(MOCK_STAFF_USERS).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    storeId: u.storeId,
    phone: '+91 98765 43210',
    status: u.status,
    createdAt: new Date().toISOString(),
    store: u.storeCode ? { id: u.storeId, name: u.storeName, code: u.storeCode, city: u.storeCode } : null,
  }));

  return NextResponse.json({ success: true, data: mockList }, { headers });
}

// POST /api/admin/staff - Create a new Store Manager or Kiosk User (SUPER_ADMIN only)
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const currentStaff = await getAuthenticatedStaff();

  if (!currentStaff || !hasRequiredRole(currentStaff, 'SUPER_ADMIN')) {
    return NextResponse.json(
      { success: false, message: 'Forbidden. Only Super Admin can create staff accounts.' },
      { status: 403, headers }
    );
  }

  try {
    const body = await request.json();
    const { name, email, username, password, role, storeId, phone } = body;

    // Validation
    if (!name || !username || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Name, username, password, and role are required.' },
        { status: 400, headers }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400, headers }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email ? normalizeEmail(email) : null;
    const staffRole = role as StaffRole;

    // Store assignment rule:
    // STORE_MANAGER and KIOSK_USER must have an assigned store
    if ((staffRole === 'STORE_MANAGER' || staffRole === 'KIOSK_USER') && !storeId) {
      return NextResponse.json(
        { success: false, message: 'Store Managers and Kiosk accounts must be assigned to a specific store.' },
        { status: 400, headers }
      );
    }

    const passwordHash = await hashPassword(password);

    if (process.env.DATABASE_URL) {
      // Check duplicate username
      const existingUser = await db.staffUser.findUnique({
        where: { username: cleanUsername },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: `Username "${cleanUsername}" is already taken.` },
          { status: 409, headers }
        );
      }

      const created = await db.staffUser.create({
        data: {
          name,
          email: cleanEmail,
          username: cleanUsername,
          passwordHash,
          role: staffRole,
          storeId: staffRole === 'SUPER_ADMIN' ? null : storeId,
          phone: phone?.trim() || null,
          status: 'ACTIVE' as StaffStatus,
        },
        include: {
          store: {
            select: { id: true, name: true, code: true, city: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Account created for ${name} (${staffRole}).`,
        data: {
          id: created.id,
          name: created.name,
          username: created.username,
          role: created.role,
          store: created.store,
        },
      }, { headers });
    }

    // Mock response
    return NextResponse.json({
      success: true,
      message: `Staff account @${cleanUsername} created (Dev Mock).`,
      data: {
        id: `staff-${Date.now()}`,
        name,
        username: cleanUsername,
        role: staffRole,
        storeId,
      },
    }, { headers });

  } catch (error: any) {
    console.error('Error creating staff user:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create staff account.' },
      { status: 500, headers }
    );
  }
}
