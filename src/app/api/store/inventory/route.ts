import { NextResponse } from 'next/server';
import { getAuthenticatedStaff, hasStoreAccess } from '@/lib/staffAuth';
import { PRODUCTS } from '@/data/mockData';
import { getSecurityHeaders } from '@/lib/security';

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

  const activeStoreCode = staff.role === 'STORE_MANAGER' ? (staff.storeCode || 'RANCHI') : targetStore;

  // Generate localized inventory quantities based on store
  const storeStockMultipliers: Record<string, number> = {
    RANCHI: 1.0,
    PATNA: 0.6,
    DELHI: 0.8,
    MUMBAI: 0.0,
  };

  const mult = storeStockMultipliers[activeStoreCode?.toUpperCase() || 'RANCHI'] ?? 0.5;

  const storeInventory = PRODUCTS.map((p: any) => {
    const rawStock = typeof p.stock === 'number' ? p.stock : (p.inStock ? 35 : 0);
    const localStock = Math.floor(rawStock * mult);
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      storeCode: activeStoreCode,
      localStock,
      status: localStock > 10 ? 'Optimal' : localStock > 0 ? 'Low Stock' : 'Out of Stock',
      reorderThreshold: 10,
    };
  });

  return NextResponse.json({
    success: true,
    store: activeStoreCode,
    data: {
      items: storeInventory,
      totalUnits: storeInventory.reduce((acc, curr) => acc + curr.localStock, 0),
      lowStockCount: storeInventory.filter(i => i.status === 'Low Stock').length,
      outOfStockCount: storeInventory.filter(i => i.status === 'Out of Stock').length,
    },
  }, { headers });
}
