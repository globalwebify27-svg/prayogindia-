"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { OfferItem, OFFERS_DATA } from "@/data/offersData";
import {
  ArrowRight,
  Tag,
  Calendar,
  ShieldCheck,
  Copy,
  Check,
  Zap,
  Flame,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

interface HeroSpotlightDealProps {
  initialOffer?: OfferItem;
}

export const HeroSpotlightDeal: React.FC<HeroSpotlightDealProps> = ({
  initialOffer,
}) => {
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeOffer = OFFERS_DATA[selectedOfferIndex] || initialOffer || OFFERS_DATA[0];

  const handleCopyCode = (code: string) => {
    haptic?.selection?.();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div id="deals-spotlight" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-[#00AEEF] rounded-full" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Spotlight Mega Deals
          </h2>
          <span className="text-xs bg-[#E0F7FC] text-[#00AEEF] font-bold px-2.5 py-0.5 rounded-full">
            Top Picks
          </span>
        </div>

        {/* Carousel / Tab Selector for Deals */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {OFFERS_DATA.map((offer, idx) => (
            <button
              key={offer.id}
              onClick={() => setSelectedOfferIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedOfferIndex === idx
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {offer.badge === "FEATURED" && "⭐ "}
              {offer.title.split(" ")[0]} {offer.title.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Spotlight Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-[#0c1f36] border border-slate-800 text-white shadow-2xl transition-all duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Offer Content & Details (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 relative z-10">
            <div className="space-y-4">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#FFC20E] text-slate-950 text-xs font-black uppercase px-3.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  {activeOffer.discountBadge || "EXCLUSIVE DEAL"}
                </span>

                <span className="bg-slate-800/90 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00AEEF]" />
                  Valid: {activeOffer.startDate} – {activeOffer.endDate}
                </span>

                <span className="bg-emerald-950/80 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {activeOffer.customerEligibility || "All Customers"}
                </span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {activeOffer.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                  {activeOffer.shortDescription}
                </p>
              </div>

              {/* Urgency Progress Bar */}
              {activeOffer.claimedPercentage && (
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      Deal Claim Progress:
                    </span>
                    <span className="font-mono font-bold text-[#FFC20E]">
                      {activeOffer.claimedPercentage}% Claimed{" "}
                      {activeOffer.stockLeft && (
                        <span className="text-slate-400 font-normal">
                          ({activeOffer.stockLeft} units left)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00AEEF] to-[#FFC20E] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${activeOffer.claimedPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Voucher Code Box */}
              {activeOffer.couponCode && (
                <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#FFC20E]" />
                    <span className="text-xs text-slate-300 font-medium">Checkout Coupon:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeOffer.couponCode!)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF]/20 to-sky-400/10 hover:bg-[#00AEEF]/30 text-[#00AEEF] border border-[#00AEEF]/40 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer group/btn active:scale-95"
                  >
                    <span>{activeOffer.couponCode}</span>
                    {copiedCode === activeOffer.couponCode ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-sans">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#00AEEF]" />
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    (Auto-discount applied at cart)
                  </span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/offers/${activeOffer.slug}`}
                className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-[#00AEEF]/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>Explore Deal Hardware ({activeOffer.productIds.length} Items)</span>
                <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
              </Link>

              <button
                onClick={() => {
                  const el = document.getElementById("deal-products");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#00AEEF]" />
                <span>View Products Below</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Graphic / Media (5 cols) */}
          <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] lg:min-h-full overflow-hidden bg-slate-950 flex items-center justify-center p-6">
            <Image
              src={activeOffer.image}
              alt={activeOffer.title}
              fill
              priority
              className="object-cover opacity-75 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-slate-950/40 to-slate-950" />

            {/* Floating Floating Price Saving Bubble */}
            <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md border border-white/15 p-3 rounded-2xl text-center shadow-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Max Catalogue Subsidy
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#FFC20E]">
                {activeOffer.discountPercentage}% OFF
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Tested Hardware
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
