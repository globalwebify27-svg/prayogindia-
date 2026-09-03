"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import {
  ProductToolbar,
  SortOption,
} from "@/components/products/ProductToolbar";
import {
  ProductFilters,
  TechnicalSpecFilters,
} from "@/components/products/ProductFilters";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductEmptyState } from "@/components/products/ProductEmptyState";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { PRODUCTS, Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { searchProductsFuzzy } from "@/lib/fuzzySearch";
import { X, Search, Clock, TrendingUp, Sparkles, Tag } from "lucide-react";

const POPULAR_SEARCHES = [
  "Arduino UNO R4",
  "ESP32-S3",
  "Raspberry Pi 5",
  "Pixhawk 6C",
  "LiPo 4S",
  "LiDAR RPLiDAR",
  "MPU6050",
  "Mecanum Wheel",
  "BLDC Motor 1000KV",
  "NRF24L01",
  "HC-SR04",
  "MG996R Servo",
  "SpeedyBee F405",
];

const MAX_HISTORY = 8;

function ProductsContent() {
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || null;
  const initialSearch =
    searchParams.get("search") || searchParams.get("q") || "";

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory,
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [techSpecs, setTechSpecs] = useState<TechnicalSpecFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const {
    cart,
    wishlist,
    addToCart: storeAddToCart,
    toggleWishlist: storeToggleWishlist,
  } = useStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((p) => p.id)),
    [wishlist],
  );

  const handleTechSpecChange = (
    key: keyof TechnicalSpecFilters,
    value: string | number | null,
  ) => {
    setTechSpecs((prev) => ({ ...prev, [key]: value }));
  };

  const commitSearch = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const updated = [query, ...prev.filter((h) => h !== query)].slice(
        0,
        MAX_HISTORY,
      );
      return updated;
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitSearch(searchQuery);
      setSearchFocused(false);
    }
  };

  const handlePopularSearch = (q: string) => {
    setSearchQuery(q);
    commitSearch(q);
    setSearchFocused(false);
  };

  const toggleWishlist = (product: Product) => {
    storeToggleWishlist(product);
  };

  // ── Filter & Sort Logic ──
  const filteredProducts = useMemo(() => {
    let result = searchProductsFuzzy(PRODUCTS, searchQuery);

    if (selectedCategory) {
      result = result.filter((p) =>
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()),
      );
    }

    if (selectedBrand) {
      result = result.filter((p) =>
        (p.brand ?? p.name).toLowerCase().includes(selectedBrand.toLowerCase()),
      );
    }

    if (inStockOnly) result = result.filter((p) => p.inStock);

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    if (techSpecs.voltage) {
      const v = techSpecs.voltage.toLowerCase();
      result = result.filter(
        (p) =>
          p.specs?.["Operating Voltage"]?.toLowerCase().includes(v) ||
          p.description.toLowerCase().includes(v) ||
          p.name.toLowerCase().includes(v),
      );
    }
    if (techSpecs.rpmKv) {
      const r = techSpecs.rpmKv.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(r) ||
          p.description.toLowerCase().includes(r),
      );
    }
    if (techSpecs.compatibility) {
      const c = techSpecs.compatibility.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(c) ||
          p.description.toLowerCase().includes(c) ||
          p.category.toLowerCase().includes(c),
      );
    }
    if (techSpecs.material) {
      const m = techSpecs.material.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(m) ||
          p.description.toLowerCase().includes(m),
      );
    }
    if (techSpecs.minRating) {
      result = result.filter(
        (p) => p.rating >= (techSpecs.minRating as number),
      );
    }
    if (techSpecs.minDiscount) {
      result = result.filter((p) => {
        const pct =
          p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
        return pct >= (techSpecs.minDiscount as number);
      });
    }

    // ── All 8 Sort Modes ──
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "highest-rated":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result = [...result].sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "popularity":
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      case "best-selling":
        result = [...result].sort(
          (a, b) => b.reviews * b.rating - a.reviews * a.rating,
        );
        break;
      case "discount":
        result = [...result].sort((a, b) => {
          const discA = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
          const discB = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
          return discB - discA;
        });
        break;
      case "featured":
      default:
        // Featured: badges first, then by rating
        result = [...result].sort((a, b) => {
          const aScore = (a.badge ? 10 : 0) + a.rating;
          const bScore = (b.badge ? 10 : 0) + b.rating;
          return bScore - aScore;
        });
        break;
    }

    return result;
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    inStockOnly,
    priceRange,
    techSpecs,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setInStockOnly(false);
    setPriceRange([0, 50000]);
    setTechSpecs({});
    setSearchQuery("");
  };

  const showSearchSuggest = searchFocused && searchQuery.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 space-y-3 sm:space-y-4 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: "Products" },
          ...(selectedCategory ? [{ label: selectedCategory }] : []),
        ]}
      />

      {/* Page Header */}
      <ProductsHeader
        totalCount={filteredProducts.length}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* ── Search Box with Suggestions ── */}
      <div className="relative max-w-2xl w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <input
          id="product-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Instant search — name, SKU, brand, or specs (e.g. rasberry, arduno, pixhok)..."
          className="w-full bg-white text-xs sm:text-sm pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all shadow-sm"
          autoComplete="off"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Suggestions Dropdown */}
        {showSearchSuggest && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            {searchHistory.length > 0 && (
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-2">
                  <Clock className="w-3 h-3" /> Recent Searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchHistory.map((h) => (
                    <button
                      key={h}
                      onMouseDown={() => handlePopularSearch(h)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 mb-2">
                <TrendingUp className="w-3 h-3" /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((q) => (
                  <button
                    key={q}
                    onMouseDown={() => handlePopularSearch(q)}
                    className="bg-[#E0F7FC] hover:bg-[#B3EBF9] text-[#00AEEF] text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      <ActiveFilters
        category={selectedCategory}
        brand={selectedBrand}
        inStockOnly={inStockOnly}
        minPrice={priceRange[0]}
        maxPrice={priceRange[1]}
        searchQuery={searchQuery}
        onRemoveCategory={() => setSelectedCategory(null)}
        onRemoveBrand={() => setSelectedBrand(null)}
        onRemoveStock={() => setInStockOnly(false)}
        onResetPrice={() => setPriceRange([0, 50000])}
        onClearSearch={() => setSearchQuery("")}
        onClearAll={clearAllFilters}
      />

      {/* Toolbar */}
      <ProductToolbar
        sortBy={sortBy}
        onSortChange={setSortBy}
        onOpenMobileFilters={() => setMobileFilterOpen(true)}
        totalFilteredCount={filteredProducts.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content — Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white border border-slate-200 p-5 rounded-3xl shadow-2xs">
          <ProductFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            inStockOnly={inStockOnly}
            onToggleStockOnly={setInStockOnly}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            techSpecs={techSpecs}
            onTechSpecChange={handleTechSpecChange}
            onClearAll={clearAllFilters}
          />
        </div>

        {/* Right Product Grid or List */}
        <div className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <ProductEmptyState onClearFilters={clearAllFilters} />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p, variantId) => {
                      const variant = p.variants?.find(
                        (v) => v.id === variantId,
                      );
                      storeAddToCart(p, variant);
                    }}
                    onToggleWishlist={toggleWishlist}
                    onQuickView={setQuickViewProduct}
                    isWishlisted={wishlistIds.has(product.id)}
                  />
                ))}
              </div>
              {visibleCount < filteredProducts.length && (
                <div className="text-center pt-2">
                  <button
                    id="load-more-products"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="bg-slate-900 hover:bg-[#00AEEF] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Load More — {filteredProducts.length - visibleCount}{" "}
                    products remaining
                  </button>
                </div>
              )}
            </>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredProducts.slice(0, visibleCount).map((product) => {
                const discountPct =
                  product.mrp > product.price
                    ? Math.round(
                        ((product.mrp - product.price) / product.mrp) * 100,
                      )
                    : null;
                const specPills = Object.entries(product.specs ?? {}).slice(
                  0,
                  4,
                );

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 flex items-start gap-4 p-4 hover:border-[#00AEEF]/50 hover:shadow-md transition-all"
                  >
                    {/* Image */}
                    <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-slate-400">
                            {product.sku}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {discountPct && (
                            <span className="bg-[#FF3B30] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                              {discountPct}% OFF
                            </span>
                          )}
                          {product.badge && (
                            <span className="bg-slate-900 text-[#00AEEF] text-[9px] font-black px-1.5 py-0.5 rounded">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {specPills.map(([key, val]) => (
                          <span
                            key={key}
                            className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded truncate"
                          >
                            {key}: {val}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.mrp > product.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="text-[10px] font-bold text-[#00AEEF] hover:underline cursor-pointer"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className={`text-[10px] font-bold cursor-pointer ${
                              wishlistIds.has(product.id)
                                ? "text-red-500"
                                : "text-slate-500 hover:text-red-500"
                            }`}
                          >
                            ♥{" "}
                            {wishlistIds.has(product.id) ? "Saved" : "Wishlist"}
                          </button>
                          <button
                            onClick={() => storeAddToCart(product)}
                            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl cursor-pointer transition-colors active:scale-95"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {visibleCount < filteredProducts.length && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="bg-slate-900 hover:bg-[#00AEEF] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Load More — {filteredProducts.length - visibleCount}{" "}
                    remaining
                  </button>
                </div>
              )}
            </div>
          )}
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
                Filter Products
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilters
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setMobileFilterOpen(false);
              }}
              selectedBrand={selectedBrand}
              onSelectBrand={(b) => {
                setSelectedBrand(b);
                setMobileFilterOpen(false);
              }}
              inStockOnly={inStockOnly}
              onToggleStockOnly={setInStockOnly}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              techSpecs={techSpecs}
              onTechSpecChange={handleTechSpecChange}
              onClearAll={() => {
                clearAllFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onToggleWishlist={toggleWishlist}
          isWishlisted={wishlistIds.has(quickViewProduct.id)}
        />
      )}
    </div>
  );
}

export default function ProductsListingView() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          Loading Prayog India Products Catalogue...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
