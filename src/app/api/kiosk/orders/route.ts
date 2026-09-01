import { NextResponse } from 'next/server';
import { getAuthenticatedStaff, hasRequiredRole } from '@/lib/staffAuth';
import { getSecurityHeaders } from '@/lib/security';
import { deductStoreInventory } from '@/lib/inventoryEngine';
import { StoreId } from '@/data/storeConfig';

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
    const { 
      customerName, 
      customerPhone, 
      items, 
      paymentMethod = 'UPI', 
      paymentSplit = null,
      totalAmount,
      isB2B = false,
      b2bDetails = null,
    } = body;

    const computedTotal = totalAmount || items.reduce((sum: number, it: any) => sum + (it.price * (it.quantity || 1)), 0);

    if (paymentMethod === 'SPLIT_PAYMENT') {
      if (!paymentSplit || typeof paymentSplit !== 'object') {
        return NextResponse.json(
          { success: false, message: 'Payment breakdown is required for Split Payment.' },
          { status: 400, headers }
        );
      }

      const splitSum = 
        (parseFloat(paymentSplit.cash) || 0) + 
        (parseFloat(paymentSplit.upi) || 0) + 
        (parseFloat(paymentSplit.card) || 0) + 
        (parseFloat(paymentSplit.bankTransfer) || 0);

      if (Math.abs(splitSum - computedTotal) > 0.01) {
        return NextResponse.json(
          { success: false, message: `Split payment total (₹${splitSum}) must equal order total (₹${computedTotal}).` },
          { status: 400, headers }
        );
      }
    }

    // Auto-inject store info and device assignment from authenticated tablet session
    const storeCode = staff.storeCode || 'RANCHI';
    const deviceId = staff.deviceId || `TAB-${storeCode}-01`;
    const deviceLabel = staff.deviceLabel || `${storeCode} Store Shopping Tablet`;
    const orderNumber = `KSK-${storeCode}-${Date.now().toString().slice(-6)}`;

    // Format payment components breakdown
    const paymentComponents = paymentMethod === 'SPLIT_PAYMENT' ? [
      { method: 'CASH', amount: parseFloat(paymentSplit.cash) || 0 },
      { method: 'UPI', amount: parseFloat(paymentSplit.upi) || 0 },
      { method: 'CARD', amount: parseFloat(paymentSplit.card) || 0 },
      { method: 'BANK_TRANSFER', amount: parseFloat(paymentSplit.bankTransfer) || 0 },
    ].filter(c => c.amount > 0) : [
      { method: paymentMethod, amount: computedTotal }
    ];

    const salesExecutive = staff.name || staff.username || 'Store Staff';
    const subtotal = items.reduce((acc: number, it: any) => acc + ((it.price / 1.18) * (it.quantity || 1)), 0);
    const gstAmount = computedTotal - subtotal;
    const discount = items.reduce((acc: number, it: any) => {
      const mrp = it.mrp || it.price;
      return acc + (Math.max(0, mrp - it.price) * (it.quantity || 1));
    }, 0);

    const kioskOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      invoiceNumber: orderNumber,
      orderSource: 'WALK-IN',
      date: new Date().toISOString(),
      store: storeCode,
      storeCode,
      storeName: staff.storeName || `${storeCode} Store Branch`,
      storeId: staff.storeId,
      deviceId,
      deviceLabel,
      salesExecutive,
      kioskUser: staff.username,
      customerName: customerName || (isB2B ? b2bDetails?.companyName : 'Walk-in Customer'),
      customerPhone,
      isB2B: Boolean(isB2B),
      b2bDetails: isB2B ? {
        companyName: b2bDetails.companyName,
        gstin: b2bDetails.gstin,
        companyAddress: b2bDetails.companyAddress,
        contactPerson: b2bDetails.contactPerson || customerName || '',
        email: b2bDetails.email || '',
      } : null,
      items: items.map((it: any) => ({
        id: it.id,
        name: it.name,
        sku: it.sku,
        quantity: it.quantity || 1,
        price: it.price,
        mrp: it.mrp || it.price,
        discount: Math.max(0, (it.mrp || it.price) - it.price),
        gstRate: 18,
        total: it.price * (it.quantity || 1),
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalAmount: computedTotal,
      paymentMethod,
      paymentComponents,
      paymentStatus: 'PAID',
      fulfillmentStatus: 'DELIVERED',
    };

    // Deduct inventory from the corresponding physical store (Ranchi walk-in -> Ranchi Central, Patna walk-in -> Patna only, etc.)
    const targetStoreId = (storeCode.toLowerCase() as StoreId) || 'ranchi';
    items.forEach((it: any) => {
      deductStoreInventory({
        productId: it.id,
        quantity: it.quantity || 1,
        orderSource: 'WALK_IN',
        storeId: targetStoreId,
      });
    });

    return NextResponse.json({
      success: true,
      order: kioskOrder,
      inventoryDeductedFrom: targetStoreId.toUpperCase(),
      message: `Walk-in order created successfully. Inventory deducted from ${targetStoreId.toUpperCase()} stock.`,
    }, { headers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500, headers }
    );
  }
}
