import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PRG-QT-${year}-${randomSuffix}`;
}

// GET /api/admin/quotations — List all quotations with filters & multi-store scoping
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const storeFilter = searchParams.get("storeId") || "all";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};

      // Role-based store isolation
      if (staff.role === "STORE_MANAGER" && staff.storeId) {
        where.storeId = staff.storeId;
      } else if (
        staff.role === "REGIONAL_MANAGER" &&
        staff.allowedStoreCodes?.length
      ) {
        const regionalStores = await db.store.findMany({
          where: { code: { in: staff.allowedStoreCodes } },
          select: { id: true },
        });
        where.storeId = { in: regionalStores.map((s) => s.id) };
      } else if (storeFilter !== "all") {
        where.storeId = storeFilter;
      }

      if (status !== "all") {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { quoteNumber: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerEmail: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search } },
          { gstin: { contains: search, mode: "insensitive" } },
        ];
      }

      const [quotations, total] = await Promise.all([
        db.quotation.findMany({
          where,
          include: {
            store: { select: { id: true, name: true, code: true, city: true } },
            items: true,
            order: { select: { id: true, orderNumber: true, status: true } },
            _count: { select: { revisions: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        db.quotation.count({ where }),
      ]);

      return NextResponse.json(
        {
          success: true,
          data: {
            items: quotations,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers },
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json(
    { success: true, data: { items: [], total: 0 } },
    { headers },
  );
}

// POST /api/admin/quotations — Admin creates a new official quotation
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      storeId: reqStoreId,
      companyName,
      customerName,
      customerEmail,
      customerPhone,
      gstin,
      institutionType = "Corporate",
      billingAddress,
      shippingAddress,
      validUntil: reqValidUntil,
      taxRate = 18,
      shippingCharge = 0,
      notes,
      terms,
      status = "DRAFT",
      items = [],
    } = body;

    if (!companyName || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Company name, customer name, email, and phone are required.",
        },
        { status: 400, headers },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product line item is required.",
        },
        { status: 400, headers },
      );
    }

    if (process.env.DATABASE_URL) {
      // Determine store: if staff is STORE_MANAGER, enforce their store
      let finalStoreId = reqStoreId;
      if (staff.role === "STORE_MANAGER" && staff.storeId) {
        finalStoreId = staff.storeId;
      }
      if (!finalStoreId) {
        const defaultStore = await db.store.findFirst({
          where: { OR: [{ isCentralHub: true }, { code: "RANCHI" }] },
        });
        finalStoreId = defaultStore?.id;
      }

      if (!finalStoreId) {
        return NextResponse.json(
          { success: false, message: "Store is required" },
          { status: 400, headers },
        );
      }

      const quoteNumber = await generateQuoteNumber();
      const validUntilDate = reqValidUntil
        ? new Date(reqValidUntil)
        : new Date(Date.now() + 30 * 86400000);

      let subtotal = 0;
      let totalDiscount = 0;

      const quotationItemsData = items.map((item: any) => {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountPct = parseFloat(item.discountPct) || 0;
        const lineGross = qty * unitPrice;
        const lineDiscount =
          Math.round(lineGross * (discountPct / 100) * 100) / 100;
        const lineTotal = lineGross - lineDiscount;

        subtotal += lineGross;
        totalDiscount += lineDiscount;

        return {
          productId: item.productId || null,
          variantId: item.variantId || null,
          productName: item.productName || item.name || "Custom Component",
          productSku: item.productSku || item.sku || "PRG-ITEM",
          quantity: qty,
          unitPrice,
          discountPct,
          taxRate: parseFloat(item.taxRate) || taxRate,
          total: lineTotal,
        };
      });

      const netTaxable = subtotal - totalDiscount;
      const taxAmount = Math.round(netTaxable * (taxRate / 100) * 100) / 100;
      const shipCost = parseFloat(shippingCharge) || 0;
      const grandTotal =
        Math.round((netTaxable + taxAmount + shipCost) * 100) / 100;

      const quotation = await db.quotation.create({
        data: {
          quoteNumber,
          storeId: finalStoreId,
          institutionType,
          companyName,
          customerName,
          customerEmail,
          customerPhone,
          gstin: gstin || null,
          billingAddress: billingAddress || null,
          shippingAddress: shippingAddress || null,
          status,
          validUntil: validUntilDate,
          subtotal,
          discountAmount: totalDiscount,
          taxRate,
          taxAmount,
          shippingCharge: shipCost,
          grandTotal,
          notes: notes || "Official Prayog India Institutional Quotation.",
          terms:
            terms ||
            "1. 100% Advance payment via NEFT/RTGS/UPI for dispatch.\n2. Delivery within 5-7 working days from PO confirmation.\n3. Covered under Prayog 1-Year OEM replacement warranty.",
          createdByStaffId: staff.id,
          items: {
            create: quotationItemsData,
          },
          revisions: {
            create: {
              revisionNumber: 1,
              snapshotJson: JSON.stringify({
                status,
                items: quotationItemsData,
                subtotal,
                grandTotal,
              }),
              changedByRole: staff.role,
              changeNotes: `Quotation created by ${staff.name} (${staff.role})`,
            },
          },
        },
        include: {
          store: true,
          items: true,
          revisions: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Quotation created successfully.",
          data: quotation,
        },
        { status: 201, headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Quotation created (Mock Mode)",
        data: {
          id: `qt-${Date.now()}`,
          quoteNumber: `PRG-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      },
      { status: 201, headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
