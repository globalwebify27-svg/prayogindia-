import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { PRODUCTS } from "@/data/mockData";
import { searchProductsFuzzy } from "@/lib/fuzzySearch";

// Lightweight server-side in-memory cache to minimize database load
interface CacheEntry {
  data: SearchResultItem[];
  timestamp: number;
}

export interface SearchResultItem {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  mrp?: number;
  rating?: number;
  inStock: boolean;
  image: string;
  brand?: string;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
const MAX_CACHE_SIZE = 300;

function cleanOldCache() {
  if (searchCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, entry] of searchCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        searchCache.delete(key);
      }
    }
    // If still over limit, remove oldest entries
    if (searchCache.size > MAX_CACHE_SIZE) {
      const keysToDelete = Array.from(searchCache.keys()).slice(0, 100);
      keysToDelete.forEach((k) => searchCache.delete(k));
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.max(1, Math.min(10, parseInt(searchParams.get("limit") || "6", 10)));

    if (!query) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const cacheKey = `${query.toLowerCase()}__${limit}`;

    // 1. Check in-memory cache first to avoid ANY database query
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        {
          success: true,
          data: cached.data,
          count: cached.data.length,
          cached: true,
        },
        {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }

    let results: SearchResultItem[] = [];

    // 2. Query PostgreSQL Database if available
    if (isDatabaseAvailable() && process.env.DATABASE_URL) {
      try {
        const dbProducts = await db.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { category: { name: { contains: query, mode: "insensitive" } } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            mrp: true,
            rating: true,
            inStock: true,
            brand: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            images: {
              take: 1,
              select: {
                imageUrl: true,
              },
            },
          },
          take: limit,
          orderBy: [
            { inStock: "desc" },
            { rating: "desc" },
          ],
        });

        results = dbProducts.map((p) => {
          const img =
            p.images?.[0]?.imageUrl ||
            "/placeholder-product.png";

          return {
            id: p.id,
            slug: p.slug || p.id,
            name: p.name,
            sku: p.sku || `SKU-${p.id.slice(0, 6)}`,
            category: p.category?.name || "Components",
            price: p.price,
            mrp: p.mrp ?? undefined,
            rating: p.rating ?? 4.8,
            inStock: p.inStock,
            image: img,
            brand: p.brand && p.brand.toLowerCase() !== "prayog india" ? p.brand : undefined,
          };
        });
      } catch (dbError) {
        console.warn("[Search API] Database query failed, falling back to mock fuzzy search:", dbError);
        // Fallback to fuzzy search below
      }
    }

    // 3. Fallback or merge with mockData if DB returned 0 results or was unreachable
    if (results.length === 0) {
      const fuzzyMatches = searchProductsFuzzy(PRODUCTS, query).slice(0, limit);
      results = fuzzyMatches.map((p) => ({
        id: p.id,
        slug: p.slug || p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        mrp: p.mrp,
        rating: p.rating,
        inStock: p.inStock,
        image: p.image || "/placeholder-product.png",
        brand: p.brand,
      }));
    }

    // Cache the resolved results
    cleanOldCache();
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        data: results,
        count: results.length,
        cached: false,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[Search API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform search",
        data: [],
      },
      { status: 500 }
    );
  }
}
