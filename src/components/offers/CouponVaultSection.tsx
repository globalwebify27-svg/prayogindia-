"use client";

import React, { useState } from "react";
import { COUPONS_DATA, CouponItem } from "@/data/offersData";
import {
  Ticket,
  Copy,
  Check,
  Sparkles,
  Info,
  Clock,
  Scissors,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

export const CouponVaultSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = ["All", "Sitewide", "Makers", "Drones", "Delivery", "Institutional"];

  const filteredCoupons = COUPONS_DATA.filter((coupon) => {
    if (selectedCategory === "All") return true;
    return coupon.category.toLowerCase() === selectedCategory.toLowerCase();
  });

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
    <div id="coupon-vault" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-[#FFC20E] rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Checkout Voucher Vault</span>
              <Ticket className="w-5 h-5 text-[#00AEEF]" />
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Click any voucher to copy code. Apply at cart or checkout to unlock instant discounts.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00AEEF] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Grid - Ticket / Perforated styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoupons.map((coupon) => {
          const isCopied = copiedCode === coupon.code;
          return (
            <div
              key={coupon.code}
              className="relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#00AEEF]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Perforated Side Cutouts (Visual Ticket Notch Effect) */}
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200 z-10" />
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200 z-10" />

              {/* Top Section */}
              <div className="p-5 pb-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-50 to-cyan-100 text-[#00AEEF] border border-cyan-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {coupon.category}
                  </span>

                  {coupon.isPopular && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      ⭐ Popular
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {coupon.expiryDate}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#00AEEF] transition-colors">
                    {coupon.discountText}
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">
                    {coupon.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>
              </div>

              {/* Dashed Perforated Separator */}
              <div className="relative px-6">
                <div className="border-t-2 border-dashed border-slate-200" />
              </div>

              {/* Bottom Section: Code Copy & Minimum order info */}
              <div className="p-5 pt-3 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>
                    Min Cart:{" "}
                    <strong className="text-slate-800 font-semibold">
                      ₹{coupon.minOrder.toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {coupon.terms ? "T&C Apply" : "No Code Limit"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Coupon Code Block */}
                  <div className="flex-1 bg-white border-2 border-dashed border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between group-hover:border-[#00AEEF]/50 transition-colors">
                    <span className="font-mono text-xs font-extrabold text-slate-900 tracking-wider">
                      {coupon.code}
                    </span>
                    <Scissors className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-emerald-500/20"
                        : "bg-[#00AEEF] hover:bg-[#0096D6] text-white active:scale-95"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redemption Helper Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50 border border-sky-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-sky-200 flex items-center justify-center text-[#00AEEF] shrink-0 shadow-2xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">How to Redeem Vouchers:</div>
            <div className="text-slate-600">
              Copy any voucher above, add your hardware items to cart, and paste the code in the checkout discount box.
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("deal-products");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-xs font-bold text-[#00AEEF] hover:text-[#0096D6] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <span>Shop Eligible Products Below</span> →
        </button>
      </div>
    </div>
  );
};
