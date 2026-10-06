"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Zap,
  Clock,
  Copy,
  Check,
  Tag,
  Sparkles,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

interface TopDealsHeroProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dealCount: number;
}

export const TopDealsHero: React.FC<TopDealsHeroProps> = ({
  activeTab,
  onTabChange,
  dealCount,
}) => {
  // Live ticking flash sale timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 28,
    seconds: 42,
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code: string) => {
    haptic?.selection?.();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const tabs = [
    { id: "all", label: "All Deals", count: dealCount },
    { id: "lightning", label: "Under ₹999" },
    { id: "arduino", label: "Arduino & Dev Boards" },
    { id: "robotics", label: "Robotics & STEM" },
    { id: "drones", label: "Drones & Flight" },
    { id: "sensors", label: "Sensors & Wireless" },
    { id: "high-discount", label: "30%+ Heavy Discounts" },
  ];

  return (
    <div className="space-y-4 pb-2 border-b border-slate-200">
      {/* Clean Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Limited Time Sale
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Verified Hardware Discounts
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Top Deals &amp; Discounts
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Explore limited-time price drops on genuine microcontrollers, robotics kits, flight stacks, and electronic sensors.
          </p>
        </div>

        {/* Clean Timer & Quick Coupon Pill */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Live countdown badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#FFC20E]" />
            <span className="text-slate-300 font-normal">Ends in:</span>
            <span className="font-mono text-[#FFC20E]">
              {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          </div>

          {/* Quick coupon button */}
          <button
            type="button"
            onClick={() => handleCopy("PRAYOG10")}
            className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-[#00AEEF] border border-[#00AEEF]/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Code: <strong>PRAYOG10</strong></span>
            {copiedCode === "PRAYOG10" ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Clean Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-thin">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isActive
                      ? "bg-[#00AEEF] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
