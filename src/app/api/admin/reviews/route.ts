import { NextResponse } from "next/server";
import { getSecurityHeaders } from "@/lib/security";
import { getAllReviews } from "@/lib/reviewsStore";

/**
 * GET /api/admin/reviews
 * Query params: status (ALL, PENDING, APPROVED, REJECTED, REPORTED, FEATURED), search
 */
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") || "ALL";
  const search = (searchParams.get("search") || "").toLowerCase().trim();

  try {
    const all = await getAllReviews();

    // Filter by search query
    let filtered = all;
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.author.toLowerCase().includes(search) ||
          r.productName.toLowerCase().includes(search) ||
          (r.productSku && r.productSku.toLowerCase().includes(search)) ||
          r.comment.toLowerCase().includes(search) ||
          (r.title && r.title.toLowerCase().includes(search))
      );
    }

    // Filter by status tab
    if (statusFilter === "PENDING") {
      filtered = filtered.filter((r) => r.status === "PENDING" && !r.isReported);
    } else if (statusFilter === "APPROVED") {
      filtered = filtered.filter((r) => r.status === "APPROVED");
    } else if (statusFilter === "REJECTED") {
      filtered = filtered.filter((r) => r.status === "REJECTED");
    } else if (statusFilter === "REPORTED") {
      filtered = filtered.filter((r) => r.isReported === true);
    } else if (statusFilter === "FEATURED") {
      filtered = filtered.filter((r) => r.isFeatured === true);
    }

    // Metrics summary
    const totalCount = all.length;
    const pendingCount = all.filter((r) => r.status === "PENDING").length;
    const approvedCount = all.filter((r) => r.status === "APPROVED").length;
    const reportedCount = all.filter((r) => r.isReported === true).length;
    const featuredCount = all.filter((r) => r.isFeatured === true).length;
    const avgRating =
      totalCount > 0
        ? Number(
            (all.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
          )
        : 4.8;

    return NextResponse.json({
      success: true,
      data: {
        reviews: filtered,
        metrics: {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          reported: reportedCount,
          featured: featuredCount,
          avgRating,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load admin reviews." },
      { status: 500, headers }
    );
  }
}
