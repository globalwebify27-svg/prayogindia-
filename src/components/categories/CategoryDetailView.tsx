"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryData, CATEGORIES_DATA } from "@/data/categories";
import { PRODUCTS } from "@/data/mockData";
import { ArrowRight, ChevronRight, Layers } from "lucide-react";

interface CategoryDetailProps {
  categorySlug: string;
}

export const CategoryDetailView: React.FC<CategoryDetailProps> = ({
  categorySlug,
}) => {
  // Find category data by slug
  const category =
    CATEGORIES_DATA.find(
      (c) => c.slug === categorySlug || c.slugAlias === categorySlug,
    ) || CATEGORIES_DATA[0];

  // Filter products for this category
  const categoryProducts = PRODUCTS.filter((p) => {
    const catLower = category.name.toLowerCase();
    const shortLower = (category.shortName || "").toLowerCase();
    const pCat = p.category.toLowerCase();
    const pSub = (p.subcategory || "").toLowerCase();

    if (
      pCat.includes(catLower) ||
      catLower.includes(pCat) ||
      (shortLower && (pCat.includes(shortLower) || shortLower.includes(pCat)))
    ) {
      return true;
    }

    return category.subcategories.some((sub) => {
      const subLower = sub.name.toLowerCase();
      return (
        p.name.toLowerCase().includes(subLower) ||
        pCat.includes(subLower) ||
        pSub.includes(subLower)
      );
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      {/* 2. Category Header & Description */}
      <div className="bg-gradient-to-r from-[#0A1128] via-[#0F172A] to-[#1E56A0] text-white rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 z-10 max-w-2xl">
          <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
            {category.productCount.toLocaleString()}+ Hardware Items
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {category.fullDescription}
          </p>
        </div>

        <div className="relative w-48 h-36 rounded-2xl overflow-hidden border border-white/20 shrink-0 z-10 hidden sm:block">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 3. Subcategories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00AEEF]" />
            <span>Subcategories in {category.name}</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {category.subcategories.length} Subcategories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {category.subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/categories/${category.slug}/${sub.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:border-[#00AEEF] hover:shadow-lg transition-all"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                <Image
                  src={sub.image}
                  alt={sub.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-[#00AEEF] transition-colors truncate">
                  {sub.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {sub.productCount} Products
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00AEEF] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Featured Category Products */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">
            Featured Products in {category.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(categoryProducts.length > 0
            ? categoryProducts
            : PRODUCTS.slice(0, 4)
          ).map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* 5. Related Categories */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-900">
          Related Categories
        </h3>
        <div
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES_DATA.filter((c) => c.id !== category.id).map((rel) => (
            <Link
              key={rel.id}
              href={`/categories/${rel.slug}`}
              className="shrink-0 bg-slate-50 hover:bg-[#E0F7FC] border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#00AEEF] transition-colors flex items-center gap-1"
            >
              <span>{rel.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
