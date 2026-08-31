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
 * GET /api/notifications
 * Returns paginated notifications belonging strictly to the authenticated customer.
 */
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

  if (process.env.DATABASE_URL) {
    try {
      const total = await db.notification.count({ where: { userId: user.id } });
      const totalPages = Math.ceil(total / limit) || 1;

      const items = await db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return NextResponse.json({
        success: true,
        data: {
          items,
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to fetch notifications.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      items: [],
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
    },
    source: 'mock',
  });
}
