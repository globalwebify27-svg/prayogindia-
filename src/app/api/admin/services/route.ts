import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import {
  getStoredServiceEnquiries,
  updateStoredServiceEnquiry,
  deleteStoredServiceEnquiry,
  resolveServiceMeta,
} from "@/lib/serviceEnquiriesStore";

const DEFAULT_SERVICES = [
  { id: "stem-lab-setup", name: "STEM Lab Setup", slug: "STEM_LAB_SETUP" },
  { id: "robotics-lab-setup", name: "Robotics Lab", slug: "ROBOTICS_LAB_SETUP" },
  { id: "drone-lab-setup", name: "Drone Lab", slug: "DRONE_LAB_SETUP" },
  { id: "industrial-iot-lab", name: "Industrial Projects", slug: "INDUSTRIAL_PROJECTS" },
  { id: "ai-cv-lab", name: "Consultancy", slug: "CONSULTANCY" },
];

function normalizeSlug(slug?: string | null): string {
  if (!slug) return "";
  return slug.toLowerCase().replace(/[-_]/g, "");
}

// GET /api/admin/services — List all service enquiries with persistent fallback
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
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  let dbEnquiries: any[] = [];
  let dbServices: any[] = [];

  if (process.env.DATABASE_URL) {
    try {
      dbEnquiries = await db.serviceEnquiry.findMany({
        include: {
          service: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      dbServices = await db.service.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { enquiries: true } },
        },
      });
    } catch (error: any) {
      console.warn("Database query failed in admin services route, using persistent store:", error.message);
    }
  }

  // Always read from persistent store
  const storedEnquiries = getStoredServiceEnquiries();

  // Merge DB and Stored enquiries, avoiding duplicate IDs
  const seenIds = new Set<string>();
  const mergedEnquiries: any[] = [];

  for (const enq of [...storedEnquiries, ...dbEnquiries]) {
    if (!seenIds.has(enq.id)) {
      seenIds.add(enq.id);
      // Ensure service object exists
      if (!enq.service) {
        enq.service = resolveServiceMeta(enq.serviceId, enq.serviceName);
      }
      mergedEnquiries.push(enq);
    }
  }

  // Sort descending by creation date
  mergedEnquiries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Compute dynamic counts per service
  const serviceCounts: Record<string, number> = {};
  for (const enq of mergedEnquiries) {
    const norm = normalizeSlug(enq.service?.slug);
    if (norm) {
      serviceCounts[norm] = (serviceCounts[norm] || 0) + 1;
    }
  }

  const services = DEFAULT_SERVICES.map((s) => ({
    ...s,
    _count: {
      enquiries: serviceCounts[normalizeSlug(s.slug)] || 0,
    },
  }));

  // Apply service filter if specified
  let filtered = mergedEnquiries;
  if (serviceSlug && serviceSlug !== "all") {
    const targetNorm = normalizeSlug(serviceSlug);
    filtered = filtered.filter(
      (e) => normalizeSlug(e.service?.slug) === targetNorm,
    );
  }

  // Apply search query filter if specified
  if (search) {
    filtered = filtered.filter((e) => {
      return (
        e.name?.toLowerCase().includes(search) ||
        e.email?.toLowerCase().includes(search) ||
        e.phone?.includes(search) ||
        e.message?.toLowerCase().includes(search) ||
        e.notes?.toLowerCase().includes(search) ||
        e.service?.name?.toLowerCase().includes(search)
      );
    });
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    services,
  });
}

// PATCH /api/admin/services — Update status / admin notes with persistence
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

    const updated = updateStoredServiceEnquiry(id, {
      ...(status ? { status } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry status updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/services — Delete enquiry
export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Enquiry ID required" },
        { status: 400 },
      );
    }

    deleteStoredServiceEnquiry(id);

    if (process.env.DATABASE_URL) {
      try {
        await db.serviceEnquiry.delete({ where: { id } });
      } catch (e) {
        // Silently ignore if not found in db
      }
    }

    return NextResponse.json({
      success: true,
      message: "Service enquiry deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
