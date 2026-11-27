"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import {
  Star,
  Heart,
  Zap,
  Flame,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Product, getProductStock } from "@/data/mockData";
import { useCartStore, useWishlistStore, useUIStore } from "@/store";
import { haptic } from "@/utils/haptics";
import { triggerFlyToCart } from "@/utils/flyToCart";

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
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItem = useCartStore((s) =>
    s.cart.find((item) => item.product.id === product.id)
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) =>
    s.wishlist.some((p) => p.id === product.id)
  );
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();

    // Trigger arc flying animation into cart
    triggerFlyToCart(e.currentTarget as HTMLElement, product.image);

    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.selection?.();
    updateQuantity(product.id, -1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.selection?.();
    const maxStock = getProductStock(product);
    if (cartQuantity >= maxStock) {
      showToast({
        title: `Only ${maxStock} units available in stock`,
        type: "info",
        iconType: "stock-limit",
      });
      return;
    }
    // Trigger arc flying animation into cart
    triggerFlyToCart(e.currentTarget as HTMLElement, product.image);
    updateQuantity(product.id, 1);
    showToast({
      type: "success",
      title: "Product added to cart!",
      message: product.name,
      product,
      iconType: "cart-add" as any,
      duration: 2000,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();
    if (cartQuantity === 0) {
      addToCart(product);
    }
    router.push("/checkout");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.selection?.();

    toggleWishlist(product);
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

          {/* ── Action: Add to Cart or Stepper + Buy Now ── */}
          {product.inStock ? (
            cartQuantity > 0 ? (
              <div className="flex items-center gap-1.5 w-full">
                {/* Stepper: - [qty] + (dark navy pill) */}
                <div className="flex-1 min-w-0 h-8 sm:h-9 bg-[#0A233F] text-white rounded-lg sm:rounded-xl px-1.5 sm:px-2 flex items-center justify-between shadow-xs select-none">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    aria-label="Decrease quantity"
                    className="w-6 h-full flex items-center justify-center text-white/90 hover:text-white active:scale-90 transition-transform cursor-pointer"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.8]" />
                  </button>
                  <span className="font-black text-xs sm:text-sm text-white px-1">
                    {cartQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    aria-label="Increase quantity"
                    className="w-6 h-full flex items-center justify-center text-white/90 hover:text-white active:scale-90 transition-transform cursor-pointer"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.8]" />
                  </button>
                </div>

                {/* Buy Now Button (bright blue pill) */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 min-w-0 h-8 sm:h-9 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm shadow-blue-500/20 cursor-pointer select-none"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            ) : (
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
                    <AddToCartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="whitespace-nowrap font-bold">ADD TO CART</span>
                  </>
                )}
              </button>
            )
          ) : (
            <a
              href={`https://wa.me/918709789641?text=${encodeURIComponent(
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
