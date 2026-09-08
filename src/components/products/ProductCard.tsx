"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
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

  // Short tech spec pills — up to 2 clean entries for high scannability
  const specPills = product.specs
    ? Object.entries(product.specs)
        .slice(0, 2)
        .map(([key, val]) => `${key}: ${val}`)
    : [];

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 flex flex-col justify-between hover:border-[#00AEEF]/50 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 relative overflow-hidden"
    >
      {/* ── Top Badge Row ── */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          {discountPct && (
            <span className="bg-[#FF3B30] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs pointer-events-none">
              {discountPct}% OFF
            </span>
          )}
          {product.badge && (
            <span className="bg-slate-900 text-[#00AEEF] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs pointer-events-none">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist & Quick View buttons */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          {onToggleWishlist && (
            <button
              onClick={() => onToggleWishlist(product)}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/95 text-slate-400 hover:text-red-500 hover:bg-white"
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
              className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow-xs text-slate-400 hover:text-[#00AEEF] hover:bg-white transition-colors cursor-pointer"
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
        <div className="relative h-44 sm:h-48 w-full flex items-center justify-center overflow-hidden bg-slate-50/50 rounded-t-2xl sm:rounded-t-3xl">
          <Image
            src={getOptimizedImageUrl(product.image, { width: 400, quality: "auto" })}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* ── Card Body ── */}
      <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
        {/* SKU + Rating Row */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span className="font-mono uppercase tracking-wider text-slate-400">
            {product.sku}
          </span>
          <div className="flex items-center gap-0.5 text-amber-500 font-bold">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-slate-700">{product.rating}</span>
            <span className="text-slate-400 font-normal">
              ({product.reviews})
            </span>
          </div>
        </div>

        {/* Product Name */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="block"
        >
          <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#00AEEF] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Short Spec Pills */}
        {specPills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specPills.map((pill) => (
              <span
                key={pill}
                className="bg-slate-50 text-slate-500 border border-slate-200/60 text-[9px] font-medium px-1.5 py-0.5 rounded-md truncate max-w-full"
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
        <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {displayMrp > displayPrice && (
                <span className="text-[10px] text-slate-400 line-through font-medium">
                  ₹{displayMrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {product.gstInclusive && (
              <span className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5">
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
          <div className="grid grid-cols-2 gap-2 pt-0.5">
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
              className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              BUY NOW
            </button>
          </div>
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
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5 fill-white shrink-0"
              role="img"
              aria-label="WhatsApp"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Inquire on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};
