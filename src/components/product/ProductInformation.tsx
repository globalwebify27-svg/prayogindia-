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
  Clock,
Info,
  BatteryCharging,
  Circle,
  Plane,
  Store,
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

// High-Quality Multi-Tone Delivery Truck Vector SVG
const DeliveryTruckSVG = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Delivery"
  >
    <rect x="1" y="4" width="13" height="11" rx="1.5" fill="#005CA9" />
    <path d="M4 7H9.5M3 10H8M4.5 13H7" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <path
      d="M14 8H18.2C18.677 8 19.1345 8.18964 19.472 8.52716L22.472 11.5272C22.8095 11.8647 23 12.3222 23 12.8V15H14V8Z"
      fill="#00AEEF"
    />
    <path
      d="M15.5 9.5H18.2C18.3989 9.5 18.5896 9.57902 18.7303 9.71967L20.7803 11.7697C20.921 11.9103 21 12.1011 21 12.3V12.5H15.5V9.5Z"
      fill="white"
      opacity="0.9"
    />
    <rect x="22" y="14" width="1.5" height="1.5" rx="0.5" fill="#FFC20E" />
    <circle cx="5.5" cy="16.5" r="2.5" fill="#0F172A" />
    <circle cx="5.5" cy="16.5" r="1" fill="#E2E8F0" />
    <circle cx="17.5" cy="16.5" r="2.5" fill="#0F172A" />
    <circle cx="17.5" cy="16.5" r="1" fill="#E2E8F0" />
  </svg>
);

// Clean Mode Vector Icons
const AirPlaneSVG = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const RoadFreightSVG = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

