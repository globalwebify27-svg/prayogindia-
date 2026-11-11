"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  Cpu,
  Radio,
  Navigation,
  GraduationCap,
  Wifi,
  Code,
  Layers,
} from "lucide-react";
import {
  DEFAULT_CATEGORY_SHOWCASE,
  CategoryCardItem,
} from "@/data/defaultCategoryShowcase";

export type { CategoryCardItem };

interface Props {
  onSelectCategory?: (category: string) => void;
}

const THEMES: Record<
  string,
  {
    bg: string;
    border: string;
    blobTop: string;
    blobBottom: string;
    iconBg: string;
    iconColor: string;
    countColor: string;
    arrowBg: string;
    arrowColor: string;
    arrowHoverBg: string;
    mobileBg: string;
  }
> = {
  blue: {
    bg: "bg-gradient-to-br from-[#EEF6FF] via-[#F8FAFC] to-[#DBEAFE]/45",
    border: "border border-blue-200/90 hover:border-blue-400 shadow-[0_2px_10px_-3px_rgba(37,99,235,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(37,99,235,0.18)]",
    blobTop: "bg-[#BFDBFE]/70",
    blobBottom: "bg-[#93C5FD]/45",
    iconBg: "bg-blue-100 text-blue-600 border border-blue-200/90 shadow-2xs",
    iconColor: "text-blue-600",
    countColor: "text-blue-600",
    arrowBg: "bg-blue-600",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-blue-700",
    mobileBg: "bg-gradient-to-r from-blue-50 via-white to-blue-50/50 border-blue-200/90",
  },
  teal: {
    bg: "bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#CCFBF1]/45",
    border: "border border-teal-200/90 hover:border-teal-400 shadow-[0_2px_10px_-3px_rgba(13,148,136,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(13,148,136,0.18)]",
    blobTop: "bg-[#99F6E4]/60",
    blobBottom: "bg-[#5EEAD4]/40",
    iconBg: "bg-teal-100 text-teal-700 border border-teal-200/90 shadow-2xs",
    iconColor: "text-teal-700",
    countColor: "text-teal-700",
    arrowBg: "bg-teal-600",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-teal-700",
    mobileBg: "bg-gradient-to-r from-teal-50 via-white to-teal-50/50 border-teal-200/90",
  },
  purple: {
    bg: "bg-gradient-to-br from-[#FAF5FF] via-[#F8FAFC] to-[#EDE9FE]/45",
    border: "border border-purple-200/90 hover:border-purple-400 shadow-[0_2px_10px_-3px_rgba(147,51,234,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(147,51,234,0.18)]",
    blobTop: "bg-[#DDD6FE]/60",
    blobBottom: "bg-[#C4B5FD]/45",
    iconBg: "bg-purple-100 text-purple-700 border border-purple-200/90 shadow-2xs",
    iconColor: "text-purple-700",
    countColor: "text-purple-700",
    arrowBg: "bg-purple-600",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-purple-700",
    mobileBg: "bg-gradient-to-r from-purple-50 via-white to-purple-50/50 border-purple-200/90",
  },
  amber: {
    bg: "bg-gradient-to-br from-[#FFFBEB] via-[#F8FAFC] to-[#FEF3C7]/50",
    border: "border border-amber-200/90 hover:border-amber-400 shadow-[0_2px_10px_-3px_rgba(217,119,6,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(217,119,6,0.18)]",
    blobTop: "bg-[#FDE68A]/70",
    blobBottom: "bg-[#FCD34D]/45",
    iconBg: "bg-amber-100 text-amber-800 border border-amber-200/90 shadow-2xs",
    iconColor: "text-amber-800",
    countColor: "text-amber-800",
    arrowBg: "bg-amber-500",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-amber-600",
    mobileBg: "bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-amber-200/90",
  },
  indigo: {
    bg: "bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFC] to-[#E0E7FF]/45",
    border: "border border-indigo-200/90 hover:border-indigo-400 shadow-[0_2px_10px_-3px_rgba(79,70,229,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(79,70,229,0.18)]",
    blobTop: "bg-[#C7D2FE]/70",
    blobBottom: "bg-[#A5B4FC]/45",
    iconBg: "bg-indigo-100 text-indigo-700 border border-indigo-200/90 shadow-2xs",
    iconColor: "text-indigo-700",
    countColor: "text-indigo-700",
    arrowBg: "bg-indigo-600",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-indigo-700",
    mobileBg: "bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 border-indigo-200/90",
  },
  emerald: {
    bg: "bg-gradient-to-br from-[#F0FDF4] via-[#F8FAFC] to-[#DCFCE7]/45",
    border: "border border-emerald-200/90 hover:border-emerald-400 shadow-[0_2px_10px_-3px_rgba(5,150,105,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(5,150,105,0.18)]",
    blobTop: "bg-[#BBF7D0]/70",
    blobBottom: "bg-[#86EFAC]/45",
    iconBg: "bg-emerald-100 text-emerald-700 border border-emerald-200/90 shadow-2xs",
    iconColor: "text-emerald-700",
    countColor: "text-emerald-700",
    arrowBg: "bg-emerald-600",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-emerald-700",
    mobileBg: "bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 border-emerald-200/90",
  },
  rose: {
    bg: "bg-gradient-to-br from-[#FFF1F2] via-[#F8FAFC] to-[#FFE4E6]/45",
    border: "border border-rose-200/90 hover:border-rose-400 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(225,29,72,0.18)]",
    blobTop: "bg-[#FECDD3]/70",
    blobBottom: "bg-[#FDA4AF]/45",
    iconBg: "bg-rose-100 text-rose-700 border border-rose-200/90 shadow-2xs",
    iconColor: "text-rose-700",
    countColor: "text-rose-700",
    arrowBg: "bg-rose-600",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-rose-700",
    mobileBg: "bg-gradient-to-r from-rose-50 via-white to-rose-50/50 border-rose-200/90",
  },
  cyan: {
    bg: "bg-gradient-to-br from-[#F0F9FF] via-[#F8FAFC] to-[#E0F2FE]/55",
    border: "border border-sky-200/90 hover:border-sky-400 shadow-[0_2px_10px_-3px_rgba(2,132,199,0.08)] hover:shadow-[0_8px_24px_-4px_rgba(2,132,199,0.18)]",
    blobTop: "bg-[#BAE6FD]/70",
    blobBottom: "bg-[#7DD3FC]/45",
    iconBg: "bg-sky-100 text-sky-700 border border-sky-200/90 shadow-2xs",
    iconColor: "text-sky-700",
    countColor: "text-sky-700",
    arrowBg: "bg-sky-600",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-sky-700",
    mobileBg: "bg-gradient-to-r from-sky-50 via-white to-sky-50/50 border-sky-200/90",
  },
};

