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
    subtitle: "100% Genuine",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    subtitle: "Across India",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    subtitle: "Technical Assistance",
  },
  {
    icon: Users,
    title: "Trusted by 10K+",
    subtitle: "Students & Institutions",
  },
];

export const HeroSection: React.FC<HeroProps> = ({
  onExploreProducts,
  onExploreSolutions,
}) => {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = slides.length;

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

  // Auto-play interval with hover pause
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
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
    <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-2 sm:pt-3 pb-0.5 sm:pb-2 select-none space-y-2 sm:space-y-3">
      {/* 1. Hero Showcase Banner (Mobile Compact Aspect Ratio & Desktop Full-Bleed) */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden min-h-[145px] sm:min-h-[220px] lg:h-[240px] flex items-center bg-slate-900 shadow-2xs"
        aria-label="Prayog India Featured Robotics Showcase Banner"
      >
        {/* Full-Bleed Background Image (Covers 100% of the Card) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`bg-img-${activeSlide.id}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.alt || "Prayog Banner"}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Intelligent Soft Gradient Scrim: Preserves artwork while ensuring 100% text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent sm:from-white/95 sm:via-white/75 sm:to-white/10 w-[68%] sm:w-[60%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent sm:hidden" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic HTML Content Layer: Real HTML Text & Interactive Buttons (NOT an Image) */}
        <div className="w-[66%] sm:w-[68%] lg:w-[54%] flex flex-col justify-center py-2.5 sm:py-5 lg:py-6 pl-3.5 sm:pl-7 lg:pl-10 pr-2 sm:pr-6 z-10 space-y-1 sm:space-y-2 text-left relative">
          {/* Main Headline & Description (Real HTML Text) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-${activeSlide.id}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              <h1 className="text-[15px] sm:text-2xl lg:text-[28px] font-black tracking-tight leading-[1.15] text-[#0F172A]">
                {activeSlide.titlePrefix}{" "}
                <span className="text-[#2563EB]">
                  {activeSlide.titleHighlight}
                </span>
              </h1>

              {activeSlide.description && (
                <p className="mt-0.5 sm:mt-1 text-slate-700 sm:text-slate-600 text-[10px] sm:text-[12.5px] max-w-[190px] sm:max-w-lg font-medium sm:font-normal leading-snug line-clamp-1 sm:line-clamp-2">
                  {activeSlide.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-1 z-20">
            {activeSlide.primaryButtonText && (
              <button
                onClick={handlePrimaryClick}
                className="bg-[#FFC20E] hover:bg-[#E5AC0D] active:scale-[0.98] text-slate-950 font-bold px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-[11px] sm:text-xs transition-all duration-150 flex items-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-md cursor-pointer group"
              >
                <span>{activeSlide.primaryButtonText}</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] text-slate-950 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {activeSlide.secondaryButtonText && (
              <button
                onClick={handleSecondaryClick}
                className="hidden sm:flex bg-white/95 hover:bg-white active:scale-[0.98] text-[#2563EB] font-bold px-5 py-2.5 rounded-full text-xs border-2 border-blue-400 hover:border-blue-500 hover:bg-blue-50/80 transition-all duration-150 items-center gap-2 shadow-2xs cursor-pointer backdrop-blur-xs"
              >
                <span>{activeSlide.secondaryButtonText}</span>
              </button>
            )}
          </div>
        </div>

        {/* Carousel Indicator Dots */}
        {slideCount > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3.5 sm:right-4 flex items-center gap-1 z-20 bg-white/90 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-200/70 shadow-2xs">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
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

      {/* 2. Trust Badges Strip (Shown on Desktop, Hidden on Mobile for clean direct discovery) */}
      <div className="hidden sm:block w-full bg-transparent py-2">
        <div className="grid grid-cols-4 gap-4 lg:gap-5 items-center">
          {TRUST_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`flex items-center gap-2.5 lg:gap-3 py-1 ${
                  idx < TRUST_STATS.length - 1
                    ? "border-r border-slate-100 pr-2 lg:pr-4"
                    : ""
                }`}
              >
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] lg:text-[13px] font-bold text-slate-900 leading-tight whitespace-nowrap">
                    {stat.title}
                  </div>
                  <div className="text-[10px] lg:text-[11px] text-slate-500 font-medium leading-tight whitespace-nowrap">
                    {stat.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

