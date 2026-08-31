import { NextResponse } from 'next/server';
import { AUTH_ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin logged out successfully.',
  });

  response.cookies.set({
    name: AUTH_ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/admin',
  });

  return response;
}
