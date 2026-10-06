"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Flame,
  Check,
} from "lucide-react";
import { Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { haptic } from "@/utils/haptics";

interface TopDealsProductCardProps {
  product: Product;
  dealTag?: string;
  claimedPercentage?: number;
  dealEndsInHours?: number;
  featured?: boolean;
}

export const TopDealsProductCard: React.FC<TopDealsProductCardProps> = ({
  product,
  dealTag,
  claimedPercentage,
  featured = false,
}) => {
  const store = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const price = product.price;
  const mrp = product.mrp || Math.round(product.price * 1.35);
  const discountAmount = mrp - price;
  const discountPercent = Math.round((discountAmount / mrp) * 100);

  // Derive claim percentage if not provided based on product id
  const claimPercent =
    claimedPercentage ||
    Math.min(94, 60 + ((product.id.charCodeAt(0) * 7 + product.id.length * 5) % 33));

  const stockRemaining = Math.max(3, Math.round((100 - claimPercent) / 3));

  const isWishlisted = store?.isWishlisted?.(product.id) ?? false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();

    if (store?.addToCart) {
      store.addToCart(product);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.selection?.();

    if (store?.toggleWishlist) {
      store.toggleWishlist(product);
    }
  };

  return (
    <div
      id={`deal-card-${product.id}`}
      className={`group relative bg-white rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        featured
          ? "border-amber-400/70 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/30"
          : "border-slate-200 hover:border-[#00AEEF] hover:shadow-md hover:shadow-sky-500/10"
      }`}
    >
      {/* ── Top Header Ribbon: Discount Pill & Wishlist ── */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1 pointer-events-none">
        {/* Discount Badge */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5 tracking-wide pointer-events-auto">
            <Zap className="w-2.5 h-2.5 fill-white" />
            {discountPercent > 0 ? `${discountPercent}% OFF` : "DEAL"}
          </span>

          {dealTag && (
            <span className="bg-slate-900/85 backdrop-blur-md text-[#FFC20E] text-[8.5px] font-black uppercase px-1 py-0.5 rounded border border-white/10 pointer-events-auto hidden sm:inline-flex">
              {dealTag}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="w-6 h-6 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-red-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all duration-200 shadow-2xs pointer-events-auto cursor-pointer active:scale-90"
          title="Save to Wishlist"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3 h-3 transition-colors ${
              isWishlisted ? "fill-red-500 text-red-500 scale-110" : ""
            }`}
          />
        </button>
      </div>

      {/* ── Product Media Image Stage ── */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="block pt-7 px-2.5 pb-1"
      >
        <div className="relative h-28 sm:h-30 w-full flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-slate-50/70 to-transparent p-1 group-hover:scale-[1.03] transition-transform duration-300 cursor-pointer">
          <Image
            src={getOptimizedImageUrl(product.image, {
              width: 350,
              quality: "auto",
            })}
            alt={product.name}
            fill
            className="object-contain p-1"
          />
        </div>
      </Link>

      {/* ── Card Content Body ── */}
      <div className="p-2.5 sm:p-3 pt-0.5 flex-1 flex flex-col justify-between space-y-1.5">
        <div className="space-y-1">
          {/* Category & Brand Subtitle */}
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
            <span className="uppercase tracking-wider truncate text-[#00AEEF] max-w-[110px]">
              {product.brand || product.category}
            </span>
            <span className="font-mono text-slate-400 text-[8.5px]">
              SKU: {product.sku?.replace("PRG-", "") || "HW"}
            </span>
          </div>

          {/* Product Title */}
          <Link
            href={`/products/${product.slug || product.id}`}
            className="block"
          >
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-[#00AEEF] transition-colors cursor-pointer min-h-[28px]">
              {product.name}
            </h3>
          </Link>

          {/* Star Ratings */}
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <div className="flex items-center text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < Math.floor(product.rating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-700 text-[10px]">
              {product.rating?.toFixed(1) || "4.9"}
            </span>
            <span className="text-slate-400 text-[9px]">
              ({product.reviews || 84})
            </span>
          </div>

          {/* Deal Urgency / Claim Progress Meter */}
          <div className="bg-slate-50/80 rounded-md p-1.5 border border-slate-100 space-y-0.5">
            <div className="flex items-center justify-between text-[8.5px] font-bold">
              <span className="text-slate-600 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 text-red-500 fill-red-500" />
                <span>{claimPercent}% Claimed</span>
              </span>
              <span className="text-amber-600 font-mono">
                Only {stockRemaining} left
              </span>
            </div>
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-700"
                style={{ width: `${claimPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Pricing & Savings Engine ── */}
        <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                ₹
                {price.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {mrp > price && (
                <span className="text-[10px] text-slate-400 line-through font-medium">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[9px] mt-0.5">
              {discountAmount > 0 && (
                <span className="text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/80">
                  Save ₹{discountAmount.toLocaleString("en-IN")} ({discountPercent}%)
                </span>
              )}
              <span className="text-slate-400 text-[8.5px]">Incl. GST</span>
            </div>
          </div>

          {/* ── Action: Add to Cart Button ── */}
          {product.inStock ? (
            <button
              id={`add-deal-${product.id}`}
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98] ${
                isAdded
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : "bg-slate-900 hover:bg-[#00AEEF] text-white"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3 text-white" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 text-[#FFC20E]" />
                  <span>Add Deal to Cart</span>
                </>
              )}
            </button>
          ) : (
            <a
              href={`https://wa.me/919876543210?text=Hello%20Prayog%20India%2C%20I%20want%20to%20inquire%20about%20Top%20Deal%20for%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
            >
              <span>Inquire on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
