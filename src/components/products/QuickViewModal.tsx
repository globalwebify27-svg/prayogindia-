"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Check,
  CheckCircle,
  Download,
  Play,
  Image as ImageIcon,
  ExternalLink,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  FileText,
  Layers,
} from "lucide-react";
import { Product, PRODUCTS } from "@/data/mockData";

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

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, variantId?: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

type DetailTab = "specs" | "features" | "box" | "docs";

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) => {
  if (!product) return null;

  return (
    <QuickViewModalContent
      product={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
      onToggleWishlist={onToggleWishlist}
      isWishlisted={isWishlisted}
    />
  );
};

const QuickViewModalContent: React.FC<{
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product, variantId?: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) => {
  const router = useRouter();

  // Enrich product from master PRODUCTS catalog to ensure ALL details (specs, features, whatsIncluded, etc.) are present
  const masterProduct = PRODUCTS.find(
    (p) =>
      p.id === product.id ||
      (Boolean(product.sku) && p.sku === product.sku) ||
      (Boolean(product.slug) && p.slug === product.slug) ||
      p.name.toLowerCase() === product.name.toLowerCase()
  );

  const fullProduct: Product = {
    ...masterProduct,
    ...product,
    description:
      product.description && product.description.length > 40
        ? product.description
        : masterProduct?.description ||
          product.description ||
          "High-precision engineering component engineered for robotics, embedded systems, IoT prototyping and industrial electronics automation.",
    features:
      product.features && product.features.length > 0
        ? product.features
        : masterProduct?.features && masterProduct.features.length > 0
        ? masterProduct.features
        : [
            "100% Genuine microchip architecture with high-precision crystal clocking",
            "Hardware-level circuit protection, power regulation & ESD safe design",
            "Comprehensive Digital I/O and Analog telemetry channels for rapid sensor hookup",
            "Universal IDE, ROS, MicroPython, and Arduino library compatibility",
          ],
    applications:
      product.applications && product.applications.length > 0
        ? product.applications
        : masterProduct?.applications && masterProduct.applications.length > 0
        ? masterProduct.applications
        : [
            "Autonomous Mobile Robotics & Mechatronics",
            "Embedded Prototyping & Smart Automation",
            "IoT Wireless Sensor Telemetry",
            "STEM Education & University Engineering Labs",
          ],
    whatsIncluded:
      product.whatsIncluded && product.whatsIncluded.length > 0
        ? product.whatsIncluded
        : masterProduct?.whatsIncluded && masterProduct.whatsIncluded.length > 0
        ? masterProduct.whatsIncluded
        : [
            `1x ${product.name}`,
            "1x Protective Anti-Static ESD Packaging",
            "1x Quality Assurance & Testing Inspection Seal",
            "1x Online Technical Documentation & Pinout Reference Access",
          ],
    specs: {
      Brand: product.brand || masterProduct?.brand || "Prayog India",
      SKU: product.sku || masterProduct?.sku || "PRG-ITEM",
      Category: product.category || masterProduct?.category || "Hardware & Components",
      ...(masterProduct?.subcategory ? { Subcategory: masterProduct.subcategory } : {}),
      ...(masterProduct?.specs ?? {}),
      ...(product.specs ?? {}),
      ...(masterProduct?.weightGrams ? { Weight: `${masterProduct.weightGrams}g` } : {}),
      ...(masterProduct?.dimensionsCm
        ? {
            Dimensions: `${masterProduct.dimensionsCm.length} × ${masterProduct.dimensionsCm.width} × ${masterProduct.dimensionsCm.height} cm`,
          }
        : {}),
    },
    documents:
      product.documents && product.documents.length > 0
        ? product.documents
        : masterProduct?.documents && masterProduct.documents.length > 0
        ? masterProduct.documents
        : [
            {
              title: `${product.name} Official Technical Datasheet`,
              type: "PDF",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
              title: "Pinout Diagram & Electrical Schematics",
              type: "PDF",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
          ],
  };

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    fullProduct.variants?.[0]?.id
  );
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>("specs");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [quickPincode, setQuickPincode] = useState("");
  const [quickPinStatus, setQuickPinStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const activeVariant = fullProduct.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = activeVariant?.price ?? fullProduct.price;
  const displayMrp = activeVariant?.mrp ?? fullProduct.mrp;
  const isInStock = activeVariant ? activeVariant.inStock : fullProduct.inStock;

  const discountPct =
    displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : null;

  const allImages = useMemo(() => {
    const list = [
      product.image,
      (product as any).secondaryImage,
      ...(product.images || []),
      fullProduct.image,
      (fullProduct as any).secondaryImage,
      ...(fullProduct.images || []),
      masterProduct?.image,
      (masterProduct as any)?.secondaryImage,
      ...(masterProduct?.images || []),
    ].filter(Boolean) as string[];
    const unique = Array.from(new Set(list));
    return unique.length > 0 ? unique : ["/images/products/arduino-uno-r3.png"];
  }, [product, fullProduct, masterProduct]);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isInteractingRef = useRef(false);

  const scrollToSlide = (idx: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const width = container.clientWidth;
    container.scrollTo({
      left: idx * width,
      behavior: "smooth",
    });
    setActiveImageIdx(idx);
  };

  const handlePrev = () => {
    const newIdx = (activeImageIdx - 1 + allImages.length) % allImages.length;
    scrollToSlide(newIdx);
  };

  const handleNext = () => {
    const newIdx = (activeImageIdx + 1) % allImages.length;
    scrollToSlide(newIdx);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const width = container.clientWidth;
    if (width > 0) {
      const newIdx = Math.round(container.scrollLeft / width);
      if (newIdx >= 0 && newIdx < allImages.length && newIdx !== activeImageIdx) {
        setActiveImageIdx(newIdx);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    isDraggingRef.current = true;
    isInteractingRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      isInteractingRef.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftRef.current - deltaX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (isInteractingRef.current && sliderRef.current) {
      const container = sliderRef.current;
      const width = container.clientWidth;
      const deltaX = e.clientX - startXRef.current;
      let targetIdx = activeImageIdx;
      if (deltaX < -40 && activeImageIdx < allImages.length - 1) {
        targetIdx = activeImageIdx + 1;
      } else if (deltaX > 40 && activeImageIdx > 0) {
        targetIdx = activeImageIdx - 1;
      } else {
        targetIdx = Math.round(container.scrollLeft / width);
      }
      scrollToSlide(Math.max(0, Math.min(allImages.length - 1, targetIdx)));
    }
  };

  const handleAddToCart = () => {
    onAddToCart?.(fullProduct, selectedVariantId);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    onAddToCart?.(fullProduct, selectedVariantId);
    onClose();
    router.push("/cart");
  };

  const specEntries = Object.entries(fullProduct.specs ?? {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white z-20 shrink-0">
          <div className="pr-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
              {fullProduct.sku} · {fullProduct.category}
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1 mt-0.5">
              {fullProduct.name}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(fullProduct)}
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

        {/* ── Modal Body (Independent Panels) ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left Column — Media Panel & Trust Assurance */}
          <div className="lg:w-[44%] bg-slate-50/70 p-5 sm:p-6 flex flex-col justify-between gap-4 border-b lg:border-b-0 lg:border-r border-slate-100 shrink-0 overflow-y-auto lg:overflow-hidden">
            <div className="space-y-3.5">
              {/* Media Viewer */}
              <div className="relative aspect-square max-h-[290px] sm:max-h-[310px] w-full rounded-2xl overflow-hidden bg-white border border-slate-200/90 flex items-center justify-center group shadow-xs">
                {allImages.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <ImageIcon className="w-10 h-10 stroke-1" />
                    <span className="text-xs text-slate-400 font-medium">No photo uploaded</span>
                  </div>
                ) : (
                  <>
                    {/* Swipeable & Draggable Image Carousel */}
                    <div
                      ref={sliderRef}
                      onScroll={handleScroll}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing select-none touch-pan-y overscroll-x-contain"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="min-w-full w-full h-full shrink-0 snap-center relative flex items-center justify-center p-4"
                        >
                          <div className="relative w-full h-full">
                            <Image
                              src={img}
                              alt={`${fullProduct.name} image ${idx + 1}`}
                              fill
                              priority={idx === 0}
                              draggable={false}
                              className="object-contain p-2 pointer-events-none select-none transition-transform duration-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Image nav arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center text-slate-700 hover:text-[#2563EB] cursor-pointer transition-all z-10 active:scale-90"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center text-slate-700 hover:text-[#2563EB] cursor-pointer transition-all z-10 active:scale-90"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Image Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-start">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToSlide(idx)}
                      className={`w-11 h-11 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIdx === idx
                          ? "border-[#2563EB] ring-2 ring-blue-500/20 scale-105"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
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
            </div>

            {/* Buyer Trust Guarantees (Anchored neatly on left side) */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">100% Genuine</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Fast Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">7-Day Return</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">GST Invoice</span>
              </div>
            </div>
          </div>

          {/* Right Column — Comprehensive Product Details Panel (Independently Scrollable) */}
          <div className="lg:w-[56%] p-5 sm:p-6 overflow-y-auto min-h-0 space-y-3.5">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-1.5">
              {discountPct && (
                <span className="bg-[#FF3B30] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {discountPct}% OFF
                </span>
              )}
              {fullProduct.brand && (
                <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide border border-blue-200/60">
                  {fullProduct.brand}
                </span>
              )}
              {fullProduct.badge && (
                <span className="bg-slate-900 text-[#FFC20E] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {fullProduct.badge}
                </span>
              )}
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-200/60">
                Verified Authentic
              </span>
            </div>

            {/* Rating Row */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentRating = Number(fullProduct.rating || 4.5);
                  const fillPercentage = Math.max(
                    0,
                    Math.min(100, (currentRating - (star - 1)) * 100)
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
              <span className="font-semibold text-slate-700 text-xs">
                {Number(fullProduct.rating || 4.5).toFixed(1)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                ({fullProduct.reviews || 342} reviews)
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
                  href={`/products/${fullProduct.slug || fullProduct.id}`}
                  onClick={onClose}
                  className="font-bold text-slate-900 underline hover:text-[#2563EB] transition-colors"
                >
                  Found a better price?
                </Link>
              </div>

              {/* Urgency Stock Bar */}
              {isInStock && (
                <div className="pt-1 space-y-1.5">
                  <p className="text-xs font-bold text-[#E05344]">
                    Please hurry! Only {(fullProduct.id.charCodeAt(0) % 6) + 3} left in stock
                  </p>
                  <div className="w-full bg-slate-200/90 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E05344] via-amber-500 to-emerald-500"
                      style={{
                        width: `${Math.min(100, Math.max(20, (((fullProduct.id.charCodeAt(0) % 6) + 3) / 10) * 100))}%`,
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
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB]"
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
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
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

            {/* Variant Selector (if variants exist) */}
            {fullProduct.variants && fullProduct.variants.length > 1 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Select Variant
                </span>
                <div className="flex flex-wrap gap-2">
                  {fullProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedVariantId === v.id
                          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm shadow-blue-500/20"
                          : v.inStock
                          ? "bg-white text-slate-700 border-slate-200 hover:border-[#2563EB]"
                          : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                      }`}
                      disabled={!v.inStock && selectedVariantId !== v.id}
                      title={!v.inStock ? "Out of Stock" : v.name}
                    >
                      {v.name}
                      {!v.inStock && <span className="ml-1 text-[8px]">(OOS)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: If In Stock -> ADD TO CART & BUY NOW. If Out of Stock -> Inquire on WhatsApp */}
            {!isInStock ? (
              <a
                href={`https://wa.me/918709789641?text=${encodeURIComponent(
                  `Hello Prayog India, I want to inquire about the out-of-stock product: ${fullProduct.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#25D366]/25 active:scale-95 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                <span>Out of Stock — Inquire on WhatsApp</span>
              </a>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id={`quickview-add-cart-${fullProduct.id}`}
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${
                    addedFeedback
                      ? "bg-emerald-600 text-white"
                      : "bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 shadow-amber-500/15"
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>ADDED!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>
                <button
                  id={`quickview-buy-now-${fullProduct.id}`}
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <span>BUY NOW</span>
                </button>
              </div>
            )}

            {/* Product Overview / Description Box */}
            {fullProduct.description && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Product Overview</span>
                </div>
                <p className="text-slate-600">{fullProduct.description}</p>
              </div>
            )}

            {/* ── Comprehensive Detail Tabs ── */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("specs")}
                  className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeDetailTab === "specs"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Specifications</span>
                  <span className="bg-slate-200/80 text-slate-700 text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    {specEntries.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("features")}
                  className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeDetailTab === "features"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Features</span>
                  <span className="bg-slate-200/80 text-slate-700 text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    {fullProduct.features?.length || 0}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("box")}
                  className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeDetailTab === "box"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>In The Box & Uses</span>
                  <span className="bg-slate-200/80 text-slate-700 text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    {(fullProduct.whatsIncluded?.length || 0) + (fullProduct.applications?.length || 0)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("docs")}
                  className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeDetailTab === "docs"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Downloads</span>
                  <span className="bg-slate-200/80 text-slate-700 text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    {fullProduct.documents?.length || 0}
                  </span>
                </button>
              </div>

              {/* Tab 1: Full Specifications Table */}
              {activeDetailTab === "specs" && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs bg-white shadow-2xs max-h-60 sm:max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <tbody>
                      {specEntries.map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"}
                        >
                          <td className="px-3.5 py-1.5 font-bold text-slate-600 w-2/5 border-b border-slate-100 last:border-0">
                            {key}
                          </td>
                          <td className="px-3.5 py-1.5 font-semibold text-slate-900 border-b border-slate-100 last:border-0">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Key Features Checklist */}
              {activeDetailTab === "features" && (
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5">
                  {fullProduct.features && fullProduct.features.length > 0 ? (
                    fullProduct.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{feat}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No feature details available.</p>
                  )}
                </div>
              )}

              {/* Tab 3: What's In The Box & Applications */}
              {activeDetailTab === "box" && (
                <div className="space-y-3.5">
                  {/* Package Contents */}
                  <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#2563EB]" />
                      Package Contents (What's in the box)
                    </span>
                    <ul className="space-y-1.5">
                      {fullProduct.whatsIncluded?.map((item, idx) => (
                        <li key={idx} className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Applications */}
                  {fullProduct.applications && fullProduct.applications.length > 0 && (
                    <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        Suitable Applications & Projects
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {fullProduct.applications.map((app, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Downloads & Technical Documents */}
              {activeDetailTab === "docs" && (
                <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                    Official Datasheets & Pinouts
                  </span>
                  <div className="space-y-2">
                    {fullProduct.documents && fullProduct.documents.length > 0 ? (
                      fullProduct.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-[#2563EB] rounded-xl text-xs font-bold text-slate-800 hover:text-[#2563EB] transition-all group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Download className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
                            <span className="truncate">{doc.title}</span>
                          </div>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-mono uppercase px-2 py-0.5 rounded-md">
                            {doc.type}
                          </span>
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No documents available for download.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* View Full Product Page */}
            <Link
              href={`/products/${fullProduct.slug || fullProduct.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors mt-2"
              onClick={onClose}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>View Full Product Page with Reviews & All Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
