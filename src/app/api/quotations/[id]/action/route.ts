import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

// POST /api/quotations/[id]/action — Customer accepts, rejects, or requests changes on quotation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();
  const { id } = await params;

  try {
    const body = await request.json();
    const { action, feedback } = body; // action: 'ACCEPT' | 'REJECT' | 'REQUEST_CHANGES'

    if (!["ACCEPT", "REJECT", "REQUEST_CHANGES"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Choose ACCEPT, REJECT, or REQUEST_CHANGES.",
        },
        { status: 400, headers },
      );
    }

    if (process.env.DATABASE_URL) {
      const quote = await db.quotation.findUnique({
        where: { id },
        include: {
          revisions: { orderBy: { revisionNumber: "desc" }, take: 1 },
        },
      });

      if (!quote) {
        return NextResponse.json(
          { success: false, message: "Quotation not found" },
          { status: 404, headers },
        );
      }

      // Security check if logged in
      if (user) {
        const isOwner =
          quote.userId === user.id ||
          quote.customerEmail.toLowerCase() === user.email.toLowerCase();
        if (!isOwner) {
          return NextResponse.json(
            { success: false, message: "Forbidden" },
            { status: 403, headers },
          );
        }
      }

      if (quote.status === "CONVERTED") {
        return NextResponse.json(
          {
            success: false,
            message: "This quotation has already been converted to an order.",
          },
          { status: 400, headers },
        );
      }

      if (quote.status === "CANCELLED") {
        return NextResponse.json(
          { success: false, message: "This quotation has been cancelled." },
          { status: 400, headers },
        );
      }

      let newStatus: "ACCEPTED" | "REJECTED" | "NEGOTIATION" = "ACCEPTED";
      let changeNote = "";

      if (action === "ACCEPT") {
        newStatus = "ACCEPTED";
        changeNote = "Customer formally accepted the quotation.";
      } else if (action === "REJECT") {
        newStatus = "REJECTED";
        changeNote = `Customer rejected quotation.${feedback ? ` Reason: ${feedback}` : ""}`;
      } else if (action === "REQUEST_CHANGES") {
        newStatus = "NEGOTIATION";
        changeNote = `Customer requested changes: ${feedback || "Pricing/quantity revision requested."}`;
      }

      const nextRevNum = (quote.revisions[0]?.revisionNumber || 1) + 1;

      const updated = await db.quotation.update({
        where: { id },
        data: {
          status: newStatus,
          customerFeedback: feedback || quote.customerFeedback,
          revisions: {
            create: {
              revisionNumber: nextRevNum,
              snapshotJson: JSON.stringify({ status: newStatus, feedback }),
              changedByRole: "CUSTOMER",
              changeNotes: changeNote,
            },
          },
        },
        include: { items: true, store: true },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Quotation status updated to ${newStatus}.`,
          data: updated,
        },
        { headers },
      );
    }

    return NextResponse.json(
      { success: true, message: `Quotation updated (Mock Mode).` },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
