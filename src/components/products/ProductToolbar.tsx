"use client";

import React from "react";
import { SlidersHorizontal, ArrowUpDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popularity"
  | "best-selling"
  | "highest-rated"
  | "discount"
  | "title-asc"
  | "title-desc";

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
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "discount", label: "Highest Discount" },
  { value: "highest-rated", label: "Customer Rating" },
  { value: "title-asc", label: "Alphabetically: A-Z" },
  { value: "title-desc", label: "Alphabetically: Z-A" },
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
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xs font-sans ${className}`}
    >
      {/* ── Left Part: VIEW AS Grid Switcher, Mobile Trigger & Desktop Filter Toggle ── */}
      <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
        {/* Desktop Filter Minimize / Maximize Button */}
        {onToggleFilter && (
          <button
            type="button"
            onClick={onToggleFilter}
            className={`hidden lg:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 ${
              isFilterOpen
                ? "bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200 hover:border-slate-300"
                : "bg-blue-50 text-[#2563EB] border-blue-200 hover:bg-blue-100/70 shadow-xs"
            }`}
            title={isFilterOpen ? "Collapse & hide filter panel" : "Expand filter panel"}
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? "text-slate-500" : "text-[#2563EB]"}`} />
            <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
          </button>
        )}

        {/* Mobile Filter Toggle Button */}
        <button
          id="mobile-filter-toggle"
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{totalFilteredCount}</span> items
        </div>
      </div>

      {/* ── Right Part: ITEMS PER PAGE & SORT BY Dropdowns ── */}
      <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
        {/* ITEMS PER PAGE Dropdown */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider whitespace-nowrap">
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

        {/* SORT BY Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider whitespace-nowrap">
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
  );
};
