import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { signSessionToken } from "@/lib/jwt";
import { getSecurityHeaders } from "@/lib/security";

export async function POST() {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "No active session found." },
      { status: 401, headers },
    );
  }

  // Generate a renewed 7-day session token
  const renewedToken = await signSessionToken(user, "7d");

  const response = NextResponse.json(
    {
      success: true,
      message: "Session refreshed successfully.",
      user,
    },
    { headers },
  );

  response.cookies.set({
    name: "prayog_customer_session",
    value: renewedToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
