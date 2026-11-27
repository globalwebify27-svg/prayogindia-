import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { UserDB } from "@/lib/userDB";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getSecurityHeaders } from "@/lib/security";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401, headers },
    );
  }

  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "Session ID is required." },
      { status: 400, headers },
    );
  }

  UserDB.revokeSession(user.id, sessionId);

  if (isDatabaseAvailable()) {
    try {
      await db.customerSession.deleteMany({
        where: { id: sessionId, userId: user.id },
      });
    } catch (_) {}
  }

  return NextResponse.json(
    { success: true, message: "Session revoked successfully." },
    { headers },
  );
}
