"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
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
    blobTop: string;
    blobBottom: string;
    iconBg: string;
    iconColor: string;
    countColor: string;
    arrowBg: string;
    arrowColor: string;
    arrowHoverBg: string;
  }
> = {
  blue: {
    bg: "bg-gradient-to-br from-[#EEF6FF] via-[#F4F9FF] to-[#FFFDF5]",
    blobTop: "bg-[#D6E8FE]/70",
    blobBottom: "bg-[#FFE58F]/75",
    iconBg: "bg-blue-100",
    iconColor: "text-[#2563EB]",
    countColor: "text-[#2563EB]",
    arrowBg: "bg-[#2563EB]",
    arrowColor: "text-white",
    arrowHoverBg: "group-hover:bg-[#1D4ED8]",
  },
  teal: {
    bg: "bg-gradient-to-br from-[#F0FDF9] via-[#F7FEFC] to-[#E6FBF5]",
    blobTop: "bg-[#CCFBF1]/50",
    blobBottom: "bg-[#A7F3D0]/60",
    iconBg: "bg-[#D1FAE5]",
    iconColor: "text-[#059669]",
    countColor: "text-[#059669]",
    arrowBg: "bg-[#CCFBF1]",
    arrowColor: "text-[#0F766E]",
    arrowHoverBg: "group-hover:bg-[#99F6E4]",
  },
  purple: {
    bg: "bg-gradient-to-br from-[#FAF5FF] via-[#FDFBFF] to-[#F3E8FF]/60",
    blobTop: "bg-[#EDE9FE]/50",
    blobBottom: "bg-[#DDD6FE]/70",
    iconBg: "bg-[#EDE9FE]",
    iconColor: "text-[#7C3AED]",
    countColor: "text-[#7C3AED]",
    arrowBg: "bg-[#EDE9FE]",
    arrowColor: "text-[#6D28D9]",
    arrowHoverBg: "group-hover:bg-[#DDD6FE]",
  },
  amber: {
    bg: "bg-gradient-to-br from-[#FFFDF5] via-[#FFFFFA] to-[#FEF3C7]/60",
    blobTop: "bg-[#FEF3C7]/50",
    blobBottom: "bg-[#FDE68A]/70",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    countColor: "text-[#D97706]",
    arrowBg: "bg-[#FEF3C7]",
    arrowColor: "text-[#B45309]",
    arrowHoverBg: "group-hover:bg-[#FDE68A]",
  },
  emerald: {
    bg: "bg-gradient-to-br from-[#F0FDF4] via-[#F7FEF9] to-[#DCFCE7]/60",
    blobTop: "bg-[#DCFCE7]/50",
    blobBottom: "bg-[#BBF7D0]/70",
    iconBg: "bg-[#DCFCE7]",
    iconColor: "text-[#059669]",
    countColor: "text-[#059669]",
    arrowBg: "bg-[#DCFCE7]",
    arrowColor: "text-[#047857]",
    arrowHoverBg: "group-hover:bg-[#A7F3D0]",
  },
  rose: {
    bg: "bg-gradient-to-br from-[#FFF1F2] via-[#FFF8F8] to-[#FFE4E6]/60",
    blobTop: "bg-[#FFE4E6]/50",
    blobBottom: "bg-[#FECDD3]/70",
    iconBg: "bg-[#FFE4E6]",
    iconColor: "text-[#E11D48]",
    countColor: "text-[#E11D48]",
    arrowBg: "bg-[#FFE4E6]",
    arrowColor: "text-[#BE123C]",
    arrowHoverBg: "group-hover:bg-[#FECDD3]",
  },
  cyan: {
    bg: "bg-gradient-to-br from-[#F0F9FF] via-[#F8FCFF] to-[#E0F2FE]/60",
    blobTop: "bg-[#E0F2FE]/50",
    blobBottom: "bg-[#BAE6FD]/70",
    iconBg: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
    countColor: "text-[#0284C7]",
    arrowBg: "bg-[#E0F2FE]",
    arrowColor: "text-[#0369A1]",
    arrowHoverBg: "group-hover:bg-[#BAE6FD]",
  },
};

