import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { UnifiedAuthService } from "@/lib/unifiedAuthService";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const authUser = await getAuthenticatedCustomer();

  try {
    const body = await request.json();
    const { userId, provider, providerUserId } = body;
    const targetUserId = authUser?.id || userId;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Authentication required to link account identity." },
        { status: 401, headers },
      );
    }

    if (!provider || !providerUserId) {
      return NextResponse.json(
        { success: false, message: "Provider and provider user identifier are required." },
        { status: 400, headers },
      );
    }

    if (provider === "google") {
      const linkResult = await UnifiedAuthService.linkGoogleToCustomer(targetUserId, providerUserId);
      return NextResponse.json(linkResult, {
        status: linkResult.success ? 200 : 400,
        headers,
      });
    }

    return NextResponse.json(
      { success: false, message: `Unsupported provider: ${provider}` },
      { status: 400, headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to link identity." },
      { status: 500, headers },
    );
  }
}
