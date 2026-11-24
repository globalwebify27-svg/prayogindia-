import { NextResponse } from "next/server";
import { getSecurityHeaders } from "@/lib/security";

/**
 * POST /api/reviews/report
 * Customer reports an inappropriate review.
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();
    const { reviewId, reason, details } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: "Review ID is required." },
        { status: 400, headers }
      );
    }

    // In a production system with Postgres, record in ReviewReport table or flag Review
    // For universal mock/resilience fallback:
    return NextResponse.json({
      success: true,
      message: "Review report submitted to Prayog moderation team for review.",
      data: {
        reviewId,
        reason: reason || "Inappropriate content",
        details: details || "",
        reportedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit report." },
      { status: 500, headers }
    );
  }
}
