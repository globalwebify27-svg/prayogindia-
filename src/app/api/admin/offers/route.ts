import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// GET /api/admin/offers — List all offers/coupons
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (status !== "all") where.status = status;

      const offers = await db.offer.findMany({
        where,
        include: {
          products: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, price: true },
              },
            },
          },
        },
        orderBy: { startDate: "desc" },
      });

      return NextResponse.json({ success: true, data: offers });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] });
}

// POST /api/admin/offers — Create a new offer/coupon
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const {
      slug,
      title,
      shortDescription,
      image,
      badge,
      status,
      startDate,
      endDate,
      couponCode,
      customerEligibility,
      productIds,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, message: "Title and slug required" },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const offer = await db.offer.create({
        data: {
          slug,
          title,
          shortDescription: shortDescription || "",
          image: image || "",
          badge: badge || "ACTIVE",
          status: status || "Active",
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || "",
          couponCode: couponCode || null,
          customerEligibility: customerEligibility || null,
          products: productIds?.length
            ? {
                create: productIds.map((pid: string) => ({ productId: pid })),
              }
            : undefined,
        },
        include: { products: true },
      });

      return NextResponse.json({ success: true, data: offer }, { status: 201 });
    }

    return NextResponse.json(
      { success: true, data: { id: `mock-${Date.now()}`, title, slug } },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/offers — Update offer status or details
export async function PATCH(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { id, status, title, couponCode, endDate, badge } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Offer ID required" },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const offer = await db.offer.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(title && { title }),
          ...(couponCode !== undefined && { couponCode }),
          ...(endDate && { endDate }),
          ...(badge && { badge }),
        },
      });
      return NextResponse.json({ success: true, data: offer });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/offers — Delete an offer
export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Offer ID required" },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      await db.offer.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Offer deleted" });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
