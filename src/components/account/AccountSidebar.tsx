"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
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
  const { logoutUser } = useStore();

  const navItems = [
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
    { label: "My Quotations (B2B)", href: "/account/quotations", icon: FileText },
    { label: "Saved Wishlist", href: "/wishlist", icon: Heart },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Reward Points", href: "/account/rewards", icon: Award },
    { label: "Support Tickets", href: "/account/support", icon: Headphones },
  ];

  return (
    <aside className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs space-y-4">
      {/* Desktop & Tablet Sidebar Links */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/account" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                isActive
                  ? "bg-[#E0F7FC] text-[#00AEEF]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-[#00AEEF]" : "text-slate-400"}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => {
            logoutUser();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
};
