import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import { INITIAL_STORES } from "@/data/storesData";
import { hashPassword } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";
import { StaffStatus } from "@prisma/client";

// GET /api/store/devices - Store-scoped Kiosk & Tablet Devices
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "STORE_MANAGER" && staff.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Store Manager or Admin access required.",
      },
      { status: 403, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const targetStore =
    searchParams.get("storeId") || staff.storeCode || staff.storeId;

  if (staff.role === "STORE_MANAGER" && !hasStoreAccess(staff, targetStore)) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Cannot view devices belonging to other stores.",
      },
      { status: 403, headers },
    );
  }

  const activeStoreCode =
    (staff.role === "STORE_MANAGER"
      ? staff.storeCode
      : targetStore
    )?.toUpperCase() || "RANCHI";

  if (process.env.DATABASE_URL) {
    try {
      const storeObj = await db.store.findFirst({
        where: { code: activeStoreCode },
        include: {
          devices: true,
          staff: {
            where: { role: { in: ["KIOSK_USER", "POS_CASHIER"] } },
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (storeObj) {
        // Map staff kiosks to device view format
        const combinedDevices = [
          ...storeObj.devices.map((d) => ({
            id: d.id,
            deviceName: d.deviceName,
            deviceModel: `${d.deviceType.replace("_", " ")} (${d.deviceCode})`,
            deviceCode: d.deviceCode,
            status: d.status,
            assignedStaff: d.deviceName,
            lastActiveAt: d.lastLogin
              ? new Date(d.lastLogin).toLocaleTimeString()
              : "Active",
          })),
          ...storeObj.staff.map((s) => ({
            id: s.id,
            deviceName: s.name,
            deviceModel: `${s.role === "KIOSK_USER" ? "Store Tablet Kiosk" : "POS Cashier"} (@${s.username})`,
            deviceCode: `TAB-${activeStoreCode}-${s.username.toUpperCase()}`,
            status: s.status,
            assignedStaff: `@${s.username}`,
            lastActiveAt: "Active",
          })),
        ];

        // Deduplicate by name/code
        const unique = Array.from(
          new Map(
            combinedDevices.map((item) => [
              item.deviceCode || item.deviceName,
              item,
            ]),
          ).values(),
        );

        return NextResponse.json(
          {
            success: true,
            store: activeStoreCode,
            data: unique,
          },
          { headers },
        );
      }
    } catch (e) {
      console.warn("DB error fetching store devices, falling back to mock:", e);
    }
  }

  const branch = INITIAL_STORES.find((s) => s.code === activeStoreCode);
  const devices = branch ? branch.authorizedDevices : [];

  return NextResponse.json(
    {
      success: true,
      store: activeStoreCode,
      data: devices,
    },
    { headers },
  );
}

// POST /api/store/devices - Register New Store Kiosk / Tablet
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "STORE_MANAGER" && staff.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Store Manager or Admin access required.",
      },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      deviceName,
      username,
      password,
      deviceType = "KIOSK_TABLET",
    } = body;

    if (!deviceName || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Device name, username, and password are required.",
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

    // Force strict store scoping to current manager's store
    const storeCode = staff.storeCode || "RANCHI";
    let storeId = staff.storeId;

    if (process.env.DATABASE_URL) {
      const storeObj = await db.store.findFirst({
        where: {
          OR: [{ id: storeId || "unknown" }, { code: storeCode.toUpperCase() }],
        },
      });

      if (!storeObj) {
        return NextResponse.json(
          { success: false, message: "Assigned store location not found." },
          { status: 404, headers },
        );
      }

      storeId = storeObj.id;

      const cleanUsername = username.trim().toLowerCase();
      const existing = await db.staffUser.findUnique({
        where: { username: cleanUsername },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: `Username "@${cleanUsername}" already exists.`,
          },
          { status: 409, headers },
        );
      }

      const passwordHash = await hashPassword(password);
      const staffRole =
        deviceType === "POS_TERMINAL" ? "POS_CASHIER" : "KIOSK_USER";

      // 1. Create Staff User Record
      const user = await db.staffUser.create({
        data: {
          name: deviceName,
          username: cleanUsername,
          passwordHash,
          role: staffRole,
          storeId,
          status: "ACTIVE" as StaffStatus,
        },
      });

      // 2. Register Device Record
      const deviceCode = `TAB-${storeObj.code}-${cleanUsername.toUpperCase()}`;
      await db.device
        .create({
          data: {
            deviceCode,
            storeId,
            deviceName,
            deviceType:
              staffRole === "KIOSK_USER" ? "KIOSK_TABLET" : "POS_TERMINAL",
            status: "ACTIVE",
          },
        })
        .catch((e) => console.warn("Device create warning:", e));

      return NextResponse.json(
        {
          success: true,
          message: `Kiosk device "${deviceName}" created for ${storeObj.name} with login @${cleanUsername}!`,
          data: {
            id: user.id,
            deviceName,
            username: user.username,
            deviceCode,
            store: storeObj.name,
          },
        },
        { headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Kiosk tablet registered for ${storeCode} Store (Mock mode).`,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to register kiosk device",
      },
      { status: 500, headers },
    );
  }
}
