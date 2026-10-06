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

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...allCategoryProducts];

    if (selectedSubcategory) {
      const subLower = selectedSubcategory.toLowerCase();
      list = list.filter(
        (p) =>
          (p.subcategory || "").toLowerCase().includes(subLower) ||
          p.name.toLowerCase().includes(subLower),
      );
    }

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
          { label: category.name },
        ]}
      />

      {/* 2. Category Header & Description */}
      <div className="bg-gradient-to-r from-[#0A1128] via-[#0F172A] to-[#1E56A0] text-white rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/30 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2.5 z-10 max-w-2xl">
          <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
            {category.productCount.toLocaleString()}+ Hardware Items
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {category.fullDescription}
          </p>
        </div>

        <div className="relative w-40 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden border border-white/20 shrink-0 z-10 hidden sm:block">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 3. Subcategories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00AEEF]" />
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
                    ? "border-[#00AEEF] ring-2 ring-[#00AEEF]/20 shadow-sm"
                    : "border-slate-200 hover:border-[#00AEEF] hover:shadow-xs"
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
                      isSelected ? "text-[#00AEEF]" : "text-slate-900"
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

      {/* 4. Filter Toolbar & Active Chips */}
      <div className="space-y-3 pt-2">
        <ActiveFilters
          category={selectedSubcategory || category.name}
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

      {/* 5. Main Catalog Layout: Left Filter Sidebar + Right Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <ProductFilters
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

      {/* 6. Related Categories */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <h3 className="text-base font-black text-slate-900">
          Related Categories
        </h3>
        <div
          className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES_DATA.filter((c) => c.id !== category.id).map((rel) => (
            <Link
              key={rel.id}
              href={`/categories/${rel.slug}`}
              className="shrink-0 bg-slate-50 hover:bg-[#E0F7FC] border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#00AEEF] transition-colors flex items-center gap-1"
            >
              <span>{rel.name}</span>
              <ArrowRight className="w-3 h-3" />
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
                Filter {category.name}
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
