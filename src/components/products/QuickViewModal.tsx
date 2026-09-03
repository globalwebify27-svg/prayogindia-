"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Star,
  ShoppingCart,
  Zap,
  Heart,
  CheckCircle,
  XCircle,
  Download,
  Play,
  Image as ImageIcon,
  ExternalLink,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Product } from "@/data/mockData";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product, variantId?: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

type MediaTab = "images" | "video" | "360";

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(product.variants?.[0]?.id);
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab>("images");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [quickPincode, setQuickPincode] = useState("");
  const [quickPinStatus, setQuickPinStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");

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

  const allImages = React.useMemo(() => {
    if (product.images && product.images.length > 1) {
      return product.images;
    }
    const baseImg =
      product.image ||
      (product.images && product.images[0]) ||
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80";
    return [
      baseImg,
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    ];
  }, [product]);

  const media360 = product.media360 ?? [];
  const hasVideo = !!product.videoUrl;
  const has360 = media360.length > 0;

  const handleAddToCart = () => {
    onAddToCart?.(product, selectedVariantId);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const specEntries = Object.entries(product.specs ?? {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div>
            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
              {product.sku} · {product.category}
            </span>
            <h2 className="text-sm font-black text-slate-900 line-clamp-1 mt-0.5">
              {product.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isWishlisted
                    ? "text-red-500 bg-red-50"
                    : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                }`}
                title="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="flex flex-col lg:flex-row gap-0 flex-1">
          {/* Left — Media Panel */}
          <div className="lg:w-5/12 bg-slate-50 p-5 space-y-4 rounded-bl-3xl">
            {/* Media Tab Switcher */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setActiveMediaTab("images")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  activeMediaTab === "images"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ImageIcon className="w-3 h-3" /> Photos
              </button>
              {hasVideo && (
                <button
                  onClick={() => setActiveMediaTab("video")}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    activeMediaTab === "video"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Play className="w-3 h-3" /> Video
                </button>
              )}
              <button
                onClick={() => setActiveMediaTab("360")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  activeMediaTab === "360"
                    ? "bg-purple-900 text-purple-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <RotateCcw className="w-3 h-3 text-purple-400" /> 360° View
              </button>
            </div>

            {/* Media Viewer */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
              {activeMediaTab === "images" && (
                <>
                  <Image
                    src={allImages[activeImageIdx]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                  {/* Image nav arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIdx(
                            (prev) =>
                              (prev - 1 + allImages.length) % allImages.length,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 shadow rounded-full flex items-center justify-center text-slate-700 hover:text-[#00AEEF] cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIdx(
                            (prev) => (prev + 1) % allImages.length,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 shadow rounded-full flex items-center justify-center text-slate-700 hover:text-[#00AEEF] cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )}
              {activeMediaTab === "video" && hasVideo && (
                <video
                  src={product.videoUrl}
                  controls
                  className="w-full h-full object-contain rounded-xl"
                />
              )}
              {activeMediaTab === "360" && (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900/95 p-4 text-center select-none">
                  {/* 360 Interactive Model/Photo */}
                  <div className="relative w-full h-44 flex items-center justify-center">
                    <img
                      src={allImages[activeImageIdx] || product.image}
                      alt="360 view model"
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,174,239,0.3)] animate-pulse"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 bg-slate-800/90 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-bold">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
                    <span>360° Hardware Rotation Preview</span>
                  </div>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {activeMediaTab === "images" && allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-12 h-12 shrink-0 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                      activeImageIdx === idx
                        ? "border-[#00AEEF]"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Downloadable Docs */}
            {product.documents && product.documents.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  Downloads
                </span>
                {product.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 hover:border-[#00AEEF] hover:text-[#00AEEF] transition-all group"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00AEEF]" />
                    <span className="flex-1 truncate">{doc.title}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                      {doc.type}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info Panel */}
          <div className="lg:w-7/12 p-6 space-y-4 overflow-y-auto">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {discountPct && (
                <span className="bg-[#FF3B30] text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {discountPct}% OFF
                </span>
              )}
              {product.badge && (
                <span className="bg-slate-900 text-[#00AEEF] text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {product.badge}
                </span>
              )}
              {product.brand && (
                <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">
                {product.rating}
              </span>
              <span className="text-xs text-slate-400">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Pricing Block */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                {displayMrp > displayPrice && (
                  <span className="text-sm text-slate-400 line-through font-bold">
                    ₹{displayMrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discountPct && (
                  <span className="text-xs font-black bg-[#FF3B30] text-white px-2 py-0.5 rounded-md uppercase">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Incl. GST & Price Match Link */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/70">
                <span className="text-slate-500 font-medium">
                  Incl. GST (No Hidden Charges)
                </span>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="font-bold text-slate-900 underline hover:text-[#00AEEF] transition-colors"
                >
                  Found a better price?
                </Link>
              </div>

              {/* Urgency Stock Bar */}
              {isInStock && (
                <div className="pt-1 space-y-1.5">
                  <p className="text-xs font-bold text-[#E05344]">
                    Please hurry! Only {(product.id.charCodeAt(0) % 6) + 3} left
                    in stock
                  </p>
                  <div className="w-full bg-slate-200/90 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E05344] via-amber-500 to-emerald-500"
                      style={{
                        width: `${Math.min(100, Math.max(20, (((product.id.charCodeAt(0) % 6) + 3) / 10) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pincode Delivery Availability Checker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 border-l-4 border-l-[#FF7A00] shadow-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={quickPincode}
                  onChange={(e) => {
                    setQuickPincode(e.target.value.replace(/\D/g, ""));
                    if (quickPinStatus !== "idle") setQuickPinStatus("idle");
                  }}
                  placeholder="Enter Pincode to Check Delivery"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (/^\d{6}$/.test(quickPincode.trim())) {
                      setQuickPinStatus("valid");
                    } else {
                      setQuickPinStatus("invalid");
                    }
                  }}
                  className="px-4 py-2 bg-[#0A1128] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Check
                </button>
              </div>
              {quickPinStatus === "valid" && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-medium text-emerald-800 space-y-0.5">
                  <p className="font-bold flex items-center gap-1">
                    ✓ Express Delivery Available for {quickPincode}
                  </p>
                  <p className="text-slate-600">
                    ⚡ Estimated Delivery within 2-4 business days
                  </p>
                </div>
              )}
              {quickPinStatus === "invalid" && (
                <p className="text-[11px] text-red-600 font-medium">
                  Please enter a valid 6-digit PIN code.
                </p>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Select Variant
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedVariantId === v.id
                          ? "bg-[#00AEEF] text-white border-[#00AEEF] shadow-sm shadow-[#00AEEF]/20"
                          : v.inStock
                            ? "bg-white text-slate-700 border-slate-200 hover:border-[#00AEEF]"
                            : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                      }`}
                      disabled={!v.inStock && selectedVariantId !== v.id}
                      title={!v.inStock ? "Out of Stock" : v.name}
                    >
                      {v.name}
                      {!v.inStock && (
                        <span className="ml-1 text-[8px]">(OOS)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id={`quickview-add-cart-${product.id}`}
                onClick={handleAddToCart}
                disabled={!isInStock}
                className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer ${
                  addedFeedback
                    ? "bg-emerald-600 text-white"
                    : "border-2 border-[#00AEEF] text-[#00AEEF] hover:bg-[#E0F7FC]"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {addedFeedback ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button
                id={`quickview-buy-now-${product.id}`}
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex items-center justify-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-2xl text-xs font-extrabold shadow-md shadow-[#00AEEF]/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Buy Now
              </button>
            </div>

            {/* Tech Specs Table */}
            {specEntries.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  Technical Specifications
                </span>
                <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full">
                    <tbody>
                      {specEntries.map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}
                        >
                          <td className="px-3.5 py-2 font-bold text-slate-600 w-2/5">
                            {key}
                          </td>
                          <td className="px-3.5 py-2 font-semibold text-slate-900">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View Full Product Page */}
            <Link
              href={`/products/${product.slug || product.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-[#00AEEF] hover:underline"
              onClick={onClose}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Full Product Page with Reviews & All Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
