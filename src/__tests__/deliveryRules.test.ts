import { describe, it, expect } from "vitest";
import { calculateDeliveryRules } from "../data/deliveryRules";

describe("Logistics & Delivery Rules Engine", () => {
  it("should provide FREE standard delivery for orders >= ₹2,000", () => {
    const result = calculateDeliveryRules({
      subtotal: 2500,
      totalWeightGrams: 800,
      deliveryCity: "Patna",
      pincode: "800001",
      deliveryOption: "standard",
      hasRestrictedBattery: false,
    });

    expect(result.fee).toBe(0);
    expect(result.isFree).toBe(true);
    expect(result.timelineText).toBe("7–10 Days");
  });

  it("should charge ₹99 standard fee for orders < ₹2,000", () => {
    const result = calculateDeliveryRules({
      subtotal: 999,
      totalWeightGrams: 500,
      deliveryCity: "Delhi",
      pincode: "110001",
      deliveryOption: "standard",
      hasRestrictedBattery: false,
    });

    expect(result.fee).toBe(99);
    expect(result.isFree).toBe(false);
  });

  it("should handle Ranchi 24-hour express eligibility and rates", () => {
    const ranchiEligible = calculateDeliveryRules({
      subtotal: 1500,
      totalWeightGrams: 300,
      deliveryCity: "Ranchi",
      pincode: "834001",
      deliveryOption: "ranchi_24h",
      hasRestrictedBattery: false,
    });

    expect(ranchiEligible.isRanchiEligible).toBe(true);
    expect(ranchiEligible.fee).toBe(49);
    expect(ranchiEligible.timelineText).toBe("Within 24 Hours");
  });

  it("should enforce surface logistics freight mode when carrying hazardous LiPo batteries", () => {
    const batteryCart = calculateDeliveryRules({
      subtotal: 3500,
      totalWeightGrams: 1200,
      deliveryCity: "Bengaluru",
      pincode: "560001",
      deliveryOption: "faster_express",
      hasRestrictedBattery: true,
    });

    expect(batteryCart.timelineText).toBe("2-4 Days (Surface Priority)");
  });

  it("should provide free instant store pickup across all stores", () => {
    const pickup = calculateDeliveryRules({
      subtotal: 500,
      totalWeightGrams: 2000,
      deliveryCity: "Ranchi",
      pincode: "834001",
      deliveryOption: "store_pickup",
      hasRestrictedBattery: false,
    });

    expect(pickup.fee).toBe(0);
    expect(pickup.isFree).toBe(true);
    expect(pickup.timelineText).toBe("Same-Day Pickup");
  });
});
