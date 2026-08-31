import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { AuthSessionUser } from '@/lib/authUtils';

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('prayog_customer_session');
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * GET /api/orders/[id]/tracking
 * Customer-facing Tracking Retrieval with Customer Isolation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  if (!orderId) {
    return NextResponse.json({ success: false, message: 'Order ID is required.' }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      message: 'Tracking details not found.',
    }, { status: 404 });
  }

  try {
    const order = await db.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
      include: {
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    // Customer Isolation Check
    if (order.userId !== user.id) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (!order.shipment) {
      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          hasShipment: false,
          message: 'Shipment has not been dispatched yet. Live courier tracking will appear here once packed and handed to courier.',
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
        trackingNumber: order.shipment.trackingNumber,
        trackingUrl: order.shipment.trackingUrl,
        shipmentStatus: order.shipment.status,
        estimatedDelivery: order.shipment.estimatedDelivery,
        shippedAt: order.shipment.shippedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch tracking details.' },
      { status: 500 }
    );
  }
}
