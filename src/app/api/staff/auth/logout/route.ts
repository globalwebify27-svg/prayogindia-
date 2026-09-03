import { NextResponse } from "next/server";
import { AUTH_STAFF_COOKIE_NAME } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

export async function POST() {
  const headers = getSecurityHeaders();
  const response = NextResponse.json(
    {
      success: true,
      message: "Staff session terminated successfully.",
    },
    { headers },
  );

  response.cookies.set({
    name: AUTH_STAFF_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
