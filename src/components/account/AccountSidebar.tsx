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
    <aside className="w-full flex flex-col gap-2.5 select-none">
      {/* ── Top Box: Dark Navy Profile Card ── */}
      <div className="bg-[#0A1128] rounded-2xl p-3 sm:p-3.5 text-white flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
          <User className="w-5 h-5 text-[#0A1128]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
            {user?.name || (user?.email ? user.email.split("@")[0] : "My Account")}
          </h3>
          <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
            {user?.email || user?.phone || "Signed In"}
          </p>
        </div>
      </div>

      {/* ── Main Navigation Card ── */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs flex flex-col relative overflow-hidden">
        {/* Navigation Items */}
        <nav className="space-y-0.5">
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
                className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-blue-50/80 text-[#2563EB] font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#2563EB] before:rounded-r-full"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
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
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Logout & Watermark */}
        <div className="pt-2 mt-2 border-t border-slate-100/80 flex flex-col">
          <button
            type="button"
            onClick={() => {
              logoutUser();
              router.push("/login");
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Logout</span>
          </button>

          {/* Faint Skyline Silhouette Watermark */}
          <div className="pt-3 pb-1 px-2 opacity-20 pointer-events-none select-none flex justify-center">
            <Image
              src="/images/account/sidebar_skyline.png"
              alt="Cityscape"
              width={140}
              height={45}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
