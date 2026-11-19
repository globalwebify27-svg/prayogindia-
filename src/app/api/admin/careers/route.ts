import { NextResponse } from "next/server";
import {
  getCareersRecordsFromDisk,
  createCareersJob,
  updateCareersJob,
  deleteCareersJob,
  saveCareersRecordsToDisk,
  JobOpeningRecord,
} from "@/lib/careersStore";
import { getSecurityHeaders } from "@/lib/security";

export async function GET() {
  const headers = getSecurityHeaders();
  const jobs = getCareersRecordsFromDisk();

  const total = jobs.length;
  const activeCount = jobs.filter((j) => j.isActive).length;
  const departments = Array.from(new Set(jobs.map((j) => j.department)));
  const featuredCount = jobs.filter((j) => j.isFeatured).length;

  return NextResponse.json(
    {
      success: true,
      data: jobs,
      stats: {
        total,
        activeCount,
        departmentsCount: departments.length,
        featuredCount,
        departments,
      },
    },
    { headers },
  );
}

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();

    if (!body.title || !body.department || !body.shortDescription) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, Department, and Short Description are required.",
        },
        { status: 400, headers },
      );
    }

    const created = createCareersJob({
      title: body.title,
      slug: body.slug,
      department: body.department,
      location: body.location || "Bengaluru, Karnataka",
      type: body.type || "Full-time",
      experience: body.experience || "1 - 3 Years",
      salaryRange: body.salaryRange || "Best in Industry",
      tags: Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
          ? body.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],
      isFeatured: Boolean(body.isFeatured),
      shortDescription: body.shortDescription,
      responsibilities: Array.isArray(body.responsibilities)
        ? body.responsibilities
        : typeof body.responsibilities === "string"
          ? body.responsibilities
              .split("\n")
              .map((r: string) => r.replace(/^[•\-\*]\s*/, "").trim())
              .filter(Boolean)
          : [],
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : typeof body.requirements === "string"
          ? body.requirements
              .split("\n")
              .map((r: string) => r.replace(/^[•\-\*]\s*/, "").trim())
              .filter(Boolean)
          : [],
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: "Job opening published successfully.",
      },
      { status: 201, headers },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500, headers },
    );
  }
}

export async function PUT(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();

    // Check if bulk reorder
    if (Array.isArray(body)) {
      saveCareersRecordsToDisk(body as JobOpeningRecord[]);
      return NextResponse.json(
        {
          success: true,
          message: "Job postings reordered successfully.",
        },
        { headers },
      );
    }

    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Job ID is required for updating." },
        { status: 400, headers },
      );
    }

    // Process tags, responsibilities, requirements if passed as string
    if (typeof updates.tags === "string") {
      updates.tags = updates.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    if (typeof updates.responsibilities === "string") {
      updates.responsibilities = updates.responsibilities
        .split("\n")
        .map((r: string) => r.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);
    }
    if (typeof updates.requirements === "string") {
      updates.requirements = updates.requirements
        .split("\n")
        .map((r: string) => r.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);
    }

    const updated = updateCareersJob(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Job opening not found." },
        { status: 404, headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: "Job opening updated successfully.",
      },
      { headers },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500, headers },
    );
  }
}

export async function DELETE(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body optional if passed via query param
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Job ID is required for deletion." },
        { status: 400, headers },
      );
    }

    const deleted = deleteCareersJob(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Job opening not found or already deleted." },
        { status: 404, headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job opening deleted successfully.",
      },
      { headers },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500, headers },
    );
  }
}
