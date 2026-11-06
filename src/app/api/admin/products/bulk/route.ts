import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { PRODUCTS } from "@/data/mockData";
import { registerProductInEngine } from "@/lib/inventoryEngine";

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden. Admin authentication required." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const rawProducts = Array.isArray(body) ? body : body.products;
    const updateExisting = Boolean(body.updateExisting);

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return NextResponse.json(
        { success: false, message: "No product rows provided in CSV data." },
        { status: 400 }
      );
    }

    const importedItems: any[] = [];
    let createdCount = 0;
    let updatedCount = 0;
    const errors: Array<{ row: number; name: string; error: string }> = [];

    for (let i = 0; i < rawProducts.length; i++) {
      const p = rawProducts[i];
      const rowNum = i + 1;

      try {
        const name = String(p.name || p.Name || p["Product Name"] || "").trim();
        if (!name) {
          errors.push({ row: rowNum, name: "Unknown", error: "Product Name is required" });
          continue;
        }

        const rawPrice = p.price ?? p.Price ?? p["Price (INR)"] ?? p["Price(INR)"] ?? 0;
        const price = Math.max(0, parseFloat(String(rawPrice)) || 0);

        const rawMrp = p.mrp ?? p.MRP ?? p["MRP (INR)"] ?? p["MRP(INR)"] ?? (price * 1.25);
        const mrp = Math.max(price, parseFloat(String(rawMrp)) || Math.round(price * 1.25));

        const rawStock = p.stock ?? p.Stock ?? p.quantity ?? 25;
        const stock = Math.max(0, parseInt(String(rawStock), 10) || 0);
        const inStock = stock > 0;

        const rawSku = p.sku || p.SKU || p.id || p.ID || "";
        const cleanSku = String(rawSku).trim().toUpperCase() ||
          `PRG-${name.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const brand = String(p.brand || p.Brand || "Prayog India").trim();
        const category = String(p.category || p.Category || "Electronic Components").trim();
        const subcategory = String(p.subcategory || p.Subcategory || "").trim();
        const description = String(p.description || p.Description || `${name} by ${brand}. High quality hardware component.`).trim();

        // Image Handling
        const rawImages = p.images || p.Images || p["All Image URLs"] || p.image || p["Primary Image URL"] || "";
        let imagesList: string[] = [];
        if (Array.isArray(rawImages)) {
          imagesList = rawImages.map(String).filter(Boolean);
        } else if (typeof rawImages === "string" && rawImages.trim()) {
          imagesList = rawImages
            .split(/[;,|]/)
            .map((s) => s.trim())
            .filter((s) => s.startsWith("http") || s.startsWith("/"));
        }
        const primaryImage = imagesList.length > 0 ? imagesList[0] : "";

        // Video URL
        const videoUrl = String(p.videoUrl || p.Video || p["Video URL"] || "").trim() || undefined;

        // SEO Fields
        const autoSlug = (p.slug || p.Slug || p.seoSlug || p["SEO Slug"] || name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        const metaTitle = String(
          p.metaTitle || p["Meta Title"] || `${name} - Buy Online at Best Price | ${brand}`
        ).trim();

        const metaDescription = String(
          p.metaDescription || p["Meta Description"] || description.slice(0, 160)
        ).trim();

        const rawKeywords = p.metaKeywords || p["Meta Keywords"] || p.keywords || "";
        const metaKeywords = Array.isArray(rawKeywords)
          ? rawKeywords.map(String)
          : typeof rawKeywords === "string" && rawKeywords.trim()
          ? rawKeywords.split(/[,;|]/).map((k) => k.trim()).filter(Boolean)
          : ["prayog india", brand.toLowerCase(), name.toLowerCase().slice(0, 20)];

        const canonicalUrl = String(
          p.canonicalUrl || p["Canonical URL"] || `https://www.prayogindia.com/products/${autoSlug}`
        ).trim();

        const ogImage = String(p.ogImage || p["OG Image URL"] || primaryImage).trim();
        const structuredDataType = String(p.structuredDataType || p["Schema Structured Type"] || "Product").trim();
        const indexFollow = p.indexFollow !== false && p["Robots Indexing"] !== "noindex";

        // Specifications
        let specsObj: Record<string, string> = {};
        const rawSpecs = p.specs || p["Technical Specs"] || p.specifications;
        if (typeof rawSpecs === "object" && rawSpecs !== null) {
          specsObj = { ...rawSpecs };
        } else if (typeof rawSpecs === "string" && rawSpecs.trim()) {
          rawSpecs.split(";").forEach((pair) => {
            const [k, v] = pair.split(/[:=]/).map((s) => s.trim());
            if (k && v) specsObj[k] = v;
          });
        }

        // Features & applications
        const parseList = (val: any): string[] => {
          if (Array.isArray(val)) return val.map(String);
          if (typeof val === "string" && val.trim()) {
            return val.split(/[|;]/).map((s) => s.trim()).filter(Boolean);
          }
          return [];
        };

        const features = parseList(p.features || p["Key Features"]);
        const applications = parseList(p.applications || p.Applications);
        const whatsIncluded = parseList(p.whatsIncluded || p["Whats Included"] || p["What's Included"]);

        const weightGrams = parseInt(String(p.weightGrams || p["Weight (grams)"] || 250), 10) || 250;
        const shippingTag = String(p.shippingTag || p["Shipping Tag"] || "Standard").trim();

        const productPayload = {
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          slug: autoSlug,
          name,
          sku: cleanSku,
          brand,
          category,
          subcategory,
          price,
          mrp,
          discount: `${Math.round(((mrp - price) / mrp) * 100)}% OFF`,
          rating: 5.0,
          reviews: 0,
          inStock,
          stock,
          image: primaryImage,
          images: imagesList,
          videoUrl,
          description,
          features: features.length > 0 ? features : ["High quality STEM standard hardware component"],
          applications: applications.length > 0 ? applications : ["Robotics", "STEM Education", "Prototyping"],
          whatsIncluded: whatsIncluded.length > 0 ? whatsIncluded : [`1x ${name}`],
          specs: {
            ...specsObj,
            _seo: {
              metaTitle,
              metaDescription,
              metaKeywords,
              canonicalUrl,
              ogImage,
              indexFollow,
              structuredDataType,
            },
          },
          weightGrams,
          shippingTag,
          airFreightAllowed: shippingTag !== "Battery Item",
          surfaceFreightAllowed: true,
          metaTitle,
          metaDescription,
          metaKeywords,
          canonicalUrl,
          ogImage,
          indexFollow,
          structuredDataType,
          seoSlug: autoSlug,
        };

        // If database is configured
        if (process.env.DATABASE_URL) {
          try {
            const existingInDb = await db.product.findUnique({
              where: { sku: cleanSku },
            });

            if (existingInDb) {
              if (updateExisting) {
                const updated = await db.product.update({
                  where: { sku: cleanSku },
                  data: {
                    name,
                    price,
                    mrp,
                    description,
                    stock,
                    inStock,
                    weight: weightGrams,
                    specifications: productPayload.specs,
                    features,
                    applications,
                    tags: shippingTag ? [shippingTag] : [],
                  },
                });
                updatedCount++;
                importedItems.push(updated);
                continue;
              } else {
                errors.push({
                  row: rowNum,
                  name,
                  error: `Product with SKU "${cleanSku}" already exists. Enable "Update existing" to overwrite.`,
                });
                continue;
              }
            }

            // Create in database
            let categoryRecord = await db.category.findFirst({
              where: {
                OR: [
                  { name: { equals: category, mode: "insensitive" } },
                  { slug: { equals: category.toLowerCase().replace(/[^a-z0-9]+/g, "-") } },
                ],
              },
            });

            if (!categoryRecord) {
              categoryRecord = await db.category.create({
                data: {
                  name: category,
                  slug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  description: `${category} hardware & STEM kits`,
                },
              });
            }

            const created = await db.product.create({
              data: {
                name,
                sku: cleanSku,
                slug: autoSlug,
                price,
                mrp,
                stock,
                inStock,
                description,
                categoryId: categoryRecord.id,
                weight: weightGrams,
                specifications: productPayload.specs,
                features,
                applications,
                tags: shippingTag ? [shippingTag] : [],
                images: {
                  create: imagesList.map((url, idx) => ({
                    imageUrl: url,
                    altText: `${name} - Image ${idx + 1}`,
                    sortOrder: idx,
                  })),
                },
              },
            });
            createdCount++;
            importedItems.push(created);
          } catch (dbErr: any) {
            // DB fallback
            registerProductInEngine(productPayload as any);
            createdCount++;
            importedItems.push(productPayload);
          }
        } else {
          // In-memory fallback
          registerProductInEngine(productPayload as any);
          createdCount++;
          importedItems.push(productPayload);
        }
      } catch (rowErr: any) {
        errors.push({
          row: rowNum,
          name: p.name || `Row ${rowNum}`,
          error: rowErr?.message || "Failed to process row",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed: ${createdCount} created, ${updatedCount} updated.`,
      createdCount,
      updatedCount,
      totalProcessed: rawProducts.length,
      errors,
      data: {
        createdCount,
        updatedCount,
        totalProcessed: rawProducts.length,
        errors,
        items: importedItems,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An error occurred during bulk CSV import.",
      },
      { status: 500 }
    );
  }
}
