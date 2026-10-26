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
                ? "bg-gradient-to-r from-[#0084FF] to-[#006CE6] text-white shadow-lg shadow-[#0084FF]/30 font-black"
                : "bg-[#13306B] text-amber-300 border border-amber-400/30 hover:bg-[#183B7E] hover:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Unified Hub (All-in-1)</span>
            </div>
            <span className="bg-[#10B981] text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              NEW
            </span>
          </Link>

          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
              pathname === "/admin/dashboard" || pathname === "/admin"
                ? "bg-[#0084FF] text-white shadow-lg shadow-[#0084FF]/30 font-black"
                : "text-[#8EA9D4] hover:bg-[#143575] hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-white" />
            <span>Overview Dashboard</span>
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
                ? "bg-[#0084FF] text-white shadow-lg shadow-[#0084FF]/30 font-black"
                : "text-white bg-[#102C66] hover:bg-[#153A82] border border-[#1C4694]/70"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-[#0084FF] shrink-0" />
              <span>Order Management</span>
            </div>
            <span className="bg-[#0084FF] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              LIVE
            </span>
          </Link>

          {/* 2. Payment Management */}
          <Link
            href="/admin/payments"
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
              pathname?.startsWith("/admin/payments")
                ? "bg-[#0084FF] text-white shadow-lg shadow-[#0084FF]/30 font-black"
                : "text-white bg-[#102C66] hover:bg-[#153A82] border border-[#1C4694]/70"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Payment Management</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
              NEFT
            </span>
          </Link>

          {/* 3. Add New Product */}
          <Link
            href="/admin/products?action=new"
            onClick={onCloseMobile}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="font-black">+ Add New Product</span>
            </div>
            <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.5 rounded-md">
              CREATE
            </span>
          </Link>
        </div>

        {/* Section Groups */}
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group} className="space-y-1">
            <div className="text-[10px] font-black uppercase text-[#6B8EC4] tracking-wider px-3 pb-1">
              {grp.group}
            </div>
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" &&
                  pathname?.startsWith(item.href));

              // Thematic badge color matching Image 2
              const badgeBg =
                item.badge === "Add"
                  ? "bg-[#00C2E0] text-slate-950"
                  : item.badge === "Home"
                  ? "bg-[#F59E0B] text-slate-950"
                  : "bg-[#0084FF] text-white";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#0084FF] text-white shadow-md shadow-[#0084FF]/25 font-black"
                      : "text-[#8EA9D4] hover:bg-[#143575] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-[#7B9CCB]"}`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`${badgeBg} text-[9px] font-black px-2 py-0.5 rounded-full uppercase`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.hasSub && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#5F83B8]" />
                  )}
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
