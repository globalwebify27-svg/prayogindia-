import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { AuthSessionUser, getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders, checkRateLimit } from "@/lib/security";
import {
  getApprovedReviewsForProduct,
  addOrUpdateReview,
} from "@/lib/reviewsStore";

const getAuthenticatedUser = getAuthenticatedCustomer;

/**
 * GET /api/reviews?productId=xxx&page=1&limit=10
 * Optional query: checkEligibility=true
 * List reviews for a product or check if current customer is eligible to review.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const slug = searchParams.get("slug");
    const checkEligibility = searchParams.get("checkEligibility") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      20,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10)),
    );

    if (!productId && !slug) {
      return NextResponse.json(
        { success: false, message: "productId or slug is required." },
        { status: 400 },
      );
    }

    // ── Eligibility Check Mode ──────────────────────────────────────────
    if (checkEligibility) {
      const user = await getAuthenticatedUser();
      if (!user) {
        return NextResponse.json({
          success: true,
          eligible: false,
          reason: "UNAUTHENTICATED",
          message:
            "Please sign in to write a review. Only customers who purchased and received this product can review.",
        });
      }

      if (!isDatabaseAvailable()) {
        // Mock fallback mode: check mock flag from header or allow demo
        const mockDeliveredHeader = request.headers.get("x-mock-delivered");
        const mockInTransitHeader = request.headers.get("x-mock-intransit");
        const mockAlreadyReviewedHeader = request.headers.get("x-mock-reviewed");

        if (mockAlreadyReviewedHeader === "true") {
          return NextResponse.json({
            success: true,
            eligible: false,
            reason: "ALREADY_REVIEWED",
            message: "You have already reviewed this product. Thank you for your feedback!",
          });
        }
        if (mockInTransitHeader === "true") {
          return NextResponse.json({
            success: true,
            eligible: false,
            reason: "NOT_DELIVERED",
            message: "Your order is in transit. Reviews can only be submitted once the package is delivered.",
            order: {
              orderNumber: "PRY-MOCK-7821",
              status: "Shipped",
            },
          });
        }
        if (mockDeliveredHeader === "true") {
          return NextResponse.json({
            success: true,
            eligible: true,
            reason: "ELIGIBLE",
            message: "Verified purchase confirmed.",
            order: {
              orderNumber: "PRY-89410",
              deliveredAt: new Date().toISOString(),
            },
          });
        }

        // Default mock response: customer must have bought and had it delivered
        return NextResponse.json({
          success: true,
          eligible: false,
          reason: "NOT_PURCHASED",
          message: "Only verified buyers who received this item can write a review.",
        });
      }

      // Resolve product ID from slug if needed
      let resolvedId = productId;
      if (!resolvedId && slug) {
        const product = await db.product.findUnique({
          where: { slug },
          select: { id: true },
        });
        if (!product) {
          return NextResponse.json(
            { success: false, message: "Product not found." },
            { status: 404 },
          );
        }
        resolvedId = product.id;
      }

      // 1. Check if user already reviewed this product
      const existingReview = await db.review.findFirst({
        where: {
          userId: user.id,
          productId: resolvedId!,
        },
      });
      if (existingReview) {
        return NextResponse.json({
          success: true,
          eligible: false,
          reason: "ALREADY_REVIEWED",
          message: "You have already reviewed this product. Thank you for your feedback!",
        });
      }

      // 2. Check for DELIVERED order containing this product
      const deliveredOrder = await db.order.findFirst({
        where: {
          userId: user.id,
          status: "DELIVERED",
          items: {
            some: {
              OR: [
                { productId: resolvedId! },
                ...(slug ? [{ product: { slug } }] : []),
              ],
            },
          },
        },
        select: {
          id: true,
          orderNumber: true,
          updatedAt: true,
        },
      });

      if (deliveredOrder) {
        return NextResponse.json({
          success: true,
          eligible: true,
          reason: "ELIGIBLE",
          message: "Verified buyer delivery confirmed.",
          order: {
            orderNumber: deliveredOrder.orderNumber,
            deliveredAt: deliveredOrder.updatedAt,
          },
        });
      }

      // 3. Check if user ordered the item but it is not yet DELIVERED
      const activeOrder = await db.order.findFirst({
        where: {
          userId: user.id,
          items: {
            some: {
              OR: [
                { productId: resolvedId! },
                ...(slug ? [{ product: { slug } }] : []),
              ],
            },
          },
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
        },
      });

      if (activeOrder) {
        return NextResponse.json({
          success: true,
          eligible: false,
          reason: "NOT_DELIVERED",
          message: `Your Order #${activeOrder.orderNumber} is currently ${activeOrder.status.replace(/_/g, " ")}. Reviews can only be submitted once the product has been delivered to you.`,
          order: {
            orderNumber: activeOrder.orderNumber,
            status: activeOrder.status,
          },
        });
      }

      // 4. Product never ordered by this customer
      return NextResponse.json({
        success: true,
        eligible: false,
        reason: "NOT_PURCHASED",
        message:
          "Only verified customers who purchased and received this product directly from Prayog India can write a review.",
      });
    }

    // ── Public Reviews List (Strictly Approved Reviews Only) ───────────
    const name = searchParams.get("name") || searchParams.get("productName") || "";
    const sku = searchParams.get("sku") || searchParams.get("productSku") || "";

    const approvedReviews = await getApprovedReviewsForProduct({
      id: productId || undefined,
      slug: slug || undefined,
      name: name || undefined,
      sku: sku || undefined,
    });

    const total = approvedReviews.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = approvedReviews.slice((page - 1) * limit, page * limit);
    const avgRating =
      total > 0
        ? Number(
            (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
          )
        : 5.0;

    return NextResponse.json({
      success: true,
      data: {
        items: paginated.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.comment,
          comment: r.comment,
          isVerified: r.verified,
          verified: r.verified,
          createdAt: r.createdAt || r.date,
          date: r.date,
          customerName: r.author,
          author: r.author,
          role: r.role || "Verified Buyer",
          images: r.images || [],
          videoUrl: r.videoUrl,
          isFeatured: !!r.isFeatured,
          helpfulCount: r.helpfulCount || 0,
        })),
        page,
        limit,
        total,
        totalPages,
        averageRating: avgRating,
      },
    });
  } catch (error: any) {
    console.error("[Reviews GET Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reviews." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews
 * Submit a product review.
 * - Requires authentication
 * - Strictly requires customer to have a DELIVERED order containing this product
 * - One review per customer per product
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Please sign in to submit a review." },
      { status: 401, headers },
    );
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(
    `review:${user.id}:${ip}`,
    5,
    60 * 60 * 1000,
  ); // 5 per hour
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many review submissions. Wait an hour." },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const { productId, rating, title, body: reviewBody, mockVerified, images, videoUrl } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400, headers },
      );
    }

    const numRating = parseInt(String(rating), 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5." },
        { status: 400, headers },
      );
    }

    if (
      !reviewBody ||
      typeof reviewBody !== "string" ||
      reviewBody.trim().length < 10
    ) {
      return NextResponse.json(
        { success: false, message: "Review must be at least 10 characters." },
        { status: 400, headers },
      );
    }

    if (!isDatabaseAvailable()) {
      if (!mockVerified) {
        return NextResponse.json(
          {
            success: false,
            code: "NOT_ELIGIBLE",
            message:
              "Only customers who have purchased and received this product can write a review.",
          },
          { status: 403, headers },
        );
      }
      const newRev = {
        id: `rev-${Date.now()}`,
        productId,
        productName: (body as any).productName || "Hardware Component",
        productSku: (body as any).productSku || "PRG-SKU",
        productSlug: (body as any).productSlug,
        userId: user.id,
        author: user.name || "Customer",
        role: (user as any).customerType || "Verified Buyer",
        rating: numRating,
        title: title || "Customer Review",
        comment: reviewBody,
        verified: true,
        status: "APPROVED" as const,
        isFeatured: numRating >= 4,
        isReported: false,
        helpfulCount: 0,
        images: images || [],
        videoUrl: videoUrl || null,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        createdAt: new Date().toISOString(),
      };
      await addOrUpdateReview(newRev);

      return NextResponse.json({
        success: true,
        message: "Review submitted with Verified Purchase badge!",
        data: {
          productId,
          rating: numRating,
          title: title || null,
          body: reviewBody,
          images: images || [],
          videoUrl: videoUrl || null,
          isVerified: true,
        },
      });
    }

    // 1. Verify product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404, headers },
      );
    }

    // 2. Strictly verify customer has a DELIVERED order for this product
    const deliveredOrderWithProduct = await db.order.findFirst({
      where: {
        userId: user.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
    });

    if (!deliveredOrderWithProduct) {
      // Check if ordered but not yet delivered
      const pendingOrder = await db.order.findFirst({
        where: {
          userId: user.id,
          items: { some: { productId } },
        },
        select: { status: true, orderNumber: true },
      });

      if (pendingOrder) {
        return NextResponse.json(
          {
            success: false,
            code: "ORDER_NOT_DELIVERED",
            message: `Order #${pendingOrder.orderNumber} is currently ${pendingOrder.status.replace(/_/g, " ")}. You can submit a review once the product has been delivered.`,
          },
          { status: 403, headers },
        );
      }

      return NextResponse.json(
        {
          success: false,
          code: "NOT_PURCHASED",
          message:
            "Only customers who have purchased and received this product directly from Prayog India can write a review.",
        },
        { status: 403, headers },
      );
    }

    const isVerified = true;

    // 3. Create review (DB unique constraint prevents duplicates)
    try {
      const review = await db.review.create({
        data: {
          productId,
          orderId: deliveredOrderWithProduct?.id || null,
          userId: user.id,
          rating: numRating,
          title: title ? String(title).trim().slice(0, 150) : null,
          body: reviewBody.trim().slice(0, 2000),
          isVerified,
        },
        include: {
          user: { select: { name: true } },
        },
      });

      // Update product average rating
      const avgResult = await db.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true },
      });

      await db.product.update({
        where: { id: productId },
        data: {
          rating: Math.round((avgResult._avg.rating || numRating) * 10) / 10,
          reviewCount: avgResult._count.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: isVerified
          ? "Review submitted with Verified Purchase badge!"
          : "Review submitted successfully.",
        data: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          body: review.body,
          isVerified: review.isVerified,
          customerName: review.user.name,
          createdAt: review.createdAt,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        // Customer is editing their existing review
        try {
          const updated = await db.review.update({
            where: {
              productId_userId: { productId, userId: user.id },
            },
            data: {
              rating: numRating,
              title: title ? String(title).trim().slice(0, 150) : null,
              body: reviewBody.trim().slice(0, 2000),
            },
            include: {
              user: { select: { name: true } },
            },
          });
          return NextResponse.json({
            success: true,
            message: "Your review has been updated successfully!",
            data: {
              id: updated.id,
              rating: updated.rating,
              title: updated.title,
              body: updated.body,
              images: images || [],
              videoUrl: videoUrl || null,
              isVerified: updated.isVerified,
              customerName: updated.user.name,
              createdAt: updated.createdAt,
            },
          });
        } catch (updateErr: any) {
          return NextResponse.json(
            {
              success: false,
              message: "You have already reviewed this product.",
            },
            { status: 409, headers },
          );
        }
      }
      throw err;
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit review." },
      { status: 500, headers },
    );
  }
}
