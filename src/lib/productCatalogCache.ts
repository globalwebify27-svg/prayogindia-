import { PRODUCTS, Product } from "@/data/mockData";

export interface PopularProduct extends Product {
  secondaryImage?: string;
}

const STORAGE_KEY_PRODUCTS = "prayog_live_catalog_cache";
const STORAGE_KEY_POPULAR = "prayog_live_popular_cache";

let inMemoryProducts: Product[] | null = null;
let inMemoryPopular: PopularProduct[] | null = null;
let activeFetchPromise: Promise<{ products: Product[]; popular: PopularProduct[] }> | null = null;

export function hasCachedProducts(): boolean {
  if (inMemoryProducts && inMemoryProducts.length > 0) return true;
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryProducts = parsed;
          return true;
        }
      }
    } catch {}
  }
  return false;
}

export function hasCachedPopularProducts(): boolean {
  if (inMemoryPopular && inMemoryPopular.length > 0) return true;
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY_POPULAR);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryPopular = parsed;
          return true;
        }
      }
    } catch {}
  }
  return false;
}

export function getCachedProducts(): Product[] {
  if (inMemoryProducts && inMemoryProducts.length > 0) {
    return inMemoryProducts;
  }
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryProducts = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return PRODUCTS;
}

export function getCachedPopularProducts(fallback: PopularProduct[]): PopularProduct[] {
  if (inMemoryPopular && inMemoryPopular.length > 0) {
    return inMemoryPopular;
  }
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY_POPULAR);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryPopular = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return fallback;
}

export async function fetchAndCacheLiveCatalog(popularFallback: PopularProduct[]): Promise<{
  products: Product[];
  popular: PopularProduct[];
}> {
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const res = await fetch("/api/products?limit=100");
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();

      if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
        const apiProducts: Product[] = json.data.map((item: any) => {
          const primaryImg =
            item.images?.[0]?.imageUrl ||
            (Array.isArray(item.images) && typeof item.images[0] === "string"
              ? item.images[0]
              : "/placeholder-product.png");
          const secondaryImg =
            item.images?.[1]?.imageUrl ||
            (Array.isArray(item.images) && typeof item.images[1] === "string"
              ? item.images[1]
              : primaryImg);
          const allImages = Array.isArray(item.images)
            ? item.images.map((im: any) =>
                typeof im === "string" ? im : im.imageUrl,
              )
            : [primaryImg];

          return {
            id: item.id,
            slug: item.slug || item.id,
            name: item.name,
            brand:
              item.brand && item.brand.trim().toLowerCase() !== "prayog india"
                ? item.brand
                : undefined,
            category: item.category?.name || item.categoryName || "Robotics & Components",
            subcategory: item.subcategory,
            price: item.price,
            mrp: item.mrp || item.price * 1.2,
            discount:
              item.mrp && item.mrp > item.price
                ? `${Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF`
                : "",
            rating: item.rating ?? 4.8,
            reviews: item.reviewCount ?? 12,
            inStock: item.inStock ?? item.stock > 0,
            image: primaryImg,
            secondaryImage: secondaryImg,
            images: allImages,
            badge: item.badge,
            description: item.description || "",
            features: item.features || [],
            specs: (item.specifications as Record<string, string>) || {},
          };
        });

        // 1. Process all products
        const existingIds = new Set(PRODUCTS.map((p) => p.id));
        const existingSlugs = new Set(PRODUCTS.map((p) => p.slug).filter(Boolean));
        const newDbOnly = apiProducts.filter(
          (p) => !existingIds.has(p.id) && (!p.slug || !existingSlugs.has(p.slug)),
        );
        const updatedMock = PRODUCTS.map((p) => {
          const match = apiProducts.find(
            (ap) => ap.id === p.id || (ap.slug && p.slug && ap.slug === p.slug),
          );
          return match || p;
        });

        const combinedProducts = [...newDbOnly, ...updatedMock];
        const seenIds = new Set<string>();
        const uniqueProducts = combinedProducts.filter((p) => {
          if (!p.id || seenIds.has(p.id)) return false;
          seenIds.add(p.id);
          return true;
        });

        // 2. Process popular products
        const popularExistingIds = new Set(popularFallback.map((p) => p.id));
        const popularExistingSlugs = new Set(popularFallback.map((p) => p.slug).filter(Boolean));
        const popularNewDb = apiProducts.filter(
          (p) => !popularExistingIds.has(p.id) && (!p.slug || !popularExistingSlugs.has(p.slug)),
        );
        const popularUpdatedMock = popularFallback.map((p) => {
          const match = apiProducts.find(
            (ap) => ap.id === p.id || (ap.slug && p.slug && ap.slug === p.slug),
          );
          return (match as PopularProduct) || p;
        });

        const combinedPopular = [...popularNewDb, ...popularUpdatedMock];
        const seenPopIds = new Set<string>();
        const uniquePopular = combinedPopular.filter((p) => {
          if (!p.id || seenPopIds.has(p.id)) return false;
          seenPopIds.add(p.id);
          return true;
        });

        inMemoryProducts = uniqueProducts;
        inMemoryPopular = uniquePopular;

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(uniqueProducts));
            sessionStorage.setItem(STORAGE_KEY_POPULAR, JSON.stringify(uniquePopular));
          } catch {}
        }

        return { products: uniqueProducts, popular: uniquePopular };
      }
    } catch (err) {
      console.warn("fetchAndCacheLiveCatalog error:", err);
    } finally {
      activeFetchPromise = null;
    }

    return { products: PRODUCTS, popular: popularFallback };
  })();

  return activeFetchPromise;
}
