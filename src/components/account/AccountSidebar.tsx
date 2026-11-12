"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Award,
  Headphones,
  LogOut,
  FileText,
} from "lucide-react";

export const AccountSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutUser } = useStore();

  const navItems = [
    { label: "Dashboard", href: "/account", icon: LayoutDashboard },
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
    { label: "Saved Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Reward Points", href: "/account/rewards", icon: Award },
    {
      label: "My Quotations (B2B)",
      href: "/account/quotations",
      icon: FileText,
    },
    { label: "Support Tickets", href: "/account/support", icon: Headphones },
  ];

  return (
    <aside className="w-full h-full flex flex-col justify-between bg-white select-none">
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* User Header in Sidebar (Matching Image 1: Phone / User Identifier) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight block truncate">
            {user?.phone || "+91 87097 89641"}
          </span>
          <span className="text-[11px] text-slate-400 block truncate mt-0.5">
            {user?.name ? `${user.name} • Prayog Customer` : user?.email || "customer@prayog.in"}
          </span>
        </div>

        {/* Sidebar Links matching Image 1: Clean vertical list with icons */}
        <nav className="py-2 flex-1">
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
                className={`flex items-center gap-3 px-5 py-3 text-xs font-semibold transition-all border-l-3 ${
                  isActive
                    ? "bg-slate-50 text-[#0A1128] font-extrabold border-l-[#0A1128]"
                    : "text-slate-600 hover:bg-slate-50/70 hover:text-slate-900 border-l-transparent"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-[#0A1128]" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <button
          onClick={() => {
            logoutUser();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
