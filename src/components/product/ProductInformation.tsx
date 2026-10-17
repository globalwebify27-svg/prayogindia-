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
  Info,
  X,
} from "lucide-react";
import { Product, ProductVariant } from "@/data/mockData";

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

  // Ask Expert / Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = React.useState(false);

  // Calculate estimated delivery date (3 days ahead)
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

  // Extract relevant tag chips for product (Category, Subcategory, Key Spec values)
  const tagChips = React.useMemo(() => {
    const tags: string[] = [];
    if (product.category) tags.push(product.category);
    if (product.subcategory && product.subcategory !== product.category) {
      tags.push(product.subcategory);
    }
    // Add 2 key spec or feature highlights if available
    if (product.specs) {
      const specKeys = Object.keys(product.specs);
      for (const key of specKeys.slice(0, 2)) {
        const val = product.specs[key];
        if (val && val.length < 20) tags.push(val);
      }
    }
    return tags.slice(0, 4);
  }, [product]);

  // WhatsApp Expert URL
  const getWhatsAppInquiryUrl = () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://prayogindia.in/products/${product.slug || product.id}`;
    const text = `Hello Prayog India Team, I have a technical query regarding this product:\n\n*Product:* ${product.name}\n*SKU:* ${currentSku}\n*Price:* ₹${currentPrice.toLocaleString("en-IN")}\n*Link:* ${currentUrl}\n\nPlease assist me. Thank you!`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-3 sm:space-y-3.5 text-slate-900">
      {/* ── Brand, SKU & Share Top Row ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-slate-200 tracking-wider">
            {product.brand || "PRAYOG INDIA"}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-400">
            SKU: {currentSku}
          </span>
        </div>

        {/* Share Button */}
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
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#2563EB] bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
          title="Share Product"
        >
          <Share2 className="w-3 h-3" />
          <span>Share</span>
        </button>
      </div>

      {/* ── Product Title ── */}
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
        {product.name}
      </h1>

      {/* ── Short Description ── */}
      {product.description && (
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {product.description}
        </p>
      )}

      {/* ── Rating & Tag Chips Row ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          {/* 5-Star Row */}
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

          <span className="font-bold text-slate-800 text-xs">
            {Number(product.rating || 4.5).toFixed(1)}
          </span>

          <span className="text-slate-300">•</span>
          <a
            href="#reviews-tab"
            className="text-[11px] font-medium text-slate-500 hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            ({product.reviews || 230} reviews)
          </a>
        </div>

        {/* Feature Tags */}
        {tagChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {tagChips.map((chip, idx) => (
              <span
                key={idx}
                className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-sky-100"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Price & Stock Row ── */}
      <div className="pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{currentPrice.toLocaleString("en-IN")}
            </span>
            {currentMrp > currentPrice && (
              <>
                <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                  ₹{currentMrp.toLocaleString("en-IN")}
                </span>
                <span className="bg-[#FF3B30] text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
            {savings > 0 && (
              <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                You Save ₹{savings.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Stock Availability */}
          <div>
            {currentStock ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-emerald-700 font-extrabold">In Stock</span>
                <span className="text-slate-500 text-[11px]">
                  (Only {stockCount} left)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span>Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-medium pt-0.5">
          Inclusive of GST <span className="text-slate-300 mx-1">•</span> No hidden charges
        </div>
      </div>

      {/* ── Variant Selector (if product variants exist) ── */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-slate-700 block">
            Select Option / Variant:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelectVariant(variant)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  selectedVariant?.id === variant.id
                    ? "border-[#2563EB] bg-blue-50 text-[#2563EB] ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                {variant.name} — ₹{variant.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Action Buttons Row (Placed immediately under Price/Stock for instant access) ── */}
      <div className="pt-1">
        {currentStock ? (
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quantity Selector */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 h-11">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 sm:w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 font-bold text-sm cursor-pointer transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-7 text-center text-xs font-black text-slate-900 select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                disabled={quantity >= 50}
                className="w-7 sm:w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 font-bold text-sm cursor-pointer transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button (Prayog Brand Yellow) */}
            <button
              type="button"
              onClick={() => onAddToCart(product, quantity)}
              className="flex-1 h-11 bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 px-3 sm:px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.2] shrink-0" />
              <span>ADD TO CART</span>
            </button>

            {/* Buy Now Button (Prayog Deep Navy) */}
            <button
              type="button"
              onClick={() =>
                onBuyNow
                  ? onBuyNow(product, quantity)
                  : onAddToCart(product, quantity)
              }
              className="flex-1 h-11 bg-[#0A1128] hover:bg-slate-900 text-white px-3 sm:px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>BUY NOW</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => onToggleWishlist(product)}
              className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-500 hover:text-red-500"
              }`}
              title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              aria-label={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          </div>
        ) : (
          <a
            href={getWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span>Out of Stock — Inquire on WhatsApp</span>
          </a>
        )}
      </div>

      {/* ── Compact Delivery Pincode Box ── */}
      <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-2.5 space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 shrink-0">
            <Truck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Check Delivery:</span>
          </div>

          <form onSubmit={handleCheckPincode} className="flex items-center gap-1.5 flex-1 max-w-sm">
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
              placeholder="Enter 6-digit PIN"
              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] transition-all"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#0A1128] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer shrink-0"
            >
              Check
            </button>
          </form>
        </div>

        {pincodeStatus === "valid" && (
          <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] flex items-center justify-between text-emerald-800 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Delivery available for <strong>{pincode}</strong>
            </span>
            <span>⚡ By <strong className="text-slate-900">{deliveryDate}</strong></span>
          </div>
        )}

        {pincodeStatus === "invalid" && (
          <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" /> Please enter a valid 6-digit PIN code.
          </p>
        )}
      </div>

      {/* ── 4 Trust Badges Strip (Ultra-compact 4-column row) ── */}
      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 bg-slate-50 border border-slate-100/90 rounded-lg py-1.5 px-1 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <span className="text-[10px] font-bold text-slate-700 leading-tight">Genuine</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 bg-slate-50 border border-slate-100/90 rounded-lg py-1.5 px-1 text-center">
          <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <span className="text-[10px] font-bold text-slate-700 leading-tight">GST Invoice</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 bg-slate-50 border border-slate-100/90 rounded-lg py-1.5 px-1 text-center">
          <Package className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <span className="text-[10px] font-bold text-slate-700 leading-tight">Fast Dispatch</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 bg-slate-50 border border-slate-100/90 rounded-lg py-1.5 px-1 text-center">
          <Headphones className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <span className="text-[10px] font-bold text-slate-700 leading-tight">Tech Support</span>
        </div>
      </div>

      {/* ── Secondary Links Row ── */}
      <div className="flex items-center justify-center gap-6 pt-0.5 text-[11px] font-semibold text-slate-500">
        <a
          href={getWhatsAppInquiryUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>Need technical help? Ask an Expert</span>
        </a>
      </div>
    </div>
  );
};
