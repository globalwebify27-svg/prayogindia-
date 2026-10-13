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
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { ProductCard } from "@/components/products/ProductCard";


type ViewMode = "all_categories" | "curated";
type CuratedTab = "trending" | "new_arrivals" | "best_sellers" | "recommended";

interface CategoryConfig {
  name: string;
  slug: string;
  accent: string;
  badgeBg: string;
  description: string;
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  "Arduino & Microcontrollers": {
    name: "Arduino & Microcontrollers",
    slug: "arduino-development-boards",
    accent: "text-amber-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Official UNO R4 WiFi, Mega 2560, Nano Type-C, ESP32 & dev boards for rapid prototyping.",
  },
  "Drones & UAV Parts": {
    name: "Drones & UAV Parts",
    slug: "drone-technology",
    accent: "text-sky-600",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    description:
      "Pixhawk 6C autopilots, BLDC motors, 50A ESC stacks, FPV cameras, props & frames.",
  },
  "Robotics & DIY Kits": {
    name: "Robotics & DIY Kits",
    slug: "robotics",
    accent: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    description:
      "6-DOF manipulator arms, Mecanum rovers, ROS 2 SLAM platforms & metal gear servos.",
  },
  "IoT & Wireless Modules": {
    name: "IoT & Wireless Modules",
    slug: "iot",
    accent: "text-teal-600",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    description:
      "Ra-02 LoRa 433MHz, Bluetooth HC-05, ESP32-CAM, 8-channel relays & Zigbee mesh.",
  },
  "Sensors & Electronic Modules": {
    name: "Sensors & Electronic Modules",
    slug: "sensors-modules",
    accent: "text-rose-600",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    description:
      "Precision LiDAR, ToF lasers, 6-DOF IMU gyros, barometric weather & gas detectors.",
  },
  "Single Board Computers & Dev Boards": {
    name: "Single Board Computers & Dev Boards",
    slug: "arduino-development-boards",
    accent: "text-purple-600",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    description:
      "Raspberry Pi 5 8GB, NVIDIA Jetson Orin Nano, STM32 Nucleo, Orange Pi & Teensy.",
  },
  "STEM & Educational Kits": {
    name: "STEM & Educational Kits",
    slug: "stem-kits",
    accent: "text-emerald-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Atal Tinkering Lab (ATL) starter packs, DIY solar rovers, snap circuits & smart city models.",
  },
  "Motors, Steppers & Drivers": {
    name: "Motors, Steppers & Drivers",
    slug: "electronic-components",
    accent: "text-orange-600",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    description:
      "NEMA 17 high torque steppers, TB6600 drivers, RS-775 motors, planetary gearboxes & shields.",
  },
};

