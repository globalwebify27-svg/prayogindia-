import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// PATCH /api/admin/products/[slug] - Full Product Detail Update
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const resolvedParams = await params;
  const targetIdOrSlug = resolvedParams.slug;

  try {
    const body = await request.json();
    const {
      name,
      sku,
      brand,
      categoryName,
      subcategory,
      price,
      mrp,
      stock,
      inStock,
      description,
      images,
      videoUrl,
      features,
      applications,
      whatsIncluded,
      specs,
      weightGrams,
      dimensionsCm,
      shippingTag,
      airFreightAllowed,
      surfaceFreightAllowed,
      localPickupAllowed,
      isHazardousItem,
      isBatteryProduct,
      isFragileItem,
      isDangerousGoods,
    } = body;

    if (process.env.DATABASE_URL) {
      // Find product in DB by ID or Slug or SKU
      const existing = await db.product.findFirst({
        where: {
          OR: [
            { id: targetIdOrSlug },
            { slug: targetIdOrSlug },
            ...(sku ? [{ sku: sku.toUpperCase().trim() }] : []),
          ],
        },
      });

      if (existing) {
        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (sku) updateData.sku = sku.toUpperCase().trim();
        if (brand) updateData.brand = brand;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (mrp !== undefined) updateData.mrp = parseFloat(mrp);
        if (stock !== undefined) {
          updateData.stock = parseInt(stock, 10);
          updateData.inStock = parseInt(stock, 10) > 0;
        }
        if (inStock !== undefined) updateData.inStock = Boolean(inStock);
        if (body.gstPercent !== undefined) {
          updateData.gstRate = parseFloat(body.gstPercent);
        }
        if (weightGrams !== undefined) {
          updateData.weight = parseFloat(weightGrams);
        }
        if (features && Array.isArray(features)) {
          updateData.features = features;
        }
        if (applications && Array.isArray(applications)) {
          updateData.applications = applications;
        }
        if (shippingTag) {
          updateData.tags = [shippingTag];
        }
        if (specs && typeof specs === "object") {
          updateData.specifications = specs;
        }

        // Handle category association if categoryName provided
        if (categoryName) {
          const cat = await db.category.findFirst({
            where: {
              OR: [
                { name: { equals: categoryName, mode: "insensitive" } },
                {
                  slug: {
                    equals: categoryName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-"),
                  },
                },
              ],
            },
          });
          if (cat) {
            updateData.categoryId = cat.id;
          }
        }

        const updated = await db.product.update({
          where: { id: existing.id },
          data: updateData,
          include: { category: true, images: true, variants: true },
        });

        // Update product images if provided
        if (Array.isArray(images) && images.length > 0) {
          try {
            await db.productImage.deleteMany({
              where: { productId: existing.id },
            });
            await db.productImage.createMany({
              data: images.map((url: string, idx: number) => ({
                productId: existing.id,
                imageUrl: url,
                sortOrder: idx,
              })),
            });
          } catch {
            // Ignore image relation update issues
          }
        }

        return NextResponse.json({
          success: true,
          message: "Product updated successfully in database.",
          data: updated,
        });
      }
    }

    // Mock Mode fallback
    return NextResponse.json({
      success: true,
      message: "Product updated successfully (Mock Mode).",
      data: {
        id: targetIdOrSlug,
        ...body,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update product.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
