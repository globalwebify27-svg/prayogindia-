import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// GET /api/admin/learning — List all learning content
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const level = searchParams.get("level") || "all";
  const search = searchParams.get("search") || "";

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (category !== "all") where.category = category;
      if (level !== "all") where.level = level;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
        ];
      }

      const content = await db.learningContent.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: content });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] });
}

// POST /api/admin/learning — Create new learning content
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const {
      slug,
      title,
      category,
      readTime,
      level,
      shortDescription,
      bannerImage,
      content,
      relatedProductIds,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, message: "Title, slug and content are required" },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const existing = await db.learningContent.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Slug already exists" },
          { status: 409 },
        );
      }

      const item = await db.learningContent.create({
        data: {
          slug,
          title,
          category: category || "General",
          readTime: readTime || "5 min",
          level: level || "Beginner",
          shortDescription: shortDescription || "",
          bannerImage: bannerImage || "",
          content,
          relatedProductIds: relatedProductIds || [],
        },
      });

      return NextResponse.json({ success: true, data: item }, { status: 201 });
    }

    return NextResponse.json(
      { success: true, data: { id: `mock-${Date.now()}`, title, slug } },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/learning — Update learning content
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
    const {
      id,
      title,
      category,
      level,
      readTime,
      shortDescription,
      bannerImage,
      content,
      relatedProductIds,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Content ID required" },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const item = await db.learningContent.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(category && { category }),
          ...(level && { level }),
          ...(readTime && { readTime }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(bannerImage !== undefined && { bannerImage }),
          ...(content !== undefined && { content }),
          ...(relatedProductIds && { relatedProductIds }),
        },
      });
      return NextResponse.json({ success: true, data: item });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/learning — Delete learning content
export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Content ID required" },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      await db.learningContent.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: "Learning content deleted",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
