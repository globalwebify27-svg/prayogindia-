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
    <div className="bg-[#F4F7FC] min-h-[calc(100vh-64px)] py-2 sm:py-3.5 overflow-x-hidden">
      {isAuthPage ? (
        <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-6">
          {children}
        </div>
      ) : (
        <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          {/* ── Mobile Back Header Bar for subpages ── */}
          {pathname !== "/account" && (
            <div className="lg:hidden w-full mb-2.5 bg-white rounded-xl border border-slate-200/80 px-3.5 py-2 flex items-center justify-between shadow-2xs">
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

          {/* ── Desktop & Tablet 2-Column Dashboard Layout ── */}
          <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-5">
            {/* Left Sidebar Column - Sticky on Desktop */}
            <div className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-[72px]">
              <AccountSidebar />
            </div>

            {/* Right Main Content Column */}
            <div className="flex-1 min-w-0 w-full">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
