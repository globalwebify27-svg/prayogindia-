"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
} from "@/lib/cloudinaryUrl";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
  media360?: string[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  videoUrl,
  media360 = [],
}) => {
  const galleryImages = (images || [])
    .filter(Boolean)
    .map((img) => getOptimizedImageUrl(img, { width: 1200, quality: "auto" }));

  const optimizedVideoUrl = videoUrl
    ? getOptimizedVideoUrl(videoUrl)
    : undefined;

  const hasVideo = !!videoUrl;
  const has360 = media360.length > 0;

  // Slide indices
  const videoSlideIndex = hasVideo ? galleryImages.length : -1;
  const media360SlideIndex = has360
    ? galleryImages.length + (hasVideo ? 1 : 0)
    : -1;
  const totalSlides =
    galleryImages.length + (hasVideo ? 1 : 0) + (has360 ? 1 : 0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  // Navigate to slide and pause video if navigating away from it
  const goToSlide = useCallback(
    (idx: number) => {
      if (totalSlides <= 0) return;
      const safeIdx = (idx + totalSlides) % totalSlides;
      if (safeIdx !== videoSlideIndex && videoRef.current) {
        videoRef.current.pause();
      }
      setCurrentIndex(safeIdx);
      setDragOffset(0);
      setIsDragging(false);
    },
    [totalSlides, videoSlideIndex],
  );

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Autoplay video on entering video slide
  useEffect(() => {
    if (currentIndex === videoSlideIndex && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted by browser policy; user can click play
      });
    }
  }, [currentIndex, videoSlideIndex]);

  // ── Touch Gesture Handlers (Mobile & Tablet) ──
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    // If user touches near bottom of video player (native controls), don't intercept
    if (currentIndex === videoSlideIndex && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (touch.clientY - rect.top > rect.height * 0.72) {
        return;
      }
    }
    isPointerDownRef.current = true;
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    currentXRef.current = touch.clientX;
    isHorizontalSwipeRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;

    // Detect direction of gesture
    if (isHorizontalSwipeRef.current === null) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      if (absX > 6 || absY > 6) {
        isHorizontalSwipeRef.current = absX > absY;
      }
    }

    if (isHorizontalSwipeRef.current === true) {
      setIsDragging(true);
      currentXRef.current = touch.clientX;
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (isHorizontalSwipeRef.current === true) {
      const diffX = currentXRef.current - startXRef.current;
      const swipeThreshold = 35;
      if (diffX < -swipeThreshold) {
        nextSlide();
      } else if (diffX > swipeThreshold) {
        prevSlide();
      } else {
        setDragOffset(0);
        setIsDragging(false);
      }
    } else {
      setDragOffset(0);
      setIsDragging(false);
    }
    isHorizontalSwipeRef.current = null;
  };

  // ── Trackpad Horizontal Swipe Handler (Mac & Laptop Trackpads) ──
  const isWheelThrottledRef = useRef(false);
  const wheelDeltaAccumulatorRef = useRef(0);
  const wheelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Detect horizontal trackpad swipe gesture
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 6) {
      if (isWheelThrottledRef.current) return;

      wheelDeltaAccumulatorRef.current += e.deltaX;

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        wheelDeltaAccumulatorRef.current = 0;
      }, 180);

      const threshold = 25;
      if (wheelDeltaAccumulatorRef.current > threshold) {
        isWheelThrottledRef.current = true;
        wheelDeltaAccumulatorRef.current = 0;
        nextSlide();
        setTimeout(() => {
          isWheelThrottledRef.current = false;
        }, 400);
      } else if (wheelDeltaAccumulatorRef.current < -threshold) {
        isWheelThrottledRef.current = true;
        wheelDeltaAccumulatorRef.current = 0;
        prevSlide();
        setTimeout(() => {
          isWheelThrottledRef.current = false;
        }, 400);
      }
    }
  };

  // ── Mouse Drag Handlers (Desktop) ──
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select")) return;
    if (currentIndex === videoSlideIndex && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (e.clientY - rect.top > rect.height * 0.72) {
        return;
      }
    }

    e.preventDefault(); // Prevents native image ghost drag & selection
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(false);
  };

  // Global mouse tracking so dragging continues smoothly even if cursor leaves container
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isPointerDownRef.current) return;
      const diffX = e.clientX - startXRef.current;
      if (Math.abs(diffX) > 6) {
        setIsDragging(true);
        currentXRef.current = e.clientX;
        setDragOffset(diffX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      const diffX = currentXRef.current - startXRef.current;
      const swipeThreshold = 35;
      if (diffX < -swipeThreshold) {
        nextSlide();
      } else if (diffX > swipeThreshold) {
        prevSlide();
      } else {
        setDragOffset(0);
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [currentIndex, totalSlides, nextSlide, prevSlide]);

  return (
    <div className="flex flex-col w-full space-y-3">
      {/* ── Main Media Canvas ── */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onDragStart={(e) => e.preventDefault()}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 group flex items-center justify-center shrink-0 select-none cursor-grab active:cursor-grabbing touch-pan-y shadow-xs"
      >
        {/* Top Badges & Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur-xs text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs select-none border border-emerald-100/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Genuine Hardware</span>
            </div>
          </div>
          {currentIndex === videoSlideIndex && (
            <button
              type="button"
              onClick={() => goToSlide(0)}
              className="pointer-events-auto bg-white/95 hover:bg-white text-slate-800 hover:text-[#2563EB] backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md border border-slate-200 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#2563EB]" />
              <span>Back to Images</span>
            </button>
          )}
        </div>

        {/* Unified Slides Track (Smooth CSS Transform with Touch/Drag Support) */}
        {totalSlides === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-8 text-center">
            <span className="text-xs text-slate-400 font-bold">No product media uploaded</span>
          </div>
        ) : (
          <div
            className="flex w-full h-full"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging
                ? "none"
                : "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)",
              willChange: "transform",
            }}
          >
            {/* 1. Image Slides */}
            {galleryImages.map((img, idx) => (
              <div
                key={`img-${idx}`}
                className="min-w-full w-full h-full shrink-0 relative overflow-hidden"
              >
                <Image
                  src={img}
                  alt={`${productName} image ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </div>
            ))}

            {/* 2. Video Slide */}
            {hasVideo && optimizedVideoUrl && (
              <div
                key="video-slide"
                className="min-w-full w-full h-full shrink-0 relative flex items-center justify-center bg-slate-950 p-2 select-none"
              >
                <video
                  ref={videoRef}
                  src={optimizedVideoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain rounded-xl"
                />
                {/* Swipeable gesture zone over video (bottom 64px left open for native playbar/volume) */}
                <div
                  className="absolute inset-x-0 top-0 bottom-16 z-10 cursor-grab active:cursor-grabbing"
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                      } else {
                        videoRef.current.pause();
                      }
                    }
                  }}
                />
              </div>
            )}

            {/* 3. 360° Interactive Slide */}
            {has360 && (
              <div
                key="360-slide"
                className="min-w-full w-full h-full shrink-0 relative flex flex-col items-center justify-center gap-3 bg-slate-50/50 p-4"
              >
                <div className="relative w-full h-48 flex items-center justify-center">
                  <Image
                    src={media360[0] || galleryImages[0]}
                    alt="360 view model"
                    fill
                    className="object-contain animate-pulse"
                  />
                </div>
                <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <RotateCcw className="w-3.5 h-3.5 text-[#2563EB] animate-spin-slow" />
                  <span>360° Interactive View Mode</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prev / Next Chevrons */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-slate-700 hover:text-[#2563EB] rounded-full shadow-xs border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer z-20 opacity-70 group-hover:opacity-100"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-slate-700 hover:text-[#2563EB] rounded-full shadow-xs border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer z-20 opacity-70 group-hover:opacity-100"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail Strip ── */}
      {totalSlides > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pt-1 pb-1 px-0.5 shrink-0">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden transition-all bg-white cursor-pointer ${
                currentIndex === idx
                  ? "border-2 border-[#2563EB] shadow-xs ring-2 ring-blue-500/20"
                  : "border border-slate-200/80 hover:border-slate-300 opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}

          {/* 360° View Thumbnail */}
          {has360 && media360SlideIndex !== -1 && (
            <button
              type="button"
              onClick={() => goToSlide(media360SlideIndex)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                currentIndex === media360SlideIndex
                  ? "bg-slate-900 border-2 border-[#2563EB] shadow-xs ring-2 ring-blue-500/20"
                  : "bg-slate-900 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/40 flex items-center justify-center">
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2563EB]" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-white tracking-tight">
                360° View
              </span>
            </button>
          )}

          {/* Video Thumbnail */}
          {hasVideo && videoSlideIndex !== -1 && (
            <button
              type="button"
              onClick={() => goToSlide(videoSlideIndex)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                currentIndex === videoSlideIndex
                  ? "bg-slate-900 border-2 border-[#2563EB] shadow-xs ring-2 ring-blue-500/20"
                  : "bg-slate-900 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/40 flex items-center justify-center">
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-white translate-x-0.5" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-white tracking-tight">
                Video
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
