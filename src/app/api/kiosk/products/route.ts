import { NextResponse } from "next/server";
import { getAuthenticatedStaff, hasRequiredRole } from "@/lib/staffAuth";
import { PRODUCTS } from "@/data/mockData";
import { getSecurityHeaders } from "@/lib/security";
import { db } from "@/lib/db";

// GET /api/kiosk/products - Kiosk Product Catalog scoped to store
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  // KIOSK_USER or SUPER_ADMIN or STORE_MANAGER can view kiosk products
  if (
    !staff ||
    !hasRequiredRole(staff, "KIOSK_USER", "SUPER_ADMIN", "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden. Kiosk or Staff access required." },
      { status: 403, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("q")?.toLowerCase();

  const storeCode = staff.storeCode || "RANCHI";

  let dbProducts: any[] = [];
  if (process.env.DATABASE_URL) {
    try {
      const dbItems = await db.product.findMany({
        include: { category: true, images: true },
        orderBy: { createdAt: "desc" },
      });
      dbProducts = dbItems.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || "Robotics & Components",
        price: p.price,
        mrp: p.mrp || p.price * 1.25,
        image: p.images?.[0]?.imageUrl || "",
        rating: p.rating || 4.8,
        reviews: p.reviewCount || 12,
        badge: undefined,
        inStock: p.inStock,
        stock: p.stock,
        storeOrigin: storeCode,
      }));
    } catch {
      // Fallback
    }
  }

  const existingIds = new Set(dbProducts.map((p) => p.id));
  const existingSkus = new Set(dbProducts.map((p) => (p.sku || "").toUpperCase()));
  let items = [
    ...dbProducts,
    ...PRODUCTS.filter((mp) => !existingIds.has(mp.id) && !existingSkus.has((mp.sku || "").toUpperCase())).map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      image: p.image,
      rating: p.rating,
      reviews: p.reviews,
      badge: p.badge,
      inStock: p.inStock,
      stock: typeof p.stock === "number" ? p.stock : p.inStock ? 50 : 0,
      storeOrigin: storeCode,
    })),
  ];

  if (category && category !== "all") {
    items = items.filter(
      (i) => i.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (search) {
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(search) ||
        i.sku.toLowerCase().includes(search) ||
        i.category.toLowerCase().includes(search),
    );
  }

  return NextResponse.json(
    {
      success: true,
      store: storeCode,
      storeName: staff.storeName || `${storeCode} Store Branch`,
      data: items,
    },
    { headers },
  );
}
