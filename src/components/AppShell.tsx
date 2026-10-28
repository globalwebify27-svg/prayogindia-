"use client";

import React from "react";
import { Header } from "@/components/Header";
import { FooterSection } from "@/components/FooterSection";
import { CartDrawer } from "@/components/CartDrawer";
import { SuccessToast } from "@/components/SuccessToast";
import { B2BModal } from "@/components/Modals";
import { FloatingWhatsAppWidget } from "@/components/FloatingWhatsAppWidget";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  useCartStore,
  useWishlistStore,
  useUIStore,
  selectCartCount,
  selectWishlistCount,
} from "@/store";
import { usePathname } from "next/navigation";
import { haptic } from "@/utils/haptics";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();

  // ── Fine-grained Zustand store subscriptions
  const cart = useCartStore((s) => s.cart);
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const toast = useUIStore((s) => s.toast);
  const dismissToast = useUIStore((s) => s.dismissToast);
  const isCartOpen = useUIStore((s) => s.isCartOpen);
  const openCart = useUIStore((s) => s.openCart);
  const closeCart = useUIStore((s) => s.closeCart);
  const toggleCart = useUIStore((s) => s.toggleCart);
  const isB2BModalOpen = useUIStore((s) => s.isB2BModalOpen);
  const openB2BModal = useUIStore((s) => s.openB2BModal);
  const closeB2BModal = useUIStore((s) => s.closeB2BModal);

  const isIsolatedOperationsRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login-staff") ||
    pathname?.startsWith("/store") ||
    pathname?.startsWith("/kiosk") ||
    pathname?.startsWith("/walk-in") ||
    pathname?.startsWith("/flutter-preview") ||
    pathname?.includes("/storemanager") ||
    pathname?.includes("/device");

  if (isIsolatedOperationsRoute) {
    return (
      <main className="flex-1 bg-[#0F172A] w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-[#1E56A0] selection:text-white w-full max-w-full relative">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={() => {
          haptic.light();
          openCart();
        }}
        onOpenWishlist={() => {
          haptic.light();
          openCart();
        }}
        onOpenSearch={() => {}}
        onOpenB2BModal={() => {
          haptic.light();
          openB2BModal();
        }}
      />

      <main className="flex-1 w-full">
        {children}
      </main>

      <FooterSection />

      <FloatingWhatsAppWidget />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        items={cart}
        onUpdateQuantity={(id, delta) => updateQuantity(id, delta)}
        onRemoveItem={(id) => removeFromCart(id)}
        onOpenB2BModal={() => {
          closeCart();
          openB2BModal();
        }}
      />

      <B2BModal isOpen={isB2BModalOpen} onClose={closeB2BModal} />

      <SuccessToast toast={toast} onClose={dismissToast} />

      <MobileBottomNav
        isCartOpen={isCartOpen}
        onCloseCart={closeCart}
        onOpenCart={() => {
          haptic.light();
          toggleCart();
        }}
      />
    </div>
  );
};
