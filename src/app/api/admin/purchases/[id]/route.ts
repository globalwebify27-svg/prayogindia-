import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/purchases/[id] — Full PO detail
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();
  const { id } = await params;

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  if (process.env.DATABASE_URL) {
    try {
      const po = await db.purchaseOrder.findUnique({
        where: { id },
        include: {
          store: { select: { id: true, code: true, name: true, city: true } },
          supplier: true,
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, price: true, gstRate: true } },
              receiptItems: true,
            },
          },
          receipts: {
            include: { items: true },
            orderBy: { createdAt: "desc" },
          },
          payments: { orderBy: { paymentDate: "desc" } },
        },
      });

      if (!po) return NextResponse.json({ success: false, message: "Purchase order not found" }, { status: 404, headers });

      // Enforce store scope for STORE_MANAGER
      if (staff.role === "STORE_MANAGER" && staff.storeId && po.storeId !== staff.storeId) {
        return NextResponse.json({ success: false, message: "Forbidden — not your store" }, { status: 403, headers });
      }

      return NextResponse.json({ success: true, data: po }, { headers });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
    }
  }

  return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503, headers });
}

// PATCH /api/admin/purchases/[id] — Update PO (status, notes, expected delivery)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();
  const { id } = await params;

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  try {
    const body = await request.json();
    const { status, notes, expectedDelivery, invoiceNumber } = body;

    if (process.env.DATABASE_URL) {
      const existing = await db.purchaseOrder.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404, headers });

      // Store Manager scope check
      if (staff.role === "STORE_MANAGER" && staff.storeId && existing.storeId !== staff.storeId) {
        return NextResponse.json({ success: false, message: "Forbidden — not your store" }, { status: 403, headers });
      }

      // Cannot edit cancelled/received orders
      if (existing.status === "CANCELLED" || existing.status === "RECEIVED") {
        return NextResponse.json({ success: false, message: `Cannot edit a ${existing.status.toLowerCase()} purchase order` }, { status: 409, headers });
      }

      const updated = await db.purchaseOrder.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
          ...(expectedDelivery && { expectedDelivery: new Date(expectedDelivery) }),
          ...(invoiceNumber !== undefined && { invoiceNumber }),
        },
      });

      return NextResponse.json({ success: true, data: updated }, { headers });
    }

    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
  }
}

// DELETE /api/admin/purchases/[id] — Cancel a DRAFT PO
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();
  const { id } = await params;

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  if (process.env.DATABASE_URL) {
    try {
      const existing = await db.purchaseOrder.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404, headers });

      // Only DRAFT / PENDING can be cancelled
      if (!["DRAFT", "PENDING"].includes(existing.status)) {
        return NextResponse.json({ success: false, message: `Cannot cancel a ${existing.status} order. Only DRAFT or PENDING orders can be cancelled.` }, { status: 409, headers });
      }

      // Store Manager scope check
      if (staff.role === "STORE_MANAGER" && staff.storeId && existing.storeId !== staff.storeId) {
        return NextResponse.json({ success: false, message: "Forbidden — not your store" }, { status: 403, headers });
      }

      await db.purchaseOrder.update({ where: { id }, data: { status: "CANCELLED" } });
      return NextResponse.json({ success: true, message: "Purchase order cancelled" }, { headers });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
    }
  }

  return NextResponse.json({ success: true }, { headers });
}
