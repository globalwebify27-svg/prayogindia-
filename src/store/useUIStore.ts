import { create } from "zustand";
import { ToastData } from "@/components/SuccessToast";

export interface B2BInitialProduct {
  name?: string;
  link?: string;
  quantity?: string;
  targetPrice?: string;
}

interface UIState {
  toast: ToastData | null;
  toastTimer: ReturnType<typeof setTimeout> | null;
  showToast: (options: Omit<ToastData, "id">) => void;
  dismissToast: () => void;

  // ── Global Drawers & Modals (Coordinated Client UI State)
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  isB2BModalOpen: boolean;
  b2bInitialProduct: B2BInitialProduct | null;
  openB2BModal: (initialProduct?: B2BInitialProduct) => void;
  closeB2BModal: () => void;
  toggleB2BModal: (initialProduct?: B2BInitialProduct) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toast: null,
  toastTimer: null,

  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  isB2BModalOpen: false,
  b2bInitialProduct: null,
  openB2BModal: (initialProduct) =>
    set({
      isB2BModalOpen: true,
      b2bInitialProduct: initialProduct || null,
    }),
  closeB2BModal: () => set({ isB2BModalOpen: false, b2bInitialProduct: null }),
  toggleB2BModal: (initialProduct) =>
    set((state) => ({
      isB2BModalOpen: !state.isB2BModalOpen,
      b2bInitialProduct: !state.isB2BModalOpen ? (initialProduct || null) : null,
    })),

  dismissToast: () => {
    const currentTimer = get().toastTimer;
    if (currentTimer) clearTimeout(currentTimer);
    set({ toast: null, toastTimer: null });
  },

  showToast: (options) => {
    const currentTimer = get().toastTimer;
    if (currentTimer) clearTimeout(currentTimer);

    const toastId = `toast-${Date.now()}`;
    const newToast: ToastData = {
      id: toastId,
      ...options,
    };

    const isWishlist =
      options.iconType?.startsWith("wishlist") ||
      options.title?.toLowerCase().includes("wishlist");
    const isCart =
      options.iconType?.startsWith("cart") ||
      options.title?.toLowerCase().includes("cart");
    const autoDismissMs = options.duration || (isWishlist || isCart ? 2000 : 3500);

    const timer = setTimeout(() => {
      if (get().toast?.id === toastId) {
        set({ toast: null, toastTimer: null });
      }
    }, autoDismissMs);

    set({ toast: newToast, toastTimer: timer });
  },
}));

// ── Fine-grained pure selectors
export const selectIsCartOpen = (state: UIState): boolean => state.isCartOpen;
export const selectIsB2BModalOpen = (state: UIState): boolean => state.isB2BModalOpen;
export const selectB2BInitialProduct = (state: UIState): B2BInitialProduct | null => state.b2bInitialProduct;
export const selectToast = (state: UIState): ToastData | null => state.toast;
