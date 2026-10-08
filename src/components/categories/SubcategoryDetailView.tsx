"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductCard } from "@/components/products/ProductCard";
import {
  ProductToolbar,
  SortOption,
  GridColumns,
} from "@/components/products/ProductToolbar";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { ProductEmptyState } from "@/components/products/ProductEmptyState";
import { CATEGORIES_DATA } from "@/data/categories";
import { PRODUCTS, Product } from "@/data/mockData";
import {
  ArrowLeft,
  ChevronRight,
  Layers,
  X,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface SubcategoryDetailProps {
  categorySlug: string;
  subcategorySlug: string;
}

export const SubcategoryDetailView: React.FC<SubcategoryDetailProps> = ({
  categorySlug,
  subcategorySlug,
}) => {
  const store = useStore();

  const category =
    CATEGORIES_DATA.find(
      (c) => c.slug === categorySlug || c.slugAlias === categorySlug,
    ) || CATEGORIES_DATA[0];
  const subcategory =
    category.subcategories.find((s) => s.slug === subcategorySlug) ||
    category.subcategories[0];

  // Filter products for this subcategory
  const allSubcategoryProducts = useMemo(() => {
    const subLower = subcategory.name.toLowerCase();
    const catLower = category.name.toLowerCase();

    const matches = PRODUCTS.filter((p) => {
      const pSub = (p.subcategory || "").toLowerCase();
      const pCat = p.category.toLowerCase();
      const pName = p.name.toLowerCase();

      return (
        pSub.includes(subLower) ||
        pName.includes(subLower) ||
        (pCat.includes(catLower) &&
          pName.includes(subcategory.slug.split("-")[0]))
      );
    });

    return matches.length > 0 ? matches : PRODUCTS.slice(0, 12);
  }, [subcategory, category]);

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<
    "all" | "inStock" | "outOfStock"
  >("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 60000]);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [columns, setColumns] = useState<GridColumns>(4);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Stock counts
  const { inStockCount, outOfStockCount } = useMemo(() => {
    let inCount = 0;
    let outCount = 0;
    allSubcategoryProducts.forEach((p) => {
      if (p.inStock) inCount++;
      else outCount++;
    });
    return { inStockCount: inCount, outOfStockCount: outCount };
  }, [allSubcategoryProducts]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...allSubcategoryProducts];

    if (selectedBrand) {
      list = list.filter((p) =>
        (p.brand ?? p.name)
          .toLowerCase()
          .includes(selectedBrand.toLowerCase()),
      );
    }

    if (stockFilter === "inStock") {
      list = list.filter((p) => p.inStock);
    } else if (stockFilter === "outOfStock") {
      list = list.filter((p) => !p.inStock);
    }

    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    if (minDiscount) {
      list = list.filter((p) => {
        const mrp = p.mrp || Math.round(p.price * 1.35);
        const disc = ((mrp - p.price) / mrp) * 100;
        return disc >= minDiscount;
      });
    }

    if (minRating) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "highest-rated") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "title-asc") return a.name.localeCompare(b.name);
      if (sortBy === "title-desc") return b.name.localeCompare(a.name);
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      if (sortBy === "discount") {
        const mrpA = a.mrp || Math.round(a.price * 1.35);
        const mrpB = b.mrp || Math.round(b.price * 1.35);
        const discA = (mrpA - a.price) / mrpA;
        const discB = (mrpB - b.price) / mrpB;
        return discB - discA;
      }
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [
    allSubcategoryProducts,
    selectedBrand,
    stockFilter,
    priceRange,
    minDiscount,
    minRating,
    searchQuery,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedBrand(null);
    setStockFilter("all");
    setPriceRange([0, 60000]);
    setMinDiscount(null);
    setMinRating(null);
    setSearchQuery("");
  };

  const getGridColsClass = () => {
    if (columns === 1) return "";
    if (columns === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6";
    if (columns === 3)
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5";
    return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5";
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 animate-in fade-in duration-300 font-sans">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name, href: `/categories/${category.slug}` },
          { label: subcategory.name },
        ]}
      />

      {/* 2. Subcategory Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-sky-50/20 to-slate-50 border border-slate-200/80 shadow-xs p-6 sm:p-8 lg:p-10">
        {/* Subtle background ambient glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#00AEEF]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 lg:gap-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/categories/${category.slug}`}
                className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to {category.name}
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00AEEF]/10 text-[#0086B8] border border-[#00AEEF]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#00AEEF]" />
                {subcategory.productCount} Items Available
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {subcategory.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              {subcategory.description}
            </p>
          </div>

          {subcategory.image && (
            <div className="relative shrink-0 self-center md:self-auto hidden sm:block">
              <div className="relative w-48 h-32 sm:w-56 sm:h-36 rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-md p-2 group">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-50">
                  <Image
                    src={subcategory.image}
                    alt={subcategory.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Filter Toolbar & Active Chips */}
      <div className="space-y-3 pt-2">
        <ActiveFilters
          category={subcategory.name}
          brand={selectedBrand}
          inStockOnly={stockFilter === "inStock"}
          minPrice={priceRange[0]}
          maxPrice={priceRange[1]}
          searchQuery={searchQuery}
          onRemoveCategory={() => {}}
          onRemoveBrand={() => setSelectedBrand(null)}
          onRemoveStock={() => setStockFilter("all")}
          onResetPrice={() => setPriceRange([0, 60000])}
          onClearSearch={() => setSearchQuery("")}
          onClearAll={clearAllFilters}
        />

        <ProductToolbar
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenMobileFilters={() => setMobileFilterOpen(true)}
          totalFilteredCount={filteredProducts.length}
          columns={columns}
          onColumnsChange={setColumns}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(num) => {
            setItemsPerPage(num);
            setVisibleCount(num);
          }}
        />
      </div>

      {/* 4. Main Catalog Layout: Left Filter Sidebar + Right Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <ProductFilters
            selectedCategory={category.name}
            onSelectCategory={() => {}}
            selectedSubcategory={subcategory.name}
            onSelectSubcategory={() => {}}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            inStockCount={inStockCount}
            outOfStockCount={outOfStockCount}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            minDiscount={minDiscount}
            onMinDiscountChange={setMinDiscount}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            onClearAll={clearAllFilters}
          />
        </div>

        {/* Right Product Grid */}
        <div className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <ProductEmptyState onClearFilters={clearAllFilters} />
          ) : columns === 1 ? (
            <div className="space-y-3">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start gap-4 p-4 hover:border-[#00AEEF]/50 hover:shadow-md transition-all"
                >
                  <div className="relative w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {product.sku}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => store?.addToCart?.(product)}
                        className="bg-slate-900 hover:bg-[#00AEEF] text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-colors active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={getGridColsClass()}>
              {filteredProducts.slice(0, visibleCount).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

          {visibleCount < filteredProducts.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + itemsPerPage)}
                className="bg-slate-900 hover:bg-[#00AEEF] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Load More Products —{" "}
                {filteredProducts.length - visibleCount} remaining
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Related Subcategories */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00AEEF]" />
          <span>Other Subcategories in {category.name}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {category.subcategories
            .filter((s) => s.id !== subcategory.id)
            .map((other) => (
              <Link
                key={other.id}
                href={`/categories/${category.slug}/${other.slug}`}
                className="group bg-slate-50 hover:bg-[#E0F7FC] border border-slate-200 p-3.5 rounded-xl flex items-center justify-between transition-colors"
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

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Filter {subcategory.name}
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilters
              selectedCategory={category.name}
              onSelectCategory={() => {}}
              selectedSubcategory={subcategory.name}
              onSelectSubcategory={() => {}}
              selectedBrand={selectedBrand}
              onSelectBrand={(b) => {
                setSelectedBrand(b);
                setMobileFilterOpen(false);
              }}
              stockFilter={stockFilter}
              onStockFilterChange={(s) => {
                setStockFilter(s);
                setMobileFilterOpen(false);
              }}
              inStockCount={inStockCount}
              outOfStockCount={outOfStockCount}
              priceRange={priceRange}
              onPriceRangeChange={(r) => {
                setPriceRange(r);
                setMobileFilterOpen(false);
              }}
              minDiscount={minDiscount}
              onMinDiscountChange={(d) => {
                setMinDiscount(d);
                setMobileFilterOpen(false);
              }}
              minRating={minRating}
              onMinRatingChange={(r) => {
                setMinRating(r);
                setMobileFilterOpen(false);
              }}
              onClearAll={() => {
                clearAllFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
