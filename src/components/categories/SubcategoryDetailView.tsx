"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductCard } from "@/components/products/ProductCard";
import { CATEGORIES_DATA } from "@/data/categories";
import { PRODUCTS } from "@/data/mockData";
import { ArrowLeft, ChevronRight, Layers } from "lucide-react";

interface SubcategoryDetailProps {
  categorySlug: string;
  subcategorySlug: string;
}

export const SubcategoryDetailView: React.FC<SubcategoryDetailProps> = ({
  categorySlug,
  subcategorySlug,
}) => {
  const category =
    CATEGORIES_DATA.find(
      (c) => c.slug === categorySlug || c.slugAlias === categorySlug,
    ) || CATEGORIES_DATA[0];
  const subcategory =
    category.subcategories.find((s) => s.slug === subcategorySlug) ||
    category.subcategories[0];

  // Filter products for this subcategory preview
  const subcategoryProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name, href: `/categories/${category.slug}` },
          { label: subcategory.name },
        ]}
      />

      {/* 2. Subcategory Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Link
              href={`/categories/${category.slug}`}
              className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to {category.name}
            </Link>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-extrabold text-slate-400">
              {subcategory.productCount} Items Available
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900">
            {subcategory.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {subcategory.description}
          </p>
        </div>

        <div className="relative w-40 h-28 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
          <Image
            src={subcategory.image}
            alt={subcategory.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 3. Product Preview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">
            Hardware Products in {subcategory.name}
          </h2>
          <span className="text-xs text-slate-400">Preview Mode</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subcategoryProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* 4. Related Subcategories */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00AEEF]" />
          <span>Other Subcategories in {category.name}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {category.subcategories
            .filter((s) => s.id !== subcategory.id)
            .map((other) => (
              <Link
                key={other.id}
                href={`/categories/${category.slug}/${other.slug}`}
                className="group bg-slate-50 hover:bg-[#E0F7FC] border border-slate-200 p-4 rounded-2xl flex items-center justify-between transition-colors"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#00AEEF]">
                    {other.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {other.productCount} Items
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00AEEF] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
