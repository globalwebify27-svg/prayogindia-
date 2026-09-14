import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@prisma/client";
import { recordAuditLog } from "@/lib/auditLogger";
import { LoyaltyEngine } from "@/lib/loyaltyEngine";

// PATCH /api/admin/orders/[id] - Update Order Status & Courier Tracking Assignment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  try {
    const body = await request.json();
    const { status, courierName, trackingNumber, trackingUrl } = body;

    if (process.env.DATABASE_URL) {
      const existingOrder = await db.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      const updateData: any = {};
      if (
        status &&
        Object.values(OrderStatus).includes(status as OrderStatus)
      ) {
        updateData.status = status as OrderStatus;
      }

      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // Upsert Shipment Info if Courier Details Provided
      if (courierName && trackingNumber) {
        await db.shipment.upsert({
          where: { orderId },
          create: {
            orderId,
            courierName,
            trackingNumber,
            trackingUrl: trackingUrl || null,
            status: "In Transit",
          },
          update: {
            courierName,
            trackingNumber,
            trackingUrl: trackingUrl || null,
            status: "In Transit",
          },
        });
      }

      // Record Audit Log for Order Updates / Status Change
      await recordAuditLog({
        actionCategory: "ORDER_FULFILLMENT",
        action: status && existingOrder?.status !== status ? `ORDER_STATUS_${status}` : "ORDER_SHIPMENT_UPDATE",
        entityType: "Order",
        entityId: orderId,
        description: status && existingOrder?.status !== status
          ? `Order #${updatedOrder.orderNumber || orderId.slice(0, 8)} status changed from ${existingOrder?.status} to ${status}`
          : `Order #${updatedOrder.orderNumber || orderId.slice(0, 8)} shipping details updated (${courierName} #${trackingNumber})`,
        actor: admin,
        storeId: null,
        previousValue: {
          status: existingOrder?.status,
          totalAmount: existingOrder?.totalAmount,
        },
        newValue: {
          status: updatedOrder.status,
          courierName: courierName || null,
          trackingNumber: trackingNumber || null,
        },
        metadata: {
          orderNumber: updatedOrder.orderNumber,
          customerName: existingOrder?.user?.name,
          customerPhone: existingOrder?.user?.phone,
        },
        req: request,
      });

      // Loyalty Engine Lifecycle Hooks: Award on Delivered, Reverse on Cancelled / Refunded
      if (status && existingOrder?.status !== status) {
        if (status === "CANCELLED" || status === "REFUNDED") {
          try {
            await LoyaltyEngine.reverseOrderPoints(orderId, `Admin status changed to ${status}`, admin, request);
          } catch (loyaltyErr) {
            console.error("[AdminOrderPatch] Loyalty reversal error:", loyaltyErr);
          }
        } else if (status === "DELIVERED" && updatedOrder.paymentStatus === "PAID") {
          try {
            await LoyaltyEngine.awardOrderPoints(orderId, request);
          } catch (loyaltyErr) {
            console.error("[AdminOrderPatch] Loyalty award error:", loyaltyErr);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Order updated successfully.",
        data: updatedOrder,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated (Mock Mode).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
