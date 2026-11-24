/**
 * Product review normalization and matching utilities
 * Safe for use in both server-side routes and client components.
 */

export interface ReviewProductTarget {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
}

export interface ReviewMatcherItem {
  productId?: string;
  productName?: string;
  productSlug?: string;
  productSku?: string;
}

/**
 * Robustly matches whether a review belongs to a given product
 * Handles ID variations, slugs, SKUs, and compound names (e.g. "test [4]")
 */
export function isReviewForProduct(
  review: ReviewMatcherItem,
  target: ReviewProductTarget
): boolean {
  const norm = (s?: string) => (s ? s.trim().toLowerCase() : "");

  const revId = norm(review.productId);
  const revName = norm(review.productName);
  const revSlug = norm(review.productSlug);
  const revSku = norm(review.productSku);

  const targetId = norm(target.id);
  const targetName = norm(target.name);
  const targetSlug = norm(target.slug);
  const targetSku = norm(target.sku);

  // 1. Direct ID match
  if (revId && targetId) {
    if (revId === targetId) return true;
    if (revId.replace(/^p-/, "") === targetId.replace(/^p-/, "")) return true;
  }

  // 2. Slug match
  if (revSlug && targetSlug && revSlug === targetSlug) return true;
  if (revId && targetSlug && revId === targetSlug) return true;
  if (revSlug && targetId && revSlug === targetId) return true;

  // 3. SKU match
  if (revSku && targetSku && revSku === targetSku) return true;

  // 4. Product Name match
  if (revName && targetName) {
    if (revName === targetName) return true;
    if (targetName.includes(revName) || revName.includes(targetName)) return true;
  }

  // 5. Special pattern: "test [4]" where targetId is "4" or targetName is "test"
  if (targetId && revName && (revName.includes(`[${targetId}]`) || revName.includes(` ${targetId}`))) {
    return true;
  }
  if (targetName && revName && revName.startsWith(targetName)) {
    return true;
  }

  return false;
}
