"use client";

import React from "react";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  category?: string | null;
  brand?: string | null;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  onRemoveCategory: () => void;
  onRemoveBrand: () => void;
  onRemoveStock: () => void;
  onResetPrice: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  category,
  brand,
  inStockOnly,
  minPrice,
  maxPrice,
  searchQuery,
  onRemoveCategory,
  onRemoveBrand,
  onRemoveStock,
  onResetPrice,
  onClearSearch,
  onClearAll,
}) => {
  const hasActiveFilters =
    category ||
    brand ||
    inStockOnly ||
    (minPrice && minPrice > 0) ||
    (maxPrice && maxPrice < 50000) ||
    searchQuery;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
        Active Filters:
      </span>

      {searchQuery && (
        <span className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#00AEEF]/20">
          <span>Search: &quot;{searchQuery}&quot;</span>
          <button onClick={onClearSearch} className="hover:text-slate-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {category && (
        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
          <span>Category: {category}</span>
          <button onClick={onRemoveCategory} className="hover:text-red-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {brand && (
        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
          <span>Brand: {brand}</span>
          <button onClick={onRemoveBrand} className="hover:text-red-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {inStockOnly && (
        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
          <span>In Stock Only</span>
          <button onClick={onRemoveStock} className="hover:text-red-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {((minPrice && minPrice > 0) || (maxPrice && maxPrice < 50000)) && (
        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
          <span>
            Price: ₹{minPrice || 0} - ₹{maxPrice || 50000}
          </span>
          <button onClick={onResetPrice} className="hover:text-red-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      <button
        onClick={onClearAll}
        className="text-xs font-black text-[#FF3B30] hover:underline ml-2"
      >
        Clear All
      </button>
    </div>
  );
};
