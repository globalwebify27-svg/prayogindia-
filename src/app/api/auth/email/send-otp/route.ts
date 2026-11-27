import { NextResponse } from "next/server";
import { UnifiedAuthService } from "@/lib/unifiedAuthService";
import { getSecurityHeaders, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const rateLimit = checkRateLimit(`email_send_otp:${clientIp}`, 10, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many email verification attempts. Please wait ${rateLimit.resetInSeconds} seconds.`,
      },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const email = body.email || "";

    const result = await UnifiedAuthService.sendEmailOtp(email);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send email OTP." },
      { status: 500, headers },
    );
  }
}
