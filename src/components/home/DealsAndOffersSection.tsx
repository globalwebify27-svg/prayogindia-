"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Gift,
  Copy,
  Check,
  Zap,
  Tag,
  Clock,
  Truck,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

interface Props {
  onShopDeals?: () => void;
}

export const DealsAndOffersSection: React.FC<Props> = ({ onShopDeals }) => {
  // Live ticking countdown state (starts at 14h 32m 45s)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const handleCopyCode = (code: string) => {
    haptic.selection();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleClaim = () => {
    haptic.medium();
    onShopDeals?.();
  };

  return (
    <section className="pt-8 pb-4 sm:pt-10 sm:pb-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#FF3B30]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
              <span>Limited Time</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Deals &amp; Offers
            </h2>
          </div>

          <button
            onClick={handleClaim}
            className="text-xs sm:text-sm font-semibold text-[#00AEEF] hover:text-[#0096D6] flex items-center gap-1.5 group cursor-pointer transition-colors"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3-Column Deal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Deal Card 1: Flash Sale */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-white border border-red-100 hover:border-red-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            {/* Card Header Media & Live Timer */}
            <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
              <Image
                src="/images/ecosystem/uavs-and-drones.jpg"
                alt="STEM Robotics & UAV Deals"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                <span className="bg-[#FF3B30] text-white text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Zap className="w-3 h-3 fill-white" /> 35% OFF
                </span>
                <span className="bg-black/60 backdrop-blur-md text-[#FFC20E] text-[11px] font-mono font-medium px-2 py-0.5 rounded-lg border border-white/15">
                  Ends {String(timeLeft.hours).padStart(2, "0")}h{" "}
                  {String(timeLeft.minutes).padStart(2, "0")}m{" "}
                  {String(timeLeft.seconds).padStart(2, "0")}s
                </span>
              </div>

              {/* Title on Image */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <h3 className="text-lg font-bold text-white leading-tight">
                  STEM Robotics &amp; UAV Bundles
                </h3>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Save up to ₹2,500 on flight controllers, robot arm kits, and
                high-torque servos.
              </p>

              {/* Voucher Copy Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-slate-500">
                  Coupon:
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode("PRAYOG35")}
                  className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-red-200 text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  <span>PRAYOG35</span>
                  {copiedCode === "PRAYOG35" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Action CTA */}
              <button
                onClick={handleClaim}
                className="w-full bg-slate-900 hover:bg-[#FF3B30] text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Claim Deal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Deal Card 2: Welcome Offer */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-white border border-sky-100 hover:border-[#00AEEF]/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            {/* Card Header Media */}
            <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
              <Image
                src="/images/pi_hero.jpg"
                alt="Microcontrollers and Dev Boards"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                <span className="bg-[#00AEEF] text-white text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Gift className="w-3 h-3" /> FIRST ORDER 10% OFF
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium px-2 py-0.5 rounded-lg border border-white/15">
                  New Makers
                </span>
              </div>

              {/* Title on Image */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Arduino &amp; Raspberry Pi Kits
                </h3>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Instant 10% discount on UNO boards, Raspberry Pi, and wireless
                IoT sensor modules.
              </p>

              {/* Voucher Copy Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-slate-500">
                  Coupon:
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode("NEWMAKER10")}
                  className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-[#00AEEF] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-sky-200 text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  <span>NEWMAKER10</span>
                  {copiedCode === "NEWMAKER10" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Action CTA */}
              <button
                onClick={handleClaim}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#00AEEF]/20"
              >
                <span>Claim Discount</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Deal Card 3: Free Express Delivery */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            {/* Card Header Media */}
            <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
              <Image
                src="/images/explore_products_banner.png"
                alt="Pan India Fast Logistics Dispatch"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                <span className="bg-emerald-600 text-white text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Truck className="w-3 h-3" /> FREE SHIPPING &gt; ₹999
                </span>
                <span className="bg-black/60 backdrop-blur-md text-emerald-400 text-[11px] font-medium px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>

              {/* Title on Image */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Pan-India Express Delivery
                </h3>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Free shipping on orders above ₹999 with fast 24-48h dispatch
                from regional hubs.
              </p>

              {/* Voucher Copy Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-slate-500">Perk:</div>
                <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs font-semibold">
                  <span>Auto-Applied at ₹999</span>
                </div>
              </div>

              {/* Action CTA */}
              <button
                onClick={handleClaim}
                className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Shop Eligible Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
