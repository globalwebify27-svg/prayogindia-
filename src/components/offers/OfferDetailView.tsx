"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductCard } from "@/components/products/ProductCard";
import { OFFERS_DATA } from "@/data/offersData";
import { PRODUCTS } from "@/data/mockData";
import {
  Calendar,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Copy,
  Check,
  Zap,
  Flame,
  Truck,
  FileText,
  Sparkles,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

interface OfferDetailProps {
  slug: string;
}

export const OfferDetailView: React.FC<OfferDetailProps> = ({ slug }) => {
  const offer =
    OFFERS_DATA.find((o) => o.slug === slug || o.id === slug) || OFFERS_DATA[0];

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const eligibleProducts = PRODUCTS.filter((p) =>
    offer.productIds.includes(p.id),
  );

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
    <div className="bg-slate-50/50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
        {/* 1. Breadcrumb */}
        <CategoryBreadcrumb
          items={[
            { label: "Offers & Deals", href: "/offers" },
            { label: offer.title },
          ]}
        />

        {/* 2. Banner Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-[#071927] border border-slate-800 text-white shadow-2xl p-6 sm:p-10 lg:p-12">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={offer.image}
              alt={offer.title}
              fill
              priority
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#FFC20E] text-slate-950 text-xs font-black uppercase px-3.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                {offer.discountBadge || offer.badge}
              </span>
              <span className="bg-slate-900/90 backdrop-blur-md text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00AEEF]" />
                Valid: {offer.startDate} – {offer.endDate}
              </span>
              <span className="bg-emerald-950/80 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {offer.customerEligibility || "All Customers"}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {offer.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {offer.shortDescription}
              </p>
            </div>

            {/* Voucher Code Box */}
            {offer.couponCode && (
              <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl max-w-lg">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                    Official Voucher Code
                  </div>
                  <div className="font-mono text-base font-black text-[#FFC20E]">
                    {offer.couponCode}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(offer.couponCode!)}
                  className={`ml-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 ${
                    copiedCode === offer.couponCode
                      ? "bg-emerald-600 text-white"
                      : "bg-[#00AEEF] hover:bg-[#0096D6] text-white"
                  }`}
                >
                  {copiedCode === offer.couponCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Campaign Highlights & Rules Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              Customer Eligibility
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
              {offer.customerEligibility || "All Customers (B2C & B2B)"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              Delivery Benefit
            </span>
            <span className="font-bold text-emerald-600 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-500" />
              Free Shipping on orders &gt; ₹999
            </span>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/offers"
              className="text-xs font-bold text-[#00AEEF] hover:text-[#0096D6] hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Deals &amp; Vouchers
            </Link>
          </div>
        </div>

        {/* 4. Terms & Conditions Bullet points */}
        {offer.terms && offer.terms.length > 0 && (
          <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <FileText className="w-4 h-4 text-[#00AEEF]" />
              <span>Promotion Terms &amp; Conditions:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {offer.terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#00AEEF] font-bold">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Eligible Products Grid using existing ProductCard */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-[#00AEEF] rounded-full" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Eligible Products in this Offer ({eligibleProducts.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {eligibleProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
