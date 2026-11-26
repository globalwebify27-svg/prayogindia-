"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import { FilterFunnelIcon } from "@/components/icons/FilterFunnelIcon";
import { CATEGORIES_DATA, matchCategory, matchSubcategory } from "@/data/categories";
import { PRODUCTS, Product } from "@/data/mockData";
import { getProductDiscount } from "@/lib/discount";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  ChevronRight,
  Layers,
  X,
  ShieldCheck,
  ShoppingCart,
  PanelLeftClose,
  PanelLeftOpen,
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
    CATEGORIES_DATA.find((c) => matchCategory(c, categorySlug)) ||
    CATEGORIES_DATA[0];
  const subcategory =
    category.subcategories.find((s) => matchSubcategory(s, subcategorySlug)) ||
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
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Bulletproof lock of background scroll on mobile touch & desktop wheel
  useBodyScrollLock(mobileFilterOpen);

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

  // Available brands in this subcategory
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allSubcategoryProducts.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
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

    if (minDiscount !== null && minDiscount > 0) {
      list = list.filter((p) => getProductDiscount(p) >= minDiscount);
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

  const activeFiltersCount =
    (selectedBrand ? 1 : 0) +
    (stockFilter !== "all" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 60000 ? 1 : 0) +
    (minDiscount !== null && minDiscount > 0 ? 1 : 0) +
    (minRating !== null && minRating > 0 ? 1 : 0);

  const getGridColsClass = () => {
    if (columns === 1) return "";
    if (columns === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6";
    if (columns === 3)
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5";
    return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5";
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 space-y-8 animate-in fade-in duration-300 font-sans">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name, href: `/categories/${category.slug}` },
          { label: subcategory.name },
        ]}
      />

      {/* 3. Filter Toolbar & Active Chips */}
      <div className="space-y-3 pt-2">
        <ActiveFilters
          category={null}
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
          isFilterOpen={isFilterOpen}
          onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
        />
      </div>

      {/* 4. Main Catalog Layout: Left Filter Sidebar + Right Products Grid */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start w-full">
        {/* Left Filter Sidebar (Desktop) — Expandable / Collapsible with Smooth Easing & Zero Screen Shake */}
        <aside
          className={`hidden lg:block shrink-0 sticky top-24 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-[width,padding,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFilterOpen
              ? "w-64 xl:w-72 2xl:w-80 p-5"
              : "w-12 py-5 px-1 cursor-pointer hover:border-[#2563EB] hover:shadow-md group active:scale-[0.98]"
          }`}
          onClick={!isFilterOpen ? () => setIsFilterOpen(true) : undefined}
          title={!isFilterOpen ? "Maximize & Open Filters Window" : undefined}
          aria-label={isFilterOpen ? "Product Filters" : "Open Product Filters"}
        >
          <div className="relative w-full">
            {/* Expanded view */}
            <div
              className={`transition-opacity duration-200 ${
                isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none absolute top-0 left-0"
              }`}
            >
              <div className="w-56 xl:w-64 2xl:w-72">
                <ProductFilters
                  products={allSubcategoryProducts}
                  hideCategories={true}
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
                  onToggleCollapse={() => setIsFilterOpen(false)}
                />
              </div>
            </div>

            {/* Collapsed rail */}
            <div
              className={`flex flex-col items-center justify-center transition-opacity duration-200 select-none ${
                !isFilterOpen ? "opacity-100 delay-150" : "opacity-0 pointer-events-none absolute top-0 left-0 w-full"
              }`}
            >
              <FilterFunnelIcon className="w-4 h-4 text-[#2563EB] group-hover:scale-110 transition-transform mb-3 stroke-[2.2]" />
              <span className="[writing-mode:vertical-rl] text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#2563EB] rotate-180 py-1 transition-colors">
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center mt-3 shadow-xs">
                  {activeFiltersCount}
                </span>
              )}
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="flex-1 min-w-0 space-y-6">
          {filteredProducts.length === 0 ? (
            <ProductEmptyState onClearFilters={clearAllFilters} />
          ) : columns === 1 ? (
            <div className="space-y-3">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start gap-4 p-4 hover:border-[#2563EB]/50 hover:shadow-md transition-all"
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
                        className="border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-2xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>ADD TO CART</span>
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
                className="bg-slate-900 hover:bg-[#2563EB] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
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
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span>Other Subcategories in {category.name}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {category.subcategories
            .filter((s) => s.id !== subcategory.id)
            .map((other) => (
              <Link
                key={other.id}
                href={`/categories/${category.slug}/${other.slug}`}
                className="group bg-slate-50 hover:bg-[#EFF6FF] border border-slate-200 p-3.5 rounded-xl flex items-center justify-between transition-colors"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#2563EB]">
                    {other.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {other.productCount} Items
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
        </div>
      </div>

      {/* Mobile Filter Drawer (Smooth Slide-in from LEFT) */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-start overscroll-contain">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileFilterOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs touch-none"
              aria-hidden="true"
            />

            {/* Drawer Sidebar from LEFT */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-[85vw] max-w-xs sm:max-w-sm bg-white h-full max-h-[100dvh] shadow-2xl flex flex-col z-10 font-sans border-r border-slate-200 overscroll-contain"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <FilterFunnelIcon className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Filter {subcategory.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
                <ProductFilters
                  products={allSubcategoryProducts}
                  hideCategories={true}
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
                  onPriceRangeChange={setPriceRange}
                  minDiscount={minDiscount}
                  onMinDiscountChange={(d) => {
                    setMinDiscount(d);
                  }}
                  minRating={minRating}
                  onMinRatingChange={(r) => {
                    setMinRating(r);
                  }}
                  onClearAll={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                />
              </div>

              {/* Action Bar Footer */}
              <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
