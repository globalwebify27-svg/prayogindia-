import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { NotificationService } from "@/lib/notifications";
import { getSecurityHeaders } from "@/lib/security";
import { recordAuditLog } from "@/lib/auditLogger";

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * POST /api/payment/bank-transfer/submit
 * Submits customer's NEFT / RTGS / Wire transfer details for verification.
 * 
 * Strict State Machine Rule:
 * Submitting UTR details sets payment status to PENDING_VERIFICATION.
 * It NEVER automatically marks payment as PAID or VERIFIED.
 */
export async function POST(req: NextRequest) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();

  try {
    const body = await req.json().catch(() => ({}));
    const {
      orderId,
      paymentMethod = "NEFT",
      utrNumber,
      amount,
      transactionDate,
      proofUrl,
      remarks,
    } = body;

    // 1. Validate Input Fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order identifier is required." },
        { status: 400, headers }
      );
    }

    if (!utrNumber || typeof utrNumber !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid UTR / Transaction Reference number is required." },
        { status: 400, headers }
      );
    }

    const sanitizedUtr = utrNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitizedUtr.length < 6 || sanitizedUtr.length > 35) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid UTR format. UTR must be an alphanumeric reference between 6 and 35 characters.",
        },
        { status: 400, headers }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Payment amount must be a positive number." },
        { status: 400, headers }
      );
    }

    let parsedDate = new Date();
    if (transactionDate) {
      const d = new Date(transactionDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid transaction date format." },
          { status: 400, headers }
        );
      }
      // Cannot be in future (allow 5 min clock drift)
      if (d.getTime() > Date.now() + 5 * 60 * 1000) {
        return NextResponse.json(
          { success: false, message: "Transaction date cannot be in the future." },
          { status: 400, headers }
        );
      }
      parsedDate = d;
    }

    const normalizedMethod = ["RTGS", "NEFT", "bank_transfer", "UPI"].includes(paymentMethod)
      ? paymentMethod
      : "NEFT";

    if (!process.env.DATABASE_URL) {
      // Mock Mode
      return NextResponse.json(
        {
          success: true,
          message: "Payment details submitted successfully. Your payment is pending verification.",
          data: {
            orderId,
            utrNumber: sanitizedUtr,
            status: "PENDING_VERIFICATION",
            amount: parsedAmount,
            submittedAt: new Date().toISOString(),
          },
        },
        { headers }
      );
    }

    // 2. Fetch Order and Verify Ownership
    const order = await db.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        user: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404, headers }
      );
    }

    // Security: Validate customer isolation
    if (user && order.userId !== user.id && order.user.email !== user.email) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You are not authorized to submit payments for this order." },
        { status: 403, headers }
      );
    }

    // Verify order is not cancelled or already paid
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "Cannot submit payment for a cancelled order." },
        { status: 400, headers }
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "This order has already been verified and paid." },
        { status: 400, headers }
      );
    }

    // 3. Duplicate UTR Prevention across different orders
    const duplicatePayment = await db.payment.findFirst({
      where: {
        utrNumber: sanitizedUtr,
        orderId: { not: order.id },
        status: { in: ["PENDING_VERIFICATION", "VERIFIED", "PAID"] },
      },
      include: { order: true },
    });

    if (duplicatePayment) {
      return NextResponse.json(
        {
          success: false,
          message: `This UTR reference (${sanitizedUtr}) has already been submitted for another order (#${duplicatePayment.order?.orderNumber || "EXISTING"}). Duplicate submissions are not allowed.`,
        },
        { status: 409, headers }
      );
    }

    // 4. Atomic Database Transaction: Update Payment & Order records
    const result = await db.$transaction(async (tx) => {
      let paymentRecord = order.payment;

      if (paymentRecord) {
        paymentRecord = await tx.payment.update({
          where: { id: paymentRecord.id },
          data: {
            method: normalizedMethod,
            amount: parsedAmount,
            utrNumber: sanitizedUtr,
            transactionDate: parsedDate,
            proofUrl: proofUrl || paymentRecord.proofUrl || null,
            customerRemarks: remarks || paymentRecord.customerRemarks || null,
            status: "PENDING_VERIFICATION",
            submittedAt: new Date(),
            failureReason: null,
            rejectionReason: null,
            verifiedAt: null,
            verifiedByStaffId: null,
            verifiedByStaffName: null,
          },
        });
      } else {
        paymentRecord = await tx.payment.create({
          data: {
            orderId: order.id,
            method: normalizedMethod,
            amount: parsedAmount,
            utrNumber: sanitizedUtr,
            transactionDate: parsedDate,
            proofUrl: proofUrl || null,
            customerRemarks: remarks || null,
            status: "PENDING_VERIFICATION",
            submittedAt: new Date(),
          },
        });
      }

      // Keep order paymentStatus as PENDING while under verification
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: normalizedMethod,
          paymentStatus: "PENDING",
        },
      });

      return paymentRecord;
    });

    // 5. Send Notification & Audit Log
    try {
      await NotificationService.createNotification({
        userId: order.userId,
        type: "ORDER_PLACED",
        title: "NEFT/RTGS Payment Details Received 🏦",
        message: `We received your UTR #${sanitizedUtr} for ₹${parsedAmount.toLocaleString("en-IN")}. Our accounts team is verifying the bank credit.`,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          utrNumber: sanitizedUtr,
          status: "PENDING_VERIFICATION",
        },
      });

      await recordAuditLog({
        actionCategory: "PAYMENT_FINANCE",
        action: "NEFT_RTGS_SUBMITTED",
        entityType: "Payment",
        entityId: result.id,
        description: `Customer submitted ${normalizedMethod} payment UTR: ${sanitizedUtr} for Order #${order.orderNumber} (₹${parsedAmount}).`,
        actor: user
          ? { id: user.id, name: user.name, email: user.email, role: user.role }
          : { name: "Customer", role: "CUSTOMER" },
        newValue: {
          utrNumber: sanitizedUtr,
          amount: parsedAmount,
          method: normalizedMethod,
          status: "PENDING_VERIFICATION",
        },
        req,
      });
    } catch (logErr) {
      console.warn("[NEFT Submit] Logging error:", logErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment details submitted successfully. Your payment is pending verification.",
        data: {
          id: result.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          utrNumber: sanitizedUtr,
          status: "PENDING_VERIFICATION",
          amount: parsedAmount,
          transactionDate: parsedDate.toISOString(),
        },
      },
      { headers }
    );
  } catch (error: any) {
    console.error("[BankTransfer Submit Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit bank transfer details." },
      { status: 500, headers }
    );
  }
}
