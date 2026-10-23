"use client";

import React from "react";
import {
  Star,
  ShieldCheck,
  Truck,
  Headphones,
  ShoppingBag,
  ShoppingCart,
  Heart,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  MessageSquare,
  Share2,
} from "lucide-react";
import { Product, ProductVariant } from "@/data/mockData";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";

// Official WhatsApp Vector SVG Icon
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
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

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductInformation: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  onSelectVariant,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = selectedVariant
    ? selectedVariant.inStock
    : product.inStock;

  const stockCount = React.useMemo(() => {
    const code = product.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (code % 5) + 3;
  }, [product.id]);

  // Pincode Delivery Checker State
  const [pincode, setPincode] = React.useState("");
  const [pincodeStatus, setPincodeStatus] = React.useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [deliveryDate, setDeliveryDate] = React.useState("");

  // Calculate estimated delivery date
  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDate(
      d.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  const handleCheckPincode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pincode.trim();
    if (/^\d{6}$/.test(cleanPin)) {
      setPincodeStatus("valid");
    } else {
      setPincodeStatus("invalid");
    }
  };

  const discountPercentage = Math.round(
    ((currentMrp - currentPrice) / currentMrp) * 100,
  );
  const savings = currentMrp - currentPrice;

  // Extract clean inline spec highlights
  const keySpecs = React.useMemo(() => {
    const tags: string[] = [];
    if (product.category) tags.push(product.category);
    if (product.specs) {
      const specKeys = Object.keys(product.specs);
      for (const key of specKeys.slice(0, 2)) {
        const val = product.specs[key];
        if (val && val.length < 25) tags.push(val);
      }
    }
    return tags.slice(0, 3);
  }, [product]);

  // WhatsApp Expert URL
  const getWhatsAppInquiryUrl = () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://prayogindia.in/products/${product.slug || product.id}`;
    const text = `Hello Prayog India Team, I have a technical query regarding this product:\n\n*Product:* ${product.name}\n*SKU:* ${currentSku}\n*Price:* ₹${currentPrice.toLocaleString("en-IN")}\n*Link:* ${currentUrl}\n\nPlease assist me. Thank you!`;
    return `https://wa.me/918709789641?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-4 text-slate-900">
      {/* ── Brand, SKU & Share (Clean Inline Text, No Boxes) ── */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-extrabold uppercase tracking-wider text-[#2563EB]">
            {product.brand || "Prayog India"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-400 font-medium">
            SKU: {currentSku}
          </span>
        </div>

        {/* Wishlist & Share Buttons (Clean Inline Controls) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isWishlisted
                ? "text-red-600 font-bold"
                : "text-slate-400 hover:text-red-600"
            }`}
            title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
            <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
          </button>

          <span className="text-slate-200">•</span>

          {/* Share Button (Clean Text Button) */}
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator
                  .share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                  })
                  .catch(() => {});
              } else if (
                typeof navigator !== "undefined" &&
                navigator.clipboard
              ) {
                navigator.clipboard.writeText(window.location.href);
                alert("Product link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            title="Share Product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ── Product Title ── */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
        {product.name}
      </h1>

      {/* ── Short Description (Clean Text) ── */}
      {product.description && (
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          {product.description}
        </p>
      )}

      {/* ── Rating & Specs Row (Clean Inline Text, No Pill Boxes) ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const currentRating = Number(product.rating || 4.5);
              const fillPercentage = Math.max(
                0,
                Math.min(100, (currentRating - (star - 1)) * 100),
              );

              return (
                <div key={star} className="relative w-3.5 h-3.5 shrink-0">
                  <Star className="w-3.5 h-3.5 text-slate-300 fill-transparent" />
                  {fillPercentage > 0 && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${fillPercentage}%` }}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <span className="font-bold text-slate-800">
            {Number(product.rating || 4.5).toFixed(1)}
          </span>

          <span className="text-slate-300">•</span>
          <a
            href="#reviews-tab"
            className="text-slate-500 hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            ({product.reviews || 230} reviews)
          </a>
        </div>

        {keySpecs.length > 0 && (
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            {keySpecs.map((spec, idx) => (
              <React.Fragment key={idx}>
                <span>•</span>
                <span className="text-slate-600">{spec}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Price & Stock Row (Clean, Open & Elegant) ── */}
      <div className="py-2.5 border-y border-slate-100 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
          {currentMrp > currentPrice && (
            <>
              <span className="text-sm text-slate-400 line-through font-medium">
                ₹{currentMrp.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Save ₹{savings.toLocaleString("en-IN")} ({discountPercentage}% OFF)
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div>
          {currentStock ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>In Stock</span>
              <span className="text-slate-400 font-normal">
                (Only {stockCount} left)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              <span>Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 font-normal -mt-2">
        Inclusive of GST • 100% Authentic Hardware • Manufacturer Warranty
      </p>

      {/* ── Variant Selector (Minimalist Chips) ── */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-700 block">
            Select Variant:
          </span>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onSelectVariant(variant)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                  }`}
                >
                  {variant.name} — ₹{variant.price}
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* ── Delivery Pincode Checker (Clean Inline Layout, No Big Nested Boxes) ── */}
      <div className="pt-2">
        <form onSubmit={handleCheckPincode} className="flex items-center gap-2 max-w-sm">
          <Truck className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPincode(val);
              if (pincodeStatus !== "idle") setPincodeStatus("idle");
            }}
            placeholder="Enter 6-digit PIN code"
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Check
          </button>
        </form>

        {pincodeStatus === "valid" && (
          <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Delivery available • Estimated by <strong>{deliveryDate}</strong></span>
          </p>
        )}

        {pincodeStatus === "invalid" && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 pt-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Please enter a valid 6-digit Indian PIN code.</span>
          </p>
        )}
      </div>

      {/* ── Clean Horizontal Trust Row (No 4 Separate Grey Boxes) ── */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>100% Genuine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>GST Invoice</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Fast Dispatch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Headphones className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Tech Support</span>
        </div>
      </div>

      {/* ── Technical Help Link ── */}
      <div className="pt-1">
        <a
          href={getWhatsAppInquiryUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-[#2563EB] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Have technical doubts? Chat with our hardware engineer</span>
        </a>
      </div>
    </div>
  );
};
