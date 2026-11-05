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

const NEUTRAL_THEME = {
  bg: "bg-white hover:bg-slate-50/60 border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs",
  blobTop: "bg-slate-100/50",
  blobBottom: "bg-slate-50/60",
  iconBg: "bg-slate-100 group-hover:bg-[#2563EB]/10",
  iconColor: "text-slate-700 group-hover:text-[#2563EB]",
  countColor: "text-slate-500",
  arrowBg: "bg-slate-100 group-hover:bg-[#2563EB]",
  arrowColor: "text-slate-600 group-hover:text-white",
  arrowHoverBg: "group-hover:bg-[#2563EB]",
  mobileBg: "bg-white hover:bg-slate-50/80 border-slate-200/80",
};

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
    mobileBg?: string;
  }
> = {
  blue: NEUTRAL_THEME,
  teal: NEUTRAL_THEME,
  purple: NEUTRAL_THEME,
  amber: NEUTRAL_THEME,
  emerald: NEUTRAL_THEME,
  rose: NEUTRAL_THEME,
  cyan: NEUTRAL_THEME,
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
      return <Sparkles className="w-3 sm:w-3 lg:w-3.5 lg:h-3.5" />;
  }
}
interface DraggableMarqueeProps {
  items: CategoryCardItem[];
  direction: "left" | "right";
  onSelectCategory?: (category: string) => void;
  speed?: number;
  rowId: string;
}

