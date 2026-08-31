'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  LayoutDashboard
} from 'lucide-react';
import { PrayogLogo } from '@/components/PrayogLogo';
import { StaffSessionUser } from '@/lib/staffAuth';

export default function StoreManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [staff, setStaff] = useState<StaffSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff/auth/me')
      .then(res => {
        if (!res.ok) {
          router.replace('/login-staff');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.success && data?.user) {
          // If a KIOSK_USER somehow reaches here, send them to /kiosk
          if (data.user.role === 'KIOSK_USER') {
            router.replace('/kiosk');
            return;
          }
          setStaff(data.user);
        } else {
          router.replace('/login-staff');
        }
      })
      .catch(() => router.replace('/login-staff'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/staff/auth/logout', { method: 'POST' });
      router.replace('/login-staff');
    } catch {
      router.replace('/login-staff');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider text-slate-300">Loading Store Manager Portal...</span>
        </div>
      </div>
    );
  }

  const storeCode = staff?.storeCode || (staff?.role === 'SUPER_ADMIN' ? 'ALL STORES' : 'STORE');
  const storeName = staff?.storeName || (staff?.role === 'SUPER_ADMIN' ? 'All Branches (Super Admin)' : `${storeCode} Branch`);

  const navItems = [
    { label: 'Store Overview', href: '/store/dashboard', icon: LayoutDashboard },
    { label: 'Branch Orders', href: '/store/orders', icon: ShoppingBag },
    { label: 'Local Inventory', href: '/store/inventory', icon: Boxes },
    { label: 'Store Devices', href: '/store/devices', icon: Tablet },
    { label: 'POS Terminal', href: '/store-pos', icon: Store, external: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <PrayogLogo size="sm" showSubtitle={false} />
          
          <div className="hidden sm:flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 px-3 py-1 rounded-full text-xs font-bold text-[#00AEEF]">
            <MapPin className="w-3.5 h-3.5 text-[#FFC20E]" />
            <span>{storeName}</span>
            <span className="bg-[#00AEEF] text-slate-950 px-1.5 py-0.2 rounded font-black text-[10px]">
              {storeCode}
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {staff?.role === 'SUPER_ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Back to Admin
            </Link>
          )}

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight">{staff?.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">@{staff?.username} • {staff?.role}</div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 p-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Nav */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-20 w-64 bg-slate-900/95 md:bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between
          transform transition-transform duration-200 ease-in-out md:translate-x-0
          ${mobileNavOpen ? 'translate-x-0 mt-14' : '-translate-x-full md:mt-0'}
        `}>
          <div className="space-y-6">
            {/* Store Badge in Sidebar */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Assigned Store Scope
              </div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#00AEEF]" /> {storeCode}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                All data is strictly scoped to this store ID.
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 py-1">
                Branch Operations
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href === '/store/dashboard' && pathname === '/store');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#00AEEF] text-slate-950 shadow-md shadow-[#00AEEF]/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3 h-3 ${active ? 'opacity-100' : 'opacity-30'}`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Security Note */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] text-slate-500">
            <span className="font-bold text-slate-400">Prayog Security:</span> Access to other store data is strictly blocked server-side (403 Forbidden).
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
