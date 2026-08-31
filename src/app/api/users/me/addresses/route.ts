import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { AuthSessionUser } from '@/lib/authUtils';
import { MOCK_SAVED_ADDRESSES, Address } from '@/data/accountData';

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

// GET /api/users/me/addresses
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.DATABASE_URL) {
    const dbAddresses = await db.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: dbAddresses });
  }

  return NextResponse.json({ success: true, data: MOCK_SAVED_ADDRESSES });
}

// POST /api/users/me/addresses
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, street, city, state, pincode, type, isDefault } = body;

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: 'Missing required address fields.' },
        { status: 400 }
      );
    }

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      type: type || 'Home',
      isDefault: Boolean(isDefault),
    };

    if (process.env.DATABASE_URL) {
      if (isDefault) {
        // Unset previous default address using transaction safety
        await db.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      const created = await db.address.create({
        data: {
          userId: user.id,
          name,
          phone,
          street,
          city,
          state,
          pincode,
          type: type || 'Home',
          isDefault: Boolean(isDefault),
        },
      });

      return NextResponse.json({ success: true, data: created });
    }

    return NextResponse.json({ success: true, data: newAddress });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save address.' },
      { status: 500 }
    );
  }
}
