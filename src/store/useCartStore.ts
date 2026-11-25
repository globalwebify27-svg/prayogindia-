import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, ProductVariant, getProductStock } from "@/data/mockData";
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
        const maxStock = getProductStock(product, variant);
        if (maxStock <= 0) {
          useUIStore.getState().showToast({
            type: "error",
            title: "Out of Stock",
            message: `${product.name} is currently out of stock.`,
            duration: 2500,
          });
          return;
        }

        const prev = get().cart;
        const existingIdx = prev.findIndex(
          (item) =>
            item.product.id === product.id && item.variant?.id === variant?.id
        );

        let updated: CartItem[];
        if (existingIdx > -1) {
          const currentQty = prev[existingIdx].quantity;
          if (currentQty >= maxStock) {
            useUIStore.getState().showToast({
              type: "error",
              title: `Only ${maxStock} units available in stock`,
              message: `You already have all available units of ${product.name} in your cart.`,
              duration: 2500,
            });
            return;
          }
          const cappedQty = Math.min(currentQty + quantity, maxStock);
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: cappedQty,
          };
        } else {
          const cappedQty = Math.min(quantity, maxStock);
          updated = [...prev, { product, variant, quantity: cappedQty }];
        }

        haptic.success();
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
        let hitStockLimit = false;
        let limitStock = 0;

        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (
                item.product.id === productId &&
                (!variantId || item.variant?.id === variantId)
              ) {
                const maxStock = getProductStock(item.product, item.variant);
                if (delta > 0 && item.quantity >= maxStock) {
                  hitStockLimit = true;
                  limitStock = maxStock;
                  return item;
                }
                const newQty = delta > 0
                  ? Math.min(item.quantity + delta, maxStock)
                  : item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
        }));

        if (hitStockLimit) {
          useUIStore.getState().showToast({
            title: `Only ${limitStock} units available in stock`,
            type: "error",
            duration: 2500,
          });
        }
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
