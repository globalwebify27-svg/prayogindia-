import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

interface Props {
  params: Promise<{ id: string }>;
}

// PATCH /api/cart/items/[id] - Update Quantity with Customer Authorization & Stock Check
export async function PATCH(request: Request, { params }: Props) {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity } = body;

    const newQty = parseInt(String(quantity), 10);
    if (isNaN(newQty) || newQty < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid quantity." },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const cartItem = await db.cartItem.findUnique({
        where: { id },
        include: { cart: true, product: true, variant: true },
      });

      // Customer Isolation Security Check
      if (!cartItem || cartItem.cart.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Cart item not found or forbidden." },
          { status: 404 },
        );
      }

      const stock = cartItem.variant
        ? cartItem.variant.stock
        : cartItem.product.stock;
      if (stock > 0 && newQty > stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot set quantity above available stock of ${stock}.`,
          },
          { status: 422 },
        );
      }

      const updated = await db.cartItem.update({
        where: { id },
        data: { quantity: newQty },
      });

      return NextResponse.json({
        success: true,
        message: "Cart item updated.",
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Quantity updated (Mock Mode).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to update item quantity." },
      { status: 500 },
    );
  }
}

// DELETE /api/cart/items/[id] - Remove Item with Customer Authorization Security
export async function DELETE(request: Request, { params }: Props) {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    if (process.env.DATABASE_URL) {
      const cartItem = await db.cartItem.findUnique({
        where: { id },
        include: { cart: true },
      });

      // Customer Isolation Security Check
      if (!cartItem || cartItem.cart.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Cart item not found or forbidden." },
          { status: 404 },
        );
      }

      await db.cartItem.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: "Item removed from cart.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart (Mock Mode).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to remove cart item." },
      { status: 500 },
    );
  }
}
