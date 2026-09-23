import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getSecurityHeaders } from "@/lib/security";
import { NotificationService } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/auditLogger";

async function getAdminOrStaff() {
  const staff = await getAuthenticatedStaff();
  if (
    staff &&
    (staff.role === "SUPER_ADMIN" ||
      staff.role === "REGIONAL_MANAGER" ||
      staff.role === "STORE_MANAGER")
  ) {
    return staff;
  }
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "SUPER_ADMIN" as const,
      storeId: null,
    };
  }
  return null;
}

/**
 * POST /api/admin/payments/[id]/reject
 * Rejects an invalid or uncredited NEFT/RTGS payment submission.
 * Requires a clear rejectionReason for the customer.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getSecurityHeaders();
  const staff = await getAdminOrStaff();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Admin permission required." },
      { status: 403, headers }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const rejectionReason = body.rejectionReason?.trim();
  const adminRemarks = body.adminRemarks?.trim() || null;

  if (!rejectionReason || rejectionReason.length < 5) {
    return NextResponse.json(
      {
        success: false,
        message: "A specific rejection reason (minimum 5 characters) is required to notify the customer.",
      },
      { status: 400, headers }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        success: true,
        message: "Payment rejected (Mock Mode).",
        data: { paymentId: id, status: "REJECTED", rejectionReason },
      },
      { headers }
    );
  }

  try {
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found." },
        { status: 404, headers }
      );
    }

    if (payment.status === "PAID" || payment.status === "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot reject a payment that has already been verified and marked as PAID. A formal reversal process is required.",
        },
        { status: 400, headers }
      );
    }

    const order = payment.order;

    // Database update
    const updatedPayment = await db.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REJECTED",
          rejectionReason,
          adminRemarks,
          verifiedAt: new Date(),
          verifiedByStaffId: staff.id,
          verifiedByStaffName: staff.name,
        },
      });

      if (order) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
          },
        });
      }

      return p;
    });

    // Notify Customer
    if (order) {
      try {
        await NotificationService.createNotification({
          userId: order.userId,
          type: "ORDER_PLACED",
          title: "Bank Transfer Payment Action Required ⚠️",
          message: `Your NEFT/RTGS payment details for Order #${order.orderNumber} could not be verified: "${rejectionReason}". Please review and resubmit your valid UTR.`,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: "REJECTED",
            rejectionReason,
          },
        });
      } catch (notifErr) {
        console.warn("[Notification Warning]:", notifErr);
      }
    }

    // Write Audit Log
    try {
      await recordAuditLog({
        actionCategory: "PAYMENT_FINANCE",
        action: "PAYMENT_REJECTED",
        entityType: "Payment",
        entityId: payment.id,
        description: `Staff ${staff.name} (${staff.role}) rejected ${payment.method} transfer UTR: ${payment.utrNumber || "N/A"} for Order #${order?.orderNumber || payment.orderId}. Reason: ${rejectionReason}`,
        actor: { id: staff.id, name: staff.name, role: staff.role, email: staff.email },
        previousValue: { status: payment.status },
        newValue: {
          status: "REJECTED",
          rejectionReason,
          adminRemarks,
          verifiedByStaffId: staff.id,
        },
        req,
      });
    } catch (auditErr) {
      console.warn("[AuditLog Warning]:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Payment marked as REJECTED. Customer has been notified with the reason.`,
        data: updatedPayment,
      },
      { headers }
    );
  } catch (error: any) {
    console.error("[Reject Payment Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reject payment." },
      { status: 500, headers }
    );
  }
}
