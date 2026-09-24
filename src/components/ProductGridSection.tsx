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
  ShoppingBag,
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
          const newDbOnly = apiProducts.filter((p) => !existingIds.has(p.id));
          const updatedMock = PRODUCTS.map((p) => {
            const match = apiProducts.find(
              (ap) => ap.id === p.id || ap.slug === p.slug,
            );
            return match || p;
          });

          setLiveProducts([...newDbOnly, ...updatedMock]);
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

  // Reusable Product Card Component
  const renderProductCard = (product: Product) => {
    const isWishlisted = wishlistIds.includes(product.id);

    return (
      <div
        key={product.id}
        id={`product-${product.id}`}
        className="w-[195px] sm:w-[250px] md:w-64 shrink-0 snap-start bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-4 flex flex-col justify-between hover:border-[#00AEEF] hover:shadow-lg transition-all duration-300 relative group"
      >
        {/* Top: Category Name & Circular Wishlist Button */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">
            {product.category || "Arduino & Microcontrollers"}
          </span>
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              className="w-7 h-7 rounded-full border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer shadow-2xs"
              title="Add to Wishlist"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Product Image */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="block"
        >
          <div className="relative h-28 sm:h-36 w-full mb-2 flex items-center justify-center overflow-hidden rounded-xl bg-white p-1 group-hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 210px, 256px"
              className="object-contain p-1"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between space-y-1.5">
          <div>
            {/* Title */}
            <Link
              href={`/products/${product.slug || product.id}`}
              className="block"
            >
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 hover:text-[#00AEEF] transition-colors cursor-pointer">
                {product.name}
              </h4>
            </Link>

            {/* SKU */}
            <div className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
              SKU:{" "}
              <span className="font-mono text-slate-500">{product.sku}</span>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
              <div className="flex items-center text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium ml-0.5">
                ({product.reviews || 87})
              </span>
            </div>

            {/* Price with (Incl. GST) */}
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                ₹
                {product.price.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                (Incl. GST)
              </span>
            </div>
          </div>

          {/* Action: Add to Cart Full Width */}
          <div className="pt-2 mt-auto">
            {product.inStock ? (
              <button
                onClick={() => onAddToCart(product)}
                className="w-full border border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-2xs group/btn"
              >
                <span>Add to Cart</span>
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Prayog India, I am interested in ${product.name} (SKU: ${product.sku}). Please let me know the availability and latest price.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-2xs"
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
      className="py-6 sm:py-10 lg:py-12 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
        {/* Main Section Header */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Explore Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 sm:mt-1">
                Quality robotics, development boards, and electronic components.
              </p>
            </div>

            {/* View Mode Switcher + Explore Store */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center shadow-2xs text-xs font-semibold">
                <button
                  onClick={() => setViewMode("all_categories")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "all_categories"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                </button>

                <button
                  onClick={() => setViewMode("curated")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "curated"
                      ? "bg-[#00AEEF] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Highlights</span>
                </button>
              </div>

              <button
                onClick={() => onSeeAll?.("all")}
                className="text-xs sm:text-sm font-semibold text-[#00AEEF] hover:text-[#0086B8] hover:underline flex items-center gap-1 group/seeall px-2 sm:px-3 py-1.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover/seeall:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Jump Category Bar with smooth continuous auto-scroll */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-1.5 sm:p-2 shadow-2xs relative flex items-center overflow-hidden"
            onMouseEnter={() => setIsJumpPaused(true)}
            onMouseLeave={() => setIsJumpPaused(false)}
            onTouchStart={() => setIsJumpPaused(true)}
            onTouchEnd={() => setIsJumpPaused(false)}
          >
            {/* Pinned "Jump To:" label badge */}
            <div className="pl-2 pr-2.5 sm:pr-3 shrink-0 flex items-center gap-1.5 border-r border-slate-200 text-xs font-semibold text-slate-500 z-20 bg-white/90">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00AEEF]" />
              <span className="whitespace-nowrap">Jump To:</span>
            </div>

            {/* Left and Right Fade Mask Gradients */}
            <div className="pointer-events-none absolute left-[85px] sm:left-[100px] top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

            {/* Auto-scrolling Track */}
            <div
              ref={jumpScrollRef}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 pl-2.5 pr-8 text-xs select-none"
            >
              {[...categoryOrder, ...categoryOrder].map((catName, idx) => {
                const config = CATEGORY_CONFIGS[catName];
                const IconComponent = config ? config.Icon : PackageCheck;

                return (
                  <button
                    key={`${catName}-${idx}`}
                    onClick={() => scrollToCategoryShelf(catName)}
                    className="shrink-0 bg-slate-50 hover:bg-[#E0F7FC] text-slate-700 hover:text-[#00AEEF] border border-slate-200/80 hover:border-[#00AEEF]/40 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group text-xs"
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

              const config = CATEGORY_CONFIGS[category];
              const IconComp = config?.Icon || PackageCheck;
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
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#00AEEF]/10 text-[#00AEEF] flex items-center justify-center border border-[#00AEEF]/20">
                        <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                        {category}
                      </h3>
                    </div>

                    {/* See All Category Link */}
                    <button
                      onClick={() => onSeeAll?.(category)}
                      className="text-xs sm:text-sm font-semibold text-[#00AEEF] hover:text-[#0086B8] hover:underline transition-colors flex items-center gap-1 group/seeall cursor-pointer shrink-0"
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
                      className="flex items-stretch gap-3.5 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-3 pt-1 px-1 scroll-smooth"
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
