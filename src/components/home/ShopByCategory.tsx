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
      return <Bot className="w-5 h-5" />;
    case "cpu":
      return <Cpu className="w-4 h-4" />;
    case "radio":
      return <Radio className="w-4 h-4" />;
    case "drone":
      return <Navigation className="w-4 h-4" />;
    case "graduation":
      return <GraduationCap className="w-4 h-4" />;
    case "wifi":
      return <Wifi className="w-4 h-4" />;
    case "code":
      return <Code className="w-4 h-4" />;
    case "chip":
      return <Layers className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
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
    <section className="pt-4 sm:pt-7 pb-8 sm:pb-12 bg-white">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-2.5 sm:space-y-4 lg:space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <div className="w-12 h-1 bg-[#FFC20E] rounded-full" />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/categories"
              className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#0A233F] hover:underline flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Row 1: 2-Column on Mobile, 5-Column Grid Layout on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
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
                  className={`relative block w-full h-[165px] sm:h-[200px] lg:h-[235px] rounded-2xl sm:rounded-3xl overflow-hidden p-3 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer select-none border border-slate-100/70 ${theme.bg}`}
                >
                  {/* Subtle Background Blobs / Organic Shapes */}
                  <div
                    className={`absolute -top-12 -right-8 w-60 h-60 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobTop}`}
                  />
                  <div
                    className={`absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobBottom}`}
                  />

                  {/* Card Content Layout */}
                  <div className="relative z-10 h-full flex flex-col justify-between max-w-[62%] sm:max-w-[58%]">
                    {/* Top: Icon Badge + Title + Tagline */}
                    <div>
                      <div
                        className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-110 ${theme.iconBg} ${theme.iconColor}`}
                      >
                        {getBadgeIcon(cat.badgeIcon || (isFeatured ? "robot" : "cpu"))}
                      </div>

                      <h3
                        className={`font-bold text-slate-900 tracking-tight leading-snug mt-1.5 sm:mt-2.5 line-clamp-2 ${
                          isFeatured
                            ? "text-[13px] sm:text-base lg:text-[24px]"
                            : "text-[13px] sm:text-[15px] lg:text-[17px]"
                        }`}
                      >
                        {cat.name}
                      </h3>

                      {cat.tagline && (
                        <p className="hidden sm:block text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                          {cat.tagline}
                        </p>
                      )}
                    </div>

                    {/* Bottom: Count + Arrow (Stacked on mobile so arrow stays in bottom-left without overlapping image) */}
                    <div className="pt-1 sm:pt-2">
                      {isFeatured ? (
                        <div className="flex flex-col lg:flex-row lg:items-center gap-1 sm:gap-1.5 lg:gap-3">
                          {cat.productCount && (
                            <span className={`text-[10px] sm:text-[11px] lg:text-xs font-semibold ${theme.countColor}`}>
                              {cat.productCount}
                            </span>
                          )}
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                          >
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      ) : (
                        <div>
                          {cat.productCount && (
                            <span className={`block text-[10px] sm:text-[11px] font-semibold ${theme.countColor}`}>
                              {cat.productCount}
                            </span>
                          )}
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mt-1 sm:mt-1.5 transition-all duration-300 group-hover:scale-110 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                          >
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Floating Product Cutout Image */}
                  <div
                    className={
                      isFeatured
                        ? "absolute right-0 sm:right-3 bottom-0 sm:bottom-2 w-[76px] sm:w-[110px] lg:w-[50%] h-[72px] sm:h-[100px] lg:h-[85%] flex items-end justify-center pointer-events-none"
                        : "absolute bottom-0 right-0 sm:right-0.5 w-[76px] sm:w-[105px] lg:w-[138px] h-[72px] sm:h-[95px] lg:h-[124px] pointer-events-none"
                    }
                  >
                    <Image
                      src={cat.image}
                      alt={cat.imageAlt || cat.name}
                      fill
                      sizes={isFeatured ? "(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 420px" : "(max-width: 640px) 45vw, 220px"}
                      className="object-contain object-bottom-right group-hover:scale-105 transition-transform duration-500 ease-out"
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
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
                    className={`relative block w-full h-[175px] sm:h-[200px] lg:h-[235px] rounded-2xl sm:rounded-3xl overflow-hidden p-3.5 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer select-none border border-slate-100/70 ${theme.bg}`}
                  >
                    {/* Subtle Corner Blob */}
                    <div
                      className={`absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-xl pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobBottom}`}
                    />

                    {/* Card Content Layout */}
                    <div className="relative z-10 h-full flex flex-col justify-between max-w-[58%]">
                      {/* Top: Icon Badge + Title + Tagline */}
                      <div>
                        <div
                          className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-110 ${theme.iconBg} ${theme.iconColor}`}
                        >
                          {getBadgeIcon(cat.badgeIcon || "chip")}
                        </div>

                        <h3 className="text-[13px] sm:text-[15px] lg:text-[17px] font-bold text-slate-900 tracking-tight leading-snug mt-1.5 sm:mt-2.5 line-clamp-2">
                          {cat.name}
                        </h3>

                        {cat.tagline && (
                          <p className="hidden sm:block text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                            {cat.tagline}
                          </p>
                        )}
                      </div>

                      {/* Bottom: Count + Arrow (Stacked vertically) */}
                      <div className="pt-1 sm:pt-2">
                        {cat.productCount && (
                          <span className={`block text-[10px] sm:text-[11px] font-semibold ${theme.countColor}`}>
                            {cat.productCount}
                          </span>
                        )}
                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mt-1 sm:mt-1.5 transition-all duration-300 group-hover:scale-110 ${theme.arrowBg} ${theme.arrowColor} ${theme.arrowHoverBg}`}
                        >
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Floating Product Cutout Image */}
                    <div className="absolute bottom-0 right-0 sm:right-0.5 w-[76px] sm:w-[105px] lg:w-[138px] h-[72px] sm:h-[95px] lg:h-[124px] pointer-events-none">
                      <Image
                        src={cat.image}
                        alt={cat.imageAlt || cat.name}
                        fill
                        sizes="(max-width: 640px) 45vw, 220px"
                        className="object-contain object-bottom-right group-hover:scale-105 transition-transform duration-500 ease-out"
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
