import { describe, it, expect, beforeEach } from "vitest";
import {
  useCartStore,
  selectCartCount,
  selectCartSubtotal,
} from "@/store/useCartStore";
import {
  useWishlistStore,
  selectWishlistCount,
  selectIsProductWishlisted,
} from "@/store/useWishlistStore";
import {
  useAuthStore,
  selectUser,
  selectIsLoggedIn,
} from "@/store/useAuthStore";
import {
  useUIStore,
  selectIsCartOpen,
  selectIsB2BModalOpen,
} from "@/store/useUIStore";
import { Product } from "@/data/mockData";

const sampleProduct: Product = {
  id: "test-prod-1",
  name: "Arduino Uno R3",
  slug: "arduino-uno-r3",
  sku: "ARD-001",
  category: "Development Boards",
  price: 650,
  mrp: 750,
  discount: "13% OFF",
  rating: 4.8,
  reviews: 120,
  inStock: true,
  image: "https://res.cloudinary.com/fyueflvh/image/upload/sample.jpg",
  images: ["https://res.cloudinary.com/fyueflvh/image/upload/sample.jpg"],
  description: "Standard microcontroller board",
  specs: {},
};

describe("Zustand State Management Architecture", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useWishlistStore.setState({ wishlist: [] });
    useAuthStore.setState({ user: null, isLoggedIn: false });
    useUIStore.getState().dismissToast();
    useUIStore.getState().closeCart();
    useUIStore.getState().closeB2BModal();
  });

  describe("Cart Store (useCartStore)", () => {
    it("adds products to cart and increases quantity if item already exists", () => {
      useCartStore.getState().addToCart(sampleProduct, undefined, 2);
      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].quantity).toBe(2);

      useCartStore.getState().addToCart(sampleProduct, undefined, 3);
      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].quantity).toBe(5);
    });

    it("calculates derived selectors accurately without duplicating state", () => {
      useCartStore.getState().addToCart(sampleProduct, undefined, 3);
      const state = useCartStore.getState();

      expect(selectCartCount(state)).toBe(3);
      expect(selectCartSubtotal(state)).toBe(3 * 650);
    });

    it("updates quantity and removes item when quantity reaches zero", () => {
      useCartStore.getState().addToCart(sampleProduct, undefined, 2);
      useCartStore.getState().updateQuantity(sampleProduct.id, 1);
      expect(useCartStore.getState().cart[0].quantity).toBe(3);

      useCartStore.getState().updateQuantity(sampleProduct.id, -3);
      expect(useCartStore.getState().cart).toHaveLength(0);
    });

    it("removes a product from the cart", () => {
      useCartStore.getState().addToCart(sampleProduct, undefined, 1);
      expect(useCartStore.getState().cart).toHaveLength(1);

      useCartStore.getState().removeFromCart(sampleProduct.id);
      expect(useCartStore.getState().cart).toHaveLength(0);
    });

    it("merges guest cart into current cart correctly", () => {
      useCartStore.getState().addToCart(sampleProduct, undefined, 1);
      useCartStore.getState().mergeGuestCart([
        { product: sampleProduct, quantity: 2 },
      ]);

      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].quantity).toBe(3);
    });

    it("tracks hydration lifecycle correctly", () => {
      useCartStore.getState().setHasHydrated(true);
      expect(useCartStore.getState()._hasHydrated).toBe(true);
    });
  });

  describe("Wishlist Store (useWishlistStore)", () => {
    it("toggles items in and out of the wishlist", () => {
      expect(useWishlistStore.getState().isWishlisted(sampleProduct.id)).toBe(false);

      useWishlistStore.getState().toggleWishlist(sampleProduct);
      expect(useWishlistStore.getState().isWishlisted(sampleProduct.id)).toBe(true);
      expect(useWishlistStore.getState().wishlist).toHaveLength(1);

      useWishlistStore.getState().toggleWishlist(sampleProduct);
      expect(useWishlistStore.getState().isWishlisted(sampleProduct.id)).toBe(false);
      expect(useWishlistStore.getState().wishlist).toHaveLength(0);
    });

    it("provides accurate selectors for count and product membership", () => {
      useWishlistStore.getState().toggleWishlist(sampleProduct);
      const state = useWishlistStore.getState();

      expect(selectWishlistCount(state)).toBe(1);
      expect(selectIsProductWishlisted(sampleProduct.id)(state)).toBe(true);
      expect(selectIsProductWishlisted("non-existent-id")(state)).toBe(false);
    });

    it("moves wishlist items to cart", () => {
      useWishlistStore.getState().toggleWishlist(sampleProduct);
      useWishlistStore.getState().moveToCart(sampleProduct);

      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].product.id).toBe(sampleProduct.id);
    });
  });

  describe("Auth Store (useAuthStore)", () => {
    it("manages user login and logout lifecycle", () => {
      useAuthStore.getState().loginUser({
        name: "Test Engineer",
        email: "test@prayog.in",
        phone: "+919876543210",
        customerType: "Registered Customer",
        rewardPoints: 200,
      });

      expect(useAuthStore.getState().isLoggedIn).toBe(true);
      expect(useAuthStore.getState().user?.name).toBe("Test Engineer");

      useAuthStore.getState().updateUser({ companyName: "Prayog Labs" });
      expect(useAuthStore.getState().user?.companyName).toBe("Prayog Labs");

      useAuthStore.getState().logoutUser();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("provides fine-grained auth selectors", () => {
      useAuthStore.getState().loginUser({
        name: "Test Engineer",
        email: "test@prayog.in",
        phone: "+919876543210",
        customerType: "Registered Customer",
        rewardPoints: 200,
      });

      const state = useAuthStore.getState();
      expect(selectUser(state)?.email).toBe("test@prayog.in");
      expect(selectIsLoggedIn(state)).toBe(true);
    });

    it("calculates reward points redemption accurately", () => {
      useAuthStore.getState().loginUser({
        name: "Points User",
        email: "points@prayog.in",
        phone: "",
        customerType: "Registered Customer",
        rewardPoints: 100,
      });

      const discount = useAuthStore.getState().redeemRewardPoints(40);
      expect(discount).toBe(20); // 40 points * 0.5 = 20 INR
      expect(useAuthStore.getState().user?.rewardPoints).toBe(60);

      // Cannot redeem more points than available
      const invalidDiscount = useAuthStore.getState().redeemRewardPoints(100);
      expect(invalidDiscount).toBe(0);
      expect(useAuthStore.getState().user?.rewardPoints).toBe(60);
    });
  });

  describe("UI Store (useUIStore)", () => {
    it("handles toast display and dismissal", () => {
      useUIStore.getState().showToast({
        title: "Test Toast",
        message: "Operation completed",
        type: "success",
      });

      expect(useUIStore.getState().toast?.title).toBe("Test Toast");

      useUIStore.getState().dismissToast();
      expect(useUIStore.getState().toast).toBeNull();
    });

    it("manages coordinated CartDrawer and B2B modal states", () => {
      expect(selectIsCartOpen(useUIStore.getState())).toBe(false);

      useUIStore.getState().openCart();
      expect(selectIsCartOpen(useUIStore.getState())).toBe(true);

      useUIStore.getState().toggleCart();
      expect(selectIsCartOpen(useUIStore.getState())).toBe(false);

      expect(selectIsB2BModalOpen(useUIStore.getState())).toBe(false);
      useUIStore.getState().openB2BModal();
      expect(selectIsB2BModalOpen(useUIStore.getState())).toBe(true);
      useUIStore.getState().closeB2BModal();
      expect(selectIsB2BModalOpen(useUIStore.getState())).toBe(false);
    });
  });
});
