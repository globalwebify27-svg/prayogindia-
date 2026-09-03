"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Heart,
  Eye,
  ShoppingCart,
  Zap,
  Package,
  CheckCircle,
  XCircle,
  BadgePercent,
  Info,
} from "lucide-react";
import { Product } from "@/data/mockData";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, variantId?: string) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isWishlisted = false,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(product.variants?.[0]?.id);

  const activeVariant = product.variants?.find(
    (v) => v.id === selectedVariantId,
  );

  const displayPrice = activeVariant?.price ?? product.price;
  const displayMrp = activeVariant?.mrp ?? product.mrp;
  const isInStock = activeVariant ? activeVariant.inStock : product.inStock;

  const discountPct =
    displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : null;

  // Short tech spec pills — up to 3 entries from specs
  const specPills = product.specs
    ? Object.entries(product.specs)
        .slice(0, 3)
        .map(([key, val]) => `${key}: ${val}`)
    : [];

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 flex flex-col justify-between hover:border-[#00AEEF]/60 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
    >
      {/* ── Top Badge Row ── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          {discountPct && (
            <span className="bg-[#FF3B30] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm pointer-events-none">
              {discountPct}% OFF
            </span>
          )}
          {product.badge && (
            <span className="bg-slate-900 text-[#00AEEF] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm pointer-events-none">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist & Quick View buttons */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          {onToggleWishlist && (
            <button
              onClick={() => onToggleWishlist(product)}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white"
              }`}
              title="Add to Wishlist"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>
          )}
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-slate-400 hover:text-[#00AEEF] hover:bg-white transition-colors cursor-pointer"
              title="Quick View"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Product Image ── */}
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="relative h-44 w-full flex items-center justify-center overflow-hidden bg-slate-50 rounded-t-2xl">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* ── Card Body ── */}
      <div className="flex-1 flex flex-col justify-between px-3.5 pb-3.5 pt-2 space-y-2">
        {/* SKU + Rating Row */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            {product.sku}
          </span>
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-extrabold text-slate-700">
              {product.rating}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold">
              ({product.reviews})
            </span>
          </div>
        </div>

        {/* Product Name */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="block"
        >
          <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#00AEEF] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Short Spec Pills */}
        {specPills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specPills.map((pill) => (
              <span
                key={pill}
                className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full"
              >
                {pill}
              </span>
            ))}
          </div>
        )}

        {/* Variant Selector Chips */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  selectedVariantId === v.id
                    ? "bg-[#00AEEF] text-white border-[#00AEEF]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#00AEEF]/50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Price + Stock Row */}
        <div className="flex items-end justify-between pt-1 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-slate-900">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {displayMrp > displayPrice && (
                <span className="text-[10px] text-slate-400 line-through font-medium">
                  ₹{displayMrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {product.gstInclusive && (
              <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-0.5">
                <Info className="w-2.5 h-2.5" /> GST incl.
              </span>
            )}
          </div>

          <span
            className={`text-[9px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
              isInStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isInStock ? (
              <>
                <CheckCircle className="w-2.5 h-2.5" /> In Stock
              </>
            ) : (
              <>
                <XCircle className="w-2.5 h-2.5" /> Out of Stock
              </>
            )}
          </span>
        </div>

        {/* Action Buttons */}
        {isInStock ? (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              id={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart?.(product, selectedVariantId)}
              className="border border-[#00AEEF] text-[#00AEEF] hover:bg-[#E0F7FC] py-2 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3" />
              ADD
            </button>
            <button
              id={`buy-now-${product.id}`}
              onClick={() => onAddToCart?.(product, selectedVariantId)}
              className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 shadow-sm shadow-[#00AEEF]/20 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              BUY NOW
            </button>
          </div>
        ) : (
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(
              `Hi Prayog India, I am interested in ${product.name} (SKU: ${product.sku}). Please notify me when it's back in stock.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
          >
            <Package className="w-3.5 h-3.5" />
            Notify via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};
