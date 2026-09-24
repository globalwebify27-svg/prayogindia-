import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { NotificationService } from "@/lib/notifications";

/**
 * GET /api/notifications/unread-count
 * Returns unread notifications count for authenticated customer only.
 */
export async function GET() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  const unreadCount = await NotificationService.getUnreadCount(user.id);

  return NextResponse.json({
    success: true,
    data: {
      unreadCount,
    },
  });
}
