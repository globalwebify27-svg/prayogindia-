import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";

interface Props {
  params: Promise<{ id: string }>;
}

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

// DELETE /api/wishlist/items/[id] - Remove Item from Wishlist with Customer Authorization Check
export async function DELETE(request: Request, { params }: Props) {
  const user = await getAuthenticatedUser();
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
