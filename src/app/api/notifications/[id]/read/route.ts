import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { NotificationService } from "@/lib/notifications";

/**
 * PATCH /api/notifications/[id]/read
 * Marks single notification as read with Customer Isolation check.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  const resolvedParams = await params;
  const notificationId = resolvedParams.id;

  if (!notificationId) {
    return NextResponse.json(
      { success: false, message: "Notification ID is required." },
      { status: 400 },
    );
  }

  const success = await NotificationService.markAsRead(notificationId, user.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Notification not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Notification marked as read.",
  });
}
