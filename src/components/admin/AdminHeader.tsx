"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Mail,
  Search,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { AdminSessionUser } from "@/lib/adminAuth";

interface AdminHeaderProps {
  adminUser?: AdminSessionUser | null;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminUser,
  onToggleMobileSidebar,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleMobileSidebar}
          className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer mr-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-slate-800">
          Prayog Operations Portal
        </span>
      </div>

      {/* Center Search Bar with ⌘K */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 transition-all shadow-2xs"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Notifications, Mail & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative cursor-pointer p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
            12
          </span>
        </div>

        {/* Mail Icon */}
        <div className="cursor-pointer p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <Mail className="w-5 h-5" />
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#00AEEF] border border-blue-200 flex items-center justify-center text-xs font-black shrink-0">
            <User className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              {adminUser?.name || "System Administrator"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block leading-tight">
              {adminUser?.email || "admin@prayogindia.com"}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