const StorePickupSVG = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <circle cx="12" cy="7" r="2" />
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
      title: limit <= 0 ? "This item is currently out of stock." : `Only ${limit} units available in stock`,
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

  // Calculate estimated delivery dates
  const airDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  const surfaceDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Delivery options resolved from Admin configuration
  const isAirAllowed = product.airFreightAllowed !== false;
  const isSurfaceAllowed = product.surfaceFreightAllowed !== false;
  const isLocalPickupAllowed = product.localPickupAllowed !== false;
  const shippingTag = product.shippingTag || "Standard Express";
  const isBatteryRestricted = !isAirAllowed || shippingTag.toLowerCase().includes("battery");

  // User selectable delivery mode
  const defaultDeliveryMode: "air" | "surface" | "pickup" = isAirAllowed
    ? "air"
    : isSurfaceAllowed
    ? "surface"
    : "pickup";

  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<"air" | "surface" | "pickup">(defaultDeliveryMode);

  useEffect(() => {
    setSelectedDeliveryMode(isAirAllowed ? "air" : isSurfaceAllowed ? "surface" : "pickup");
  }, [product.id, isAirAllowed, isSurfaceAllowed]);

  const handleSelectDeliveryMode = (mode: "air" | "surface" | "pickup") => {
    if (mode === "air") {
      if (!isAirAllowed) {
        useUIStore.getState().showToast({
          title: "Air Express is not available on this product.",
          type: "error",
          duration: 3500,
        });
        return;
      }
      setSelectedDeliveryMode("air");
      return;
    }

    if (mode === "surface") {
      if (!isSurfaceAllowed) {
        useUIStore.getState().showToast({
          title: "Surface Delivery is not available on this product.",
          type: "error",
          duration: 3500,
        });
        return;
      }
      setSelectedDeliveryMode("surface");
      return;
    }

    if (mode === "pickup") {
      if (!isLocalPickupAllowed) {
        useUIStore.getState().showToast({
          title: "Store Pickup is not available on this product.",
          type: "error",
          duration: 3500,
        });
        return;
      }
      setSelectedDeliveryMode("pickup");
      return;
    }
  };

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
      const specKeys = Object.keys(product.specs).filter(
        (k) => !k.startsWith("_")
      );
      for (const key of specKeys.slice(0, 2)) {
        const val = product.specs[key];
        if (typeof val === "string" && val.length < 25) tags.push(val);
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
    <div className="space-y-3 sm:space-y-4 text-slate-900">
      {/* ── Product Title & Share Action ── */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <h1 className="text-[17px] sm:text-2xl font-semibold text-slate-800 tracking-normal leading-snug">
          {product.name}
        </h1>
        <button
          type="button"
          onClick={handleShare}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer mt-0.5"
          title="Share Product"
          aria-label="Share Product"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>

      {/* ── SKU & Rating Row (Clean, matching reference design) ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-mono text-slate-500 font-medium">
          SKU : <strong className="text-slate-800 font-bold">{currentSku}</strong>
        </span>
        <span className="text-slate-300">•</span>
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

      {/* ── 4. Pricing Block & Quantity Capsule Selector (Beside Price, matching reference design) ── */}
      <div className="pt-2 pb-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Live Price, MRP & Discount Badge */}
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              ₹{currentPrice.toLocaleString("en-IN")}
            </div>

            <div className="flex items-center gap-2">
              {currentMrp > currentPrice && (
                <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                  ₹{currentMrp.toLocaleString("en-IN")}
                </span>
              )}

              {discountPercentage > 0 && (
                <span className="text-[11px] sm:text-xs font-black uppercase text-white bg-[#0B0F6B] px-2 py-0.5 rounded-md shadow-2xs">
                  {discountPercentage}% OFF
                </span>
              )}

              {savings > 0 && discountPercentage <= 0 && (
                <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  SAVE ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* Right: Quantity Capsule Selector (Beside Price) */}
          <div className="flex items-center border border-slate-200 rounded-full h-10 sm:h-11 bg-white shadow-2xs overflow-hidden shrink-0">
            <button
              type="button"
              onClick={handleDecreaseQuantity}
              disabled={currentQuantity <= 1}
              className="w-9 sm:w-10 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 font-bold text-lg cursor-pointer transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-bold text-slate-900 select-none">
              {currentQuantity}
            </span>
            <button
              type="button"
              onClick={handleIncreaseQuantity}
              className="w-9 sm:w-10 h-full flex items-center justify-center text-[#0B0F6B] hover:bg-slate-50 font-bold text-lg cursor-pointer transition-colors"
              aria-label="Increase quantity"
              title={
                currentQuantity >= availableStock
                  ? `Available stock limit (${availableStock}) reached`
                  : "Increase quantity"
              }
            >
              +
            </button>
          </div>
        </div>

        {/* Tax Note + Price Match Promise */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium pt-0.5">
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

      {/* ── 7. Desktop CTA (Add to Cart & Buy Now) ── */}
      <div id="main-product-cta" className="hidden sm:block pt-2">
        <div className="flex items-center gap-3">
          {/* Secondary ADD TO CART Button */}
          {currentStock ? (
            <button
              type="button"
              onClick={handleAddToCartClick}
              className={`flex-initial min-w-[140px] h-11 px-6 rounded-xl text-[15px] font-semibold whitespace-nowrap transition-all duration-200 ease-out flex items-center justify-center cursor-pointer select-none ${
                addedAnimation
                  ? "bg-emerald-600 border border-emerald-600 text-white shadow-xs scale-[1.01]"
                  : "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 border border-slate-300 hover:border-slate-400 shadow-2xs active:scale-[0.98]"
              }`}
            >
              <span>{addedAnimation ? "Added to Cart!" : "Add to Cart"}</span>
            </button>
          ) : (
            <a
              href={`https://wa.me/918709789641?text=Hi%20Prayog%20India%2C%20I%20want%20to%20inquire%20about%20availability%20of%20${encodeURIComponent(product.name)}%20(SKU:%20${encodeURIComponent(currentSku)})`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-initial min-w-[150px] h-11 px-6 rounded-xl text-[15px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs shadow-emerald-600/20 whitespace-nowrap transition-all duration-200 ease-out flex items-center justify-center cursor-pointer active:scale-[0.98]"
            >
              <span>Inquire on WhatsApp</span>
            </a>
          )}

          {/* Primary BUY NOW Button */}
          {currentStock && (
            <button
              type="button"
              onClick={handleBuyNowClick}
              className="flex-initial min-w-[130px] h-11 px-6 rounded-xl text-[15px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-xs hover:shadow-sm whitespace-nowrap transition-all duration-200 ease-out flex items-center justify-center cursor-pointer active:scale-[0.98] select-none"
            >
              <span>Buy Now</span>
            </button>
          )}

          {/* Wishlist Button (Desktop) */}
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer ml-1.5"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"
              }`}
            />
            <span className="uppercase tracking-wider">
              {isWishlisted ? "Saved" : "Add to Wishlist"}
            </span>
          </button>
        </div>
      </div>

      {/* ── 8. Delivery & Dispatch Options (Interactive: Compact Mobile & Full Desktop) ── */}
      <div className="pt-2">
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 p-3 sm:p-4 shadow-2xs space-y-2 sm:space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 sm:pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-sky-100/70 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <DeliveryTruckSVG className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-none sm:leading-normal">
                  Select Delivery Mode
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
                  Choose your preferred transit mode • Direct from Ranchi Hub
                </p>
              </div>
            </div>

            {product.shippingTag && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {product.shippingTag}
              </span>
            )}
          </div>

          {/* Freight Modes Interactive Selection Grid (3-column compact pill cards on mobile to save vertical space) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {/* 1. By Air Freight */}
            <button
              type="button"
              onClick={() => handleSelectDeliveryMode("air")}
              className={`py-2 px-1.5 sm:p-3 rounded-xl border text-center sm:text-left transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-1 cursor-pointer relative ${
                selectedDeliveryMode === "air" && isAirAllowed
                  ? "bg-blue-50/80 border-blue-600 ring-1 sm:ring-2 ring-blue-500/30 shadow-xs"
                  : isAirAllowed
                  ? "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 shadow-2xs"
                  : "bg-slate-50/90 border-amber-200/90 hover:border-amber-400 opacity-85"
              }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 min-w-0">
                <AirPlaneSVG className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                  By Air
                </span>
                {!isAirAllowed && (
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Restricted
                  </span>
                )}
              </div>

              {/* Selection / Warning Indicator */}
              <div className="shrink-0 ml-1 hidden sm:block">
                {selectedDeliveryMode === "air" && isAirAllowed ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                ) : isAirAllowed ? (
                  <Circle className="w-4 h-4 text-slate-300" />
                ) : (
                  <span title="Click to view restriction alert">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </span>
                )}
              </div>
            </button>

            {/* 2. By Land / Road (Surface Cargo) */}
            <button
              type="button"
              onClick={() => handleSelectDeliveryMode("surface")}
              className={`py-2 px-1.5 sm:p-3 rounded-xl border text-center sm:text-left transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-1 cursor-pointer relative ${
                selectedDeliveryMode === "surface" && isSurfaceAllowed
                  ? "bg-emerald-50/80 border-emerald-600 ring-1 sm:ring-2 ring-emerald-500/30 shadow-xs"
                  : isSurfaceAllowed
                  ? "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70 shadow-2xs"
                  : "bg-slate-50/90 border-slate-200/80 opacity-70"
              }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 min-w-0">
                <RoadFreightSVG className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                  By Road
                </span>
                {!isSurfaceAllowed && (
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                    N/A
                  </span>
                )}
              </div>

              {/* Selection Indicator */}
              <div className="shrink-0 ml-1 hidden sm:block">
                {selectedDeliveryMode === "surface" && isSurfaceAllowed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                ) : isSurfaceAllowed ? (
                  <Circle className="w-4 h-4 text-slate-300" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* 3. Local Store Pickup */}
            <button
              type="button"
              onClick={() => handleSelectDeliveryMode("pickup")}
              className={`py-2 px-1.5 sm:p-3 rounded-xl border text-center sm:text-left transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-1 cursor-pointer relative ${
                selectedDeliveryMode === "pickup" && isLocalPickupAllowed
                  ? "bg-purple-50/80 border-purple-600 ring-1 sm:ring-2 ring-purple-500/30 shadow-xs"
                  : isLocalPickupAllowed
                  ? "bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/70 shadow-2xs"
                  : "bg-slate-50/90 border-slate-200/80 opacity-70"
              }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 min-w-0">
                <StorePickupSVG className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                  <span className="inline xs:hidden">Pickup</span>
                  <span className="hidden xs:inline">Store Pickup</span>
                </span>
                {!isLocalPickupAllowed && (
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                    N/A
                  </span>
                )}
              </div>

              {/* Selection Indicator */}
              <div className="shrink-0 ml-1 hidden sm:block">
                {selectedDeliveryMode === "pickup" && isLocalPickupAllowed ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 fill-purple-50" />
                ) : isLocalPickupAllowed ? (
                  <Circle className="w-4 h-4 text-slate-300" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>
          </div>

          {/* Active Selection Summary Banner */}
          <div className="px-2.5 py-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">
                Est. Arrival:
              </span>
              {selectedDeliveryMode === "air" && (
                <span className="font-bold text-blue-700 truncate">
                  Air Flight ({airDeliveryDate})
                </span>
              )}
              {selectedDeliveryMode === "surface" && (
                <span className="font-bold text-emerald-800 truncate">
                  Road Cargo ({surfaceDeliveryDate})
                </span>
              )}
              {selectedDeliveryMode === "pickup" && (
                <span className="font-bold text-purple-800 truncate">
                  Store Pickup (Ready in 2h)
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:inline font-medium shrink-0 ml-2">
              Click above to switch
            </span>
          </div>

          {/* Integrated Pincode Checker */}
          <div className="pt-0.5">
            <form
              onSubmit={handleCheckPincode}
              className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-white border border-slate-300 rounded-xl shadow-2xs focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <div className="ml-2 shrink-0 flex items-center">
                <DeliveryTruckSVG className="w-4 h-4 opacity-80" />
              </div>
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
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-1.5 py-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
              />
              <button
                type="submit"
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#020617] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Check
              </button>
            </form>

            {pincodeStatus === "valid" && (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-900 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Delivery Available for PIN {pincode}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  {isAirAllowed && (
                    <div className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                      selectedDeliveryMode === "air"
                        ? "bg-white border-blue-400 font-semibold text-blue-900 shadow-2xs"
                        : "bg-white/80 border-emerald-100"
                    }`}>
                      <span><strong>By Air:</strong> Est. {airDeliveryDate} (Express)</span>
                    </div>
                  )}
                  {isSurfaceAllowed && (
                    <div className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                      selectedDeliveryMode === "surface"
                        ? "bg-white border-emerald-400 font-semibold text-emerald-900 shadow-2xs"
                        : "bg-white/80 border-emerald-100"
                    }`}>
                      <span><strong>By Land:</strong> Est. {surfaceDeliveryDate} (Free Standard)</span>
                    </div>
                  )}
                  {isLocalPickupAllowed && (
                    <div className={`p-2 rounded-lg border flex items-center gap-2 sm:col-span-2 transition-all ${
                      selectedDeliveryMode === "pickup"
                        ? "bg-white border-purple-400 font-semibold text-purple-900 shadow-2xs"
                        : "bg-white/80 border-emerald-100"
                    }`}>
                      <span><strong>Store Pickup:</strong> Ready today at Ranchi Store Counter</span>
                    </div>
                  )}
                </div>
                {!isAirAllowed && (
                  <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Air cargo is restricted for this product ({shippingTag}). It will be safely dispatched via insured express road transport.
                    </span>
                  </p>
                )}
              </div>
            )}

            {pincodeStatus === "invalid" && (
              <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Please enter a valid 6-digit Indian Postal PIN code.</span>
              </div>
            )}
          </div>
        </div>


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
                  : `Only ${topStockPopup.limit} units available in stock`}
              </span>
            </motion.div>
          </aside>
        )}
      </AnimatePresence>
    </div>
  );
};
