"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Check } from "lucide-react";
import { Product } from "@/data/mockData";
import { useCartStore } from "@/store";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";
import { ProductCard } from "@/components/products/ProductCard";

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

// Frequently Bought Together Bundle component
const FrequentlyBoughtTogetherSection: React.FC<{
  products: Product[];
  mainProduct?: Product;
}> = ({ products, mainProduct }) => {
  const addToCart = useCartStore((s) => s.addToCart);
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

  // Selected item IDs: empty by default (do not auto-select items)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [mainProduct?.id]);

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
      addToCart(p, undefined, 1);
    });
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2500);
  };

  return (
    <>
      {/* ── MOBILE VIEW: Unified, Clean & Borderless Bundle Section ── */}
      <div className="block sm:hidden bg-slate-50/80 rounded-2xl p-3.5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Frequently Bought Together
              </h4>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Compatible companion hardware for your build
            </p>
          </div>
          {savings > 0 && (
            <span className="bg-emerald-100/70 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
              Save ₹{savings.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Interactive Compact Item List (Clean & Borderless) */}
        <div className="space-y-1.5">
          {bundleItems.map((prod) => {
            const isSelected = selectedIds.includes(prod.id);
            const isMain = prod.id === mainProduct?.id;

            return (
              <div
                key={prod.id}
                onClick={() => toggleItem(prod.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-white shadow-2xs"
                    : "opacity-45 hover:bg-white/60"
                }`}
              >
                {/* Custom Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#2563EB] text-white shadow-2xs"
                      : "bg-slate-200/80"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Thumbnail */}
                <div className="relative w-11 h-11 rounded-lg bg-white overflow-hidden shrink-0">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {isMain && (
                      <span className="text-[8px] bg-slate-900 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                        This Item
                      </span>
                    )}
                    <h5 className="text-xs font-bold text-slate-800 truncate">
                      {prod.name}
                    </h5>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xs font-black text-slate-900">
                      ₹{prod.price.toLocaleString("en-IN")}
                    </span>
                    {prod.mrp > prod.price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{prod.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Bundle Pricing Bar */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Bundle Total ({selectedItems.length} items)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900">
                ₹{bundleTotal.toLocaleString("en-IN")}
              </span>
              {savings > 0 && (
                <span className="text-[10px] text-emerald-600 font-bold">
                  (Save ₹{savings.toLocaleString("en-IN")})
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddBundle}
            disabled={selectedItems.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 ${
              bundleAdded
                ? "bg-emerald-600 text-white"
                : selectedItems.length === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-500/20"
            }`}
          >
            {bundleAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added!</span>
              </>
            ) : selectedItems.length === 0 ? (
              <span>Select Items</span>
            ) : (
              <>
                <AddToCartIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Add Bundle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── DESKTOP VIEW: Full Horizontal Connected Cards + Summary ── */}
      <div className="hidden sm:block bg-slate-50/90 border border-slate-200/90 rounded-3xl p-5 space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
            Frequently Bought Together
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Customers who viewed this item frequently bundle it with:
          </p>
        </div>

        {/* Visual Product Cards Row connected with '+' */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
          {bundleItems.map((prod, idx) => {
            const isSelected = selectedIds.includes(prod.id);
            const isMain = prod.id === mainProduct?.id;

            return (
              <React.Fragment key={prod.id}>
                <div
                  onClick={() => toggleItem(prod.id)}
                  className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all cursor-pointer select-none shrink-0 w-32 bg-white ${
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

                  <div className="relative w-24 h-24 overflow-hidden mt-1">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <span className="text-[11px] font-bold text-slate-800 text-center line-clamp-2 leading-snug w-full">
                    {prod.name.split("(")[0].trim()}
                  </span>

                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-sm font-black text-slate-900">
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
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs font-black text-base">
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
        <div className="flex flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-500 font-bold">
              Bundle Total ({selectedItems.length}{" "}
              {selectedItems.length === 1 ? "item" : "items"}):
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-slate-900">
                ₹{bundleTotal.toLocaleString("en-IN")}
              </span>
              {bundleMrp > bundleTotal && (
                <>
                  <span className="text-sm text-slate-400 line-through font-semibold">
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
            ) : selectedItems.length === 0 ? (
              <span>Select Items to Bundle</span>
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
    </>
  );
};

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  groups,
  mainProduct,
}) => {
  const validGroups = groups.filter((g) => g.products.length > 0);
  const defaultTab =
    validGroups.find((g) => g.id === "similar")?.id ??
    validGroups[0]?.id ??
    "";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab && (!activeTab || !validGroups.some((g) => g.id === activeTab))) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  if (validGroups.length === 0) return null;

  const activeGroup =
    validGroups.find((g) => g.id === activeTab) ?? validGroups[0];
  const isFBT = activeGroup.id === "fbt";

  const getMobileLabel = (id: string, fullLabel: string) => {
    switch (id) {
      case "similar":
        return "Similar";
      case "fbt":
        return "Bought Together";
      case "related":
        return "Related";
      case "accessories":
        return "Accessories";
      default:
        return fullLabel;
    }
  };

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
              className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? "bg-[#0A1128] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              <span>
                <span className="hidden sm:inline">{group.label}</span>
                <span className="inline sm:hidden">
                  {getMobileLabel(group.id, group.label)}
                </span>
              </span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-[#FFC20E] text-slate-950"
                    : "bg-slate-200/70 text-slate-500"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5">
          {activeGroup.products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductRecommendations;
