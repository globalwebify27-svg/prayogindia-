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
import { CategoryData, CATEGORIES_DATA } from "@/data/categories";
import { PRODUCTS, Product } from "@/data/mockData";
import {
  ArrowRight,
  ChevronRight,
  Layers,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface CategoryDetailProps {
  categorySlug: string;
}

export const CategoryDetailView: React.FC<CategoryDetailProps> = ({
  categorySlug,
}) => {
  const store = useStore();

  // Find category data by slug
  const category =
    CATEGORIES_DATA.find(
      (c) => c.slug === categorySlug || c.slugAlias === categorySlug,
    ) || CATEGORIES_DATA[0];

  // Filter products belonging to this category
  const allCategoryProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const catLower = category.name.toLowerCase();
      const shortLower = (category.shortName || "").toLowerCase();
      const pCat = p.category.toLowerCase();
      const pSub = (p.subcategory || "").toLowerCase();

      if (
        pCat.includes(catLower) ||
        catLower.includes(pCat) ||
        (shortLower &&
          (pCat.includes(shortLower) || shortLower.includes(pCat)))
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
  }, [category]);

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
      list = list.filter((p) => p.brand === selectedBrand);
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
    if (minDiscount !== null) {
      list = list.filter((p) => {
        if (!p.mrp || p.mrp <= p.price) return false;
        const discount = ((p.mrp - p.price) / p.mrp) * 100;
        return discount >= minDiscount;
      });
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

  const getGridColsClass = () => {
    if (columns === 1) return "grid grid-cols-1 gap-3 sm:gap-4";
    if (columns === 2) return "grid grid-cols-2 gap-2.5 sm:gap-4";
    if (columns === 3)
      return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4";
    return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4";
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-6 space-y-3.5 sm:space-y-6 animate-in fade-in duration-300 font-sans">
      {/* 1. Breadcrumb (Desktop/Tablet) */}
      <div className="hidden sm:block">
        <CategoryBreadcrumb
          items={[
            { label: "Categories", href: "/categories" },
            { label: category.name },
          ]}
        />
      </div>

      {/* 2. Mobile Compact Category Header (Direct Focus on Products) */}
      <div className="sm:hidden flex items-center justify-between pb-1.5 border-b border-slate-100 gap-2">
        <div className="min-w-0">
          <h1 className="text-base font-black text-slate-900 tracking-tight truncate">
            {selectedSubcategory || category.name}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            {filteredProducts.length} Products
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 active:scale-95 shrink-0 shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Filters</span>
        </button>
      </div>

      {/* Category Heading for Screen Readers & SEO */}
      <h1 className="sr-only">{category.name}</h1>

      {/* 3. Mobile Subcategories: Clean Horizontal Scrollable Filter Chips */}
      {category.subcategories.length > 0 && (
        <div
          className="sm:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x touch-pan-y"
          style={{ touchAction: "pan-x pan-y" }}
        >
          <button
            type="button"
            onClick={() => setSelectedSubcategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedSubcategory === null
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 border border-slate-200/80"
            }`}
          >
            All
          </button>
          {category.subcategories.map((sub) => {
            const isSelected = selectedSubcategory === sub.name;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() =>
                  setSelectedSubcategory(isSelected ? null : sub.name)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Desktop Subcategories Grid */}
      {category.subcategories.length > 0 && (
        <div className="hidden sm:block space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>Subcategories in {category.name}</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {category.subcategories.length} Subcategories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub.name;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() =>
                    setSelectedSubcategory(isSelected ? null : sub.name)
                  }
                  className={`group bg-white rounded-xl border p-3 flex items-center gap-3 transition-all text-left cursor-pointer ${
                    isSelected
                      ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-sm"
                      : "border-slate-200 hover:border-[#2563EB] hover:shadow-xs"
                  }`}
                >
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                    <Image
                      src={sub.image}
                      alt={sub.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xs font-extrabold truncate ${
                        isSelected ? "text-[#2563EB]" : "text-slate-900"
                      }`}
                    >
                      {sub.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {sub.productCount} Products
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Filter Toolbar & Active Chips (Hidden on small mobile to maximize product focus) */}
      <div className="hidden sm:block space-y-3 pt-1">
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
        />
      </div>

      {/* 5. Main Catalog Layout: Left Filter Sidebar + Immediate Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <ProductFilters
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
          />
        </div>

        {/* Right Product Grid */}
        <div className="lg:col-span-9 space-y-4 sm:space-y-6">
          {filteredProducts.length === 0 ? (
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

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl space-y-4 z-10 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Filter Products
              </h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProductFilters
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
