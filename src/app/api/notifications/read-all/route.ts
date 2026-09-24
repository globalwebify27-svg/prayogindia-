import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { NotificationService } from "@/lib/notifications";

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications for authenticated customer as read.
 */
export async function PATCH() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  await NotificationService.markAllAsRead(user.id);

  return NextResponse.json({
    success: true,
    message: "All notifications marked as read.",
  });
}