const CARD_THEMES: Record<
  string,
  {
    bg: string;
    border: string;
  }
> = {
  blue: {
    bg: "bg-gradient-to-b from-[#EEF6FF] via-[#F4F9FF] to-[#DBEAFE]/45",
    border: "border-blue-200/90",
  },
  teal: {
    bg: "bg-gradient-to-b from-[#F0FDF4] via-[#F6FEF9] to-[#DCFCE7]/55",
    border: "border-emerald-200/90",
  },
  purple: {
    bg: "bg-gradient-to-b from-[#FAF5FF] via-[#FBF7FF] to-[#EDE9FE]/50",
    border: "border-purple-200/90",
  },
  amber: {
    bg: "bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF5] to-[#FEF3C7]/60",
    border: "border-amber-200/90",
  },
  indigo: {
    bg: "bg-gradient-to-b from-[#EEF2FF] via-[#F5F7FF] to-[#E0E7FF]/50",
    border: "border-indigo-200/90",
  },
  emerald: {
    bg: "bg-gradient-to-b from-[#F0FDF4] via-[#F6FEF9] to-[#DCFCE7]/55",
    border: "border-emerald-200/90",
  },
  rose: {
    bg: "bg-gradient-to-b from-[#FFF1F2] via-[#FFF7F7] to-[#FFE4E6]/50",
    border: "border-rose-200/90",
  },
  cyan: {
    bg: "bg-gradient-to-b from-[#F0F9FF] via-[#F6FBFF] to-[#E0F2FE]/55",
    border: "border-sky-200/90",
  },
};

function getBadgeIcon(icon?: string) {
  switch (icon) {
    case "robot":
      return <Bot className="w-3.5 h-3.5 lg:w-4 lg:h-4" />;
    case "cpu":
      return <Cpu className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
    case "radio":
      return <Radio className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
    case "drone":
      return <Navigation className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
    case "graduation":
      return <GraduationCap className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
    case "wifi":
      return <Wifi className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
    case "code":
      return <Code className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
    case "chip":
      return <Layers className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
    default:
      return <Layers className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
  }
}

