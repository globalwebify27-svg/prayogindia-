"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Heart,
  User,
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenCart?: () => void;
  onCloseCart?: () => void;
  isCartOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCart,
  onCloseCart,
  isCartOpen = false,
}) => {
  const pathname = usePathname();
  const { cart, wishlist, isLoggedIn } = useStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Don't show bottom nav on admin/isolated routes
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login-staff") ||
    pathname?.startsWith("/store") ||
    pathname?.startsWith("/flutter-preview")
  ) {
    return null;
  }

  // Pages that have their own dedicated sticky action bar
  const hasPageSpecificActionBar =
    pathname?.startsWith("/products/") ||
    pathname?.startsWith("/product/") ||
    pathname?.startsWith("/services/") ||
    pathname?.startsWith("/service/") ||
    pathname?.startsWith("/checkout");

  if (hasPageSpecificActionBar) {
    return null;
  }

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      id: "categories",
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingBag,
      onClick: onOpenCart,
      badge: cartCount > 0 ? cartCount : null,
      badgeColor: "bg-[#FFC20E] text-slate-950",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      id: "account",
      label: "Account",
      href: isLoggedIn ? "/account" : "/login",
      icon: User,
    },
  ];

  // Determine active tab index (0 to 4)
  let activeIndex = 0;
  if (isCartOpen) {
    activeIndex = 2;
  } else if (pathname === "/") {
    activeIndex = 0;
  } else if (
    pathname?.startsWith("/categories") ||
    pathname?.startsWith("/products") ||
    pathname?.startsWith("/search")
  ) {
    activeIndex = 1;
  } else if (pathname?.startsWith("/cart")) {
    activeIndex = 2;
  } else if (pathname === "/wishlist") {
    activeIndex = 3;
  } else if (pathname?.startsWith("/account") || pathname === "/login") {
    activeIndex = 4;
  }

  const activeItem = navItems[activeIndex] || navItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <nav
      aria-label="Mobile Navigation Bar with Animated Curved Tab Indicator"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] select-none pb-[env(safe-area-inset-bottom)]"
    >
      {/* ── 1. Sliding Curved Notch Background ── */}
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col pointer-events-none overflow-hidden filter drop-shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        {/* Fixed 60px height bar track */}
        <div className="h-[60px] relative w-full">
          {/* Sliding Notch Assembly: Left Wing + Notch SVG + Right Wing */}
          <div
            className="absolute top-0 flex items-stretch h-[60px] will-change-transform transition-all duration-[420ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              left: `${(activeIndex + 0.5) * 20}%`,
              transform: "translate3d(-50%, 0, 0)",
              width: "calc(110px + 200vw)",
            }}
          >
            {/* Left White Wing extending 100vw to the left */}
            <div className="w-[100vw] bg-white border-t border-slate-200 shrink-0" />

            {/* Center Scalloped Notch SVG: 110px wide with ultra-smooth cubic easing */}
            <div className="w-[110px] h-[60px] shrink-0 relative -mx-[0.5px]">
              <svg
                viewBox="0 0 110 60"
                className="w-full h-full block"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Solid White Fill extending to bottom of bar */}
                <path
                  d="M 0 0 
                     C 14 0, 21 2.5, 27 8.5 
                     C 34 16, 44 31, 55 31 
                     C 66 31, 76 16, 83 8.5 
                     C 89 2.5, 96 0, 110 0 
                     L 110 60 
                     L 0 60 
                     Z"
                  fill="white"
                />
                {/* Top Border Line following the curve */}
                <path
                  d="M 0 0.5 
                     C 14 0.5, 21 3, 27 9 
                     C 34 16.5, 44 31.5, 55 31.5 
                     C 66 31.5, 76 16.5, 83 9 
                     C 89 3, 96 0.5, 110 0.5"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Right White Wing extending 100vw to the right */}
            <div className="w-[100vw] bg-white border-t border-slate-200 shrink-0" />
          </div>
        </div>

        {/* Safe-Area Bottom Fill */}
        <div className="flex-1 bg-white" />
      </div>

      {/* ── 2. Floating Circular Active Button (Moves smoothly across the 5 tabs) ── */}
      <div
        className="absolute top-0 z-20 pointer-events-auto will-change-transform transition-all duration-[420ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          left: `${(activeIndex + 0.5) * 20}%`,
          transform: "translate3d(-50%, 0, 0)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (activeItem.id === "cart") {
              if (isCartOpen && onCloseCart) {
                onCloseCart();
              } else if (activeItem.onClick) {
                activeItem.onClick();
              }
            } else if (activeItem.onClick) {
              activeItem.onClick();
            }
          }}
          aria-label={`Active Tab: ${activeItem.label}`}
          className="absolute -top-[24px] -translate-x-1/2 left-1/2 w-[48px] h-[48px] rounded-full bg-gradient-to-tr from-[#0A233F] via-[#12365D] to-[#2563EB] text-white flex items-center justify-center shadow-[0_8px_22px_rgba(10,35,63,0.28)] hover:shadow-[0_10px_26px_rgba(37,99,235,0.38)] active:scale-95 transition-all duration-200 cursor-pointer group"
        >
          {/* Subtle inner top glow */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

          {/* Active Tab Icon with smooth animated transition */}
          <ActiveIcon
            key={activeItem.id}
            className="w-5 h-5 text-white stroke-[2.4] transition-all duration-300 group-hover:scale-110"
          />

          {/* Badge on active button if applicable (e.g. cart or wishlist) */}
          {activeItem.badge !== null && activeItem.badge !== undefined && (
            <span className="absolute -top-1 -right-1 z-20 bg-[#FFC20E] text-slate-950 font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-md ring-2 ring-white transition-transform duration-200">
              {activeItem.badge > 99 ? "99+" : activeItem.badge}
            </span>
          )}
        </button>
      </div>

      {/* ── 3. Interactive Navigation Items ── */}
      <div className="relative z-10 flex items-center justify-around w-full h-[60px] px-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;

          const content = (
            <div className="flex flex-col items-center justify-center py-1 relative w-full">
              {/* Icon (fades out and floats up when active since it's displayed in the circle) */}
              <div
                className={`relative transition-all duration-200 ${
                  isActive
                    ? "opacity-0 -translate-y-2 pointer-events-none scale-75"
                    : "opacity-100 translate-y-0"
                }`}
              >
                <Icon className="w-5 h-5 text-slate-500 hover:text-slate-900 transition-colors" />

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 ${item.badgeColor} text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs ring-1 ring-white animate-in zoom-in-75`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight leading-none transition-all duration-200 ${
                  isActive
                    ? "font-bold text-[#2563EB] mt-3.5 scale-105"
                    : "font-semibold text-slate-500 mt-1"
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "cart" && isCartOpen && onCloseCart) {
                    onCloseCart();
                  } else if (item.onClick) {
                    item.onClick();
                  }
                }}
                className="flex-1 flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href!}
              onClick={() => {
                if (onCloseCart) onCloseCart();
              }}
              className="flex-1 flex items-center justify-center select-none active:scale-95 transition-transform"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
