export * from "./types";
export * from "./useCartStore";
export * from "./useWishlistStore";
export * from "./useAuthStore";
export * from "./useUIStore";

import { useCartStore } from "./useCartStore";
import { useWishlistStore } from "./useWishlistStore";
import { useAuthStore } from "./useAuthStore";
import { useUIStore } from "./useUIStore";

type CartStoreState = ReturnType<typeof useCartStore.getState>;
type WishlistStoreState = ReturnType<typeof useWishlistStore.getState>;
type AuthStoreState = ReturnType<typeof useAuthStore.getState>;
type UIStoreState = ReturnType<typeof useUIStore.getState>;

/**
 * Fine-grained hook for Cart store with optional selector.
 */
export function useCart<T = CartStoreState>(
  selector?: (state: CartStoreState) => T
): T {
  return useCartStore(selector ?? ((s) => s as unknown as T));
}

/**
 * Fine-grained hook for Wishlist store with optional selector.
 */
export function useWishlist<T = WishlistStoreState>(
  selector?: (state: WishlistStoreState) => T
): T {
  return useWishlistStore(selector ?? ((s) => s as unknown as T));
}

/**
 * Fine-grained hook for Auth store with optional selector.
 */
export function useAuth<T = AuthStoreState>(
  selector?: (state: AuthStoreState) => T
): T {
  return useAuthStore(selector ?? ((s) => s as unknown as T));
}

/**
 * Fine-grained hook for UI & Drawer store with optional selector.
 */
export function useUI<T = UIStoreState>(
  selector?: (state: UIStoreState) => T
): T {
  return useUIStore(selector ?? ((s) => s as unknown as T));
}

/**
 * Unified store hook providing 100% backward-compatibility with the previous StoreContext API.
 * For optimal performance in new components, prefer subscribing directly to modular stores:
 * e.g. useCartStore((s) => s.cart) or useAuthStore((s) => s.user)
 */
export function useStore() {
  const cartState = useCartStore();
  const wishlistState = useWishlistStore();
  const authState = useAuthStore();
  const uiState = useUIStore();

  return {
    // Auth & Customer State
    user: authState.user,
    isLoggedIn: authState.isLoggedIn,
    loginUser: authState.loginUser,
    logoutUser: authState.logoutUser,
    updateUser: authState.updateUser,
    setCustomerType: authState.setCustomerType,
    redeemRewardPoints: authState.redeemRewardPoints,

    // Cart State
    cart: cartState.cart,
    cartNotification: cartState.cartNotification,
    dismissCartNotification: cartState.dismissCartNotification,
    addToCart: cartState.addToCart,
    removeFromCart: cartState.removeFromCart,
    updateQuantity: cartState.updateQuantity,
    clearCart: cartState.clearCart,
    mergeGuestCart: cartState.mergeGuestCart,

    // Wishlist State
    wishlist: wishlistState.wishlist,
    toggleWishlist: wishlistState.toggleWishlist,
    moveToCart: wishlistState.moveToCart,
    moveToWishlist: wishlistState.moveToWishlist,
    isWishlisted: wishlistState.isWishlisted,

    // UI, Modal, Drawer & Toast Notifications
    toast: uiState.toast,
    showToast: uiState.showToast,
    dismissToast: uiState.dismissToast,
    isCartOpen: uiState.isCartOpen,
    openCart: uiState.openCart,
    closeCart: uiState.closeCart,
    toggleCart: uiState.toggleCart,
    isB2BModalOpen: uiState.isB2BModalOpen,
    openB2BModal: uiState.openB2BModal,
    closeB2BModal: uiState.closeB2BModal,
    toggleB2BModal: uiState.toggleB2BModal,
  };
}
