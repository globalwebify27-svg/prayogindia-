import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

// GET /api/cart - Customer Cart Retrieval with Server-Side Trusted Price & Stock Validation
export async function GET() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  if (process.env.DATABASE_URL) {
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: true,
            },
          },
        },
      });
    }

    const formattedItems = cart.items.map((item) => {
      const unitPrice = item.variant ? item.variant.price : item.product.price;
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        image:
          item.product.images[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        quantity: item.quantity,
        inStock: item.product.inStock,
      };
    });

    const subtotal = formattedItems.reduce(
      (acc, curr) => acc + curr.lineTotal,
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        id: cart.id,
        items: formattedItems,
        subtotal,
      },
      source: "database",
    });
  }

  // Fallback Mock Response for UI compatibility
  return NextResponse.json({
    success: true,
    data: {
      items: [],
      subtotal: 0,
    },
    source: "mock",
  });
}

// DELETE /api/cart - Clear Customer Cart
export async function DELETE() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  if (process.env.DATABASE_URL) {
    const cart = await db.cart.findUnique({ where: { userId: user.id } });
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Cart cleared successfully.",
  });
}
