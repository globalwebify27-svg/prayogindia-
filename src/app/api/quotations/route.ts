import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";
import { getStoredQuotations } from "@/data/quotationsStore";

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

  let dbQuotations: any[] = [];

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

      dbQuotations = quotations;
    } catch (error: any) {
      console.warn("Database quotation query unavailable, fallback to empty list:", error?.message);
    }
  }

  const userEmail = (user.email || "").toLowerCase();
  const userPhone = user.phone ? user.phone.replace(/\D/g, "").slice(-10) : "";

  // Merge stored quotations for this customer
  const stored = getStoredQuotations().filter((q) => {
    if (q.userId && q.userId === user.id) return true;
    if (q.customerEmail && q.customerEmail.toLowerCase() === userEmail) return true;
    if (userPhone && q.customerPhone && q.customerPhone.replace(/\D/g, "").slice(-10) === userPhone) return true;
    return false;
  });

  const dbIds = new Set(dbQuotations.map((q) => q.id));
  const merged = [...dbQuotations, ...stored.filter((q) => !dbIds.has(q.id))];

  return NextResponse.json({ success: true, data: merged }, { headers });
}
