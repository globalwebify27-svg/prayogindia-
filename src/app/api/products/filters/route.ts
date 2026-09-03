import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PRODUCTS, CATEGORIES } from "@/data/mockData";

/**
 * GET /api/products/filters
 * Returns global filter metadata (categories list, min/max price range bounds, total in-stock count).
 */
export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const [categories, priceAgg, totalInStock] = await Promise.all([
        db.category.findMany({ select: { id: true, name: true, slug: true } }),
        db.product.aggregate({
          _min: { price: true },
          _max: { price: true },
        }),
        db.product.count({ where: { inStock: true } }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          categories,
          priceBounds: {
            min: Math.floor(priceAgg._min.price || 0),
            max: Math.ceil(priceAgg._max.price || 50000),
          },
          totalInStock,
          sortOptions: [
            { label: "Newest Arrivals", value: "newest" },
            { label: "Price: Low to High", value: "price-asc" },
            { label: "Price: High to Low", value: "price-desc" },
            { label: "Name: A to Z", value: "name" },
          ],
        },
      });
    } catch (error) {
      console.warn(
        "Database query failed for product filters, falling back to mock dataset",
        error,
      );
    }
  }

  // Fallback Mock Dataset
  const prices = PRODUCTS.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return NextResponse.json({
    success: true,
    data: {
      categories: CATEGORIES,
      priceBounds: {
        min: minPrice,
        max: maxPrice,
      },
      totalInStock: PRODUCTS.filter((p) => p.inStock).length,
      sortOptions: [
        { label: "Newest Arrivals", value: "newest" },
        { label: "Price: Low to High", value: "price-asc" },
        { label: "Price: High to Low", value: "price-desc" },
        { label: "Name: A to Z", value: "name" },
      ],
    },
  });
}
