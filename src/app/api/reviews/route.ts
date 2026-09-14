import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { getSecurityHeaders, checkRateLimit } from "@/lib/security";

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * GET /api/reviews?productId=xxx&page=1&limit=10
 * List reviews for a product — publicly accessible (no auth required for reading).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const slug = searchParams.get("slug");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    if (!productId && !slug) {
      return NextResponse.json(
        { success: false, message: "productId or slug is required." },
        { status: 400 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        data: { items: [], page, limit, total: 0, totalPages: 0 },
        source: "mock",
      });
    }

    // Resolve product ID from slug if needed
    let resolvedProductId = productId;
    if (!resolvedProductId && slug) {
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
      resolvedProductId = product.id;
    }

    const total = await db.review.count({ where: { productId: resolvedProductId! } });
    const totalPages = Math.ceil(total / limit) || 1;

    const reviews = await db.review.findMany({
      where: { productId: resolvedProductId! },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        isVerified: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    // Calculate average rating
    const avgResult = await db.review.aggregate({
      where: { productId: resolvedProductId! },
      _avg: { rating: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        items: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          isVerified: r.isVerified,
          createdAt: r.createdAt,
          customerName: r.user.name,
        })),
        page,
        limit,
        total,
        totalPages,
        averageRating: avgResult._avg.rating || 0,
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
 * - One review per customer per product (enforced by DB unique constraint)
 * - isVerified = true if customer has a DELIVERED order containing this product
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
  const rateLimit = checkRateLimit(`review:${user.id}:${ip}`, 5, 60 * 60 * 1000); // 5 per hour
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many review submissions. Wait an hour." },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const { productId, rating, title, body: reviewBody } = body;

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

    if (!reviewBody || typeof reviewBody !== "string" || reviewBody.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Review must be at least 10 characters." },
        { status: 400, headers },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "Review submitted (Mock Mode).",
        data: { productId, rating: numRating, body: reviewBody },
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

    // 2. Check for delivered order containing this product (for verified badge)
    const deliveredOrderWithProduct = await db.order.findFirst({
      where: {
        userId: user.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
    });

    const isVerified = !!deliveredOrderWithProduct;

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
        return NextResponse.json(
          { success: false, message: "You have already reviewed this product." },
          { status: 409, headers },
        );
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
