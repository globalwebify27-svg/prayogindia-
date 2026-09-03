"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductCard } from "@/components/products/ProductCard";
import { OFFERS_DATA } from "@/data/offersData";
import { PRODUCTS } from "@/data/mockData";
import { Calendar, Tag, ArrowLeft, ShieldCheck } from "lucide-react";

interface OfferDetailProps {
  slug: string;
}

export const OfferDetailView: React.FC<OfferDetailProps> = ({ slug }) => {
  const offer =
    OFFERS_DATA.find((o) => o.slug === slug || o.id === slug) || OFFERS_DATA[0];

  const eligibleProducts = PRODUCTS.filter((p) =>
    offer.productIds.includes(p.id),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: "Offers & Deals", href: "/offers" },
          { label: offer.title },
        ]}
      />

      {/* 2. Banner Header */}
      <div className="relative h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-end p-6 sm:p-10 group shadow-2xl">
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          priority
          className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-10 space-y-2 max-w-2xl text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#FFC20E] text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full">
              {offer.badge}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700">
              Valid: {offer.startDate} - {offer.endDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {offer.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {offer.shortDescription}
          </p>
        </div>
      </div>

      {/* 3. Campaign Voucher Details Bar */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 block">
            Customer Eligibility
          </span>
          <span className="font-extrabold text-slate-900">
            {offer.customerEligibility || "All Customers"}
          </span>
        </div>

        {offer.couponCode && (
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block">
              Checkout Voucher Code
            </span>
            <span className="bg-[#E0F7FC] text-[#00AEEF] border border-[#00AEEF]/30 px-3 py-1 rounded-xl font-mono font-black">
              {offer.couponCode}
            </span>
          </div>
        )}

        <Link
          href="/offers"
          className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Offers
        </Link>
      </div>

      {/* 4. Eligible Products Grid using existing ProductCard */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Products Included in this Offer ({eligibleProducts.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {eligibleProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};
