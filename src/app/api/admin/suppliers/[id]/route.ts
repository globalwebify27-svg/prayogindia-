import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/suppliers/[id] — Single supplier detail with purchase order history
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  const { id } = await params;

  if (process.env.DATABASE_URL) {
    try {
      const supplier = await db.supplier.findUnique({
        where: { id },
        include: {
          purchaseOrders: {
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              store: { select: { id: true, name: true, code: true } },
              payments: { orderBy: { createdAt: "desc" } },
              _count: { select: { items: true } },
            },
          },
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { success: false, message: "Supplier not found" },
          { status: 404, headers },
        );
      }

      return NextResponse.json({ success: true, data: supplier }, { headers });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "No database configured" },
    { status: 500, headers },
  );
}
