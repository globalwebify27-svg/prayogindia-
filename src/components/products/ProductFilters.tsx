"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  Star,
} from "lucide-react";
import { CATEGORIES_DATA } from "@/data/categories";
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
  hideCategories?: boolean;
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
  hideCategories = false,
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
  const [priceOpen, setPriceOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Local price inputs
  const [inputMin, setInputMin] = useState<number>(priceRange[0]);
  const [inputMax, setInputMax] = useState<number>(priceRange[1]);
  const [brandSearch, setBrandSearch] = useState("");

  useEffect(() => {
    setInputMin(priceRange[0]);
    setInputMax(priceRange[1]);
  }, [priceRange]);

  // Context-aware category detection
  const currentCategoryData = selectedCategory
    ? CATEGORIES_DATA.find(
        (c) =>
          c.name.toLowerCase() === selectedCategory.toLowerCase() ||
          c.slug.toLowerCase() === selectedCategory.toLowerCase(),
      )
    : null;

  const relevantSubcategories = currentCategoryData?.subcategories || [];

  // Default categories list for site-wide views
  const categoryList: CategoryFilterItem[] =
    categories ||
    CATEGORIES_DATA.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c.productCount,
    }));

  // Default brands
  const brandList =
    brands ||
    BRANDS_DATA.map((b) => ({
      id: b.id,
      name: b.name,
      count: b.count,
    }));

  const filteredBrands = brandList.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  const displayedBrands = showAllBrands
    ? filteredBrands
    : filteredBrands.slice(0, 6);

  // 1-Click Price Presets
  const PRICE_PRESETS: { label: string; range: [number, number] }[] = [
    { label: "All", range: [minPriceLimit, maxPriceLimit] },
    { label: "Under ₹1k", range: [0, 1000] },
    { label: "₹1k - ₹5k", range: [1000, 5000] },
    { label: "₹5k - ₹20k", range: [5000, 20000] },
    { label: "₹20k+", range: [20000, maxPriceLimit] },
  ];

  const handleApplyPrice = () => {
    const cleanMin = Math.max(
      minPriceLimit,
      isNaN(inputMin) ? minPriceLimit : inputMin,
    );
    const cleanMax = Math.min(
      maxPriceLimit,
      isNaN(inputMax) ? maxPriceLimit : inputMax,
    );
    if (cleanMin <= cleanMax) {
      onPriceRangeChange([cleanMin, cleanMax]);
    } else {
      onPriceRangeChange([cleanMax, cleanMin]);
    }
  };

  const handlePresetClick = (range: [number, number]) => {
    setInputMin(range[0]);
    setInputMax(range[1]);
    onPriceRangeChange(range);
  };

  // Stock filter toggle handler
  const handleStockToggle = () => {
    if (onStockFilterChange) {
      onStockFilterChange(stockFilter === "inStock" ? "all" : "inStock");
    } else if (onToggleStockOnly) {
      onToggleStockOnly(!inStockOnly);
    }
  };

  const isInStockChecked = stockFilter === "inStock" || inStockOnly === true;

  // Active filters calculation
  const isPriceFiltered =
    priceRange[0] > minPriceLimit || priceRange[1] < maxPriceLimit;
  const isPresetActive = (r: [number, number]) =>
    priceRange[0] === r[0] && priceRange[1] === r[1];

  const activeFiltersCount =
    (selectedCategory && !hideCategories ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (isInStockChecked ? 1 : 0) +
    (isPriceFiltered ? 1 : 0) +
    (minDiscount ? 1 : 0) +
    (minRating ? 1 : 0);

  const hasAnyActiveFilter = activeFiltersCount > 0;

  return (
    <aside className={`space-y-4 text-slate-800 font-sans ${className}`}>
      {/* ── 1. Top Filters Header ── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {hasAnyActiveFilter && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ── 2. Modern In-Stock Only Toggle ── */}
      <div className="flex items-center justify-between py-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">In Stock Only</span>
          {inStockCount !== undefined && (
            <span className="text-[10px] font-semibold text-slate-400">
              ({inStockCount})
            </span>
          )}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isInStockChecked}
          onClick={handleStockToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isInStockChecked ? "bg-[#2563EB]" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isInStockChecked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* ── 3. Price Filter with 1-Click Presets & Clean Inputs ── */}
      <div className="border-b border-slate-100 pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full font-bold text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>Price Range</span>
          {priceOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {priceOpen && (
          <div className="space-y-3 pt-0.5">
            {/* 1-Click Easy Preset Pills */}
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map((preset) => {
                const isSelected = isPresetActive(preset.range);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset.range)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#0A233F] text-white border-[#0A233F] shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Range Slider Track */}
            <div className="space-y-1">
              <input
                type="range"
                min={minPriceLimit}
                max={maxPriceLimit}
                step={250}
                value={inputMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInputMax(val);
                  onPriceRangeChange([inputMin, val]);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
            </div>

            {/* Clean Inline Min – Max Inputs */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={minPriceLimit}
                  max={inputMax}
                  value={inputMin}
                  onChange={(e) => setInputMin(Number(e.target.value))}
                  onBlur={handleApplyPrice}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPrice()}
                  placeholder="Min"
                  className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <span className="text-slate-400 text-xs font-medium">to</span>

              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={inputMin}
                  max={maxPriceLimit}
                  value={inputMax}
                  onChange={(e) => setInputMax(Number(e.target.value))}
                  onBlur={handleApplyPrice}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPrice()}
                  placeholder="Max"
                  className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. CATEGORIES / SUBCATEGORIES Section (Clean & Context-Aware) ── */}
      {!hideCategories && (
        <div className="border-b border-slate-100 pb-4 space-y-2.5">
          <button
            type="button"
            onClick={() => setCatOpen(!catOpen)}
            className="flex items-center justify-between w-full font-bold text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
          >
            <span>
              {relevantSubcategories.length > 0 ? "Subcategory" : "Category"}
            </span>
            {catOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {catOpen && (
            <div className="space-y-1 pt-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {relevantSubcategories.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectSubcategory?.(null)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                      !selectedSubcategory
                        ? "bg-[#0A233F] text-white font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span>All {currentCategoryData?.name}</span>
                  </button>

                  {relevantSubcategories.map((sub) => {
                    const isSelected = selectedSubcategory === sub.name;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() =>
                          onSelectSubcategory?.(isSelected ? null : sub.name)
                        }
                        className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 text-[#2563EB] font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="truncate pr-1">{sub.name}</span>
                        {sub.productCount !== undefined && (
                          <span className="text-[10px] text-slate-400">
                            ({sub.productCount})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(null);
                      onSelectSubcategory?.(null);
                    }}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                      !selectedCategory
                        ? "bg-[#0A233F] text-white font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span>All Categories</span>
                  </button>

                  {categoryList.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onSelectCategory(isSelected ? null : cat.name);
                          onSelectSubcategory?.(null);
                        }}
                        className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 text-[#2563EB] font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <span className="truncate pr-1">{cat.name}</span>
                        {cat.count !== undefined && (
                          <span className="text-[10px] text-slate-400">
                            ({cat.count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 5. BRANDS Section with Compact View ── */}
      <div className="border-b border-slate-100 pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => setBrandOpen(!brandOpen)}
          className="flex items-center justify-between w-full font-bold text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>Brands</span>
          {brandOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {brandOpen && (
          <div className="space-y-2 pt-0.5">
            {/* Compact Brand Search (only shown if more than 6 brands) */}
            {brandList.length > 6 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Filter brands..."
                  className="w-full bg-slate-50 text-xs pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
                />
              </div>
            )}

            {/* Brand Checkboxes List */}
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {displayedBrands.map((b) => (
                <label
                  key={b.id}
                  className="flex items-center justify-between gap-2 cursor-pointer py-1 px-1 hover:bg-slate-50 rounded-md transition-colors group select-none"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrand === b.name}
                      onChange={() =>
                        onSelectBrand(selectedBrand === b.name ? null : b.name)
                      }
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                      {b.name}
                    </span>
                  </div>
                  {b.count !== undefined && (
                    <span className="text-[10px] text-slate-400">
                      ({b.count})
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* Show More / Less Brands button */}
            {filteredBrands.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer pt-0.5"
              >
                {showAllBrands
                  ? "Show Less"
                  : `+ ${filteredBrands.length - 6} More Brands`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 6. DISCOUNT OFFERS (Clean & Collapsible) ── */}
      <div className="border-b border-slate-100 pb-3 space-y-2">
        <button
          type="button"
          onClick={() => setDiscountOpen(!discountOpen)}
          className="flex items-center justify-between w-full font-bold text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>Discount</span>
          {discountOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {discountOpen && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[10, 20, 30, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() =>
                  onMinDiscountChange?.(minDiscount === pct ? null : pct)
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  minDiscount === pct
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {pct}%+ Off
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 7. CUSTOMER RATING (Clean & Collapsible) ── */}
      <div className="pb-1 space-y-2">
        <button
          type="button"
          onClick={() => setRatingOpen(!ratingOpen)}
          className="flex items-center justify-between w-full font-bold text-slate-900 text-xs tracking-wider text-left cursor-pointer uppercase select-none"
        >
          <span>Rating</span>
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
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{rate}★ & Up</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProductFilters;
