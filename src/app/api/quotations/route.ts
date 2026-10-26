import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/quotations — List all quotations for the currently logged in customer
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401, headers },
    );
  }

  if (isDatabaseAvailable()) {
    try {
      const quotations = await db.quotation.findMany({
        where: {
          OR: [
            { userId: user.id },
            { customerEmail: user.email.toLowerCase() },
          ],
        },
        include: {
          store: { select: { id: true, name: true, code: true, city: true } },
          items: true,
          order: { select: { id: true, orderNumber: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { success: true, data: quotations },
        { headers },
      );
    } catch (error: any) {
      console.warn("Database quotation query unavailable, fallback to empty list:", error?.message);
      return NextResponse.json(
        { success: true, data: [] },
        { headers },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] }, { headers });
}
