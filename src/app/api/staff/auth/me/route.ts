import { NextResponse } from 'next/server';
import { getAuthenticatedStaff } from '@/lib/staffAuth';
import { getSecurityHeaders } from '@/lib/security';

export async function GET() {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Staff session required.' },
      { status: 401, headers }
    );
  }

  return NextResponse.json({
    success: true,
    user: staff,
  }, { headers });
}
