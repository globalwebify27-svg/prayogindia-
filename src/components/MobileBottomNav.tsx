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
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCart,
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
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
      isActive: pathname?.startsWith("/categories"),
    },
    {
      label: "Cart",
      icon: ShoppingBag,
      onClick: onOpenCart,
      badge: cartCount > 0 ? cartCount : null,
      isFab: true,
      isActive: false,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
      badgeColor: "bg-rose-500",
      isActive: pathname === "/wishlist",
    },
    {
      label: isLoggedIn ? "Account" : "Account",
      href: isLoggedIn ? "/account" : "/login",
      icon: User,
      isActive: pathname?.startsWith("/account") || pathname === "/login",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar with Center FAB"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(15,23,42,0.08)] px-2 pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] select-none"
    >
      <div className="flex items-end justify-around max-w-md mx-auto relative h-[54px]">
        {navItems.map((item) => {
          const Icon = item.icon;

          // ── Center Floating Action Button (FAB) for Cart ──
          if (item.isFab) {
            return (
              <div
                key={item.label}
                className="flex-1 flex flex-col items-center justify-center relative -top-5"
              >
                <button
                  type="button"
                  onClick={item.onClick}
                  aria-label="Open Cart Drawer"
                  className="w-[58px] h-[58px] rounded-full bg-gradient-to-tr from-[#0A1128] via-[#0E2A54] to-[#1E56A0] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(10,17,40,0.35),0_4px_10px_rgba(30,86,160,0.3)] ring-[5px] ring-white hover:ring-slate-50 active:scale-90 transition-all duration-200 cursor-pointer relative group"
                >
                  {/* Subtle inner top glow */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                  <Icon className="w-6 h-6 text-white stroke-[2.2] group-hover:scale-110 transition-transform relative z-10" />

                  {/* Quantity Badge */}
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 z-20 bg-[#FFC20E] text-slate-950 font-black text-[11px] min-w-[21px] h-[21px] px-1 rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-in zoom-in-75">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </button>
                <span className="text-[10px] font-bold text-slate-800 tracking-tight mt-1 leading-none">
                  {item.label}
                </span>
              </div>
            );
          }

          // ── Standard Side Navigation Items ──
          const content = (
            <div className="flex flex-col items-center justify-center py-1 relative w-full">
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive
                      ? "text-[#2563EB] stroke-[2.4] scale-105"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 ${item.badgeColor} text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs ring-1 ring-white animate-in zoom-in-75`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 leading-none transition-colors ${
                  item.isActive
                    ? "font-bold text-[#2563EB]"
                    : "font-semibold text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex-1 flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
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