const DraggableContinuousMarquee: React.FC<DraggableMarqueeProps> = ({
  items,
  direction,
  onSelectCategory,
  speed = 34,
  rowId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getMetrics = () => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return { cardWidth: 185, singleSetWidth: 740 };
    const card = container.querySelector<HTMLElement>("[data-marquee-card]");
    const cardWidth = card ? card.offsetWidth + 10 : 185;
    return { cardWidth, singleSetWidth: items.length * cardWidth };
  };

  // Initial scroll setup so we have runway in both directions
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return;
    const { singleSetWidth } = getMetrics();
    if (container.scrollLeft === 0) {
      container.scrollLeft = direction === "right" ? singleSetWidth * 2 : singleSetWidth;
    }
  }, [items.length, direction]);

  // Continuous frame-rate independent animation loop
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return;

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTime, 50);
      lastTime = currentTime;

      if (!isHoveredRef.current && !isDraggingRef.current && container) {
        const { singleSetWidth } = getMetrics();
        const deltaPixels = (speed * deltaTime) / 1000;

        if (direction === "left") {
          container.scrollLeft += deltaPixels;
          // Circular Linked List infinite wrap
          if (container.scrollLeft >= singleSetWidth * 2.5) {
            container.scrollLeft -= singleSetWidth;
          }
        } else {
          container.scrollLeft -= deltaPixels;
          // Circular Linked List infinite wrap
          if (container.scrollLeft <= singleSetWidth * 0.5) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [items.length, direction, speed]);

  // Boundary check during manual dragging so user can drag indefinitely
  const checkCircularBoundary = () => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return;
    const { singleSetWidth } = getMetrics();

    if (container.scrollLeft >= singleSetWidth * 2.8) {
      container.scrollLeft -= singleSetWidth;
      startScrollLeftRef.current -= singleSetWidth;
    } else if (container.scrollLeft <= singleSetWidth * 0.2) {
      container.scrollLeft += singleSetWidth;
      startScrollLeftRef.current += singleSetWidth;
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const delta = e.pageX - startXRef.current;
    if (Math.abs(delta) > 4) {
      hasMovedRef.current = true;
    }
    container.scrollLeft = startScrollLeftRef.current - delta;
    checkCircularBoundary();
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = false;
    }, 1200);
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.touches[0].pageX;
    startScrollLeftRef.current = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = scrollRef.current;
    if (!container || !isDraggingRef.current) return;
    const delta = e.touches[0].pageX - startXRef.current;
    if (Math.abs(delta) > 5) {
      hasMovedRef.current = true;
    }
    container.scrollLeft = startScrollLeftRef.current - delta;
    checkCircularBoundary();
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = false;
    }, 1600);
  };

  return (
    <div
      className="relative overflow-hidden w-full select-none cursor-grab active:cursor-grabbing"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
      }}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        handleMouseUp();
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-hidden no-scrollbar py-0.5"
        style={{
          scrollBehavior: "auto",
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {[0, 1, 2, 3].flatMap((loopIdx) =>
          items.map((cat, idx) => {
            const theme = THEMES[cat.themeColor || "blue"] || THEMES.blue;
            const uniqueKey = `${cat.id}-${rowId}-loop-${loopIdx}-${idx}`;

            return (
              <Link
                key={uniqueKey}
                href={cat.href}
                data-marquee-card="true"
                draggable={false}
                onClick={(e) => {
                  if (hasMovedRef.current) {
                    e.preventDefault();
                    return;
                  }
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory(cat.name);
                  }
                }}
                className={`relative flex items-center gap-2 px-2.5 py-1 rounded-xl border shadow-2xs hover:shadow-xs transition-shadow duration-200 w-[172px] h-[48px] shrink-0 group select-none pointer-events-auto ${
                  theme.mobileBg ||
                  "bg-gradient-to-r from-blue-50/70 via-slate-50/50 to-white border-blue-100/70"
                }`}
              >
                {/* Left: Product Cutout Image */}
                <div className="relative w-8.5 h-8.5 shrink-0 flex items-center justify-center pointer-events-none">
                  <Image
                    src={cat.image}
                    alt={cat.imageAlt || cat.name}
                    fill
                    draggable={false}
                    sizes="36px"
                    className="object-contain drop-shadow-xs group-hover:scale-108 transition-transform duration-300 pointer-events-none select-none"
                    style={
                      {
                        pointerEvents: "none",
                        userSelect: "none",
                        WebkitUserDrag: "none",
                      } as React.CSSProperties
                    }
                  />
                </div>

                {/* Center: Title & Product Count */}
                <div className="flex-1 min-w-0 pointer-events-none">
                  <h3 className="font-bold text-[11px] text-slate-900 tracking-tight leading-tight truncate group-hover:text-[#2563EB] transition-colors">
                    {cat.name}
                  </h3>
                  {cat.productCount && (
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5 leading-none truncate">
                      {cat.productCount}
                    </p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

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
    <section className="pt-2 sm:pt-3.5 pb-4 sm:pb-6 bg-white touch-pan-y" style={{ touchAction: "pan-y" }}>
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-1.5 sm:space-y-2 lg:space-y-2.5 touch-pan-y">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
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

        {/* Mobile View (< sm): Continuous Smooth Circular Linked-List Marquee with Mouse & Touch Drag */}
        <div className="block sm:hidden space-y-2.5 select-none">
          {/* Row 1: Right-to-Left Continuous Smooth Circular Linked List */}
          <DraggableContinuousMarquee
            items={topRow}
            direction="left"
            speed={32}
            rowId="top"
            onSelectCategory={onSelectCategory}
          />

          {/* Row 2: Left-to-Right Continuous Smooth Circular Linked List */}
          {bottomRow.length > 0 && (
            <DraggableContinuousMarquee
              items={bottomRow}
              direction="right"
              speed={32}
              rowId="bottom"
              onSelectCategory={onSelectCategory}
            />
          )}
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
                    className={`relative block w-full h-[155px] lg:h-[172px] rounded-xl overflow-hidden p-3 lg:p-3.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer border border-slate-100/80 touch-pan-y ${theme.bg}`}
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
                      className={`relative block w-full h-[155px] lg:h-[172px] rounded-xl overflow-hidden p-3 lg:p-3.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer border border-slate-100/80 touch-pan-y ${theme.bg}`}
                      style={{ touchAction: "pan-y" }}
                    >
                      {/* Subtle Corner Blob */}
                      <div
                        className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-xl pointer-events-none transition-transform duration-700 group-hover:scale-110 ${theme.blobBottom}`}
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
