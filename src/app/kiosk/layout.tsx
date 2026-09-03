"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrayogLogo } from "@/components/PrayogLogo";
import { StaffSessionUser } from "@/lib/staffAuth";
import { MapPin, LogOut, Tablet, ShieldCheck } from "lucide-react";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/login-staff");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success && data?.user) {
          setStaff(data.user);
        } else {
          router.replace("/login-staff");
        }
      })
      .catch(() => router.replace("/login-staff"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/staff/auth/logout", { method: "POST" });
      router.replace("/login-staff");
    } catch {
      router.replace("/login-staff");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider text-slate-300">
            Initializing Prayog Store Kiosk...
          </span>
        </div>
      </div>
    );
  }

  const storeCode = staff?.storeCode || "RANCHI";
  const storeName = staff?.storeName || `${storeCode} Store Branch`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      {/* Sleek Modern Light Kiosk Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <PrayogLogo size="sm" showSubtitle={false} />

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline text-slate-500">
              Self-Checkout
            </span>
            <span className="bg-[#00AEEF] text-slate-950 px-2 py-0.5 rounded-lg font-black text-[10px] tracking-wider uppercase">
              {storeCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-[#00AEEF]" />
            <span className="font-semibold text-slate-800">{storeName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
            title="Lock Kiosk Terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Session</span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Kiosk Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500">
        Prayog India Store Kiosk Engine • Strictly Isolated to {storeName} (
        {storeCode})
      </footer>
    </div>
  );
}
