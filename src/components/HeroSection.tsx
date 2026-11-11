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
    <div className="w-full select-none border-b border-slate-200">
      {/* 1. Hero Showcase Banner (Full width edge-to-edge, exact 1920:642 aspect ratio so full banner is always 100% visible without any cropping) */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full rounded-none overflow-hidden aspect-[1920/642] flex items-center bg-slate-950 group"
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
              {/* Full-Bleed Background Image (Exact 1920x642 aspect preserves entire banner without cropping) */}
              <img
                src={activeSlide.image}
                alt={activeSlide.alt || "Prayog Banner"}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
                draggable={false}
              />

              {/* Only render HTML Content Layer on desktop/tablets if hasTextOverlay is enabled (on mobile, banner is shown 100% full and clean) */}
              {hasTextOverlay && (
                <div className="hidden sm:flex relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 items-center pointer-events-auto">
                  <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center py-2 sm:py-4 relative z-10">
                    {/* 7 Columns: Text Content */}
                    <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-2 sm:space-y-3 lg:space-y-4">
                      {/* 1. Main Headline First (~3x body text size) */}
                      {(activeSlide.titlePrefix || activeSlide.titleHighlight) && (
                        <motion.h1
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="text-2xl sm:text-3xl lg:text-[44px] font-extrabold tracking-tight leading-tight text-slate-950 font-sans"
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
                        className="space-y-1 sm:space-y-2"
                      >
                        {/* Subtitle with Separators */}
                        {activeSlide.subtitle && (
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
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
                        className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 z-20"
                      >
                        {activeSlide.primaryButtonText && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrimaryClick();
                            }}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold px-5 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer select-none group"
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
                            className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-semibold px-4 sm:px-5 lg:px-7 py-2 sm:py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm border border-slate-200/90 hover:border-slate-300 transition-all duration-150 flex items-center gap-2 shadow-2xs cursor-pointer select-none"
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
              className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-slate-200/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs active:scale-90"
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
              className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-slate-200/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs active:scale-90"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Carousel Indicator Dots */}
        {slideCount > 1 && (
          <div className="absolute bottom-2 right-2.5 sm:bottom-4 sm:right-6 lg:right-10 flex items-center gap-1 z-20 bg-white/90 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-200/70 shadow-2xs">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? "w-2.5 sm:w-5 h-1 sm:h-1.5 bg-[#2563EB]"
                    : "w-1 sm:w-1.5 h-1 sm:h-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

