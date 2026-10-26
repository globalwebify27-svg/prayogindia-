"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Headphones,
  GraduationCap,
  Lock,
  Users,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface FeatureCard {
  id: string;
  badge: string;
  highlight: string;
  icon: (className: string) => React.ReactNode;
  title: string;
  description: string;
  accent: {
    iconIdle: string;
    iconHover: string;
    borderHover: string;
    tag: string;
    dot: string;
    topLine: string;
    glow: string;
  };
}

const FEATURES: FeatureCard[] = [
  {
    id: "1",
    badge: "Authentic",
    highlight: "OEM Direct Sourced",
    icon: (cls) => <ShieldCheck className={cls} />,
    title: "100% Genuine Products",
    description:
      "Directly sourced components from official microchip manufacturers with full GST invoice compliance.",
    accent: {
      iconIdle: "bg-amber-50 text-amber-600 border-amber-200/80 shadow-xs shadow-amber-500/10",
      iconHover: "group-hover:bg-[#FFC20E] group-hover:text-slate-900 group-hover:border-[#FFC20E] group-hover:shadow-md group-hover:shadow-amber-500/25",
      borderHover: "hover:border-amber-300/80 hover:shadow-xl hover:shadow-amber-500/10",
      tag: "text-amber-800 bg-amber-50 border-amber-200/80",
      dot: "bg-amber-500",
      topLine: "bg-[#FFC20E]",
      glow: "bg-amber-400/25",
    },
  },
  {
    id: "2",
    badge: "Express",
    highlight: "Pan-India Dispatch",
    icon: (cls) => <Truck className={cls} />,
    title: "Fast Dispatch Across India",
    description:
      "Express courier shipping with real-time tracking for schools, colleges, and DIY makers.",
    accent: {
      iconIdle: "bg-blue-50 text-[#2563EB] border-blue-200/80 shadow-xs shadow-blue-500/10",
      iconHover: "group-hover:bg-[#2563EB] group-hover:text-white group-hover:border-[#2563EB] group-hover:shadow-md group-hover:shadow-blue-500/25",
      borderHover: "hover:border-blue-300/80 hover:shadow-xl hover:shadow-blue-500/10",
      tag: "text-[#2563EB] bg-blue-50 border-blue-200/80",
      dot: "bg-[#2563EB]",
      topLine: "bg-[#2563EB]",
      glow: "bg-blue-400/25",
    },
  },
  {
    id: "3",
    badge: "24/7 Support",
    highlight: "In-House Engineers",
    icon: (cls) => <Headphones className={cls} />,
    title: "Dedicated Technical Support",
    description:
      "In-house robotics engineers available to solve pinout queries, driver issues, and code troubleshooting.",
    accent: {
      iconIdle: "bg-slate-100 text-[#0A1128] border-slate-200/80 shadow-xs",
      iconHover: "group-hover:bg-[#0A1128] group-hover:text-white group-hover:border-[#0A1128] group-hover:shadow-md group-hover:shadow-slate-900/25",
      borderHover: "hover:border-slate-400/80 hover:shadow-xl hover:shadow-slate-900/10",
      tag: "text-[#0A1128] bg-slate-100 border-slate-200/80",
      dot: "bg-[#0A1128]",
      topLine: "bg-[#0A1128]",
      glow: "bg-slate-400/25",
    },
  },
  {
    id: "4",
    badge: "500+ Labs",
    highlight: "Institutional STEM",
    icon: (cls) => <GraduationCap className={cls} />,
    title: "STEM & Institutional Experts",
    description:
      "Over 500+ school and university STEM labs designed and commissioned across India.",
    accent: {
      iconIdle: "bg-blue-50 text-[#2563EB] border-blue-200/80 shadow-xs shadow-blue-500/10",
      iconHover: "group-hover:bg-[#2563EB] group-hover:text-white group-hover:border-[#2563EB] group-hover:shadow-md group-hover:shadow-blue-500/25",
      borderHover: "hover:border-blue-300/80 hover:shadow-xl hover:shadow-blue-500/10",
      tag: "text-[#2563EB] bg-blue-50 border-blue-200/80",
      dot: "bg-[#2563EB]",
      topLine: "bg-[#2563EB]",
      glow: "bg-blue-400/25",
    },
  },
  {
    id: "5",
    badge: "Encrypted",
    highlight: "Safe Payment Gateways",
    icon: (cls) => <Lock className={cls} />,
    title: "Secure Shopping Guarantee",
    description:
      "256-bit encrypted checkout with UPI, Net Banking, Credit Cards, and GST Purchase orders.",
    accent: {
      iconIdle: "bg-amber-50 text-amber-600 border-amber-200/80 shadow-xs shadow-amber-500/10",
      iconHover: "group-hover:bg-[#FFC20E] group-hover:text-slate-900 group-hover:border-[#FFC20E] group-hover:shadow-md group-hover:shadow-amber-500/25",
      borderHover: "hover:border-amber-300/80 hover:shadow-xl hover:shadow-amber-500/10",
      tag: "text-amber-800 bg-amber-50 border-amber-200/80",
      dot: "bg-amber-500",
      topLine: "bg-[#FFC20E]",
      glow: "bg-amber-400/25",
    },
  },
  {
    id: "6",
    badge: "Community",
    highlight: "Open Hardware Hub",
    icon: (cls) => <Users className={cls} />,
    title: "Vibrant Learning Community",
    description:
      "Free access to build tutorials, open-source code repositories, and flight tuning workshops.",
    accent: {
      iconIdle: "bg-slate-100 text-[#0A1128] border-slate-200/80 shadow-xs",
      iconHover: "group-hover:bg-[#0A1128] group-hover:text-white group-hover:border-[#0A1128] group-hover:shadow-md group-hover:shadow-slate-900/25",
      borderHover: "hover:border-slate-400/80 hover:shadow-xl hover:shadow-slate-900/10",
      tag: "text-[#0A1128] bg-slate-100 border-slate-200/80",
      dot: "bg-[#0A1128]",
      topLine: "bg-[#0A1128]",
      glow: "bg-slate-400/25",
    },
  },
];

