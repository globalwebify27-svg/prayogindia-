"use client";

import React from "react";
import Image from "next/image";
import { Loader2, ArrowRight, Sparkles, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { SearchSuggestionItem } from "@/hooks/useSearchSuggestions";

interface SearchSuggestionsDropdownProps {
  isOpen: boolean;
  query: string;
  suggestions: SearchSuggestionItem[];
  isLoading: boolean;
  selectedIndex?: number;
  onSelectProduct: (product: SearchSuggestionItem) => void;
  onViewAll: () => void;
  onSelectKeyword?: (keyword: string) => void;
  className?: string;
}

const QUICK_DISCOVERY = ["Arduino", "Raspberry Pi", "ESP32", "Drone Motor", "Flight Controller", "LiDAR"];

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  isOpen,
  query,
  suggestions,
  isLoading,
  selectedIndex = -1,
  onSelectProduct,
  onViewAll,
  onSelectKeyword,
  className = "",
}) => {
  if (!isOpen || !query.trim()) return null;

  return (
    <div
      className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md overflow-hidden ${className}`}
      role="listbox"
      aria-label="Search suggestions"
    >
      {/* Header bar */}
      <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-2 py-1 flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Product Suggestions</span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold lowercase">
              <Loader2 className="w-3 h-3 animate-spin" />
              searching...
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">
              {suggestions.length} {suggestions.length === 1 ? "match" : "matches"}
            </span>
          )}
        </div>
      </div>

      {/* Body List */}
      <div className="space-y-1 mt-2 max-h-[380px] overflow-y-auto divide-y divide-slate-50 overscroll-contain">
        {isLoading && suggestions.length === 0 ? (
          <div className="py-6 px-4 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold text-slate-600">Searching components & kits...</p>
            <p className="text-[11px] text-slate-400">Optimized with minimal database load</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-6 px-3 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              No products found for &ldquo;<span className="text-blue-600">{query}</span>&rdquo;
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Try checking for typos or explore popular hardware categories:
            </p>
            {onSelectKeyword && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                {QUICK_DISCOVERY.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => onSelectKeyword(kw)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          suggestions.map((product, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={product.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelectProduct(product)}
                className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-50 text-blue-900 border border-blue-200"
                    : "hover:bg-slate-50 text-slate-800"
                }`}
              >
                {/* Product Thumbnail */}
                <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded">
                      {product.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {product.sku}
                    </span>
                    {product.inStock ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">
                        Pre-Order
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-[10px] text-slate-400 line-through block">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link to view full search results */}
      {suggestions.length > 0 && (
        <div className="pt-2.5 mt-1 border-t border-slate-100 flex items-center justify-between px-2">
          <span className="text-[10px] text-slate-400">
            Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Enter</kbd> to search all
          </span>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
