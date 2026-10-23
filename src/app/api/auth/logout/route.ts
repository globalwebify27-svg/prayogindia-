import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully.",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );

  // Strictly Expire Session Cookie across all modern browsers
  response.cookies.set({
    name: "prayog_customer_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
