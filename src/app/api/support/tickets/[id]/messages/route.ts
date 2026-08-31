import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { AuthSessionUser } from '@/lib/authUtils';
import { TicketStatus } from '@prisma/client';

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('prayog_customer_session');
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * POST /api/support/tickets/[id]/messages
 * Add customer message reply to an existing support ticket thread.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const resolvedParams = await params;
  const ticketId = resolvedParams.id;

  if (!ticketId) {
    return NextResponse.json({ success: false, message: 'Ticket ID is required.' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { text, message } = body;
    const messageContent = typeof text === 'string' ? text : message;

    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length < 1) {
      return NextResponse.json({ success: false, message: 'Message content cannot be empty.' }, { status: 400 });
    }

    if (messageContent.length > 5000) {
      return NextResponse.json({ success: false, message: 'Message payload is too large (maximum 5000 characters).' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      // 1. Verify Ticket Exists & Customer Ownership
      const ticket = await db.supportTicket.findFirst({
        where: {
          OR: [
            { id: ticketId },
            { ticketNumber: ticketId },
          ],
        },
      });

      if (!ticket) {
        return NextResponse.json({ success: false, message: 'Support ticket not found.' }, { status: 404 });
      }

      if (ticket.userId !== user.id) {
        return NextResponse.json({ success: false, message: 'Support ticket not found.' }, { status: 404 });
      }

      if (ticket.status === TicketStatus.CLOSED) {
        return NextResponse.json({ success: false, message: 'Cannot send messages to a closed support ticket.' }, { status: 422 });
      }

      // 2. Add Customer Message and update ticket status if needed
      const newMessage = await db.supportMessage.create({
        data: {
          ticketId: ticket.id,
          sender: 'Customer',
          text: messageContent.trim(),
        },
      });

      if (ticket.status === TicketStatus.WAITING_FOR_CUSTOMER || ticket.status === TicketStatus.RESOLVED) {
        await db.supportTicket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.IN_PROGRESS },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Message added to support ticket.',
        data: newMessage,
      });
    }

    // Mock Mode Response
    return NextResponse.json({
      success: true,
      message: 'Message added (Mock Mode).',
      data: {
        id: `msg-mock-${Date.now()}`,
        ticketId,
        sender: 'Customer',
        text: messageContent.trim(),
        createdAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add message.' },
      { status: 500 }
    );
  }
}
