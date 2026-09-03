"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Menu, X } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
  ].includes(pathname);

  return (
    <div className="py-8 bg-slate-50/50 min-h-[70vh]">
      {isAuthPage ? (
        <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Mobile Account Navigation Trigger */}
          <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
            <span className="text-xs font-black uppercase text-slate-900">
              Account Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
              <span>Navigation</span>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden">
              <AccountSidebar />
            </div>
          )}

          {/* Desktop 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="hidden lg:block lg:col-span-3 sticky top-24">
              <AccountSidebar />
            </div>

            <div className="lg:col-span-9">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