export const WhyChoosePrayog: React.FC = () => {
  return (
    <section className="relative py-10 sm:py-14 lg:py-18 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/70 border-y border-slate-200/80 overflow-hidden">
      {/* Subtle Ambient Section Highlights */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-7 sm:space-y-9">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="flex flex-col items-center gap-2">
            <span className="bg-blue-50 text-[#2563EB] border border-blue-200/70 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC20E] shrink-0" />
              Why Prayog India
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Innovation, Built on Trust
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-xl mx-auto leading-relaxed">
            Trusted by makers, robotics innovators, and 500+ academic institutions across India with certified hardware and expert guidance.
          </p>
        </div>

        {/* 6 Clean, Modern Bento-style Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className={`relative bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between overflow-hidden cursor-default ${feat.accent.borderHover}`}
            >
              {/* Subtle Animated Top Highlight Line (appears on hover) */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2.5px] ${feat.accent.topLine} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Ambient Hover Corner Glow */}
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${feat.accent.glow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              {/* Header: Dynamic Icon + Live Pulse Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 ${feat.accent.iconIdle} ${feat.accent.iconHover}`}
                >
                  {feat.icon("w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]")}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs transition-colors ${feat.accent.tag}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${feat.accent.dot} animate-pulse`} />
                  {feat.badge}
                </span>
              </div>

              {/* Body: Title & Description */}
              <div className="relative z-10 mt-4 sm:mt-5 space-y-1.5 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-snug">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>

              {/* Bottom Feature Highlight Pill with Micro-Arrow */}
              <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 group-hover:text-slate-800 transition-colors flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${feat.accent.dot}`} />
                  {feat.highlight}
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:bg-[#2563EB] group-hover:text-white group-hover:border-[#2563EB] group-hover:scale-105 transition-all duration-200 shadow-2xs">
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
