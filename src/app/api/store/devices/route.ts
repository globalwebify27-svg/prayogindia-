import { NextResponse } from 'next/server';
import { getAuthenticatedStaff, hasStoreAccess } from '@/lib/staffAuth';
import { INITIAL_STORES } from '@/data/storesData';
import { getSecurityHeaders } from '@/lib/security';

// GET /api/store/devices - Store-scoped Kiosk & Tablet Devices
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

  if (staff.role === 'STORE_MANAGER' && !hasStoreAccess(staff, targetStore)) {
    return NextResponse.json(
      { success: false, message: 'Forbidden: Cannot view devices belonging to other stores.' },
      { status: 403, headers }
    );
  }

  const activeStoreCode = (staff.role === 'STORE_MANAGER' ? staff.storeCode : targetStore)?.toUpperCase() || 'RANCHI';

  const branch = INITIAL_STORES.find(s => s.code === activeStoreCode);
  const devices = branch ? branch.authorizedDevices : [];

  return NextResponse.json({
    success: true,
    store: activeStoreCode,
    data: devices,
  }, { headers });
}
