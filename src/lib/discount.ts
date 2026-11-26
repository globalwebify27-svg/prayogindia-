/**
 * Unified discount calculation utility for Prayog India.
 * Robustly extracts the true discount percentage from product data.
 */
export function getProductDiscount(product: {
  price: number;
  mrp?: number | null;
  discount?: string | null;
  variants?: Array<{ price: number; mrp?: number | null }>;
} | null | undefined): number {
  if (!product) return 0;

  // 1. Check explicit numeric MRP
  if (
    typeof product.mrp === "number" &&
    product.mrp > product.price &&
    product.mrp > 0
  ) {
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  }

  // 2. Parse discount string if provided (e.g. "25% OFF", "30%", "15% off", "23%")
  if (product.discount && typeof product.discount === "string") {
    const match = product.discount.match(/(\d+)/);
    if (match) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val > 0 && val <= 100) {
        return val;
      }
    }
  }

  // 3. Check active or first variant with MRP > price
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const variantDiscounts = product.variants
      .filter((v) => typeof v.mrp === "number" && v.mrp > v.price)
      .map((v) => Math.round(((v.mrp! - v.price) / v.mrp!) * 100));
    if (variantDiscounts.length > 0) {
      return Math.max(...variantDiscounts);
    }
  }

  return 0;
}
