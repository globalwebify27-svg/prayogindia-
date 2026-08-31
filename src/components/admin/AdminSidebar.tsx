'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  Wrench,
  GraduationCap,
  Tag,
  Headset,
  FolderKanban,
  Settings,
  ShieldCheck,
  Tablet,
  FileText,
  Award,
  Truck,
  Megaphone,
  Link2,
  X,
  Building2,
  Layers,
  Lock,
  BarChart3,
  MessageSquare
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_GROUPS = [
  {
    group: 'DASHBOARD',
    items: [
      { label: 'Overview & Analytics', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'CATALOG & PROCUREMENT',
    items: [
      { label: 'Products & Specs', href: '/admin/products', icon: Package },
      { label: 'Bulk Catalogue Editor', href: '/admin/bulk-edit', icon: Layers },
      { label: 'Category Hierarchy', href: '/admin/categories', icon: FolderTree },
      { label: 'Product Relationships', href: '/admin/relationships', icon: Link2 },
      { label: 'Multi-Location Stock', href: '/admin/inventory', icon: Boxes },
      { label: 'Physical Store Branches', href: '/admin/stores', icon: Building2 },
      { label: 'Purchases & Suppliers', href: '/admin/purchases', icon: Truck },
      { label: 'Shipping & Logistics', href: '/admin/logistics', icon: Truck },
    ],
  },
  {
    group: 'SALES, POS & INVOICING',
    items: [
      { label: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Walk-in POS Desk', href: '/admin/pos', icon: Tablet },
      { label: 'Sales Quotations & B2B', href: '/admin/quotations', icon: FileText },
      { label: 'Executive Incentives', href: '/admin/incentives', icon: Award },
      { label: 'Order Profit & Margins', href: '/admin/profit', icon: Lock },
      { label: 'Rewards & Loyalty', href: '/admin/rewards', icon: Award },
      { label: 'Business Reports & Exports', href: '/admin/reports', icon: BarChart3 },
      { label: 'Customer CRM', href: '/admin/customers', icon: Users },
      { label: 'WhatsApp Platform', href: '/admin/whatsapp', icon: MessageSquare },
    ],
  },
  {
    group: 'CMS & CONTENT',
    items: [
      { label: 'Announcements & CMS', href: '/admin/cms', icon: Megaphone },
      { label: 'Institutional Services', href: '/admin/services', icon: Wrench },
      { label: 'Learning Hub & Blog', href: '/admin/learning', icon: GraduationCap },
      { label: 'Offers & Discounts', href: '/admin/offers', icon: Tag },
    ],
  },
  {
    group: 'OPERATIONS & SYSTEM',
    items: [
      { label: 'Support Desk', href: '/admin/support', icon: Headset },
      { label: 'System Audit Logs', href: '/admin/audit', icon: ShieldCheck },
      { label: 'Media Library', href: '/admin/media', icon: FolderKanban },
      { label: 'Settings & Roles', href: '/admin/settings', icon: Settings },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 w-64 select-none border-r border-slate-800">
      
      {/* Admin Panel Header Brand */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00AEEF] text-white flex items-center justify-center font-black text-sm shadow-md">
            P
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide">PRAYOG INDIA</h1>
            <span className="text-[10px] text-[#00AEEF] font-bold uppercase tracking-wider block">Admin Operations</span>
          </div>
        </div>
        {mobileOpen && (
          <button onClick={onCloseMobile} className="lg:hidden text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Grouped List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-5">
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group} className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider px-3 pb-1">
              {grp.group}
            </div>
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#00AEEF] text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Role Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <ShieldCheck className="w-4 h-4 text-[#FFC20E]" />
          <div>
            <span className="text-[11px] font-bold text-slate-200 block">System Administrator</span>
            <span className="text-[9px] text-slate-400 block">Section 8.1 Active</span>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