export const ShopByCategory: React.FC<Props> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<CategoryCardItem[]>(
    DEFAULT_CATEGORY_SHOWCASE
  );

  useEffect(() => {
    let isMounted = true;
    async function loadShowcaseCategories() {
      try {
        const res = await fetch("/api/category-showcase?activeOnly=true");
        if (!res.ok) return;
        const json = await res.json();
        if (
          isMounted &&
          json?.success &&
          Array.isArray(json.data) &&
          json.data.length > 0
        ) {
          setCategories(json.data);
        }
      } catch (err) {
        console.warn("Could not load dynamic category showcase:", err);
      }
    }
    loadShowcaseCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Top row: first 4 items (item 0 is featured 2-column card on desktop, 1-3 are single column)
  const topRow = categories.slice(0, 4);
  // Bottom row: remaining 4 items (equal 4 single columns)
  const bottomRow = categories.slice(4, 8);

  return (
    <section className="pt-3 sm:pt-4 pb-4 sm:pb-6 bg-white touch-pan-y" style={{ touchAction: "pan-y" }}>
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-1.5 sm:space-y-2 lg:space-y-2.5 touch-pan-y">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 sm:h-5 bg-[#2563EB] rounded-full inline-block" />
            <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/categories"
              className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#0A233F] hover:underline flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Mobile View (< sm): Smooth Horizontal Scroll of Category Cards (Matching Image 1) */}
        <div className="block sm:hidden select-none -mx-3 px-3 pt-0.5 pb-2">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
            {categories.map((cat) => {
              const theme =
                CARD_THEMES[cat.themeColor || "blue"] || CARD_THEMES.blue;

              return (
                <Link
                  key={`mobile-cat-card-${cat.id}`}
                  href={cat.href}
                  onClick={(e) => {
                    if (onSelectCategory) {
                      e.preventDefault();
                      onSelectCategory(cat.name);
                    }
                  }}
                  className={`snap-start w-[138px] xs:w-[146px] shrink-0 rounded-2xl p-2.5 flex flex-col justify-between border shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-[0.98] group cursor-pointer select-none ${theme.bg} ${theme.border}`}
                >
                  {/* Top: Inner Translucent White Container with Product Cutout */}
                  <div className="relative w-full h-[92px] xs:h-[98px] rounded-xl bg-white/75 backdrop-blur-xs flex items-center justify-center p-2 shadow-2xs border border-white/60 mb-2 overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                      <Image
                        src={cat.image}
                        alt={cat.imageAlt || cat.name}
                        fill
                        sizes="135px"
                        className="object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-108 pointer-events-none select-none"
                      />
                    </div>
                  </div>

                  {/* Bottom: Title, Product Count, and Bottom-Right Circular Arrow Button */}
                  <div className="flex items-end justify-between gap-1.5 mt-auto">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[12px] xs:text-[13px] text-slate-900 leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                        {cat.name}
                      </h3>
                      {cat.productCount && (
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-none truncate">
                          {cat.productCount}
                        </p>
                      )}
                    </div>

                    <div className="w-6.5 h-6.5 xs:w-7 xs:h-7 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-800 shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-200">
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop View (>= sm): Grid Layout */}
        <div className="hidden sm:block space-y-2.5 sm:space-y-3">
          {/* Row 1: 5-Column Grid Layout */}
          <div className="grid grid-cols-5 gap-2.5 lg:gap-3 touch-pan-y">
            {topRow.map((cat, idx) => {
              const isFeatured = idx === 0 || cat.isFeatured;
              const theme = THEMES[cat.themeColor || "blue"] || THEMES.blue;

              return (
                <div
                  key={cat.id}
                  className={isFeatured ? "col-span-2" : "col-span-1"}
                >
                  <Link
                    href={cat.href}
                    onClick={(e) => {
                      if (onSelectCategory) {
                        e.preventDefault();
                        onSelectCategory(cat.name);
                      }
                    }}
                    className={`relative block w-full h-[155px] lg:h-[172px] rounded-xl overflow-hidden p-3 lg:p-3.5 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer touch-pan-y ${theme.border} ${theme.bg}`}
                    style={{ touchAction: "pan-y" }}
                  >
                    {/* Subtle Background Blobs / Organic Shapes */}
                    <div
                      className={`absolute -top-10 -right-6 w-40 h-40 rounded-full blur-xl pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobTop}`}
                    />
                    <div
                      className={`absolute -bottom-6 -left-6 w-20 h-20 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobBottom}`}
                    />

                    {/* Card Content Layout */}
                    <div
                      className={`relative z-10 h-full flex flex-col justify-between ${
                        isFeatured ? "max-w-[46%]" : "max-w-[50%]"
                      }`}
                    >
                      {/* Top: Icon Badge + Title + Tagline */}
                      <div>
                        <div
                          className={`w-6.5 h-6.5 lg:w-7.5 lg:h-7.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105 ${theme.iconBg} ${theme.iconColor}`}
                        >
                          {getBadgeIcon(cat.badgeIcon || (isFeatured ? "robot" : "cpu"))}
                        </div>

                        <h3
                          className={`font-bold text-slate-900 tracking-tight leading-snug mt-1.5 line-clamp-2 ${
                            isFeatured
                              ? "text-[16px] lg:text-[18.5px]"
                              : "text-[13.5px] lg:text-[15px]"
                          }`}
                        >
                          {cat.name}
                        </h3>

                        {cat.tagline && (
                          <p className="hidden sm:block text-[10px] lg:text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                            {cat.tagline}
                          </p>
                        )}
                      </div>

                      {/* Bottom: Count + Arrow */}
                      <div className="pt-0.5">
                        {isFeatured ? (
                          <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2">
                            {cat.productCount && (
                              <span className={`text-[10.5px] font-semibold ${theme.countColor}`}>
                                {cat.productCount}
                              </span>
                            )}
                            <div
                              className={`w-5.5 h-5.5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                            >
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        ) : (
                          <div>
                            {cat.productCount && (
                              <span className={`block text-[10.5px] font-semibold ${theme.countColor}`}>
                                {cat.productCount}
                              </span>
                            )}
                            <div
                              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:scale-105 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                            >
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Floating Product Cutout Image */}
                    <div
                      className={
                        isFeatured
                          ? "absolute right-1 -bottom-1 w-[195px] lg:w-[250px] xl:w-[280px] h-[105%] lg:h-[108%] flex items-end justify-end pointer-events-none select-none touch-pan-y"
                          : "absolute -bottom-0.5 right-0.5 w-[118px] lg:w-[140px] xl:w-[150px] h-[90%] lg:h-[96%] flex items-end justify-end pointer-events-none select-none touch-pan-y"
                      }
                    >
                      <Image
                        src={cat.image}
                        alt={cat.imageAlt || cat.name}
                        fill
                        draggable={false}
                        sizes={isFeatured ? "(max-width: 1024px) 250px, 300px" : "160px"}
                        className="object-contain object-right-bottom group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-xs pointer-events-none select-none"
                        style={{ pointerEvents: "none", userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties}
                        priority={idx < 2}
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Row 2: 4-Column Grid Layout on Desktop */}
          {bottomRow.length > 0 && (
            <div className="grid grid-cols-4 gap-2.5 lg:gap-3 touch-pan-y">
              {bottomRow.map((cat) => {
                const theme = THEMES[cat.themeColor || "blue"] || THEMES.blue;

                return (
                  <div key={cat.id} className="col-span-1">
                    <Link
                      href={cat.href}
                      onClick={(e) => {
                        if (onSelectCategory) {
                          e.preventDefault();
                          onSelectCategory(cat.name);
                        }
                      }}
                      className={`relative block w-full h-[155px] lg:h-[172px] rounded-xl overflow-hidden p-3 lg:p-3.5 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer touch-pan-y ${theme.border} ${theme.bg}`}
                      style={{ touchAction: "pan-y" }}
                    >
                      {/* Subtle Background Blobs */}
                      <div
                        className={`absolute -top-10 -right-6 w-36 h-36 rounded-full blur-xl pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobTop}`}
                      />
                      <div
                        className={`absolute -bottom-8 -left-6 w-24 h-24 rounded-full blur-lg pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobBottom}`}
                      />

                      {/* Card Content Layout */}
                      <div className="relative z-10 h-full flex flex-col justify-between max-w-[50%]">
                        {/* Top: Icon Badge + Title + Tagline */}
                        <div>
                          <div
                            className={`w-6.5 h-6.5 lg:w-7.5 lg:h-7.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105 ${theme.iconBg} ${theme.iconColor}`}
                          >
                            {getBadgeIcon(cat.badgeIcon || "chip")}
                          </div>

                          <h3 className="text-[13.5px] lg:text-[15px] font-bold text-slate-900 tracking-tight leading-snug mt-1.5 line-clamp-2">
                            {cat.name}
                          </h3>

                          {cat.tagline && (
                            <p className="hidden sm:block text-[10px] lg:text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                              {cat.tagline}
                            </p>
                          )}
                        </div>

                        {/* Bottom: Count + Arrow */}
                        <div className="pt-0.5">
                          {cat.productCount && (
                            <span className={`block text-[10.5px] font-semibold ${theme.countColor}`}>
                              {cat.productCount}
                            </span>
                          )}
                          <div
                            className={`w-5.5 h-5.5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:scale-105 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                          >
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Floating Product Cutout Image */}
                      <div className="absolute -bottom-0.5 right-0.5 w-[118px] lg:w-[140px] xl:w-[150px] h-[90%] lg:h-[96%] flex items-end justify-end pointer-events-none select-none touch-pan-y">
                        <Image
                          src={cat.image}
                          alt={cat.imageAlt || cat.name}
                          fill
                          draggable={false}
                          sizes="160px"
                          className="object-contain object-right-bottom group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-xs pointer-events-none select-none"
                          style={{ pointerEvents: "none", userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties}
                          priority={false}
                        />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
