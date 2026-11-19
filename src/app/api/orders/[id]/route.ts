import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

/**
 * GET /api/orders/[id]
 * Fetch single order detail with strict Customer Isolation
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
        message: "Order not found.",
      },
      { status: 404 },
    );
  }

  try {
    // Query order either by primary key UUID or public orderNumber
    const order = await db.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
        shipment: true,
        payment: true,
        invoice: true,
        reviews: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    // STRICT CUSTOMER ISOLATION REQUIREMENT:
    // Verify user authorization: if order belongs to another customer, deny access (404)
    const isAuthorized =
      order.userId === user.id ||
      Boolean(
        order.user?.email &&
          user.email &&
          order.user.email.toLowerCase().trim() === user.email.toLowerCase().trim(),
      );

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch order details.",
      },
      { status: 500 },
    );
  }
}
