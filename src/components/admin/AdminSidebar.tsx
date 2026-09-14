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
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_GROUPS = [
  {
    group: "INVENTORY & STOCK",
    items: [
      {
        label: "Products Catalog",
        href: "/admin/products",
        icon: Package,
        badge: "Add",
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
        label: "Orders & Fulfillment",
        href: "/admin/orders",
        icon: ShoppingBag,
      },
      { label: "Purchases & Suppliers", href: "/admin/purchases", icon: Truck },
      {
        label: "Shipping & Logistics",
        href: "/admin/logistics",
        icon: PackageCheck,
      },
      { label: "Walk-in POS Desk", href: "/admin/pos", icon: Tablet },
      { label: "Quotations", href: "/admin/quotations", icon: Quote },
      { label: "Service Enquiries", href: "/admin/services", icon: Wrench, badge: "New" },
    ],
  },
  {
    group: "FINANCE & REWARDS",
    items: [
      { label: "Order Profit & Margins", href: "/admin/profit", icon: Lock },
      { label: "Rewards & Loyalty", href: "/admin/rewards", icon: Award },
      { label: "Offers & Coupons", href: "/admin/offers", icon: BadgePercent },
      { label: "Business Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    group: "CRM & MARKETING",
    items: [
      { label: "Customer CRM", href: "/admin/customers", icon: Users },
      { label: "B2B Relationships", href: "/admin/relationships", icon: Handshake },
      {
        label: "Executive Incentives",
        href: "/admin/incentives",
        icon: AwardIcon,
      },
      { label: "Announcements & CMS", href: "/admin/cms", icon: Megaphone },
      { label: "WhatsApp Automation", href: "/admin/whatsapp", icon: MessageCircle },
    ],
  },
  {
    group: "CONTENT & LEARNING",
    items: [
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
    <div className="flex flex-col h-full bg-[#0B132B] text-slate-300 w-64 select-none border-r border-slate-800">
      {/* Admin Panel Header Brand */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00AEEF] text-white flex items-center justify-center font-black text-base shadow-md shadow-[#00AEEF]/30">
            P
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide leading-tight">
              PRAYOG INDIA
            </h1>
            <span className="text-[9px] text-[#00AEEF] font-bold uppercase tracking-wider block leading-tight">
              Admin Operations
            </span>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Grouped List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-medium">
        {/* Top Highlighted Dashboard Item */}
        <div className="pb-2">
          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
              pathname === "/admin/dashboard" || pathname === "/admin"
                ? "bg-[#1E88E5] text-white shadow-md shadow-[#1E88E5]/30 font-extrabold"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-white" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Section Groups */}
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group} className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider px-3 pb-1">
              {grp.group}
            </div>
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" &&
                  pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#1E88E5] text-white shadow-md font-bold"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="bg-[#00AEEF] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                      {item.badge}
                    </span>
                  )}

                  {item.hasSub && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Support Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Headphones className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Need Help?
            </span>
            <span className="text-[10px] text-slate-400 block">
              Contact Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Fixed/Sticky Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-40">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
