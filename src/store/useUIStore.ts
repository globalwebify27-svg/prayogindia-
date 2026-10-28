import { create } from "zustand";
import { ToastData } from "@/components/SuccessToast";

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
  openB2BModal: () => void;
  closeB2BModal: () => void;
  toggleB2BModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toast: null,
  toastTimer: null,

  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  isB2BModalOpen: false,
  openB2BModal: () => set({ isB2BModalOpen: true }),
  closeB2BModal: () => set({ isB2BModalOpen: false }),
  toggleB2BModal: () => set((state) => ({ isB2BModalOpen: !state.isB2BModalOpen })),

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
export const selectToast = (state: UIState): ToastData | null => state.toast;
