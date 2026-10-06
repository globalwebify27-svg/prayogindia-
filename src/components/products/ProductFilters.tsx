"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  FilterX,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Sparkles,
  Tag,
  Star,
} from "lucide-react";
import { CATEGORIES_DATA, CategoryData } from "@/data/categories";
import { BRANDS_DATA } from "@/data/brands";

export interface TechnicalSpecFilters {
  voltage?: string | null;
  currentPower?: string | null;
  rpmKv?: string | null;
  compatibility?: string | null;
  material?: string | null;
  minRating?: number | null;
  minDiscount?: number | null;
  application?: string | null;
}

export interface CategoryFilterItem {
  id: string;
  name: string;
  slug?: string;
  count?: number;
  subcategories?: {
    id: string;
    name: string;
    slug?: string;
    count?: number;
  }[];
}

export interface ProductFiltersProps {
  // Categories
  categories?: CategoryFilterItem[];
  selectedCategory: string | null;
  onSelectCategory: (catName: string | null) => void;
  selectedSubcategory?: string | null;
  onSelectSubcategory?: (subName: string | null) => void;

  // Brands
  brands?: { id: string; name: string; count?: number }[];
  selectedBrand: string | null;
  onSelectBrand: (brandName: string | null) => void;

  // Stock / Availability
  inStockOnly?: boolean;
  onToggleStockOnly?: (val: boolean) => void;
  outOfStockOnly?: boolean;
  onToggleOutOfStockOnly?: (val: boolean) => void;
  stockFilter?: "all" | "inStock" | "outOfStock";
  onStockFilterChange?: (val: "all" | "inStock" | "outOfStock") => void;
  inStockCount?: number;
  outOfStockCount?: number;

  // Price Range
  minPriceLimit?: number;
  maxPriceLimit?: number;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;

  // Discount & Rating
  minDiscount?: number | null;
  onMinDiscountChange?: (val: number | null) => void;
  minRating?: number | null;
  onMinRatingChange?: (val: number | null) => void;

  // Technical Specs
  techSpecs?: TechnicalSpecFilters;
  onTechSpecChange?: (
    specKey: keyof TechnicalSpecFilters,
    value: string | number | null,
  ) => void;

