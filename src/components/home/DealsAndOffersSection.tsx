"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Gift,
  Copy,
  Check,
  Clock,
  Truck,
  Cpu,
  Tag,
  Layers,
  Flame,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

// Drone SVG Icon matching the reference image
const DroneIcon = ({ className = "w-6 h-6 text-white" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="m4.93 4.93 4.24 4.24" />
    <path d="m14.83 14.83 4.24 4.24" />
    <path d="m14.83 9.17 4.24-4.24" />
    <path d="m4.93 19.07 4.24-4.24" />
    <circle cx="4" cy="4" r="2" />
    <circle cx="20" cy="4" r="2" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" />
  </svg>
);

interface Props {
  onShopDeals?: () => void;
}

export const DealsAndOffersSection: React.FC<Props> = ({ onShopDeals }) => {
  // Live ticking countdown state (starts at 14h 30m 53s)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 30,
    seconds: 53,
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
    haptic?.selection?.();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleClaim = () => {
    haptic?.medium?.();
    onShopDeals?.();
  };

  return (
    <section className="py-6 sm:py-10 bg-white">
      {/* Full width container matching page grid */}
      <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-5 sm:space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Deals
            </h2>
            <div className="w-8 h-1 bg-[#FFC20E] rounded-full mt-1" />
          </div>

          <button
            onClick={handleClaim}
            className="text-xs sm:text-sm font-semibold text-[#005CA9] hover:text-[#004885] flex items-center gap-1.5 group cursor-pointer transition-colors"
          >
            <span>View All Top Deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4-Column Themed Deal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 xl:gap-6 items-stretch">
          {/* ══════════════ CARD 1: CRIMSON THEME (STEM Robotics & UAVs) ══════════════ */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-[24px] bg-white border border-rose-200/80 hover:border-red-400 shadow-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            {/* Image Section */}
            <div className="relative h-50 sm:h-54 w-full overflow-hidden bg-slate-950">
              <Image
                src="/images/ecosystem/uavs-and-drones.jpg"
                alt="STEM Robotics & UAV Deals"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-black/30" />

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wide">
                  <Tag className="w-3 h-3 fill-white rotate-90" />
                  35% OFF
                </span>
                <span className="inline-flex items-center gap-1 bg-black/65 backdrop-blur-md text-[#FFC20E] text-[10px] font-mono font-bold px-2 py-1 rounded-full border border-white/15 shadow-sm">
                  <Clock className="w-3 h-3 text-[#FFC20E]" />
                  Ends in {String(timeLeft.hours).padStart(2, "0")}h:
                  {String(timeLeft.minutes).padStart(2, "0")}m
                </span>
              </div>

              {/* Bottom Right Crimson Wave with Drone Icon */}
              <div className="absolute bottom-0 right-0 z-10 w-20 h-16 bg-gradient-to-tl from-red-600 via-rose-600 to-transparent pl-5 pt-4 rounded-tl-[32px] flex items-center justify-center">
                <DroneIcon className="w-5 h-5 text-white drop-shadow-sm opacity-95 group-hover:scale-110 transition-transform" />
              </div>

              {/* Overlaid Title & Subtitle */}
              <div className="absolute bottom-3 left-3.5 right-16 z-10">
                <h3 className="text-base font-bold text-white tracking-tight leading-snug drop-shadow-sm line-clamp-1">
                  STEM Robotics &amp; UAVs
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug line-clamp-2 opacity-95">
                  Save up to ₹2,500 on drone kits, robot arms, and flight boards.
                </p>
              </div>
            </div>

            {/* Themed Pastel Footer */}
            <div className="p-3 bg-gradient-to-b from-rose-50/70 via-white to-red-50/30 border-t border-rose-100/90 flex items-center justify-between gap-1.5">
              {/* Left: Themed Coupon Button */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyCode("PRAYOG35")}
                  className="inline-flex items-center gap-1 bg-white hover:bg-rose-50/80 text-rose-950 px-2 py-1 rounded-lg border border-rose-300 text-[11px] font-mono font-bold transition-all cursor-pointer shadow-2xs hover:border-red-400"
                  title="Click to copy coupon code"
                >
                  <span className="text-[10px] font-sans font-bold text-rose-500">Code:</span>
                  <span>PRAYOG35</span>
                  {copiedCode === "PRAYOG35" ? (
                    <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3 h-3 text-rose-400" />
                  )}
                </button>
              </div>

              {/* Center: Highlight Metric */}
              <div className="border-l border-rose-200 pl-2 pr-1 flex flex-col justify-center shrink-0">
                <span className="text-[9px] text-rose-600 font-semibold leading-none">
                  Save up to
                </span>
                <span className="text-xs sm:text-sm font-black text-rose-700 leading-tight">
                  ₹2,500
                </span>
              </div>

              {/* Right: Vibrant Gradient CTA */}
              <button
                onClick={handleClaim}
                className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-red-500/20 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <span>CLAIM DEAL</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

          {/* ══════════════ CARD 2: ROYAL BLUE THEME (Arduino & Pi Kits) ══════════════ */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-[24px] bg-white border border-blue-200/80 hover:border-blue-400 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            {/* Image Section */}
            <div className="relative h-50 sm:h-54 w-full overflow-hidden bg-slate-950">
              <Image
                src="/images/pi_hero.jpg"
                alt="Microcontrollers and Dev Boards"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-black/30" />

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#005CA9] to-[#0078D7] text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wide">
                  <Gift className="w-3 h-3" />
                  10% OFF
                </span>
                <span className="inline-flex items-center gap-1 bg-black/65 backdrop-blur-md text-sky-200 text-[10px] font-medium px-2 py-1 rounded-full border border-white/15 shadow-sm">
                  New Makers
                </span>
              </div>

              {/* Bottom Right Blue Wave with CPU Icon */}
              <div className="absolute bottom-0 right-0 z-10 w-20 h-16 bg-gradient-to-tl from-[#005CA9] via-[#00AEEF] to-transparent pl-5 pt-4 rounded-tl-[32px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white drop-shadow-sm opacity-95 group-hover:scale-110 transition-transform" />
              </div>

              {/* Overlaid Title & Subtitle */}
              <div className="absolute bottom-3 left-3.5 right-16 z-10">
                <h3 className="text-base font-bold text-white tracking-tight leading-snug drop-shadow-sm line-clamp-1">
                  Arduino &amp; Pi Kits
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug line-clamp-2 opacity-95">
                  Instant 10% discount on UNO boards, Pi 5, and IoT sensors.
                </p>
              </div>
            </div>

            {/* Themed Pastel Footer */}
            <div className="p-3 bg-gradient-to-b from-blue-50/70 via-white to-sky-50/30 border-t border-blue-100/90 flex items-center justify-between gap-1.5">
              {/* Left: Themed Coupon Button */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyCode("NEWMAKER10")}
                  className="inline-flex items-center gap-1 bg-white hover:bg-blue-50/80 text-blue-950 px-2 py-1 rounded-lg border border-blue-300 text-[11px] font-mono font-bold transition-all cursor-pointer shadow-2xs hover:border-blue-400"
                  title="Click to copy coupon code"
                >
                  <span className="text-[10px] font-sans font-bold text-blue-500">Code:</span>
                  <span>NEWMAKER10</span>
                  {copiedCode === "NEWMAKER10" ? (
                    <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3 h-3 text-blue-400" />
                  )}
                </button>
              </div>

              {/* Center: Highlight Metric */}
              <div className="border-l border-blue-200 pl-2 pr-1 flex flex-col justify-center shrink-0">
                <span className="text-[9px] text-blue-600 font-semibold leading-none">
                  Instant
                </span>
                <span className="text-xs sm:text-sm font-black text-[#005CA9] leading-tight">
                  10% FLAT
                </span>
              </div>

              {/* Right: Vibrant Gradient CTA */}
              <button
                onClick={handleClaim}
                className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-[#005CA9] to-[#0078D7] hover:from-[#004885] hover:to-[#005CA9] text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <span>CLAIM DEAL</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

          {/* ══════════════ CARD 3: AMBER/ORANGE THEME (3D Printers & Prototyping) ══════════════ */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-[24px] bg-white border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            {/* Image Section */}
            <div className="relative h-50 sm:h-54 w-full overflow-hidden bg-slate-950">
              <Image
                src="/images/categories/3d_printing.jpg"
                alt="3D Printers and Filaments"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-black/30" />

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wide">
                  <Flame className="w-3 h-3 fill-white" />
                  ₹500 OFF
                </span>
                <span className="inline-flex items-center gap-1 bg-black/65 backdrop-blur-md text-amber-200 text-[10px] font-medium px-2 py-1 rounded-full border border-white/15 shadow-sm">
                  Prototyping
                </span>
              </div>

              {/* Bottom Right Amber Wave with Layers Icon */}
              <div className="absolute bottom-0 right-0 z-10 w-20 h-16 bg-gradient-to-tl from-amber-600 via-orange-500 to-transparent pl-5 pt-4 rounded-tl-[32px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-white drop-shadow-sm opacity-95 group-hover:scale-110 transition-transform" />
              </div>

              {/* Overlaid Title & Subtitle */}
              <div className="absolute bottom-3 left-3.5 right-16 z-10">
                <h3 className="text-base font-bold text-white tracking-tight leading-snug drop-shadow-sm line-clamp-1">
                  3D Printers &amp; Spares
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug line-clamp-2 opacity-95">
                  Save ₹500 on Ender 3D printers, PLA spools, and nozzles.
                </p>
              </div>
            </div>

            {/* Themed Pastel Footer */}
            <div className="p-3 bg-gradient-to-b from-amber-50/70 via-white to-orange-50/30 border-t border-amber-100/90 flex items-center justify-between gap-1.5">
              {/* Left: Themed Coupon Button */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyCode("PRINT500")}
                  className="inline-flex items-center gap-1 bg-white hover:bg-amber-50/80 text-amber-950 px-2 py-1 rounded-lg border border-amber-300 text-[11px] font-mono font-bold transition-all cursor-pointer shadow-2xs hover:border-amber-400"
                  title="Click to copy coupon code"
                >
                  <span className="text-[10px] font-sans font-bold text-amber-600">Code:</span>
                  <span>PRINT500</span>
                  {copiedCode === "PRINT500" ? (
                    <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3 h-3 text-amber-500" />
                  )}
                </button>
              </div>

              {/* Center: Highlight Metric */}
              <div className="border-l border-amber-200 pl-2 pr-1 flex flex-col justify-center shrink-0">
                <span className="text-[9px] text-amber-700 font-semibold leading-none">
                  Flat Save
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-600 leading-tight">
                  ₹500 OFF
                </span>
              </div>

              {/* Right: Vibrant Gradient CTA */}
              <button
                onClick={handleClaim}
                className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <span>CLAIM DEAL</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>

          {/* ══════════════ CARD 4: EMERALD LOGISTICS THEME (Pan-India Express) ══════════════ */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-[24px] bg-white border border-emerald-200/80 hover:border-emerald-400 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            {/* Image Section */}
            <div className="relative h-50 sm:h-54 w-full overflow-hidden bg-slate-950">
              <Image
                src="/images/explore_products_banner.png"
                alt="Pan India Fast Logistics Dispatch"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-black/30" />

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wide">
                  <Truck className="w-3 h-3" />
                  FREE SHIPPING
                </span>
                <span className="inline-flex items-center gap-1 bg-black/65 backdrop-blur-md text-emerald-200 text-[10px] font-medium px-2 py-1 rounded-full border border-white/15 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                </span>
              </div>

              {/* Bottom Right Emerald Wave with Truck Icon */}
              <div className="absolute bottom-0 right-0 z-10 w-20 h-16 bg-gradient-to-tl from-emerald-600 via-teal-500 to-transparent pl-5 pt-4 rounded-tl-[32px] flex items-center justify-center">
                <Truck className="w-5 h-5 text-white drop-shadow-sm opacity-95 group-hover:scale-110 transition-transform" />
              </div>

              {/* Overlaid Title & Subtitle */}
              <div className="absolute bottom-3 left-3.5 right-16 z-10">
                <h3 className="text-base font-bold text-white tracking-tight leading-snug drop-shadow-sm line-clamp-1">
                  Pan-India Express
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug line-clamp-2 opacity-95">
                  Free express shipping on all orders above ₹999 across India.
                </p>
              </div>
            </div>

            {/* Themed Pastel Footer */}
            <div className="p-3 bg-gradient-to-b from-emerald-50/70 via-white to-teal-50/30 border-t border-emerald-100/90 flex items-center justify-between gap-1.5">
              {/* Left: Themed Auto-Applied Perk Badge */}
              <div className="flex items-center shrink-0">
                <div className="inline-flex items-center gap-1 bg-white text-emerald-800 px-2 py-1 rounded-lg border border-emerald-300 text-[11px] font-mono font-bold shadow-2xs">
                  <span className="text-[10px] font-sans text-emerald-600 font-bold">Perk:</span>
                  <span>Auto-Applied</span>
                </div>
              </div>

              {/* Center: Highlight Metric */}
              <div className="border-l border-emerald-200 pl-2 pr-1 flex flex-col justify-center shrink-0">
                <span className="text-[9px] text-emerald-600 font-semibold leading-none">
                  Orders over
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-700 leading-tight">
                  ₹999
                </span>
              </div>

              {/* Right: Vibrant Gradient CTA */}
              <button
                onClick={handleClaim}
                className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
