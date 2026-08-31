import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthSessionUser } from '@/lib/authUtils';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('prayog_customer_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json(
      { success: false, message: 'Unauthenticated.' },
      { status: 401 }
    );
  }

  try {
    const user: AuthSessionUser = JSON.parse(sessionCookie.value);
    return NextResponse.json({
      success: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid session.' },
      { status: 401 }
    );
  }
}
