import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

// POST /api/wishlist/items - Add Product to Wishlist (Duplicate Prevention)
export async function POST(request: Request) {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const product = await db.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found." },
          { status: 404 },
        );
      }

      let wishlist = await db.wishlist.findUnique({
        where: { userId: user.id },
      });
      if (!wishlist) {
        wishlist = await db.wishlist.create({ data: { userId: user.id } });
      }

      // Unique Constraint Check
      const existing = await db.wishlistItem.findFirst({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      });

      if (existing) {
        return NextResponse.json({
          success: true,
          message: "Product already in wishlist.",
          data: existing,
        });
      }

      const item = await db.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Added to wishlist.",
        data: item,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Added to wishlist (Mock Mode).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to add item to wishlist." },
      { status: 500 },
    );
  }
}
