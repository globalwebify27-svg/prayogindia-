"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface Props {
  onShopDeals?: () => void;
}

export const DealsAndOffersSection: React.FC<Props> = ({ onShopDeals }) => {
  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF3B30]">
              Limited Time Deals
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Deals & Offers
            </h2>
          </div>

          <button
            onClick={onShopDeals}
            className="text-xs sm:text-sm font-extrabold text-[#FF3B30] hover:underline flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Deals</span>{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Big Offer Banner & Deal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Main Big Promotional Banner (Span 8) */}
          <div className="lg:col-span-8 bg-gradient-to-br from-[#0A1128] via-[#0F172A] to-[#1E56A0] text-white rounded-3xl p-5 sm:p-7 lg:p-8 relative overflow-hidden border border-slate-700/60 shadow-xl flex flex-col justify-between min-h-[260px] sm:min-h-[300px]">
            {/* Top Badges & Countdown UI */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 z-10">
              <span className="bg-[#FF3B30] text-white text-[11px] sm:text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> FLASH DEALS 35% OFF
              </span>

              {/* Countdown UI */}
              <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/15">
                <span className="text-slate-300 text-[11px]">Ends in:</span>
                <span className="bg-[#FFC20E] text-slate-950 font-mono font-black px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
                  14h
                </span>
                <span>:</span>
                <span className="bg-[#FFC20E] text-slate-950 font-mono font-black px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
                  32m
                </span>
                <span>:</span>
                <span className="bg-[#FFC20E] text-slate-950 font-mono font-black px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
                  45s
                </span>
              </div>
            </div>

            {/* Banner Content */}
            <div className="space-y-2 sm:space-y-3 z-10 my-3 sm:my-4">
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-black leading-tight text-white">
                STEM Robotics & UAV Lab Bundles
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
                Get up to ₹2,500 Instant Discount on bulk robotics lab kits,
                Raspberry Pi 5 bundles & Pixhawk flight controllers.
              </p>
            </div>

            {/* CTA & Code */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 z-10">
              <button
                onClick={onShopDeals}
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Claim Offer</span>
                <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
              </button>

              <div className="text-[11px] sm:text-xs text-slate-300">
                Use Code:{" "}
                <code className="bg-slate-950 text-[#FFC20E] font-mono font-black px-2 py-0.5 sm:py-1 rounded border border-[#FFC20E]/40">
                  PRAYOG10
                </code>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#00AEEF]/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Right 2 Side Promo Cards: 2-column grid on tablet, 1-col on mobile & desktop */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
            {/* Card 1: First Order Discount */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-1.5 relative overflow-hidden flex flex-col justify-center"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF] bg-[#E0F7FC] px-2.5 py-0.5 rounded-full inline-block self-start">
                First Order Discount
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                Flat 10% Off For New Makers
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sign up and get instant discount on your first order of microcontrollers.
              </p>
            </motion.div>

            {/* Card 2: Free Dispatch */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#E0F7FC]/30 border border-[#00AEEF]/25 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-1.5 relative overflow-hidden flex flex-col justify-center"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-[#00AEEF]">
                <ShieldCheck className="w-4 h-4 text-[#FFC20E]" /> Pan-India Fast Dispatch
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                Free Express Shipping on Orders &gt; ₹999
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Guaranteed 100% genuine components with official GST compliance.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
