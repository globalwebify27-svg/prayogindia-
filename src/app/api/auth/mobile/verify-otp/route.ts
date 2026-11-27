import { NextResponse } from "next/server";
import { UnifiedAuthService } from "@/lib/unifiedAuthService";
import { getSecurityHeaders, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Web Browser";

  // Rate Limiting (15 attempts per minute per IP)
  const rateLimit = checkRateLimit(`verify_otp:${clientIp}`, 15, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many verification attempts. Please wait ${rateLimit.resetInSeconds} seconds.`,
      },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const phone = body.phone || body.mobile || "";
    const code = (body.code || body.otp || "").toString().trim();

    const result = await UnifiedAuthService.verifyMobileOtp(phone, code, userAgent);

    if (!result.success) {
      return NextResponse.json(result, { status: 400, headers });
    }

    const response = NextResponse.json(result, { status: 200, headers });

    // If an existing customer was authenticated, set the session cookie
    if (result.sessionToken) {
      response.cookies.set({
        name: "prayog_customer_session",
        value: result.sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify OTP." },
      { status: 500, headers },
    );
  }
}
