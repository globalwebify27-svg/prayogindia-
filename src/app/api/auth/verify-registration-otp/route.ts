import { NextResponse } from "next/server";
import { RegistrationService } from "@/lib/registrationService";
import { signSessionToken } from "@/lib/jwt";
import { getSecurityHeaders } from "@/lib/security";
import { AuthSessionUser } from "@/lib/authUtils";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  try {
    const body = await request.json();
    const phone = body.phone || "";
    const code = body.code || body.otp || "";

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Please provide your mobile number." },
        { status: 400, headers },
      );
    }

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Please enter the OTP verification code." },
        { status: 400, headers },
      );
    }

    const verifyResult = await RegistrationService.verifyAndCreate(phone, code);

    if (!verifyResult.success || !verifyResult.user) {
      return NextResponse.json(
        { success: false, message: verifyResult.message },
        { status: 400, headers },
      );
    }

    const sessionToken = await signSessionToken(verifyResult.user as AuthSessionUser, "7d");

    const response = NextResponse.json(
      {
        success: true,
        message: "Mobile verified and customer account created successfully.",
        user: verifyResult.user,
      },
      { headers },
    );

    response.cookies.set({
      name: "prayog_customer_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify registration OTP." },
      { status: 500, headers },
    );
  }
}
