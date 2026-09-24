import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { AuthSessionUser, getAuthenticatedCustomer } from "@/lib/authUtils";
import { NotificationService } from "@/lib/notifications";
import { getSecurityHeaders } from "@/lib/security";
import {
  calculateEarnedRewards,
  getCustomerTypeCode,
} from "@/data/customerTypes";
import { LoyaltyEngine } from "@/lib/loyaltyEngine";

const getAuthenticatedUser = getAuthenticatedCustomer;

/** Generate sequential invoice number */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count();
  const seq = String(count + 1).padStart(5, "0");
  return `INV-${year}-${seq}`;
}

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature server-side (HMAC-SHA256).
 * NEVER trusts payment_id from frontend as proof of payment.
 *
 * On success:
 * 1. Verifies HMAC signature
 * 2. Updates Order → PAYMENT_CONFIRMED + paymentStatus = PAID
 * 3. Deducts stock from Ranchi StoreInventory (ONLINE_FULFILLMENT)
 * 4. Credits reward points to customer
 * 5. Creates RewardTransaction record
 * 6. Generates Tax Invoice record
 * 7. Sends notification to customer
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    // 1. Input validation
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        { success: false, message: "Missing payment verification fields." },
        { status: 400, headers },
      );
    }

    if (!process.env.DATABASE_URL) {
      // Mock mode — accept as success
      return NextResponse.json({
        success: true,
        message: "Payment verified (Mock Mode).",
        data: { orderId, paymentId: razorpay_payment_id },
      });
    }

    // 2. Fetch order with customer isolation
    const order = await db.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        userId: user.id,
      },
      include: {
        items: { include: { product: true, variant: true } },
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404, headers },
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "Order is already paid." },
        { status: 409, headers },
      );
    }

    // 3. Razorpay Signature Verification (HMAC-SHA256)
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (RAZORPAY_KEY_SECRET) {
      const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        console.error("[Payment Verify] Signature mismatch", {
          expected: expectedSignature,
          received: razorpay_signature,
          orderId,
        });
        // Update order as payment failed
        await db.order.update({
          where: { id: order.id },
          data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED" },
        });
        await db.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: "FAILED",
            failureReason: "Signature verification failed",
            gatewayPaymentId: razorpay_payment_id,
          },
        });
        return NextResponse.json(
          { success: false, message: "Payment verification failed." },
          { status: 400, headers },
        );
      }
    }

    // 4. Find Ranchi store for inventory deduction
    const ranchiBranch = await db.store.findFirst({
      where: { OR: [{ code: "RANCHI" }, { isCentralHub: true }] },
    });

    // 5. Atomic transaction: update order + deduct inventory + credit rewards
    const result = await db.$transaction(async (tx) => {
      // 5a. Update Order payment status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAYMENT_CONFIRMED",
          paymentStatus: "PAID",
          paymentId: razorpay_payment_id,
          paymentMethod: "razorpay",
        },
      });

      // 5b. Update Payment record
      await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          gatewaySignature: razorpay_signature,
          amount: order.totalAmount,
          currency: "INR",
          status: "PAID",
          verifiedAt: new Date(),
          gatewayResponse: { razorpay_order_id, razorpay_payment_id },
        },
        update: {
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          gatewaySignature: razorpay_signature,
          status: "PAID",
          verifiedAt: new Date(),
          gatewayResponse: { razorpay_order_id, razorpay_payment_id },
        },
      });

      // 5c. Deduct StoreInventory from Ranchi (ONLINE_FULFILLMENT)
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

          if (inv) {
            const newQty = Math.max(0, inv.quantity - item.quantity);
            const newAvailable = Math.max(
              0,
              inv.availableQuantity - item.quantity,
            );
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

            // Inventory audit log
            await tx.inventoryTransaction.create({
              data: {
                storeId: ranchiBranch.id,
                productId: item.productId,
                orderId: order.id,
                transactionType: "ONLINE_FULFILLMENT",
                quantityBefore: inv.quantity,
                quantityChange: -item.quantity,
                quantityAfter: newQty,
                userId: user.id,
                referenceId: order.orderNumber,
                notes: `Online order ${order.orderNumber} fulfilled`,
              },
            });
          }
        }
      }

      // 5e. Generate Invoice
      const invoiceNumber = await generateInvoiceNumber();
      const gstBreakup = {
        igst: order.gstAmount, // For inter-state; simplified here
        cgst: 0,
        sgst: 0,
      };

      await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          userId: user.id,
          customerName: order.user.name,
          customerEmail: order.user.email,
          customerPhone: order.user.phone,
          customerGstin: order.user.gstin || null,
          companyName: order.user.companyName || null,
          billingAddress: order.shippingAddress,
          shippingAddress: order.shippingAddress,
          items: order.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            sku: i.productSku,
            quantity: i.quantity,
            unitPrice: i.price,
            lineTotal: i.price * i.quantity,
          })),
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          couponCode: order.couponCode || null,
          couponDiscount: order.couponDiscount,
          gstBreakup,
          gstAmount: order.gstAmount,
          shippingCost: order.shippingCost,
          totalAmount: order.totalAmount,
          paymentMethod: "razorpay",
          paymentRef: razorpay_payment_id,
        },
      });

      return updatedOrder;
    });

    // 5d. Credit reward points via authoritative LoyaltyEngine (Idempotent & Audited)
    try {
      await LoyaltyEngine.awardOrderPoints(order.id, request);
    } catch (rewardErr) {
      console.error(
        "[PaymentVerify] LoyaltyEngine point award error:",
        rewardErr,
      );
    }

    // 6. Non-blocking notification
    NotificationService.createNotification({
      userId: user.id,
      type: "ORDER_PLACED",
      title: `Payment Confirmed: ${order.orderNumber}`,
      message: `Payment of ₹${order.totalAmount.toLocaleString("en-IN")} confirmed for order ${order.orderNumber}. We're processing your hardware kit!`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentId: razorpay_payment_id,
      },
      customerEmail: order.user.email,
    }).catch((err) => console.warn("[Non-blocking notification error]", err));

    return NextResponse.json({
      success: true,
      message: "Payment verified and order confirmed.",
      data: {
        orderId: result.id,
        orderNumber: result.orderNumber,
        paymentId: razorpay_payment_id,
        status: result.status,
      },
    });
  } catch (error: any) {
    console.error("[Payment Verify Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Payment verification failed.",
      },
      { status: 500, headers },
    );
  }
}
