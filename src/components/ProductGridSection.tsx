"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Heart,
  Flame,
  Sparkles,
  Trophy,
  Target,
  Layers,
  ArrowRight,
  Cpu,
  Plane,
  Bot,
  Wifi,
  Activity,
  CircuitBoard,
  GraduationCap,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  PackageCheck,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";

type ViewMode = "all_categories" | "curated";
type CuratedTab = "trending" | "new_arrivals" | "best_sellers" | "recommended";

interface CategoryConfig {
  name: string;
  slug: string;
  Icon: React.ElementType;
  accent: string;
  badgeBg: string;
  description: string;
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  "Arduino & Microcontrollers": {
    name: "Arduino & Microcontrollers",
    slug: "arduino-development-boards",
    Icon: Cpu,
    accent: "text-amber-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Official UNO R4 WiFi, Mega 2560, Nano Type-C, ESP32 & dev boards for rapid prototyping.",
  },
  "Drones & UAV Parts": {
    name: "Drones & UAV Parts",
    slug: "drone-technology",
    Icon: Plane,
    accent: "text-sky-600",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    description:
      "Pixhawk 6C autopilots, BLDC motors, 50A ESC stacks, FPV cameras, props & frames.",
  },
  "Robotics & DIY Kits": {
    name: "Robotics & DIY Kits",
    slug: "robotics",
    Icon: Bot,
    accent: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    description:
      "6-DOF manipulator arms, Mecanum rovers, ROS 2 SLAM platforms & metal gear servos.",
  },
  "IoT & Wireless Modules": {
    name: "IoT & Wireless Modules",
    slug: "iot",
    Icon: Wifi,
    accent: "text-teal-600",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    description:
      "Ra-02 LoRa 433MHz, Bluetooth HC-05, ESP32-CAM, 8-channel relays & Zigbee mesh.",
  },
  "Sensors & Electronic Modules": {
    name: "Sensors & Electronic Modules",
    slug: "sensors-modules",
    Icon: Activity,
    accent: "text-rose-600",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    description:
      "Precision LiDAR, ToF lasers, 6-DOF IMU gyros, barometric weather & gas detectors.",
  },
  "Single Board Computers & Dev Boards": {
    name: "Single Board Computers & Dev Boards",
    slug: "arduino-development-boards",
    Icon: CircuitBoard,
    accent: "text-purple-600",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    description:
      "Raspberry Pi 5 8GB, NVIDIA Jetson Orin Nano, STM32 Nucleo, Orange Pi & Teensy.",
  },
  "STEM & Educational Kits": {
    name: "STEM & Educational Kits",
    slug: "stem-kits",
    Icon: GraduationCap,
    accent: "text-emerald-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Atal Tinkering Lab (ATL) starter packs, DIY solar rovers, snap circuits & smart city models.",
  },
  "Motors, Steppers & Drivers": {
    name: "Motors, Steppers & Drivers",
    slug: "electronic-components",
    Icon: Zap,
    accent: "text-orange-600",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    description:
      "NEMA 17 high torque steppers, TB6600 drivers, RS-775 motors, planetary gearboxes & shields.",
  },
};

interface ProductSectionProps {
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlistIds?: string[];
  onSeeAll?: (category: string) => void;
}

