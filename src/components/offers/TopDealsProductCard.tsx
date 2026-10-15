"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Flame,
  Check,
} from "lucide-react";
import { Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { haptic } from "@/utils/haptics";

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    role="img"
    aria-label="WhatsApp"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
          : "border-slate-200 hover:border-[#2563EB] hover:shadow-md hover:shadow-blue-500/10"
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
            <span className="uppercase tracking-wider truncate text-[#2563EB] max-w-[110px]">
              {product.brand && product.brand.trim().toLowerCase() !== "prayog india"
                ? product.brand
                : product.category}
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
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-[#2563EB] transition-colors cursor-pointer min-h-[28px]">
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
              className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap overflow-hidden ${
                isAdded
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-[#2563EB] text-[#2563EB] bg-white hover:bg-[#2563EB] hover:text-white active:bg-blue-50"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap font-bold">ADDED!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap font-bold">ADD TO CART</span>
                </>
              )}
            </button>
          ) : (
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(
                `Hello Prayog India, I want to inquire about the out-of-stock product: ${product.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap overflow-hidden"
              title="Out of Stock — Inquire on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="truncate">Out of Stock — Inquire on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
