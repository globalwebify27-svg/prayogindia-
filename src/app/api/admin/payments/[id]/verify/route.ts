import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getSecurityHeaders } from "@/lib/security";
import { NotificationService } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/auditLogger";
import { LoyaltyEngine } from "@/lib/loyaltyEngine";

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

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count();
  const seq = String(count + 1).padStart(5, "0");
  return `INV-${year}-${seq}`;
}

/**
 * POST /api/admin/payments/[id]/verify
 * Authoritative admin approval for NEFT/RTGS/Wire bank payments.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getSecurityHeaders();
  const staff = await getAdminOrStaff();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Only Super Admin, Regional Managers, and Store Managers can verify payments." },
      { status: 403, headers }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const adminRemarks = body.remarks?.trim() || "Bank transfer credit verified in Prayog India SBI Account.";

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully (Mock Mode).",
        data: { paymentId: id, status: "PAID", verifiedBy: staff.name },
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
            items: { include: { product: true, variant: true } },
            user: true,
            invoice: true,
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
          message: `Payment is already verified and marked as PAID on ${payment.verifiedAt?.toLocaleDateString() || "earlier date"}.`,
        },
        { status: 400, headers }
      );
    }

    const order = payment.order;
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Associated order record not found." },
        { status: 404, headers }
      );
    }

    // Atomic Database Transaction
    const verificationResult = await db.$transaction(async (tx) => {
      // 1. Update Payment Status to PAID / VERIFIED
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          verifiedAt: new Date(),
          verifiedByStaffId: staff.id,
          verifiedByStaffName: staff.name,
          adminRemarks: adminRemarks,
          failureReason: null,
          rejectionReason: null,
        },
      });

      // 2. Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAYMENT_CONFIRMED",
          paymentStatus: "PAID",
        },
      });

      // 3. Generate Tax Invoice record if not already generated
      let invoiceRecord = order.invoice;
      if (!invoiceRecord) {
        const invoiceNumber = await generateInvoiceNumber();
        invoiceRecord = await tx.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
            userId: order.userId,
            customerName: order.user?.name || "Customer",
            customerEmail: order.user?.email || "customer@prayogindia.com",
            customerPhone: order.user?.phone || "+91-9999999999",
            customerGstin: order.user?.gstin || null,
            companyName: order.user?.companyName || null,
            billingAddress: order.shippingAddress,
            shippingAddress: order.shippingAddress,
            items: order.items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              productSku: i.productSku,
              quantity: i.quantity,
              unitPrice: i.price,
              total: i.price * i.quantity,
            })),
            subtotal: order.subtotal,
            discountAmount: order.discountAmount,
            couponCode: order.couponCode,
            couponDiscount: order.couponDiscount,
            gstAmount: order.gstAmount,
            shippingCost: order.shippingCost,
            totalAmount: order.totalAmount,
            paymentMethod: payment.method || "NEFT",
            paymentRef: payment.utrNumber || payment.id,
          },
        });
      }

      // 4. Deduct Physical Inventory & Log Stock Transactions (Ranchi Main Hub / Store)
      const ranchiStore = await tx.store.findFirst({
        where: { OR: [{ code: "RANCHI" }, { isCentralHub: true }] },
      });

      if (ranchiStore) {
        for (const item of order.items) {
          if (item.productId) {
            const storeInv = await tx.storeInventory.findUnique({
              where: {
                storeId_productId: {
                  storeId: ranchiStore.id,
                  productId: item.productId,
                },
              },
            });

            if (storeInv) {
              const qtyBefore = storeInv.quantity;
              const qtyAfter = Math.max(0, qtyBefore - item.quantity);
              await tx.storeInventory.update({
                where: { id: storeInv.id },
                data: {
                  quantity: qtyAfter,
                  availableQuantity: Math.max(0, qtyAfter - storeInv.reservedQuantity),
                },
              });

              await tx.inventoryTransaction.create({
                data: {
                  storeId: ranchiStore.id,
                  productId: item.productId,
                  orderId: order.id,
                  transactionType: "ONLINE_FULFILLMENT",
                  quantityBefore: qtyBefore,
                  quantityChange: -item.quantity,
                  quantityAfter: qtyAfter,
                  userId: staff.id,
                  notes: `Auto-deducted on NEFT/RTGS verification by ${staff.name} (Order #${order.orderNumber})`,
                },
              });
            }
          }
        }
      }

      return { payment: updatedPayment, order: updatedOrder, invoice: invoiceRecord };
    });

    // 5. Reward Loyalty Points Credit
    try {
      if (order.user) {
        await LoyaltyEngine.awardOrderPoints(order.id, req);
      }
    } catch (loyaltyErr) {
      console.warn("[Loyalty Credit Warning]:", loyaltyErr);
    }

    // 6. Notify Customer
    try {
      await NotificationService.createNotification({
        userId: order.userId,
        type: "ORDER_PLACED",
        title: "Payment Verified! 🎉",
        message: `Your NEFT/RTGS payment of ₹${order.totalAmount.toLocaleString("en-IN")} (UTR: ${payment.utrNumber}) has been verified. Order #${order.orderNumber} is now being processed for dispatch.`,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          invoiceNumber: verificationResult.invoice?.invoiceNumber,
          status: "PAYMENT_CONFIRMED",
        },
      });
    } catch (notifErr) {
      console.warn("[Notification Warning]:", notifErr);
    }

    // 7. Write Audit Log
    try {
      await recordAuditLog({
        actionCategory: "PAYMENT_FINANCE",
        action: "PAYMENT_VERIFIED",
        entityType: "Payment",
        entityId: payment.id,
        description: `Staff ${staff.name} (${staff.role}) approved ${payment.method} transfer UTR: ${payment.utrNumber} (₹${payment.amount}) for Order #${order.orderNumber}.`,
        actor: { id: staff.id, name: staff.name, role: staff.role, email: staff.email },
        previousValue: { status: payment.status },
        newValue: {
          status: "PAID",
          verifiedByStaffId: staff.id,
          verifiedByStaffName: staff.name,
          adminRemarks,
        },
        req,
      });
    } catch (auditErr) {
      console.warn("[AuditLog Warning]:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Payment for Order #${order.orderNumber} successfully verified and marked as PAID.`,
        data: verificationResult,
      },
      { headers }
    );
  } catch (error: any) {
    console.error("[Verify Payment Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify payment." },
      { status: 500, headers }
    );
  }
}
