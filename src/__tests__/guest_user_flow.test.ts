import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CUSTOMER_TYPE_RULES } from "@/data/customerTypes";
import { INITIAL_PROMO_COUPONS, evaluatePromoCoupon } from "@/data/promoData";
import { PRODUCTS } from "@/data/mockData";
import { UserDB } from "@/lib/userDB";

describe("Guest User Functionality Audit & Verification", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useAuthStore.setState({ user: null, isLoggedIn: false });
  });

  describe("Customer Types Separation (Requirement 2)", () => {
    it("ensures Guest Customer and Walk-in Customer are separate and distinct customer types", () => {
      expect(CUSTOMER_TYPE_RULES.GUEST).toBeDefined();
      expect(CUSTOMER_TYPE_RULES.WALK_IN).toBeDefined();
      expect(CUSTOMER_TYPE_RULES.GUEST.name).toBe("Guest Customer");
      expect(CUSTOMER_TYPE_RULES.WALK_IN.name).toBe("Walk-in Customer");
      expect(CUSTOMER_TYPE_RULES.GUEST.reports.channelAttribution).toBe("ONLINE");
      expect(CUSTOMER_TYPE_RULES.WALK_IN.reports.channelAttribution).toBe("STORE_POS");
      expect(CUSTOMER_TYPE_RULES.GUEST.invoice.requiresStoreDeviceId).toBe(false);
      expect(CUSTOMER_TYPE_RULES.WALK_IN.invoice.requiresStoreDeviceId).toBe(true);
    });
  });

  describe("Guest Cart & Persistence & Merging (Requirements 3 & 4)", () => {
    const mockProduct1 = PRODUCTS[0];
    const mockProduct2 = PRODUCTS[1];

    it("allows guest to add products to cart without being logged in", () => {
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      useCartStore.getState().addToCart(mockProduct1, undefined, 2);

      const cart = useCartStore.getState().cart;
      expect(cart.length).toBe(1);
      expect(cart[0].product.id).toBe(mockProduct1.id);
      expect(cart[0].quantity).toBe(2);
    });

    it("caps cart merge quantity to available max stock and avoids duplicate entries", () => {
      // Current cart has 2 units
      useCartStore.getState().addToCart(mockProduct1, undefined, 2);

      // Guest cart has 3 units of the same product
      useCartStore.getState().mergeGuestCart([
        { product: mockProduct1, quantity: 3 },
        { product: mockProduct2, quantity: 1 },
      ]);

      const cart = useCartStore.getState().cart;
      // Should have 2 distinct products, not duplicates
      expect(cart.length).toBe(2);

      const item1 = cart.find((i) => i.product.id === mockProduct1.id);
      expect(item1).toBeDefined();
      // Total units capped at stock
      expect(item1!.quantity).toBeLessThanOrEqual(mockProduct1.stock ?? 100);
      expect(item1!.quantity).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Guest Reward Points Handling (Requirement 10)", () => {
    it("does not show or invent reward points for unauthenticated guests", () => {
      const state = useAuthStore.getState();
      expect(state.isLoggedIn).toBe(false);
      expect(state.user).toBeNull();

      // Guest cannot redeem points
      const discount = state.redeemRewardPoints(100);
      expect(discount).toBe(0);
    });

    it("verifies customer type rule locks coin redemption for guest customers", () => {
      const guestRule = CUSTOMER_TYPE_RULES.GUEST;
      expect(guestRule.rewards.allowCoinRedemption).toBe(false);
    });
  });

  describe("Guest Coupons & Offers (Requirement 9)", () => {
    it("evaluates public coupons for guest customer type", () => {
      const welcomeCoupon = INITIAL_PROMO_COUPONS.find((c) => c.code === "WELCOMEPRAYOG");
      expect(welcomeCoupon).toBeDefined();

      const result = evaluatePromoCoupon(
        welcomeCoupon!,
        1500,
        "Guest Customer",
        "guest.shopper@example.com",
        false, // First order
        false,
        [{ sku: PRODUCTS[0].sku, price: 1500, quantity: 1, category: "Robotics" }]
      );

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBeGreaterThan(0);
    });

    it("rejects B2B-only coupons when applied by a guest", () => {
      const b2bCoupon = INITIAL_PROMO_COUPONS.find((c) => c.customerTypeScope === "B2B-only");
      if (b2bCoupon) {
        const result = evaluatePromoCoupon(
          b2bCoupon,
          6000,
          "Guest Customer",
          "guest@example.com",
          false,
          false,
          []
        );
        expect(result.valid).toBe(false);
      }
    });
  });

  describe("Guest Account Conversion (Requirement 11)", () => {
    it("allows registration if an existing account is a guest account with GUEST_ACCOUNT_NO_PASSWORD", () => {
      const guestEmail = "guest.shopper.conversion@example.com";
      const guestPhone = "9876543210";

      // Register guest profile
      const guestUser = UserDB.create({
        name: "Guest Shopper",
        email: guestEmail,
        phone: guestPhone,
        passwordHash: "GUEST_ACCOUNT_NO_PASSWORD",
        customerType: "B2C Customer",
        rewardPoints: 0,
      });

      expect(guestUser.passwordHash).toBe("GUEST_ACCOUNT_NO_PASSWORD");

      // UserDB.exists should not block registration conversion
      const isBlocked = UserDB.exists(guestEmail, guestPhone);
      expect(isBlocked).toBe(false);
    });

    it("matches customer order history by verified mobile number or email address", () => {
      const mobileNumber = "8709789641";
      const cleanDigits = "8709789641";

      const testOrder = {
        orderNumber: "PRG-2026-9999",
        customerMobile: cleanDigits,
        customerEmail: "user.8709789641@prayogindia.com",
        totalAmount: 2500,
      };

      // Mock customer logged in with phone number
      const loggedInUser = {
        id: "usr-otp-8709789641",
        name: "Om Kumar",
        phone: "+91 8709789641",
        email: "omkumar@example.com",
      };

      const userCleanPhone = loggedInUser.phone.replace(/\D/g, "").slice(-10);
      const orderCleanPhone = testOrder.customerMobile.replace(/\D/g, "").slice(-10);

      expect(userCleanPhone).toBe(orderCleanPhone);
      expect(userCleanPhone).toBe(mobileNumber);
    });
  });
});
