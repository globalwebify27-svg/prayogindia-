import { NextResponse } from 'next/server';
import { UserDB } from '@/lib/userDB';
import { sendSMS } from '@/lib/smsService';

// Server-side in-memory OTP storage for validation
const OTP_STORE = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phone, code } = body;

    const rawDigits = (phone || '').replace(/\D/g, '');
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      // Generate dynamic random 6-digit OTP code (100000 - 999999)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      OTP_STORE.set(cleanPhone, {
        code: generatedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
      });

      // Dispatch SMS to customer phone
      await sendSMS(cleanPhone, generatedOtp);

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanPhone}. Please check your phone SMS messages.`,
      });
    }

    if (action === 'verify') {
      const enteredCode = (code || '').toString().trim();
      if (!enteredCode || enteredCode.length !== 6) {
        return NextResponse.json(
          { success: false, message: 'Please enter the 6-digit OTP code sent to your phone.' },
          { status: 400 }
        );
      }

      const stored = OTP_STORE.get(cleanPhone);
      if (!stored || stored.expiresAt < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'OTP has expired. Please request a new OTP.' },
          { status: 401 }
        );
      }

      if (stored.code !== enteredCode) {
        return NextResponse.json(
          { success: false, message: 'Incorrect OTP code. Please check your SMS and re-enter.' },
          { status: 401 }
        );
      }

      // Clear consumed OTP
      OTP_STORE.delete(cleanPhone);

      // Lookup or register
      let existing = UserDB.findByEmailOrPhone(cleanPhone);
      if (!existing) {
        existing = UserDB.create({
          name: `Customer ${cleanPhone.slice(-4)}`,
          email: `user.${cleanPhone}@prayogindia.com`,
          phone: `+91 ${cleanPhone}`,
          passwordHash: '',
          customerType: 'Registered Customer',
          rewardPoints: 100,
        });
      }

      const userPayload = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        customerType: existing.customerType,
        rewardPoints: existing.rewardPoints,
        role: 'CUSTOMER' as const,
      };

      const response = NextResponse.json({
        success: true,
        message: 'OTP verified successfully.',
        user: userPayload,
      });

      response.cookies.set({
        name: 'prayog_customer_session',
        value: JSON.stringify(userPayload),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'OTP processing failed.' }, { status: 500 });
  }
}
