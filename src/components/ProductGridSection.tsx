"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
              brand:
                item.brand && item.brand.trim().toLowerCase() !== "prayog india"
                  ? item.brand
                  : undefined,
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

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const displayedProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return liveProducts.length > 0 ? liveProducts : PRODUCTS;
    }
    const filtered = liveProducts.filter((p) =>
      isProductInShelfCategory(p, selectedCategory),
    );
    if (filtered.length > 0) return filtered;
    return PRODUCTS.filter((p) =>
      isProductInShelfCategory(p, selectedCategory),
    );
  }, [selectedCategory, liveProducts]);

  const top10 = useMemo(() => displayedProducts.slice(0, 10), [displayedProducts]);

  const row1Products = useMemo(() => [
    top10[0],
    top10[1],
    top10[4],
    top10[5],
    top10[8],
  ].filter(Boolean), [top10]);

  const row2Products = useMemo(() => [
    top10[2],
    top10[3],
    top10[6],
    top10[7],
    top10[9],
  ].filter(Boolean), [top10]);

  return (
    <section
      id="featured-products"
      className="py-6 sm:py-10 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20"
    >
      <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-4 sm:space-y-6">
        {/* Main Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 pb-3 gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Explore Products
              </h2>
              <div className="hidden sm:block w-10 h-1 bg-[#2563EB] rounded-full" />
            </div>
          </div>

          <button
            onClick={() => onSeeAll?.(selectedCategory === "all" ? "all" : selectedCategory)}
            className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90"
            }`}
          >
            All Products
          </button>

          {categoryOrder.map((catName) => {
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90"
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Mobile: 2 Independent Swipeable Rows */}
        <div className="sm:hidden space-y-3">
          {/* Row 1 */}
          <div
            className="flex gap-3 items-stretch overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory touch-pan-x touch-pan-y -mx-3.5 px-3.5"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {row1Products.map((product) => (
              <div
                key={product.id}
                className="w-[165px] xs:w-[178px] shrink-0 snap-start h-full flex flex-col"
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

          {/* Row 2 */}
          <div
            className="flex gap-3 items-stretch overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory touch-pan-x touch-pan-y -mx-3.5 px-3.5"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {row2Products.map((product) => (
              <div
                key={product.id}
                className="w-[165px] xs:w-[178px] shrink-0 snap-start h-full flex flex-col"
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

        {/* Desktop / Tablet: Responsive Multi-Column Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4.5 items-stretch">
          {top10.map((product, index) => (
            <div
              key={product.id}
              className={`h-full flex flex-col
                ${index >= 6 ? "sm:hidden md:flex" : ""}
                ${index >= 8 ? "md:hidden xl:flex" : ""}
              `}
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
    </section>
  );
};
