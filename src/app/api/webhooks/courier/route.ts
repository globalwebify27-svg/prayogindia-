import { NextResponse } from "next/server";
import { LogisticsEngine } from "@/lib/logisticsEngine";
import { getSecurityHeaders } from "@/lib/security";

/**
 * POST /api/webhooks/courier
 * Ingest inbound real-time tracking events from Shiprocket / Delhivery / Courier Partners
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  try {
    const signature =
      request.headers.get("x-shiprocket-signature") ||
      request.headers.get("x-courier-signature");
    const payload = await request.json();

    const result = await LogisticsEngine.handleCourierWebhook(
      payload,
      signature,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed successfully.",
        data: result,
      },
      { headers },
    );
  } catch (error: any) {
    console.error("[Courier Webhook Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process courier webhook.",
      },
      { status: 400, headers },
    );
  }
}
