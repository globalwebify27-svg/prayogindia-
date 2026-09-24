import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

/**
 * GET /api/support/tickets/[id]
 * Fetch single support ticket detail + conversation messages with strict Customer Isolation.
 */
export async function GET(
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
  const ticketId = resolvedParams.id;

  if (!ticketId) {
    return NextResponse.json(
      { success: false, message: "Ticket ID is required." },
      { status: 400 },
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const ticket = await db.supportTicket.findFirst({
        where: {
          OR: [{ id: ticketId }, { ticketNumber: ticketId }],
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json(
          { success: false, message: "Support ticket not found." },
          { status: 404 },
        );
      }

      // CUSTOMER ISOLATION CHECK
      if (ticket.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Support ticket not found." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Failed to fetch support ticket details.",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: "Support ticket not found.",
    },
    { status: 404 },
  );
}
