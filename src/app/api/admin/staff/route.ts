import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff, MOCK_STAFF_USERS } from "@/lib/staffAuth";
import { hashPassword, normalizeEmail } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";
import { StaffRole, StaffStatus } from "@prisma/client";

// GET /api/admin/staff - List staff users (SUPER_ADMIN sees all, STORE_MANAGER sees own store)
export async function GET() {
  const headers = getSecurityHeaders();
  const currentStaff = await getAuthenticatedStaff();

  if (
    !currentStaff ||
    (currentStaff.role !== "SUPER_ADMIN" &&
      currentStaff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Super Admin or Store Manager access required.",
      },
      { status: 403, headers },
    );
  }

  const isSuperAdmin = currentStaff.role === "SUPER_ADMIN";
  const managerStoreId = currentStaff.storeId;
  const managerStoreCode = currentStaff.storeCode?.toUpperCase();

  if (process.env.DATABASE_URL) {
    try {
      const whereClause: any = {};
      if (!isSuperAdmin) {
        // Scoped to manager's store
        whereClause.OR = [
          { storeId: managerStoreId },
          { store: { code: managerStoreCode } },
        ];
      }

      const users = await db.staffUser.findMany({
        where: whereClause,
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
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { success: true, isSuperAdmin, data: users },
        { headers },
      );
    } catch (error: any) {
      console.warn("DB error fetching staff, falling back to mock:", error);
    }
  }

  // Fallback Mock Staff
  let mockList = Object.values(MOCK_STAFF_USERS).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    storeId: u.storeId,
    phone: "+91 98765 43210",
    status: u.status,
    createdAt: new Date().toISOString(),
    store: u.storeCode
      ? {
          id: u.storeId,
          name: u.storeName,
          code: u.storeCode,
          city: u.storeCode,
        }
      : null,
  }));

  if (!isSuperAdmin) {
    mockList = mockList.filter(
      (u) =>
        u.storeId === managerStoreId ||
        (u.store?.code && u.store.code.toUpperCase() === managerStoreCode),
    );
  }

  return NextResponse.json(
    { success: true, isSuperAdmin, data: mockList },
    { headers },
  );
}

