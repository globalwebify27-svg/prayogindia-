"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSessionUser } from "@/lib/adminAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Verify Admin Authentication Server-Side
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success && data?.user) {
          setAdminUser(data.user);
        } else if (!isLoginPage) {
          router.push("/admin/login");
        }
      })
      .catch(() => {
        if (!isLoginPage) router.push("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [pathname, isLoginPage, router]);

  // If viewing login screen, bypass admin layout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider text-slate-300">
            Loading Prayog Admin Desk...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex font-sans">
      {/* Isolated Persistent Admin Sidebar (Locked in place, never scrolls with the page) */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Operational Container (Only this section scrolls) */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0 bg-[#F8FAFC]">
        <AdminHeader
          adminUser={adminUser}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
