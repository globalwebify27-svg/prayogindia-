import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PRODUCTS } from "@/data/mockData";

/**
 * GET /api/products/suggestions
 * Returns lightweight autocomplete suggestions (top 5-8 items with minimal fields).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();
  const limit = Math.min(
    10,
    Math.max(1, parseInt(searchParams.get("limit") || "6", 10)),
  );

  if (!q || q.length < 1) {
    return NextResponse.json({
      success: true,
      data: [],
    });
  }

  if (process.env.DATABASE_URL) {
    try {
      const suggestions = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
          ],
          inStock: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          mrp: true,
          images: {
            take: 1,
            select: { imageUrl: true },
          },
        },
        take: limit,
      });

      return NextResponse.json({
        success: true,
        data: suggestions.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          price: s.price,
          mrp: s.mrp,
          image:
            s.images[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
        })),
      });
    } catch (error) {
      console.warn(
        "Database query failed for search suggestions, falling back to mock dataset",
        error,
      );
    }
  }

  // Fallback Mock Dataset
  const matches = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  ).slice(0, limit);

  return NextResponse.json({
    success: true,
    data: matches.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug || p.id,
      price: p.price,
      mrp: p.mrp,
      image: p.image,
    })),
  });
}
