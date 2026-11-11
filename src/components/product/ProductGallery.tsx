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
  Compass,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";

// Crisp high-DPI Prayog blue & white glass magnifying cursor with lens glare (fallback to native zoom-in)
const MAGNIFIER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Ccircle cx='13' cy='13' r='8.5' stroke='%23005CA9' stroke-width='2.4' fill='rgba(0,174,239,0.15)'/%3E%3Ccircle cx='13' cy='13' r='6.5' stroke='white' stroke-width='1.2'/%3E%3Ccircle cx='10.5' cy='10.5' r='2' fill='white' opacity='0.85'/%3E%3Cpath d='M19.5 19.5L27 27' stroke='%23005CA9' stroke-width='3.2' stroke-linecap='round'/%3E%3Cpath d='M19.5 19.5L27 27' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 13 13, zoom-in`;

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

  // ── Hover Magnifier State ──
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // ── Fullscreen Lightbox Modal State ──
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const handleContainerMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || isPointerDownRef.current || currentIndex >= galleryImages.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setHoverPos({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
      setIsHovering(true);
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only magnify when on static image slides and not dragging
    if (isDragging || isPointerDownRef.current || currentIndex >= galleryImages.length) {
      if (isHovering) setIsHovering(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setHoverPos({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
      if (!isHovering) setIsHovering(true);
    }
  };

  const handleContainerMouseLeave = () => {
    setIsHovering(false);
  };

  // ── 360° Media Interactive State ──
  const [angle360, setAngle360] = useState(0);
  const [isAutoRotate360, setIsAutoRotate360] = useState(false);
  const is360DraggingRef = useRef(false);
  const start360XRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  // Auto-rotate 360 loop
  useEffect(() => {
    if (!isAutoRotate360 || currentIndex !== media360SlideIndex) return;
    const interval = setInterval(() => {
      setAngle360((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotate360, currentIndex, media360SlideIndex]);

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
      setIsHovering(false);
      setHoverPos({ x: 50, y: 50 });
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

  // Keyboard navigation for Lightbox Modal
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, prevSlide, nextSlide]);

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
      {/* ── Main Media Canvas (Full bleed edge-to-edge on mobile, rounded card on tablet/desktop) ── */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleContainerMouseEnter}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
        onWheel={handleWheel}
        onDragStart={(e) => e.preventDefault()}
        onClick={() => {
          if (!isDragging && currentIndex < galleryImages.length) {
            setIsLightboxOpen(true);
          }
        }}
        className="relative w-[calc(100%+2rem)] sm:w-full -mx-4 sm:mx-0 aspect-[4/3] rounded-none sm:rounded-2xl overflow-hidden bg-slate-100 border-b border-slate-200/60 sm:border-b-0 group flex items-center justify-center shrink-0 select-none touch-pan-y"
        style={{
          cursor:
            currentIndex < galleryImages.length && !isDragging
              ? MAGNIFIER_CURSOR
              : isDragging
                ? "grabbing"
                : "grab",
        }}
      >
        {/* Top Badges & Controls Overlay */}
        {currentIndex === videoSlideIndex && (
          <div className="absolute top-3 right-3 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={() => goToSlide(0)}
              className="bg-white/95 hover:bg-white text-slate-800 hover:text-[#2563EB] backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md border border-slate-200 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#2563EB]" />
              <span>Back to Images</span>
            </button>
          </div>
        )}

        {/* Mobile Slide Counter Badge */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 right-3 sm:hidden bg-slate-900/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs z-20 pointer-events-none">
            {currentIndex + 1} / {totalSlides}
          </div>
        )}

        {/* Mobile Pagination Indicator Dots */}
        {totalSlides > 1 && totalSlides <= 8 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 sm:hidden pointer-events-none">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === i ? "w-4 bg-[#005CA9]" : "w-1.5 bg-slate-400/60"
                }`}
              />
            ))}
          </div>
        )}

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
                  sizes="(max-width: 768px) 100vw, 850px"
                  style={{
                    transformOrigin:
                      idx === currentIndex ? `${hoverPos.x}% ${hoverPos.y}%` : "50% 50%",
                    transform:
                      isHovering && !isDragging && idx === currentIndex
                        ? "scale(2.5)"
                        : "scale(1)",
                    transition:
                      isHovering && !isDragging && idx === currentIndex
                        ? "transform-origin 0.05s linear, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
                        : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className="w-full h-full object-cover pointer-events-none select-none will-change-transform"
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
                className="min-w-full w-full h-full shrink-0 relative flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-50 to-slate-100 p-4 select-none"
                onMouseDown={(e) => {
                  is360DraggingRef.current = true;
                  start360XRef.current = e.clientX;
                }}
                onMouseMove={(e) => {
                  if (!is360DraggingRef.current) return;
                  const diff = e.clientX - start360XRef.current;
                  start360XRef.current = e.clientX;
                  setAngle360((prev) => (prev - diff * 0.8 + 360) % 360);
                }}
                onMouseUp={() => { is360DraggingRef.current = false; }}
                onMouseLeave={() => { is360DraggingRef.current = false; }}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    is360DraggingRef.current = true;
                    start360XRef.current = e.touches[0].clientX;
                  }
                }}
                onTouchMove={(e) => {
                  if (!is360DraggingRef.current || e.touches.length !== 1) return;
                  const diff = e.touches[0].clientX - start360XRef.current;
                  start360XRef.current = e.touches[0].clientX;
                  setAngle360((prev) => (prev - diff * 0.8 + 360) % 360);
                }}
                onTouchEnd={() => { is360DraggingRef.current = false; }}
              >
                <div className="relative w-full h-44 sm:h-48 flex items-center justify-center cursor-ew-resize">
                  {(() => {
                    const frameIndex = media360.length > 1
                      ? Math.floor((angle360 / 360) * media360.length) % media360.length
                      : 0;
                    const current360Img = media360[frameIndex] || galleryImages[0];
                    return (
                      <div
                        className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
                        style={{
                          transform: media360.length <= 1 ? `rotateY(${angle360}deg)` : undefined,
                          perspective: "800px",
                        }}
                      >
                        <Image
                          src={current360Img}
                          alt="360 view model"
                          fill
                          className="object-contain pointer-events-none"
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* 360 Controls & Angle Indicator */}
                <div className="flex items-center gap-2 z-10 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-900/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{Math.round(angle360)}°</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutoRotate360((v) => !v)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isAutoRotate360
                        ? "bg-[#005CA9] text-white"
                        : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <RotateCcw className={`w-3 h-3 ${isAutoRotate360 ? "animate-spin" : ""}`} />
                    <span>{isAutoRotate360 ? "Pause Spin" : "Auto Spin"}</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
                    Drag horizontally to inspect 360°
                  </span>
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

      {/* ── High-Resolution Lightbox Modal with Zoom Controls ── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => {
            setIsLightboxOpen(false);
            setLightboxZoom(1);
          }}
        >
          {/* Top Control Bar */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {productName}
              </span>
              {galleryImages.length > 0 && (
                <span className="text-xs text-white/60 font-mono">
                  ({currentIndex + 1} of {galleryImages.length})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Buttons */}
              <div className="flex items-center bg-white/10 rounded-full border border-white/20 p-0.5">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                  className="p-1.5 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2.5 text-white">
                  {lightboxZoom}×
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(4, +(z + 0.5).toFixed(1)))}
                  className="p-1.5 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Reset Zoom */}
              {lightboxZoom > 1 && (
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="px-2.5 py-1 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition cursor-pointer"
                >
                  Reset
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(1);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition border border-white/20 cursor-pointer ml-1"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full h-full max-h-[75vh] flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${lightboxZoom})` }}
            >
              {galleryImages[currentIndex] && (
                <Image
                  src={galleryImages[currentIndex]}
                  alt={`${productName} full preview`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              )}
            </div>

            {/* Prev / Next Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                    setLightboxZoom(1);
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                    setLightboxZoom(1);
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-3xl p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/15"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(i);
                    setLightboxZoom(1);
                  }}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    currentIndex === i
                      ? "border-[#00AEEF] scale-105 shadow-md ring-2 ring-sky-400/30"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`thumb-${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
