import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';
import { MOCK_CUSTOMER_ORDERS } from '@/data/accountData';

// GET /api/admin/orders - List All Orders for Admin Management
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (status && status !== 'all') where.status = status;

      const [items, total] = await Promise.all([
        db.order.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            items: true,
            shipment: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.order.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // Mock Fallback
  return NextResponse.json({
    success: true,
    data: {
      items: MOCK_CUSTOMER_ORDERS,
      total: MOCK_CUSTOMER_ORDERS.length,
      page: 1,
      limit,
      totalPages: 1,
    },
  });
}
