"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { CategoriesHeader } from "@/components/categories/CategoriesHeader";
import { CategorySearch } from "@/components/categories/CategorySearch";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryCollections } from "@/components/categories/CategoryCollections";
import { PopularCategories } from "@/components/categories/PopularCategories";
import { CATEGORIES_DATA } from "@/data/categories";
import { ArrowRight } from "lucide-react";

export const CategoriesOverviewView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Frontend Client-Side Category Filtering
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES_DATA;
    const query = searchQuery.toLowerCase();
    return CATEGORIES_DATA.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.shortDescription.toLowerCase().includes(query) ||
        cat.subcategories.some((sub) => sub.name.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "Categories" }]} />

      {/* 2. Page Header */}
      <CategoriesHeader />

      {/* 3. Category Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <CategorySearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
        <div className="text-xs font-bold text-slate-400">
          Showing{" "}
          <span className="text-slate-900">{filteredCategories.length}</span>{" "}
          main categories
        </div>
      </div>

      {/* 4. Main Category Grid (3-4 columns) */}
      {filteredCategories.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-50 rounded-3xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700">
            No categories matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs font-black text-[#00AEEF] hover:underline"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat, idx) => (
            <CategoryCard key={cat.id} category={cat} index={idx} />
          ))}
        </div>
      )}

      {/* 5. Category Collections */}
      <CategoryCollections />

      {/* 6. Popular Categories Carousel */}
      <PopularCategories />

      {/* 7. Explore CTA */}
      <div className="bg-gradient-to-r from-[#00AEEF] to-[#1E56A0] text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-black">
          Need Bulk Institutional Hardware Procurement?
        </h3>
        <p className="text-xs text-white/90 max-w-xl mx-auto">
          We provide proforma invoicing, GST compliance, and customized
          laboratory packages for universities and schools.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#FFC20E] text-slate-950 font-black px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md"
        >
          <span>Request B2B Quotation</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
