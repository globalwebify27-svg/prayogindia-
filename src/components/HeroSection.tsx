"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
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

const TRUST_TAGS = [
  {
    label: "Fast Delivery",
    subtext: "Pan-India Express Shipping",
    renderIcon: () => (
      <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orange motion trails */}
        <path d="M2.5 10H6.5" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M1 14H5" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M3 18H7" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
        {/* Main truck cargo box */}
        <rect x="7" y="7.5" width="10" height="11" rx="1.2" fill="#005CA9" />
        {/* Truck cabin */}
        <path d="M17 11H21.5L24 14.5V18.5H17V11Z" fill="#005CA9" />
        {/* Cabin window */}
        <path d="M18.2 12.5H21.2L22.8 14.8H18.2V12.5Z" fill="#E0F2FE" />
        {/* Wheels */}
        <circle cx="10.5" cy="19" r="2.4" fill="#0B1E3B" stroke="#FFFFFF" strokeWidth="1.2" />
        <circle cx="20.5" cy="19" r="2.4" fill="#0B1E3B" stroke="#FFFFFF" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "100% Genuine",
    subtext: "Certified & Tested Products",
    renderIcon: () => (
      <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 3.5L5.5 7V13.5C5.5 19.5 9.2 24.5 14 26C18.8 24.5 22.5 19.5 22.5 13.5V7L14 3.5Z"
          fill="url(#genuineShieldGradient)"
          stroke="#005CA9"
          strokeWidth="1.2"
        />
        <path
          d="M10 13.5L12.8 16.5L18 10.5"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="genuineShieldGradient" x1="14" y1="3.5" x2="14" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284C7" />
            <stop offset="1" stopColor="#004F94" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    label: "Secure Payments",
    subtext: "Safe & Secure Checkout",
    renderIcon: () => (
      <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lock Shackle */}
        <path
          d="M8.5 12V8.5C8.5 5.46243 10.9624 3 14 3C17.0376 3 19.5 5.46243 19.5 8.5V12"
          stroke="#0284C7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Lock Body */}
        <rect
          x="6.5"
          y="12"
          width="15"
          height="12.5"
          rx="3"
          fill="url(#secureLockGradient)"
          stroke="#005CA9"
          strokeWidth="1.2"
        />
        {/* Keyhole */}
        <circle cx="14" cy="17" r="1.8" fill="#FFFFFF" />
        <path d="M13.2 18H14.8L15.1 21H12.9L13.2 18Z" fill="#FFFFFF" />
        <defs>
          <linearGradient id="secureLockGradient" x1="14" y1="12" x2="14" y2="24.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284C7" />
            <stop offset="1" stopColor="#004F94" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    label: "Expert Support",
    subtext: "Technical Engineering Help",
    renderIcon: () => (
      <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Headset arc */}
        <path
          d="M5.5 14.5C5.5 9.80558 9.30558 6 14 6C18.6944 6 22.5 9.80558 22.5 14.5"
          stroke="#005CA9"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Left Earpad */}
        <rect x="4" y="12.5" width="3.5" height="7.5" rx="1.75" fill="#005CA9" />
        {/* Right Earpad */}
        <rect x="20.5" y="12.5" width="3.5" height="7.5" rx="1.75" fill="#005CA9" />
        {/* Microphone boom */}
        <path
          d="M22 17.5V20C22 21.6569 20.6569 23 19 23H15.5"
          stroke="#005CA9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Orange mic tip */}
        <circle cx="13.5" cy="23" r="2.2" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    label: "Easy Replacement",
    subtext: "7-Day Hassle-Free Returns",
    renderIcon: () => (
      <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top clockwise arrow */}
        <path
          d="M5.5 14C5.5 9.3 9.3 5.5 14 5.5C16.8 5.5 19.3 6.9 20.8 9"
          stroke="#0284C7"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M21.5 5V9.5H17" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Bottom counter-clockwise arrow */}
        <path
          d="M22.5 14C22.5 18.7 18.7 22.5 14 22.5C11.2 22.5 8.7 21.1 7.2 19"
          stroke="#0284C7"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M6.5 23V18.5H11" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* 3D Isometric orange box in center */}
        {/* Top face */}
        <path d="M14 9.5L17.5 11.5L14 13.5L10.5 11.5L14 9.5Z" fill="#FDBA74" stroke="#EA580C" strokeWidth="0.8" />
        {/* Left face */}
        <path d="M10.5 11.5L14 13.5V17.5L10.5 15.5V11.5Z" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />
        {/* Right face */}
        <path d="M14 13.5L17.5 11.5V15.5L14 17.5V13.5Z" fill="#EA580C" stroke="#C2410C" strokeWidth="0.8" />
        {/* Box white tape/seam */}
        <path d="M14 10.5L14 16.5" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const HeroSection: React.FC<HeroProps> = ({
  onExploreProducts,
  onExploreSolutions,
}) => {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
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
        const res = await fetch(`/api/banners?activeOnly=true&_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
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

  // Drag detection ref to differentiate between swipe and click
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Determine whether this slide should display HTML text overlay or show the raw clean graphic banner
  const isTextEmpty = (str?: string) =>
    !str || str.trim() === "" || str.trim() === "." || str.trim() === "-";

  const hasTitleOrDesc =
    !isTextEmpty(activeSlide.titlePrefix) ||
    !isTextEmpty(activeSlide.titleHighlight) ||
    Boolean(activeSlide.subtitle && activeSlide.subtitle.trim().length > 1) ||
    Boolean(activeSlide.description && !isTextEmpty(activeSlide.description) && activeSlide.description.trim().length > 3);

  const hasButtons =
    !isTextEmpty(activeSlide.primaryButtonText) ||
    !isTextEmpty(activeSlide.secondaryButtonText);

  const hasTextOverlay =
    activeSlide.showTextOverlay === true ||
    (activeSlide.showTextOverlay !== false && (hasTitleOrDesc || hasButtons));

  const handlePrimaryClick = () => {
    const targetLink = activeSlide.primaryButtonLink?.trim() || "/products";
    if (targetLink.startsWith("http://") || targetLink.startsWith("https://")) {
      window.open(targetLink, "_blank");
      return;
    }
    if (onExploreProducts && targetLink === "/products") {
      onExploreProducts();
    } else {
      router.push(targetLink);
    }
  };

  const handleSecondaryClick = () => {
    const targetLink = activeSlide.secondaryButtonLink?.trim();
    if (targetLink) {
      if (targetLink.startsWith("http://") || targetLink.startsWith("https://")) {
        window.open(targetLink, "_blank");
        return;
      }
      if (onExploreSolutions && targetLink === "/services") {
        onExploreSolutions();
        return;
      }
      router.push(targetLink);
      return;
    }
    if (onExploreSolutions) {
      onExploreSolutions();
    } else {
      router.push("/services");
    }
  };

  return (
    <div className="w-full select-none">
      {/* 1. Hero Showcase Banner (Full width edge-to-edge, click anywhere opens products page) */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full rounded-none overflow-hidden aspect-[2.4/1] sm:aspect-[2.8/1] md:aspect-[3.2/1] lg:aspect-[3.5/1] xl:aspect-[3.8/1] min-h-[220px] max-h-[520px] flex items-center bg-slate-950 group"
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
              onDragStart={(_, info) => {
                dragStartPos.current = { x: info.point.x, y: info.point.y };
                isDraggingRef.current = false;
              }}
              onDrag={(_, info) => {
                const dx = Math.abs(info.point.x - dragStartPos.current.x);
                if (dx > 8) {
                  isDraggingRef.current = true;
                }
              }}
              onDragEnd={(_, info) => {
                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 80);
                const swipeThreshold = 45;
                if (info.offset.x < -swipeThreshold || info.velocity.x < -350) {
                  paginate(1);
                } else if (info.offset.x > swipeThreshold || info.velocity.x > 350) {
                  paginate(-1);
                }
              }}
              onClick={() => {
                if (isDraggingRef.current) return;
                handlePrimaryClick();
              }}
              className="absolute inset-0 w-full h-full flex items-center cursor-pointer select-none touch-pan-y"
              title={`Click to open ${activeSlide.primaryButtonText || "Products"}`}
            >
              {/* Full-Bleed Background Image */}
              <img
                src={activeSlide.image}
                alt={activeSlide.alt || "Prayog Banner"}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
                draggable={false}
              />

              {/* Only render HTML Content Layer if hasTextOverlay is enabled */}
              {hasTextOverlay && (
                <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center pointer-events-auto">
                  <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-4">
                    {/* 7 Columns: Text Content */}
                    <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-3 sm:space-y-4">
                      {/* 1. Main Headline First (~3x body text size) */}
                      {(activeSlide.titlePrefix || activeSlide.titleHighlight) && (
                        <motion.h1
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="text-2xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.12] text-slate-950 font-sans"
                        >
                          {activeSlide.titlePrefix}{" "}
                          {activeSlide.titleHighlight && (
                            <span className="text-[#2563EB] block sm:inline">
                              {activeSlide.titleHighlight}
                            </span>
                          )}
                        </motion.h1>
                      )}

                      {/* 2. Supporting text immediately after headline */}
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: prefersReducedMotion ? 0 : 0.08,
                          ease: "easeOut",
                        }}
                        className="space-y-2"
                      >
                        {/* Subtitle with Separators */}
                        {activeSlide.subtitle && (
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
                            {activeSlide.subtitle
                              .split("|")
                              .map((p) => p.trim())
                              .filter(Boolean)
                              .map((word, idx, arr) => (
                                <React.Fragment key={idx}>
                                  <span
                                    className={
                                      idx === arr.length - 1
                                        ? "text-[#2563EB]"
                                        : "text-slate-800"
                                    }
                                  >
                                    {word}
                                  </span>
                                  {idx < arr.length - 1 && (
                                    <span className="text-slate-300 font-light">•</span>
                                  )}
                                </React.Fragment>
                              ))}
                          </div>
                        )}

                        {/* Description */}
                        {activeSlide.description && !isTextEmpty(activeSlide.description) && (
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
                            {activeSlide.description}
                          </p>
                        )}
                      </motion.div>

                      {/* 3. CTA Action Buttons animated after supporting text */}
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: prefersReducedMotion ? 0 : 0.16,
                          ease: "easeOut",
                        }}
                        className="flex items-center gap-3 pt-1 z-20"
                      >
                        {activeSlide.primaryButtonText && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrimaryClick();
                            }}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer select-none group"
                          >
                            <span>{activeSlide.primaryButtonText}</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] text-white transition-transform group-hover:translate-x-0.5" />
                          </button>
                        )}

                        {activeSlide.secondaryButtonText && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSecondaryClick();
                            }}
                            className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-semibold px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm border border-slate-200/90 hover:border-slate-300 transition-all duration-150 flex items-center gap-2 shadow-2xs cursor-pointer select-none"
                          >
                            <span>{activeSlide.secondaryButtonText}</span>
                          </button>
                        )}
                      </motion.div>
                    </div>

                    {/* 5 Columns: Visual Image Content */}
                    <div className="hidden lg:flex lg:col-span-5 items-center justify-center p-2 relative h-full">
                      <div className="relative w-full h-[240px] xl:h-[280px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 bg-white/40">
                        <img
                          src={activeSlide.image}
                          alt={activeSlide.alt || "Prayog Robotics"}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    ? "w-3 sm:w-5 h-1 sm:h-1.5 bg-[#2563EB]"
                    : "w-1 sm:w-1.5 h-1 sm:h-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Premium Trust Signals Bar — Full Width of Screen */}
      <div className="w-full bg-white border-y border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] py-3 sm:py-4 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full flex items-center overflow-x-auto no-scrollbar justify-start md:justify-between">
          {TRUST_TAGS.map((tag, idx) => (
            <React.Fragment key={tag.label}>
              <div className="flex-1 min-w-[215px] md:min-w-0 flex items-center justify-start md:justify-center gap-3.5 sm:gap-4 px-3 sm:px-4 lg:px-6 py-1 group cursor-default select-none shrink-0 md:shrink">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#C7DFFF] border border-[#BFDBFE] shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),0_2px_8px_rgba(37,99,235,0.12)] group-hover:scale-105 group-hover:shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_4px_14px_rgba(37,99,235,0.22)] transition-all duration-300">
                  {tag.renderIcon()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13.5px] sm:text-[14.5px] font-extrabold text-[#0B1E3B] tracking-tight group-hover:text-[#005CA9] transition-colors leading-tight">
                    {tag.label}
                  </span>
                  <span className="text-[11px] sm:text-[12px] text-slate-500 font-medium mt-1 whitespace-nowrap leading-tight">
                    {tag.subtext}
                  </span>
                </div>
              </div>
              {idx < TRUST_TAGS.length - 1 && (
                <div className="hidden md:block w-px h-9 lg:h-10 bg-slate-200/80 shrink-0 self-center" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

