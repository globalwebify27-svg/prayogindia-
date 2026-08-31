import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthSessionUser } from '@/lib/authUtils';
import { NotificationService } from '@/lib/notifications';

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
 * PATCH /api/notifications/read-all
 * Marks all notifications for authenticated customer as read.
 */
export async function PATCH() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  await NotificationService.markAllAsRead(user.id);

  return NextResponse.json({
    success: true,
    message: 'All notifications marked as read.',
  });
}
