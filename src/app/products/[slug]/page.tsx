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

        const specsObj =
          dbProduct.specifications && typeof dbProduct.specifications === "object"
            ? (dbProduct.specifications as Record<string, string>)
            : {};

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
          specs: specsObj,
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

  const title = product
    ? `${product.name} | Prayog India Store`
    : "Product Details | Prayog India";
  const description = product
    ? product.description
    : "Buy genuine robotics & STEM hardware components.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product?.image ? [{ url: product.image }] : [],
    },
  };
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images || [product.image],
        description: product.description,
        sku: product.sku,
        brand: {
          "@type": "Brand",
          name: product.brand || "Prayog India",
        },
        offers: {
          "@type": "Offer",
          url: `https://www.prayogindia.com/products/${product.slug || slug}`,
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
          ratingValue: product.rating || 4.5,
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

