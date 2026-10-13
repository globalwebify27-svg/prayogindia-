"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  Users,
} from "lucide-react";

interface HeroProps {
  onExploreProducts: () => void;
  onExploreSolutions: () => void;
}

interface SlideItem {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  image: string;
  alt: string;
  noteLines: string[];
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: "stem-robotics",
    badge: "🇮🇳 India's #1 Robotics & Electronics Platform",
    titlePrefix: "Build. Learn.",
    titleHighlight: "Innovate.",
    description:
      "Premium quality robotics kits, microcontrollers, sensors and electronic components for students, makers and professionals.",
    primaryButtonText: "Explore Products",
    secondaryButtonText: "Explore Services",
    image: "/images/robot_banner_stem.jpg",
    alt: "STEM Robotics Smart Rover Chassis Kit with Arduino and Ultrasonic Sensor",
    noteLines: ["From", "Concept", "to Creation"],
  },
  {
    id: "drone-technology",
    badge: "⚡ Advanced FPV & Drone Technology",
    titlePrefix: "Design. Fly.",
    titleHighlight: "Automate.",
    description:
      "High-performance carbon fiber frames, BLDC motors, Pixhawk flight controllers, and telemetry systems engineered for precision.",
    primaryButtonText: "Explore Drones",
    secondaryButtonText: "Explore Services",
    image: "/images/drone_banner_lab.jpg",
    alt: "Autonomous Drone UAV Lab Workbench with Telemetry Station",
    noteLines: ["Engineered", "for Flight", "Precision"],
  },
  {
    id: "embedded-ai-iot",
    badge: "🤖 Embedded AI, IoT & Microcontrollers",
    titlePrefix: "Connect. Code.",
    titleHighlight: "Transform.",
    description:
      "Raspberry Pi 5, Jetson AI edge modules, microcontrollers & IoT sensors engineered for next-generation smart robotic systems.",
    primaryButtonText: "Explore AI & IoT",
    secondaryButtonText: "Explore Services",
    image: "/images/stem_robot_banner.jpg",
    alt: "Microcontrollers and IoT Edge Robotics Lab Setup",
    noteLines: ["Powering", "Next-Gen", "Makers"],
  },
];

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 pt-2 pb-4 select-none">
      {/* Premium Horizontal Banner Card Container */}
      <section
        className="relative w-full rounded-2xl sm:rounded-3xl lg:rounded-[28px] overflow-hidden border border-[#D8E6F8] bg-gradient-to-r from-[#EEF5FE] via-[#F3F8FF] to-[#E5F1FC] shadow-sm min-h-[260px] lg:h-[280px] flex flex-col lg:flex-row items-center justify-between"
        aria-label="Prayog India Featured Robotics Showcase"
      >
        {/* Left Column: Pill, Headings, Action CTAs, and Trust Badges */}
        <div className="w-full lg:w-[53%] flex flex-col justify-between py-5 sm:py-6 lg:py-6 pl-5 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 z-10 space-y-3 lg:space-y-0 lg:h-full text-left">
          {/* Pill Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${activeSlide.id}`}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#BFDBFE] shadow-2xs self-start"
            >
              <span className="text-[11.5px] font-semibold text-[#0052CC] tracking-tight">
                {activeSlide.badge}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Main Headline & Description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-${activeSlide.id}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-black tracking-tight leading-[1.12] text-[#0F172A]">
                {activeSlide.titlePrefix}{" "}
                <span className="text-[#0062E0]">
                  {activeSlide.titleHighlight}
                </span>
              </h1>

              <p className="mt-1 sm:mt-1.5 text-slate-600 text-xs sm:text-[13px] max-w-xl font-normal leading-relaxed line-clamp-2">
                {activeSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
            <button
              onClick={onExploreProducts}
              className="bg-[#0062E0] hover:bg-[#0052CC] active:scale-[0.98] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all duration-150 flex items-center gap-2 shadow-sm shadow-[#0062E0]/20 hover:shadow-md cursor-pointer group"
            >
              <span>{activeSlide.primaryButtonText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={onExploreSolutions}
              className="bg-white hover:bg-slate-50 active:scale-[0.98] text-[#0062E0] font-semibold px-5 py-2.5 rounded-xl text-xs border border-[#BFDBFE] hover:border-[#0062E0]/50 transition-all duration-150 flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <span>{activeSlide.secondaryButtonText}</span>
            </button>
          </div>

          {/* Trust Badges Strip (Refined & Clean) */}
          <div className="pt-2.5 border-t border-slate-200/60">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-1.5 lg:gap-2.5 items-center">
              {TRUST_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.title}
                    className={`flex items-center gap-2 ${
                      idx < TRUST_STATS.length - 1
                        ? "sm:border-r sm:border-slate-200/80 sm:pr-2 lg:pr-3"
                        : ""
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-white text-[#0062E0] border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-bold text-slate-900 leading-tight whitespace-nowrap">
                        {stat.title}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-medium leading-tight whitespace-nowrap">
                        {stat.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Takes 100% Full Height & Width of its Parent Container */}
        <div className="w-full lg:w-[47%] h-[220px] sm:h-[260px] lg:h-full self-stretch relative overflow-hidden lg:rounded-l-[32px] border-t lg:border-t-0 lg:border-l border-[#D5E3F5]/70 bg-white">
          {/* Slide Image with Crossfade - Fills 100% Full Height & Width */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${activeSlide.id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.alt}
                className="w-full h-full object-cover object-center"
              />
              {/* Subtle soft edge vignette */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/15 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Handwritten Note: Positioned in airy background space */}
          <div className="absolute top-2.5 right-14 sm:top-3 sm:right-18 lg:top-3.5 lg:right-22 z-20 pointer-events-none select-none flex flex-col items-end">
            <div className="font-handwriting text-slate-700 text-xs sm:text-sm lg:text-[15px] font-bold leading-[1.05] text-right drop-shadow-2xs tracking-wide">
              {activeSlide.noteLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            {/* Curved Arrow pointing down-left toward the robot car */}
            <svg
              className="w-7 h-5 sm:w-8 sm:h-5.5 text-slate-700 -mr-1 mt-0.5"
              viewBox="0 0 44 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M32 4 C32 16, 24 24, 12 25"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M17 20 L10 25 L16 30"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Carousel Indicator Dots (Bottom Right) */}
          <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-4 flex items-center gap-1.5 z-20 bg-white/85 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200/60 shadow-2xs">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? "w-4.5 h-1.5 bg-[#0062E0]"
                    : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
