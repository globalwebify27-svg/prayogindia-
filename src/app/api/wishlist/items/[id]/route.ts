import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

interface Props {
  params: Promise<{ id: string }>;
}

// DELETE /api/wishlist/items/[id] - Remove Item from Wishlist with Customer Authorization Check
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
      const item = await db.wishlistItem.findFirst({
        where: {
          OR: [{ id }, { productId: id }],
          wishlist: { userId: user.id },
        },
      });

      if (!item) {
        return NextResponse.json(
          { success: false, message: "Wishlist item not found or forbidden." },
          { status: 404 },
        );
      }

      await db.wishlistItem.delete({ where: { id: item.id } });
      return NextResponse.json({
        success: true,
        message: "Removed from wishlist.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist (Mock Mode).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to remove wishlist item." },
      { status: 500 },
    );
  }
}
