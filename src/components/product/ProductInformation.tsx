"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Truck,
  Headphones,
  ShoppingCart,
  Heart,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Package,
  MessageSquare,
  Share2,
  Check,
  Zap,
  HelpCircle,
  X,
} from "lucide-react";
import { Product, ProductVariant, getProductStock } from "@/data/mockData";
import { useUIStore, useCartStore } from "@/store";

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
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
  onOpenB2BModal?: () => void;
}

export const ProductInformation: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  onSelectVariant,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  quantity,
  onQuantityChange,
  onOpenB2BModal,
}) => {
  const [internalQuantity, setInternalQuantity] = useState(1);
  const currentQuantity = quantity ?? internalQuantity;
  const updateQuantity = (newQty: number) => {
    if (onQuantityChange) {
      onQuantityChange(newQty);
    } else {
      setInternalQuantity(newQty);
    }
  };

  const [copied, setCopied] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isPriceMatchOpen, setIsPriceMatchOpen] = useState(false);
  const [priceMatchUrl, setPriceMatchUrl] = useState("");
  const [priceMatchPrice, setPriceMatchPrice] = useState("");
  const [priceMatchSuccess, setPriceMatchSuccess] = useState(false);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = selectedVariant
    ? selectedVariant.inStock
    : product.inStock;

  // Real inventory mapping directly from product/variant store data
  const availableStock = useMemo(() => {
    return getProductStock(product, selectedVariant);
  }, [product, selectedVariant]);

  const [topStockPopup, setTopStockPopup] = useState<{
    visible: boolean;
    limit: number;
  }>({ visible: false, limit: 0 });
  const topStockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showStockLimitPopup = (limit: number) => {
    setTopStockPopup({ visible: true, limit });

    useUIStore.getState().showToast({
      title: limit <= 0 ? "This item is currently out of stock." : `Only ${limit} units available.`,
      type: "error",
      iconType: "stock-limit",
      duration: 3000,
    });

    if (topStockTimeoutRef.current) {
      clearTimeout(topStockTimeoutRef.current);
    }
    topStockTimeoutRef.current = setTimeout(() => {
      setTopStockPopup((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleIncreaseQuantity = () => {
    if (!currentStock || availableStock <= 0) {
      showStockLimitPopup(0);
      return;
    }
    if (currentQuantity >= availableStock) {
      showStockLimitPopup(availableStock);
      return;
    }
    updateQuantity(currentQuantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (currentQuantity <= 1) return;
    updateQuantity(currentQuantity - 1);
  };

  // Pincode Delivery Checker State
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Calculate estimated delivery date
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDate(
      d.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
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
    ((currentMrp - currentPrice) / currentMrp) * 100
  );
  const savings = currentMrp - currentPrice;

  // Extract clean inline spec highlights
  const keySpecs = useMemo(() => {
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

  // WhatsApp Expert Inquiry URL
  const getWhatsAppInquiryUrl = () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://prayogindia.in/products/${product.slug || product.id}`;
    const text = `Hello Prayog India Team, I have a technical query regarding this product:\n\n*Product:* ${product.name}\n*SKU:* ${currentSku}\n*Price:* ₹${currentPrice.toLocaleString("en-IN")}\n*Link:* ${currentUrl}\n\nPlease assist me. Thank you!`;
    return `https://wa.me/918709789641?text=${encodeURIComponent(text)}`;
  };

  const handleAddToCartClick = () => {
    if (!currentStock || availableStock <= 0) {
      showStockLimitPopup(0);
      return;
    }

    // Check cart contents to ensure total quantity doesn't exceed stock
    const cart = useCartStore.getState().cart;
    const existingCartItem = cart.find((item) => item.product.id === product.id);
    const existingQty = existingCartItem ? existingCartItem.quantity : 0;

    if (existingQty + currentQuantity > availableStock) {
      showStockLimitPopup(availableStock);
      return;
    }

    onAddToCart(product, currentQuantity);
    setAddedAnimation(true);
    useUIStore.getState().showToast({
      title: "Added to Cart",
      message: `Added ${currentQuantity} x ${product.name} to cart!`,
      type: "success",
    });
    setTimeout(() => setAddedAnimation(false), 2200);
  };

  const handleBuyNowClick = () => {
    if (!currentStock || availableStock <= 0) {
      showStockLimitPopup(0);
      return;
    }

    if (currentQuantity > availableStock) {
      showStockLimitPopup(availableStock);
      return;
    }

    if (onBuyNow) {
      onBuyNow(product, currentQuantity);
    } else {
      onAddToCart(product, currentQuantity);
      if (typeof window !== "undefined") {
        window.location.href = "/checkout";
      }
    }
  };

  const handlePriceMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPriceMatchSuccess(true);
    setTimeout(() => {
      setPriceMatchSuccess(false);
      setIsPriceMatchOpen(false);
      setPriceMatchUrl("");
      setPriceMatchPrice("");
    }, 2200);
  };

  return (
    <div className="space-y-4 text-slate-900">
      {/* ── 1. Top Badges Row: Brand, Free Shipping, Best Price Guaranteed, Sale % ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2.5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Brand Badge */}
          <span className="font-extrabold uppercase tracking-wider text-[#005CA9] text-[11px] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/80">
            {product.brand || "PRAYOG INDIA"}
          </span>

          {/* Free Shipping Badge (as in reference Image 1) */}
          <span className="font-extrabold uppercase tracking-wider text-emerald-700 text-[10px] sm:text-[11px] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/90 shadow-2xs">
            FREE SHIPPING
          </span>

          {/* Best Price Guaranteed Badge (as in reference Image 1) */}
          <span className="font-extrabold uppercase tracking-wider text-blue-700 text-[10px] sm:text-[11px] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200/90 shadow-2xs">
            BEST PRICE GUARANTEED
          </span>

          {/* Sale Percentage Pill (as in reference Image 1) */}
          {discountPercentage > 0 && (
            <span className="font-black text-white text-[10px] sm:text-[11px] bg-red-600 px-2.5 py-1 rounded-md shadow-sm">
              Sale {discountPercentage}%
            </span>
          )}

          {/* SKU Pill */}
          <span className="font-mono text-slate-500 font-semibold text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            SKU: <strong className="text-slate-800">{currentSku}</strong>
          </span>
        </div>

        {/* Share & Wishlist Shortcut */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              isWishlisted
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-red-600"
            }`}
            title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
            <span className="hidden sm:inline">
              {isWishlisted ? "Saved" : "Wishlist"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              copied
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-[#005CA9]"
            }`}
            title="Share Product"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. Product Title ── */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
        {product.name}
      </h1>

      {/* ── 3. Rating & Reviews Row ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <span className="font-bold text-slate-800 ml-1">
            {Number(product.rating || 4.9).toFixed(1)}
          </span>
          <span className="text-slate-400">
            ({product.reviews || 19} reviews)
          </span>
        </div>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500 font-medium">No questions asked</span>
        {keySpecs.length > 0 && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{keySpecs.join(" • ")}</span>
          </>
        )}
      </div>

      {/* ── 4. Pricing Block ── */}
      <div className="pt-2 pb-1 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
          {discountPercentage > 0 && (
            <span className="text-xl sm:text-2xl font-extrabold text-red-600">
              -{discountPercentage}%
            </span>
          )}

          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>

          {currentMrp > currentPrice && (
            <span className="text-sm sm:text-base text-slate-400 line-through font-medium">
              ₹{currentMrp.toLocaleString("en-IN")}
            </span>
          )}

          {savings > 0 && (
            <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
              SAVE ₹{savings.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Tax Note + Price Match Promise */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Incl. GST (No Hidden Charges)</span>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => setIsPriceMatchOpen(true)}
            className="text-[#2563EB] hover:underline font-bold transition-colors cursor-pointer"
          >
            Found a better price?
          </button>
        </div>
      </div>

      {/* ── 5. Availability Status ── */}
      <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold">
        <span className="text-[#0A1128]">Availability:</span>
        <span className={currentStock ? "text-[#2E7D32]" : "text-rose-600"}>
          {currentStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* ── 6. Variant Selector (if applicable) ── */}
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {variant.name} — ₹{variant.price}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 7. Quantity + ADD TO CART + BUY NOW + WISHLIST ── */}
      <div id="main-product-cta" className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center gap-[12px]">
          {/* Quantity Box */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Quantity:</span>
            <div className="flex items-center border border-slate-200 rounded-[12px] h-[54px] bg-white shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                disabled={currentQuantity <= 1}
                className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-25 font-bold text-base cursor-pointer transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-black text-slate-900 select-none">
                {currentQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncreaseQuantity}
                className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold text-base cursor-pointer transition-colors"
                aria-label="Increase quantity"
                title={currentQuantity >= availableStock ? `Available stock limit (${availableStock}) reached` : "Increase quantity"}
              >
                +
              </button>
            </div>
          </div>

          {/* Secondary ADD TO CART Button */}
          {currentStock ? (
            <button
              type="button"
              onClick={handleAddToCartClick}
              className={`flex-1 min-w-0 sm:flex-initial sm:min-w-[190px] h-[54px] px-6 sm:px-8 rounded-[12px] text-[16px] font-[600] transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${
                addedAnimation
                  ? "bg-emerald-600 border-2 border-emerald-600 text-white shadow-sm scale-[1.01]"
                  : "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 border-2 border-slate-300 hover:border-slate-400 shadow-2xs active:scale-[0.99]"
              }`}
            >
              <span>{addedAnimation ? "Added to Cart!" : "Add to Cart"}</span>
            </button>
          ) : (
            <a
              href={`https://wa.me/918709789641?text=Hi%20Prayog%20India%2C%20I%20want%20to%20inquire%20about%20availability%20of%20${encodeURIComponent(product.name)}%20(SKU:%20${encodeURIComponent(currentSku)})`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 sm:flex-initial sm:min-w-[190px] h-[54px] px-6 sm:px-8 rounded-[12px] text-[16px] font-[600] text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-[0.99]"
            >
              <span>Inquire on WhatsApp</span>
            </a>
          )}

          {/* Primary BUY NOW Button */}
          {currentStock && (
            <button
              type="button"
              onClick={handleBuyNowClick}
              className="flex-1 min-w-0 sm:flex-initial sm:min-w-[160px] h-[54px] px-6 sm:px-8 rounded-[12px] text-[16px] font-[600] text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-[0.99] select-none"
            >
              <span>Buy Now</span>
            </button>
          )}
        </div>

        {/* Add to Wishlist Text Button (as in Image 1: "♡ ADD TO WISHLIST") */}
        <div className="flex items-center justify-start pt-0.5">
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"
              }`}
            />
            <span className="uppercase tracking-wider">
              {isWishlisted ? "Added in Wishlist" : "ADD TO WISHLIST"}
            </span>
          </button>
        </div>
      </div>

      {/* ── 8. Pincode Delivery Checker Box (Highlighted with Red Checkmark in Image 1) ── */}
      <div className="pt-2">
        <form
          onSubmit={handleCheckPincode}
          className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-300 rounded-2xl max-w-lg shadow-2xs"
        >
          <Truck className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
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
            placeholder="Enter Pincode to Check Delivery"
            className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {/* Dark Check Button as in Image 1 */}
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Check
          </button>
        </form>

        {pincodeStatus === "valid" && (
          <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Delivery Available for PIN {pincode}!
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Estimated Delivery by <strong>{deliveryDate}</strong> • Free
                Pan-India Express Surface Dispatch from Ranchi Central Hub.
              </p>
            </div>
          </div>
        )}

        {pincodeStatus === "invalid" && (
          <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>Please enter a valid 6-digit Indian Postal PIN code.</span>
          </div>
        )}
      </div>

      {/* ── 9. Trust Badges Row ── */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80">
          <ShieldCheck className="w-4 h-4 text-[#005CA9] shrink-0" />
          <span>100% Genuine</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80">
          <FileText className="w-4 h-4 text-[#005CA9] shrink-0" />
          <span>GST Tax Invoice</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80">
          <Package className="w-4 h-4 text-[#005CA9] shrink-0" />
          <span>Fast Dispatch</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80">
          <Headphones className="w-4 h-4 text-[#005CA9] shrink-0" />
          <span>Tech Support</span>
        </div>
      </div>

      {/* ── 10. Technical Help WhatsApp Link ── */}
      <div className="pt-1 flex items-center justify-between">
        <a
          href={getWhatsAppInquiryUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#005CA9] transition-colors"
        >
          <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          <span>Have technical doubts? Chat with our hardware engineer</span>
        </a>
      </div>

      {/* ── Modal: Found a Better Price? Price Match Guarantee ── */}
      {isPriceMatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsPriceMatchOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {priceMatchSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Price Match Request Received!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our sales team will review the competitor link and send you an instant discount voucher code on WhatsApp.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  Prayog India Best Price Promise
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Found {product.name} cheaper on another authorized Indian store? Share the link and we will match or beat the price!
                </p>

                <form onSubmit={handlePriceMatchSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Competitor Website / Product Link *
                    </label>
                    <input
                      type="url"
                      required
                      value={priceMatchUrl}
                      onChange={(e) => setPriceMatchUrl(e.target.value)}
                      placeholder="https://example.com/product..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Competitor Listed Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={priceMatchPrice}
                      onChange={(e) => setPriceMatchPrice(e.target.value)}
                      placeholder="e.g. 2350"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-[#005CA9] hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Submit Price Match Request →
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── Top Floating Stock Limit Pill Popup (Exact match to User Reference) ── */}
      <AnimatePresence>
        {topStockPopup.visible && (
          <aside
            aria-live="polite"
            className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto select-none"
            onClick={() => setTopStockPopup((prev) => ({ ...prev, visible: false }))}
          >
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-[0_12px_38px_-6px_rgba(0,0,0,0.16),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-200/90 px-6 py-3.5 flex items-center gap-3.5 whitespace-nowrap cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0 shadow-xs text-white">
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3.5] text-white" />
              </div>
              <span className="text-[15px] sm:text-[16px] font-semibold text-slate-900 tracking-tight font-sans">
                {topStockPopup.limit <= 0
                  ? "This item is currently out of stock."
                  : `Only ${topStockPopup.limit} units available.`}
              </span>
            </motion.div>
          </aside>
        )}
      </AnimatePresence>
    </div>
  );
};
