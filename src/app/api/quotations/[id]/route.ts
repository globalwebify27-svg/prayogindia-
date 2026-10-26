import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/quotations/[id] — Customer views a specific quotation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();
  const { id } = await params;

  if (isDatabaseAvailable()) {
    try {
      const quotation = await db.quotation.findUnique({
        where: { id },
        include: {
          store: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  sku: true,
                  mrp: true,
                },
              },
            },
          },
          revisions: {
            orderBy: { revisionNumber: "desc" },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
            },
          },
        },
      });

      if (!quotation) {
        return NextResponse.json(
          { success: false, message: "Quotation not found" },
          { status: 404, headers },
        );
      }

      // Security: if user is logged in, ensure customer matches
      if (user) {
        const isOwner =
          quotation.userId === user.id ||
          quotation.customerEmail.toLowerCase() === user.email.toLowerCase();
        if (!isOwner) {
          return NextResponse.json(
            { success: false, message: "Forbidden" },
            { status: 403, headers },
          );
        }
      }

      // If status is SENT, update to VIEWED when opened by customer
      if (quotation.status === "SENT") {
        await db.quotation.update({
          where: { id },
          data: { status: "VIEWED" },
        });
        quotation.status = "VIEWED";
      }

      return NextResponse.json({ success: true, data: quotation }, { headers });
    } catch (error: any) {
      console.warn("Quotation fetch error:", error?.message);
      return NextResponse.json(
        { success: false, message: "Quotation details could not be loaded at this time." },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "Quotation details could not be loaded at this time." },
    { status: 503, headers },
  );
}
