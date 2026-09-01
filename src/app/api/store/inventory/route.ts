import { NextResponse } from 'next/server';
import { getAuthenticatedStaff, hasStoreAccess } from '@/lib/staffAuth';
import { PRODUCTS } from '@/data/mockData';
import { getSecurityHeaders } from '@/lib/security';
import { getProductStockForStore } from '@/lib/inventoryEngine';
import { StoreId } from '@/data/storeConfig';

// GET /api/store/inventory - Store-scoped Inventory Data
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
  const targetStore = searchParams.get('storeId') || staff.storeCode || staff.storeId;

  // Enforce server-side store authorization
  if (staff.role === 'STORE_MANAGER' && !hasStoreAccess(staff, targetStore)) {
    return NextResponse.json(
      { success: false, message: 'Forbidden: Store Manager cannot access other stores inventory.' },
      { status: 403, headers }
    );
  }

  const rawStore = staff.role === 'STORE_MANAGER' ? (staff.storeCode || 'RANCHI') : (targetStore || 'RANCHI');
  const activeStoreCode = (rawStore ? rawStore.toLowerCase() : 'ranchi') as StoreId;
  const isCentral = activeStoreCode === 'ranchi';

  const storeInventory = PRODUCTS.map((p: any) => {
    const localStock = getProductStockForStore(p.id, activeStoreCode);
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      storeCode: activeStoreCode.toUpperCase(),
      isCentralInventory: isCentral,
      localStock,
      status: localStock > 10 ? 'Optimal' : localStock > 0 ? 'Low Stock' : 'Out of Stock',
      reorderThreshold: 10,
    };
  });

  return NextResponse.json({
    success: true,
    store: activeStoreCode.toUpperCase(),
    isCentralInventory: isCentral,
    data: {
      items: storeInventory,
      totalUnits: storeInventory.reduce((acc, curr) => acc + curr.localStock, 0),
      lowStockCount: storeInventory.filter(i => i.status === 'Low Stock').length,
      outOfStockCount: storeInventory.filter(i => i.status === 'Out of Stock').length,
    },
  }, { headers });
}
