import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

// GET /api/wishlist - Get Authenticated Customer Wishlist
export async function GET() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  if (process.env.DATABASE_URL) {
    let wishlist = await db.wishlist.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
            },
          },
        },
      });
    }

    const items = wishlist.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      mrp: item.product.mrp,
      image:
        item.product.images[0]?.imageUrl ||
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
      inStock: item.product.inStock,
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: wishlist.id,
        items,
      },
      source: "database",
    });
  }

  return NextResponse.json({
    success: true,
    data: { items: [] },
    source: "mock",
  });
}

// DELETE /api/wishlist - Clear Wishlist
export async function DELETE() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  if (process.env.DATABASE_URL) {
    const wishlist = await db.wishlist.findUnique({
      where: { userId: user.id },
    });
    if (wishlist) {
      await db.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });
    }
  }

  return NextResponse.json({ success: true, message: "Wishlist cleared." });
}
