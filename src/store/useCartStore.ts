import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, ProductVariant } from "@/data/mockData";
import { CartItem, CartNotificationData } from "./types";
import { haptic } from "@/utils/haptics";
import { useUIStore } from "./useUIStore";
import { safeJSONStorage } from "./storage";

interface CartState {
  cart: CartItem[];
  cartNotification: CartNotificationData | null;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  addToCart: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number
  ) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    delta: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  dismissCartNotification: () => void;
  mergeGuestCart: (guestCart: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      cartNotification: null,
      _hasHydrated: false,

      setHasHydrated: (val: boolean) => {
        set({ _hasHydrated: val });
      },

      addToCart: (product: Product, variant?: ProductVariant, quantity = 1) => {
        haptic.success();
        const prev = get().cart;
        const existingIdx = prev.findIndex(
          (item) =>
            item.product.id === product.id && item.variant?.id === variant?.id
        );

        let updated: CartItem[];
        if (existingIdx > -1) {
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity,
          };
        } else {
          updated = [...prev, { product, variant, quantity }];
        }

        set({ cart: updated });

        // Trigger Toast Notification
        useUIStore.getState().showToast({
          type: "success",
          title: "Product added to cart!",
          message: product.name,
          product,
          iconType: "cart-add" as any,
          duration: 2000,
        });
      },

      dismissCartNotification: () => {
        set({ cartNotification: null });
      },

      removeFromCart: (productId: string, variantId?: string) => {
        haptic.light();
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(
                item.product.id === productId &&
                (!variantId || item.variant?.id === variantId)
              )
          ),
        }));
      },

      updateQuantity: (
        productId: string,
        delta: number,
        variantId?: string
      ) => {
        haptic.selection();
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (
                item.product.id === productId &&
                (!variantId || item.variant?.id === variantId)
              ) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
        }));
      },

      clearCart: () => set({ cart: [] }),

      mergeGuestCart: (guestCart: CartItem[]) => {
        set((state) => {
          const merged = [...state.cart];
          guestCart.forEach((gItem) => {
            const idx = merged.findIndex(
              (m) =>
                m.product.id === gItem.product.id &&
                m.variant?.id === gItem.variant?.id
            );
            if (idx > -1) {
              merged[idx].quantity += gItem.quantity;
            } else {
              merged.push(gItem);
            }
          });
          return { cart: merged };
        });
      },
    }),
    {
      name: "prayog_cart",
      version: 1,
      storage: safeJSONStorage,
      partialize: (state) => ({ cart: state.cart }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || !persistedState || !Array.isArray(persistedState.cart)) {
          return { cart: [], _hasHydrated: true } as any;
        }
        return persistedState;
      },
    }
  )
);

// ── Fine-grained pure selectors for high-performance subscriptions
export const selectCartCount = (state: CartState): number =>
  state.cart.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state: CartState): number =>
  state.cart.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);

export const selectCartItems = (state: CartState): CartItem[] => state.cart;

export const selectIsCartHydrated = (state: CartState): boolean =>
  state._hasHydrated;
