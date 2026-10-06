"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import {
  Star,
  Heart,
  ShoppingBag,
  Check,
} from "lucide-react";
import { Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { haptic } from "@/utils/haptics";

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

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 flex flex-col justify-between hover:border-[#00AEEF] hover:shadow-md hover:shadow-sky-500/10 transition-all duration-300 relative overflow-hidden font-sans"
    >
      {/* ── Top: Category / Brand & Wishlist Button ── */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="text-[9.5px] font-bold text-[#00AEEF] uppercase tracking-wider truncate max-w-[130px]">
          {product.brand || product.category || "Robotics"}
        </span>

        <button
          onClick={handleToggleWishlist}
          className="w-6 h-6 rounded-full border border-slate-200/90 hover:border-red-200 bg-white/95 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer shadow-2xs active:scale-90"
          title="Save to Wishlist"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-3 h-3 transition-colors ${
              itemIsWishlisted ? "fill-red-500 text-red-500 scale-110" : ""
            }`}
          />
        </button>
      </div>

      {/* ── Product Image ── */}
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="relative h-28 sm:h-30 w-full mb-2 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50/70 p-1.5 group-hover:scale-[1.03] transition-transform duration-300 cursor-pointer">
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

      {/* ── Card Body ── */}
      <div className="flex-1 flex flex-col justify-between space-y-1.5">
        <div className="space-y-1">
          {/* Product Name */}
          <Link
            href={`/products/${product.slug || product.id}`}
            className="block"
          >
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-900 line-clamp-2 leading-tight hover:text-[#00AEEF] transition-colors cursor-pointer min-h-[28px]">
              {product.name}
            </h3>
          </Link>

          {/* SKU */}
          <div className="text-[9px] font-semibold text-slate-400">
            SKU:{" "}
            <span className="font-mono text-slate-500">
              {activeVariant?.sku || product.sku}
            </span>
          </div>

          {/* Rating Stars */}
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
              {product.rating?.toFixed(1) || "4.8"}
            </span>
            <span className="text-slate-400 text-[9px]">
              ({product.reviews || 87})
            </span>
          </div>

          {/* Price with Save Tag & Incl. GST */}
          <div className="pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                ₹
                {displayPrice.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {displayMrp > displayPrice && (
                <span className="text-[10px] text-slate-400 line-through font-medium">
                  ₹{displayMrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[9px] mt-0.5">
              {discountPercent > 0 && (
                <span className="text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/80">
                  Save ₹{discountAmount.toLocaleString("en-IN")} ({discountPercent}%)
                </span>
              )}
              <span className="text-slate-400 text-[8.5px]">Incl. GST</span>
            </div>
          </div>
        </div>

        {/* Action: Add to Cart Full Width */}
        <div className="pt-1.5 mt-auto">
          {isInStock ? (
            <button
              id={`add-to-cart-${product.id}`}
              onClick={handleAddToCart}
              className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98] ${
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
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <a
              href={(() => {
                const origin =
                  typeof window !== "undefined"
                    ? window.location.origin
                    : "https://prayogindia.in";
                const currentUrl =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/products/${product.slug || product.id}`
                    : `https://prayogindia.in/products/${product.slug || product.id}`;
                const imageUrl = product.image
                  ? product.image.startsWith("http")
                    ? product.image
                    : `${origin}${product.image}`
                  : "";

                const lines = [
                  `🛍️ *OUT OF STOCK INQUIRY — PRAYOG INDIA*`,
                  `----------------------------------------`,
                  `Hello Prayog India Team, I want to purchase this item which is currently *Out of Stock*:`,
                  ``,
                  `📌 *Product:* ${product.name}`,
                  `🏷️ *SKU:* ${activeVariant?.sku || product.sku}`,
                  `💰 *Price:* ₹${displayPrice.toLocaleString("en-IN")}.00 (Incl. GST)`,
                  `📦 *Category:* ${product.category}`,
                  product.brand ? `🏢 *Brand:* ${product.brand}` : "",
                  activeVariant ? `⚙️ *Variant:* ${activeVariant.name}` : "",
                  ``,
                  `🖼️ *Product Image:*`,
                  imageUrl,
                  ``,
                  `🔗 *Product Link:*`,
                  currentUrl,
                  `----------------------------------------`,
                  `💬 *Query:* Hi, please notify me when this item is back in stock or if I can pre-order. Thank you!`,
                ].filter(Boolean);

                return `https://wa.me/919876543210?text=${encodeURIComponent(lines.join("\n"))}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-1.5 px-2 rounded-lg text-[9.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer text-center"
            >
              <span>Inquire on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
