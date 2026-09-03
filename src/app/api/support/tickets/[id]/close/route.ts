import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { TicketStatus } from "@prisma/client";

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * POST /api/support/tickets/[id]/close
 * Controlled customer action allowing ticket owner to close their open ticket.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
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
      });

      if (!ticket) {
        return NextResponse.json(
          { success: false, message: "Support ticket not found." },
          { status: 404 },
        );
      }

      // Customer Isolation Check
      if (ticket.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Support ticket not found." },
          { status: 404 },
        );
      }

      const updatedTicket = await db.supportTicket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.CLOSED },
      });

      return NextResponse.json({
        success: true,
        message: "Support ticket closed successfully.",
        data: updatedTicket,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Failed to close support ticket.",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    success: true,
    message: "Support ticket closed (Mock Mode).",
  });
}
