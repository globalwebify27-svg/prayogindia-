import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { AuthSessionUser } from '@/lib/authUtils';
import { TicketCategory, TicketStatus } from '@prisma/client';

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

function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${year}-${randomDigits}`;
}

/**
 * POST /api/support/tickets
 * Transactionally creates SupportTicket + initial SupportMessage for authenticated customer.
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { subject, category = 'TECHNICAL_SUPPORT', message } = body;

    // 1. Validation
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json({ success: false, message: 'Ticket subject title is required (at least 3 characters).' }, { status: 400 });
    }

    if (subject.length > 200) {
      return NextResponse.json({ success: false, message: 'Subject title is too long (max 200 characters).' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ success: false, message: 'Ticket message details are required (at least 5 characters).' }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ success: false, message: 'Message payload is too large (maximum 5000 characters).' }, { status: 400 });
    }

    // Map string category to Prisma TicketCategory enum
    let enumCategory: TicketCategory = TicketCategory.TECHNICAL_SUPPORT;
    const catUpper = String(category).toUpperCase().replace(/\s+/g, '_');
    if (Object.values(TicketCategory).includes(catUpper as TicketCategory)) {
      enumCategory = catUpper as TicketCategory;
    }

    const ticketNumberStr = generateTicketNumber();

    if (process.env.DATABASE_URL) {
      // Transaction: SupportTicket + SupportMessage created atomically
      const newTicket = await db.$transaction(async (tx) => {
        const tkt = await tx.supportTicket.create({
          data: {
            ticketNumber: ticketNumberStr,
            userId: user.id,
            subject: subject.trim(),
            category: enumCategory,
            status: TicketStatus.OPEN,
            messages: {
              create: {
                sender: 'Customer',
                text: message.trim(),
              },
            },
          },
          include: {
            messages: true,
          },
        });
        return tkt;
      });

      return NextResponse.json({
        success: true,
        message: 'Support ticket created successfully.',
        data: newTicket,
      });
    }

    // Mock Mode Response
    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully (Mock Mode).',
      data: {
        id: `tkt-mock-${Date.now()}`,
        ticketNumber: ticketNumberStr,
        subject: subject.trim(),
        category: enumCategory,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: `msg-1`,
            sender: 'Customer',
            text: message.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create support ticket.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/support/tickets
 * Paginated list of support tickets belonging to authenticated customer only.
 */
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const statusParam = searchParams.get('status');

  if (process.env.DATABASE_URL) {
    try {
      const whereClause: any = { userId: user.id };
      if (statusParam && Object.values(TicketStatus).includes(statusParam.toUpperCase() as TicketStatus)) {
        whereClause.status = statusParam.toUpperCase() as TicketStatus;
      }

      const total = await db.supportTicket.count({ where: whereClause });
      const totalPages = Math.ceil(total / limit) || 1;

      const tickets = await db.supportTicket.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          items: tickets,
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to fetch support tickets.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      items: [],
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
    },
    source: 'mock',
  });
}
