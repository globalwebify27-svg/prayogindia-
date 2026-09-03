"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Store,
  Tablet,
  Shield,
  Wifi,
} from "lucide-react";
import { STORES, ALL_STORE_IDS } from "@/data/storeConfig";

const STORE_GRADIENTS: Record<string, string> = {
  ranchi: "from-sky-600 to-cyan-500",
  patna: "from-violet-600 to-purple-500",
  delhi: "from-emerald-600 to-teal-500",
  mumbai: "from-orange-600 to-amber-500",
};

const STORE_BG: Record<string, string> = {
  ranchi: "from-sky-50 to-cyan-50 border-sky-200",
  patna: "from-violet-50 to-purple-50 border-violet-200",
  delhi: "from-emerald-50 to-teal-50 border-emerald-200",
  mumbai: "from-orange-50 to-amber-50 border-orange-200",
};

export default function WalkInGatewayPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00AEEF] flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#00AEEF]/30">
            P
          </div>
          <div>
            <div className="text-white font-black text-sm tracking-wide">
              PRAYOG INDIA
            </div>
            <div className="text-[#00AEEF] text-[10px] font-bold uppercase tracking-widest">
              In-Store Shopping
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            3 Stores Live
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center pt-12 pb-8 px-6">
        <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 border border-[#00AEEF]/30 px-4 py-1.5 rounded-full mb-5">
          <Store className="w-3.5 h-3.5 text-[#00AEEF]" />
          <span className="text-[#00AEEF] text-xs font-bold uppercase tracking-widest">
            Walk-in Store Kiosk
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">
          Welcome to
          <br />
          <span className="text-[#00AEEF]">Prayog India</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto font-medium">
          Select your store below to browse products, add to cart, and place
          your order — our staff will assist you at the counter.
        </p>
      </div>

      {/* Store Cards */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 px-6 sm:px-10 pb-12 max-w-5xl mx-auto w-full">
        {ALL_STORE_IDS.map((storeId) => {
          const store = STORES[storeId];
          const gradient = STORE_GRADIENTS[storeId];
          const bg = STORE_BG[storeId];
          return (
            <Link
              key={storeId}
              href={`/walk-in/${storeId}`}
              className="group relative bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden hover:border-slate-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Gradient Banner */}
              <div
                className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 50%, white 0%, transparent 70%)",
                  }}
                />
                <Store className="w-12 h-12 text-white/90 drop-shadow-lg" />
                <div className="absolute top-3 right-3 bg-white/20 border border-white/30 px-2 py-0.5 rounded-full">
                  <span className="text-[10px] font-black text-white uppercase">
                    Open
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {store.city}
                  </div>
                  <h2 className="text-base font-black text-white leading-tight group-hover:text-[#00AEEF] transition-colors">
                    {store.shortName}
                  </h2>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                    <span className="leading-snug">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{store.timings}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Browse Products", "Add to Cart", "Pay Here"].map((f) => (
                    <span
                      key={f}
                      className="bg-slate-700/80 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-3">
                  <div
                    className={`w-full bg-gradient-to-r ${gradient} text-white py-3 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg group-hover:scale-[1.02] transition-transform`}
                  >
                    <Tablet className="w-4 h-4" />
                    <span>Enter Store Kiosk</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>
            Secure in-store shopping terminal — Authorized Prayog India Retail
            System
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-500 font-bold">
            Connected to Store Network
          </span>
        </div>
      </div>
    </div>
  );
}
