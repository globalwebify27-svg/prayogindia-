"use client";

import React from "react";
import Image from "next/image";

interface PrayogLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  dark?: boolean;
}

export const PrayogLogo: React.FC<PrayogLogoProps> = ({
  className = "",
  size = "md",
  showSubtitle = false,
  dark = false,
}) => {
  // Height & dimensions tailored for clean proportions
  const sizeClasses = {
    sm: "h-8 sm:h-9 w-auto",
    md: "h-9 sm:h-11 lg:h-12 w-auto",
    lg: "h-12 sm:h-16 lg:h-18 w-auto",
    xl: "h-16 sm:h-20 lg:h-24 w-auto",
  };

  return (
    <div
      className={`inline-flex flex-col items-start select-none group cursor-pointer ${className}`}
    >
      <div className="flex items-center">
        <img
          src="/images/prayog-logo.webp"
          alt="Prayog India - The World of Robotics"
          className={`${sizeClasses[size]} object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-[1.02]`}
          loading="eager"
        />
      </div>

      {showSubtitle && (
        <div
          className={`mt-1 px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1.5 ${
            dark
              ? "bg-slate-900/90 border-slate-700/80 text-slate-300"
              : "bg-white/95 border-slate-200 text-slate-600"
          }`}
        >
          <span className="font-serif italic text-[9px] sm:text-[10px] font-medium text-slate-400">
            The World of
          </span>
          <span className="font-sans font-black tracking-widest text-[8px] sm:text-[9px] text-[#00AEEF] uppercase">
            ROBOTICS
          </span>
        </div>
      )}
    </div>
  );
};

export default PrayogLogo;

