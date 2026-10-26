import { Product } from "@/data/mockData";

const RECENTLY_VIEWED_KEY = "prayog_recently_viewed_products";

/**
 * Retrieves the customer's recently viewed products from localStorage.
 */
export function getRecentlyViewedProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read recently viewed products:", err);
    return [];
  }
}

/**
 * Records a product view into localStorage and notifies active components.
 */
export function recordProductView(product: Product) {
  if (typeof window === "undefined" || !product?.id) return;
  try {
    const current = getRecentlyViewedProducts();
    const filtered = current.filter(
      (p) => p.id !== product.id && (p.slug && product.slug ? p.slug !== product.slug : true)
    );
    // Keep up to 20 recently viewed items with the newest first
    const updated = [product, ...filtered].slice(0, 20);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("prayog_recent_products_updated"));
  } catch (err) {
    console.error("Failed to record product view:", err);
  }
}
