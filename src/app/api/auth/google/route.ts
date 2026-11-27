import { NextResponse } from "next/server";
import { UnifiedAuthService } from "@/lib/unifiedAuthService";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const userAgent = request.headers.get("user-agent") || "Google OAuth Web";

  try {
    const body = await request.json();
    const { sub, idToken, email, name, picture, uid } = body;
    const googleSub = (sub || uid || idToken || "").toString().trim();

    if (!googleSub) {
      return NextResponse.json(
        { success: false, message: "Valid Google identifier (sub) is required." },
        { status: 400, headers },
      );
    }

    const result = await UnifiedAuthService.authenticateGoogleIdentity(
      googleSub,
      { email, name, picture },
      userAgent,
    );

    const response = NextResponse.json(result, {
      status: result.success ? 200 : 400,
      headers,
    });

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
      { success: false, message: error.message || "Google authentication failed." },
      { status: 500, headers },
    );
  }
}

export async function GET(request: Request) {
  // Safe redirect or info endpoint
  return NextResponse.json({
    success: true,
    message: "Google OAuth Provider Endpoint. Submit POST with verified token credentials.",
  });
}
