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
} from "lucide-react";

interface FeatureCard {
  id: string;
  number: string;
  badge: string;
  icon: (className: string) => React.ReactNode;
  title: string;
  description: string;
  theme: {
    bg: string;
    border: string;
    borderHover: string;
    iconBg: string;
    iconColor: string;
    blobColor: string;
    tagBg: string;
    tagColor: string;
    titleHover: string;
    numberColor: string;
  };
}

const FEATURES: FeatureCard[] = [
  {
    id: "1",
    number: "01",
    badge: "Authentic",
    icon: (cls) => <ShieldCheck className={cls} />,
    title: "100% Genuine Products",
    description:
      "Directly sourced components from official microchip manufacturers with full GST invoice compliance.",
    theme: {
      bg: "bg-gradient-to-br from-[#FFFDF5] via-white to-[#FEF3C7]/40",
      border: "border-amber-200/70",
      borderHover: "hover:border-amber-400 hover:shadow-amber-500/10",
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-50 shadow-xs",
      iconColor: "text-[#D97706]",
      blobColor: "bg-amber-300/30",
      tagBg: "bg-amber-100/70",
      tagColor: "text-amber-800",
      titleHover: "group-hover:text-amber-800",
      numberColor: "text-amber-300/70 group-hover:text-amber-400",
    },
  },
  {
    id: "2",
    number: "02",
    badge: "Express",
    icon: (cls) => <Truck className={cls} />,
    title: "Fast Dispatch Across India",
    description:
      "Express courier shipping with real-time tracking for schools, colleges, and DIY makers.",
    theme: {
      bg: "bg-gradient-to-br from-[#F0F7FF] via-white to-[#DBEAFE]/40",
      border: "border-blue-200/70",
      borderHover: "hover:border-blue-400 hover:shadow-blue-500/10",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-50 shadow-xs",
      iconColor: "text-[#2563EB]",
      blobColor: "bg-blue-300/30",
      tagBg: "bg-blue-100/70",
      tagColor: "text-blue-800",
      titleHover: "group-hover:text-blue-700",
      numberColor: "text-blue-300/70 group-hover:text-blue-400",
    },
  },
  {
    id: "3",
    number: "03",
    badge: "24/7 Support",
    icon: (cls) => <Headphones className={cls} />,
    title: "Dedicated Technical Support",
    description:
      "In-house robotics engineers available to solve pinout queries, driver issues, and code troubleshooting.",
    theme: {
      bg: "bg-gradient-to-br from-[#FAF5FF] via-white to-[#EDE9FE]/40",
      border: "border-purple-200/70",
      borderHover: "hover:border-purple-400 hover:shadow-purple-500/10",
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-50 shadow-xs",
      iconColor: "text-[#7C3AED]",
      blobColor: "bg-purple-300/30",
      tagBg: "bg-purple-100/70",
      tagColor: "text-purple-800",
      titleHover: "group-hover:text-purple-800",
      numberColor: "text-purple-300/70 group-hover:text-purple-400",
    },
  },
  {
    id: "4",
    number: "04",
    badge: "500+ Labs",
    icon: (cls) => <GraduationCap className={cls} />,
    title: "STEM & Institutional Experts",
    description:
      "Over 500+ school and university STEM labs designed and commissioned across India.",
    theme: {
      bg: "bg-gradient-to-br from-[#F0FDF4] via-white to-[#DCFCE7]/40",
      border: "border-emerald-200/70",
      borderHover: "hover:border-emerald-400 hover:shadow-emerald-500/10",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-xs",
      iconColor: "text-[#059669]",
      blobColor: "bg-emerald-300/30",
      tagBg: "bg-emerald-100/70",
      tagColor: "text-emerald-800",
      titleHover: "group-hover:text-emerald-800",
      numberColor: "text-emerald-300/70 group-hover:text-emerald-400",
    },
  },
  {
    id: "5",
    number: "05",
    badge: "Encrypted",
    icon: (cls) => <Lock className={cls} />,
    title: "Secure Shopping Guarantee",
    description:
      "256-bit encrypted checkout with UPI, Net Banking, Credit Cards, and GST Purchase orders.",
    theme: {
      bg: "bg-gradient-to-br from-[#FFF1F2] via-white to-[#FFE4E6]/40",
      border: "border-rose-200/70",
      borderHover: "hover:border-rose-400 hover:shadow-rose-500/10",
      iconBg: "bg-gradient-to-br from-rose-100 to-rose-50 shadow-xs",
      iconColor: "text-[#E11D48]",
      blobColor: "bg-rose-300/30",
      tagBg: "bg-rose-100/70",
      tagColor: "text-rose-800",
      titleHover: "group-hover:text-rose-800",
      numberColor: "text-rose-300/70 group-hover:text-rose-400",
    },
  },
  {
    id: "6",
    number: "06",
    badge: "Community",
    icon: (cls) => <Users className={cls} />,
    title: "Vibrant Learning Community",
    description:
      "Free access to build tutorials, open-source code repositories, and flight tuning workshops.",
    theme: {
      bg: "bg-gradient-to-br from-[#F0F9FF] via-white to-[#E0F2FE]/40",
      border: "border-sky-200/70",
      borderHover: "hover:border-sky-400 hover:shadow-sky-500/10",
      iconBg: "bg-gradient-to-br from-sky-100 to-sky-50 shadow-xs",
      iconColor: "text-[#0284C7]",
      blobColor: "bg-sky-300/30",
      tagBg: "bg-sky-100/70",
      tagColor: "text-sky-800",
      titleHover: "group-hover:text-sky-800",
      numberColor: "text-sky-300/70 group-hover:text-sky-400",
    },
  },
];