export const isProductInShelfCategory = (
  product: Product,
  shelfCategory: string,
): boolean => {
  const pCat = (product.category || "").toLowerCase().trim();
  const sCat = (shelfCategory || "").toLowerCase().trim();
  const name = (product.name || "").toLowerCase();
  const sku = (product.sku || "").toUpperCase();

  if (pCat === sCat || pCat.includes(sCat) || sCat.includes(pCat)) return true;

  if (sCat.includes("stem")) {
    return (
      pCat.includes("stem") ||
      pCat.includes("educational") ||
      pCat.includes("tinkering") ||
      pCat.includes("science") ||
      sku.includes("STM") ||
      name.includes("stem") ||
      name.includes("atl") ||
      name.includes("science kit")
    );
  }
  if (sCat.includes("motor")) {
    return (
      pCat.includes("motor") ||
      pCat.includes("stepper") ||
      pCat.includes("driver") ||
      name.includes("motor") ||
      name.includes("stepper") ||
      name.includes("driver") ||
      name.includes("nema") ||
      name.includes("servo") ||
      sku.includes("MOT")
    );
  }
  if (sCat.includes("single board") || sCat.includes("dev board")) {
    return (
      pCat.includes("single board") ||
      pCat.includes("dev board") ||
      pCat.includes("development board") ||
      pCat.includes("raspberry pi") ||
      pCat.includes("sbc") ||
      pCat.includes("jetson") ||
      sku.includes("SBC") ||
      name.includes("raspberry pi") ||
      name.includes("jetson")
    );
  }
  if (sCat.includes("arduino")) {
    return (
      pCat.includes("arduino") ||
      pCat.includes("microcontroller") ||
      sku.includes("ARD") ||
      name.includes("arduino") ||
      name.includes("atmega")
    );
  }
  if (sCat.includes("drone") || sCat.includes("uav")) {
    return (
      pCat.includes("drone") ||
      pCat.includes("uav") ||
      pCat.includes("flight controller") ||
      pCat.includes("quadcopter") ||
      sku.includes("DRN") ||
      name.includes("pixhawk") ||
      name.includes("propeller")
    );
  }
  if (sCat.includes("robotics") || sCat.includes("robot")) {
    return (
      ((pCat.includes("robot") || pCat.includes("diy kit")) &&
        !pCat.includes("stem")) ||
      sku.includes("ROB") ||
      sku.includes("KIT")
    );
  }
  if (sCat.includes("iot") || sCat.includes("wireless")) {
    return (
      pCat.includes("iot") ||
      pCat.includes("wireless") ||
      pCat.includes("lora") ||
      pCat.includes("bluetooth") ||
      pCat.includes("gsm") ||
      sku.includes("IOT") ||
      name.includes("esp32") ||
      name.includes("lora")
    );
  }
  if (sCat.includes("sensor")) {
    return (
      pCat.includes("sensor") ||
      pCat.includes("electronic module") ||
      sku.includes("SEN") ||
      name.includes("sensor") ||
      name.includes("lidar")
    );
  }

  return false;
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
              ? item.images.map((im: any) =>
                  typeof im === "string" ? im : im.imageUrl,
                )
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
              inStock: item.inStock ?? item.stock > 0,
              image: primaryImg,
              images: allImages,
              badge: item.badge,
              description: item.description || "",
              features: item.features || [],
              specs: (item.specifications as Record<string, string>) || {},
            };
          });

          const existingIds = new Set(PRODUCTS.map((p) => p.id));
          const existingSlugs = new Set(
            PRODUCTS.map((p) => p.slug).filter(Boolean),
          );
          const newDbOnly = apiProducts.filter(
            (p) =>
              !existingIds.has(p.id) &&
              (!p.slug || !existingSlugs.has(p.slug)),
          );
          const updatedMock = PRODUCTS.map((p) => {
            const match = apiProducts.find(
              (ap) =>
                ap.id === p.id ||
                (ap.slug && p.slug && ap.slug === p.slug),
            );
            return match || p;
          });

          const combined = [...newDbOnly, ...updatedMock];
          const seenIds = new Set<string>();
          const uniqueProducts = combined.filter((p) => {
            if (!p.id || seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
          });

          setLiveProducts(uniqueProducts);
        }
      })
      .catch((err) => {
        console.warn(
          "ProductGridSection: Failed to fetch products from API",
          err,
        );
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

  return (
    <section
      id="featured-products"
      className="py-5 sm:py-10 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        {/* Main Section Header */}
        <div className="space-y-2.5 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
                Explore Products
              </h2>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                Quality robotics, development boards, and electronic components.
              </p>
            </div>

            {/* View Mode Switcher + Explore Store */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="bg-white border border-slate-200 p-0.5 sm:p-1 rounded-xl flex items-center shadow-2xs text-[11px] sm:text-xs font-semibold">
                <button
                  onClick={() => setViewMode("all_categories")}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all flex items-center cursor-pointer ${
                    viewMode === "all_categories"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>All Categories</span>
                </button>

                <button
                  onClick={() => setViewMode("curated")}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all flex items-center cursor-pointer ${
                    viewMode === "curated"
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Highlights</span>
                </button>
              </div>

              <button
                onClick={() => onSeeAll?.("all")}
                className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 py-1 cursor-pointer shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Quick Jump Category Bar (Desktop only to keep mobile laser-focused on products) */}
          <div
            className="hidden sm:flex bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-1.5 sm:p-2 shadow-2xs relative items-center overflow-hidden"
            onMouseEnter={() => setIsJumpPaused(true)}
            onMouseLeave={() => setIsJumpPaused(false)}
            onTouchStart={() => setIsJumpPaused(true)}
            onTouchEnd={() => setIsJumpPaused(false)}
          >

            {/* Pinned "Jump To:" label badge */}
            <div className="pl-2.5 pr-2.5 sm:pr-3 shrink-0 flex items-center border-r border-slate-200 text-xs font-bold text-slate-500 z-20 bg-white/90">
              <span className="whitespace-nowrap">Jump To:</span>
            </div>

            {/* Left and Right Fade Mask Gradients */}
            <div className="pointer-events-none absolute left-[80px] sm:left-[90px] top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

            {/* Auto-scrolling Track */}
            <div
              ref={jumpScrollRef}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 pl-2.5 pr-8 text-xs select-none"
            >
              {[...categoryOrder, ...categoryOrder].map((catName, idx) => (
                <button
                  key={`${catName}-${idx}`}
                  onClick={() => scrollToCategoryShelf(catName)}
                  className="shrink-0 bg-slate-50 hover:bg-[#EFF6FF] text-slate-700 hover:text-[#2563EB] border border-slate-200/80 hover:border-[#2563EB]/40 px-3 py-1.5 rounded-lg font-medium flex items-center transition-all cursor-pointer shadow-2xs group text-xs"
                >
                  <span className="whitespace-nowrap">{catName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* VIEW 1: All Category Shelves */}
        {/* ==================================================== */}
        {viewMode === "all_categories" ? (
          <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-300">
            {categoryOrder.map((category) => {
              let categoryProducts = liveProducts.filter((p) =>
                isProductInShelfCategory(p, category),
              );

              // Fallback safeguard to ensure category is never rendered empty if mock products exist
              if (categoryProducts.length === 0) {
                categoryProducts = PRODUCTS.filter((p) =>
                  isProductInShelfCategory(p, category),
                );
              }

              const elementId = `shelf-${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

              return (
                <div
                  key={category}
                  id={elementId}
                  className="space-y-3 sm:space-y-4 relative group/section scroll-mt-24"
                >
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <h3 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                        {category}
                      </h3>
                    </div>

                    {/* See All Category Link */}
                    <button
                      onClick={() => onSeeAll?.(category)}
                      className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors flex items-center gap-1 group/seeall cursor-pointer shrink-0"
                    >
                      <span>View all</span>
                      <ChevronRight className="w-4 h-4 group-hover/seeall:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Horizontal Scrollable Slider Container */}
                  <div className="relative">
                    {/* Left Scroll Button */}
                    <button
                      onClick={() => scrollCategory(category, "left")}
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all opacity-0 group-hover/section:opacity-100 hidden sm:flex cursor-pointer"
                      aria-label={`Scroll ${category} Left`}
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Right Scroll Button */}
                    <button
                      onClick={() => scrollCategory(category, "right")}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all opacity-0 group-hover/section:opacity-100 hidden sm:flex cursor-pointer"
                      aria-label={`Scroll ${category} Right`}
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Scroll Track */}
                    <div
                      ref={(el) => {
                        categoryScrollContainers.current[category] = el;
                      }}
                      className="flex items-stretch gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 pt-1 px-0.5 scroll-smooth touch-pan-x"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="w-[170px] xs:w-[190px] sm:w-[220px] md:w-[240px] shrink-0 snap-start"
                        >
                          <ProductCard
                            product={product}
                            onAddToCart={onAddToCart}
                            onToggleWishlist={onToggleWishlist}
                            onQuickView={onQuickView}
                            isWishlisted={wishlistIds.includes(product.id)}
                          />
                        </div>
                      ))}
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
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "trending"
                    ? "bg-gradient-to-r from-[#FF3B30] to-rose-600 text-white shadow-md shadow-red-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>Trending Products</span>
              </button>

              <button
                onClick={() => setActiveCuratedTab("new_arrivals")}
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "new_arrivals"
                    ? "bg-gradient-to-r from-[#2563EB] to-blue-700 text-white shadow-md shadow-blue-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>New Arrivals</span>
              </button>

              <button
                onClick={() => setActiveCuratedTab("best_sellers")}
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "best_sellers"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>Best Sellers</span>
              </button>

              <button
                onClick={() => setActiveCuratedTab("recommended")}
                className={`px-4 py-2.5 rounded-2xl font-extrabold flex items-center transition-all whitespace-nowrap cursor-pointer ${
                  activeCuratedTab === "recommended"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>Recommended Hardware</span>
              </button>
            </div>

            {/* Curated Track Carousel */}
            <div className="relative group/curated">
              <button
                onClick={() => scrollCurated("left")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all opacity-0 group-hover/curated:opacity-100 hidden sm:flex cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                onClick={() => scrollCurated("right")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all opacity-0 group-hover/curated:opacity-100 hidden sm:flex cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div
                ref={curatedScrollRef}
                className="flex items-stretch gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 pt-1 px-0.5 scroll-smooth touch-pan-x"
                style={{ scrollbarWidth: "none" }}
              >
                {getActiveCuratedList().map((product) => (
                  <div
                    key={product.id}
                    className="w-[170px] xs:w-[190px] sm:w-[220px] md:w-[240px] shrink-0 snap-start"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onToggleWishlist={onToggleWishlist}
                      onQuickView={onQuickView}
                      isWishlisted={wishlistIds.includes(product.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
