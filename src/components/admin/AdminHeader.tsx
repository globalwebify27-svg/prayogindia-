"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Bell,
  Mail,
  Search,
  LogOut,
  ShieldCheck,
  User,
  AlertTriangle,
  Boxes,
  ArrowRightLeft,
  FileText,
  LifeBuoy,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { AdminSessionUser } from "@/lib/adminAuth";
import { AdminNotificationItem } from "@/app/api/admin/notifications/route";

interface AdminHeaderProps {
  adminUser?: AdminSessionUser | null;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminUser,
  onToggleMobileSidebar,
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.count ?? data.data.length);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/admin/login");
  };

  const getNotifIcon = (type: AdminNotificationItem["type"]) => {
    switch (type) {
      case "LOW_STOCK":
        return <Boxes className="w-4 h-4 text-amber-500 shrink-0" />;
      case "PENDING_TRANSFER":
        return <ArrowRightLeft className="w-4 h-4 text-[#00AEEF] shrink-0" />;
      case "B2B_QUOTATION":
        return <FileText className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "SUPPORT_TICKET":
        return <LifeBuoy className="w-4 h-4 text-purple-500 shrink-0" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />;
    }
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
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              showNotifications
                ? "bg-[#E0F7FC] text-[#00AEEF]"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Operational Alerts"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout Tray */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Flyout Header */}
              <div className="p-3.5 px-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Live Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-extrabold bg-[#00AEEF] text-white px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-[#00AEEF] hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Flyout Items List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {loadingNotifs ? (
                  <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                    Checking operational alerts...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      All Systems Operational
                    </p>
                    <p className="text-[11px] text-slate-400">
                      No unread alerts or pending inventory actions.
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setShowNotifications(false)}
                      className={`p-3.5 px-4 flex items-start gap-3 hover:bg-slate-50 transition-colors block ${
                        item.isRead ? "opacity-60 bg-slate-50/40" : "bg-white"
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100/80">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {item.timeAgo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Flyout Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-slate-600 hover:text-[#00AEEF] transition-colors"
                >
                  View Operations Dashboard →
                </Link>
              </div>
            </div>
          )}
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

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 ml-1"
          title="Sign out of Operations Portal"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
};
