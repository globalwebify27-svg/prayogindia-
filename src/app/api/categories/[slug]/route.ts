import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";

interface Props {
  params: Promise<{ slug: string }>;
}

// GET /api/categories/[slug]
export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    if (process.env.DATABASE_URL) {
      const category = await db.category.findUnique({
        where: { slug },
        include: {
          products: {
            where: { inStock: true },
            take: 20,
          },
        },
      });

      if (category) {
        return NextResponse.json({ success: true, data: category });
      }
    }

    const category = CATEGORIES.find(
      (c) =>
        c.id === slug ||
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug,
    );
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    const categoryProducts = PRODUCTS.filter(
      (p) => p.category.toLowerCase() === category.name.toLowerCase(),
    );

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        products: categoryProducts,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch category details" },
      { status: 500 },
    );
  }
}
