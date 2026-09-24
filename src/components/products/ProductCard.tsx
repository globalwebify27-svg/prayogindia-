"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import {
  Star,
  Heart,
  Eye,
  ShoppingBag,
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

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between hover:border-[#00AEEF] hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 relative overflow-hidden"
    >
      {/* ── Top: Category Name & Circular Wishlist Button ── */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-700 truncate">
          {product.category || "Arduino & Microcontrollers"}
        </span>
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="w-8 h-8 rounded-full border border-slate-200/90 hover:border-slate-300 bg-white flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Add to Wishlist"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        )}
      </div>

      {/* ── Product Image ── */}
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="relative h-40 sm:h-44 w-full mb-3 flex items-center justify-center overflow-hidden rounded-2xl bg-white p-2 group-hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
          <Image
            src={getOptimizedImageUrl(product.image, {
              width: 400,
              quality: "auto",
            })}
            alt={product.name}
            fill
            className="object-contain p-2"
          />
        </div>
      </Link>

      {/* ── Card Body ── */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Product Name */}
          <Link
            href={`/products/${product.slug || product.id}`}
            className="block"
          >
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-[#00AEEF] transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* SKU */}
          <div className="text-xs font-semibold text-slate-400 mt-1">
            SKU:{" "}
            <span className="font-mono text-slate-500">
              {activeVariant?.sku || product.sku}
            </span>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <div className="flex items-center text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-slate-500 font-medium ml-0.5">
              ({product.reviews || 87})
            </span>
          </div>

          {/* Price with (Incl. GST) */}
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              ₹
              {displayPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Incl. GST)
            </span>
          </div>
        </div>

        {/* Action: Add to Cart Full Width */}
        <div className="pt-2 mt-auto">
          {isInStock ? (
            <button
              id={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart?.(product, selectedVariantId)}
              className="w-full border border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-2xs group/btn"
            >
              <span>Add to Cart</span>
              <ShoppingBag className="w-4 h-4" />
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
    </div>
  );
};
