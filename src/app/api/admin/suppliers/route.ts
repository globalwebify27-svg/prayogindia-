import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/suppliers — List all suppliers
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (status !== "all") where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { contactPerson: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
          { gstin: { contains: search, mode: "insensitive" } },
        ];
      }

      const suppliers = await db.supplier.findMany({
        where,
        include: {
          _count: { select: { purchaseOrders: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: suppliers }, { headers });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
    }
  }

  return NextResponse.json({ success: true, data: [] }, { headers });
}

// POST /api/admin/suppliers — Create a supplier
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden — Super Admin or Regional Manager required" }, { status: 403, headers });
  }

  try {
    const body = await request.json();
    const { name, contactPerson, phone, email, address, city, state, pincode, gstin, bankName, bankAccount, bankIfsc, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: "Supplier name and phone are required" }, { status: 400, headers });
    }

    if (process.env.DATABASE_URL) {
      const supplier = await db.supplier.create({
        data: { name, contactPerson, phone, email, address, city, state, pincode, gstin, bankName, bankAccount, bankIfsc, notes },
      });
      return NextResponse.json({ success: true, data: supplier }, { status: 201, headers });
    }

    return NextResponse.json({ success: true, data: { id: `sup-${Date.now()}`, name, phone } }, { status: 201, headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
  }
}

// PATCH /api/admin/suppliers — Update a supplier
export async function PATCH(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ success: false, message: "Supplier ID required" }, { status: 400, headers });

    if (process.env.DATABASE_URL) {
      const supplier = await db.supplier.update({ where: { id }, data });
      return NextResponse.json({ success: true, data: supplier }, { headers });
    }

    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
  }
}

// DELETE /api/admin/suppliers — Deactivate a supplier (soft delete)
export async function DELETE(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || staff.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, message: "Super Admin only" }, { status: 403, headers });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ success: false, message: "Supplier ID required" }, { status: 400, headers });

    if (process.env.DATABASE_URL) {
      // Soft delete — mark inactive
      await db.supplier.update({ where: { id }, data: { status: "Inactive" } });
      return NextResponse.json({ success: true, message: "Supplier deactivated" }, { headers });
    }

    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
  }
}
