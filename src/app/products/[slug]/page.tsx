import { Metadata } from "next";
import { db } from "@/lib/db";
import { PRODUCTS, Product } from "@/data/mockData";
import { getCandidateSlugs, findMockProduct } from "@/lib/productResolver";
import { ProductDetailView } from "@/components/product/ProductDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(rawSlug: string): Promise<Product | null> {
  const candidates = getCandidateSlugs(rawSlug);
  const mockFallback = findMockProduct(rawSlug);

  if (process.env.DATABASE_URL) {
    try {
      const dbProduct = await db.product.findFirst({
        where: {
          OR: [
            { slug: { in: candidates } },
            { id: { in: candidates } },
            { sku: { in: candidates } },
          ],
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: true,
        },
      });

      if (dbProduct) {
        const mockFallbackEnriched =
          mockFallback ||
          PRODUCTS.find(
            (p) =>
              (p.slug && candidates.includes(p.slug.toLowerCase())) ||
              candidates.includes(p.id.toLowerCase()) ||
              (p.sku && candidates.includes(p.sku.toLowerCase())) ||
              (dbProduct.sku && p.sku && p.sku.toLowerCase() === dbProduct.sku.toLowerCase()) ||
              p.name.toLowerCase() === dbProduct.name.toLowerCase()
          );

        const rawImages = dbProduct.images.map((img) => img.imageUrl).filter(Boolean);
        const imageUrls =
          rawImages.length > 0
            ? rawImages
            : (dbProduct as { imageUrl?: string }).imageUrl
            ? [(dbProduct as { imageUrl?: string }).imageUrl!]
            : mockFallbackEnriched?.images && mockFallbackEnriched.images.length > 0
            ? mockFallbackEnriched.images
            : mockFallbackEnriched?.image
            ? [mockFallbackEnriched.image]
            : ["/images/products/4wd-robot-chassis-kit.jpg"];

        const primaryImage =
          imageUrls[0] ||
          mockFallbackEnriched?.image ||
          "/images/products/4wd-robot-chassis-kit.jpg";

        const rawSpecs =
          dbProduct.specifications &&
          typeof dbProduct.specifications === "object"
            ? (dbProduct.specifications as Record<string, unknown>)
            : {};

        const seoData = (rawSpecs._seo as Record<string, unknown>) || {};
        const cleanSpecs: Record<string, string> = { ...(mockFallbackEnriched?.specs || {}) };
        for (const [k, v] of Object.entries(rawSpecs)) {
          if (k !== "_seo" && typeof v === "string") {
            cleanSpecs[k] = v;
          }
        }

        return {
          id: dbProduct.id,
          slug: dbProduct.slug,
          name: dbProduct.name,
          sku: dbProduct.sku,
          brand: dbProduct.brand || mockFallbackEnriched?.brand || "Prayog India",
          category: dbProduct.category?.name || mockFallbackEnriched?.category || "Robotics & Hardware",
          price: dbProduct.price,
          mrp: dbProduct.mrp || mockFallbackEnriched?.mrp || Math.round(dbProduct.price * 1.3),
          discount: `${Math.round((((dbProduct.mrp || dbProduct.price * 1.3) - dbProduct.price) / (dbProduct.mrp || dbProduct.price * 1.3)) * 100)}% OFF`,
          rating: dbProduct.rating,
          reviews: dbProduct.reviewCount,
          inStock: dbProduct.inStock,
          image: primaryImage,
          images: imageUrls,
          description:
            dbProduct.description ||
            mockFallbackEnriched?.description ||
            "High-precision engineering component engineered for robotics and electronics prototyping.",
          features:
            dbProduct.features && dbProduct.features.length > 0
              ? dbProduct.features
              : mockFallbackEnriched?.features || [],
          specs: cleanSpecs,
          whatsIncluded: mockFallbackEnriched?.whatsIncluded || [],
          applications: mockFallbackEnriched?.applications || [],
          documents: mockFallbackEnriched?.documents || [],
          metaTitle: (seoData.metaTitle as string) || undefined,
          metaDescription: (seoData.metaDescription as string) || undefined,
          metaKeywords: Array.isArray(seoData.metaKeywords) ? (seoData.metaKeywords as string[]) : undefined,
          canonicalUrl: (seoData.canonicalUrl as string) || undefined,
          ogImage: (seoData.ogImage as string) || undefined,
          indexFollow: typeof seoData.indexFollow === "boolean" ? seoData.indexFollow : true,
          structuredDataType: (seoData.structuredDataType as string) || "Product",
        };
      }
    } catch {
      // Fallback to mock
    }
  }

  return mockFallback || null;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProduct(slug)) || PRODUCTS[0];

  const title =
    product?.metaTitle ||
    (product
      ? `${product.name} - Buy Online at Best Price | Prayog India`
      : "Product Details | Prayog India");

  const description =
    product?.metaDescription ||
    product?.description ||
    "Buy genuine robotics, STEM kits, and hardware components with fast express shipping from Prayog India.";

  const canonicalUrl =
    product?.canonicalUrl ||
    `https://www.prayogindia.com/products/${product?.slug || slug}`;

  const ogImageUrl = product?.ogImage || product?.image;

  return {
    title,
    description,
    keywords: product?.metaKeywords || [
      product?.name,
      product?.brand,
      product?.category,
      "Prayog India",
      "Robotics India",
      "STEM Hardware",
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: product?.indexFollow !== false,
      follow: product?.indexFollow !== false,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Prayog India",
      type: "website",
      images: ogImageUrl ? [{ url: ogImageUrl, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const schemaType = product?.structuredDataType || "Product";

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": schemaType,
        name: product.metaTitle || product.name,
        image: product.images || [product.image],
        description: product.metaDescription || product.description,
        sku: product.sku,
        brand: {
          "@type": "Brand",
          name: product.brand || "Prayog India",
        },
        offers: {
          "@type": "Offer",
          url: product.canonicalUrl || `https://www.prayogindia.com/products/${product.slug || slug}`,
          priceCurrency: "INR",
          price: product.price,
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Prayog India",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating || 4.9,
          reviewCount: product.reviews || 12,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailView slug={slug} initialProduct={product} />
    </>
  );
}
