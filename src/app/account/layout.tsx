"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ChevronLeft } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/account/orders": "My Orders",
  "/account/wishlist": "Saved Wishlist",
  "/account/addresses": "Saved Addresses",
  "/account/quotations": "My Quotations",
  "/account/profile": "My Profile",
  "/account/support": "Support Tickets",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
  ].includes(pathname);

  return (
    <div className="pt-1 sm:pt-1.5 pb-3 lg:pb-4 bg-slate-50/60 min-h-[70vh] overflow-x-hidden">
      {isAuthPage ? (
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-8">
          {children}
        </div>
      ) : (
        <div className="w-full max-w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          {/* ── Mobile Back Header Bar (Matching Image 2 Reference: "< Account") ── */}
          {pathname !== "/account" && (
            <div className="lg:hidden w-full max-w-full mb-3 bg-white rounded-xl border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-[#2563EB] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back to Account</span>
              </Link>
              <span className="text-xs font-extrabold text-[#2563EB]">
                {pageTitles[pathname] || "Dashboard"}
              </span>
            </div>
          )}

          {/* Desktop 2-Column Unified Container (Matching Image 1 Reference) */}
          <div className="bg-transparent lg:bg-white rounded-none lg:rounded-2xl border-0 lg:border lg:border-slate-200/90 shadow-none lg:shadow-2xs overflow-visible lg:overflow-hidden flex flex-col lg:flex-row lg:h-[calc(100vh-100px)] min-h-0 lg:min-h-[580px] lg:sticky lg:top-[74px]">
            {/* Left Sidebar - Fixed and persistent on desktop */}
            <div className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-slate-200/80 bg-white h-full overflow-hidden">
              <AccountSidebar />
            </div>

            {/* Right Main Content - Zero extra outer boxes on mobile, clean scroll on desktop */}
            <div className="flex-1 min-w-0 bg-transparent lg:bg-[#F8FAFC] p-0 lg:p-8 lg:h-full lg:overflow-y-auto lg:overscroll-y-contain [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