  // Global actions
  totalActiveCount?: number;
  onClearAll: () => void;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  brands,
  selectedBrand,
  onSelectBrand,
  inStockOnly = false,
  onToggleStockOnly,
  outOfStockOnly = false,
  onToggleOutOfStockOnly,
  stockFilter,
  onStockFilterChange,
  inStockCount,
  outOfStockCount,
  minPriceLimit = 0,
  maxPriceLimit = 60000,
  priceRange,
  onPriceRangeChange,
  minDiscount,
  onMinDiscountChange,
  minRating,
  onMinRatingChange,
  techSpecs = {},
  onTechSpecChange,
  totalActiveCount,
  onClearAll,
  className = "",
}) => {
  // Accordion toggle states
  const [stockOpen, setStockOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  // Subcategory expanded accordion map
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Local price input state for user editing before clicking "APPLY"
  const [inputMin, setInputMin] = useState<number>(priceRange[0]);
  const [inputMax, setInputMax] = useState<number>(priceRange[1]);

  useEffect(() => {
    setInputMin(priceRange[0]);
    setInputMax(priceRange[1]);
  }, [priceRange]);

  const [brandSearch, setBrandSearch] = useState("");

  // Default categories from CATEGORIES_DATA if not provided
  const categoryList: CategoryFilterItem[] = categories || CATEGORIES_DATA.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c.productCount,
    subcategories: c.subcategories?.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      count: s.productCount,
    })),
  }));

  // Default brands from BRANDS_DATA if not provided
  const brandList = brands || BRANDS_DATA.map((b) => ({
    id: b.id,
    name: b.name,
    count: b.count,
  }));

  const filteredBrands = brandList.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  const toggleCategoryExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanMin = Math.max(minPriceLimit, isNaN(inputMin) ? minPriceLimit : inputMin);
    const cleanMax = Math.min(maxPriceLimit, isNaN(inputMax) ? maxPriceLimit : inputMax);
    if (cleanMin <= cleanMax) {
      onPriceRangeChange([cleanMin, cleanMax]);
    } else {
      onPriceRangeChange([cleanMax, cleanMin]);
    }
  };

  // Stock filter handler supporting either dual checkbox or enum
  const handleStockClick = (type: "inStock" | "outOfStock") => {
    if (onStockFilterChange) {
      if (type === "inStock") {
        onStockFilterChange(stockFilter === "inStock" ? "all" : "inStock");
      } else {
        onStockFilterChange(stockFilter === "outOfStock" ? "all" : "outOfStock");
      }
    } else if (type === "inStock" && onToggleStockOnly) {
      onToggleStockOnly(!inStockOnly);
    } else if (type === "outOfStock" && onToggleOutOfStockOnly) {
      onToggleOutOfStockOnly(!outOfStockOnly);
    }
  };

  const isInStockChecked =
    stockFilter === "inStock" || inStockOnly === true;
  const isOutOfStockChecked =
    stockFilter === "outOfStock" || outOfStockOnly === true;

  const hasAnyActiveFilter =
    selectedCategory !== null ||
    selectedSubcategory !== null ||
    selectedBrand !== null ||
    isInStockChecked ||
    isOutOfStockChecked ||
    priceRange[0] > minPriceLimit ||
    priceRange[1] < maxPriceLimit ||
    Boolean(minDiscount) ||
    Boolean(minRating) ||
    Boolean(techSpecs.voltage || techSpecs.rpmKv || techSpecs.compatibility || techSpecs.material);

  return (
    <aside className={`space-y-5 text-slate-800 font-sans ${className}`}>
      {/* ── 1. Top FILTERS Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <span>FILTERS</span>
          {hasAnyActiveFilter && (
            <span className="bg-[#00AEEF] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </h3>

        {hasAnyActiveFilter && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-[#00AEEF] hover:text-[#0096D6] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* ── 2. AVAILABILITY Section ── */}
      <div className="border-b border-slate-200/80 pb-4 space-y-3">
        <button
          type="button"
          onClick={() => setStockOpen(!stockOpen)}
          className="flex items-center justify-between w-full font-black text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>AVAILABILITY</span>
          {stockOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {stockOpen && (
          <div className="space-y-2 pt-1 pl-0.5">
            {/* In Stock */}
            <label className="flex items-center justify-between cursor-pointer group py-0.5 select-none">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isInStockChecked}
                  onChange={() => handleStockClick("inStock")}
                  className="w-4 h-4 rounded border-slate-300 text-[#00AEEF] focus:ring-[#00AEEF] cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  In Stock
                </span>
              </div>
              {inStockCount !== undefined && (
                <span className="text-[11px] font-medium text-slate-400">
                  ({inStockCount})
                </span>
              )}
            </label>

            {/* Out Of Stock */}
            <label className="flex items-center justify-between cursor-pointer group py-0.5 select-none">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isOutOfStockChecked}
                  onChange={() => handleStockClick("outOfStock")}
                  className="w-4 h-4 rounded border-slate-300 text-[#00AEEF] focus:ring-[#00AEEF] cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Out Of Stock
                </span>
              </div>
              {outOfStockCount !== undefined && (
                <span className="text-[11px] font-medium text-slate-400">
                  ({outOfStockCount})
                </span>
              )}
            </label>
          </div>
        )}
      </div>

      {/* ── 3. PRICE Slider & Inputs with APPLY button ── */}
      <div className="border-b border-slate-200/80 pb-4 space-y-3">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full font-black text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>PRICE</span>
          {priceOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {priceOpen && (
          <form onSubmit={handleApplyPrice} className="space-y-3 pt-1">
            {/* Range Slider Track */}
            <div className="space-y-1">
              <input
                type="range"
                min={minPriceLimit}
                max={maxPriceLimit}
                step={100}
                value={inputMax}
                onChange={(e) => setInputMax(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>

            {/* Two Input Boxes: ₹ min to ₹ max */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
                <span className="text-slate-500 font-bold mr-1">₹</span>
                <input
                  type="number"
                  min={minPriceLimit}
                  max={inputMax}
                  value={inputMin}
                  onChange={(e) => setInputMin(Number(e.target.value))}
                  placeholder="Min"
                  className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-none"
                />
              </div>

              <span className="text-slate-400 font-medium text-xs">to</span>

              <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
                <span className="text-slate-500 font-bold mr-1">₹</span>
                <input
                  type="number"
                  min={inputMin}
                  max={maxPriceLimit}
                  value={inputMax}
                  onChange={(e) => setInputMax(Number(e.target.value))}
                  placeholder="Max"
                  className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Prominent APPLY Button */}
            <button
              type="submit"
              className="w-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all duration-200 shadow-xs cursor-pointer active:scale-[0.98] hover:shadow-md"
            >
              APPLY
            </button>
          </form>
        )}
      </div>

      {/* ── 4. CATEGORIES Section with Expandable '+' Accordions ── */}
      <div className="border-b border-slate-200/80 pb-4 space-y-3">
        <button
          type="button"
          onClick={() => setCatOpen(!catOpen)}
          className="flex items-center justify-between w-full font-black text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>CATEGORIES</span>
          {catOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {catOpen && (
          <div className="space-y-1 pt-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {/* Option to clear category / show all */}
            <button
              type="button"
              onClick={() => {
                onSelectCategory(null);
                onSelectSubcategory?.(null);
              }}
              className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                !selectedCategory
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>All Categories</span>
            </button>

            {/* Category Items List */}
            {categoryList.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const hasSubs = cat.subcategories && cat.subcategories.length > 0;
              const isExpanded = expandedCategories[cat.id] || isSelected;

              return (
                <div key={cat.id} className="space-y-0.5">
                  <div
                    onClick={() => {
                      onSelectCategory(isSelected ? null : cat.name);
                      onSelectSubcategory?.(null);
                    }}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-[#E0F7FC] text-[#00AEEF] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate pr-1">{cat.name}</span>

                    <div className="flex items-center gap-1 shrink-0">
                      {cat.count !== undefined && (
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? "text-[#00AEEF]" : "text-slate-400"
                          }`}
                        >
                          ({cat.count})
                        </span>
                      )}

                      {hasSubs && (
                        <button
                          type="button"
                          onClick={(e) => toggleCategoryExpand(cat.id, e)}
                          className="p-0.5 text-slate-400 hover:text-slate-800 rounded transition-colors ml-0.5 cursor-pointer"
                          aria-label={`Toggle ${cat.name} subcategories`}
                        >
                          {isExpanded ? (
                            <Minus className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nested Subcategories */}
                  {hasSubs && isExpanded && (
                    <div className="pl-3.5 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-3">
                      {cat.subcategories!.map((sub) => {
                        const isSubSelected = selectedSubcategory === sub.name;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              onSelectCategory(cat.name);
                              onSelectSubcategory?.(
                                isSubSelected ? null : sub.name,
                              );
                            }}
                            className={`w-full text-left py-1 px-2 rounded-md text-[11px] transition-colors flex items-center justify-between cursor-pointer ${
                              isSubSelected
                                ? "bg-[#00AEEF] text-white font-bold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            {sub.count !== undefined && (
                              <span
                                className={`text-[10px] ${
                                  isSubSelected
                                    ? "text-white/80"
                                    : "text-slate-400"
                                }`}
                              >
                                ({sub.count})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. BRANDS Section with Search ── */}
      <div className="border-b border-slate-200/80 pb-4 space-y-3">
        <button
          type="button"
          onClick={() => setBrandOpen(!brandOpen)}
          className="flex items-center justify-between w-full font-black text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>BRANDS</span>
          {brandOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {brandOpen && (
          <div className="space-y-2 pt-1">
            {/* Brand Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full bg-slate-50 text-[11px] pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Brand Checkboxes List */}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {filteredBrands.map((b) => (
                <label
                  key={b.id}
                  className="flex items-center justify-between gap-2 cursor-pointer py-1 px-1 hover:bg-slate-50 rounded transition-colors group select-none"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrand === b.name}
                      onChange={() =>
                        onSelectBrand(selectedBrand === b.name ? null : b.name)
                      }
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#00AEEF] focus:ring-[#00AEEF] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                      {b.name}
                    </span>
                  </div>
                  {b.count !== undefined && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({b.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 6. DISCOUNT OFFERS (Optional Accordion) ── */}
      <div className="border-b border-slate-200/80 pb-4 space-y-3">
        <button
          type="button"
          onClick={() => setDiscountOpen(!discountOpen)}
          className="flex items-center justify-between w-full font-black text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>DISCOUNT</span>
          {discountOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {discountOpen && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[10, 20, 30, 40, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() =>
                  onMinDiscountChange?.(minDiscount === pct ? null : pct)
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  minDiscount === pct
                    ? "bg-[#FF3B30] text-white border-[#FF3B30] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {pct}%+ OFF
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 7. CUSTOMER RATING ── */}
      <div className="pb-2 space-y-3">
        <button
          type="button"
          onClick={() => setRatingOpen(!ratingOpen)}
          className="flex items-center justify-between w-full font-black text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>RATING</span>
          {ratingOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {ratingOpen && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[4.5, 4.0, 3.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() =>
                  onMinRatingChange?.(minRating === rate ? null : rate)
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  minRating === rate
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{rate} &amp; Above</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
