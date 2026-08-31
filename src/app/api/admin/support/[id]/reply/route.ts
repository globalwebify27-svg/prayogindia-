import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';
import { TicketStatus } from '@prisma/client';
import { NotificationService } from '@/lib/notifications';

// POST /api/admin/support/[id]/reply - Post Admin Support Desk Reply
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const resolvedParams = await params;
  const ticketId = resolvedParams.id;

  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 1) {
      return NextResponse.json({ success: false, message: 'Reply message cannot be empty.' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const ticket = await db.supportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true },
      });

      if (!ticket) {
        return NextResponse.json({ success: false, message: 'Support ticket not found.' }, { status: 404 });
      }

      const reply = await db.$transaction(async (tx) => {
        const msg = await tx.supportMessage.create({
          data: {
            ticketId,
            sender: 'Support Desk',
            text: text.trim(),
          },
        });

        await tx.supportTicket.update({
          where: { id: ticketId },
          data: {
            status: TicketStatus.WAITING_FOR_CUSTOMER,
            updatedAt: new Date(),
          },
        });

        return msg;
      });

      // Trigger Notification & Email to Customer
      if (ticket.userId) {
        NotificationService.createNotification({
          userId: ticket.userId,
          type: 'SUPPORT_REPLY',
          title: `New Reply on Ticket #${ticket.ticketNumber}`,
          message: text.trim(),
          data: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber, messageSnippet: text.trim().substring(0, 100) },
          customerEmail: ticket.user?.email,
        }).catch(err => console.warn('Support reply notification failed', err));
      }

      return NextResponse.json({
        success: true,
        message: 'Admin reply posted successfully.',
        data: reply,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin reply posted (Mock Mode).',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
