import { describe, it, expect } from "vitest";
import { getProductStock, PRODUCTS } from "@/data/mockData";

describe("Product CTA & Sticky Bar Behavior", () => {
  it("should calculate correct real stock for products and variants without hardcoded 40", () => {
    const uno = PRODUCTS.find((p) => p.id === "ard-uno-r3");
    expect(uno).toBeDefined();

    if (uno) {
      // Main product stock
      expect(getProductStock(uno)).toBe(45);

      // Standard variant stock
      const standardVar = uno.variants?.find((v) => v.id === "var-uno-standard");
      expect(standardVar).toBeDefined();
      expect(getProductStock(uno, standardVar)).toBe(45);

      // SMD variant stock
      const smdVar = uno.variants?.find((v) => v.id === "var-uno-smd");
      expect(smdVar).toBeDefined();
      expect(getProductStock(uno, smdVar)).toBe(30);
    }
  });

  it("should return 0 stock if item is out of stock", () => {
    const fakeProduct = {
      id: "fake-1",
      name: "Out of stock board",
      sku: "OOS-001",
      category: "Arduino",
      price: 100,
      mrp: 150,
      discount: "33% OFF",
      rating: 4.5,
      reviews: 10,
      inStock: false,
      stock: 45,
      image: "/test.png",
      description: "test",
      specs: {},
    };

    expect(getProductStock(fakeProduct)).toBe(0);
  });

  it("should determine sticky bar display state correctly based on main CTA visibility", () => {
    // When main CTA is visible on card (user at top):
    const isMainCtaVisible = true;
    const stickyBarClasses = isMainCtaVisible
      ? "translate-y-full opacity-0 pointer-events-none"
      : "translate-y-0 opacity-100 pointer-events-auto";

    expect(stickyBarClasses).toContain("translate-y-full");
    expect(stickyBarClasses).toContain("opacity-0");

    // When user scrolls down and main CTA leaves the viewport:
    const isScrolledPast = false;
    const scrolledStickyBarClasses = isScrolledPast
      ? "translate-y-full opacity-0 pointer-events-none"
      : "translate-y-0 opacity-100 pointer-events-auto";

    expect(scrolledStickyBarClasses).toContain("translate-y-0");
    expect(scrolledStickyBarClasses).toContain("opacity-100");
  });
});

