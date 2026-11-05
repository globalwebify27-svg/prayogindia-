"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  Star,
  Check,
  X,
  Tag,
} from "lucide-react";
import { CATEGORIES_DATA } from "@/data/categories";
import { BRANDS_DATA, getBrandsForCategory } from "@/data/brands";
import { PRODUCTS } from "@/data/mockData";

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
  const [discountOpen, setDiscountOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  // Brand Dropdown states
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Close brand dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandDropdownOpen(false);
      }
    }
    if (isBrandDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBrandDropdownOpen]);

  // Local price inputs
  const [inputMin, setInputMin] = useState<number>(priceRange[0]);
  const [inputMax, setInputMax] = useState<number>(priceRange[1]);

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

  // Context-aware Brands filtered by active Category
  const brandList = useMemo(() => {
    if (brands && brands.length > 0) {
      return brands;
    }
    return getBrandsForCategory(selectedCategory, PRODUCTS);
  }, [brands, selectedCategory]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brandList;
    return brandList.filter((b) =>
      b.name.toLowerCase().includes(brandSearch.toLowerCase().trim()),
    );
  }, [brandList, brandSearch]);

  // If category changes and currently selected brand is no longer in this category, reset it safely
  useEffect(() => {
    if (selectedBrand && brandList.length > 0) {
      const isAvailable = brandList.some(
        (b) => b.name.toLowerCase() === selectedBrand.toLowerCase(),
      );
      if (!isAvailable) {
        onSelectBrand(null);
      }
    }
  }, [brandList, selectedBrand, onSelectBrand]);

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
                        ? "bg-[#2563EB] text-white font-bold"
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
                        ? "bg-[#2563EB] text-white font-bold"
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

      {/* ── 5. BRANDS Section with Category-Aware Dropdown ── */}
      <div className="border-b border-slate-100 pb-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 text-xs tracking-wider uppercase select-none flex items-center gap-1.5">
            <span>Brand</span>
            {selectedCategory && (
              <span className="text-[10px] text-slate-400 font-normal lowercase tracking-normal">
                (in category)
              </span>
            )}
          </label>
          {selectedBrand && (
            <button
              type="button"
              onClick={() => onSelectBrand(null)}
              className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Dropdown Container */}
        <div ref={brandDropdownRef} className="relative">
          {/* Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
            aria-haspopup="listbox"
            aria-expanded={isBrandDropdownOpen}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer bg-white text-left ${
              isBrandDropdownOpen
                ? "border-[#2563EB] ring-2 ring-[#2563EB]/10 shadow-xs"
                : selectedBrand
                ? "border-[#2563EB]/60 bg-blue-50/20 text-slate-900 shadow-2xs"
                : "border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <Tag
                className={`w-3.5 h-3.5 shrink-0 ${
                  selectedBrand ? "text-[#2563EB]" : "text-slate-400"
                }`}
              />
              <span className="truncate">
                {selectedBrand
                  ? selectedBrand
                  : `All Brands (${brandList.length})`}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {selectedBrand && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBrand(null);
                  }}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Clear brand filter"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isBrandDropdownOpen ? "rotate-180 text-[#2563EB]" : ""
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Menu */}
          {isBrandDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200/90 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Optional Search inside dropdown if > 5 brands */}
              {brandList.length > 5 && (
                <div className="p-2 border-b border-slate-100 bg-slate-50/60">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Search brands..."
                      autoFocus
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#2563EB] text-slate-800 placeholder:text-slate-400 font-medium"
                    />
                    {brandSearch && (
                      <button
                        type="button"
                        onClick={() => setBrandSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Scrollable Brands List */}
              <div className="max-h-56 overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
                {/* "All Brands" Default Option */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectBrand(null);
                    setIsBrandDropdownOpen(false);
                    setBrandSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                    !selectedBrand
                      ? "bg-blue-50 text-[#2563EB]"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>All Brands</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({brandList.length})
                    </span>
                  </div>
                  {!selectedBrand && (
                    <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                  )}
                </button>

                {/* Filtered Brands in Category */}
                {filteredBrands.length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-slate-400">
                    No brands match &ldquo;{brandSearch}&rdquo;
                  </div>
                ) : (
                  filteredBrands.map((b) => {
                    const isSelected = selectedBrand === b.name;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onSelectBrand(isSelected ? null : b.name);
                          setIsBrandDropdownOpen(false);
                          setBrandSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                          isSelected
                            ? "bg-blue-50 text-[#2563EB]"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className="truncate">{b.name}</span>
                          {b.count !== undefined && (
                            <span
                              className={`text-[10px] font-normal ${
                                isSelected
                                  ? "text-[#2563EB]/80"
                                  : "text-slate-400"
                              }`}
                            >
                              ({b.count})
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
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
