"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
} from "@/lib/cloudinaryUrl";
import {
  Play,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  ImageOff,
} from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
  media360?: string[];
}

type MediaMode = "image" | "video" | "360";

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  videoUrl,
  media360 = [],
}) => {
  const galleryImages = (
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
        ]
  ).map((img) => getOptimizedImageUrl(img, { width: 1200, quality: "auto" }));

  const optimizedVideoUrl = videoUrl
    ? getOptimizedVideoUrl(videoUrl)
    : undefined;

  const [activeMode, setActiveMode] = useState<MediaMode>("image");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Zoom / Pan state (lightbox only)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Hover zoom (main image)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const hasVideo = !!videoUrl;
  const has360 = media360.length > 0;

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mainImageRef.current || activeMode !== "image") return;
      const rect = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [activeMode],
  );

  const prevImage = () => {
    setSelectedIdx(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const nextImage = () => {
    setSelectedIdx((prev) => (prev + 1) % galleryImages.length);
  };

  const prevLightbox = () => {
    setLightboxIdx(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const nextLightbox = () => {
    setLightboxIdx((prev) => (prev + 1) % galleryImages.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleLightboxMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
  };

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPanOffset({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handleLightboxMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="space-y-4">
      {/* ── Media Mode Tabs ── */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveMode("image")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
            activeMode === "image"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ZoomIn className="w-3 h-3" /> Photos
        </button>
        {hasVideo && (
          <button
            onClick={() => setActiveMode("video")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
              activeMode === "video"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Play className="w-3 h-3" /> Video
          </button>
        )}
        {has360 && (
          <button
            onClick={() => setActiveMode("360")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
              activeMode === "360"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <RotateCcw className="w-3 h-3" /> 360°
          </button>
        )}
      </div>

      {/* ── Main Media Viewer ── */}
      <div
        ref={mainImageRef}
        className="relative h-80 sm:h-96 md:h-[460px] w-full rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 group"
      >
        {activeMode === "image" && (
          <>
            {/* Main Image */}
            <Image
              src={galleryImages[selectedIdx]}
              alt={`${productName} image ${selectedIdx + 1}`}
              fill
              priority
              className="object-contain p-4"
            />

            {/* Prev/Next arrows (only when multiple images) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#00AEEF] transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#00AEEF] transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-slate-900/70 text-white text-[9px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                {selectedIdx + 1} / {galleryImages.length}
              </div>
            )}
          </>
        )}

        {activeMode === "video" && optimizedVideoUrl && (
          <video
            src={optimizedVideoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover rounded-3xl"
          />
        )}

        {activeMode === "360" && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 select-none">
            <RotateCcw className="w-14 h-14 animate-spin-slow text-slate-300" />
            <div className="text-center">
              <div className="text-sm font-bold text-slate-600">
                360° Interactive View
              </div>
              <div className="text-xs text-slate-400">
                Drag left/right to rotate the model
              </div>
            </div>
            {media360.length > 0 && (
              <img
                src={media360[0]}
                alt="360 view"
                className="absolute inset-0 w-full h-full object-contain p-4"
              />
            )}
          </div>
        )}
      </div>

      {/* ── Thumbnail Strip ── */}
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1 px-0.5">
        {galleryImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedIdx(idx);
              setActiveMode("image");
            }}
            className={`relative w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-slate-50 cursor-pointer ${
              activeMode === "image" && selectedIdx === idx
                ? "border-[#00AEEF] ring-2 ring-[#00AEEF]/20 shadow-md scale-105"
                : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-contain p-1"
            />
          </button>
        ))}

        {hasVideo && (
          <button
            onClick={() => setActiveMode("video")}
            className={`relative w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeMode === "video"
                ? "bg-slate-900 border-[#00AEEF] ring-2 ring-[#00AEEF]/20 shadow-md scale-105"
                : "bg-slate-800 border-slate-600 opacity-70 hover:opacity-100"
            }`}
          >
            <Play className="w-5 h-5 fill-[#FFC20E] text-[#FFC20E]" />
            <span className="text-[8px] font-black uppercase text-white tracking-wider">
              Video
            </span>
          </button>
        )}

        {has360 && (
          <button
            onClick={() => setActiveMode("360")}
            className={`relative w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeMode === "360"
                ? "bg-purple-900 border-purple-400 ring-2 ring-purple-400/20 shadow-md scale-105"
                : "bg-purple-800 border-purple-700 opacity-70 hover:opacity-100"
            }`}
          >
            <RotateCcw className="w-5 h-5 text-purple-200" />
            <span className="text-[8px] font-black uppercase text-purple-100 tracking-wider">
              360°
            </span>
          </button>
        )}
      </div>

      {/* ── Full Resolution Lightbox Modal ── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl w-full max-h-[95vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white text-xs font-bold bg-white/10 px-3 py-1 rounded-lg">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(4, z + 0.5))}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <span className="text-slate-300 text-xs font-semibold">
                {lightboxIdx + 1} / {galleryImages.length}
              </span>

              <button
                onClick={closeLightbox}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Image */}
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{
                height: "75vh",
                cursor: zoomLevel > 1 ? "grab" : "zoom-in",
              }}
              onMouseDown={handleLightboxMouseDown}
              onMouseMove={handleLightboxMouseMove}
              onMouseUp={handleLightboxMouseUp}
              onMouseLeave={handleLightboxMouseUp}
              onDoubleClick={() => {
                if (zoomLevel === 1) {
                  setZoomLevel(2.5);
                } else {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }
              }}
            >
              <img
                src={galleryImages[lightboxIdx]}
                alt={`${productName} fullres ${lightboxIdx + 1}`}
                className="w-full h-full object-contain select-none"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transition: isDragging.current
                    ? "none"
                    : "transform 0.2s ease",
                }}
                draggable={false}
              />
            </div>

            {/* Lightbox Prev/Next */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevLightbox}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextLightbox}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Lightbox Thumbnails Strip */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLightboxIdx(idx);
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    lightboxIdx === idx
                      ? "border-[#00AEEF] ring-2 ring-[#00AEEF]/30"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>

            <p className="text-slate-400 text-[10px] font-semibold">
              Double-click to zoom · Click and drag to pan · Scroll to zoom
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
