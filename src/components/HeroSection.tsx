"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DEFAULT_HERO_BANNERS,
  HeroBanner,
  sortHeroBanners,
} from "@/data/heroBannersData";

interface HeroProps {
  onExploreProducts?: () => void;
  onExploreSolutions?: () => void;
}

const TRUST_STATS = [
  {
    icon: ShieldCheck,
    title: "Verified Products",
    subtitle: "100% Genuine Tech",
    badge: "Official",
    color: "text-[#2563EB]",
    bg: "bg-blue-50/90",
    border: "border-blue-100/90",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    subtitle: "Pan-India Dispatch",
    badge: "Express",
    color: "text-[#D97706]",
    bg: "bg-amber-50/90",
    border: "border-amber-100/90",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    subtitle: "Engineer Guidance",
    badge: "Assistance",
    color: "text-[#7C3AED]",
    bg: "bg-purple-50/90",
    border: "border-purple-100/90",
  },
  {
    icon: Users,
    title: "Trusted by 10K+",
    subtitle: "Students & Labs",
    badge: "Community",
    color: "text-[#059669]",
    bg: "bg-emerald-50/90",
    border: "border-emerald-100/90",
  },
];

// Direction-aware horizontal swipe variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.85,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0.85,
  }),
};

export const HeroSection: React.FC<HeroProps> = ({
  onExploreProducts,
  onExploreSolutions,
}) => {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = slides.length;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + slideCount) % slideCount);
  };

  const goToSlide = (idx: number) => {
    if (idx === currentSlide) return;
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  // Fetch live banners from CMS API
  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const res = await fetch("/api/banners?activeOnly=true");
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setSlides(sortHeroBanners(json.data));
        }
      } catch (err) {
        console.warn("Could not load dynamic banners, using default slides:", err);
      }
    }
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-play interval with hover pause — uses smooth forward swipe
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6500);
    return () => clearInterval(timer);
  }, [slideCount, isPaused]);

  // Safe active slide accessor
  const activeSlide: HeroBanner = slides[currentSlide] || slides[0] || DEFAULT_HERO_BANNERS[0];

  const handlePrimaryClick = () => {
    if (onExploreProducts && activeSlide.primaryButtonLink === "/products") {
      onExploreProducts();
    } else if (activeSlide.primaryButtonLink) {
      router.push(activeSlide.primaryButtonLink);
    } else if (onExploreProducts) {
      onExploreProducts();
    } else {
      router.push("/products");
    }
  };

  const handleSecondaryClick = () => {
    if (onExploreSolutions && (activeSlide.secondaryButtonLink === "/services" || !activeSlide.secondaryButtonLink)) {
      onExploreSolutions();
    } else if (activeSlide.secondaryButtonLink) {
      router.push(activeSlide.secondaryButtonLink);
    } else if (onExploreSolutions) {
      onExploreSolutions();
    } else {
      router.push("/services");
    }
  };

  return (
    <div className="w-full select-none">
      {/* 1. Hero Showcase Banner (Full width edge-to-edge with smooth swipe) */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full rounded-none overflow-hidden min-h-[155px] sm:min-h-[220px] lg:h-[260px] flex items-center bg-slate-900 group"
        aria-label="Prayog India Featured Robotics Showcase Banner"
      >
        {/* Swipeable Animated Carousel Track */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeSlide.id || currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.95 },
                opacity: { duration: 0.6 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(e, info) => {
                const swipeThreshold = 45;
                if (info.offset.x < -swipeThreshold || info.velocity.x < -350) {
                  paginate(1);
                } else if (info.offset.x > swipeThreshold || info.velocity.x > 350) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 w-full h-full flex items-center cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {/* Full-Bleed Background Image */}
              <img
                src={activeSlide.image}
                alt={activeSlide.alt || "Prayog Banner"}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
                draggable={false}
              />

              {/* Soft Gradient Scrim for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent sm:from-white/95 sm:via-white/75 sm:to-white/10 w-[72%] sm:w-[60%] lg:w-[52%] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent sm:hidden pointer-events-none" />

              {/* Dynamic HTML Content Layer: Real HTML Text & Interactive Buttons */}
              <div className="w-[70%] sm:w-[65%] lg:w-[50%] flex flex-col justify-center py-3 sm:py-6 lg:py-8 pl-4 sm:pl-8 lg:pl-12 xl:pl-16 2xl:pl-20 pr-2 sm:pr-6 z-10 space-y-1 sm:space-y-2.5 text-left relative pointer-events-auto">
                <h1 className="text-[16px] sm:text-2xl lg:text-3xl font-black tracking-tight leading-[1.15] text-[#0F172A]">
                  {activeSlide.titlePrefix}{" "}
                  <span className="text-[#2563EB]">
                    {activeSlide.titleHighlight}
                  </span>
                </h1>

                {activeSlide.description && (
                  <p className="mt-0.5 sm:mt-1 text-slate-700 sm:text-slate-600 text-[10.5px] sm:text-[13px] max-w-[220px] sm:max-w-lg font-medium sm:font-normal leading-snug line-clamp-1 sm:line-clamp-2">
                    {activeSlide.description}
                  </p>
                )}

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-1 z-20">
                  {activeSlide.primaryButtonText && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrimaryClick();
                      }}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.98] text-white font-bold px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[11px] sm:text-xs transition-all duration-150 flex items-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-md shadow-blue-500/25 cursor-pointer group select-none"
                    >
                      <span>{activeSlide.primaryButtonText}</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] text-white transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}

                  {activeSlide.secondaryButtonText && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSecondaryClick();
                      }}
                      className="hidden sm:flex bg-white hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] text-slate-700 hover:text-slate-900 font-bold px-5 py-2.5 rounded-full text-xs border border-slate-200 hover:border-slate-300 transition-all duration-150 items-center gap-2 shadow-2xs cursor-pointer select-none"
                    >
                      <span>{activeSlide.secondaryButtonText}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hover Navigation Arrows (Desktop) */}
        {slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              aria-label="Previous Slide"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-slate-200/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs active:scale-90"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              aria-label="Next Slide"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-slate-200/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs active:scale-90"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Carousel Indicator Dots */}
        {slideCount > 1 && (
          <div className="absolute bottom-2.5 right-3 sm:bottom-4 sm:right-6 lg:right-10 flex items-center gap-1 z-20 bg-white/90 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-200/70 shadow-2xs">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? "w-3 sm:w-5 h-1 sm:h-1.5 bg-[#FFC20E]"
                    : "w-1 sm:w-1.5 h-1 sm:h-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. Premium Trust Badges Bar (Responsive on all viewports) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-2.5 sm:pt-3 pb-1 sm:pb-2">
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl shadow-xs hover:shadow-sm transition-all p-2.5 sm:p-3 lg:p-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {TRUST_STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className={`group/stat flex items-center gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-slate-50/90 transition-all ${
                    idx > 0 ? "lg:pl-4 xl:pl-6" : ""
                  } ${idx >= 2 ? "pt-2.5 sm:pt-2" : ""}`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl ${stat.bg} ${stat.color} border ${stat.border} flex items-center justify-center shrink-0 shadow-2xs group-hover/stat:scale-105 group-hover/stat:shadow-xs transition-all duration-200`}
                  >
                    <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-[13px] font-bold text-slate-900 tracking-tight leading-tight group-hover/stat:text-[#2563EB] transition-colors truncate">
                        {stat.title}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

