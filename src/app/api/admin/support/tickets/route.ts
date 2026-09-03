import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// GET /api/admin/support/tickets - List Support Tickets for Admin Desk
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (status && status !== "all") where.status = status;

      const tickets = await db.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          messages: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json({ success: true, data: tickets });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
