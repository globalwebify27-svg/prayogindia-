"use client";

import React, { useState, useMemo } from "react";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { FeaturedOfferCard } from "@/components/offers/FeaturedOfferCard";
import { ProductCard } from "@/components/products/ProductCard";
import { OFFERS_DATA } from "@/data/offersData";
import { PRODUCTS, Product } from "@/data/mockData";
import { Tag, Search, FilterX, ArrowUpDown } from "lucide-react";

export const OffersLandingView: React.FC = () => {
  const featuredOffer =
    OFFERS_DATA.find((o) => o.badge === "FEATURED") || OFFERS_DATA[0];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">(
    "featured",
  );

  // Filter products belonging to active offers
  const offerProductIds = Array.from(
    new Set(OFFERS_DATA.flatMap((o) => o.productIds)),
  );

  const dealProducts = useMemo(() => {
    let result = PRODUCTS.filter((p) => offerProductIds.includes(p.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, sortBy, offerProductIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "Offers & Deals" }]} />

      {/* 2. Page Header */}
      <div className="py-6 border-b border-slate-100 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
          Official Promotions
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Offers & Promotional Deals
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Shop official promotional discounts, institutional bundle vouchers,
          and hardware deal pricing across microcontrollers and flight
          controllers.
        </p>
      </div>

      {/* 3. Featured Banner Offer */}
      {featuredOffer && <FeaturedOfferCard offer={featuredOffer} />}

      {/* 4. Active Offers Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Active Promotional Campaigns
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFERS_DATA.map((off) => (
            <div
              key={off.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-2xs hover:border-[#00AEEF]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    off.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  {off.status} Campaign
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  Valid: {off.endDate}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900">
                {off.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {off.shortDescription}
              </p>

              {off.couponCode && (
                <div className="text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>
                    Voucher:{" "}
                    <strong className="text-[#00AEEF] font-mono">
                      {off.couponCode}
                    </strong>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    At Checkout
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Deal Product Grid Toolbar */}
      <div className="space-y-6 pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Products Included in Active Deals
            </h2>
            <p className="text-xs text-slate-500">
              Shop hardware items with special catalogue offer pricing.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deal products..."
                className="w-full bg-slate-50 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="featured">Sort by Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid using existing ProductCard Component */}
        {dealProducts.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3 max-w-sm mx-auto">
            <Tag className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">
              No Offer Products Found
            </h3>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-[#00AEEF] hover:underline"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
