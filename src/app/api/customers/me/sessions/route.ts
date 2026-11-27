import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { UserDB } from "@/lib/userDB";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getSecurityHeaders } from "@/lib/security";

export async function GET() {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401, headers },
    );
  }

  let sessions: any[] = [];

  if (isDatabaseAvailable()) {
    try {
      sessions = await db.customerSession.findMany({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          deviceInfo: true,
          createdAt: true,
          expiresAt: true,
          lastUsedAt: true,
        },
      });
    } catch (_) {}
  }

  if (sessions.length === 0) {
    sessions = UserDB.getSessions(user.id);
  }

  return NextResponse.json({ success: true, sessions }, { headers });
}

export async function DELETE() {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401, headers },
    );
  }

  UserDB.revokeAllSessions(user.id);

  if (isDatabaseAvailable()) {
    try {
      await db.customerSession.deleteMany({
        where: { userId: user.id },
      });
    } catch (_) {}
  }

  return NextResponse.json(
    { success: true, message: "All sessions revoked successfully." },
    { headers },
  );
}
