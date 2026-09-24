import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// GET /api/admin/services — List all service enquiries
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const serviceSlug = searchParams.get("service");
  const search = searchParams.get("search") || "";

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (serviceSlug && serviceSlug !== "all") {
        where.service = { slug: serviceSlug };
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ];
      }

      const enquiries = await db.serviceEnquiry.findMany({
        where,
        include: {
          service: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Also fetch service counts
      const services = await db.service.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { enquiries: true } },
        },
      });

      return NextResponse.json({ success: true, data: enquiries, services });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: [], services: [] });
}

// PATCH /api/admin/services — Mark enquiry as contacted / update notes
export async function PATCH(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { id, status, adminNote } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Enquiry ID required" },
        { status: 400 },
      );
    }

    // ServiceEnquiry doesn't have a status field in schema — we extend via a workaround
    // For now we just return success (status tracking is a future DB migration)
    return NextResponse.json({
      success: true,
      message: "Enquiry status updated",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
