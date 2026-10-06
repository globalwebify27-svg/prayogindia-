"use client";

import React from "react";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

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
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xs font-sans ${className}`}
    >
      {/* ── Left Part: VIEW AS Grid Switcher & Mobile Trigger ── */}
      <div className="flex items-center justify-between sm:justify-start gap-4">
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

        {/* VIEW AS (1, 2, 3, 4 Column Switcher) */}
        {onColumnsChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              VIEW AS
            </span>

            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              {/* 1 Column / List View */}
              <button
                type="button"
                onClick={() => onColumnsChange(1)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  columns === 1
                    ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-900/10"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="1 Column (List)"
                aria-label="1 Column View"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="2" y="3" width="12" height="2" rx="0.5" />
                  <rect x="2" y="7" width="12" height="2" rx="0.5" />
                  <rect x="2" y="11" width="12" height="2" rx="0.5" />
                </svg>
              </button>

              {/* 2 Columns */}
              <button
                type="button"
                onClick={() => onColumnsChange(2)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  columns === 2
                    ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-900/10"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="2 Columns"
                aria-label="2 Columns View"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="3" y="2" width="4" height="12" rx="0.5" />
                  <rect x="9" y="2" width="4" height="12" rx="0.5" />
                </svg>
              </button>

              {/* 3 Columns */}
              <button
                type="button"
                onClick={() => onColumnsChange(3)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  columns === 3
                    ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-900/10"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="3 Columns"
                aria-label="3 Columns View"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="2" y="2" width="3" height="12" rx="0.5" />
                  <rect x="6.5" y="2" width="3" height="12" rx="0.5" />
                  <rect x="11" y="2" width="3" height="12" rx="0.5" />
                </svg>
              </button>

              {/* 4 Columns */}
              <button
                type="button"
                onClick={() => onColumnsChange(4)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  columns === 4
                    ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-900/10"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="4 Columns"
                aria-label="4 Columns View"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="1.5" y="2" width="2.2" height="12" rx="0.5" />
                  <rect x="5.1" y="2" width="2.2" height="12" rx="0.5" />
                  <rect x="8.7" y="2" width="2.2" height="12" rx="0.5" />
                  <rect x="12.3" y="2" width="2.2" height="12" rx="0.5" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="hidden xl:block text-xs font-semibold text-slate-400">
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
