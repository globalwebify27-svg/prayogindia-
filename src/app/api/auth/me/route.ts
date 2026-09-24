import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

export async function GET() {
  const user = await getAuthenticatedCustomer();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    user,
  });
}
