"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Boxes,
  ShoppingBag,
  Tablet,
  Users,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  MapPin,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Building2,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { PrayogLogo } from "@/components/PrayogLogo";
import { StaffSessionUser } from "@/lib/staffAuth";

export default function StoreManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [staff, setStaff] = useState<StaffSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/login-staff");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success && data?.user) {
          // If a KIOSK_USER somehow reaches here, send them to /kiosk
          if (data.user.role === "KIOSK_USER") {
            router.replace("/kiosk");
            return;
          }
          setStaff(data.user);
        } else {
          router.replace("/login-staff");
        }
      })
      .catch(() => router.replace("/login-staff"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/staff/auth/logout", { method: "POST" });
      router.replace("/login-staff");
    } catch {
      router.replace("/login-staff");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider text-slate-300">
            Loading Store Manager Portal...
          </span>
        </div>
      </div>
    );
  }

  const storeCode = (staff?.storeCode || "PATNA").toUpperCase();
  const storeName = staff?.storeName || `${storeCode} Branch`;

  const navSections = [
    {
      title: "Store Operations",
      items: [
        {
          label: "Store Overview",
          href: "/store/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "POS & Billing",
          href: "/store/pos",
          icon: CreditCard,
        },
        {
          label: "Branch Orders",
          href: "/store/orders",
          icon: ShoppingBag,
        },
      ],
    },
    {
      title: "Stock & Logistics",
      items: [
        {
          label: "Local Inventory",
          href: "/store/inventory",
          icon: Boxes,
        },
        {
          label: "Stock Transfers",
          href: "/store/transfers",
          icon: ArrowLeftRight,
        },
      ],
    },
    {
      title: "Store Administration",
      items: [
        {
          label: "Store Customers",
          href: "/store/customers",
          icon: Users,
        },
        {
          label: "Store Staff",
          href: "/store/staff",
          icon: UserCheck,
        },
        {
          label: "Kiosk Tablets",
          href: "/store/devices",
          icon: Tablet,
        },
        {
          label: "Reports & Analytics",
          href: "/store/reports",
          icon: BarChart3,
        },
        {
          label: "Store Profile",
          href: "/store/profile",
          icon: Building2,
        },
      ],
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col font-sans select-none print:h-auto print:w-auto print:overflow-visible">
      {/* Top Header Bar (Fixed / Pinned at top) */}
      <header className="shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3 flex items-center justify-between z-30 shadow-2xs no-print">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900 p-1"
          >
            {mobileNavOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <PrayogLogo size="sm" showSubtitle={false} />

          <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{storeName}</span>
            <span className="bg-[#2563EB] text-white px-2 py-0.5 rounded-md font-bold text-[10px]">
              {storeCode}
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {staff?.role === "SUPER_ADMIN" && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Back to
              Admin
            </Link>
          )}

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {staff?.name}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              @{staff?.username} • Store Manager
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 p-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container: Left Sidebar & Main Content scroll independently */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Sidebar Nav (Section 1: Dedicated independent scrollable column) */}
        <aside
          className={`
            no-print fixed md:static inset-y-0 left-0 z-40 md:z-auto w-64 bg-white border-r border-slate-200/90 p-4 flex flex-col justify-between shrink-0
            h-full overflow-y-auto overscroll-contain shadow-xl md:shadow-2xs
            transform transition-transform duration-200 ease-in-out md:translate-x-0
            [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300
            ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="space-y-4">
            {/* Mobile drawer header with close button */}
            <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <PrayogLogo size="sm" showSubtitle={false} />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Store Scope Badge */}
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Branch Portal
                </div>
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-[#2563EB]" /> {storeCode}{" "}
                  Store
                </div>
              </div>
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                title="Store Online"
              />
            </div>

            {/* Navigation Links */}
            <nav className="space-y-4">
              {navSections.map((sec) => (
                <div key={sec.title} className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-0.5">
                    {sec.title}
                  </div>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      (item.href === "/store/dashboard" && pathname === "/store");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${active ? "opacity-90" : "opacity-30"}`}
                        />
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            Prayog India Retail POS v2.6
          </div>
        </aside>

        {/* Main Content Area (Section 2: Dedicated independent scrollable area) */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-slate-50 min-w-0 overscroll-contain select-text [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
          {children}
        </main>
      </div>
    </div>
  );
}
