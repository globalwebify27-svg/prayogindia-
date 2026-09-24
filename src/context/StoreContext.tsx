"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductVariant } from "@/data/mockData";
import { CustomerType } from "@/data/customerTypes";
import { haptic } from "@/utils/haptics";

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface CustomerUser {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  customerType: CustomerType;
  companyName?: string;
  gstin?: string;
  rewardPoints: number;
}

interface StoreContextType {
  user: CustomerUser | null;
  isLoggedIn: boolean;
  loginUser: (user: CustomerUser) => void;
  logoutUser: () => void;
  updateUser: (data: Partial<CustomerUser>) => void;
  setCustomerType: (type: CustomerType) => void;
  cart: CartItem[];
  wishlist: Product[];
  cartNotification: {
    id: string;
    product: Product;
    variant?: ProductVariant;
    quantity: number;
  } | null;
  dismissCartNotification: () => void;
  toast: {
    id: string;
    type?: "success" | "error" | "info";
    title: string;
    message?: string;
    actionLabel?: string;
    actionHref?: string;
  } | null;
  showToast: (options: {
    type?: "success" | "error" | "info";
    title: string;
    message?: string;
    actionLabel?: string;
    actionHref?: string;
    duration?: number;
  }) => void;
  dismissToast: () => void;
  addToCart: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number,
  ) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    delta: number,
    variantId?: string,
  ) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  moveToCart: (product: Product) => void;
  moveToWishlist: (product: Product, variantId?: string) => void;
  isWishlisted: (productId: string) => boolean;
  mergeGuestCart: (guestCart: CartItem[]) => void;
  redeemRewardPoints: (points: number) => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cartNotification, setCartNotification] = useState<{
    id: string;
    product: Product;
    variant?: ProductVariant;
    quantity: number;
  } | null>(null);

  const [toast, setToast] = useState<{
    id: string;
    type?: "success" | "error" | "info";
    title: string;
    message?: string;
    actionLabel?: string;
    actionHref?: string;
  } | null>(null);

  const showToast = (options: {
    type?: "success" | "error" | "info";
    title: string;
    message?: string;
    actionLabel?: string;
    actionHref?: string;
    duration?: number;
  }) => {
    const toastId = `toast-${Date.now()}`;
    setToast({
      id: toastId,
      type: options.type || "success",
      title: options.title,
      message: options.message,
      actionLabel: options.actionLabel,
      actionHref: options.actionHref,
    });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Initialize session from server HTTP cookie
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.user) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "+91 98765 43210",
            customerType: "Registered Customer",
            rewardPoints: 1250,
          });
        }
      })
      .catch(() => {});
  }, []);

  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    quantity = 1,
  ) => {
    haptic.success();
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.variant?.id === variant?.id,
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [...prev, { product, variant, quantity }];
    });

    // Trigger Toast Notification (Auto dismiss after 4 seconds)
    const toastId = `toast-${Date.now()}`;
    setCartNotification({
      id: toastId,
      product,
      variant,
      quantity,
    });

    setTimeout(() => {
      setCartNotification((current) =>
        current?.id === toastId ? null : current,
      );
    }, 4000);
  };

  const dismissCartNotification = () => {
    setCartNotification(null);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    haptic.light();
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (!variantId || item.variant?.id === variantId)
          ),
      ),
    );
  };

  const updateQuantity = (
    productId: string,
    delta: number,
    variantId?: string,
  ) => {
    haptic.selection();
    setCart(
      (prev) =>
        prev
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
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product: Product) => {
    haptic.success();
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast({
          type: "info",
          title: "Removed from Wishlist",
          message: product.name,
        });
        return prev.filter((p) => p.id !== product.id);
      }
      showToast({
        type: "success",
        title: "Added to Wishlist ❤️",
        message: product.name,
        actionLabel: "View Wishlist",
        actionHref: "/wishlist",
      });
      return [...prev, product];
    });
  };

  const moveToCart = (product: Product) => {
    addToCart(product);
  };

  const moveToWishlist = (product: Product, variantId?: string) => {
    removeFromCart(product.id, variantId);
    if (!wishlist.some((p) => p.id === product.id)) {
      setWishlist((prev) => [...prev, product]);
    }
  };

  const isWishlisted = (productId: string) =>
    wishlist.some((p) => p.id === productId);

  const mergeGuestCart = (guestCart: CartItem[]) => {
    setCart((prev) => {
      const merged = [...prev];
      guestCart.forEach((gItem) => {
        const idx = merged.findIndex(
          (m) =>
            m.product.id === gItem.product.id &&
            m.variant?.id === gItem.variant?.id,
        );
        if (idx > -1) {
          merged[idx].quantity += gItem.quantity;
        } else {
          merged.push(gItem);
        }
      });
      return merged;
    });
  };

  const loginUser = (userData: CustomerUser) => {
    setUser(userData);
  };

  const logoutUser = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  };

  const updateUser = (data: Partial<CustomerUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const setCustomerType = (type: CustomerType) => {
    setUser((prev) =>
      prev
        ? { ...prev, customerType: type }
        : {
            name: "Guest Customer",
            email: "guest@prayog.in",
            phone: "",
            customerType: type,
            rewardPoints: 0,
          },
    );
  };

  const redeemRewardPoints = (pointsToRedeem: number): number => {
    if (!user || user.rewardPoints < pointsToRedeem) return 0;
    const discountAmount = pointsToRedeem * 0.5; // 1 point = ₹0.50
    setUser((prev) =>
      prev
        ? { ...prev, rewardPoints: prev.rewardPoints - pointsToRedeem }
        : null,
    );
    return discountAmount;
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loginUser,
        logoutUser,
        updateUser,
        setCustomerType,
        cart,
        wishlist,
        cartNotification,
        dismissCartNotification,
        toast,
        showToast,
        dismissToast,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        moveToCart,
        moveToWishlist,
        isWishlisted,
        mergeGuestCart,
        redeemRewardPoints,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
