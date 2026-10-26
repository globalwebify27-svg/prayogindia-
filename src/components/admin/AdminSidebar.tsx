"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Package,
  Tag,
  Building2,
  SlidersHorizontal,
  ArrowLeftRight,
  ClipboardList,
  ShoppingBag,
  Truck,
  PackageCheck,
  Tablet,
  Lock,
  Award,
  BarChart3,
  Users,
  Award as AwardIcon,
  Megaphone,
  UserCog,
  Settings,
  History,
  Headphones,
  ChevronRight,
  X,
  Wrench,
  BadgePercent,
  FileSearch,
  Handshake,
  MessageCircle,
  BookOpen,
  FolderKanban,
  Quote,
  Landmark,
  Sparkles,
  LayoutGrid,
  Image as ImageIcon,
  Plus,
  CreditCard,
} from "lucide-react";
import { PrayogLogo } from "@/components/PrayogLogo";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_GROUPS = [
  {
    group: "INVENTORY & STOCK",
    items: [
      {
        label: "+ Add New Product",
        href: "/admin/products?action=new",
        icon: Plus,
        badge: "Create",
      },
      {
        label: "Products Catalog",
        href: "/admin/products",
        icon: Package,
      },
      {
        label: "Multi-Location Stock",
        href: "/admin/inventory",
        icon: Boxes,
      },
      {
        label: "Categories Master",
        href: "/admin/categories",
        icon: Tag,
      },
      {
        label: "Category Showcase",
        href: "/admin/category-showcase",
        icon: LayoutGrid,
        badge: "Home",
      },
      {
        label: "Physical Store Branches",
        href: "/admin/stores",
        icon: Building2,
      },
      {
        label: "Stock Adjustment",
        href: "/admin/bulk-edit",
        icon: SlidersHorizontal,
      },
      {
        label: "Transfers",
        href: "/admin/inventory?tab=transfers",
        icon: ArrowLeftRight,
        hasSub: true,
      },
      { label: "Stock Audit Log", href: "/admin/audit", icon: ClipboardList },
      { label: "Media Library", href: "/admin/media", icon: FolderKanban },
    ],
  },
  {
    group: "SALES & OPERATIONS",
    items: [
      {
        label: "Order Management",
        href: "/admin/orders",
        icon: ShoppingBag,
        badge: "Live",
      },
      { label: "Purchases & Suppliers", href: "/admin/purchases", icon: Truck },
      {
        label: "Shipping & Logistics",
        href: "/admin/logistics",
        icon: PackageCheck,
      },
      { label: "Walk-in POS Desk", href: "/admin/pos", icon: Tablet },
      { label: "Quotations", href: "/admin/quotations", icon: Quote },
      {
        label: "Service Enquiries",
        href: "/admin/services",
        icon: Wrench,
        badge: "New",
      },
    ],
  },
  {
    group: "FINANCE & REWARDS",
    items: [
      {
        label: "Payment Management",
        href: "/admin/payments",
        icon: CreditCard,
        badge: "NEFT/UPI",
      },
      { label: "Order Profit & Margins", href: "/admin/profit", icon: Lock },
      { label: "Rewards & Loyalty", href: "/admin/rewards", icon: Award },
      { label: "Offers & Coupons", href: "/admin/offers", icon: BadgePercent },
      { label: "Business Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    group: "CRM & MARKETING",
    items: [
      {
        label: "Hero Banners",
        href: "/admin/banners",
        icon: ImageIcon,
        badge: "Live",
      },
      { label: "Customer CRM", href: "/admin/customers", icon: Users },
      {
        label: "B2B Relationships",
        href: "/admin/relationships",
        icon: Handshake,
      },
      {
        label: "Executive Incentives",
        href: "/admin/incentives",
        icon: AwardIcon,
      },
      { label: "Announcements & CMS", href: "/admin/cms", icon: Megaphone },
      {
        label: "WhatsApp Automation",
        href: "/admin/whatsapp",
        icon: MessageCircle,
      },
    ],
  },
  {
    group: "CONTENT & LEARNING",
    items: [
      {
        label: "About Showcase",
        href: "/admin/about-showcase",
        icon: Sparkles,
        badge: "About",
      },
      { label: "Learning Hub", href: "/admin/learning", icon: BookOpen },
    ],
  },
  {
    group: "SYSTEM & SETTINGS",
    items: [
      { label: "Users & Roles", href: "/admin/staff", icon: UserCog },
      { label: "Support Desk", href: "/admin/support", icon: Headphones },
      { label: "Settings", href: "/admin/settings", icon: Settings },
      {
        label: "Activity Log",
        href: "/admin/audit?tab=activity",
        icon: History,
      },
    ],
  },
];

const getNavIconColor = (href: string, isActive: boolean) => {
  if (isActive) return "text-white";
  if (href.includes("action=new")) return "text-emerald-400";
  if (href.startsWith("/admin/orders")) return "text-[#0084FF]";
  if (href.startsWith("/admin/payments")) return "text-emerald-400";
  if (href.startsWith("/admin/products")) return "text-[#38BDF8]";
  if (href.startsWith("/admin/inventory")) return "text-[#60A5FA]";
  if (href.startsWith("/admin/categories")) return "text-amber-400";
  if (href.startsWith("/admin/category-showcase")) return "text-[#00C2E0]";
  if (href.startsWith("/admin/stores")) return "text-indigo-400";
  if (href.startsWith("/admin/bulk-edit")) return "text-rose-400";
  if (href.startsWith("/admin/audit")) return "text-amber-400";
  if (href.startsWith("/admin/media")) return "text-cyan-400";
  if (href.startsWith("/admin/purchases")) return "text-orange-400";
  if (href.startsWith("/admin/logistics")) return "text-[#00C2E0]";
  if (href.startsWith("/admin/pos")) return "text-purple-400";
  if (href.startsWith("/admin/quotations")) return "text-pink-400";
  if (href.startsWith("/admin/services")) return "text-teal-400";
  if (href.startsWith("/admin/profit")) return "text-amber-400";
  if (href.startsWith("/admin/rewards")) return "text-yellow-400";
  if (href.startsWith("/admin/offers")) return "text-rose-400";
  if (href.startsWith("/admin/reports")) return "text-blue-400";
  if (href.startsWith("/admin/banners")) return "text-pink-400";
  if (href.startsWith("/admin/customers")) return "text-sky-400";
  if (href.startsWith("/admin/relationships")) return "text-emerald-400";
  if (href.startsWith("/admin/incentives")) return "text-amber-400";
  if (href.startsWith("/admin/cms")) return "text-violet-400";
  if (href.startsWith("/admin/whatsapp")) return "text-emerald-400";
  if (href.startsWith("/admin/about-showcase")) return "text-purple-400";
  if (href.startsWith("/admin/learning")) return "text-[#38BDF8]";
  if (href.startsWith("/admin/staff")) return "text-cyan-400";
  if (href.startsWith("/admin/support")) return "text-emerald-400";
  if (href.startsWith("/admin/settings")) return "text-slate-300";
  return "text-[#38BDF8]";
};

const getBadgeStyle = (badge: string, isActive: boolean) => {
  if (isActive) {
    return "bg-white/20 text-white border border-white/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider";
  }
  const b = badge.toUpperCase();
  if (b === "LIVE") {
    return "bg-[#0084FF] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs";
  }
  if (b.includes("NEFT") || b.includes("UPI")) {
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase";
  }
  if (b === "CREATE") {
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase";
  }
  if (b === "NEW") {
    return "bg-[#10B981] text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider";
  }
  if (b === "HOME") {
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase";
  }
  if (b === "ABOUT") {
    return "bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase";
  }
  return "bg-[#0084FF] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider";
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-[#0C2556] text-slate-200 w-64 select-none border-r border-[#153573] overflow-hidden">
      {/* Admin Panel Header Brand (Fixed at top of sidebar) */}
      <div className="p-4 border-b border-[#153573] flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <Link href="/admin">
            <PrayogLogo size="sm" dark={true} />
          </Link>
          <span className="text-[9px] text-[#00C2E0] font-black uppercase tracking-widest block leading-tight pl-0.5">
            Admin Operations
          </span>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Grouped List (Scrolls independently within sidebar only) */}
      <nav className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-medium [scrollbar-width:thin] [scrollbar-color:#153573_transparent]">
        {/* Top Highlighted Navigation Items */}
        <div className="space-y-1.5 pb-2.5 border-b border-[#153573]">
          <Link
            href="/admin/hub"
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
              pathname === "/admin/hub"
                ? "bg-gradient-to-r from-[#0084FF] to-[#006CE6] text-white shadow-lg shadow-[#0084FF]/30 font-black border border-blue-400/50"
                : "text-white bg-[#102C66] hover:bg-[#153A82] border border-[#1C4694]/70 hover:border-[#2563EB]/60 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles
                className={`w-4 h-4 ${
                  pathname === "/admin/hub" ? "text-white" : "text-amber-400"
                }`}
              />
              <span>Unified Hub (All-in-1)</span>
            </div>
            <span
              className={
                pathname === "/admin/hub"
                  ? "bg-white/20 text-white border border-white/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                  : "bg-[#10B981] text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
              }
            >
              NEW
            </span>
          </Link>

          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
              pathname === "/admin/dashboard" || pathname === "/admin"
                ? "bg-gradient-to-r from-[#0084FF] to-[#006CE6] text-white shadow-lg shadow-[#0084FF]/30 font-black border border-blue-400/50"
                : "text-white bg-[#102C66] hover:bg-[#153A82] border border-[#1C4694]/70 hover:border-[#2563EB]/60 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard
                className={`w-4 h-4 ${
                  pathname === "/admin/dashboard" || pathname === "/admin"
                    ? "text-white"
                    : "text-[#38BDF8]"
                }`}
              />
              <span>Overview Dashboard</span>
            </div>
          </Link>
        </div>

        {/* 🌟 CORE OPERATIONS HIGH-VISIBILITY PANEL */}
        <div className="space-y-1.5 pb-3 border-b border-[#153573]">
          <div className="text-[10px] font-black uppercase text-[#00C2E0] tracking-wider px-3 pb-1 flex items-center justify-between">
            <span>CORE OPERATIONS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C2E0] animate-pulse" />
          </div>

          {/* 1. Order Management */}
          <Link
            href="/admin/orders"
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
              pathname?.startsWith("/admin/orders")
                ? "bg-gradient-to-r from-[#0084FF] to-[#006CE6] text-white shadow-lg shadow-[#0084FF]/30 font-black border border-blue-400/50"
                : "text-white bg-[#102C66] hover:bg-[#153A82] border border-[#1C4694]/70 hover:border-[#2563EB]/60 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag
                className={`w-4 h-4 shrink-0 ${
                  pathname?.startsWith("/admin/orders")
                    ? "text-white"
                    : "text-[#0084FF]"
                }`}
              />
              <span>Order Management</span>
            </div>
            <span
              className={
                pathname?.startsWith("/admin/orders")
                  ? "bg-white/20 text-white border border-white/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                  : "bg-[#0084FF] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
              }
            >
              LIVE
            </span>
          </Link>

          {/* 2. Payment Management */}
          <Link
            href="/admin/payments"
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
              pathname?.startsWith("/admin/payments")
                ? "bg-gradient-to-r from-[#0084FF] to-[#006CE6] text-white shadow-lg shadow-[#0084FF]/30 font-black border border-blue-400/50"
                : "text-white bg-[#102C66] hover:bg-[#153A82] border border-[#1C4694]/70 hover:border-[#2563EB]/60 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard
                className={`w-4 h-4 shrink-0 ${
                  pathname?.startsWith("/admin/payments")
                    ? "text-white"
                    : "text-emerald-400"
                }`}
              />
              <span>Payment Management</span>
            </div>
            <span
              className={
                pathname?.startsWith("/admin/payments")
                  ? "bg-white/20 text-white border border-white/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
              }
            >
              NEFT
            </span>
          </Link>

          {/* 3. Add New Product */}
          <Link
            href="/admin/products?action=new"
            onClick={onCloseMobile}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 border border-emerald-400/40"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="font-black">+ Add New Product</span>
            </div>
            <span className="text-[10px] font-black bg-white/20 border border-white/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              CREATE
            </span>
          </Link>
        </div>

        {/* Section Groups */}
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group} className="space-y-1.5">
            <div className="text-[10px] font-black uppercase text-[#6B8EC4] tracking-wider px-3 pb-0.5 pt-1">
              {grp.group}
            </div>
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isExact = pathname === item.href;
              const isSubPath =
                item.href !== "/admin/dashboard" &&
                item.href !== "/admin" &&
                !item.href.includes("?") &&
                pathname?.startsWith(item.href);
              const isActive = isExact || isSubPath;

              const isCreateProduct = item.href === "/admin/products?action=new";
              const iconColor = getNavIconColor(item.href, isActive);
              const badgeStyle = item.badge
                ? getBadgeStyle(item.badge, isActive)
                : "";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? "bg-gradient-to-r from-[#0084FF] to-[#006CE6] text-white shadow-lg shadow-[#0084FF]/30 font-black border border-blue-400/50"
                      : isCreateProduct
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 border border-emerald-400/40"
                      : "text-white bg-[#102C66] hover:bg-[#153A82] border border-[#1C4694]/70 hover:border-[#2563EB]/60 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isCreateProduct && !isActive
                          ? "text-white stroke-[2.5]"
                          : iconColor
                      }`}
                    />
                    <span
                      className={`truncate ${
                        isCreateProduct ? "font-black" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
                    {item.badge && (
                      <span
                        className={
                          isCreateProduct && !isActive
                            ? "text-[10px] font-black bg-white/20 border border-white/30 px-2 py-0.5 rounded-full uppercase tracking-wider"
                            : badgeStyle
                        }
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.hasSub && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-white" : "text-[#7B9CCB]"
                        }`}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Support Card (Fixed at bottom of sidebar) */}
      <div className="p-4 border-t border-[#153573] shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#12316B] border border-[#183B7E]">
          <div className="w-8 h-8 rounded-xl bg-[#183B7E] flex items-center justify-center text-[#00C2E0]">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Need Help?
            </span>
            <span className="text-[10px] text-[#8EA9D4] block">
              Contact Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Fixed Sidebar (Never scrolls with main page) */}
      <aside className="hidden lg:flex flex-col shrink-0 h-screen w-64 z-40 bg-[#0C2556]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
};
