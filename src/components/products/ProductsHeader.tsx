"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Layers, ChevronDown } from "lucide-react";
import { CATEGORIES_DATA, matchCategory } from "@/data/categories";

interface ProductsHeaderProps {
  title?: string;
  description?: string;
  totalCount: number;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  selectedSubcategory?: string | null;
  onSelectSubcategory?: (subcategory: string | null) => void;
}

const QUICK_CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "Robot Kits", name: "Robot Kits" },
  { id: "Motors", name: "Motors" },
  { id: "Controllers", name: "Controllers" },
  { id: "Sensors", name: "Sensors" },
  { id: "Development Boards", name: "Development Boards" },
  { id: "Educational & STEM Kits", name: "Educational & STEM Kits" },
  { id: "Accessories", name: "Accessories" },
];

const SubcategoryCardItem: React.FC<{
  sub: { id: string; name: string; image?: string; productCount?: number };
  isSelected: boolean;
  onSelect: () => void;
}> = ({ sub, isSelected, onSelect }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group bg-white rounded-2xl border p-3 sm:p-3.5 flex items-center gap-3 sm:gap-3.5 transition-all text-left cursor-pointer ${
        isSelected
          ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-blue-50/20 shadow-xs"
          : "border-slate-200/90 hover:border-[#2563EB]/70 hover:shadow-xs shadow-2xs"
      }`}
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 flex items-center justify-center">
        {!imgError && sub.image ? (
          <Image
            src={sub.image}
            alt={sub.name}
            fill
            sizes="48px"
            onError={() => setImgError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Layers className="w-5 h-5 text-blue-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={`text-xs sm:text-[13px] font-bold truncate transition-colors ${
            isSelected ? "text-[#2563EB]" : "text-slate-900 group-hover:text-[#2563EB]"
          }`}
        >
          {sub.name}
        </h3>
      </div>
    </button>
  );
};

const MobileSubcategoryPill: React.FC<{
  sub: { id: string; name: string; image?: string; productCount?: number };
  isSelected: boolean;
  onSelect: () => void;
}> = ({ sub, isSelected, onSelect }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`shrink-0 inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none active:scale-95 ${
        isSelected
          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
          : "bg-white text-slate-800 border-slate-200/90 active:bg-slate-50 shadow-2xs"
      }`}
    >
      <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200/60 flex items-center justify-center">
        {!imgError && sub.image ? (
          <Image
            src={sub.image}
            alt={sub.name}
            fill
            sizes="24px"
            onError={() => setImgError(true)}
            className="object-cover"
          />
        ) : (
          <Layers className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-blue-500"}`} />
        )}
      </div>
      <span className="whitespace-nowrap font-medium text-[12px]">{sub.name}</span>
    </button>
  );
};

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  selectedCategory = null,
  onSelectCategory,
  selectedSubcategory = null,
  onSelectSubcategory,
}) => {
  // Find matching category to extract its subcategories when active
  const activeCategory = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORIES_DATA.find((c) => matchCategory(c, selectedCategory));
  }, [selectedCategory]);

  return (
    <div className="space-y-4 pt-1">
      {/* ── Subcategories: Simple Dropdown on Mobile (< sm), Cards Grid on Desktop (>= sm) ── */}
      {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
        <div className="py-1">
          {/* Mobile View (< sm): Simple Subcategory Dropdown Select */}
          <div className="block sm:hidden">
            <div className="relative">
              <select
                value={selectedSubcategory || ""}
                onChange={(e) => onSelectSubcategory?.(e.target.value || null)}
                className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 appearance-none pr-9 shadow-2xs focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 outline-hidden cursor-pointer"
              >
                <option value="">All Subcategories</option>
                {activeCategory.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Desktop View (>= sm): 4-Column Cards Grid */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {activeCategory.subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub.name;
              return (
                <SubcategoryCardItem
                  key={sub.id}
                  sub={sub}
                  isSelected={isSelected}
                  onSelect={() =>
                    onSelectSubcategory?.(isSelected ? null : sub.name)
                  }
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Main Category Filter Pills Row (when All Products is selected) ── */
        onSelectCategory && (
          <div
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
            style={{ scrollbarWidth: "none" }}
          >
            {QUICK_CATEGORIES.map((cat) => {
              const isSelected =
                (!selectedCategory && cat.id === "all") ||
                selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    onSelectCategory(cat.id === "all" ? null : cat.name)
                  }
                  className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 scale-[1.02]"
                      : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
