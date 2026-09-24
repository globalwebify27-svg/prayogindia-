import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PRODUCTS } from "@/data/mockData";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

// POST /api/cart/items - Add Item to Cart with Server-Side Trusted Price & Inventory Checks
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
    const { productId, variantId, quantity = 1 } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 },
      );
    }

    const requestedQty = Math.max(1, parseInt(String(quantity), 10));

    if (process.env.DATABASE_URL) {
      // 1. Verify Product & Trusted Price from Server Database
      const product = await db.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      });

      if (!product || !product.inStock) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Requested hardware product is currently out of stock or unavailable.",
          },
          { status: 422 },
        );
      }

      let availableStock = product.stock;
      if (variantId) {
        const variant = product.variants.find((v) => v.id === variantId);
        if (!variant) {
          return NextResponse.json(
            { success: false, message: "Invalid product variant selected." },
            { status: 400 },
          );
        }
        availableStock = variant.stock;
      }

      if (availableStock > 0 && requestedQty > availableStock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${availableStock} units available in stock.`,
          },
          { status: 422 },
        );
      }

      // 2. Find or Create User Cart
      let cart = await db.cart.findUnique({ where: { userId: user.id } });
      if (!cart) {
        cart = await db.cart.create({ data: { userId: user.id } });
      }

      // 3. Prevent Duplicate Cart Items (Update quantity if already exists)
      const existingItem = await db.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      });

      if (existingItem) {
        const newQty = existingItem.quantity + requestedQty;
        if (availableStock > 0 && newQty > availableStock) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot add more. Stock limit of ${availableStock} reached.`,
            },
            { status: 422 },
          );
        }

        const updatedItem = await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty },
        });

        return NextResponse.json({
          success: true,
          message: "Cart item quantity updated.",
          data: updatedItem,
        });
      }

      const newItem = await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: requestedQty,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Item added to cart.",
        data: newItem,
      });
    }

    // Mock Mode Validation
    const mockProduct = PRODUCTS.find((p) => p.id === productId);
    if (!mockProduct || !mockProduct.inStock) {
      return NextResponse.json(
        { success: false, message: "Product is out of stock." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item added to cart (Mock Mode).",
      data: { productId, quantity: requestedQty },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to add item to cart.",
      },
      { status: 500 },
    );
  }
}
