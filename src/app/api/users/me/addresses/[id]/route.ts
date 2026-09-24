import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

const getAuthenticatedUser = getAuthenticatedCustomer;

/**
 * PATCH /api/users/me/addresses/[id]
 * Update a saved address. STRICTLY limited to the authenticated customer's own addresses (IDOR protection).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401, headers },
    );
  }

  const resolvedParams = await params;
  const addressId = resolvedParams.id;

  if (!addressId) {
    return NextResponse.json(
      { success: false, message: "Address ID is required." },
      { status: 400, headers },
    );
  }

  try {
    const body = await request.json();
    const { name, phone, street, city, state, pincode, type, isDefault } = body;

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: "All address fields are required." },
        { status: 400, headers },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "Address updated (Mock Mode).",
        data: {
          id: addressId,
          name,
          phone,
          street,
          city,
          state,
          pincode,
          type,
          isDefault,
        },
      });
    }

    // Verify address belongs to the authenticated user (IDOR protection)
    const existingAddress = await db.address.findFirst({
      where: { id: addressId, userId: user.id },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404, headers },
      );
    }

    // If setting as default, unset all others first
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.id, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await db.address.update({
      where: { id: addressId },
      data: {
        name: name.trim(),
        phone: String(phone).trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: String(pincode).trim(),
        type: type || "Home",
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update address." },
      { status: 500, headers },
    );
  }
}

/**
 * DELETE /api/users/me/addresses/[id]
 * Delete a saved address. STRICTLY limited to the authenticated customer's own addresses.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401, headers },
    );
  }

  const resolvedParams = await params;
  const addressId = resolvedParams.id;

  if (!addressId) {
    return NextResponse.json(
      { success: false, message: "Address ID is required." },
      { status: 400, headers },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: true,
      message: "Address deleted (Mock Mode).",
    });
  }

  try {
    // Verify ownership before deletion (IDOR protection)
    const address = await db.address.findFirst({
      where: { id: addressId, userId: user.id },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404, headers },
      );
    }

    await db.address.delete({ where: { id: addressId } });

    // If deleted address was default, set the most recent remaining as default
    if (address.isDefault) {
      const remaining = await db.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await db.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete address." },
      { status: 500, headers },
    );
  }
}
