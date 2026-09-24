import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";
import { recordAuditLog } from "@/lib/auditLogger";

// GET /api/admin/quotations/[id] — Full quotation detail with items, store, revisions, and linked order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  if (process.env.DATABASE_URL) {
    try {
      const quotation = await db.quotation.findUnique({
        where: { id },
        include: {
          store: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  sku: true,
                  mrp: true,
                },
              },
            },
          },
          revisions: {
            orderBy: { revisionNumber: "desc" },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              customerType: true,
            },
          },
        },
      });

      if (!quotation) {
        return NextResponse.json(
          { success: false, message: "Quotation not found" },
          { status: 404, headers },
        );
      }

      // Store scoping
      if (
        staff.role === "STORE_MANAGER" &&
        staff.storeId &&
        quotation.storeId !== staff.storeId
      ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized for this store" },
          { status: 403, headers },
        );
      }

      return NextResponse.json({ success: true, data: quotation }, { headers });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "Database not configured" },
    { status: 500, headers },
  );
}

// PATCH /api/admin/quotations/[id] — Admin updates quote, modifies items/pricing, changes status, or adds revisions
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      status,
      storeId,
      validUntil,
      taxRate,
      shippingCharge,
      notes,
      terms,
      adminNotes,
      revisionReason,
      items, // optional updated items list
    } = body;

    if (process.env.DATABASE_URL) {
      const existing = await db.quotation.findUnique({
        where: { id },
        include: {
          items: true,
          revisions: { orderBy: { revisionNumber: "desc" }, take: 1 },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Quotation not found" },
          { status: 404, headers },
        );
      }

      // Prevent edits if already converted
      if (existing.status === "CONVERTED") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cannot edit a quotation that has already been converted to an order.",
          },
          { status: 400, headers },
        );
      }

      // Store scoping
      if (
        staff.role === "STORE_MANAGER" &&
        staff.storeId &&
        existing.storeId !== staff.storeId
      ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized for this store" },
          { status: 403, headers },
        );
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (storeId) updateData.storeId = storeId;
      if (validUntil) updateData.validUntil = new Date(validUntil);
      if (typeof taxRate === "number") updateData.taxRate = taxRate;
      if (typeof shippingCharge === "number")
        updateData.shippingCharge = shippingCharge;
      if (notes !== undefined) updateData.notes = notes;
      if (terms !== undefined) updateData.terms = terms;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

      // If items are being replaced/updated
      if (Array.isArray(items)) {
        let subtotal = 0;
        let totalDiscount = 0;
        const currentTaxRate =
          typeof taxRate === "number" ? taxRate : existing.taxRate;

        // Delete existing items and recreate
        await db.quotationItem.deleteMany({ where: { quotationId: id } });

        const newItemsData = items.map((item: any) => {
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
            quotationId: id,
            productId: item.productId || null,
            variantId: item.variantId || null,
            productName: item.productName || item.name || "Component",
            productSku: item.productSku || item.sku || "PRG-ITEM",
            quantity: qty,
            unitPrice,
            discountPct,
            taxRate: parseFloat(item.taxRate) || currentTaxRate,
            total: lineTotal,
          };
        });

        await db.quotationItem.createMany({ data: newItemsData });

        const netTaxable = subtotal - totalDiscount;
        const taxAmount =
          Math.round(netTaxable * (currentTaxRate / 100) * 100) / 100;
        const shipCost =
          typeof shippingCharge === "number"
            ? shippingCharge
            : existing.shippingCharge;
        const grandTotal =
          Math.round((netTaxable + taxAmount + shipCost) * 100) / 100;

        updateData.subtotal = subtotal;
        updateData.discountAmount = totalDiscount;
        updateData.taxAmount = taxAmount;
        updateData.grandTotal = grandTotal;
      }

      // Record revision
      const lastRev = existing.revisions[0]?.revisionNumber || 1;
      const nextRev = lastRev + 1;
      const changeNote =
        revisionReason ||
        (status
          ? `Quotation updated to ${status}`
          : "Quotation terms or pricing updated");

      const updated = await db.quotation.update({
        where: { id },
        data: {
          ...updateData,
          revisions: {
            create: {
              revisionNumber: nextRev,
              snapshotJson: JSON.stringify({
                ...updateData,
                status: updateData.status || existing.status,
              }),
              changedByRole: staff.role,
              changeNotes: `${changeNote} by ${staff.name}`,
            },
          },
        },
        include: {
          items: true,
          store: true,
          revisions: { orderBy: { revisionNumber: "desc" } },
        },
      });

      // Immutable Unified Audit Log
      await recordAuditLog({
        actionCategory: "QUOTATION_B2B",
        action:
          status && existing.status !== status
            ? `QUOTATION_STATUS_${status}`
            : "QUOTATION_UPDATE",
        entityType: "Quotation",
        entityId: id,
        description:
          status && existing.status !== status
            ? `Quotation #${existing.quoteNumber} status changed from ${existing.status} to ${status}. Grand Total: ₹${updated.grandTotal.toLocaleString("en-IN")}`
            : `Quotation #${existing.quoteNumber} revised (Rev #${nextRev}). Grand Total: ₹${updated.grandTotal.toLocaleString("en-IN")}`,
        actor: staff,
        storeId: updated.storeId,
        previousValue: {
          status: existing.status,
          grandTotal: existing.grandTotal,
          subtotal: existing.subtotal,
        },
        newValue: {
          status: updated.status,
          grandTotal: updated.grandTotal,
          subtotal: updated.subtotal,
          revisionNumber: nextRev,
        },
        metadata: {
          quoteNumber: existing.quoteNumber,
          customerName: existing.customerName,
          companyName: existing.companyName,
          changeNote,
        },
        req: request,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Quotation updated successfully.",
          data: updated,
        },
        { headers },
      );
    }

    return NextResponse.json(
      { success: true, message: "Quotation updated (Mock Mode)" },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
