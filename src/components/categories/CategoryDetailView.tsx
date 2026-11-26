"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { FilterFunnelIcon } from "@/components/icons/FilterFunnelIcon";
import { ProductEmptyState } from "@/components/products/ProductEmptyState";
import { CategoryData, CATEGORIES_DATA, matchCategory } from "@/data/categories";
import { PRODUCTS, Product } from "@/data/mockData";
import { isProductInCategory } from "@/lib/categoryMapping";
import { getProductDiscount } from "@/lib/discount";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  getCachedProducts,
  hasCachedProducts,
  fetchAndCacheLiveCatalog,
} from "@/lib/productCatalogCache";
import {
  ArrowRight,
  ChevronRight,
  Layers,
  X,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface CategoryDetailProps {
  categorySlug: string;
}

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

export const CategoryDetailView: React.FC<CategoryDetailProps> = ({
  categorySlug,
}) => {
  const store = useStore();

  // Find category data by slug or alias
  const category =
    CATEGORIES_DATA.find((c) => matchCategory(c, categorySlug)) ||
    CATEGORIES_DATA[0];

  const [productList, setProductList] = useState<Product[]>(() => getCachedProducts());
  const [isLoading, setIsLoading] = useState(() => !hasCachedProducts());

  // Fetch live products from DB/API
  useEffect(() => {
    let isMounted = true;
    fetchAndCacheLiveCatalog([])
      .then(({ products }) => {
        if (isMounted) {
          setProductList(products);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("CategoryDetailView: API fetch error", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products belonging to this category
  const allCategoryProducts = useMemo(() => {
    return productList.filter((p) => {
      // 1. Check robust category matching
      if (
        isProductInCategory(p, category.name) ||
        isProductInCategory(p, category.slug) ||
        (category.shortName && isProductInCategory(p, category.shortName))
      ) {
        return true;
      }

      // 2. Check alias matches
      if (category.slugAlias) {
        const aliases = Array.isArray(category.slugAlias)
          ? category.slugAlias
          : [category.slugAlias];
        if (aliases.some((a) => isProductInCategory(p, a))) {
          return true;
        }
      }

      // 3. Check subcategories
      return category.subcategories.some((sub) => {
        return (
          isProductInCategory(p, sub.name) ||
          isProductInCategory(p, sub.slug)
        );
      });
    });
  }, [category, productList]);

  // Filter states
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
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
    allCategoryProducts.forEach((p) => {
      if (p.inStock) inCount++;
      else outCount++;
    });
    return { inStockCount: inCount, outOfStockCount: outCount };
  }, [allCategoryProducts]);

  // Available brands in this category
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allCategoryProducts.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [allCategoryProducts]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...allCategoryProducts];

    // Subcategory filter
    if (selectedSubcategory) {
      const subLower = selectedSubcategory.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(subLower) ||
          (p.subcategory &&
            p.subcategory.toLowerCase().includes(subLower)) ||
          p.category.toLowerCase().includes(subLower),
      );
    }

    // Brand filter
    if (selectedBrand) {
      const bLower = selectedBrand.toLowerCase();
      list = list.filter(
        (p) =>
          (p.brand || "").toLowerCase().includes(bLower) ||
          p.name.toLowerCase().includes(bLower),
      );
    }

    // Stock filter
    if (stockFilter === "inStock") {
      list = list.filter((p) => p.inStock);
    } else if (stockFilter === "outOfStock") {
      list = list.filter((p) => !p.inStock);
    }

    // Price filter
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    // Discount filter
    if (minDiscount !== null && minDiscount > 0) {
      list = list.filter((p) => getProductDiscount(p) >= minDiscount);
    }

    // Rating filter
    if (minRating !== null) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)),
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "highest-rated":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;

      case "discount":
        list.sort((a, b) => {
          const discA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
          const discB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
          return discB - discA;
        });
        break;
      case "newest":
        // Preserve mock order
        break;
      default:
        break;
    }

    return list;
  }, [
    allCategoryProducts,
    selectedSubcategory,
    selectedBrand,
    stockFilter,
    priceRange,
    minDiscount,
    minRating,
    searchQuery,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedSubcategory(null);
    setSelectedBrand(null);
    setStockFilter("all");
    setPriceRange([0, 60000]);
    setMinDiscount(null);
    setMinRating(null);
    setSearchQuery("");
  };

  const activeFiltersCount =
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (stockFilter !== "all" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 60000 ? 1 : 0) +
    (minDiscount !== null && minDiscount > 0 ? 1 : 0) +
    (minRating !== null && minRating > 0 ? 1 : 0);

  const getGridColsClass = () => {
    if (columns === 1) return "grid grid-cols-1 gap-3 sm:gap-5";
    if (columns === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6";
    if (columns === 3)
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5";
    return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5";
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-6 space-y-3.5 sm:space-y-5 animate-in fade-in duration-300 font-sans">
      {/* 1. Breadcrumb (Home > Products > Category) */}
      <CategoryBreadcrumb
        items={[
          { label: "Products", href: "/products" },
          { label: category.name },
        ]}
      />

      {/* 2. Subcategories: 4-Column Cards on Desktop (>= sm); on mobile (< sm) shown directly inside the Filter Toolbar */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-1">
          {category.subcategories.map((sub) => {
            const isSelected = selectedSubcategory === sub.name;
            return (
              <SubcategoryCardItem
                key={sub.id}
                sub={sub}
                isSelected={isSelected}
                onSelect={() =>
                  setSelectedSubcategory(isSelected ? null : sub.name)
                }
              />
            );
          })}
        </div>
      )}

      {/* 3. Filter Toolbar & Active Chips */}
      <div className="space-y-3 pt-1">
        <ActiveFilters
          category={selectedSubcategory}
          brand={selectedBrand}
          inStockOnly={stockFilter === "inStock"}
          minPrice={priceRange[0]}
          maxPrice={priceRange[1]}
          searchQuery={searchQuery}
          onRemoveCategory={() => setSelectedSubcategory(null)}
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
          subcategories={category.subcategories}
          selectedSubcategory={selectedSubcategory}
          onSubcategoryChange={setSelectedSubcategory}
        />
      </div>

      {/* 5. Main Catalog Layout: Left Filter Sidebar + Immediate Products Grid */}
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
                  products={allCategoryProducts}
                  hideCategories={true}
                  selectedCategory={category.name}
                  onSelectCategory={() => {}}
                  selectedSubcategory={selectedSubcategory}
                  onSelectSubcategory={setSelectedSubcategory}
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
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
          {isLoading ? (
            <div className={getGridColsClass()}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <ProductEmptyState onClearFilters={clearAllFilters} />
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
                type="button"
                onClick={() => setVisibleCount((prev) => prev + itemsPerPage)}
                className="bg-slate-900 hover:bg-[#2563EB] text-white font-extrabold px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Load More Products —{" "}
                {filteredProducts.length - visibleCount} remaining
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer (Smooth Slide-in from LEFT) */}
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
                    Filter Products
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
                  products={allCategoryProducts}
                  hideCategories={true}
                  selectedCategory={category.name}
                  onSelectCategory={() => {}}
                  selectedSubcategory={selectedSubcategory}
                  onSelectSubcategory={(sub) => {
                    setSelectedSubcategory(sub);
                    setMobileFilterOpen(false);
                  }}
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
