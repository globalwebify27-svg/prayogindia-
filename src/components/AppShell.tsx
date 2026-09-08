"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { FooterSection } from "@/components/FooterSection";
import { CartDrawer } from "@/components/CartDrawer";
import { CartToast } from "@/components/CartToast";
import { B2BModal } from "@/components/Modals";
import { useStore } from "@/context/StoreContext";
import { usePathname } from "next/navigation";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const {
    cart,
    wishlist,
    cartNotification,
    dismissCartNotification,
    updateQuantity,
    removeFromCart,
  } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [b2bOpen, setB2bOpen] = useState(false);

  const isIsolatedOperationsRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login-staff") ||
    pathname?.startsWith("/store") ||
    pathname?.startsWith("/kiosk") ||
    pathname?.startsWith("/walk-in") ||
    pathname?.startsWith("/flutter-preview") ||
    pathname?.includes("/storemanager") ||
    pathname?.includes("/device") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  if (isIsolatedOperationsRoute) {
    return <main className="flex-1 bg-[#0F172A]">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-[#1E56A0] selection:text-white">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setCartOpen(true)}
        onOpenSearch={() => {}}
        onOpenB2BModal={() => setB2bOpen(true)}
      />

      <main className="flex-1">{children}</main>

      <FooterSection />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={(id, delta) => updateQuantity(id, delta)}
        onRemoveItem={(id) => removeFromCart(id)}
        onOpenB2BModal={() => {
          setCartOpen(false);
          setB2bOpen(true);
        }}
      />

      <B2BModal isOpen={b2bOpen} onClose={() => setB2bOpen(false)} />

      <CartToast
        notification={cartNotification}
        onClose={dismissCartNotification}
        onOpenCart={() => setCartOpen(true)}
      />
    </div>
  );
};