function getBadgeIcon(icon?: string) {
  switch (icon) {
    case "robot":
      return <Bot className="w-3.5 h-3.5 lg:w-4 lg:h-4" />;
    case "cpu":
      return <Cpu className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
    case "radio":
      return <Radio className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
    case "drone":
      return <Navigation className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
    case "graduation":
      return <GraduationCap className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
    case "wifi":
      return <Wifi className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
    case "code":
      return <Code className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
    case "chip":
      return <Layers className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
    default:
      return <Sparkles className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
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

  // Top row: first 4 items (item 0 is featured 2-column card, 1-3 are single column)
  const topRow = categories.slice(0, 4);
  // Bottom row: remaining 4 items (equal 4 single columns)
  const bottomRow = categories.slice(4, 8);

  return (
    <section className="pt-2 sm:pt-3.5 pb-4 sm:pb-6 bg-white touch-pan-y" style={{ touchAction: "pan-y" }}>
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-1.5 sm:space-y-2 lg:space-y-2.5 touch-pan-y">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <div className="w-7 h-1 bg-[#FFC20E] rounded-full" />
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

        {/* Row 1: 2-Column on Mobile, 5-Column Grid Layout on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 lg:gap-3 touch-pan-y">
          {topRow.map((cat, idx) => {
            const isFeatured = idx === 0 || cat.isFeatured;
            const theme = THEMES[cat.themeColor || "blue"] || THEMES.blue;

            return (
              <div
                key={cat.id}
                className={isFeatured ? "col-span-1 lg:col-span-2" : "col-span-1"}
              >
                <Link
                  href={cat.href}
                  onClick={(e) => {
                    if (onSelectCategory) {
                      e.preventDefault();
                      onSelectCategory(cat.name);
                    }
                  }}
                  className={`relative block w-full h-[135px] sm:h-[155px] lg:h-[172px] rounded-lg sm:rounded-xl overflow-hidden p-2.5 sm:p-3 lg:p-3.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer border border-slate-100/80 touch-pan-y ${theme.bg}`}
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
                      isFeatured ? "max-w-[50%] sm:max-w-[46%]" : "max-w-[54%] sm:max-w-[50%]"
                    }`}
                  >
                    {/* Top: Icon Badge + Title + Tagline */}
                    <div>
                      <div
                        className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 lg:w-7.5 lg:h-7.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105 ${theme.iconBg} ${theme.iconColor}`}
                      >
                        {getBadgeIcon(cat.badgeIcon || (isFeatured ? "robot" : "cpu"))}
                      </div>

                      <h3
                        className={`font-bold text-slate-900 tracking-tight leading-snug mt-1 sm:mt-1.5 line-clamp-2 ${
                          isFeatured
                            ? "text-[13.5px] sm:text-[16px] lg:text-[18.5px]"
                            : "text-[12px] sm:text-[13.5px] lg:text-[15px]"
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
                        <div className="flex flex-col lg:flex-row lg:items-center gap-1 sm:gap-1.5 lg:gap-2">
                          {cat.productCount && (
                            <span className={`text-[9.5px] sm:text-[10.5px] font-semibold ${theme.countColor}`}>
                              {cat.productCount}
                            </span>
                          )}
                          <div
                            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                          >
                            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      ) : (
                        <div>
                          {cat.productCount && (
                            <span className={`block text-[9.5px] sm:text-[10.5px] font-semibold ${theme.countColor}`}>
                              {cat.productCount}
                            </span>
                          )}
                          <div
                            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:scale-105 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                          >
                            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Floating Product Cutout Image - Extra Wide Cutout */}
                  <div
                    className={
                      isFeatured
                        ? "absolute right-0 sm:right-1 -bottom-1 w-[145px] sm:w-[195px] lg:w-[250px] xl:w-[280px] h-[98%] sm:h-[105%] lg:h-[108%] flex items-end justify-end pointer-events-none select-none touch-pan-y"
                        : "absolute -bottom-0.5 right-0 sm:right-0.5 w-[92px] sm:w-[118px] lg:w-[140px] xl:w-[150px] h-[80%] sm:h-[90%] lg:h-[96%] flex items-end justify-end pointer-events-none select-none touch-pan-y"
                    }
                  >
                    <Image
                      src={cat.image}
                      alt={cat.imageAlt || cat.name}
                      fill
                      draggable={false}
                      sizes={isFeatured ? "(max-width: 640px) 150px, (max-width: 1024px) 250px, 300px" : "(max-width: 640px) 100px, 160px"}
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

        {/* Row 2: 2-Column on Mobile, 4-Column Grid Layout on Desktop */}
        {bottomRow.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 touch-pan-y">
            {bottomRow.map((cat, idx) => {
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
                    className={`relative block w-full h-[135px] sm:h-[155px] lg:h-[172px] rounded-lg sm:rounded-xl overflow-hidden p-2.5 sm:p-3 lg:p-3.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer border border-slate-100/80 touch-pan-y ${theme.bg}`}
                    style={{ touchAction: "pan-y" }}
                  >
                    {/* Subtle Corner Blob */}
                    <div
                      className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-xl pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobBottom}`}
                    />

                    {/* Card Content Layout */}
                    <div className="relative z-10 h-full flex flex-col justify-between max-w-[54%] sm:max-w-[50%]">
                      {/* Top: Icon Badge + Title + Tagline */}
                      <div>
                        <div
                          className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 lg:w-7.5 lg:h-7.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105 ${theme.iconBg} ${theme.iconColor}`}
                        >
                          {getBadgeIcon(cat.badgeIcon || "chip")}
                        </div>

                        <h3 className="text-[12px] sm:text-[13.5px] lg:text-[15px] font-bold text-slate-900 tracking-tight leading-snug mt-1 sm:mt-1.5 line-clamp-2">
                          {cat.name}
                        </h3>

                        {cat.tagline && (
                          <p className="hidden sm:block text-[10px] lg:text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                            {cat.tagline}
                          </p>
                        )}
                      </div>

                      {/* Bottom: Count + Arrow (Stacked vertically) */}
                      <div className="pt-0.5">
                        {cat.productCount && (
                          <span className={`block text-[9.5px] sm:text-[10.5px] font-semibold ${theme.countColor}`}>
                            {cat.productCount}
                          </span>
                        )}
                        <div
                          className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:scale-105 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                        >
                          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Floating Product Cutout Image - Extra Wide Cutout */}
                    <div className="absolute -bottom-0.5 right-0 sm:right-0.5 w-[92px] sm:w-[118px] lg:w-[140px] xl:w-[150px] h-[80%] sm:h-[90%] lg:h-[96%] flex items-end justify-end pointer-events-none select-none touch-pan-y">
                      <Image
                        src={cat.image}
                        alt={cat.imageAlt || cat.name}
                        fill
                        draggable={false}
                        sizes="(max-width: 640px) 100px, 160px"
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
    </section>
  );
};

export default ShopByCategory;
