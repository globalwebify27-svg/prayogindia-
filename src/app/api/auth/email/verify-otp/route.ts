import { NextResponse } from "next/server";
import { UnifiedAuthService } from "@/lib/unifiedAuthService";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  try {
    const body = await request.json();
    const email = body.email || "";
    const code = (body.code || body.otp || "").toString().trim();

    const result = await UnifiedAuthService.verifyEmailOtp(email, code);

    if (!result.success) {
      return NextResponse.json(result, { status: 400, headers });
    }

    const response = NextResponse.json(result, { status: 200, headers });

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
      { success: false, message: error.message || "Failed to verify email OTP." },
      { status: 500, headers },
    );
  }
}
