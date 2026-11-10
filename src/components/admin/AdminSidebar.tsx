"use client";

import React, { useState, useMemo } from "react";
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
  Handshake,
  MessageCircle,
  BookOpen,
  FolderKanban,
  Quote,
  LayoutTemplate,
  LayoutGrid,
  Image as ImageIcon,
  CreditCard,
  Search,
} from "lucide-react";
import { PrayogLogo } from "@/components/PrayogLogo";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  hasSub?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "ORDERS & SALES",
    items: [
      {
        label: "Order Management",
        href: "/admin/orders",
        icon: ShoppingBag,
        badge: "LIVE",
      },
      {
        label: "Walk-in POS Desk",
        href: "/admin/pos",
        icon: Tablet,
      },
      {
        label: "Payment Management",
        href: "/admin/payments",
        icon: CreditCard,
        badge: "NEFT",
      },
      {
        label: "Quotations",
        href: "/admin/quotations",
        icon: Quote,
      },
      {
        label: "Service Enquiries",
        href: "/admin/services",
        icon: Wrench,
        badge: "NEW",
      },
    ],
  },
  {
    group: "INVENTORY & SUPPLY CHAIN",
    items: [
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
        label: "Inter-Store Transfers",
        href: "/admin/inventory?tab=transfers",
        icon: ArrowLeftRight,
        hasSub: true,
      },
      {
        label: "Stock Adjustment",
        href: "/admin/bulk-edit",
        icon: SlidersHorizontal,
      },
      {
        label: "Purchases & Suppliers",
        href: "/admin/purchases",
        icon: Truck,
      },
      {
        label: "Shipping & Logistics",
        href: "/admin/logistics",
        icon: PackageCheck,
      },
      {
        label: "Stock Audit Log",
        href: "/admin/audit",
        icon: ClipboardList,
      },
    ],
  },
  {
    group: "STOREFRONTS & CMS",
    items: [
      {
        label: "Categories Master",
        href: "/admin/categories",
        icon: Tag,
      },
      {
        label: "Category Showcase",
        href: "/admin/category-showcase",
        icon: LayoutGrid,
        badge: "HOME",
      },
      {
        label: "Physical Store Branches",
        href: "/admin/stores",
        icon: Building2,
      },
      {
        label: "Hero Banners",
        href: "/admin/banners",
        icon: ImageIcon,
        badge: "LIVE",
      },
      {
        label: "Announcements & CMS",
        href: "/admin/cms",
        icon: Megaphone,
      },
      {
        label: "Media Library",
        href: "/admin/media",
        icon: FolderKanban,
      },
      {
        label: "About Showcase",
        href: "/admin/about-showcase",
        icon: LayoutTemplate,
        badge: "ABOUT",
      },
      {
        label: "Learning Hub",
        href: "/admin/learning",
        icon: BookOpen,
      },
    ],
  },
  {
    group: "CUSTOMERS & MARKETING",
    items: [
      {
        label: "Customer CRM",
        href: "/admin/customers",
        icon: Users,
      },
      {
        label: "B2B Relationships",
        href: "/admin/relationships",
        icon: Handshake,
      },
      {
        label: "Offers & Coupons",
        href: "/admin/offers",
        icon: BadgePercent,
      },
      {
        label: "Rewards & Loyalty",
        href: "/admin/rewards",
        icon: Award,
      },
      {
        label: "WhatsApp Automation",
        href: "/admin/whatsapp",
        icon: MessageCircle,
      },
      {
        label: "Executive Incentives",
        href: "/admin/incentives",
        icon: AwardIcon,
      },
    ],
  },
  {
    group: "FINANCE & ADMINISTRATION",
    items: [
      {
        label: "Business Reports",
        href: "/admin/reports",
        icon: BarChart3,
      },
      {
        label: "Order Profit & Margins",
        href: "/admin/profit",
        icon: Lock,
      },
      {
        label: "Users & Roles",
        href: "/admin/staff",
        icon: UserCog,
      },
      {
        label: "Support Desk",
        href: "/admin/support",
        icon: Headphones,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
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
  if (href.startsWith("/admin/orders")) return "text-[#38BDF8]";
  if (href.startsWith("/admin/payments")) return "text-emerald-400";
  if (href.startsWith("/admin/pos")) return "text-purple-400";
  if (href.startsWith("/admin/quotations")) return "text-pink-400";
  if (href.startsWith("/admin/services")) return "text-teal-400";
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
  return "text-slate-400 group-hover:text-white";
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
  const [filterQuery, setFilterQuery] = useState("");

  // Quick filter across all nav items
  const filteredGroups = useMemo(() => {
    if (!filterQuery.trim()) return NAV_GROUPS;
    const q = filterQuery.toLowerCase();
    return NAV_GROUPS.map((grp) => ({
      ...grp,
      items: grp.items.filter(
        (it) =>
          it.label.toLowerCase().includes(q) ||
          it.href.toLowerCase().includes(q) ||
          grp.group.toLowerCase().includes(q)
      ),
    })).filter((grp) => grp.items.length > 0);
  }, [filterQuery]);

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

      {/* Quick Navigation Filter Input */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="relative flex items-center bg-[#102C66] border border-[#1A3F85] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus-within:border-[#0084FF] focus-within:ring-1 focus-within:ring-[#0084FF]/40 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search tabs / tools..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Grouped List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3 text-xs font-medium [scrollbar-width:thin] [scrollbar-color:#153573_transparent]">
        {/* Overview Dashboard (Persistent Highlight) */}
        {!filterQuery && (
          <div className="pb-2 border-b border-[#153573]/60">
            <Link
              href="/admin/dashboard"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                pathname === "/admin/dashboard" || pathname === "/admin"
                  ? "bg-[#0084FF] text-white shadow-md shadow-[#0084FF]/25 font-black"
                  : "text-slate-300 hover:text-white hover:bg-white/8"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard
                  className={`w-4 h-4 shrink-0 ${
                    pathname === "/admin/dashboard" || pathname === "/admin"
                      ? "text-white"
                      : "text-[#38BDF8]"
                  }`}
                />
                <span>Overview Dashboard</span>
              </div>
            </Link>
          </div>
        )}

        {/* Section Groups */}
        {filteredGroups.map((grp) => (
          <div key={grp.group} className="space-y-0.5">
            <div className="text-[10px] font-black uppercase text-[#60A5FA]/80 tracking-wider px-3 pt-2 pb-1 flex items-center justify-between">
              <span>{grp.group}</span>
              <span className="text-[9px] text-slate-500 font-mono">
                {grp.items.length}
              </span>
            </div>

            <div className="space-y-0.5">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isExact = pathname === item.href;
                const isSubPath =
                  item.href !== "/admin/dashboard" &&
                  item.href !== "/admin" &&
                  !item.href.includes("?") &&
                  pathname?.startsWith(item.href);
                const isActive = isExact || isSubPath;

                const iconColor = getNavIconColor(item.href, isActive);
                const badgeStyle = item.badge
                  ? getBadgeStyle(item.badge, isActive)
                  : "";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                      isActive
                        ? "bg-[#0084FF] text-white shadow-md shadow-[#0084FF]/25 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/8 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${iconColor}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      {item.badge && (
                        <span className={badgeStyle}>{item.badge}</span>
                      )}

                      {item.hasSub && (
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isActive
                              ? "text-white"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Support Card (Fixed at bottom of sidebar) */}
      <div className="p-3 border-t border-[#153573] shrink-0">
        <Link
          href="/admin/support"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#102C66] hover:bg-[#15387E] border border-[#1A3F85] transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#183B7E] flex items-center justify-center text-[#00C2E0] group-hover:text-white transition-colors">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white block truncate leading-tight">
              Need Help?
            </span>
            <span className="text-[10px] text-slate-400 block leading-tight">
              Contact Support Desk
            </span>
          </div>
        </Link>
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
