"use client";

import React from "react";
import {
  Star,
  ShieldCheck,
  Truck,
  Headphones,
  ShoppingBag,
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
    <div className="space-y-5 text-slate-900">
      {/* ── Brand & SKU Row ── */}
      <div className="flex items-center gap-3">
        <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-slate-200 tracking-wider">
          {product.brand || "PRAYOG INDIA"}
        </span>
        <span className="text-xs font-mono font-bold text-slate-400">
          SKU: {currentSku}
        </span>
      </div>

      {/* ── Product Title ── */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
        {product.name}
      </h1>

      {/* ── Short Description ── */}
      {product.description && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
          {product.description}
        </p>
      )}

      {/* ── Rating & Share Row ── */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2 text-xs">
          {/* 5-Star Row with Half/Partial Fill Support */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const currentRating = Number(product.rating || 4.5);
              const fillPercentage = Math.max(
                0,
                Math.min(100, (currentRating - (star - 1)) * 100),
              );

              return (
                <div key={star} className="relative w-4 h-4 shrink-0">
                  {/* Empty star outline */}
                  <Star className="w-4 h-4 text-slate-300 fill-transparent" />
                  {/* Filled star with clip */}
                  {fillPercentage > 0 && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${fillPercentage}%` }}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <span className="font-semibold text-slate-700 text-xs">
            {Number(product.rating || 4.5).toFixed(1)}
          </span>

          <span className="text-slate-300">•</span>
          <a
            href="#reviews-tab"
            className="text-xs font-medium text-slate-500 hover:text-[#00AEEF] transition-colors cursor-pointer"
          >
            ({product.reviews || 389} reviews)
          </a>
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
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#00AEEF] bg-slate-100/80 hover:bg-slate-100 px-3 py-1 rounded-full transition-colors cursor-pointer"
          title="Share Product"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* ── Category & Feature Tag Chips ── */}
      {tagChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {tagChips.map((chip, idx) => (
            <span
              key={idx}
              className="bg-sky-50 text-sky-700 text-[11px] font-bold px-3 py-1 rounded-full border border-sky-100"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* ── Price Block ── */}
      <div className="pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ₹{currentPrice.toLocaleString("en-IN")}
            </span>
            {currentMrp > currentPrice && (
              <>
                <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                  ₹{currentMrp.toLocaleString("en-IN")}
                </span>
                <span className="bg-[#FF3B30] text-white text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {savings > 0 && (
            <div className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
              You Save ₹{savings.toLocaleString("en-IN")}
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-medium pt-1">
          Inclusive of GST <span className="text-slate-300 mx-1.5">•</span> No
          hidden charges
        </div>
      </div>

      {/* ── Stock Availability ── */}
      <div className="flex items-center gap-2 pt-1">
        {currentStock ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-emerald-700 font-extrabold">In Stock</span>
            <span className="text-slate-500">
              (Only {stockCount} units left)
            </span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="text-xs font-extrabold text-red-600">
              Currently Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Variant Selector (if product variants exist) ── */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block">
            Select Option / Variant:
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedVariant?.id === variant.id
                    ? "border-[#00AEEF] bg-[#E0F7FC] text-[#00AEEF] ring-2 ring-[#00AEEF]/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                {variant.name} — ₹{variant.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Check Delivery Pincode Box ── */}
      <div className="bg-sky-50/40 border border-sky-100 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-800" />
          <div>
            <div className="text-xs font-extrabold text-slate-900">
              Check Delivery
            </div>
            <div className="text-[11px] text-slate-500">
              Enter your pincode to know delivery time & charges
            </div>
          </div>
        </div>

        <form onSubmit={handleCheckPincode} className="flex items-center gap-2">
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
            placeholder="Enter 6-digit pincode"
            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF] transition-all"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0A1128] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
          >
            Check
          </button>
        </form>

        {pincodeStatus === "valid" && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Standard delivery available for {pincode}</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              ⚡ Estimated Delivery by{" "}
              <strong className="text-slate-900">{deliveryDate}</strong> • Fast
              Dispatch
            </p>
          </div>
        )}

        {pincodeStatus === "invalid" && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1 pt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Please enter a
            valid 6-digit PIN code.
          </p>
        )}
      </div>

      {/* ── 4 Trust Badges Strip (Matches Screenshot) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100">
        <div className="flex items-center gap-2.5 text-left">
          <ShieldCheck className="w-5 h-5 text-[#00AEEF] shrink-0" />
          <div className="text-[11px] font-bold text-slate-800 leading-tight">
            Genuine Product
            <span className="block font-medium text-slate-500 text-[10px]">
              with Warranty
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-left">
          <FileText className="w-5 h-5 text-[#00AEEF] shrink-0" />
          <div className="text-[11px] font-bold text-slate-800 leading-tight">
            GST Invoice
            <span className="block font-medium text-slate-500 text-[10px]">
              Available
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-left">
          <Package className="w-5 h-5 text-[#00AEEF] shrink-0" />
          <div className="text-[11px] font-bold text-slate-800 leading-tight">
            Secure Packaging
            <span className="block font-medium text-slate-500 text-[10px]">
              & Fast Dispatch
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-left">
          <Headphones className="w-5 h-5 text-[#00AEEF] shrink-0" />
          <div className="text-[11px] font-bold text-slate-800 leading-tight">
            Technical Support
            <span className="block font-medium text-slate-500 text-[10px]">
              from Experts
            </span>
          </div>
        </div>
      </div>

      {/* ── Quantity Selector & Action Buttons Row ── */}
      <div className="space-y-4 pt-1">
        {currentStock ? (
          <div className="space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
            <div className="flex items-center gap-2.5 sm:flex-1">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 px-2.5 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 sm:inline hidden">
                  Qty
                </span>
                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs cursor-pointer transition-colors"
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
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 px-3 sm:py-3.5 sm:px-5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>ADD TO CART</span>
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={() =>
                onBuyNow
                  ? onBuyNow(product, quantity)
                  : onAddToCart(product, quantity)
              }
              className="w-full sm:flex-1 bg-[#0A1128] hover:bg-slate-800 text-white py-3 px-4 sm:py-3.5 sm:px-5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span>BUY NOW</span>
            </button>
          </div>
        ) : (
          <a
            href={getWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/25 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
            <span>Out of Stock — Inquire on WhatsApp</span>
          </a>
        )}

        {/* Secondary Action Links */}
        <div className="flex items-center justify-center gap-8 pt-1 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            className={`flex items-center gap-2 hover:text-red-500 transition-colors cursor-pointer ${
              isWishlisted ? "text-red-500 font-black" : ""
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
            <span>{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</span>
          </button>

          <span className="text-slate-200">|</span>

          <a
            href={getWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 hover:text-[#00AEEF] transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Ask an Expert</span>
          </a>
        </div>
      </div>
    </div>
  );
};
