'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, ShieldCheck, User } from 'lucide-react';
import { AdminSessionUser } from '@/lib/adminAuth';

interface AdminHeaderProps {
  adminUser?: AdminSessionUser | null;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ adminUser, onToggleMobileSidebar }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      
      {/* Left Menu Toggle for Mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
          <span>Prayog Operations Portal</span>
        </div>
      </div>

      {/* Right User & Logout Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
            <User className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              {adminUser?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
              {adminUser?.email || 'admin@prayogindia.com'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
          title="Log out of Admin Desk"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

    </header>
  );
};
