import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff, hasRequiredRole } from "@/lib/staffAuth";
import { hashPassword, normalizeEmail } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";
import { StaffStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const currentStaff = await getAuthenticatedStaff();

  if (!currentStaff || !hasRequiredRole(currentStaff, "SUPER_ADMIN")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Only Super Admin can modify staff accounts.",
      },
      { status: 403, headers },
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { name, email, password, storeId, phone, status } = body;

  try {
    if (process.env.DATABASE_URL) {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = normalizeEmail(email);
      if (phone !== undefined) updateData.phone = phone;
      if (storeId !== undefined) updateData.storeId = storeId;
      if (status && (status === "ACTIVE" || status === "SUSPENDED")) {
        updateData.status = status as StaffStatus;
      }
      if (password && password.length >= 6) {
        updateData.passwordHash = await hashPassword(password);
      }

      const updated = await db.staffUser.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          storeId: true,
          status: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Staff account updated successfully.",
          data: updated,
        },
        { headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Staff account updated (Dev Mock).",
        data: { id, status: status || "ACTIVE" },
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update staff account.",
      },
      { status: 500, headers },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const currentStaff = await getAuthenticatedStaff();

  if (!currentStaff || !hasRequiredRole(currentStaff, "SUPER_ADMIN")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Only Super Admin can delete staff accounts.",
      },
      { status: 403, headers },
    );
  }

  const { id } = await params;

  try {
    if (process.env.DATABASE_URL) {
      await db.staffUser.delete({
        where: { id },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Staff account deleted successfully.",
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete staff account.",
      },
      { status: 500, headers },
    );
  }
}
