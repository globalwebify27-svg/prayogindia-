import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// GET /api/admin/categories — List all categories with hierarchy
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const categories = await db.category.findMany({
        include: {
          children: {
            include: {
              children: true,
              _count: { select: { products: true } },
            },
          },
          _count: { select: { products: true } },
        },
        where: { parentId: null }, // Top-level only, children included
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, data: [] });
}

// POST /api/admin/categories — Create a new category
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug, description, image, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, message: "Name and slug are required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const existing = await db.category.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ success: false, message: "Slug already exists" }, { status: 409 });
      }

      const category = await db.category.create({
        data: { name, slug, description, image, parentId: parentId || null },
      });

      return NextResponse.json({ success: true, data: category }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: { id: `mock-${Date.now()}`, name, slug } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/categories — Update a category
export async function PATCH(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, slug, description, image, parentId } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Category ID required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const category = await db.category.update({
        where: { id },
        data: { name, slug, description, image, parentId: parentId || null },
      });
      return NextResponse.json({ success: true, data: category });
    }

    return NextResponse.json({ success: true, data: { id, name } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/categories — Delete a category
export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Category ID required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      // Check if category has products
      const count = await db.product.count({ where: { categoryId: id } });
      if (count > 0) {
        return NextResponse.json(
          { success: false, message: `Cannot delete — ${count} products are assigned to this category` },
          { status: 409 }
        );
      }

      await db.category.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Category deleted" });
    }

    return NextResponse.json({ success: true, message: "Deleted (mock)" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
