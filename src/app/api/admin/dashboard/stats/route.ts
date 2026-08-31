import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';
import { PRODUCTS } from '@/data/mockData';
import { MOCK_CUSTOMER_ORDERS, MOCK_SUPPORT_TICKETS } from '@/data/accountData';

/**
 * GET /api/admin/dashboard/stats
 * Returns live operational dashboard metrics from PostgreSQL database.
 */
export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const [
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalOrders,
        totalCustomers,
        openSupportTickets,
        recentOrders,
        recentTickets,
      ] = await Promise.all([
        db.product.count(),
        db.product.count({ where: { inStock: true } }),
        db.product.count({ where: { stock: { lte: 5 } } }),
        db.order.count(),
        db.user.count({ where: { role: 'CUSTOMER' } }),
        db.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER'] } } }),
        db.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, email: true } } },
        }),
        db.supportTicket.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, email: true } } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          metrics: {
            totalProducts,
            activeProducts,
            lowStockProducts,
            totalOrders,
            totalCustomers,
            openSupportTickets,
          },
          recentOrders,
          recentTickets,
        },
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // Fallback Mock Metrics for Development
  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        totalProducts: PRODUCTS.length,
        activeProducts: PRODUCTS.filter(p => p.inStock).length,
        lowStockProducts: PRODUCTS.filter(p => !p.inStock).length,
        totalOrders: MOCK_CUSTOMER_ORDERS.length,
        totalCustomers: 48,
        openSupportTickets: MOCK_SUPPORT_TICKETS.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length,
      },
      recentOrders: MOCK_CUSTOMER_ORDERS.slice(0, 5),
      recentTickets: MOCK_SUPPORT_TICKETS.slice(0, 5),
    },
  });
}
