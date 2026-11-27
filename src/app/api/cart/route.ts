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
    try {
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
        cart = await db.cart
          .create({
            data: { userId: user.id },
            include: {
              items: {
                include: {
                  product: { include: { images: true } },
                  variant: true,
                },
              },
            },
          })
          .catch(() => null);
      }

      if (cart) {
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
    } catch (cartErr: any) {
      console.warn("[Cart] DB cart query notice:", cartErr?.message);
    }
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

// POST /api/cart - Merge Guest Cart into User Account Cart upon Login/Registration
export async function POST(request: Request) {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required to merge cart." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { items = [] } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No guest items to merge.",
      });
    }

    if (process.env.DATABASE_URL) {
      let cart = await db.cart.findUnique({ where: { userId: user.id } });
      if (!cart) {
        cart = await db.cart.create({ data: { userId: user.id } });
      }

      for (const item of items) {
        const prodId = item.productId || item.id;
        const varId = item.variantId || item.variant?.id || null;
        const qty = Math.max(1, Number(item.quantity) || 1);

        if (!prodId) continue;

        const product = await db.product.findUnique({
          where: { id: prodId },
          include: { variants: true },
        });

        if (!product || !product.inStock) continue;

        let availableStock = product.stock;
        if (varId) {
          const variant = product.variants.find((v) => v.id === varId);
          if (variant) {
            availableStock = variant.stock;
          }
        }

        if (availableStock <= 0) continue;

        const existingCartItem = await db.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: prodId,
            variantId: varId,
          },
        });

        if (existingCartItem) {
          const mergedQty = Math.min(existingCartItem.quantity + qty, availableStock);
          await db.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: mergedQty },
          });
        } else {
          const initialQty = Math.min(qty, availableStock);
          await db.cartItem.create({
            data: {
              cartId: cart.id,
              productId: prodId,
              variantId: varId,
              quantity: initialQty,
            },
          });
        }
      }

      // Return refreshed database cart
      const updatedCart = await db.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: true,
            },
          },
        },
      });

      const formattedItems = (updatedCart?.items || []).map((item) => {
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

      const subtotal = formattedItems.reduce((acc, curr) => acc + curr.lineTotal, 0);

      return NextResponse.json({
        success: true,
        message: "Guest cart merged successfully.",
        data: {
          id: cart.id,
          items: formattedItems,
          subtotal,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cart merge completed.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to merge cart." },
      { status: 500 },
    );
  }
}
