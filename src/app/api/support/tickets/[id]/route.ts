import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";

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
 * GET /api/support/tickets/[id]
 * Fetch single support ticket detail + conversation messages with strict Customer Isolation.
 */
export async function GET(
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
