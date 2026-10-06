"use client";

import React, { useState, useMemo } from "react";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { TopDealsHero } from "@/components/offers/TopDealsHero";
import { TopDealsProductCard } from "@/components/offers/TopDealsProductCard";
import {
  ProductToolbar,
  SortOption,
  GridColumns,
} from "@/components/products/ProductToolbar";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { PRODUCTS, Product } from "@/data/mockData";
import { OFFERS_DATA, COUPONS_DATA } from "@/data/offersData";
import {
  Search,
  X,
  Tag,
  Sparkles,
  Ticket,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

export const OffersLandingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 60000]);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [columns, setColumns] = useState<GridColumns>(4);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Collect offer product ids
  const offerProductIds = useMemo(() => {
    return Array.from(new Set(OFFERS_DATA.flatMap((o) => o.productIds)));
  }, []);

  // Base list of discounted or promo products
  const baseOfferProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const mrp = p.mrp || Math.round(p.price * 1.35);
      const isDiscounted = mrp > p.price;
      const isLinkedToOffer = offerProductIds.includes(p.id);
      return isDiscounted || isLinkedToOffer;
    });
  }, [offerProductIds]);

  // Stock counts calculated from baseOfferProducts
  const { inStockCount, outOfStockCount } = useMemo(() => {
    let inCount = 0;
    let outCount = 0;
    baseOfferProducts.forEach((p) => {
      if (p.inStock) inCount++;
      else outCount++;
    });
    return { inStockCount: inCount, outOfStockCount: outCount };
  }, [baseOfferProducts]);

  // Filter deal products with real discounts
  const dealProducts = useMemo(() => {
    let list = [...baseOfferProducts];

    // Filter by Top Category Hero Tab
    if (activeTab !== "all") {
      list = list.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();

        if (activeTab === "lightning") return p.price <= 999;
        if (activeTab === "robotics")
          return (
            cat.includes("robot") ||
            cat.includes("stem") ||
            name.includes("robot") ||
            name.includes("arm")
          );
        if (activeTab === "arduino")
          return (
            cat.includes("arduino") ||
            cat.includes("microcontroller") ||
            cat.includes("devboard") ||
            name.includes("uno") ||
            name.includes("esp")
          );
        if (activeTab === "drones")
          return (
            cat.includes("drone") ||
            cat.includes("uav") ||
            name.includes("pixhawk") ||
            name.includes("motor") ||
            name.includes("esc") ||
            name.includes("prop")
          );
        if (activeTab === "sensors")
          return (
            cat.includes("sensor") ||
            cat.includes("iot") ||
            cat.includes("wireless") ||
            name.includes("gps") ||
            name.includes("bluetooth")
          );
        if (activeTab === "high-discount") {
          const mrp = p.mrp || Math.round(p.price * 1.35);
          const discPercent = ((mrp - p.price) / mrp) * 100;
          return discPercent >= 30;
        }
        return true;
      });
    }

    // Category Sidebar filter
    if (selectedCategory) {
      list = list.filter((p) =>
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()),
      );
    }

    // Subcategory Sidebar filter
    if (selectedSubcategory) {
      list = list.filter((p) =>
        (p.subcategory || p.name)
          .toLowerCase()
          .includes(selectedSubcategory.toLowerCase()),
      );
    }

    // Brand filter
    if (selectedBrand) {
      list = list.filter((p) =>
        (p.brand ?? p.name)
          .toLowerCase()
          .includes(selectedBrand.toLowerCase()),
      );
    }

    // Stock Filter
    if (stockFilter === "inStock") {
      list = list.filter((p) => p.inStock);
    } else if (stockFilter === "outOfStock") {
      list = list.filter((p) => !p.inStock);
    }

    // Price Range Filter
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    // Minimum Discount %
    if (minDiscount) {
      list = list.filter((p) => {
        const mrp = p.mrp || Math.round(p.price * 1.35);
        const disc = ((mrp - p.price) / mrp) * 100;
        return disc >= minDiscount;
      });
    }

    // Minimum Rating
    if (minRating) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    // Search Query
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

    // Sorting
    return [...list].sort((a, b) => {
      const mrpA = a.mrp || Math.round(a.price * 1.35);
      const mrpB = b.mrp || Math.round(b.price * 1.35);
      const saveA = mrpA - a.price;
      const saveB = mrpB - b.price;
      const discA = (saveA / mrpA) * 100;
      const discB = (saveB / mrpB) * 100;

      if (sortBy === "discount") return discB - discA;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "highest-rated")
        return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "title-asc") return a.name.localeCompare(b.name);
      if (sortBy === "title-desc") return b.name.localeCompare(a.name);
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      // default: highest savings
      return saveB - saveA;
    });
  }, [
    baseOfferProducts,
    activeTab,
    selectedCategory,
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
    setActiveTab("all");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedBrand(null);
    setStockFilter("all");
    setPriceRange([0, 60000]);
    setMinDiscount(null);
    setMinRating(null);
    setSearchQuery("");
  };

  const handleCopyCoupon = (code: string) => {
    haptic?.selection?.();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const getGridColsClass = () => {
    if (columns === 1) return "";
    if (columns === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6";
    if (columns === 3)
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5";
    return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5";
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 animate-in fade-in duration-300">
        {/* 1. Breadcrumb */}
        <CategoryBreadcrumb items={[{ label: "Top Deals" }]} />

        {/* 2. Top Deals Hero Banner */}
        <TopDealsHero
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedCategory(null);
          }}
          dealCount={dealProducts.length}
        />

        {/* 3. Search Bar */}
        <div className="relative max-w-2xl w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <input
            id="deals-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals by product name, category, or SKU..."
            className="w-full bg-white text-xs pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 4. Active Filter Chips */}
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

        {/* 5. Toolbar */}
        <ProductToolbar
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenMobileFilters={() => setMobileFilterOpen(true)}
          totalFilteredCount={dealProducts.length}
          columns={columns}
          onColumnsChange={setColumns}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(num) => {
            setItemsPerPage(num);
            setVisibleCount(num);
          }}
        />

        {/* 6. Main Content Layout: Left Filter Sidebar + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sticky Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
            <ProductFilters
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
              onClearAll={clearAllFilters}
            />
          </div>

          {/* Right Product Grid or List */}
          <div className="lg:col-span-9 space-y-6">
            {dealProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3 max-w-md mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No Deal Products Found
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No products match your chosen filters. Try resetting search,
                  price range, or category filter.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-[#00AEEF] bg-[#E0F7FC] hover:bg-[#c9f1fa] px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : columns === 1 ? (
              /* 1 Column / List View */
              <div className="space-y-3">
                {dealProducts.slice(0, visibleCount).map((product) => (
                  <TopDealsProductCard
                    key={product.id}
                    product={product}
                    dealTag={product.badge}
                  />
                ))}
                {visibleCount < dealProducts.length && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() =>
                        setVisibleCount((prev) => prev + itemsPerPage)
                      }
                      className="bg-slate-900 hover:bg-[#00AEEF] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Load More Deals —{" "}
                      {dealProducts.length - visibleCount} remaining
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Multi-Column Grid View (2, 3, or 4 columns) */
              <>
                <div className={getGridColsClass()}>
                  {dealProducts.slice(0, visibleCount).map((product) => (
                    <TopDealsProductCard
                      key={product.id}
                      product={product}
                      dealTag={product.badge}
                    />
                  ))}
                </div>

                {visibleCount < dealProducts.length && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() =>
                        setVisibleCount((prev) => prev + itemsPerPage)
                      }
                      className="bg-slate-900 hover:bg-[#00AEEF] text-white font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Load More Deals —{" "}
                      {dealProducts.length - visibleCount} products remaining
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 7. Active Checkout Promo Vouchers Strip */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#00AEEF]" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Active Checkout Promo Vouchers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COUPONS_DATA.slice(0, 3).map((coupon) => (
              <div
                key={coupon.code}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {coupon.discountText}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Min order ₹{coupon.minOrder.toLocaleString("en-IN")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCoupon(coupon.code)}
                  className="bg-white hover:bg-sky-50 text-slate-800 hover:text-[#00AEEF] border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <span>{coupon.code}</span>
                  {copiedCoupon === coupon.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Trust Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#00AEEF] shrink-0" />
            <span>Free Shipping &gt; ₹999</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1-Year Tested Warranty</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>18% GST Input Credit</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
            <span>100% Genuine Parts</span>
          </div>
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
                Filter Deals
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
                setSelectedSubcategory(null);
                setMobileFilterOpen(false);
              }}
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
