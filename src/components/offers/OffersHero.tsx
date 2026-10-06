"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Flame,
  Zap,
  Ticket,
  Package,
  ShieldCheck,
  Truck,
  FileCheck,
  Clock,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

interface OffersHeroProps {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
}

export const OffersHero: React.FC<OffersHeroProps> = ({
  onSelectCategory,
  activeCategory = "all",
}) => {
  // Live ticking countdown for the global flash deal header
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#041a2e] border border-slate-800 text-white shadow-2xl">
      {/* Background Decorative Mesh & Glow Gradients */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#00AEEF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-[#FFC20E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#00AEEF_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-12 pt-8 pb-10 sm:py-12 space-y-8">
        {/* Top Badges & Live Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-amber-500/20 text-[#FFC20E] border border-amber-500/30 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-inner">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <Flame className="w-3.5 h-3.5 text-red-400" />
              Festival Deals Live
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 backdrop-blur-md text-slate-300 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 text-[#00AEEF]" /> Official Prayog Promotions
            </span>
          </div>

          {/* Live Flash Timer Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-2xl shadow-md">
            <Clock className="w-4 h-4 text-[#00AEEF]" />
            <span className="text-[11px] text-slate-300 font-semibold">Flash Sale Ends:</span>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-[#FFC20E]">
              <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                {String(timeLeft.hours).padStart(2, "0")}h
              </span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-red-400">
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>
        </div>

        {/* Hero Title & Value Intro */}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Deals, Vouchers &amp;{" "}
            <span className="bg-gradient-to-r from-[#00AEEF] via-[#38BDF8] to-[#FFC20E] bg-clip-text text-transparent">
              Exclusive Maker Discounts
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Equip your robotics lab, drone workshop, and electronics bench with verified hardware discounts.
            Save up to 40% on microcontrollers, autopilot flight controllers, STEM kits, and bundle vouchers.
          </p>
        </div>

        {/* Action Quick Jumps */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => scrollToSection("coupon-vault")}
            className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#00AEEF]/25 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-[#FFC20E]" />
            <span>Claim Checkout Vouchers</span>
          </button>

          <button
            onClick={() => scrollToSection("combo-bundles")}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Package className="w-4 h-4 text-[#00AEEF]" />
            <span>Combo Bundles (Save &gt; ₹1,000)</span>
          </button>

          <button
            onClick={() => scrollToSection("deal-products")}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Browse Deal Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>

        {/* Value Trust Points Strip */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00AEEF]/10 border border-[#00AEEF]/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#00AEEF]" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Instant Discounts</div>
              <div className="text-[11px] text-slate-400">1-Click Auto Apply</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Free Shipping</div>
              <div className="text-[11px] text-slate-400">Orders above ₹999</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">100% Genuine</div>
              <div className="text-[11px] text-slate-400">Official Prayog Warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">GST Input Credit</div>
              <div className="text-[11px] text-slate-400">18% B2B Tax Invoice</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
