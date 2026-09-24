import { Metadata } from "next";
import { db } from "@/lib/db";
import { PRODUCTS, Product } from "@/data/mockData";
import { ProductDetailView } from "@/components/product/ProductDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  if (process.env.DATABASE_URL) {
    try {
      const dbProduct = await db.product.findFirst({
        where: {
          OR: [{ slug }, { id: slug }, { sku: slug }],
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: true,
        },
      });

      if (dbProduct) {
        const imageUrls = dbProduct.images.map((img) => img.imageUrl);
        const primaryImage =
          imageUrls.length > 0
            ? imageUrls[0]
            : "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80";

        const rawSpecs =
          dbProduct.specifications &&
          typeof dbProduct.specifications === "object"
            ? (dbProduct.specifications as Record<string, unknown>)
            : {};

        const seoData = (rawSpecs._seo as Record<string, unknown>) || {};
        const cleanSpecs: Record<string, string> = {};
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
          brand: dbProduct.brand,
          category: dbProduct.category?.name || "Robotics & Hardware",
          price: dbProduct.price,
          mrp: dbProduct.mrp || Math.round(dbProduct.price * 1.3),
          discount: `${Math.round((((dbProduct.mrp || dbProduct.price * 1.3) - dbProduct.price) / (dbProduct.mrp || dbProduct.price * 1.3)) * 100)}% OFF`,
          rating: dbProduct.rating,
          reviews: dbProduct.reviewCount,
          inStock: dbProduct.inStock,
          image: primaryImage,
          images: imageUrls.length > 0 ? imageUrls : [primaryImage],
          description: dbProduct.description,
          features: dbProduct.features || [],
          specs: cleanSpecs,
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

  return (
    PRODUCTS.find(
      (p) =>
        (p.slug && p.slug === slug) ||
        p.id === slug ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug,
    ) || null
  );
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
