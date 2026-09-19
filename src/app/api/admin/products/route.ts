import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { PRODUCTS } from "@/data/mockData";
import { registerProductInEngine } from "@/lib/inventoryEngine";

// GET /api/admin/products - List All Products for Admin Management
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "15", 10)),
  );

  if (process.env.DATABASE_URL) {
    try {
      const where: Record<string, unknown> = {};
      if (category && category !== "all") where.categoryId = category;
      if (q) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        db.product.findMany({
          where,
          include: { category: true, images: true, variants: true },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.product.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch products.";
      return NextResponse.json(
        { success: false, message },
        { status: 500 },
      );
    }
  }

  // Mock Fallback
  let items = [...PRODUCTS];
  if (q)
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.sku.toLowerCase().includes(q.toLowerCase()),
    );
  if (category && category !== "all")
    items = items.filter((p) => p.category === category);

  return NextResponse.json({
    success: true,
    data: {
      items: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    },
  });
}

// POST /api/admin/products - Create New Product with Full Details & Cloudinary Media
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden. Admin authentication required." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      categoryId,
      categoryName,
      subcategory,
      price,
      mrp,
      stock,
      sku,
      description,
      brand = "Prayog India",
      images = [],
      videoUrl = "",
      features = [],
      applications = [],
      whatsIncluded = [],
      specs = {},
      weightGrams = 250,
      dimensionsCm = { length: 15, width: 10, height: 5 },
      shippingTag = "Standard",
      airFreightAllowed = true,
      surfaceFreightAllowed = true,
      localPickupAllowed: _localPickupAllowed = true,
      isBatteryProduct: _isBatteryProduct = false,
      isHazardousItem: _isHazardousItem = false,
      isFragileItem: _isFragileItem = false,
      isDangerousGoods: _isDangerousGoods = false,
    } = body;

    if (!name || !price || !sku || !description) {
      return NextResponse.json(
        { success: false, message: "Name, price, SKU, and description are required." },
        { status: 400 },
      );
    }

    const cleanSku = String(sku).trim().toUpperCase();
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "product";

    let slug = baseSlug;

    if (process.env.DATABASE_URL) {
      // Find a collision-free slug
      let count = 1;
      while (await db.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${cleanSku.toLowerCase()}${count > 1 ? `-${count}` : ""}`;
        count++;
        // If still colliding, append timestamp
        if (count > 5) {
          slug = `${baseSlug}-${Date.now().toString(36)}`;
          break;
        }
      }
    }

    const parsedPrice = parseFloat(price);
    const parsedMrp = mrp ? parseFloat(mrp) : Math.round(parsedPrice * 1.3);
    const parsedStock = parseInt(String(stock || 0), 10);
    const inStock = parsedStock > 0;

    // Primary image is the first one or fallback
    const primaryImage =
      images.length > 0
        ? images[0]
        : "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80";

    // Prepare in-memory fallback product object
    const productForEngine = {
      id: `prod-${Date.now()}`,
      slug,
      name,
      sku: cleanSku,
      brand,
      category: categoryName || "Robotics & Hardware",
      subcategory: subcategory || "",
      price: parsedPrice,
      mrp: parsedMrp,
      discount: `${Math.round(((parsedMrp - parsedPrice) / parsedMrp) * 100)}% OFF`,
      rating: 5.0,
      reviews: 1,
      inStock,
      image: primaryImage,
      images: images.length > 0 ? images : [primaryImage],
      videoUrl: videoUrl || undefined,
      description,
      features: Array.isArray(features) ? features : [],
      applications: Array.isArray(applications) ? applications : [],
      whatsIncluded: Array.isArray(whatsIncluded) ? whatsIncluded : [],
      specs: typeof specs === "object" && specs !== null ? specs : {},
      weightGrams: Number(weightGrams) || 250,
      dimensionsCm,
      shippingTag,
      airFreightAllowed,
      surfaceFreightAllowed,
    };

    if (process.env.DATABASE_URL) {
      // Find or match category
      let targetCatId = categoryId;
      if (!targetCatId && categoryName) {
        const matched = await db.category.findFirst({
          where: {
            OR: [
              { name: { equals: categoryName, mode: "insensitive" } },
              { slug: { equals: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-") } },
            ],
          },
        });
        if (matched) targetCatId = matched.id;
      }

      if (!targetCatId) {
        const defaultCat = await db.category.findFirst();
        targetCatId = defaultCat?.id;
      }

      if (!targetCatId) {
        // Auto-create category if needed
        const newCat = await db.category.create({
          data: {
            name: categoryName || "Hardware & Electronics",
            slug: (categoryName || "hardware-electronics")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-"),
            description: "Robotics and STEM Components",
          },
        });
        targetCatId = newCat.id;
      }

      // Check if SKU already exists in DB
      const existing = await db.product.findUnique({
        where: { sku: cleanSku },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, message: `Product with SKU "${cleanSku}" already exists.` },
          { status: 409 },
        );
      }

      const createdProduct = await db.product.create({
        data: {
          name,
          slug,
          sku: cleanSku,
          description,
          price: parsedPrice,
          mrp: parsedMrp,
          stock: parsedStock,
          inStock,
          brand,
          categoryId: targetCatId,
          features: Array.isArray(features) ? features : [],
          specifications: specs || {},
          images: {
            create: images.map((imgUrl: string, idx: number) => ({
              imageUrl: imgUrl,
              altText: `${name} Image ${idx + 1}`,
              sortOrder: idx,
            })),
          },
        },
        include: {
          category: true,
          images: true,
        },
      });

      // Also upsert Central Ranchi store stock in DB if store exists
      try {
        await registerProductInEngine(createdProduct.id, parsedStock);
      } catch {
        // Non-blocking
      }

      return NextResponse.json({
        success: true,
        message: "Product created and published successfully.",
        data: createdProduct,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Product created (In-Memory Engine Mode).",
      data: productForEngine,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
