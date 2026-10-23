"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Truck,
  Headphones,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

interface CategoriesHeaderProps {
  title?: string;
  description?: string;
  onBrowseAll?: () => void;
}

export const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  title = "Explore Categories",
  onBrowseAll,
}) => {
  return (
    <div className="category-header font-inter relative overflow-hidden rounded-2xl border border-sky-100/90 shadow-xs bg-gradient-to-br from-[#EBF5FC] via-[#F3F8FD] to-[#E6F2FA] flex flex-col justify-between">
      {/* 1. Full Panoramic / Right-Aligned Robotics Banner Image */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none select-none overflow-hidden">
        <Image
          src="/categories-hero-banner.webp"
          alt="Prayog India Robotics, Arduino & Electronics Marketplace"
          fill
          priority
          quality={100}
          unoptimized
          className="object-cover sm:object-contain object-right opacity-35 sm:opacity-90 transition-opacity"
        />
        {/* Scrim gradient so text is always 100% crisp and readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#EBF5FC] via-[#EBF5FC]/85 sm:via-[#EBF5FC]/60 to-transparent" />
      </div>

      {/* 2. Top Content Area */}
      <div className="relative z-10 p-3.5 sm:p-5 lg:px-6 lg:py-5 max-w-xl space-y-2">
        {/* Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>

        {/* Action CTA Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={() => {
              if (onBrowseAll) {
                onBrowseAll();
              } else {
                const el = document.getElementById("browse-categories-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs shadow-sm shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Browse Categories</span>
          </button>

          <Link
            href="/offers"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors px-1 py-1"
          >
            <span>Best Sellers</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Integrated Trust Badges Footer Strip */}
      <div className="relative z-10 border-t border-sky-100/80 bg-white/80 backdrop-blur-md px-3 sm:px-5 py-2">
        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          {/* 1. Trusted Products */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-md bg-sky-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
              Trusted Products
            </span>
          </div>

          <span className="hidden sm:inline text-sky-200">|</span>

          {/* 2. Genuine Brands */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
              Genuine Brands
            </span>
          </div>

          <span className="hidden sm:inline text-sky-200">|</span>

          {/* 3. Fast & Safe Delivery */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
              Fast Delivery
            </span>
          </div>

          <span className="hidden sm:inline text-sky-200">|</span>

          {/* 4. Expert Support */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Headphones className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
              Expert Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
