import { describe, it, expect } from "vitest";
import { INITIAL_PROMO_COUPONS, evaluatePromoCoupon, PromoCoupon } from "../data/promoData";

describe("Promotional Coupons Business Logic Engine", () => {
  const b2bCoupon = INITIAL_PROMO_COUPONS.find((c) => c.code === "B2BINSTITUTE20")!;
  const b2cCoupon = INITIAL_PROMO_COUPONS.find((c) => c.code === "MAKERB2C10")!;
  const welcomeCoupon = INITIAL_PROMO_COUPONS.find((c) => c.code === "WELCOMEPRAYOG")!;
  const registeredCoupon = INITIAL_PROMO_COUPONS.find((c) => c.code === "REGISTERED15")!;

  it("should successfully apply B2B coupon for verified B2B customers above minOrderValue", () => {
    const result = evaluatePromoCoupon(
      b2bCoupon,
      10000,
      "B2B Customer",
      "procurement@nitranchi.ac.in",
    );

    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(2000); // 20% of 10,000 = 2,000
  });

  it("should cap discounts at maxDiscountAmount", () => {
    const result = evaluatePromoCoupon(
      b2bCoupon,
      25000,
      "B2B Customer",
      "procurement@nitranchi.ac.in",
    );

    expect(result.valid).toBe(true);
    // 20% of 25,000 is 5,000, but maxDiscountAmount is 3,000
    expect(result.discountAmount).toBe(3000);
  });

  it("should reject B2B coupon when attempted by B2C retail customer", () => {
    const result = evaluatePromoCoupon(
      b2bCoupon,
      8000,
      "B2C Customer",
      "maker@gmail.com",
    );

    expect(result.valid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.message).toContain("exclusive to verified B2B");
  });

  it("should reject when cart total is below minOrderValue", () => {
    const result = evaluatePromoCoupon(
      b2cCoupon,
      1000, // min is 1500
      "B2C Customer",
      "student@gmail.com",
    );

    expect(result.valid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.message).toContain("Minimum order value");
  });

  it("should reject welcome coupon for returning customers with previous orders", () => {
    const result = evaluatePromoCoupon(
      welcomeCoupon,
      1500,
      "B2C Customer",
      "returning@gmail.com",
      true, // hasPreviousOrders = true
    );

    expect(result.valid).toBe(false);
    expect(result.message).toContain("only valid on your first order");
  });
});
