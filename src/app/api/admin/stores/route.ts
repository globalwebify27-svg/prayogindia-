import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff, hasRequiredRole } from "@/lib/staffAuth";
import { INITIAL_STORES } from "@/data/storesData";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/stores - List all stores (SUPER_ADMIN sees all, STORE_MANAGER sees own)
export async function GET() {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401, headers },
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (staff.role === "STORE_MANAGER" && staff.storeId) {
        where.id = staff.storeId;
      }

      const stores = await db.store.findMany({
        where,
        include: {
          devices: true,
          staff: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              status: true,
            },
          },
        },
        orderBy: { code: "asc" },
      });

      const formattedStores = stores.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        type: s.type || "Physical Branch Store",
        isCentralHub: Boolean(s.isCentralHub),
        address: s.address || "",
        city: s.city || "",
        state: s.state || "",
        pincode: s.pincode || "",
        contactPhone: s.contactPhone || "",
        contactEmail: s.contactEmail || "",
        storeManager:
          s.staff?.find((m) => m.role === "STORE_MANAGER")?.name ||
          "Store Manager",
        operatingHours: s.operatingHours || "10:00 AM - 8:00 PM",
        status: s.status || "Operational",
        totalStockUnits: s.totalStockUnits ?? 0,
        monthlyWalkInRevenue: s.monthlyWalkInRevenue ?? 0,
        authorizedDevices: (s.devices || []).map((d) => ({
          id: d.id,
          deviceName: d.deviceName,
          deviceModel: d.deviceType?.replace(/_/g, " ") || "POS Terminal",
          token: d.deviceCode,
          assignedStaff: d.deviceName,
          status: (d.status === "ACTIVE"
            ? "Active / Paired"
            : "Suspended") as any,
          lastActiveAt: d.lastLogin
            ? new Date(d.lastLogin).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Active",
        })),
      }));

      return NextResponse.json(
        { success: true, data: formattedStores },
        { headers },
      );
    } catch (dbErr) {
      console.warn(
        "Database error fetching stores, falling back to mock:",
        dbErr,
      );
    }
  }

  // Fallback to static stores data
  let stores = [...INITIAL_STORES];
  if (staff.role === "STORE_MANAGER" && staff.storeCode) {
    stores = stores.filter(
      (s) => s.code === staff.storeCode || s.id === staff.storeId,
    );
  }

  return NextResponse.json({ success: true, data: stores }, { headers });
}

// POST /api/admin/stores - Create new physical branch store (SUPER_ADMIN only)
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || !hasRequiredRole(staff, "SUPER_ADMIN")) {
    return NextResponse.json(
      { success: false, message: "Forbidden. Super Admin access required." },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      code,
      name,
      type = "Physical Branch Store",
      isCentralHub = false,
      address,
      city,
      state,
      pincode,
      contactPhone,
      contactEmail,
      operatingHours = "10:00 AM - 8:00 PM",
    } = body;

    if (!code || !name || !address || !city || !state || !pincode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Code, name, address, city, state, and pincode are required.",
        },
        { status: 400, headers },
      );
    }

    const cleanCode = code.trim().toUpperCase();

    if (process.env.DATABASE_URL) {
      const created = await db.store.create({
        data: {
          code: cleanCode,
          name,
          type,
          isCentralHub: Boolean(isCentralHub),
          address,
          city,
          state,
          pincode,
          contactPhone: contactPhone || "",
          contactEmail: contactEmail || "",
          operatingHours,
          status: "Operational",
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Store "${name}" (${cleanCode}) created successfully.`,
          data: created,
        },
        { headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Store ${cleanCode} created (Dev Mock).`,
        data: { id: `str-${Date.now()}`, code: cleanCode, name, city },
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create store." },
      { status: 500, headers },
    );
  }
}