export const ProductGridSection: React.FC<ProductSectionProps> = ({
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistIds = [],
  onSeeAll,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("all_categories");
  const [activeCuratedTab, setActiveCuratedTab] =
    useState<CuratedTab>("trending");
  const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiProducts: Product[] = json.data.map((item: any) => {
            const primaryImg =
              item.images?.[0]?.imageUrl ||
              (Array.isArray(item.images) && typeof item.images[0] === "string"
                ? item.images[0]
                : "/placeholder-product.png");
            const allImages = Array.isArray(item.images)
              ? item.images.map((im: any) => (typeof im === "string" ? im : im.imageUrl))
              : [primaryImg];

            return {
              id: item.id,
              slug: item.slug || item.id,
              name: item.name,
              sku: item.sku || `SKU-${item.id.slice(0, 6)}`,
              brand: item.brand || "Prayog India",
              category: item.category?.name || "Robotics & Components",
              price: item.price,
              mrp: item.mrp || item.price * 1.2,
              discount:
                item.mrp && item.mrp > item.price
                  ? `${Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF`
                  : "",
              rating: item.rating ?? 4.8,
              reviews: item.reviewCount ?? 12,
              inStock: item.inStock ?? (item.stock > 0),
              image: primaryImg,
              images: allImages,
              badge: item.badge,
              description: item.description || "",
              features: item.features || [],
              specs: (item.specifications as Record<string, string>) || {},
            };
          });

          const existingIds = new Set(PRODUCTS.map((p) => p.id));
          const newDbOnly = apiProducts.filter((p) => !existingIds.has(p.id));
          const updatedMock = PRODUCTS.map((p) => {
            const match = apiProducts.find((ap) => ap.id === p.id || ap.slug === p.slug);
            return match || p;
          });

          setLiveProducts([...newDbOnly, ...updatedMock]);
        }
      })
      .catch((err) => {
        console.warn("ProductGridSection: Failed to fetch products from API", err);
      });
  }, []);

  // Curated Lists Logic
  const trendingProducts = liveProducts.filter(
    (p) => p.badge?.includes("HOT") || p.reviews > 300 || p.price > 4000,
  );
  const newArrivals = liveProducts.filter(
    (p) =>
      p.badge?.includes("NEW") ||
      p.id.includes("rpi-5") ||
      p.id.includes("jetson") ||
      p.id.includes("r4") ||
      // database products added recently
      liveProducts.slice(0, 5).some((lp) => lp.id === p.id),
  );
  const bestSellers = liveProducts.filter(
    (p) =>
      p.badge?.includes("BESTSELLER") || p.rating >= 4.9 || p.reviews > 400,
  );
  const recommendedHardware = liveProducts.filter(
    (p) =>
      p.badge?.includes("TOP RATED") ||
      p.category.includes("Sensors") ||
      p.category.includes("Robotics"),
  );

  // Distinct Ordered Categories
  const categoryOrder = [
    "Arduino & Microcontrollers",
    "Drones & UAV Parts",
    "Robotics & DIY Kits",
    "IoT & Wireless Modules",
    "Sensors & Electronic Modules",
    "Single Board Computers & Dev Boards",
    "STEM & Educational Kits",
    "Motors, Steppers & Drivers",
  ];

  // Scroll containers
  const curatedScrollRef = useRef<HTMLDivElement | null>(null);
  const categoryScrollContainers = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const jumpScrollRef = useRef<HTMLDivElement | null>(null);
  const [isJumpPaused, setIsJumpPaused] = useState(false);

  // Smooth continuous auto-scroll for Jump To category bar
  useEffect(() => {
    let animationId: number;
    let lastTime: number | null = null;
    const speed = 35; // Pixels per second for a smooth, gentle drift

    const step = (time: number) => {
      if (lastTime !== null && jumpScrollRef.current && !isJumpPaused) {
        const delta = (time - lastTime) / 1000;
        const container = jumpScrollRef.current;
        const halfWidth = container.scrollWidth / 2;

        container.scrollLeft += speed * delta;

        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      lastTime = time;
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isJumpPaused]);

  const scrollCurated = (direction: "left" | "right") => {
    if (curatedScrollRef.current) {
      const scrollAmount = direction === "left" ? -360 : 360;
      curatedScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollCategory = (category: string, direction: "left" | "right") => {
    const container = categoryScrollContainers.current[category];
    if (container) {
      const scrollAmount = direction === "left" ? -360 : 360;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollToCategoryShelf = (catName: string) => {
    setViewMode("all_categories");
    const elementId = `shelf-${catName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getActiveCuratedList = () => {
    switch (activeCuratedTab) {
      case "trending":
        return trendingProducts.length > 0
          ? trendingProducts
          : PRODUCTS.slice(0, 10);
      case "new_arrivals":
        return newArrivals.length > 0 ? newArrivals : PRODUCTS.slice(2, 12);
      case "best_sellers":
        return bestSellers.length > 0 ? bestSellers : PRODUCTS.slice(0, 10);
      case "recommended":
        return recommendedHardware.length > 0
          ? recommendedHardware
          : PRODUCTS.slice(4, 14);
      default:
        return PRODUCTS.slice(0, 10);
    }
  };

  // Reusable Product Card Component
  const renderProductCard = (product: Product) => {
    const isWishlisted = wishlistIds.includes(product.id);

    return (
      <div
        key={product.id}
        id={`product-${product.id}`}
        className="w-60 sm:w-72 shrink-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between hover:border-[#00AEEF]/50 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 relative group"
      >
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between z-10 mb-2 gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {product.badge && (
              <span className="bg-[#00AEEF] text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wide shadow-2xs whitespace-nowrap shrink-0">
                {product.badge}
              </span>
            )}
            {product.discount && (
              <span className="bg-[#FF3B30] text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wide shadow-2xs whitespace-nowrap shrink-0">
                {product.discount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isWishlisted
                    ? "text-[#FF3B30] bg-red-50"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Add to Wishlist"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            )}
            <button
              onClick={() => onQuickView(product)}
              className="text-slate-400 hover:text-[#00AEEF] hover:bg-sky-50 p-1.5 rounded-full transition-colors cursor-pointer"
              title="Quick Spec View"
              aria-label="Quick Spec View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Image Link */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="block"
        >
          <div className="relative h-44 sm:h-48 w-full mb-3 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50/60 p-3 border border-slate-100/60 group-hover:bg-white transition-colors cursor-pointer">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 256px, 288px"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
              <span className="font-mono tracking-tight">{product.sku}</span>
              <div className="flex items-center text-amber-500 font-extrabold gap-0.5">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">
                  ({product.reviews})
                </span>
              </div>
            </div>

            <Link
              href={`/products/${product.slug || product.id}`}
              className="block"
            >
              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-[#00AEEF] transition-colors cursor-pointer">
                {product.name}
              </h4>
            </Link>

            {product.description && (
              <Link
                href={`/products/${product.slug || product.id}`}
                className="block"
              >
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium hover:text-slate-700">
                  {product.description}
                </p>
              </Link>
            )}
          </div>

          {/* Pricing & Stock Line */}
          <div className="pt-2 border-t border-slate-100 space-y-2 mt-auto">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-base font-black text-slate-900">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 line-through ml-1.5">
                  ₹{product.mrp.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save ₹{(product.mrp - product.price).toLocaleString()}
              </span>
            </div>

            {/* Actions: Add to Cart / Buy Now or WhatsApp */}
            {product.inStock ? (
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  onClick={() => onAddToCart(product)}
                  className="border border-[#00AEEF] text-[#00AEEF] hover:bg-[#E0F7FC] py-2 rounded-xl text-[11px] font-black transition-all duration-150 active:scale-95 text-center cursor-pointer shadow-2xs"
                >
                  ADD TO CART
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2 rounded-xl text-[11px] font-black transition-all duration-150 active:scale-95 shadow-xs text-center cursor-pointer"
                >
                  BUY NOW
                </button>
              </div>
            ) : (
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Prayog India, I am interested in ${product.name} (SKU: ${product.sku}). Please let me know the availability and latest price.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all text-center cursor-pointer shadow-xs"
              >
                <span>Ask Availability</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="featured-products"
      className="py-12 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Section Header */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#00AEEF] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  OFFICIAL HARDWARE CATALOGUE
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Components
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                Explore Every Category Shelf
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 max-w-2xl">
                Browse certified developer components, flight kits, sensors, and
                robotics modules per category with pan-India express dispatch.
              </p>
            </div>

            {/* View Mode Switcher + Explore Store */}
            <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
              <div className="bg-white border border-slate-200 p-1 rounded-2xl flex items-center shadow-2xs text-xs font-extrabold">
                <button
                  onClick={() => setViewMode("all_categories")}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "all_categories"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Category Shelves</span>
                </button>

                <button
                  onClick={() => setViewMode("curated")}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "curated"
                      ? "bg-[#00AEEF] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Highlights</span>
                </button>
              </div>

              <button
                onClick={() => onSeeAll?.("all")}
                className="text-xs sm:text-sm font-extrabold text-[#00AEEF] hover:text-[#0086B8] hover:underline flex items-center gap-1 group/seeall px-3 py-2 cursor-pointer"
              >
                <span>Full Catalogue</span>
                <ArrowRight className="w-4 h-4 group-hover/seeall:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Jump Category Bar with smooth continuous auto-scroll */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-2 shadow-2xs relative flex items-center overflow-hidden"
            onMouseEnter={() => setIsJumpPaused(true)}
            onMouseLeave={() => setIsJumpPaused(false)}
            onTouchStart={() => setIsJumpPaused(true)}
            onTouchEnd={() => setIsJumpPaused(false)}
          >
            {/* Pinned "Jump To:" label badge */}
            <div className="pl-2 pr-3 shrink-0 flex items-center gap-1.5 border-r border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500 z-20 bg-white/90">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00AEEF]" />
              <span className="whitespace-nowrap">Jump To:</span>
            </div>

            {/* Left and Right Fade Mask Gradients */}
            <div className="pointer-events-none absolute left-[90px] sm:left-[100px] top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

            {/* Auto-scrolling Track */}
            <div
              ref={jumpScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 pl-3 pr-8 text-xs select-none"
            >
              {[...categoryOrder, ...categoryOrder].map((catName, idx) => {
                const config = CATEGORY_CONFIGS[catName];
                const IconComponent = config ? config.Icon : PackageCheck;

                return (
                  <button
                    key={`${catName}-${idx}`}
                    onClick={() => scrollToCategoryShelf(catName)}
                    className="shrink-0 bg-slate-50 hover:bg-[#E0F7FC] text-slate-700 hover:text-[#00AEEF] border border-slate-200/80 hover:border-[#00AEEF]/40 px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00AEEF]" />
                    <span className="whitespace-nowrap">{catName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* VIEW 1: All Category Shelves */}
        {/* ==================================================== */}
        {viewMode === "all_categories" ? (
          <div className="space-y-16 animate-in fade-in duration-300">
            {categoryOrder.map((category) => {
              const categoryProducts = liveProducts.filter(
                (p) => p.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(p.category.toLowerCase()),
              );
              const config = CATEGORY_CONFIGS[category];
              const IconComp = config?.Icon || PackageCheck;
              const elementId = `shelf-${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

              return (
                <div
                  key={category}
                  id={elementId}
                  className="space-y-4 relative group/section scroll-mt-24"
                >
                  {/* Category Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#00AEEF]/10 text-[#00AEEF] flex items-center justify-center border border-[#00AEEF]/20">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {category}
                        </h3>
                      </div>
                      {config?.description && (
                        <p className="text-xs text-slate-500 font-medium pl-10">
                          {config.description}
                        </p>
                      )}
                    </div>

                    {/* See All Category Link */}
                    <button
                      onClick={() => onSeeAll?.(category)}
                      className="text-xs sm:text-sm font-black text-[#00AEEF] hover:text-[#0086B8] hover:underline transition-colors flex items-center gap-1 group/seeall cursor-pointer self-start sm:self-auto shrink-0 pl-10 sm:pl-0"
                    >
                      <span>Explore all items</span>
                      <ChevronRight className="w-4 h-4 group-hover/seeall:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Horizontal Scrollable Slider Container */}
                  <div className="relative">
                    {/* Left Scroll Button */}
                    <button
                      onClick={() => scrollCategory(category, "left")}
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#00AEEF] hover:text-white hover:border-[#00AEEF] transition-all opacity-0 group-hover/section:opacity-100 hidden sm:flex cursor-pointer"
                      aria-label={`Scroll ${category} Left`}
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Right Scroll Button */}
                    <button
                      onClick={() => scrollCategory(category, "right")}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#00AEEF] hover:text-white hover:border-[#00AEEF] transition-all opacity-0 group-hover/section:opacity-100 hidden sm:flex cursor-pointer"
                      aria-label={`Scroll ${category} Right`}
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Scroll Track */}
                    <div
                      ref={(el) => {
                        categoryScrollContainers.current[category] = el;
                      }}
                      className="flex items-stretch gap-4 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 px-1 scroll-smooth"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {categoryProducts.map((product) =>
                        renderProductCard(product),
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ==================================================== */
          /* VIEW 2: Curated Highlights (Trending / New / Bestsellers) */
          /* ==================================================== */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Curated Sub-tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setActiveCuratedTab("trending")}
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "trending"
                    ? "bg-gradient-to-r from-[#FF3B30] to-rose-600 text-white shadow-md shadow-red-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Flame
                  className={`w-4 h-4 ${activeCuratedTab === "trending" ? "text-amber-300" : "text-[#FF3B30]"}`}
                />
                <span>Trending Products</span>
              </button>

              <button
                onClick={() => setActiveCuratedTab("new_arrivals")}
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "new_arrivals"
                    ? "bg-gradient-to-r from-[#00AEEF] to-cyan-600 text-white shadow-md shadow-[#00AEEF]/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 ${activeCuratedTab === "new_arrivals" ? "text-amber-300" : "text-[#00AEEF]"}`}
                />
                <span>New Arrivals</span>
              </button>

              <button
                onClick={() => setActiveCuratedTab("best_sellers")}
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "best_sellers"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Trophy
                  className={`w-4 h-4 ${activeCuratedTab === "best_sellers" ? "text-amber-200" : "text-amber-500"}`}
                />
                <span>Best Sellers</span>
              </button>

              <button
                onClick={() => setActiveCuratedTab("recommended")}
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "recommended"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Target
                  className={`w-4 h-4 ${activeCuratedTab === "recommended" ? "text-emerald-200" : "text-emerald-600"}`}
                />
                <span>Recommended Hardware</span>
              </button>
            </div>

            {/* Curated Track Carousel */}
            <div className="relative group/curated">
              <button
                onClick={() => scrollCurated("left")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#00AEEF] hover:text-white hover:border-[#00AEEF] transition-all opacity-0 group-hover/curated:opacity-100 hidden sm:flex cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                onClick={() => scrollCurated("right")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#00AEEF] hover:text-white hover:border-[#00AEEF] transition-all opacity-0 group-hover/curated:opacity-100 hidden sm:flex cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div
                ref={curatedScrollRef}
                className="flex items-stretch gap-4 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 px-1 scroll-smooth"
                style={{ scrollbarWidth: "none" }}
              >
                {getActiveCuratedList().map((product) =>
                  renderProductCard(product),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
