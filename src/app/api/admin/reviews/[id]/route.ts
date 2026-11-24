import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getSecurityHeaders } from "@/lib/security";
import {
  approveReview,
  rejectReview,
  moderateReview,
  toggleFeaturedReview,
  deleteReview,
} from "@/lib/reviewsStore";

/**
 * PATCH /api/admin/reviews/[id]
 * Moderate, approve/reject, feature, or dismiss report for a review
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getSecurityHeaders();
  const { id } = await params;

  try {
    const payload = await request.json();
    const { status, isFeatured, dismissReport, title, body } = payload;

    // 1. Update In-Memory Reviews Store
    if (status === "APPROVED") {
      await approveReview(id);
    } else if (status === "REJECTED") {
      await rejectReview(id);
    }

    if (isFeatured !== undefined) {
      await toggleFeaturedReview(id, !!isFeatured);
    }

    if (title !== undefined || body !== undefined) {
      await moderateReview(id, { title, body });
    }

    // 2. Update Database if available
    if (isDatabaseAvailable()) {
      try {
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (body !== undefined) updateData.body = body;

        await db.review.update({
          where: { id },
          data: updateData,
        });
      } catch (dbErr) {
        console.warn("[Admin Review Update DB Error]:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully by admin.",
      data: {
        id,
        status: status || "APPROVED",
        isFeatured: !!isFeatured,
        dismissReport: !!dismissReport,
        title,
        body,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update review." },
      { status: 500, headers }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Remove inappropriate or abusive review
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getSecurityHeaders();
  const { id } = await params;

  try {
    // 1. Remove from In-Memory Store
    await deleteReview(id);

    // 2. Remove from Database if available
    if (isDatabaseAvailable()) {
      try {
        await db.review.delete({
          where: { id },
        });
      } catch (dbErr) {
        console.warn("[Admin Review Delete DB Error]:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Review removed successfully.",
      data: { id },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete review." },
      { status: 500, headers }
    );
  }
}
