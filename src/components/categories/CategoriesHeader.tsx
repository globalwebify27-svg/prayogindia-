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
  description = "Find the right robotics, electronics, STEM, IoT and technology products to build your next big idea.",
  onBrowseAll,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100/90 shadow-2xs min-h-[190px] sm:min-h-[210px] lg:min-h-[225px] flex items-center bg-[#EBF5FC]">
      {/* 1. Full Panoramic Background Banner Image */}
      <Image
        src="/categories-hero-banner.webp"
        alt="Prayog India Robotics, Arduino & Electronics Marketplace"
        fill
        priority
        quality={100}
        unoptimized
        className="object-cover object-right select-none pointer-events-none"
      />

      {/* 2. Soft Gradient Scrim for perfect mobile & tablet readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#EBF5FC]/95 via-[#EBF5FC]/80 sm:via-[#EBF5FC]/60 to-transparent pointer-events-none lg:w-3/5" />

      {/* 3. Left Content Overlay */}
      <div className="relative z-10 p-4 sm:p-5 lg:px-7 lg:py-4 max-w-2xl space-y-2.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#00AEEF] bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full inline-block shadow-2xs border border-sky-100/80">
          PRAYOG INDIA MARKETPLACE
        </span>

        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>

        <p className="text-[11px] sm:text-xs text-slate-600 max-w-lg leading-relaxed font-medium">
          {description}
        </p>

        {/* Action CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-0.5">
          <button
            onClick={() => {
              if (onBrowseAll) {
                onBrowseAll();
              } else {
                const el = document.getElementById("browse-categories-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white font-bold px-4 py-2 rounded-full text-[11px] shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Browse All Categories</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <Link
            href="/offers"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00AEEF] hover:text-[#0086B8] hover:underline transition-colors"
          >
            <span>Explore Best Sellers</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 4 Trust Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
          {/* 1. Trusted Products */}
          <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
            <div className="w-6 h-6 rounded-md bg-sky-50 text-[#00AEEF] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold text-slate-900">
                Trusted
              </div>
              <div className="text-[8.5px] font-medium text-slate-500">
                Products
              </div>
            </div>
          </div>

          {/* 2. Genuine Brands */}
          <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
            <div className="w-6 h-6 rounded-md bg-sky-50 text-[#00AEEF] flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold text-slate-900">
                Genuine
              </div>
              <div className="text-[8.5px] font-medium text-slate-500">
                Brands
              </div>
            </div>
          </div>

          {/* 3. Fast & Safe Delivery */}
          <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold text-slate-900">
                Fast &amp; Safe
              </div>
              <div className="text-[8.5px] font-medium text-slate-500">
                Delivery
              </div>
            </div>
          </div>

          {/* 4. Expert Support */}
          <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Headphones className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold text-slate-900">
                Expert
              </div>
              <div className="text-[8.5px] font-medium text-slate-500">
                Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
