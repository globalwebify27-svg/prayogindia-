"use client";

import React, { useState, useMemo } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { OFFERS_DATA } from "@/data/offersData";
import { PRODUCTS, Product } from "@/data/mockData";
import {
  Search,
  Filter,
  Tag,
  ArrowUpDown,
  Sparkles,
  Zap,
  X,
  SlidersHorizontal,
} from "lucide-react";

export const DealsProductShowcase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "under999" | "under2999" | "above2999">("all");
  const [sortBy, setSortBy] = useState<
    "featured" | "discount-desc" | "price-asc" | "price-desc" | "rating-desc"
  >("featured");

  // Collect all product IDs linked to any offer or products having discounts
  const offerProductIds = useMemo(() => {
    return Array.from(new Set(OFFERS_DATA.flatMap((o) => o.productIds)));
  }, []);

  const dealProducts = useMemo(() => {
    // Start with all products associated with offers or with a noticeable discount/mrp difference
    let list = PRODUCTS.filter(
      (p) => offerProductIds.includes(p.id) || (p.mrp && p.mrp > p.price),
    );

    // Filter by Category
    if (selectedCategory !== "all") {
      list = list.filter((p) => {
        const cat = p.category.toLowerCase();
        if (selectedCategory === "arduino") return cat.includes("arduino") || cat.includes("microcontroller");
        if (selectedCategory === "drones") return cat.includes("drone") || cat.includes("uav");
        if (selectedCategory === "robotics") return cat.includes("robot") || cat.includes("stem");
        if (selectedCategory === "sensors") return cat.includes("sensor") || cat.includes("iot") || cat.includes("wireless");
        return true;
      });
    }

    // Filter by Price Bracket
    if (priceFilter === "under999") {
      list = list.filter((p) => p.price <= 999);
    } else if (priceFilter === "under2999") {
      list = list.filter((p) => p.price > 999 && p.price <= 2999);
    } else if (priceFilter === "above2999") {
      list = list.filter((p) => p.price > 2999);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q),
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-desc") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "discount-desc") {
      list.sort((a, b) => {
        const discA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
        const discB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
        return discB - discA;
      });
    }

    return list;
  }, [offerProductIds, selectedCategory, priceFilter, searchQuery, sortBy]);

  const categories = [
    { id: "all", label: "All Deals" },
    { id: "arduino", label: "Arduino & Dev Boards" },
    { id: "drones", label: "Drones & UAV" },
    { id: "robotics", label: "Robotics & STEM" },
    { id: "sensors", label: "Sensors & Wireless IoT" },
  ];

  return (
    <div id="deal-products" className="space-y-6 pt-6 border-t border-slate-200">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-[#00AEEF] rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>All Discounted Products &amp; Hardware</span>
              <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse {dealProducts.length} mechatronics &amp; electronics components currently with promotional price cuts.
          </p>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deal products..."
              className="w-full bg-slate-50 text-xs pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort products by"
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Deals</option>
              <option value="discount-desc">Highest Discount %</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Top Customer Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Price Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Price Range Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Price:</span>
          <button
            onClick={() => setPriceFilter(priceFilter === "under999" ? "all" : "under999")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              priceFilter === "under999"
                ? "bg-[#00AEEF] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Under ₹999
          </button>
          <button
            onClick={() => setPriceFilter(priceFilter === "under2999" ? "all" : "under2999")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              priceFilter === "under2999"
                ? "bg-[#00AEEF] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            ₹1,000 – ₹2,999
          </button>
          <button
            onClick={() => setPriceFilter(priceFilter === "above2999" ? "all" : "above2999")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              priceFilter === "above2999"
                ? "bg-[#00AEEF] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            &gt; ₹3,000
          </button>
          {(selectedCategory !== "all" || priceFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setPriceFilter("all");
                setSearchQuery("");
              }}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 ml-1 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Cards Grid */}
      {dealProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3 max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Deal Products Found
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            No items matched your active search or category filter. Try clearing your filters to see all promotions.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setPriceFilter("all");
            }}
            className="text-xs font-bold text-[#00AEEF] bg-[#E0F7FC] hover:bg-[#c9f1fa] px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Clear All Filters
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
  );
};
