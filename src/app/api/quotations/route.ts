import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

async function getCustomerSession(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// GET /api/quotations — List all quotations for the currently logged in customer
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getCustomerSession();

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401, headers });
  }

  if (process.env.DATABASE_URL) {
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

      return NextResponse.json({ success: true, data: quotations }, { headers });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
    }
  }

  return NextResponse.json({ success: true, data: [] }, { headers });
}
