"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Layers } from "lucide-react";
import { CATEGORIES_DATA, matchCategory, Subcategory } from "@/data/categories";

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

const SubcategoryCard: React.FC<{
  sub: Subcategory;
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
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">
          {sub.productCount} Products
        </p>
      </div>
    </button>
  );
};

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  selectedCategory = null,
  onSelectCategory,
  selectedSubcategory = null,
  onSelectSubcategory,
}) => {
  // Determine active category for the subcategories section.
  // Defaults to "Educational & STEM Kits" when All Products is selected.
  const activeCategory = useMemo(() => {
    if (selectedCategory) {
      const match = CATEGORIES_DATA.find((c) => matchCategory(c, selectedCategory));
      if (match && match.subcategories && match.subcategories.length > 0) {
        return match;
      }
    }
    return (
      CATEGORIES_DATA.find((c) => c.slug === "educational-stem-kits") ||
      CATEGORIES_DATA[0]
    );
  }, [selectedCategory]);

  return (
    <div className="space-y-4 pt-1">
      {/* ── 1. Clean Category Filter Pills Row (Image 1) ── */}
      {onSelectCategory && (
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
      )}

      {/* ── 2. Subcategories Section (Image 2) ── */}
      {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
        <div className="space-y-3 pt-0.5 pb-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#2563EB]" />
              <span>Subcategories in {activeCategory.name}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {activeCategory.subcategories.length} Subcategories
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {activeCategory.subcategories.map((sub) => (
              <SubcategoryCard
                key={sub.id}
                sub={sub}
                isSelected={selectedSubcategory === sub.name}
                onSelect={() => {
                  if (onSelectSubcategory) {
                    onSelectSubcategory(
                      selectedSubcategory === sub.name ? null : sub.name
                    );
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
