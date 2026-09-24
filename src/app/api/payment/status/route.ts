import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";
import { DEFAULT_COMPANY_BANK_DETAILS } from "../bank-details/route";

/**
 * GET /api/payment/status?orderId=...
 * Fetches real-time payment status, UTR details, verification logs, and rejection notes.
 */
export async function GET(req: NextRequest) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");

  if (!orderId && !paymentId) {
    return NextResponse.json(
      {
        success: false,
        message: "orderId or paymentId parameter is required.",
      },
      { status: 400, headers },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        success: true,
        data: {
          status: "PENDING_VERIFICATION",
          paymentMethod: "NEFT",
          amount: 1499,
          utrNumber: "SBI99182736450",
          transactionDate: new Date().toISOString(),
          bankDetails: DEFAULT_COMPANY_BANK_DETAILS,
        },
      },
      { headers },
    );
  }

  try {
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          ...(orderId
            ? [{ orderId }, { order: { orderNumber: orderId } }]
            : []),
          ...(paymentId ? [{ id: paymentId }] : []),
        ],
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!payment) {
      // If no payment record yet, check if order exists
      if (orderId) {
        const order = await db.order.findFirst({
          where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            userId: true,
          },
        });

        if (order) {
          return NextResponse.json(
            {
              success: true,
              data: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                orderStatus: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                amount: order.totalAmount,
                status: order.paymentStatus === "PAID" ? "VERIFIED" : "PENDING",
                utrNumber: null,
                bankDetails: DEFAULT_COMPANY_BANK_DETAILS,
              },
            },
            { headers },
          );
        }
      }

      return NextResponse.json(
        { success: false, message: "Payment record not found." },
        { status: 404, headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          orderNumber: payment.order?.orderNumber,
          orderStatus: payment.order?.status,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          utrNumber: payment.utrNumber,
          transactionDate: payment.transactionDate,
          proofUrl: payment.proofUrl,
          customerRemarks: payment.customerRemarks,
          submittedAt: payment.submittedAt,
          verifiedAt: payment.verifiedAt,
          rejectionReason: payment.rejectionReason,
          bankDetails: DEFAULT_COMPANY_BANK_DETAILS,
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
