import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/data/mockData";
import { haptic } from "@/utils/haptics";
import { useUIStore } from "./useUIStore";
import { useCartStore } from "./useCartStore";
import { safeJSONStorage } from "./storage";

interface WishlistState {
  wishlist: Product[];
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  toggleWishlist: (product: Product) => void;
  moveToCart: (product: Product) => void;
  moveToWishlist: (product: Product, variantId?: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      _hasHydrated: false,

      setHasHydrated: (val: boolean) => {
        set({ _hasHydrated: val });
      },

      isWishlisted: (productId: string) => {
        return get().wishlist.some((p) => p.id === productId);
      },

      toggleWishlist: (product: Product) => {
        haptic.success();
        const prev = get().wishlist;
        const exists = prev.some((p) => p.id === product.id);

        if (exists) {
          const nextList = prev.filter((p) => p.id !== product.id);
          set({ wishlist: nextList });

          useUIStore.getState().showToast({
            type: "info",
            title: "Removed from Wishlist",
            message: product.name,
            product,
            count: nextList.length,
            iconType: "wishlist-remove",
          });
        } else {
          const nextList = [...prev, product];
          set({ wishlist: nextList });

          useUIStore.getState().showToast({
            type: "success",
            title: "Saved to Wishlist",
            message: product.name,
            actionLabel: "View Wishlist",
            actionHref: "/wishlist",
            product,
            count: nextList.length,
            iconType: "wishlist-add",
          });
        }
      },

      moveToCart: (product: Product) => {
        useCartStore.getState().addToCart(product);
      },

      moveToWishlist: (product: Product, variantId?: string) => {
        useCartStore.getState().removeFromCart(product.id, variantId);
        const prev = get().wishlist;
        if (!prev.some((p) => p.id === product.id)) {
          const nextList = [...prev, product];
          set({ wishlist: nextList });

          useUIStore.getState().showToast({
            type: "success",
            title: "Saved to Wishlist",
            message: product.name,
            actionLabel: "View Wishlist",
            actionHref: "/wishlist",
            product,
            count: nextList.length,
            iconType: "wishlist-add",
          });
        }
      },
    }),
    {
      name: "prayog_wishlist",
      version: 1,
      storage: safeJSONStorage,
      partialize: (state) => ({ wishlist: state.wishlist }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || !persistedState || !Array.isArray(persistedState.wishlist)) {
          return { wishlist: [], _hasHydrated: true } as any;
        }
        return persistedState;
      },
    }
  )
);

// ── Fine-grained pure selectors for high-performance subscriptions
export const selectWishlist = (state: WishlistState): Product[] => state.wishlist;

export const selectWishlistCount = (state: WishlistState): number =>
  state.wishlist.length;

export const selectIsProductWishlisted =
  (productId: string) =>
  (state: WishlistState): boolean =>
    state.wishlist.some((p) => p.id === productId);

export const selectIsWishlistHydrated = (state: WishlistState): boolean =>
  state._hasHydrated;
