"use client";

import React from "react";

interface PrayogLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  dark?: boolean;
}

export const PrayogLogo: React.FC<PrayogLogoProps> = ({
  className = "",
  size = "md",
  showSubtitle = true,
  dark = false,
}) => {
  // Scaling factors based on size prop
  const fontSizes = {
    sm: "text-base sm:text-xl",
    md: "text-lg sm:text-2xl lg:text-3xl",
    lg: "text-2xl sm:text-3xl lg:text-4xl",
  };

  const iconSizes = {
    sm: "w-5 h-5 sm:w-6 sm:h-6",
    md: "w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9",
    lg: "w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11",
  };

  return (
    <div
      className={`inline-flex flex-col items-start select-none group cursor-pointer ${className}`}
    >
      {/* Top Logo Line: PRAY + Robot Head Gear Icon + G + INDIA */}
      <div className="flex items-center gap-0.5 sm:gap-1 font-black tracking-tight font-sans leading-none">
        {/* PRAY */}
        <span
          className={`text-[#00AEEF] font-extrabold uppercase ${fontSizes[size]}`}
        >
          PRAY
        </span>

        {/* Robot Head with Gear Eyes & Antennas */}
        <div
          className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-[#00AEEF]"
          >
            {/* Left Antenna */}
            <line
              x1="20"
              y1="14"
              x2="10"
              y2="4"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="9" cy="3" r="3.5" fill="currentColor" />

            {/* Right Antenna */}
            <line
              x1="44"
              y1="14"
              x2="54"
              y2="4"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="55" cy="3" r="3.5" fill="currentColor" />

            {/* Main Robot Head Box */}
            <rect
              x="8"
              y="14"
              width="48"
              height="34"
              rx="9"
              fill="currentColor"
            />

            {/* Chin / Bottom Gear Notch */}
            <path d="M 22 48 L 22 53 L 42 53 L 42 48 Z" fill="currentColor" />
            <rect x="26" y="50" width="12" height="4" fill="currentColor" />

            {/* Gear Eye - Left */}
            <g
              className="animate-spin-slow"
              style={{ transformOrigin: "22px 30px" }}
            >
              <circle cx="22" cy="30" r="7.5" fill="white" />
              <circle cx="22" cy="30" r="3.5" fill="currentColor" />
              <rect x="20.5" y="20.5" width="3" height="3" fill="white" />
              <rect x="20.5" y="36.5" width="3" height="3" fill="white" />
              <rect x="12.5" y="28.5" width="3" height="3" fill="white" />
              <rect x="28.5" y="28.5" width="3" height="3" fill="white" />
            </g>

            {/* Gear Eye - Right */}
            <g
              className="animate-spin-slow"
              style={{ transformOrigin: "42px 30px" }}
            >
              <circle cx="42" cy="30" r="7.5" fill="white" />
              <circle cx="42" cy="30" r="3.5" fill="currentColor" />
              <rect x="40.5" y="20.5" width="3" height="3" fill="white" />
              <rect x="40.5" y="36.5" width="3" height="3" fill="white" />
              <rect x="32.5" y="28.5" width="3" height="3" fill="white" />
              <rect x="48.5" y="28.5" width="3" height="3" fill="white" />
            </g>

            {/* Smile / Curve */}
            <path
              d="M22 41 Q32 45 42 41"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* G */}
        <span
          className={`text-[#00AEEF] font-extrabold uppercase ${fontSizes[size]}`}
        >
          G
        </span>

        {/* Space */}
        <span className="w-0.5 sm:w-1"></span>

        {/* INDIA */}
        <span
          className={`text-[#FFC20E] font-extrabold uppercase ${fontSizes[size]}`}
        >
          INDIA
        </span>
      </div>

      {/* Tagline Pill Box: "The World of ROBOTICS" */}
      {showSubtitle && (
        <div
          className={`mt-0.5 px-2 sm:px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
            dark
              ? "bg-slate-900/90 border-slate-700/80 text-slate-300"
              : "bg-white/95 border-slate-200 text-slate-500"
          }`}
        >
          <span className="font-serif italic text-[9px] sm:text-[11px] font-medium text-slate-400">
            The World of
          </span>
          <span className="font-sans font-black tracking-widest text-[8px] sm:text-[10px] text-slate-400 uppercase">
            ROBOTICS
          </span>
        </div>
      )}
    </div>
  );
};
