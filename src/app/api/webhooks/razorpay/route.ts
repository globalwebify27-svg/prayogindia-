import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { deductStoreInventory } from "@/lib/inventoryEngine";
import { NotificationService } from "@/lib/notifications";
import {
  calculateEarnedRewards,
  getCustomerTypeCode,
} from "@/data/customerTypes";
import { LoyaltyEngine } from "@/lib/loyaltyEngine";

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count();
  const seq = String(count + 1).padStart(5, "0");
  return `INV-${year}-${seq}`;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    // Signature verification (if webhook secret configured)
    if (webhookSecret && signature) {
      const expectedSignature = createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { success: false, message: "Invalid webhook signature." },
          { status: 400 },
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "Webhook acknowledged (Mock mode).",
      });
    }

    // ─────────────────────────────────────────────
    // 1. Payment Captured / Order Paid Event
    // ─────────────────────────────────────────────
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload.payment?.entity;
      const gatewayOrderId =
        paymentEntity?.order_id || payload.order?.entity?.id;
      const gatewayPaymentId = paymentEntity?.id;
      const orderIdFromNotes = paymentEntity?.notes?.orderId;

      // Find order by internal ID, order number, or Razorpay order_id
      const order = await db.order.findFirst({
        where: {
          OR: [
            ...(orderIdFromNotes
              ? [{ id: orderIdFromNotes }, { orderNumber: orderIdFromNotes }]
              : []),
            ...(gatewayOrderId ? [{ payment: { gatewayOrderId } }] : []),
          ],
        },
        include: {
          items: { include: { product: true } },
          user: true,
          payment: true,
        },
      });

      if (!order) {
        return NextResponse.json({
          success: true,
          message: "Order not found or already processed.",
        });
      }

      // Idempotency: If already paid, do not re-deduct stock or re-credit rewards
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({
          success: true,
          message: "Order already paid.",
        });
      }

      // Execute atomic updates
      await db.$transaction(async (tx) => {
        // Update Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAYMENT_CONFIRMED",
            paymentStatus: "PAID",
            paymentId: gatewayPaymentId || order.paymentId,
            paymentMethod: paymentEntity?.method || "razorpay",
          },
        });

        // Upsert Payment record
        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              status: "PAID",
              gatewayPaymentId:
                gatewayPaymentId || order.payment.gatewayPaymentId,
              gatewayResponse: paymentEntity || undefined,
              verifiedAt: new Date(),
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: order.id,
              gatewayOrderId: gatewayOrderId || undefined,
              gatewayPaymentId: gatewayPaymentId || undefined,
              amount: order.totalAmount,
              status: "PAID",
              method: paymentEntity?.method || "razorpay",
              gatewayResponse: paymentEntity || undefined,
              verifiedAt: new Date(),
            },
          });
        }
      });

      // Deduct stock from Central Ranchi store
      try {
        for (const item of order.items) {
          await deductStoreInventory({
            productId: item.productId,
            quantity: item.quantity,
            orderSource: "ONLINE_WEB",
            storeId: "ranchi",
            orderId: order.orderNumber,
            userId: order.userId,
          });
        }
      } catch (stockErr) {
        console.error("[RazorpayWebhook] Stock deduction error:", stockErr);
      }

      // Credit rewards points
      try {
        await LoyaltyEngine.awardOrderPoints(order.id, request);
      } catch (rewardErr) {
        console.error("[RazorpayWebhook] Reward credit error:", rewardErr);
      }

      // Generate invoice if not exists
      try {
        const existingInvoice = await db.invoice.findUnique({
          where: { orderId: order.id },
        });
        if (!existingInvoice) {
          const invNumber = await generateInvoiceNumber();
          await db.invoice.create({
            data: {
              invoiceNumber: invNumber,
              orderId: order.id,
              userId: order.userId,
              customerName: order.user.name,
              customerEmail: order.user.email,
              customerPhone: order.user.phone,
              billingAddress: order.shippingAddress,
              shippingAddress: order.shippingAddress,
              items: order.items.map((i) => ({
                name: i.productName,
                sku: i.productSku,
                quantity: i.quantity,
                price: i.price,
                total: i.price * i.quantity,
              })),
              subtotal: order.subtotal,
              gstAmount: order.gstAmount,
              discountAmount: order.discountAmount,
              couponCode: order.couponCode,
              couponDiscount: order.couponDiscount,
              shippingCost: order.shippingCost,
              totalAmount: order.totalAmount,
              paymentMethod: paymentEntity?.method || "razorpay",
              paymentRef: gatewayPaymentId || undefined,
            },
          });
        }
      } catch (invErr) {
        console.error("[RazorpayWebhook] Invoice generation error:", invErr);
      }

      // Send customer notification
      await NotificationService.createNotification({
        userId: order.userId,
        type: "ORDER_PLACED",
        title: "Order Payment Confirmed",
        message: `Your payment of ₹${order.totalAmount.toLocaleString("en-IN")} for Order #${order.orderNumber} has been confirmed.`,
        data: { orderId: order.id, orderNumber: order.orderNumber },
      }).catch(() => {});
    }

    // ─────────────────────────────────────────────
    // 2. Refund Processed Event
    // ─────────────────────────────────────────────
    if (eventType === "refund.processed") {
      const refundEntity = payload.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        const payment = await db.payment.findFirst({
          where: { gatewayPaymentId: paymentId },
          include: { order: true },
        });

        if (payment && payment.order) {
          await db.order.update({
            where: { id: payment.order.id },
            data: {
              status: "REFUNDED",
              refundStatus: "PROCESSED",
              refundAmount: (refundEntity?.amount || 0) / 100,
              refundedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("[RazorpayWebhook] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Webhook processing error" },
      { status: 500 },
    );
  }
}
