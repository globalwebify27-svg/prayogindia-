"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { FilterFunnelIcon } from "@/components/icons/FilterFunnelIcon";

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popularity"
  | "best-selling"
  | "highest-rated"
  | "discount";

export type GridColumns = 1 | 2 | 3 | 4;

interface ProductToolbarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenMobileFilters: () => void;
  totalFilteredCount: number;
  columns?: GridColumns;
  onColumnsChange?: (cols: GridColumns) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (items: number) => void;
  itemsPerPageOptions?: number[];
  isFilterOpen?: boolean;
  onToggleFilter?: () => void;
  className?: string;
  subcategories?: { id?: string; name: string }[];
  selectedSubcategory?: string | null;
  onSubcategoryChange?: (sub: string | null) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "discount", label: "Highest Discount" },
  { value: "highest-rated", label: "Customer Rating" },
  { value: "newest", label: "Newest Arrivals" },
];

export const ProductToolbar: React.FC<ProductToolbarProps> = ({
  sortBy,
  onSortChange,
  onOpenMobileFilters,
  totalFilteredCount,
  columns = 4,
  onColumnsChange,
  itemsPerPage = 20,
  onItemsPerPageChange,
  itemsPerPageOptions = [12, 20, 36, 48],
  isFilterOpen = true,
  onToggleFilter,
  className = "",
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
}) => {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xs font-sans ${className}`}
    >
      {/* ── MOBILE VIEW: Filter Button & Subcategory / Item Count ── */}
      <div className="flex sm:hidden items-center justify-between w-full gap-2">
        <button
          id="mobile-filter-toggle"
          type="button"
          onClick={onOpenMobileFilters}
          className="bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          aria-label="Open Filters"
        >
          <FilterFunnelIcon className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        {subcategories && subcategories.length > 0 && onSubcategoryChange ? (
          <div className="relative flex-1 max-w-[210px] min-w-[130px]">
            <select
              value={selectedSubcategory || ""}
              onChange={(e) => onSubcategoryChange(e.target.value || null)}
              aria-label="Select Subcategory"
              className="w-full bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-800 appearance-none shadow-2xs focus:border-[#2563EB] focus:bg-white focus:ring-1 focus:ring-[#2563EB]/20 outline-hidden cursor-pointer truncate"
            >
              <option value="">All Subcategories</option>
              {subcategories.map((sub) => (
                <option key={sub.id || sub.name} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Showing <span className="text-slate-900 font-bold">{totalFilteredCount}</span> items
          </div>
        )}
      </div>

      {/* ── DESKTOP VIEW: Full Controls (Hidden on Mobile) ── */}
      <div className="hidden sm:flex items-center justify-between gap-4 w-full">
        {/* Left: Item Count */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            aria-label="Open Filters"
          >
            <FilterFunnelIcon className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{totalFilteredCount}</span> items
          </div>
        </div>

        {/* Right: Items Per Page & Sort By */}
        <div className="flex items-center gap-4">
          {onItemsPerPageChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider whitespace-nowrap">
                ITEMS PER PAGE
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                aria-label="Items per page"
                className="bg-white text-slate-900 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
              >
                {itemsPerPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value={999}>All</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider whitespace-nowrap">
              SORT BY
            </span>
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort products"
              className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer min-w-[130px]"
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
    </div>
  );
};
