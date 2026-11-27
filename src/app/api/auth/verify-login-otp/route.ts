import { NextResponse } from "next/server";
import { signSessionToken } from "@/lib/jwt";
import { getSecurityHeaders } from "@/lib/security";
import { AuthSessionUser } from "@/lib/authUtils";
import { UserDB } from "@/lib/userDB";
import { db, isDatabaseAvailable } from "@/lib/db";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  try {
    const body = await request.json();
    const phone = body.phone || "";
    const code = (body.code || body.otp || "").toString().trim();

    const rawDigits = (phone || "").replace(/\D/g, "");
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid 10-digit mobile number." },
        { status: 400, headers },
      );
    }

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Please enter the OTP verification code." },
        { status: 400, headers },
      );
    }

    // Verify OTP via existing /api/auth/otp endpoint
    const otpRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", phone: cleanPhone, code }),
    });

    const otpData = await otpRes.json();
    if (!otpRes.ok || !otpData.success) {
      return NextResponse.json(
        { success: false, message: otpData.message || "Invalid or expired OTP." },
        { status: 401, headers },
      );
    }

    return NextResponse.json(otpData, { headers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify login OTP." },
      { status: 500, headers },
    );
  }
}