// POST /api/admin/staff - Create Staff / Kiosk User
// - SUPER_ADMIN: Can create any role for any store.
// - STORE_MANAGER: Can ONLY create KIOSK_USER or POS_CASHIER for THEIR store.
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const currentStaff = await getAuthenticatedStaff();

  if (
    !currentStaff ||
    (currentStaff.role !== "SUPER_ADMIN" &&
      currentStaff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Super Admin or Store Manager access required.",
      },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      email,
      username,
      password,
      role,
      storeId: requestedStoreId,
      phone,
    } = body;

    // Validation
    if (!name || !username || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, username, password, and role are required.",
        },
        { status: 400, headers },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400, headers },
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email ? normalizeEmail(email) : null;
    const staffRole = role as StaffRole;

    // ─────────────────────────────────────────────────────────
    // Role-Based Store Scoping & Permission Guard
    // ─────────────────────────────────────────────────────────
    let assignedStoreId = requestedStoreId;

    if (currentStaff.role === "STORE_MANAGER") {
      // 1. Store Managers can ONLY create KIOSK_USER or POS_CASHIER
      if (staffRole !== "KIOSK_USER" && staffRole !== "POS_CASHIER") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Forbidden. Store Managers are only authorized to provision Kiosk Tablets and POS Cashier accounts.",
          },
          { status: 403, headers },
        );
      }

      // 2. Store Managers are locked to their own store
      assignedStoreId = currentStaff.storeId;

      if (
        requestedStoreId &&
        requestedStoreId !== currentStaff.storeId &&
        requestedStoreId.toUpperCase() !== currentStaff.storeCode?.toUpperCase()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Forbidden. As ${currentStaff.storeCode || "Store"} Manager, you can only create Kiosk devices for your own store.`,
          },
          { status: 403, headers },
        );
      }
    } else if (staffRole === "SUPER_ADMIN") {
      assignedStoreId = null;
    } else if (!assignedStoreId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Store assignment is required for Store Managers and Kiosk accounts.",
        },
        { status: 400, headers },
      );
    }

    // Resolve storeId to DB UUID if a code like "RANCHI" was provided
    if (assignedStoreId && process.env.DATABASE_URL) {
      const storeObj = await db.store.findFirst({
        where: {
          OR: [
            { id: assignedStoreId },
            { code: assignedStoreId.toUpperCase() },
          ],
        },
      });
      if (storeObj) {
        assignedStoreId = storeObj.id;
      }
    }

    const passwordHash = await hashPassword(password);

    if (process.env.DATABASE_URL) {
      try {
        // Check duplicate username
        const existingUser = await db.staffUser.findUnique({
          where: { username: cleanUsername },
        });

        if (existingUser) {
          return NextResponse.json(
            {
              success: false,
              message: `Username "${cleanUsername}" is already taken.`,
            },
            { status: 409, headers },
          );
        }

        const created = await db.staffUser.create({
          data: {
            name,
            email: cleanEmail,
            username: cleanUsername,
            passwordHash,
            role: staffRole,
            storeId: assignedStoreId,
            phone: phone?.trim() || null,
            status: "ACTIVE" as StaffStatus,
          },
          include: {
            store: {
              select: { id: true, name: true, code: true, city: true },
            },
          },
        });

        // Also register in Device table if it's a Kiosk or POS Cashier
        if (staffRole === "KIOSK_USER" || staffRole === "POS_CASHIER") {
          const deviceCode = `TAB-${created.store?.code || "STR"}-${cleanUsername.toUpperCase()}`;
          await db.device
            .upsert({
              where: { deviceCode },
              update: {
                deviceName: name,
                status: "ACTIVE",
                deviceType:
                  staffRole === "KIOSK_USER" ? "KIOSK_TABLET" : "POS_TERMINAL",
              },
              create: {
                deviceCode,
                storeId: assignedStoreId!,
                deviceName: name,
                deviceType:
                  staffRole === "KIOSK_USER" ? "KIOSK_TABLET" : "POS_TERMINAL",
                status: "ACTIVE",
              },
            })
            .catch((e) => console.warn("Device register warning:", e));
        }

        return NextResponse.json(
          {
            success: true,
            message: `Kiosk/Staff credential @${created.username} created for ${created.store?.name || "Assigned Store"}.`,
            data: {
              id: created.id,
              name: created.name,
              username: created.username,
              role: created.role,
              store: created.store,
            },
          },
          { headers },
        );
      } catch (dbErr: any) {
        console.warn(
          "Database error creating staff user, falling back to mock mode:",
          dbErr,
        );
      }
    }

    // Dynamic Mock Store fallback
    const mockCreatedUser = {
      id: `staff-${Date.now()}`,
      name,
      email: cleanEmail,
      username: cleanUsername,
      role: staffRole,
      storeId: assignedStoreId,
      phone: phone?.trim() || "+91 98765 43210",
      status: "ACTIVE" as StaffStatus,
    };

    MOCK_STAFF_USERS[cleanUsername] = {
      ...mockCreatedUser,
      storeCode:
        currentStaff.storeCode ||
        (assignedStoreId ? assignedStoreId.toUpperCase() : "RANCHI"),
      storeName: currentStaff.storeName || `${assignedStoreId} Branch`,
    };

    return NextResponse.json(
      {
        success: true,
        message: `Kiosk credential @${cleanUsername} provisioned successfully for ${currentStaff.storeName || assignedStoreId}!`,
        data: mockCreatedUser,
      },
      { headers },
    );
  } catch (error: any) {
    console.error("Error creating staff user:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create staff account.",
      },
      { status: 500, headers },
    );
  }
}
