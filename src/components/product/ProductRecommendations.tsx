"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  Zap,
  Heart,
  ChevronRight,
  Check,
} from "lucide-react";
import { Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";

interface RecommendationGroup {
  id: string;
  label: string;
  subtitle: string;
  products: Product[];
  accentColor?: string;
}

interface ProductRecommendationsProps {
  groups: RecommendationGroup[];
  mainProduct?: Product;
}

// Mini product card for recommendations
const RecoCard: React.FC<{ product: Product }> = ({ product }) => {
  const store = useStore();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = store?.isWishlisted?.(product.id) ?? false;
  const discountPct =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    store?.addToCart(product, undefined, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    store?.addToCart(product, undefined, 1);
    router.push("/checkout");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    store?.toggleWishlist(product);
  };

  return (
    <div className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#2563EB]/40 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="block relative h-32 sm:h-36 bg-slate-50/80 overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
        {discountPct && (
          <span className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">
            {discountPct}% OFF
          </span>
        )}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors cursor-pointer z-10 ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 text-slate-400 hover:text-red-500"
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-3 h-3 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">
        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">
          {product.sku}
        </span>
        <Link href={`/products/${product.slug || product.id}`}>
          <h4 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#2563EB] transition-colors">
            {product.name}
          </h4>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-700">
            {product.rating}
          </span>
          <span className="text-[9px] text-slate-400">({product.reviews})</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-slate-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] text-slate-400 line-through">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {product.inStock ? (
            <div className="flex gap-1 mt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 border text-[9px] font-black py-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> ADDED
                  </>
                ) : (
                  <>
                    <AddToCartIcon className="w-2.5 h-2.5" /> ADD
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 bg-[#0A1128] text-white text-[9px] font-black py-1.5 rounded-lg hover:bg-slate-900 transition-colors active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Zap className="w-2.5 h-2.5 fill-[#FFC20E] text-[#FFC20E]" /> BUY
              </button>
            </div>
          ) : (
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg block text-center mt-2">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Frequently Bought Together Bundle component
const FrequentlyBoughtTogetherSection: React.FC<{
  products: Product[];
  mainProduct?: Product;
}> = ({ products, mainProduct }) => {
  const store = useStore();
  const [bundleAdded, setBundleAdded] = useState(false);

  // Full bundle: includes mainProduct as the primary anchor + companion products (deduplicated)
  const bundleItems = React.useMemo(() => {
    if (!mainProduct) return products;
    const list = [mainProduct];
    products.forEach((p) => {
      if (p.id !== mainProduct.id) {
        list.push(p);
      }
    });
    return list;
  }, [mainProduct, products]);

  // Selected item IDs (default all checked)
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    bundleItems.map((p) => p.id),
  );

  useEffect(() => {
    setSelectedIds(bundleItems.map((p) => p.id));
  }, [bundleItems]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectedItems = bundleItems.filter((p) => selectedIds.includes(p.id));
  const bundleTotal = selectedItems.reduce((acc, p) => acc + p.price, 0);
  const bundleMrp = selectedItems.reduce(
    (acc, p) => acc + (p.mrp || p.price),
    0,
  );
  const savings = Math.max(0, bundleMrp - bundleTotal);

  const handleAddBundle = () => {
    if (selectedItems.length === 0) return;
    selectedItems.forEach((p) => {
      store?.addToCart(p, undefined, 1);
    });
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2500);
  };

  return (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-4">
      <div>
        <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
          Frequently Bought Together
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Customers who viewed this item frequently bundle it with:
        </p>
      </div>

      {/* Visual Product Cards Row connected with '+' */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
        {bundleItems.map((prod, idx) => {
          const isSelected = selectedIds.includes(prod.id);
          const isMain = prod.id === mainProduct?.id;

          return (
            <React.Fragment key={prod.id}>
              <div
                onClick={() => toggleItem(prod.id)}
                className={`relative flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer select-none shrink-0 w-28 sm:w-32 bg-white ${
                  isSelected
                    ? "border-slate-300 shadow-xs"
                    : "border-slate-200 opacity-50 grayscale"
                }`}
              >
                {/* Checkbox badge */}
                <div
                  className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center transition-colors z-10 ${
                    isSelected
                      ? "bg-[#2563EB] text-white"
                      : "bg-slate-100 border border-slate-300 text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>

                {isMain && (
                  <span className="absolute top-2 right-2 bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider z-10">
                    This Item
                  </span>
                )}

                <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden mt-1">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 text-center line-clamp-2 leading-snug w-full">
                  {prod.name.split("(")[0].trim()}
                </span>

                <div className="flex items-baseline gap-1 mt-auto">
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    ₹{prod.price.toLocaleString("en-IN")}
                  </span>
                  {prod.mrp > prod.price && (
                    <span className="text-[10px] text-slate-400 line-through">
                      ₹{prod.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {idx < bundleItems.length - 1 && (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs font-black text-sm sm:text-base">
                  +
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Item Checklist selection */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200/70 text-xs">
        {bundleItems.map((prod) => {
          const isSelected = selectedIds.includes(prod.id);
          const isMain = prod.id === mainProduct?.id;
          return (
            <label
              key={prod.id}
              className="flex items-center gap-2 text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleItem(prod.id)}
                className="w-4 h-4 rounded text-[#2563EB] accent-[#2563EB] cursor-pointer shrink-0"
              />
              <span className="line-clamp-1">
                {isMain && (
                  <strong className="text-slate-900 font-bold mr-1">
                    This item:
                  </strong>
                )}
                {prod.name}
              </span>
              <span className="font-extrabold text-slate-900 ml-auto shrink-0 pl-2">
                ₹{prod.price.toLocaleString("en-IN")}
              </span>
            </label>
          );
        })}
      </div>

      {/* Bundle Pricing Card & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="space-y-0.5">
          <div className="text-[11px] text-slate-500 font-bold">
            Bundle Total ({selectedItems.length}{" "}
            {selectedItems.length === 1 ? "item" : "items"}):
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{bundleTotal.toLocaleString("en-IN")}
            </span>
            {bundleMrp > bundleTotal && (
              <>
                <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                  ₹{bundleMrp.toLocaleString("en-IN")}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddBundle}
          disabled={selectedItems.length === 0}
          className={`h-11 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
            bundleAdded
              ? "bg-emerald-600 text-white shadow-emerald-600/20"
              : selectedItems.length === 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-500/20"
          }`}
        >
          {bundleAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Bundle Added!</span>
            </>
          ) : (
            <>
              <AddToCartIcon className="w-4 h-4 shrink-0" />
              <span>
                Add{" "}
                {selectedItems.length === bundleItems.length
                  ? "All " + selectedItems.length
                  : selectedItems.length}{" "}
                to Cart
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  groups,
  mainProduct,
}) => {
  const [activeTab, setActiveTab] = useState(groups[0]?.id ?? "");

  const validGroups = groups.filter((g) => g.products.length > 0);
  if (validGroups.length === 0) return null;

  const activeGroup =
    validGroups.find((g) => g.id === activeTab) ?? validGroups[0];
  const isFBT = activeGroup.id === "fbt";

  return (
    <section className="space-y-4 border-t border-slate-200 pt-8 sm:pt-10">
      {/* ── Section Title & Browse Link Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Recommendations for You
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeGroup.subtitle || "Curated hardware matches for your build."}
          </p>
        </div>
        <Link
          href={`/products?category=${encodeURIComponent(mainProduct?.category || "")}`}
          className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>Browse All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Horizontally Scrollable Tabs (Mobile & Desktop) ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        {validGroups.map((group) => {
          const isActive = activeTab === group.id;
          const count =
            group.id === "fbt" && mainProduct
              ? group.products.length + 1
              : group.products.length;

          return (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? "bg-[#0A1128] text-white border-[#0A1128] shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{group.label}</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-[#FFC20E] text-slate-950"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {isFBT ? (
        <FrequentlyBoughtTogetherSection
          products={activeGroup.products}
          mainProduct={mainProduct}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {activeGroup.products.map((prod) => (
            <RecoCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductRecommendations;
