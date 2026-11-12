"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  LayoutGrid,
  User,
  ShoppingBag,
  Heart,
  MapPin,
  FileText,
  Headphones,
  LogOut,
  ChevronRight,
} from "lucide-react";

export const AccountSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutUser } = useStore();

  const navItems = [
    { label: "Dashboard", href: "/account", icon: LayoutGrid },
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
    { label: "Saved Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    {
      label: "My Quotations (B2B)",
      href: "/account/quotations",
      icon: FileText,
    },
    { label: "Support Tickets", href: "/account/support", icon: Headphones },
  ];

  return (
    <aside className="w-full flex flex-col gap-3.5 select-none">
      {/* ── Top Box: Dark Navy Profile Card (Matches Mockup) ── */}
      <div className="bg-[#0A1128] rounded-2xl p-4 text-white flex items-center gap-3.5 shadow-sm">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
          <User className="w-6 h-6 text-[#0A1128]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white tracking-tight truncate">
            {user?.name || (user?.email ? user.email.split("@")[0] : "My Account")}
          </h3>
          <p className="text-xs text-slate-400 font-normal truncate mt-0.5">
            {user?.email || user?.phone || "Signed In"}
          </p>
        </div>
      </div>

      {/* ── Main Navigation Card (Matches Mockup) ── */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[480px] relative overflow-hidden">
        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/account"
                ? pathname === "/account"
                : pathname === item.href ||
                  (item.href !== "/account" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all group ${
                  isActive
                    ? "bg-blue-50/80 text-[#2563EB] font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#2563EB] before:rounded-r-full"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-[#2563EB]"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {!isActive && (
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Logout & Watermark */}
        <div className="pt-4 border-t border-slate-100/80 flex flex-col mt-auto">
          <button
            type="button"
            onClick={() => {
              logoutUser();
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500 shrink-0" />
            <span>Logout</span>
          </button>

          {/* Faint Skyline Silhouette Watermark (from Mockup) */}
          <div className="pt-5 px-2 opacity-25 pointer-events-none select-none flex justify-center">
            <Image
              src="/images/account/sidebar_skyline.png"
              alt="Cityscape"
              width={160}
              height={60}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
