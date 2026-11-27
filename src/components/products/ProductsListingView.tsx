"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import {
  ProductToolbar,
  SortOption,
  GridColumns,
} from "@/components/products/ProductToolbar";
import {
  ProductFilters,
  TechnicalSpecFilters,
} from "@/components/products/ProductFilters";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductEmptyState } from "@/components/products/ProductEmptyState";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { FilterFunnelIcon } from "@/components/icons/FilterFunnelIcon";
import { PRODUCTS, Product } from "@/data/mockData";
import { getProductBrand } from "@/data/brands";
import { getProductDiscount } from "@/lib/discount";
import { useCartStore, useWishlistStore } from "@/store";
import { searchProductsFuzzy } from "@/lib/fuzzySearch";
import { X, Search, Clock, TrendingUp, Tag, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { SearchSuggestionsDropdown } from "@/components/ui/SearchSuggestionsDropdown";
import {
  getCachedProducts,
  hasCachedProducts,
  fetchAndCacheLiveCatalog,
} from "@/lib/productCatalogCache";

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
  const initialBrand = searchParams.get("brand") || null;
  const initialSearch =
    searchParams.get("search") || searchParams.get("q") || "";

  // Filter & Search State
  const [productList, setProductList] = useState<Product[]>(() => getCachedProducts());
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { suggestions: liveSuggestions, isLoading: isSearchSuggestLoading } =
    useSearchSuggestions(searchQuery, 300, 6);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory,
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    initialBrand,
  );
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 60000]);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [techSpecs, setTechSpecs] = useState<TechnicalSpecFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [columns, setColumns] = useState<GridColumns>(4);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchAndCacheLiveCatalog([])
      .then(({ products }) => {
        if (isMounted) setProductList(products);
      })
      .catch((err) => {
        console.warn("Could not fetch latest products from API", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const storeAddToCart = useCartStore((s) => s.addToCart);
  const storeToggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Bulletproof lock of background scroll on mobile touch & desktop wheel
  useEffect(() => {
    if (mobileFilterOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileFilterOpen]);
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

  // ── Stock counts ──
  const { inStockCount, outOfStockCount } = useMemo(() => {
    let inCount = 0;
    let outCount = 0;
    productList.forEach((p) => {
      if (p.inStock) inCount++;
      else outCount++;
    });
    return { inStockCount: inCount, outOfStockCount: outCount };
  }, [productList]);

  // ── Available brands ──
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    productList.forEach((p) => {
      const b = getProductBrand(p);
      if (b) brands.add(b);
    });
    return Array.from(brands);
  }, [productList]);

  // ── Filter & Sort Logic ──
  const filteredProducts = useMemo(() => {
    let result = searchProductsFuzzy(productList, debouncedSearch);

    if (selectedCategory) {
      result = result.filter((p) =>
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()),
      );
    }

    if (selectedSubcategory) {
      result = result.filter((p) =>
        (p.subcategory || p.name).toLowerCase().includes(selectedSubcategory.toLowerCase()),
      );
    }

    if (selectedBrand) {
      result = result.filter((p) => {
        const b = getProductBrand(p).toLowerCase();
        const sel = selectedBrand.toLowerCase();
        return b === sel || b.includes(sel) || (p.brand ?? p.name).toLowerCase().includes(sel);
      });
    }

    if (stockFilter === "inStock") {
      result = result.filter((p) => p.inStock);
    } else if (stockFilter === "outOfStock") {
      result = result.filter((p) => !p.inStock);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    if (minDiscount !== null && minDiscount > 0) {
      result = result.filter((p) => getProductDiscount(p) >= minDiscount);
    }

    if (minRating) {
      result = result.filter((p) => (p.rating || 0) >= minRating);
    }

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

    // ── Sort Modes ──
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "highest-rated":
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result = [...result].sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "popularity":
        result = [...result].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      case "best-selling":
        result = [...result].sort(
          (a, b) => (b.reviews || 0) * (b.rating || 0) - (a.reviews || 0) * (a.rating || 0),
        );
        break;
      case "discount":
        result = [...result].sort((a, b) => {
          const mrpA = a.mrp || Math.round(a.price * 1.35);
          const mrpB = b.mrp || Math.round(b.price * 1.35);
          const discA = mrpA > a.price ? (mrpA - a.price) / mrpA : 0;
          const discB = mrpB > b.price ? (mrpB - b.price) / mrpB : 0;
          return discB - discA;
        });
        break;
      case "featured":
      default:
        result = [...result].sort((a, b) => {
          const aScore = (a.badge ? 10 : 0) + (a.rating || 0);
          const bScore = (b.badge ? 10 : 0) + (b.rating || 0);
          return bScore - aScore;
        });
        break;
    }

    return result;
  }, [
    productList,
    debouncedSearch,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    stockFilter,
    priceRange,
    minDiscount,
    minRating,
    techSpecs,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedBrand(null);
    setStockFilter("all");
    setPriceRange([0, 60000]);
    setMinDiscount(null);
    setMinRating(null);
    setTechSpecs({});
    setSearchQuery("");
  };

  const showSearchSuggest = searchFocused && searchQuery.length === 0;

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (stockFilter !== "all" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 60000 ? 1 : 0) +
    (minDiscount !== null && minDiscount > 0 ? 1 : 0) +
    (minRating !== null && minRating > 0 ? 1 : 0);

  const getGridColsClass = () => {
    if (columns === 1) return "grid grid-cols-1 gap-3 sm:gap-5";
    if (columns === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6";
    if (columns === 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5";
    return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5";
  };


  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-4 space-y-3 sm:space-y-4 animate-in fade-in duration-300">
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
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubcategory(null);
        }}
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={setSelectedSubcategory}
      />

      {/* Active Filter Chips */}
      <ActiveFilters
        category={selectedCategory}
        brand={selectedBrand}
        inStockOnly={stockFilter === "inStock"}
        minPrice={priceRange[0]}
        maxPrice={priceRange[1]}
        searchQuery={searchQuery}
        onRemoveCategory={() => {
          setSelectedCategory(null);
          setSelectedSubcategory(null);
        }}
        onRemoveBrand={() => setSelectedBrand(null)}
        onRemoveStock={() => setStockFilter("all")}
        onResetPrice={() => setPriceRange([0, 60000])}
        onClearSearch={() => setSearchQuery("")}
        onClearAll={clearAllFilters}
      />

      {/* Toolbar */}
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

      {/* Main Content — Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start w-full">
        {/* Left Filter Sidebar (Desktop) — Expandable / Collapsible with Smooth Easing & Zero Screen Shake */}
        <aside
          className={`hidden lg:block shrink-0 sticky top-24 bg-white border border-slate-200/90 rounded-2xl shadow-2xs transition-[width,padding,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFilterOpen
              ? "w-64 xl:w-72 2xl:w-80 p-5 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin"
              : "w-12 py-5 px-1 overflow-hidden cursor-pointer hover:border-[#2563EB] hover:shadow-md group active:scale-[0.98]"
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
                  products={productList}
                  hideCategories={true}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
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
                  techSpecs={techSpecs}
                  onTechSpecChange={handleTechSpecChange}
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

        {/* Right Product Grid or List */}
        <div className="flex-1 min-w-0 space-y-6">
          {filteredProducts.length === 0 ? (
            <ProductEmptyState onClearFilters={clearAllFilters} />
          ) : columns === 1 ? (
            /* 1 Column / List View */
            <div className="space-y-3">
              {filteredProducts.slice(0, visibleCount).map((product) => {
                const discountPct =
                  product.mrp > product.price
                    ? Math.round(
                        ((product.mrp - product.price) / product.mrp) * 100,
                      )
                    : null;
                const specPills = Object.entries(product.specs ?? {})
                  .filter(
                    ([key, val]) =>
                      !key.startsWith("_") &&
                      val !== null &&
                      val !== undefined &&
                      typeof val !== "object"
                  )
                  .slice(0, 4);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start gap-4 p-4 hover:border-[#2563EB]/40 hover:shadow-md transition-all"
                  >
                    {/* Image */}
                    <div className="relative w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    {/* Info */}
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
                        <div className="flex items-center gap-1 shrink-0">
                          {discountPct && (
                            <span className="bg-[#FF3B30] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                              {discountPct}% OFF
                            </span>
                          )}
                          {product.badge && (
                            <span className="bg-slate-900 text-[#FFC20E] text-[9px] font-black px-1.5 py-0.5 rounded">
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
                            {key}: {String(val)}
                          </span>
                        ))}
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer hidden sm:inline"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className={`text-[11px] font-bold cursor-pointer ${
                              wishlistIds.has(product.id)
                                ? "text-red-500"
                                : "text-slate-500 hover:text-red-500"
                            }`}
                          >
                            ♥ {wishlistIds.has(product.id) ? "Saved" : "Wishlist"}
                          </button>
                          <button
                            onClick={() => storeAddToCart(product)}
                            className="border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-2xs"
                          >
                            <AddToCartIcon className="w-3.5 h-3.5" />
                            <span>ADD TO CART</span>
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
                    onClick={() => setVisibleCount((prev) => prev + itemsPerPage)}
                    className="bg-slate-900 hover:bg-[#2563EB] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Load More — {filteredProducts.length - visibleCount} remaining
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Multi-Column Grid View (2, 3, or 4 columns) */
            <>
              <div className={getGridColsClass()}>
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
                    onClick={() => setVisibleCount((prev) => prev + itemsPerPage)}
                    className="bg-slate-900 hover:bg-[#2563EB] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Load More — {filteredProducts.length - visibleCount} products remaining
                  </button>
                </div>
              )}
            </>
          )}
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
                {/* Mobile Drawer Sort By */}
                <div className="pb-3 border-b border-slate-100">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                    }}
                    className="w-full bg-slate-50 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                    <option value="highest-rated">Customer Rating</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>

                <ProductFilters
                  products={productList}
                  hideCategories={true}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory(null);
                  }}
                  selectedSubcategory={selectedSubcategory}
                  onSelectSubcategory={(sub) => {
                    setSelectedSubcategory(sub);
                  }}
                  selectedBrand={selectedBrand}
                  onSelectBrand={(b) => {
                    setSelectedBrand(b);
                  }}
                  stockFilter={stockFilter}
                  onStockFilterChange={(s) => {
                    setStockFilter(s);
                  }}
                  inStockCount={inStockCount}
                  outOfStockCount={outOfStockCount}
                  priceRange={priceRange}
                  onPriceRangeChange={(r) => {
                    setPriceRange(r);
                  }}
                  minDiscount={minDiscount}
                  onMinDiscountChange={(d) => {
                    setMinDiscount(d);
                  }}
                  minRating={minRating}
                  onMinRatingChange={(r) => {
                    setMinRating(r);
                  }}
                  techSpecs={techSpecs}
                  onTechSpecChange={handleTechSpecChange}
                  onClearAll={() => {
                    clearAllFilters();
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
