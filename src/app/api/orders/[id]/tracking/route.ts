import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

/**
 * GET /api/orders/[id]/tracking
 * Customer-facing Tracking Retrieval with Customer Isolation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required." },
      { status: 400 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "Tracking details not found.",
      },
      { status: 404 },
    );
  }

  try {
    const order = await db.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    // Customer Isolation Check
    if (order.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    if (!order.shipment) {
      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          hasShipment: false,
          message:
            "Shipment has not been dispatched yet. Live courier tracking will appear here once packed and handed to courier.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        hasShipment: true,
        courierName: order.shipment.courierName,
        courierCode: order.shipment.courierCode,
        trackingNumber: order.shipment.trackingNumber,
        trackingUrl: order.shipment.trackingUrl,
        labelUrl: order.shipment.labelUrl,
        shipmentStatus: order.shipment.status,
        estimatedDelivery: order.shipment.estimatedDelivery,
        weightKg: order.shipment.weightKg,
        trackingEvents: order.shipment.trackingEvents || [],
        lastTrackingUpdate: order.shipment.lastTrackingUpdate,
        shippedAt: order.shipment.shippedAt,
        deliveredAt: order.shipment.deliveredAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch tracking details.",
      },
      { status: 500 },
    );
  }
}
