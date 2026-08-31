import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';

export async function GET() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Forbidden. Admin authentication required.' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    user: admin,
  });
}
