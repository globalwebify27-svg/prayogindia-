"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CategoriesHeader } from "@/components/categories/CategoriesHeader";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryCollections } from "@/components/categories/CategoryCollections";
import { PopularCategories } from "@/components/categories/PopularCategories";
import { CATEGORIES_DATA } from "@/data/categories";
import { ArrowRight } from "lucide-react";

type FilterTag = "all" | "robotics" | "electronics" | "dev-boards" | "iot" | "stem";
type SortOption = "popular" | "name" | "count";

const FILTER_TAGS: { key: FilterTag; label: string }[] = [
  { key: "all", label: "All" },
  { key: "robotics", label: "Robotics" },
  { key: "electronics", label: "Electronics" },
  { key: "dev-boards", label: "Development Boards" },
  { key: "iot", label: "IoT" },
  { key: "stem", label: "STEM" },
];

export const CategoriesOverviewView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<FilterTag>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  // Client-Side Category Filtering and Sorting
  const filteredCategories = useMemo(() => {
    let list = [...CATEGORIES_DATA];

    // Filter by quick tag
    if (activeTag !== "all") {
      list = list.filter((cat) => {
        const s = cat.slug.toLowerCase();
        const n = cat.name.toLowerCase();
        if (activeTag === "robotics") return s.includes("robot") || n.includes("robot");
        if (activeTag === "electronics")
          return (
            s.includes("electronic") ||
            s.includes("component") ||
            s.includes("sensor") ||
            s.includes("motor") ||
            s.includes("cables")
          );
        if (activeTag === "dev-boards")
          return (
            s.includes("arduino") ||
            s.includes("raspberry") ||
            s.includes("dev") ||
            s.includes("microcontroller")
          );
        if (activeTag === "iot")
          return s.includes("iot") || s.includes("wireless") || s.includes("communication");
        if (activeTag === "stem")
          return s.includes("stem") || s.includes("educational") || s.includes("project");
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.shortDescription.toLowerCase().includes(query) ||
          cat.subcategories.some((sub) => sub.name.toLowerCase().includes(query)),
      );
    }

    // Sort
    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "count") {
      list.sort((a, b) => b.productCount - a.productCount);
    } else if (sortBy === "popular") {
      // Keep curated priority order
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [searchQuery, activeTag, sortBy]);

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3.5 sm:py-5 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Banner Header */}
      <CategoriesHeader
        onBrowseAll={() => {
          setActiveTag("all");
          setSearchQuery("");
          const el = document.getElementById("browse-categories-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 2. Quick Filter Tags & Sort Bar */}
      <div
        id="browse-categories-section"
        className="bg-white rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 shadow-sm flex flex-wrap items-center justify-between gap-3"
      >
        {/* Quick Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag.key}
              onClick={() => setActiveTag(tag.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTag === tag.key
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Category Count Sub-Row */}
      <div className="flex items-center justify-end px-1 -mt-2">
        <span className="text-xs font-bold text-slate-400">
          Showing{" "}
          <span className="text-slate-900 font-extrabold">
            {filteredCategories.length}
          </span>{" "}
          main categories
        </span>
      </div>

      {/* 4. Main Category Grid (4 columns) */}
      {filteredCategories.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-700">
            No categories matching &quot;{searchQuery || activeTag}&quot;
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveTag("all");
            }}
            className="text-xs font-black text-[#2563EB] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4.5">
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
      <div className="bg-gradient-to-r from-[#2563EB] to-[#1E56A0] text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-black">
          Need Bulk Institutional Hardware Procurement?
        </h3>
        <p className="text-xs text-white/90 max-w-xl mx-auto">
          We provide proforma invoicing, GST compliance, and customized
          laboratory packages for universities and schools.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#FFC20E] text-slate-950 font-black px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md cursor-pointer"
        >
          <span>Request B2B Quotation</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
