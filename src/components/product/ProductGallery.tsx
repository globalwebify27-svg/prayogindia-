"use client";

import React, { useState, useRef } from "react";
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

  const mainImageRef = useRef<HTMLDivElement>(null);

  const hasVideo = !!videoUrl;
  const has360 = media360.length > 0;

  const prevImage = () => {
    setSelectedIdx(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
    setActiveMode("image");
  };

  const nextImage = () => {
    setSelectedIdx((prev) => (prev + 1) % galleryImages.length);
    setActiveMode("image");
  };

  return (
    <div className="space-y-4">
      {/* ── Main Media Card ── */}
      <div
        ref={mainImageRef}
        className="relative h-80 sm:h-96 md:h-[440px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs group flex items-center justify-center p-6"
      >
        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pointer-events-auto">
            {/* Brand Logo Pill */}
            <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-2xs border border-slate-200 flex items-center gap-1">
              <span className="text-[10px] sm:text-[11px] font-black tracking-tight text-slate-900">
                PRAY<span className="text-[#00AEEF]">O</span>G{" "}
                <span className="text-[#FF7A00]">INDIA</span>
              </span>
            </div>

            {/* Genuine Product Badge */}
            <div className="bg-emerald-50/95 backdrop-blur-md text-emerald-700 border border-emerald-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold shadow-2xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Genuine Product</span>
            </div>
          </div>
        </div>

        {/* Media Viewer Area */}
        {activeMode === "image" && (
          <>
            <div className="relative w-full h-full">
              <Image
                src={galleryImages[selectedIdx]}
                alt={`${productName} image ${selectedIdx + 1}`}
                fill
                priority
                className="object-contain p-2 transition-transform duration-300"
              />
            </div>

            {/* Prev/Next arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white text-slate-700 hover:text-[#00AEEF] rounded-full shadow-md border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer z-10 opacity-80 group-hover:opacity-100"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white text-slate-700 hover:text-[#00AEEF] rounded-full shadow-md border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer z-10 opacity-80 group-hover:opacity-100"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </>
        )}

        {activeMode === "video" && optimizedVideoUrl && (
          <video
            src={optimizedVideoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover rounded-2xl"
          />
        )}

        {activeMode === "360" && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-600 select-none bg-slate-50/50 rounded-2xl p-4">
            <div className="relative w-full h-48 flex items-center justify-center">
              <Image
                src={media360[0] || galleryImages[selectedIdx] || galleryImages[0]}
                alt="360 view model"
                fill
                className="object-contain animate-pulse"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <RotateCcw className="w-3.5 h-3.5 text-[#00AEEF] animate-spin-slow" />
              <span>360° Interactive View Mode</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Thumbnail Strip ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 px-0.5">
        {galleryImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setSelectedIdx(idx);
              setActiveMode("image");
            }}
            className={`relative w-14 h-14 sm:w-[72px] sm:h-[72px] shrink-0 rounded-xl overflow-hidden transition-all bg-white cursor-pointer ${
              activeMode === "image" && selectedIdx === idx
                ? "border-2 border-[#00AEEF] shadow-sm scale-102"
                : "border border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
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

        {/* 360° View / Interactive Mode Thumbnail */}
        {has360 ? (
          <button
            type="button"
            onClick={() => setActiveMode("360")}
            className={`relative w-14 h-14 sm:w-[72px] sm:h-[72px] shrink-0 rounded-xl overflow-hidden transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeMode === "360"
                ? "bg-slate-900 border-2 border-[#00AEEF] shadow-sm"
                : "bg-slate-900 border border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/40 flex items-center justify-center">
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00AEEF]" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-bold text-white tracking-tight">
              360° View
            </span>
          </button>
        ) : hasVideo ? (
          <button
            type="button"
            onClick={() => setActiveMode("video")}
            className={`relative w-14 h-14 sm:w-[72px] sm:h-[72px] shrink-0 rounded-xl overflow-hidden transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeMode === "video"
                ? "bg-slate-900 border-2 border-[#00AEEF] shadow-sm"
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
        ) : null}
      </div>
    </div>
  );
};
