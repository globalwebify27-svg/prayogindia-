import { NextResponse } from "next/server";
import { UnifiedAuthService } from "@/lib/unifiedAuthService";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const userAgent = request.headers.get("user-agent") || "Web Browser";

  try {
    const body = await request.json();

    const {
      verifiedMobile,
      fullName,
      email,
      houseFlatBuilding,
      streetArea,
      landmark,
      city,
      state,
      pincode,
      addressType,
      companyName,
      gstin,
    } = body;

    if (!verifiedMobile) {
      return NextResponse.json(
        { success: false, message: "Verified mobile number is required." },
        { status: 400, headers },
      );
    }

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Please enter your full name." },
        { status: 400, headers },
      );
    }

    if (!houseFlatBuilding || !streetArea || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: "Please fill in all mandatory delivery address fields." },
        { status: 400, headers },
      );
    }

    const result = await UnifiedAuthService.completeRegistrationWithProfile(
      {
        verifiedMobile,
        fullName,
        email,
        houseFlatBuilding,
        streetArea,
        landmark,
        city,
        state,
        pincode,
        addressType,
        companyName,
        gstin,
      },
      userAgent,
    );

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400, headers },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Customer account and default address created successfully.",
        user: result.user,
      },
      { status: 201, headers },
    );

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
      { success: false, message: error.message || "Failed to complete customer profile." },
      { status: 500, headers },
    );
  }
}
