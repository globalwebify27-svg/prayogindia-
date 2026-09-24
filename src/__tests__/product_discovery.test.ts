import { describe, it, expect } from "vitest";
import { PRODUCTS } from "../data/mockData";

describe("Search, Filtering & Product Discovery Engine", () => {
  it("should validate price range bounds and reject inverted bounds", () => {
    const validatePriceRange = (minParam: string | null, maxParam: string | null) => {
      let min: number | null = null;
      let max: number | null = null;
      if (minParam) {
        const p = parseFloat(minParam);
        if (!isNaN(p) && p >= 0) min = p;
      }
      if (maxParam) {
        const p = parseFloat(maxParam);
        if (!isNaN(p) && p >= 0) max = p;
      }
      if (min !== null && max !== null && min > max) {
        return {
          valid: false,
          message: "Invalid price range: minPrice > maxPrice",
        };
      }
      return { valid: true, min, max };
    };

    expect(validatePriceRange("500", "200").valid).toBe(false);
    expect(validatePriceRange("100", "1000").valid).toBe(true);
    expect(validatePriceRange("-50", "2000").min).toBeNull();
  });

  it("should sanitize sort parameters with a safe whitelist", () => {
    const ALLOWED_SORT_OPTIONS = ["newest", "price-asc", "price-desc", "name"];
    const sanitizeSort = (inputSort: string) =>
      ALLOWED_SORT_OPTIONS.includes(inputSort) ? inputSort : "newest";

    expect(sanitizeSort("DELETE FROM products;--")).toBe("newest");
    expect(sanitizeSort("price-asc")).toBe("price-asc");
  });

  it("should limit autocomplete suggestions to requested cap", () => {
    const getSuggestions = (query: string, maxLimit = 6) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      ).slice(0, Math.min(10, Math.max(1, maxLimit)));
    };

    const suggestions = getSuggestions("robot", 5);
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  it("should isolate related products from the current product ID", () => {
    const getRelated = (currentId: string, category: string, limit = 4) => {
      return PRODUCTS.filter(
        (p) => p.category === category && p.id !== currentId,
      ).slice(0, limit);
    };

    const targetProduct = PRODUCTS[0];
    const related = getRelated(targetProduct.id, targetProduct.category, 4);

    expect(related.some((r) => r.id === targetProduct.id)).toBe(false);
  });
});
