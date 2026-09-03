"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  ChevronRight,
  Package,
} from "lucide-react";
import { Product } from "@/data/mockData";

interface RecommendationGroup {
  id: string;
  label: string;
  subtitle: string;
  products: Product[];
  accentColor?: string;
}

interface ProductRecommendationsProps {
  groups: RecommendationGroup[];
}

// Mini product card for recommendations
const RecoCard: React.FC<{ product: Product }> = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const discountPct =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#00AEEF]/50 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="block relative h-36 bg-slate-50 overflow-hidden"
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
          onClick={() => setWishlisted((w) => !w)}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors cursor-pointer ${
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 text-slate-400 hover:text-red-500"
          }`}
        >
          <Heart className={`w-3 h-3 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">
          {product.sku}
        </span>
        <Link href={`/products/${product.slug || product.id}`}>
          <h4 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#00AEEF] transition-colors">
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

        {/* Price */}
        <div className="mt-auto">
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
              <button className="flex-1 border border-[#00AEEF] text-[#00AEEF] text-[9px] font-extrabold py-1.5 rounded-lg hover:bg-[#E0F7FC] transition-colors active:scale-95 flex items-center justify-center gap-1 cursor-pointer">
                <ShoppingCart className="w-2.5 h-2.5" /> ADD
              </button>
              <button className="flex-1 bg-[#00AEEF] text-white text-[9px] font-extrabold py-1.5 rounded-lg hover:bg-[#0096D6] transition-colors active:scale-95 flex items-center justify-center gap-1 cursor-pointer">
                <Zap className="w-2.5 h-2.5" /> BUY
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

// FBT (Frequently Bought Together) compact horizontal bundle
const FrequentlyBoughtTogetherSection: React.FC<{ products: Product[] }> = ({
  products,
}) => {
  const [bundleAdded, setBundleAdded] = useState(false);
  const bundleTotal = products.reduce((acc, p) => acc + p.price, 0);
  const bundleMrp = products.reduce((acc, p) => acc + p.mrp, 0);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5">
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
          Frequently Bought Together
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Customers who bought this item also purchased:
        </p>
      </div>

      {/* Product bundle row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        {products.map((prod, idx) => (
          <React.Fragment key={prod.id}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative w-20 h-20 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <span className="text-[9px] font-bold text-slate-700 text-center max-w-[80px] line-clamp-2 leading-tight">
                {prod.name.split("(")[0].trim()}
              </span>
              <span className="text-[10px] font-extrabold text-[#00AEEF]">
                ₹{prod.price.toLocaleString("en-IN")}
              </span>
            </div>
            {idx < products.length - 1 && (
              <span className="text-xl font-black text-slate-300 shrink-0">
                +
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bundle pricing + CTA */}
      <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4">
        <div>
          <div className="text-[10px] text-slate-400 font-semibold">
            Bundle Total ({products.length} items)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">
              ₹{bundleTotal.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-slate-400 line-through">
              ₹{bundleMrp.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-black text-emerald-600">
              Save ₹{(bundleMrp - bundleTotal).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <button
          onClick={() => setBundleAdded(true)}
          className={`text-xs font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
            bundleAdded
              ? "bg-emerald-600 text-white"
              : "bg-slate-900 hover:bg-[#00AEEF] text-white shadow-md"
          }`}
        >
          {bundleAdded ? "✓ Bundle Added!" : "Add Bundle to Cart"}
        </button>
      </div>
    </div>
  );
};

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  groups,
}) => {
  const [activeTab, setActiveTab] = useState(groups[0]?.id ?? "");

  const validGroups = groups.filter((g) => g.products.length > 0);
  if (validGroups.length === 0) return null;

  const activeGroup =
    validGroups.find((g) => g.id === activeTab) ?? validGroups[0];
  const isFBT = activeGroup.id === "fbt";

  return (
    <section className="space-y-5 border-t border-slate-200 pt-10">
      {/* ── Tab Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {validGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                activeTab === group.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {group.label}
              <span
                className={`ml-1.5 text-[9px] font-black ${activeTab === group.id ? "text-[#00AEEF]" : "text-slate-400"}`}
              >
                ({group.products.length})
              </span>
            </button>
          ))}
        </div>

        <Link
          href="/products"
          className="text-xs font-extrabold text-[#00AEEF] hover:underline flex items-center gap-1 whitespace-nowrap"
        >
          Browse All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Subtitle ── */}
      {activeGroup.subtitle && (
        <p className="text-xs text-slate-500">{activeGroup.subtitle}</p>
      )}

      {/* ── Content ── */}
      {isFBT ? (
        <FrequentlyBoughtTogetherSection products={activeGroup.products} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {activeGroup.products.map((prod) => (
            <RecoCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </section>
  );
};
