import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/purchases — List all purchase orders with filters
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const supplierId = searchParams.get("supplierId") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};

      // STORE_MANAGER: restrict to own store only
      if (staff.role === "STORE_MANAGER" && staff.storeId) {
        where.storeId = staff.storeId;
      }
      // REGIONAL_MANAGER: restrict to allowed stores
      if (staff.role === "REGIONAL_MANAGER" && staff.allowedStoreCodes?.length) {
        const stores = await db.store.findMany({
          where: { code: { in: staff.allowedStoreCodes } },
          select: { id: true },
        });
        where.storeId = { in: stores.map((s) => s.id) };
      }

      if (status !== "all") where.status = status;
      if (supplierId) where.supplierId = supplierId;
      if (search) {
        where.OR = [
          { poNumber: { contains: search, mode: "insensitive" } },
          { invoiceNumber: { contains: search, mode: "insensitive" } },
          { supplier: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [orders, total] = await Promise.all([
        db.purchaseOrder.findMany({
          where,
          include: {
            store: { select: { id: true, code: true, name: true } },
            supplier: { select: { id: true, name: true, phone: true } },
            items: { select: { id: true, orderedQty: true, receivedQty: true, pendingQty: true, totalAmount: true } },
            _count: { select: { receipts: true, payments: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        db.purchaseOrder.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: orders,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      }, { headers });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
    }
  }

  return NextResponse.json({ success: true, data: [], pagination: { total: 0, page: 1, limit, pages: 0 } }, { headers });
}

// POST /api/admin/purchases — Create a new Purchase Order (DRAFT)
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  try {
    const body = await request.json();
    const { storeId, supplierId, expectedDelivery, invoiceNumber, notes, items, shippingCost = 0 } = body;

    if (!storeId || !supplierId || !items?.length) {
      return NextResponse.json({ success: false, message: "storeId, supplierId, and at least one item are required" }, { status: 400, headers });
    }

    // STORE_MANAGER can only create for their own store
    if (staff.role === "STORE_MANAGER" && staff.storeId && staff.storeId !== storeId) {
      return NextResponse.json({ success: false, message: "You can only create purchase orders for your own store" }, { status: 403, headers });
    }

    if (process.env.DATABASE_URL) {
      // Generate PO number
      const count = await db.purchaseOrder.count();
      const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      // Compute totals from items
      let subtotal = 0;
      let taxAmount = 0;
      const enrichedItems: any[] = [];

      for (const item of items) {
        const product = await db.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const lineTotal = item.qty * item.unitPrice;
        const lineTax = lineTotal * ((item.taxRate || product.gstRate || 0) / 100);
        const lineDiscount = item.discountAmount || 0;
        const lineNetTotal = lineTotal + lineTax - lineDiscount;

        subtotal += lineTotal;
        taxAmount += lineTax;

        enrichedItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          orderedQty: item.qty,
          pendingQty: item.qty,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || product.gstRate || 0,
          taxAmount: lineTax,
          discountAmount: lineDiscount,
          totalAmount: lineNetTotal,
        });
      }

      const totalAmount = subtotal + taxAmount + shippingCost;

      const po = await db.purchaseOrder.create({
        data: {
          poNumber,
          storeId,
          supplierId,
          status: "DRAFT",
          expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
          invoiceNumber: invoiceNumber || null,
          notes: notes || null,
          subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
          amountDue: totalAmount,
          paymentStatus: "UNPAID",
          createdByStaffId: staff.id,
          items: { create: enrichedItems },
        },
        include: {
          store: true,
          supplier: true,
          items: true,
        },
      });

      return NextResponse.json({ success: true, data: po }, { status: 201, headers });
    }

    const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    return NextResponse.json({ success: true, data: { id: `po-${Date.now()}`, poNumber } }, { status: 201, headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
  }
}
