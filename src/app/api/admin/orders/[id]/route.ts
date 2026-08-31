import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';
import { OrderStatus } from '@prisma/client';

// PATCH /api/admin/orders/[id] - Update Order Status & Courier Tracking Assignment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  try {
    const body = await request.json();
    const { status, courierName, trackingNumber, trackingUrl } = body;

    if (process.env.DATABASE_URL) {
      const updateData: any = {};
      if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
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
            status: 'In Transit',
          },
          update: {
            courierName,
            trackingNumber,
            trackingUrl: trackingUrl || null,
            status: 'In Transit',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Order updated successfully.',
        data: updatedOrder,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated (Mock Mode).',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
