import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { AuthSessionUser } from '@/lib/authUtils';

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
 * GET /api/service-enquiries/[id]
 * Fetch single service enquiry details with strict Customer Isolation.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const resolvedParams = await params;
  const enquiryId = resolvedParams.id;

  if (!enquiryId) {
    return NextResponse.json({ success: false, message: 'Enquiry ID is required.' }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const enquiry = await db.serviceEnquiry.findUnique({
        where: { id: enquiryId },
        include: {
          service: true,
        },
      });

      if (!enquiry) {
        return NextResponse.json({ success: false, message: 'Service enquiry not found.' }, { status: 404 });
      }

      // CUSTOMER ISOLATION CHECK
      if (enquiry.userId !== user.id) {
        return NextResponse.json({ success: false, message: 'Service enquiry not found.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: enquiry,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to fetch service enquiry detail.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: false,
    message: 'Service enquiry not found.',
  }, { status: 404 });
}
