import { describe, it, expect } from "vitest";
import {
  calculateCustomerPrice,
  calculateEarnedRewards,
  getCustomerTypeCode,
  CUSTOMER_TYPE_RULES,
} from "../data/customerTypes";

describe("Customer Tier Pricing & Rewards Engine", () => {
  const basePrice = 1000;

  it("should apply 0% discount for B2C retail customers", () => {
    const result = calculateCustomerPrice(basePrice, "B2C Customer");
    expect(result.discountPercent).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.unitPrice).toBe(1000);
  });

  it("should apply 15% wholesale discount for B2B accounts", () => {
    const result = calculateCustomerPrice(basePrice, "B2B Customer", 1);
    expect(result.discountPercent).toBe(15);
    expect(result.discountAmount).toBe(150);
    expect(result.unitPrice).toBe(850);
  });

  it("should apply 20% tier volume discount for B2B orders with quantity >= 10", () => {
    const result = calculateCustomerPrice(basePrice, "B2B", 12);
    expect(result.discountPercent).toBe(20);
    expect(result.discountAmount).toBe(200);
    expect(result.unitPrice).toBe(800);
  });

  it("should apply 5% loyalty discount for Registered members", () => {
    const result = calculateCustomerPrice(basePrice, "Registered Customer");
    expect(result.discountPercent).toBe(5);
    expect(result.discountAmount).toBe(50);
    expect(result.unitPrice).toBe(950);
  });

  it("should apply 5% in-store discount for Walk-in POS customers", () => {
    const result = calculateCustomerPrice(basePrice, "Walk-in Customer");
    expect(result.discountPercent).toBe(5);
    expect(result.discountAmount).toBe(50);
    expect(result.unitPrice).toBe(950);
  });

  it("should correctly compute reward coins for Registered vs B2C customers", () => {
    const orderTotal = 5000; // ₹5,000

    // Registered: 2 coins per ₹100
    const registeredRewards = calculateEarnedRewards(orderTotal, "REGISTERED");
    expect(registeredRewards.coinsEarned).toBe(100);
    expect(registeredRewards.rupeeValue).toBe(50); // 100 * 0.5

    // B2C: 1 coin per ₹100
    const b2cRewards = calculateEarnedRewards(orderTotal, "B2C");
    expect(b2cRewards.coinsEarned).toBe(50);
    expect(b2cRewards.rupeeValue).toBe(25);
  });

  it("should correctly resolve CustomerTypeCode from arbitrary case inputs", () => {
    expect(getCustomerTypeCode("b2b institutional")).toBe("B2B");
    expect(getCustomerTypeCode("pos store")).toBe("WALK_IN");
    expect(getCustomerTypeCode("registered member")).toBe("REGISTERED");
    expect(getCustomerTypeCode("express guest")).toBe("GUEST");
    expect(getCustomerTypeCode("standard retail")).toBe("B2C");
  });
});
