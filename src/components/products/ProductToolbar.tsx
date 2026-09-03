"use client";

import React from "react";
import { SlidersHorizontal, ArrowUpDown, LayoutGrid, List } from "lucide-react";

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popularity"
  | "best-selling"
  | "highest-rated"
  | "discount";

interface ProductToolbarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenMobileFilters: () => void;
  totalFilteredCount: number;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Relevance / Featured" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
  { value: "best-selling", label: "Best Selling" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "discount", label: "Highest Discount" },
];

export const ProductToolbar: React.FC<ProductToolbarProps> = ({
  sortBy,
  onSortChange,
  onOpenMobileFilters,
  totalFilteredCount,
  viewMode = "grid",
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 my-2">
      {/* Left — Mobile Filter Button + Count */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          id="mobile-filter-toggle"
          onClick={onOpenMobileFilters}
          className="lg:hidden bg-white text-slate-800 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs hover:border-[#00AEEF] hover:text-[#00AEEF] transition-colors cursor-pointer"
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#00AEEF]" />
          Filters
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Showing{" "}
          <strong className="text-slate-900 font-extrabold">
            {totalFilteredCount}
          </strong>{" "}
          product{totalFilteredCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Right — View Mode + Sort */}
      <div className="flex items-center gap-2 shrink-0">
        {/* View Toggle */}
        {onViewModeChange && (
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === "grid"
                  ? "bg-[#00AEEF] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === "list"
                  ? "bg-[#00AEEF] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Sort:
          </span>
          <select
            id="product-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-white text-slate-900 text-xs font-extrabold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] shadow-2xs cursor-pointer"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
