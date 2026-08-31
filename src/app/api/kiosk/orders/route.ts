import { NextResponse } from 'next/server';
import { getAuthenticatedStaff, hasRequiredRole } from '@/lib/staffAuth';
import { getSecurityHeaders } from '@/lib/security';

// POST /api/kiosk/orders - Place Walk-in Kiosk Order
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || !hasRequiredRole(staff, 'KIOSK_USER', 'SUPER_ADMIN', 'STORE_MANAGER')) {
    return NextResponse.json(
      { success: false, message: 'Forbidden. Kiosk credentials required to create kiosk orders.' },
      { status: 403, headers }
    );
  }

  try {
    const body = await request.json();
    const { customerName, customerPhone, items, paymentMethod = 'UPI_QR', totalAmount } = body;

    if (!customerPhone || !items || !items.length) {
      return NextResponse.json(
        { success: false, message: 'Customer phone number and at least 1 item are required.' },
        { status: 400, headers }
      );
    }

    // Auto-inject store info from authenticated session
    const storeCode = staff.storeCode || 'RANCHI';
    const orderNumber = `KSK-${storeCode}-${Date.now().toString().slice(-6)}`;

    const kioskOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      storeCode,
      storeId: staff.storeId,
      kioskUser: staff.username,
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      items,
      totalAmount: totalAmount || items.reduce((sum: number, it: any) => sum + (it.price * (it.quantity || 1)), 0),
      paymentMethod,
      paymentStatus: 'PAID',
      fulfillmentStatus: 'STORE_PICKUP_READY',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Kiosk order ${orderNumber} generated successfully.`,
      order: kioskOrder,
    }, { headers });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to place kiosk order.' },
      { status: 500, headers }
    );
  }
}
