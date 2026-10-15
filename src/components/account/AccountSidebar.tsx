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
  CreditCard,
  Sparkles,
} from "lucide-react";

export const AccountSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutUser } = useStore();

  const navItems = [
    { label: "Dashboard", href: "/account", icon: LayoutDashboard },
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
    { label: "Saved Wishlist", href: "/wishlist", icon: Heart },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Payment Methods", href: "/account/payments", icon: CreditCard },
    { label: "Reward Points", href: "/account/rewards", icon: Award },
    {
      label: "My Quotations (B2B)",
      href: "/account/quotations",
      icon: FileText,
    },
    { label: "Support Tickets", href: "/account/support", icon: Headphones },
  ];

  return (
    <aside className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* User Header in Sidebar */}
      <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
          {user?.name
            ? user.name
                .trim()
                .split(/\s+/)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "OK"}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-extrabold text-slate-900 truncate">
            {user?.name || "Customer"}
          </h4>
          <span className="text-[10px] text-slate-500 truncate block">
            {user?.email || "customer@prayog.in"}
          </span>
        </div>
      </div>

      {/* Sidebar Links */}
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#0A1128] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-[#FFC20E]" : "text-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="border-t border-slate-100 my-1 pt-1" />

        <button
          onClick={() => {
            logoutUser();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
};
