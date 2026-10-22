"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Award,
  FileText,
  User,
  Headphones,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutUser } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
  ].includes(pathname);

  const navTabs = [
    { label: "Dashboard", href: "/account", icon: LayoutDashboard },
    { label: "Orders", href: "/account/orders", icon: ShoppingBag },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
    { label: "Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Rewards", href: "/account/rewards", icon: Award },
    { label: "Quotations", href: "/account/quotations", icon: FileText },
    { label: "Profile", href: "/account/profile", icon: User },
    { label: "Support", href: "/account/support", icon: Headphones },
  ];

  return (
    <div className="py-3 sm:py-8 bg-slate-50/60 min-h-[70vh]">
      {isAuthPage ? (
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-8">
          {children}
        </div>
      ) : (
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-3 sm:space-y-6">
          {/* ── Mobile Horizontal Scrollable Navigation Pills ── */}
          <div className="lg:hidden space-y-2">
            <div
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 touch-pan-x touch-pan-y"
              style={{ touchAction: "pan-x pan-y" }}
            >
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  tab.href === "/account"
                    ? pathname === "/account"
                    : pathname === tab.href ||
                      (tab.href !== "/account" && pathname.startsWith(tab.href));

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? "bg-[#0A1128] text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? "text-[#FFC20E]" : "text-slate-400"
                      }`}
                    />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Quick Sign Out Pill */}
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  router.push("/login");
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 whitespace-nowrap shrink-0 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Desktop 2-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 shrink-0 sticky top-24">
              <AccountSidebar />
            </div>

            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
