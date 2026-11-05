"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { CategoryData, CATEGORIES_DATA, matchCategory } from "@/data/categories";
import { PRODUCTS, Product } from "@/data/mockData";
import { isProductInCategory } from "@/lib/categoryMapping";
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

  // Find category data by slug or alias
  const category =
    CATEGORIES_DATA.find((c) => matchCategory(c, categorySlug)) ||
    CATEGORIES_DATA[0];

  const [productList, setProductList] = useState<Product[]>(PRODUCTS);

  // Fetch live products from DB/API
  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiProducts: Product[] = json.data.map((item: any) => {
            const primaryImg =
              item.images?.[0]?.imageUrl ||
              (Array.isArray(item.images) && typeof item.images[0] === "string"
                ? item.images[0]
                : "/placeholder-product.png");
            const allImages = Array.isArray(item.images)
              ? item.images.map((im: any) =>
                  typeof im === "string" ? im : im.imageUrl,
                )
              : [primaryImg];

            return {
              id: item.id,
              slug: item.slug || item.id,
              name: item.name,
              brand:
                item.brand && item.brand.trim().toLowerCase() !== "prayog india"
                  ? item.brand
                  : undefined,
              category: item.category?.name || item.categoryName || "Robotics & Components",
              subcategory: item.subcategory,
              price: item.price,
              mrp: item.mrp || item.price * 1.2,
              discount:
                item.mrp && item.mrp > item.price
                  ? `${Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF`
                  : "",
              rating: item.rating ?? 4.8,
              reviews: item.reviewCount ?? 12,
              inStock: item.inStock ?? item.stock > 0,
              image: primaryImg,
              images: allImages,
              badge: item.badge,
              description: item.description || "",
              features: item.features || [],
              specs: (item.specifications as Record<string, string>) || {},
            };
          });

          const existingIds = new Set(PRODUCTS.map((p) => p.id));
          const existingSlugs = new Set(
            PRODUCTS.map((p) => p.slug).filter(Boolean),
          );
          const newDbOnly = apiProducts.filter(
            (p) =>
              !existingIds.has(p.id) &&
              (!p.slug || !existingSlugs.has(p.slug)),
          );
          const updatedMock = PRODUCTS.map((p) => {
            const match = apiProducts.find(
              (ap) =>
                ap.id === p.id ||
                (ap.slug && p.slug && ap.slug === p.slug),
            );
            return match || p;
          });

          const combined = [...newDbOnly, ...updatedMock];
          const seenIds = new Set<string>();
          const uniqueProducts = combined.filter((p) => {
            if (!p.id || seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
          });

          setProductList(uniqueProducts);
        }
      })
      .catch((err) => {
        console.warn("CategoryDetailView: API fetch error", err);
      });
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
    return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-4";
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

      {/* 2. Category Filter Pills Row (Image 1) */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        style={{ scrollbarWidth: "none" }}
      >
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all duration-200 cursor-pointer"
        >
          All Products
        </Link>
        {[
          { name: "Robot Kits", slug: "robotics-kits" },
          { name: "Motors", slug: "motors-drivers" },
          { name: "Controllers", slug: "development-boards" },
          { name: "Sensors", slug: "sensors-modules" },
          { name: "Development Boards", slug: "development-boards" },
          { name: "Educational & STEM Kits", slug: "educational-stem-kits" },
          { name: "Accessories", slug: "electronic-components" },
        ].map((cat) => {
          const isSelected = matchCategory(category, cat.slug) || category.name.toLowerCase().includes(cat.name.toLowerCase());
          return (
            <Link
              key={cat.name}
              href={`/categories/${cat.slug}`}
              className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 scale-[1.02]"
                  : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. Subcategories Grid (Image 2) */}
      {category.subcategories.length > 0 && (
        <div className="space-y-3 pt-1 pb-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#2563EB]" />
              <span>Subcategories in {category.name}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {category.subcategories.length} Subcategories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {category.subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub.name;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() =>
                    setSelectedSubcategory(isSelected ? null : sub.name)
                  }
                  className={`group bg-white rounded-2xl border p-3 sm:p-3.5 flex items-center gap-3 sm:gap-3.5 transition-all text-left cursor-pointer ${
                    isSelected
                      ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-blue-50/20 shadow-xs"
                      : "border-slate-200/90 hover:border-[#2563EB]/70 hover:shadow-xs shadow-2xs"
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 flex items-center justify-center">
                    <Image
                      src={sub.image}
                      alt={sub.name}
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xs sm:text-[13px] font-bold truncate transition-colors ${
                        isSelected ? "text-[#2563EB]" : "text-slate-900 group-hover:text-[#2563EB]"
                      }`}
                    >
                      {sub.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">
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
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 shrink-0 sticky top-24 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
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
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
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
