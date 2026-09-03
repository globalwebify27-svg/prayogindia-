"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, Tablet, ShieldCheck } from "lucide-react";
import { PrayogLogo } from "@/components/PrayogLogo";
import { STORES, StoreId } from "@/data/storeConfig";

function BranchDeviceLoginForm() {
  const router = useRouter();
  const params = useParams();
  const branchParam = (
    (params?.branch as string) || "ranchi"
  ).toLowerCase() as StoreId;
  const store = STORES[branchParam] || {
    id: branchParam,
    name: `${branchParam.toUpperCase()} Experience Store`,
    city: branchParam.toUpperCase(),
  };

  const [username, setUsername] = useState(`${branchParam}_kiosk`);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/staff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid device username or password.");
        setLoading(false);
        return;
      }

      // Check if logged in user is authorized for this store
      if (
        data.user?.role !== "SUPER_ADMIN" &&
        data.user?.storeCode?.toLowerCase() !== branchParam
      ) {
        setError(
          `This tablet credential belongs to ${data.user?.storeCode || "another store"}, not ${branchParam.toUpperCase()}.`,
        );
        setLoading(false);
        return;
      }

      // Redirect directly to the branch walk-in kiosk experience
      router.push(`/walk-in/${branchParam}`);
    } catch {
      setError("Network error while authenticating kiosk tablet.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071920] flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#F26522] selection:text-white relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00AEEF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#F26522]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Column: Brand & Kiosk Identity */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-4 py-6 md:py-12">
            <div className="scale-110 sm:scale-125 lg:scale-135 transition-transform">
              <PrayogLogo size="lg" showSubtitle={true} dark={true} />
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400 mt-4 shadow-md">
              <Tablet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase tracking-wider">
                {store.name} — Walk-in Tablet
              </span>
            </div>
          </div>

          {/* Center Divider */}
          <div className="hidden md:flex md:col-span-1 justify-center items-center h-full">
            <div className="w-[1px] h-80 bg-slate-600/40" />
          </div>

          {/* Right Column: Welcome & Kiosk Form */}
          <div className="md:col-span-6 flex flex-col items-center md:items-start w-full max-w-md mx-auto md:mx-0">
            <div className="w-full text-center md:text-left mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-wide">
                Welcome
              </h1>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-300 mt-2.5">
                PLEASE ACTIVATE {branchParam.toUpperCase()} KIOSK TABLET.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="w-full mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="KIOSK / TABLET USERNAME"
                  className="w-full bg-white text-slate-900 px-4 py-3.5 rounded-lg text-xs font-semibold placeholder:text-slate-400 placeholder:font-bold placeholder:tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#F26522] shadow-sm transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="DEVICE PASSWORD"
                  className="w-full bg-white text-slate-900 px-4 py-3.5 rounded-lg text-xs font-semibold placeholder:text-slate-400 placeholder:font-bold placeholder:tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#F26522] shadow-sm transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F26522] hover:bg-[#D94F12] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-lg shadow-[#F26522]/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>INITIALIZING KIOSK MODE...</span>
                    </div>
                  ) : (
                    <span>
                      LAUNCH {branchParam.toUpperCase()} SHOPPING KIOSK
                    </span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400">
                <span>
                  Passcode created by {branchParam.toUpperCase()} Store Manager
                  in Fleet Settings
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BranchDevicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071920] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400">
              Connecting Tablet...
            </span>
          </div>
        </div>
      }
    >
      <BranchDeviceLoginForm />
    </Suspense>
  );
}
