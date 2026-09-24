import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// POST /api/admin/purchases/[id]/payment — Record supplier payment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();
  const { id: purchaseOrderId } = await params;

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
    const { amount, paymentMethod, referenceNumber, notes, paymentDate } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid payment amount is required" },
        { status: 400, headers },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method is required" },
        { status: 400, headers },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: true, message: "Payment recorded (mock)" },
        { headers },
      );
    }

    // Load PO
    const po = await db.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
    });
    if (!po)
      return NextResponse.json(
        { success: false, message: "Purchase order not found" },
        { status: 404, headers },
      );

    // Store scope check
    if (
      staff.role === "STORE_MANAGER" &&
      staff.storeId &&
      po.storeId !== staff.storeId
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden — not your store" },
        { status: 403, headers },
      );
    }

    // Validate amount
    if (amount > po.amountDue + 0.01) {
      return NextResponse.json(
        {
          success: false,
          message: `Payment amount ₹${amount} exceeds outstanding amount ₹${po.amountDue.toFixed(2)}`,
        },
        { status: 400, headers },
      );
    }

    // Create payment record
    await db.supplierPayment.create({
      data: {
        purchaseOrderId,
        amount,
        paymentMethod,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        recordedByStaffId: staff.id,
      },
    });

    // Update PO amountPaid, amountDue, paymentStatus
    const newAmountPaid = po.amountPaid + amount;
    const newAmountDue = Math.max(0, po.totalAmount - newAmountPaid);
    const newPaymentStatus =
      newAmountDue <= 0.01
        ? "PAID"
        : newAmountPaid > 0
          ? "PARTIALLY_PAID"
          : "UNPAID";

    await db.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newPaymentStatus,
      },
    });

    // Update supplier outstanding amount
    await db.supplier.update({
      where: { id: po.supplierId },
      data: {
        outstandingAmount: { decrement: amount },
        totalPurchases:
          po.amountPaid === 0 ? { increment: po.totalAmount } : undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Payment of ₹${amount.toLocaleString()} recorded. Status: ${newPaymentStatus}`,
        data: { newAmountPaid, newAmountDue, paymentStatus: newPaymentStatus },
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

// GET /api/admin/purchases/[id]/payment — List all payments for a PO
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();
  const { id: purchaseOrderId } = await params;

  if (!staff)
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );

  if (process.env.DATABASE_URL) {
    try {
      const payments = await db.supplierPayment.findMany({
        where: { purchaseOrderId },
        orderBy: { paymentDate: "desc" },
      });
      return NextResponse.json({ success: true, data: payments }, { headers });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] }, { headers });
}
