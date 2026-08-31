import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedStaff, hasStoreAccess } from '@/lib/staffAuth';
import { MOCK_CUSTOMER_ORDERS } from '@/data/accountData';
import { getSecurityHeaders } from '@/lib/security';

// GET /api/store/orders - Store-scoped Orders Endpoint
// SUPER_ADMIN can see any store's orders
// STORE_MANAGER can ONLY see their assigned store's orders
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== 'STORE_MANAGER' && staff.role !== 'SUPER_ADMIN')) {
    return NextResponse.json(
      { success: false, message: 'Forbidden. Store Manager or Admin access required.' },
      { status: 403, headers }
    );
  }

  const { searchParams } = new URL(request.url);
  const requestedStore = searchParams.get('storeId') || staff.storeCode || staff.storeId;

  // Enforce Backend Store Authorization Check
  if (staff.role === 'STORE_MANAGER' && !hasStoreAccess(staff, requestedStore)) {
    return NextResponse.json(
      { success: false, message: 'Forbidden: You do not have permission to view data from other stores.' },
      { status: 403, headers }
    );
  }

  const activeStoreCode = staff.role === 'STORE_MANAGER' ? (staff.storeCode || 'RANCHI') : requestedStore;

  // Filter orders by store prefix or identifier
  const filtered = MOCK_CUSTOMER_ORDERS.map((order, idx) => ({
    ...order,
    id: `ORD-${activeStoreCode}-${1000 + idx}`,
    storeCode: activeStoreCode,
    storeLocation: activeStoreCode === 'PATNA' ? 'Patna STEM Branch' : activeStoreCode === 'DELHI' ? 'Delhi NCR Hub' : 'Ranchi Central Branch',
  }));

  return NextResponse.json({
    success: true,
    store: activeStoreCode,
    data: {
      items: filtered,
      total: filtered.length,
    },
  }, { headers });
}
