import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { NotificationService } from "@/lib/notifications";
import { getSecurityHeaders } from "@/lib/security";
import { OrderStatus } from "@prisma/client";
import { LoyaltyEngine } from "@/lib/loyaltyEngine";

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

/** Statuses that are cancellable by the customer */
const CANCELLABLE_STATUSES: OrderStatus[] = [
  "ORDER_PLACED" as OrderStatus,
  "PAYMENT_FAILED" as OrderStatus,
];

/**
 * POST /api/orders/[id]/cancel
 * Allows a customer to cancel their own order.
 * - Only allowed for cancellable statuses
 * - Releases StoreInventory reservation
 * - Initiates refund if payment was made
 * - Deducts credited reward points
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401, headers },
    );
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required." },
      { status: 400, headers },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "Order cancelled (Mock Mode).",
        data: { orderId, status: "CANCELLED" },
      });
    }

    // 1. Fetch order with customer isolation
    const order = await db.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        userId: user.id,
      },
      include: {
        items: true,
        payment: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404, headers },
      );
    }

    // 2. Check if cancellable
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Order cannot be cancelled in its current status: ${order.status.replace(/_/g, " ")}.`,
        },
        { status: 422, headers },
      );
    }

    // 3. Find Ranchi store for inventory release
    const ranchiBranch = await db.store.findFirst({
      where: { OR: [{ code: "RANCHI" }, { isCentralHub: true }] },
    });

    // 4. Atomic cancellation transaction
    await db.$transaction(async (tx) => {
      // 4a. Update order to CANCELLED
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: reason ? String(reason).trim().slice(0, 500) : null,
          ...(order.paymentStatus === "PAID" && {
            refundStatus: "INITIATED",
            refundAmount: order.totalAmount,
          }),
        },
      });

      // 4b. Release inventory reservation if shipped from Ranchi
      if (ranchiBranch) {
        for (const item of order.items) {
          const inv = await tx.storeInventory.findUnique({
            where: {
              storeId_productId: {
                storeId: ranchiBranch.id,
                productId: item.productId,
              },
            },
          });

          if (inv && order.paymentStatus === "PAID") {
            // Only restore if stock was deducted (payment was confirmed)
            const newQty = inv.quantity + item.quantity;
            const newAvailable = inv.availableQuantity + item.quantity;
            const newStatus =
              newQty === 0
                ? "OUT_OF_STOCK"
                : newQty <= inv.lowStockThreshold
                  ? "LOW_STOCK"
                  : "IN_STOCK";

            await tx.storeInventory.update({
              where: { id: inv.id },
              data: {
                quantity: newQty,
                availableQuantity: newAvailable,
                status: newStatus,
              },
            });

            await tx.inventoryTransaction.create({
              data: {
                storeId: ranchiBranch.id,
                productId: item.productId,
                orderId: order.id,
                transactionType: "RETURN",
                quantityBefore: inv.quantity,
                quantityChange: item.quantity,
                quantityAfter: newQty,
                userId: user.id,
                referenceId: order.orderNumber,
                notes: `Cancelled order ${order.orderNumber} — inventory restored`,
              },
            });
          }
        }
      }
    });

    // 4c. Authoritative Loyalty Engine Reversal: revokes earned coins & restores redeemed coins
    try {
      await LoyaltyEngine.reverseOrderPoints(order.id, "Customer cancellation", user, request);
    } catch (loyaltyErr) {
      console.error("[OrderCancel] Loyalty reversal error:", loyaltyErr);
    }

    // 5. Non-blocking notification
    NotificationService.createNotification({
      userId: user.id,
      type: "ORDER_PLACED",
      title: `Order Cancelled: ${order.orderNumber}`,
      message:
        order.paymentStatus === "PAID"
          ? `Your order ${order.orderNumber} has been cancelled. Refund of ₹${order.totalAmount.toLocaleString("en-IN")} will be processed within 5-7 business days.`
          : `Your order ${order.orderNumber} has been cancelled.`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
      customerEmail: order.user.email,
    }).catch(console.warn);

    return NextResponse.json({
      success: true,
      message:
        order.paymentStatus === "PAID"
          ? "Order cancelled. Refund will be processed within 5-7 business days."
          : "Order cancelled successfully.",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: "CANCELLED",
        refundInitiated: order.paymentStatus === "PAID",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to cancel order." },
      { status: 500, headers },
    );
  }
}