export const WhyChoosePrayog: React.FC = () => {
  return (
    <section className="relative py-5 sm:py-10 lg:py-14 bg-gradient-to-b from-white via-slate-50/60 to-white border-y border-slate-200/80 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-4 sm:space-y-7">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2">
          <div className="flex flex-col items-center gap-1 sm:gap-1.5">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Choose Prayog India
            </h2>
            <div className="w-9 sm:w-12 h-0.5 sm:h-1 bg-[#FFC20E] rounded-full" />
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 font-normal px-2">
            Trusted by makers, robotics innovators, and 500+ academic institutions across India.
          </p>
        </div>

        {/* 6 Reusable Premium Feature Cards Grid: 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl p-2.5 sm:p-5 lg:p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 group flex flex-col justify-between ${feat.theme.bg} ${feat.theme.border} ${feat.theme.borderHover}`}
            >
              {/* Subtle Corner Glow */}
              <div
                className={`absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-16 sm:w-28 h-16 sm:h-28 rounded-full blur-xl pointer-events-none transition-transform duration-700 group-hover:scale-125 ${feat.theme.blobColor}`}
              />

              {/* Card Header: Icon + Badge + Number */}
              <div className="relative z-10 flex items-center justify-between gap-1">
                <div
                  className={`w-7 h-7 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-md sm:rounded-xl lg:rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${feat.theme.iconBg} ${feat.theme.iconColor} ${feat.theme.border}`}
                >
                  {feat.icon("w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6")}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <span
                    className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1 sm:px-2 py-0.5 rounded ${feat.theme.tagBg} ${feat.theme.tagColor}`}
                  >
                    {feat.badge}
                  </span>
                  <span
                    className={`font-mono text-[10px] sm:text-sm font-extrabold select-none transition-colors ${feat.theme.numberColor}`}
                  >
                    {feat.number}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-0.5 sm:space-y-1.5 mt-2 sm:mt-3.5 flex-1 flex flex-col">
                <h3
                  className={`text-[11.5px] sm:text-[15px] lg:text-base font-bold text-slate-900 transition-colors leading-snug line-clamp-2 ${feat.theme.titleHover}`}
                >
                  {feat.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed font-normal line-clamp-3 sm:line-clamp-none mt-auto">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

