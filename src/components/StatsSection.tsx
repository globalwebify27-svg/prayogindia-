"use client";

import React from "react";
import { Package, Layers, Building2, Users } from "lucide-react";

export const StatsSection: React.FC = () => {
  const stats = [
    {
      number: "10,000+",
      label: "Products",
      description: "Microcontrollers, kits & robotics gear",
      icon: Package,
      color: "text-[#1E56A0]",
    },
    {
      number: "50+",
      label: "Technology Categories",
      description: "From AI vision to drone components",
      icon: Layers,
      color: "text-[#D4AF37]",
    },
    {
      number: "Multiple",
      label: "Industries Served",
      description: "Defense, R&D, Agri & Manufacturing",
      icon: Building2,
      color: "text-[#1E56A0]",
    },
    {
      number: "Trusted",
      label: "by Students & Professionals",
      description: "Over 500+ STEM labs across India",
      icon: Users,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 z-30 -mt-5 sm:-mt-10 lg:-mt-14 mb-1 sm:mb-2 lg:mb-3">
      <div className="bg-white rounded-xl sm:rounded-3xl shadow-md sm:shadow-card-hover border border-slate-100 p-2.5 sm:p-6 lg:p-7 grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-center p-1 sm:p-0 ${
              idx % 2 === 1
                ? "border-l border-slate-100 pl-2 sm:pl-0 sm:border-l-0"
                : ""
            } ${
              idx >= 2
                ? "border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0"
                : ""
            } lg:border-t-0 lg:border-l lg:border-slate-100 lg:first:border-l-0 lg:first:pl-0 lg:pl-6`}
          >
            <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-2">
              <stat.icon
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.color} shrink-0`}
              />
              <span className="text-base sm:text-2xl lg:text-3xl font-extrabold text-[#0A1128] tracking-tight">
                {stat.number}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
              {stat.label}
            </h4>
            <p className="hidden sm:block text-xs text-slate-500 mt-1 font-normal leading-normal">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
