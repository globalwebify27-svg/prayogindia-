"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import {
  Star,
  Heart,
  ShoppingCart,
  Check,
  Layers,
  Maximize2,
  ArrowLeftRight,
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
  isWishlisted,
}) => {
  const store = useStore();
  const [isAdded, setIsAdded] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(product.variants?.[0]?.id);

  const activeVariant = product.variants?.find(
    (v) => v.id === selectedVariantId,
  );

  const displayPrice = activeVariant?.price ?? product.price;
  const displayMrp = activeVariant?.mrp ?? product.mrp ?? Math.round(displayPrice * 1.3);
  const discountAmount = displayMrp > displayPrice ? displayMrp - displayPrice : 0;
  const discountPercent = discountAmount > 0 ? Math.round((discountAmount / displayMrp) * 100) : 0;
  const isInStock = activeVariant ? activeVariant.inStock : product.inStock;

  const itemIsWishlisted =
    typeof isWishlisted === "boolean"
      ? isWishlisted
      : (store?.isWishlisted?.(product.id) ?? false);

  const primaryImage = product.image;
  const secondaryImage =
    (product as any).secondaryImage ||
    (product.images && product.images.length > 1 ? product.images[1] : null);
  const hasSecondary = !!secondaryImage && secondaryImage !== primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();

    if (onAddToCart) {
      onAddToCart(product, selectedVariantId);
    } else if (store?.addToCart) {
      store.addToCart(product, activeVariant);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.selection?.();

    if (onToggleWishlist) {
      onToggleWishlist(product);
    } else if (store?.toggleWishlist) {
      store.toggleWishlist(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.light?.();

    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.light?.();

    setIsCompared(true);
    store?.showToast?.({
      title: "Comparison Added",
      message: `${product.name} added to comparison list.`,
      type: "success",
    });
    setTimeout(() => setIsCompared(false), 2500);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-3 flex flex-col justify-between hover:border-[#2563EB] hover:shadow-lg transition-all duration-300 relative overflow-hidden font-sans"
    >
      {/* ── Top: Product Image with Smooth Hover Swap & Floating Action Icons ── */}
      <div className="relative aspect-square w-full mb-2 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/70 p-1.5">
        {/* Discount Badge in Top-Left (if discount > 5%) */}
        {discountPercent > 5 && (
          <div className="absolute top-2 left-2 z-20 bg-[#FF3B30] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg shadow-xs pointer-events-none">
            {discountPercent}%
          </div>
        )}

        {/* ── Right-Side Floating Action Icons (Smooth Slide-In on Card Hover) ── */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-1.5 opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
          {/* 1. Quick View / Zoom */}
          <button
            type="button"
            onClick={handleQuickView}
            className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-[#2563EB] hover:border-blue-300 hover:bg-blue-50/80 active:scale-90 transition-all cursor-pointer"
            title="Quick View"
            aria-label="Quick View"
          >
            <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* 2. Compare / Swap */}
          <button
            type="button"
            onClick={handleCompare}
            className={`w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs border shadow-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
              isCompared
                ? "border-emerald-400 text-emerald-600 bg-emerald-50"
                : "border-slate-200/90 text-slate-700 hover:text-[#2563EB] hover:border-blue-300 hover:bg-blue-50/80"
            }`}
            title="Compare Product"
            aria-label="Compare Product"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* 3. Wishlist Heart with Reference Tooltip */}
          <div className="relative group/wish">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs border shadow-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
                itemIsWishlisted
                  ? "border-red-300 text-red-500 bg-red-50"
                  : "border-slate-200/90 text-slate-700 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50"
              }`}
              aria-label={itemIsWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  itemIsWishlisted ? "fill-red-500 text-red-500" : "stroke-[2.2]"
                }`}
              />
            </button>

            {/* Tooltip matching Reference Screenshot (Image 3) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/wish:flex flex-col items-center pointer-events-none z-50">
              <span className="bg-[#18181B] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                {itemIsWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              </span>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#18181B]" />
            </div>
          </div>
        </div>

        {/* ── Mobile Touch-Friendly Wishlist Button (Always visible on mobile) ── */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="sm:hidden absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-xs flex items-center justify-center active:scale-90 transition-all cursor-pointer"
          aria-label={itemIsWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              itemIsWishlisted ? "fill-red-500 text-red-500" : "text-slate-500 stroke-[2.2]"
            }`}
          />
        </button>

        {/* ── Product Images (Smooth Cross-Fade on Hover) ── */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="relative w-full h-full block cursor-pointer"
        >
          {/* Primary View */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              hasSecondary
                ? "opacity-100 group-hover:opacity-0"
                : "opacity-100"
            }`}
          >
            <Image
              src={getOptimizedImageUrl(primaryImage, {
                width: 350,
                quality: "auto",
              })}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 180px, 280px"
              className="object-contain p-1 group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>

          {/* Secondary View (smoothly cross-fades in on hover) */}
          {hasSecondary && (
            <div className="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100">
              <Image
                src={getOptimizedImageUrl(secondaryImage, {
                  width: 350,
                  quality: "auto",
                })}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 640px) 180px, 280px"
                className="object-contain p-1 group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          )}
        </Link>
      </div>

      {/* ── Card Body (Amazon / Myntra Style Grid Card Layout) ── */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="flex-1 flex flex-col justify-between space-y-1 block cursor-pointer"
      >
        <div className="space-y-0.5 sm:space-y-1">
          {/* Brand Name (Bold Uppercase) */}
          <div className="text-[10px] sm:text-xs font-black text-slate-900 tracking-wider uppercase truncate">
            {product.brand || "PRAYOG INDIA"}
          </div>

          {/* Product Name Subtitle (Medium weight, 2 lines clamp on mobile) */}
          <h3 className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-2 h-7 sm:h-9 group-hover:text-[#2563EB] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating Stars + Review Count */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
            <div className="flex items-center text-amber-500 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(product.rating || 4)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600">
              {product.reviews || 35}
            </span>
          </div>

          {/* Deal Tag Badge (e.g. Limited time deal) */}
          {discountPercent > 10 && (
            <div className="pt-0.5">
              <span className="bg-[#CC0C39] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-xs tracking-tight uppercase inline-block">
                Limited time deal
              </span>
            </div>
          )}

          {/* Price Row: Bold Rupee Price + Strikethrough MRP + Percentage Off */}
          <div className="pt-0.5 flex items-baseline flex-wrap gap-1 sm:gap-1.5">
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>
            {displayMrp > displayPrice && (
              <>
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  ₹{displayMrp.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">
                  ({discountPercent}% off)
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* ── Add to Cart CTA Button ── */}
      <div className="pt-1.5 sm:pt-2 mt-auto">
        {isInStock ? (
          <button
            id={`add-to-cart-${product.id}`}
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
            className="w-full py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] sm:text-[11px] font-bold tracking-tight flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap overflow-hidden"
            title="Out of Stock — Inquire on WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="truncate">Out of Stock — Inquire on WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
};
