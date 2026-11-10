"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Banknote,
  QrCode,
  User,
  ArrowLeft,
  ArrowRight,
  Package,
  Lock,
  AlertCircle,
  Tablet,
  ShieldCheck,
  Bot,
  Cpu,
  Radio,
  Cog,
  Zap,
  Navigation,
  Box,
  GraduationCap,
  Wrench,
  LayoutGrid,
  MapPin,
} from "lucide-react";
import { PrayogLogo } from "@/components/PrayogLogo";
import {
  STORES,
  StoreId,
  WalkInSession,
  WalkInCartItem,
  PaymentMethod,
  saveSession,
  generateSessionId,
  POS_BROADCAST_CHANNEL,
} from "@/data/storeConfig";
import { PRODUCTS, Product, getStoreProductStock } from "@/data/mockData";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { RoboticOrderSuccess } from "@/components/walk-in/RoboticOrderSuccess";
import { OrderTruckButton } from "@/components/walk-in/OrderTruckButton";
import { CATEGORIES_DATA, matchCategory } from "@/data/categories";
import { CATEGORIES_HIERARCHY } from "@/data/categoriesHierarchy";
import { KioskGridSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEFAULT_HERO_BANNERS,
  HeroBanner,
  sortHeroBanners,
} from "@/data/heroBannersData";

// ─────────────────────────────────────────────────────
// Cart item in kiosk state
// ─────────────────────────────────────────────────────
interface KioskCartItem {
  product: Product;
  quantity: number;
}

type KioskView = "browse" | "cart" | "checkout" | "success";

interface CategorySectionDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const CANONICAL_CATEGORIES: CategorySectionDef[] = [
  {
    id: "electronic-components",
    name: "Electronic Components",
    icon: "⚡",
    description: "Resistors, Capacitors, ICs, Relays & Prototyping Essentials",
  },
  {
    id: "development-boards",
    name: "Development Boards",
    icon: "🛠️",
    description: "Arduino Boards, Raspberry Pi, ESP32, and Single Board Computers",
  },
  {
    id: "robotics",
    name: "Robotics & DIY Kits",
    icon: "🤖",
    description: "Robot Chassis, Robotic Arms, Kits & Smart Mechatronics",
  },
  {
    id: "drone-technology",
    name: "Drone Technology",
    icon: "🚁",
    description: "Flight Controllers, ESCs, BLDC Motors & UAV Accessories",
  },
  {
    id: "sensors-iot",
    name: "Sensors & IoT Modules",
    icon: "📡",
    description: "Ultrasonic, LiDAR, Environmental Sensors & Wireless Modules",
  },
  {
    id: "motors-drivers",
    name: "Motors, Steppers & Drivers",
    icon: "⚙️",
    description: "NEMA Steppers, High Torque Servos, DC Motors & Driver Shields",
  },
  {
    id: "batteries-power",
    name: "Batteries & Power Supplies",
    icon: "🔋",
    description: "LiPo Packs, Buck Converters, Battery Management & Power Modules",
  },
  {
    id: "stem-education",
    name: "Educational & STEM Kits",
    icon: "🎓",
    description: "Hands-on School Science Kits, ATL Labs & Tinkering Sets",
  },
  {
    id: "mechanical-hardware",
    name: "Mechanical & Hardware",
    icon: "🔩",
    description: "Frames, 3D Printer Accessories, Standoffs & Brackets",
  },
  {
    id: "industrial-automation",
    name: "Industrial Automation",
    icon: "🏭",
    description: "PLCs, Solid State Relays & Heavy Duty Automation Modules",
  },
];

function isProductMatchingCategory(p: Product, categoryName: string): boolean {
  if (!p || !categoryName) return false;
  const target = String(categoryName || "").toLowerCase().trim();
  if (target === "all") return true;

  const rawCat = typeof p.category === "object" ? (p.category as any)?.name : p.category;
  const pCat = String(rawCat || "").toLowerCase().trim();

  const rawSub = typeof p.subcategory === "object" ? (p.subcategory as any)?.name : p.subcategory;
  const pSub = String(rawSub || "").toLowerCase().trim();

  const pName = String(p.name || "").toLowerCase();
  const pSku = String(p.sku || "").toUpperCase();

  // 1. Direct or partial string match
  if (pCat === target || pSub === target) return true;

  // 2. Electronic Components (Resistors, Capacitors, ICs, Relays, LEDs, Diodes, Connectors)
  if (
    target.includes("electronic") ||
    target.includes("component") ||
    target === "resistors" ||
    target === "capacitors"
  ) {
    if (
      pCat.includes("component") ||
      pCat.includes("resistor") ||
      pCat.includes("capacitor") ||
      pCat.includes("relay") ||
      pCat.includes("diode") ||
      pCat.includes("transistor") ||
      /\bics?\b/i.test(pCat) ||
      /\bleds?\b/i.test(pCat) ||
      pSub.includes("resistor") ||
      pSub.includes("capacitor") ||
      pSub.includes("relay") ||
      /\bics?\b/i.test(pSub) ||
      pSku.startsWith("RES") ||
      pSku.startsWith("CAP") ||
      pSku.startsWith("CMP") ||
      pSku.startsWith("REL") ||
      /\bresistors?\b/i.test(pName) ||
      /\bcapacitors?\b/i.test(pName)
    ) {
      return true;
    }
  }

  // 3. Development Boards / Arduino / Raspberry Pi / SBC
  if (
    target.includes("development") ||
    target.includes("dev board") ||
    target.includes("arduino") ||
    target.includes("microcontroller") ||
    target.includes("sbc")
  ) {
    if (
      pCat.includes("arduino") ||
      pCat.includes("microcontroller") ||
      pCat.includes("development board") ||
      pCat.includes("single board") ||
      pCat.includes("dev board") ||
      pCat.includes("sbc") ||
      pCat.includes("raspberry") ||
      pSub.includes("arduino") ||
      pSub.includes("raspberry") ||
      pSku.startsWith("ARD") ||
      pSku.startsWith("DEV") ||
      pSku.startsWith("SBC") ||
      pSku.startsWith("RPI") ||
      pName.includes("arduino") ||
      pName.includes("raspberry pi") ||
      pName.includes("atmega") ||
      pName.includes("esp32")
    ) {
      return true;
    }
  }

  // 4. Robotics & DIY Kits
  if (target.includes("robot") || target.includes("diy kit")) {
    if (
      ((pCat.includes("robot") || pCat.includes("diy kit")) &&
        !pCat.includes("stem")) ||
      pSub.includes("robot") ||
      pSku.startsWith("ROB") ||
      pSku.startsWith("KIT") ||
      pName.includes("robot") ||
      pName.includes("chassis") ||
      pName.includes("arm") ||
      pName.includes("rover")
    ) {
      return true;
    }
  }

  // 5. Drone Technology & Aerial Systems
  if (target.includes("drone") || target.includes("uav")) {
    if (
      pCat.includes("drone") ||
      pCat.includes("uav") ||
      pSub.includes("drone") ||
      pSub.includes("flight controller") ||
      pSub.includes("esc") ||
      pSub.includes("propeller") ||
      pSku.startsWith("DRN") ||
      pSku.startsWith("UAV") ||
      pName.includes("drone") ||
      pName.includes("flight controller") ||
      pName.includes("propeller") ||
      pName.includes("bldc") ||
      pName.includes("pixhawk") ||
      pName.includes("speedybee")
    ) {
      return true;
    }
  }

  // 6. Sensors & IoT Modules
  if (
    target.includes("sensor") ||
    target.includes("iot") ||
    target.includes("wireless")
  ) {
    if (
      pCat.includes("sensor") ||
      pCat.includes("iot") ||
      pCat.includes("wireless") ||
      pSub.includes("sensor") ||
      pSub.includes("iot") ||
      pSku.startsWith("SEN") ||
      pSku.startsWith("IOT") ||
      pName.includes("sensor") ||
      pName.includes("ultrasonic") ||
      pName.includes("radar") ||
      pName.includes("lidar") ||
      pName.includes("lora")
    ) {
      return true;
    }
  }

  // 7. Motors, Steppers & Drivers
  if (
    target.includes("motor") ||
    target.includes("stepper") ||
    target.includes("driver")
  ) {
    if (
      pCat.includes("motor") ||
      pCat.includes("stepper") ||
      pCat.includes("driver") ||
      pSub.includes("motor") ||
      pSub.includes("driver") ||
      pSku.startsWith("MOT") ||
      pName.includes("motor") ||
      pName.includes("stepper") ||
      pName.includes("driver") ||
      pName.includes("servo")
    ) {
      return true;
    }
  }

  // 8. Batteries & Power
  if (target.includes("battery") || target.includes("power")) {
    if (
      pCat.includes("battery") ||
      pCat.includes("power") ||
      pSub.includes("battery") ||
      pSku.startsWith("BAT") ||
      pSku.startsWith("PWR") ||
      pName.includes("battery") ||
      pName.includes("lipo") ||
      pName.includes("bms")
    ) {
      return true;
    }
  }

  // 9. STEM & Educational Kits
  if (
    target.includes("stem") ||
    target.includes("educational") ||
    target.includes("education")
  ) {
    if (
      pCat.includes("stem") ||
      pCat.includes("educational") ||
      pCat.includes("education") ||
      pSub.includes("stem") ||
      pSku.startsWith("STM") ||
      pName.includes("stem") ||
      pName.includes("science kit")
    ) {
      return true;
    }
  }

  // 10. Mechanical & Hardware
  if (
    target.includes("mechanical") ||
    target.includes("hardware") ||
    target.includes("3d")
  ) {
    if (
      pCat.includes("mechanical") ||
      pCat.includes("hardware") ||
      pCat.includes("3d") ||
      pSub.includes("mechanical") ||
      pSub.includes("hardware") ||
      pSku.startsWith("MEC") ||
      pSku.startsWith("HRD")
    ) {
      return true;
    }
  }

  // 11. Industrial Automation
  if (target.includes("industrial") || target.includes("automation")) {
    if (
      pCat.includes("industrial") ||
      pCat.includes("automation") ||
      pSub.includes("automation") ||
      pSku.startsWith("IND") ||
      pSku.startsWith("AUT") ||
      pName.includes("plc")
    ) {
      return true;
    }
  }

  // Fallback: substring matching
  return (
    pCat.includes(target) ||
    target.includes(pCat) ||
    (pSub ? pSub.includes(target) || target.includes(pSub) : false)
  );
}

const KIOSK_CATEGORIES = ["All", ...CATEGORIES_DATA.map((c) => c.name)];

// ─────────────────────────────────────────────────────
// Banner Carousel Slide Variants (Matches Website)
// ─────────────────────────────────────────────────────
const heroSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.85,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0.85,
  }),
};

// ─────────────────────────────────────────────────────
// Mockup Left Sidebar Categories Definition
// ─────────────────────────────────────────────────────
const SIDEBAR_CATEGORIES = [
  { id: "all", name: "All Products", icon: LayoutGrid },
  { id: "robotics", name: "Robotics Kits", icon: Bot },
  { id: "arduino", name: "Arduino & Development Boards", icon: Cpu },
  { id: "sensors", name: "Sensors & Modules", icon: Radio },
  { id: "motors", name: "Motors & Drivers", icon: Cog },
  { id: "components", name: "Electronic Components", icon: Zap },
  { id: "drones", name: "Drones & UAV", icon: Navigation },
  { id: "3d-printing", name: "3D Printing", icon: Box },
  { id: "stem", name: "STEM Kits", icon: GraduationCap },
  { id: "tools", name: "Tools & Accessories", icon: Wrench },
];

// ─────────────────────────────────────────────────────
// Kiosk Header
// ─────────────────────────────────────────────────────
function KioskHeader({
  store,
  cartCount,
  cartTotal,
  view,
  search,
  setSearch,
  onCartClick,
  onBack,
  onLock,
}: {
  store: (typeof STORES)[StoreId];
  cartCount: number;
  cartTotal: number;
  view: KioskView;
  search?: string;
  setSearch?: (v: string) => void;
  onCartClick: () => void;
  onBack: () => void;
  onLock?: () => void;
}) {
  const storeData = store;
  const isSuccess = view === "success";

  if (view === "browse") {
    return (
      <header className="shrink-0 bg-gradient-to-r from-[#031536] via-[#071F4D] to-[#0A2558] border-b border-blue-950/60 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6 z-30 shadow-md">
        {/* Left: Prayog Logo & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <PrayogLogo dark size="sm" />
          <span className="hidden xl:inline-block h-5 w-px bg-blue-500/30 ml-1" />
          <span className="hidden xl:inline-block text-xs text-blue-200/80 font-medium">
            Build Your Next Big Idea.
          </span>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search || ""}
              onChange={(e) => setSearch?.(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-blue-400 rounded-xl sm:rounded-2xl pl-10 pr-9 py-2 text-xs sm:text-sm font-medium focus:outline-none shadow-sm transition"
            />
            {search && setSearch && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Store Mode Status Badge + Device Lock */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="bg-[#0B254E] border border-blue-800/50 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xs">
            <span className="text-amber-400 text-xs">📍</span>
            <span className="text-white font-bold text-xs truncate max-w-[110px] sm:max-w-none">
              {storeData.shortName}
            </span>
            <span className="text-blue-300 text-xs">·</span>
            <span className="text-blue-200 text-xs font-semibold hidden sm:inline">Store Mode</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>

          {onLock && (
            <button
              onClick={onLock}
              title="Lock Kiosk Device (Manager Login Required)"
              className="p-2 rounded-xl bg-[#0B254E] border border-blue-800/50 hover:bg-blue-900/60 text-blue-200 hover:text-white transition shadow-xs cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="shrink-0 bg-gradient-to-r from-[#031536] via-[#071F4D] to-[#0A2558] border-b border-blue-950/60 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-30 shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        {(view === "cart" || view === "checkout") && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#0B254E] border border-blue-800/50 hover:bg-blue-900/60 text-white transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        <PrayogLogo dark size="sm" />
        <span className="hidden sm:inline-block h-4 w-px bg-blue-500/30" />
        <span className="text-xs text-blue-200 font-bold truncate">
          {view === "cart"
            ? "Review In-Store Cart"
            : view === "checkout"
            ? "Express Counter Checkout"
            : "Order Placed"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isSuccess && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready for Counter Pickup</span>
          </div>
        )}

        {onLock && (
          <button
            onClick={onLock}
            title="Lock Kiosk Device"
            className="p-2 rounded-xl bg-[#0B254E] border border-blue-800/50 hover:bg-blue-900/60 text-blue-200 hover:text-white transition cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────
// Mockup Matching Product Card
// ─────────────────────────────────────────────────────
function ProductCard({
  product,
  quantity,
  availableStock,
  onAdd,
  onRemove,
  onOpenDetail,
}: {
  product: Product;
  quantity: number;
  availableStock: number;
  storeName?: string;
  accentColor?: string;
  onAdd: () => void;
  onRemove: () => void;
  onBuyNow?: () => void;
  onOpenDetail: () => void;
}) {
  const isInStock = availableStock > 0;
  const isLimited = availableStock > 0 && availableStock <= 5;
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden relative group h-full">
      {/* Product Image Area - Full Width Edge-to-Edge */}
      <div
        onClick={onOpenDetail}
        className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer select-none"
      >
        {/* Floating Top Badges (SKU & Stock Status) */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none gap-1.5">
          {product.sku ? (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs border border-white/60 truncate max-w-[110px]">
              {product.sku}
            </span>
          ) : (
            <span />
          )}

          {!isInStock ? (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/95 text-white shadow-xs backdrop-blur-xs border border-rose-400/30 shrink-0">
              Out of Stock
            </span>
          ) : isLimited ? (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/95 text-white shadow-xs backdrop-blur-xs border border-amber-400/30 shrink-0">
              Limited Stock
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600/95 text-white shadow-xs backdrop-blur-xs border border-emerald-400/30 shrink-0">
              In Stock
            </span>
          )}
        </div>

        {/* Discount Badge on Bottom-Left if applicable */}
        {discountPercent > 5 && (
          <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] shadow-xs tracking-tight pointer-events-none">
            {discountPercent}% OFF
          </div>
        )}

        {/* Product Image / Placeholder */}
        {product.image &&
        typeof product.image === "string" &&
        product.image.trim().length > 0 &&
        !product.image.includes("photo-1553406830-ef2513450d76") ? (
          <Image
            src={product.image}
            alt={typeof product.name === "string" ? product.name : "Product"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1.5 bg-slate-100/70">
            <Package className="w-9 h-9 stroke-[1.5] text-slate-300" />
            <span className="text-[11px] font-semibold text-slate-400">No Image</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Product Title */}
          <h3
            onClick={onOpenDetail}
            title={product.name}
            className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug cursor-pointer hover:text-[#0070F3] transition-colors min-h-[2.5rem]"
          >
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-baseline gap-2 mt-2 mb-3">
            <span className="text-base sm:text-lg font-black text-[#0070F3]">
              ₹{product.price.toLocaleString()}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ₹{product.mrp.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {!isInStock ? (
            <button
              disabled
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-not-allowed text-center"
            >
              Out of Stock
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={onAdd}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#EBF5FF] hover:bg-[#D8ECFF] text-[#0070F3] flex items-center justify-center gap-1.5 transition-colors active:scale-98 cursor-pointer shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-2 py-1">
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer transition active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-sm text-[#0070F3]">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                disabled={quantity >= availableStock}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs transition active:scale-95 ${
                  quantity >= availableStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#0070F3] text-white hover:bg-blue-600 cursor-pointer"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Kiosk Page
// ─────────────────────────────────────────────────────
export default function StoreKioskPage() {
  const params = useParams();
  const storeId = (params?.storeId as StoreId) || "ranchi";
  const store = STORES[storeId] || STORES.ranchi;

  // ── Kiosk Device Unlock / Manager Authentication State ──
  const [isDeviceUnlocked, setIsDeviceUnlocked] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [kioskUsername, setKioskUsername] = useState<string>(
    `${storeId}_kiosk`,
  );
  const [kioskPassword, setKioskPassword] = useState<string>("kiosk123");
  const [loginError, setLoginError] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const [view, setView] = useState<KioskView>("browse");
  const [cart, setCart] = useState<KioskCartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedSession, setCompletedSession] =
    useState<WalkInSession | null>(null);
  const [showProductDetail, setShowProductDetail] = useState<Product | null>(
    null,
  );
  const [showStockPopup, setShowStockPopup] = useState<{
    visible: boolean;
    limit: number;
  }>({ visible: false, limit: 0 });
  const stockPopupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerStockLimitPopup = (limit: number) => {
    setShowStockPopup({ visible: true, limit });
    if (stockPopupTimeoutRef.current) clearTimeout(stockPopupTimeoutRef.current);
    stockPopupTimeoutRef.current = setTimeout(() => {
      setShowStockPopup((p) => ({ ...p, visible: false }));
    }, 2800);
  };

  const broadcastRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Check if tablet was previously unlocked by the Store Manager via server session
    async function verifyAuth() {
      try {
        const res = await fetch("/api/staff/auth/me");
        const data = await res.json();
        if (data?.success && data?.user) {
          setIsDeviceUnlocked(true);
        }
      } catch {
        // Leave locked if server check fails
      } finally {
        setCheckingAuth(false);
      }
    }

    if (typeof window !== "undefined") {
      verifyAuth();
      broadcastRef.current = new BroadcastChannel(POS_BROADCAST_CHANNEL);
    }
    return () => broadcastRef.current?.close();
  }, [storeId]);

  // Handle Store Manager / Kiosk Staff device login
  const handleUnlockKiosk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/staff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: kioskUsername,
          password: kioskPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(
          data.message ||
            "Invalid manager-assigned credentials for this kiosk.",
        );
        setLoginLoading(false);
        return;
      }

      // Unlocked on server session
      setIsDeviceUnlocked(true);
      setLoginLoading(false);
    } catch {
      setLoginError("Authentication failed. Please check network connection.");
      setLoginLoading(false);
    }
  };

  const handleLockKiosk = async () => {
    if (
      confirm("Lock this kiosk tablet? Store manager will need to login again.")
    ) {
      try {
        await fetch("/api/staff/auth/logout", { method: "POST" });
      } catch {
        // Proceed with UI lock regardless
      }
      setIsDeviceUnlocked(false);
    }
  };

  // ── Load Real Products from Database API (Synchronizes newly added Admin products) ──
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);
    fetch("/api/products?limit=250")
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiProducts: Product[] = json.data.map((item: any) => {
            const rawPrimary =
              item.images?.[0]?.imageUrl ||
              (Array.isArray(item.images) && typeof item.images[0] === "string"
                ? item.images[0]
                : item.image || "");
            const primaryImg =
              rawPrimary && typeof rawPrimary === "string" && !rawPrimary.includes("photo-1553406830-ef2513450d76")
                ? rawPrimary
                : "";
            const allImages = Array.isArray(item.images)
              ? item.images
                  .map((im: any) => (typeof im === "string" ? im : im.imageUrl))
                  .filter((url: any) => typeof url === "string" && url.trim().length > 0 && !url.includes("photo-1553406830-ef2513450d76"))
              : primaryImg ? [primaryImg] : [];

            const rawCat = item.category;
            const categoryName =
              typeof rawCat === "object" && rawCat !== null
                ? String(rawCat.name || "Robotics & Components")
                : typeof rawCat === "string" && rawCat.trim()
                  ? rawCat.trim()
                  : "Robotics & Components";

            const rawSub = item.subcategory;
            const subcategoryName =
              typeof rawSub === "object" && rawSub !== null
                ? String(rawSub.name || "")
                : typeof rawSub === "string" && rawSub.trim()
                  ? rawSub.trim()
                  : "";

            const price = Number(item.price) || 0;
            const mrp = Number(item.mrp) || Math.round(price * 1.25);
            const discountPct =
              mrp > price
                ? `${Math.round(((mrp - price) / mrp) * 100)}% OFF`
                : "";

            const rawSpecs =
              typeof item.specifications === "object" && item.specifications !== null
                ? item.specifications
                : typeof item.specs === "object" && item.specs !== null
                  ? item.specs
                  : {};
            const cleanSpecs: Record<string, string> = {};
            for (const [k, v] of Object.entries(rawSpecs)) {
              if (!k.startsWith("_") && v !== null && v !== undefined && typeof v !== "object") {
                cleanSpecs[k] = String(v);
              }
            }

            return {
              id: item.id,
              slug: item.slug || item.id,
              name: item.name,
              sku: item.sku || `SKU-${item.id.slice(0, 6)}`,
              brand:
                item.brand && item.brand.trim().toLowerCase() !== "prayog india"
                  ? item.brand
                  : undefined,
              category: categoryName,
              subcategory: subcategoryName,
              price,
              mrp,
              discount: discountPct,
              rating: Number(item.rating) || 4.8,
              reviews: Number(item.reviewCount || item.reviews) || 12,
              inStock: item.inStock ?? item.stock > 0,
              stock: typeof item.stock === "number" ? item.stock : 25,
              image: primaryImg,
              images: allImages.filter(Boolean),
              description: item.description || "",
              features: Array.isArray(item.features) ? item.features : [],
              applications: Array.isArray(item.applications)
                ? item.applications
                : [],
              whatsIncluded: Array.isArray(item.whatsIncluded)
                ? item.whatsIncluded
                : [],
              specs: cleanSpecs,
              variants: Array.isArray(item.variants)
                ? item.variants.map((v: any) => ({
                    id: v.id || v.sku,
                    name: v.name,
                    sku: v.sku,
                    price: Number(v.price) || price,
                    mrp: Number(v.mrp) || mrp,
                    inStock: v.inStock ?? true,
                    stock: v.stock,
                  }))
                : undefined,
              documents: Array.isArray(item.documents) ? item.documents : [],
            };
          });

          // Combine with mock products, prioritizing newly created API products first
          const existingIds = new Set(apiProducts.map((p) => p.id));
          const existingSkus = new Set(
            apiProducts.map((p) => (p.sku || "").toUpperCase()),
          );
          const combined = [
            ...apiProducts,
            ...PRODUCTS.filter(
              (mp) =>
                !existingIds.has(mp.id) &&
                !existingSkus.has((mp.sku || "").toUpperCase()),
            ),
          ];

          setProductsList(combined);
        }
      })
      .catch((err) => {
        console.error("Failed to load products for walk-in store:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Group products into category sections
  const categorizedSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result: { category: CategorySectionDef; products: Product[] }[] = [];
    const assignedIds = new Set<string>();

    // Filter products matching search term first
    const pool = productsList.filter((p) => {
      if (!term) return true;
      const rawCat = typeof p.category === "object" ? (p.category as any)?.name : p.category;
      const pCat = String(rawCat || "").toLowerCase();
      const pName = String(p.name || "").toLowerCase();
      const pSku = String(p.sku || "").toLowerCase();
      const pBrand = String(p.brand || "").toLowerCase();
      return (
        pName.includes(term) ||
        pSku.includes(term) ||
        pCat.includes(term) ||
        pBrand.includes(term)
      );
    });

    // 1. Group into canonical categories
    for (const cat of CANONICAL_CATEGORIES) {
      const matches = pool.filter((p) =>
        isProductMatchingCategory(p, cat.name),
      );
      if (matches.length > 0) {
        result.push({ category: cat, products: matches });
        matches.forEach((p) => assignedIds.add(p.id));
      }
    }

    // 2. Unassigned products (e.g. newly created custom admin categories)
    const unassigned = pool.filter((p) => !assignedIds.has(p.id));
    if (unassigned.length > 0) {
      const customGroups: Record<string, Product[]> = {};
      for (const p of unassigned) {
        const rawCat = typeof p.category === "object" ? (p.category as any)?.name : p.category;
        const catKey = String(rawCat || "Hardware & Components").trim() || "Hardware & Components";
        if (!customGroups[catKey]) customGroups[catKey] = [];
        customGroups[catKey].push(p);
      }
      for (const [catName, prods] of Object.entries(customGroups)) {
        const safeName = String(catName);
        result.push({
          category: {
            id: safeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            name: safeName,
            icon: "📦",
            description: `All ${safeName} items`,
          },
          products: prods,
        });
      }
    }

    return result;
  }, [productsList, search]);

  // ── Hero Banners: Live Synchronized with Website CMS ──
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isBannerPaused, setIsBannerPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const res = await fetch(`/api/banners?activeOnly=true&_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setHeroBanners(sortHeroBanners(json.data));
        }
      } catch (err) {
        console.warn("Could not load dynamic banners for kiosk, using defaults:", err);
      }
    }
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const bannerCount = heroBanners.length;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + bannerCount) % bannerCount);
  };

  const goToSlide = (idx: number) => {
    if (idx === currentSlide) return;
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  // Auto-play interval with hover pause
  useEffect(() => {
    if (bannerCount <= 1 || isBannerPaused) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [bannerCount, isBannerPaused]);

  // Compute live product counts for standard sidebar categories
  const sidebarCategoriesWithCounts = useMemo(() => {
    return SIDEBAR_CATEGORIES.map((cat) => {
      let count = 0;
      if (cat.id === "all") {
        count = productsList.length;
      } else {
        count = productsList.filter((p) => isProductMatchingCategory(p, cat.name)).length;
      }
      return {
        ...cat,
        count,
      };
    });
  }, [productsList]);

  // Compute extra dynamic categories (e.g. custom admin categories like Resistors)
  const extraCategories = useMemo(() => {
    const canonicalMatches = new Set<string>();
    for (const cat of SIDEBAR_CATEGORIES) {
      if (cat.id !== "all") {
        for (const p of productsList) {
          if (isProductMatchingCategory(p, cat.name)) {
            canonicalMatches.add(p.id);
          }
        }
      }
    }
    const unassigned = productsList.filter((p) => !canonicalMatches.has(p.id));
    const groups: Record<string, number> = {};
    for (const p of unassigned) {
      const rawCat = typeof p.category === "object" ? (p.category as any)?.name : p.category;
      const catKey = String(rawCat || "Other Hardware").trim() || "Other Hardware";
      groups[catKey] = (groups[catKey] || 0) + 1;
    }
    return Object.entries(groups).map(([name, count]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      count,
    }));
  }, [productsList]);

  // Derived filtered products (when a specific category or search is active)
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return productsList.filter((p) => {
      const rawCat = typeof p.category === "object" ? (p.category as any)?.name : p.category;
      const pCat = String(rawCat || "").toLowerCase();
      const pName = String(p.name || "").toLowerCase();
      const pSku = String(p.sku || "").toLowerCase();
      const pBrand = String(p.brand || "").toLowerCase();

      const matchesSearch =
        term === "" ||
        pName.includes(term) ||
        pSku.includes(term) ||
        pCat.includes(term) ||
        pBrand.includes(term);

      if (!matchesSearch) return false;
      if (selectedCategory === "All" || selectedCategory === "All Products") return true;

      return isProductMatchingCategory(p, selectedCategory);
    });
  }, [productsList, search, selectedCategory]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const gstAmount = Math.round(subtotal * 0.18);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const grandTotal = Math.max(0, subtotal - couponDiscount);
  const finalTotal = grandTotal;

  const getQty = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  const addToCart = useCallback(
    (product: Product, variantId?: string, qty: number = 1) => {
      const storeStock = getStoreProductStock(product, storeId);
      if (storeStock <= 0) {
        triggerStockLimitPopup(0);
        return;
      }
      setCart((prev) => {
        const idx = prev.findIndex((i) => i.product.id === product.id);
        const currentQty = idx >= 0 ? prev[idx].quantity : 0;
        if (currentQty + qty > storeStock) {
          triggerStockLimitPopup(storeStock);
          return prev;
        }
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
          return updated;
        }
        return [...prev, { product, quantity: qty }];
      });
    },
    [storeId],
  );

  const removeFromCart = useCallback((product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx < 0) return prev;
      const newQty = prev[idx].quantity - 1;
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: newQty };
      return updated;
    });
  }, []);

  const deleteFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) return;
    setSubmitting(true);

    try {
      const sessionItems: WalkInCartItem[] = cart.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        sku: i.product.sku,
        image: i.product.image,
        price: i.product.price,
        mrp: i.product.mrp,
        quantity: i.quantity,
      }));

      // Calculate total accounting for any in-store coupon applied
      const payableAmount =
        typeof finalTotal === "number" ? finalTotal : grandTotal;

      const session: WalkInSession = {
        id: generateSessionId(storeId),
        storeId,
        status: "PENDING",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        paymentMethod,
        items: sessionItems,
        subtotal,
        gstAmount,
        total: payableAmount,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Set completed session immediately to avoid any null-state delays
      setCompletedSession(session);

      // Save in-memory and broadcast to open POS terminals
      try {
        saveSession(session);
      } catch (e) {
        console.warn("Kiosk session save warning:", e);
      }

      // Broadcast to manager POS (same-browser tabs)
      try {
        broadcastRef.current?.postMessage({ type: "NEW_SESSION", session });
      } catch (e) {
        console.warn("Kiosk broadcast warning:", e);
      }

      // Push to server-side API for persistent multi-device sync
      try {
        await fetch("/api/pos/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, session }),
        });
      } catch (e) {
        console.warn("Server session sync notice:", e);
      }

      setView("success");
    } catch (err) {
      console.error("Order submission exception:", err);
      // Ensure the kiosk still proceeds to success view with active session
      setView("success");
    } finally {
      setSubmitting(false);
    }
  };

  // ── RENDER HELPERS ────────────────────────────────

  const renderBrowseView = () => {
    const activeBanner: HeroBanner =
      heroBanners[currentSlide] || heroBanners[0] || DEFAULT_HERO_BANNERS[0];
    const isAllSelected = selectedCategory === "All" || selectedCategory === "All Products";

    const isTextEmpty = (str?: string) =>
      !str || str.trim() === "" || str.trim() === "." || str.trim() === "-";

    const hasTitleOrDesc =
      !isTextEmpty(activeBanner.titlePrefix) ||
      !isTextEmpty(activeBanner.titleHighlight) ||
      Boolean(activeBanner.subtitle && activeBanner.subtitle.trim().length > 1) ||
      Boolean(activeBanner.description && !isTextEmpty(activeBanner.description) && activeBanner.description.trim().length > 3);

    const hasButtons =
      !isTextEmpty(activeBanner.primaryButtonText) ||
      !isTextEmpty(activeBanner.secondaryButtonText);

    const hasTextOverlay =
      activeBanner.showTextOverlay === true ||
      (activeBanner.showTextOverlay !== false && (hasTitleOrDesc || hasButtons));

    return (
      <div className="flex-1 w-full h-full flex overflow-hidden min-h-0 bg-[#F4F7FB]">
        {/* ── Left Sidebar Navigation (Fixed in Place / Independent Scroll) ── */}
        <aside className="w-64 xl:w-72 h-full bg-white border-r border-slate-200/80 shrink-0 flex flex-col justify-between p-3.5 overflow-y-auto select-none">
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
              Store Categories
            </div>
            {sidebarCategoriesWithCounts.map((cat) => {
              const isActive =
                (cat.id === "all" && isAllSelected) ||
                selectedCategory === cat.name;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSearch("");
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-between transition cursor-pointer text-left ${
                    isActive
                      ? "bg-[#0070F3] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComp
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}

            {/* Extra Dynamic Categories (e.g. custom admin categories like Resistors) */}
            {extraCategories.length > 0 && (
              <div className="pt-2 border-t border-slate-150 mt-2 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
                  More Categories
                </div>
                {extraCategories.map((cat) => {
                  const isActive = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSearch("");
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-between transition cursor-pointer text-left ${
                        isActive
                          ? "bg-[#0070F3] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Promo Card in Sidebar */}
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#061B40] via-[#0A2E6E] to-[#0051C6] p-4 text-white relative overflow-hidden shadow-sm shrink-0">
            <div className="relative z-10 max-w-[65%]">
              <p className="text-xs font-black tracking-tight leading-snug text-white">
                Explore<br />
                Innovate<br />
                <span className="text-blue-300">Create</span>
              </p>
            </div>
            <div className="absolute -right-2 -bottom-2 w-20 h-20 opacity-95 pointer-events-none">
              <Image
                src="/products/robot_car_stem_transparent.png"
                alt="Robot Kit"
                width={80}
                height={80}
                className="object-contain drop-shadow-md"
              />
            </div>
          </div>
        </aside>

        {/* ── Main Section Container with Bottom Cart Bar ── */}
        <div className="flex-1 h-full min-w-0 relative flex flex-col overflow-hidden">
          {/* ── Main Content Area (Independent Scroll for Banners & Products) ── */}
          <main className="flex-1 h-full min-w-0 overflow-y-auto p-4 sm:p-6 pb-28 sm:pb-32 space-y-6">
          {/* 1. Hero Banner Carousel — Live Synchronized with Website (Compact Height & Zero-Cut Contained Image) */}
          <div
            onMouseEnter={() => setIsBannerPaused(true)}
            onMouseLeave={() => setIsBannerPaused(false)}
            className="relative w-full rounded-2xl overflow-hidden shadow-sm h-36 sm:h-44 md:h-48 max-h-[200px] flex items-center bg-[#07132B] group select-none"
            aria-label="Prayog India Featured Robotics Showcase Banner"
          >
            {/* Animated Swipeable Carousel Track */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={activeBanner.id || currentSlide}
                  custom={direction}
                  variants={heroSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.75 },
                    opacity: { duration: 0.4 },
                  }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center select-none"
                >
                  {/* Ambient Blurred Backdrop (Fills container with matching color gradient without letterbox voids) */}
                  <img
                    src={activeBanner.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-75 scale-125 pointer-events-none select-none"
                    draggable={false}
                  />

                  {/* 100% Contained Foreground Image — Preserves Full Graphic Edge-to-Edge with Zero Cropping/Cutting */}
                  <img
                    src={activeBanner.image}
                    alt={activeBanner.alt || "Prayog India Banner"}
                    className="relative z-10 w-full h-full object-contain object-center pointer-events-none select-none drop-shadow-sm"
                    draggable={false}
                  />

                  {/* Optional Text Overlay Layer (if configured in CMS) */}
                  {hasTextOverlay && (
                    <div className="absolute inset-0 z-20 w-full h-full px-6 sm:px-10 flex items-center bg-gradient-to-r from-black/60 via-black/25 to-transparent">
                      <div className="max-w-xl text-left space-y-1">
                        {(activeBanner.titlePrefix || activeBanner.titleHighlight) && (
                          <h1 className="text-base sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                            {activeBanner.titlePrefix}{" "}
                            {activeBanner.titleHighlight && (
                              <span className="text-[#FFC20E]">
                                {activeBanner.titleHighlight}
                              </span>
                            )}
                          </h1>
                        )}
                        {activeBanner.subtitle && (
                          <p className="text-[11px] sm:text-xs font-semibold text-blue-200">
                            {activeBanner.subtitle}
                          </p>
                        )}
                        {activeBanner.description && !isTextEmpty(activeBanner.description) && (
                          <p className="text-[11px] text-slate-200 line-clamp-1">
                            {activeBanner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hover Navigation Arrows */}
            {bannerCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(-1);
                  }}
                  aria-label="Previous Slide"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs active:scale-90"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(1);
                  }}
                  aria-label="Next Slide"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs active:scale-90"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </>
            )}

            {/* Carousel Indicator Dots */}
            {bannerCount > 1 && (
              <div className="absolute bottom-2.5 right-3 sm:right-5 flex items-center gap-1 z-30 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shadow-xs">
                {heroBanners.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentSlide === idx
                        ? "w-4 sm:w-5 h-1 sm:h-1.5 bg-[#0070F3]"
                        : "w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 2. Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-[#0070F3] rounded-full inline-block" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {search.trim()
                    ? `Search Results for "${search}"`
                    : isAllSelected
                    ? "Featured Products"
                    : selectedCategory}
                </h2>
                <span className="text-xs font-bold text-slate-400 ml-1">
                  ({filteredProducts.length})
                </span>
              </div>

              {!isAllSelected && (
                <button
                  onClick={() => {
                    setSelectedCategory("All Products");
                    setSearch("");
                  }}
                  className="text-xs font-bold text-[#0070F3] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Product Cards Grid */}
            {loadingProducts && productsList.length === 0 ? (
              <KioskGridSkeleton count={8} />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-2xs">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-bold text-sm text-slate-700">No products found</p>
                <p className="text-xs mt-1">
                  Try another keyword or select a different category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p) => {
                  const storeStock = getStoreProductStock(p, storeId);
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      quantity={getQty(p.id)}
                      availableStock={storeStock}
                      storeName={store.shortName}
                      accentColor={store.accentColor}
                      onAdd={() => addToCart(p, undefined, 1)}
                      onRemove={() => removeFromCart(p)}
                      onOpenDetail={() => setShowProductDetail(p)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* ── Persistent Floating Bottom Cart Bar (Shows Only When Items In Cart in Browse View) ── */}
        {view === "browse" && cartCount > 0 && (
          <aside
            aria-label="Kiosk Floating Cart"
            className="absolute bottom-4 inset-x-4 sm:inset-x-6 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out"
          >
            {/* Left: Cart Icon + My Cart & Item Count */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-[#0A2558] stroke-[2]" />
                <span className="absolute -top-2 -right-2.5 bg-[#EF4444] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  My Cart
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight mt-0.5">
                  {cartCount} {cartCount === 1 ? "Item" : "Items"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 shrink-0 mx-2 sm:mx-4" />

            {/* Center: Total Amount */}
            <div className="flex flex-col text-left mr-auto">
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight">
                Total Amount
              </span>
              <span className="font-black text-base sm:text-lg text-[#0070F3] leading-tight mt-0.5">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Right: View Cart Button */}
            <button
              onClick={() => setView("cart")}
              className="bg-[#0070F3] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer shrink-0"
            >
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </aside>
        )}
      </div>
      </div>
    );
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "PRAYOG10") {
      setCouponDiscount(Math.round(subtotal * 0.1));
      setAppliedCoupon("PRAYOG10");
    } else if (code === "STORE50") {
      setCouponDiscount(Math.min(subtotal, 50));
      setAppliedCoupon("STORE50");
    } else {
      alert("Invalid coupon code. Try PRAYOG10 for 10% discount.");
    }
  };

  const renderCartView = () => (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setView("browse")}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-300 z-10">
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#00AEEF]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Your Cart
            </h2>
            <span className="bg-[#00AEEF] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={() => setView("browse")}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-3">
              <ShoppingCart className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">
                Your cart is currently empty
              </p>
              <button
                onClick={() => setView("browse")}
                className="mt-2 bg-[#00AEEF] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md hover:bg-[#0096D6] transition-all cursor-pointer"
              >
                Browse Store Products
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-50 p-1 border border-slate-200/80 shrink-0 relative overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {item.product.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.product.sku}
                  </div>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    ₹
                    {(item.product.price * item.quantity).toLocaleString(
                      "en-IN",
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer active:scale-90"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black px-1.5 text-slate-900 min-w-[18px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(item.product)}
                    className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer active:scale-90"
                    aria-label="Increase"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => deleteFromCart(item.product.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
            {/* Coupon Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="COUPON  CODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs uppercase font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#00AEEF]"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-[#00AEEF] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Coupon {appliedCoupon}{" "}
                applied (-₹{couponDiscount.toLocaleString("en-IN")})
              </p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-extrabold text-slate-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">
                  GST &amp; Express Shipping
                </span>
                <span className="text-emerald-600 font-bold">Included</span>
              </div>
              <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-[#00AEEF]">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setView("browse")}
                className="border border-slate-300 hover:border-slate-400 text-slate-800 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-colors cursor-pointer"
              >
                Full Cart
              </button>
              <button
                onClick={() => setView("checkout")}
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pan-India Dispatch · 100% Genuine</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCheckoutView = () => (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Top Header Card */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Your Details &amp; Payment
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Quick walk-in billing details for counter fulfillment
            </p>
          </div>
          <button
            onClick={() => setView("cart")}
            className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Cart</span>
          </button>
        </div>

        {/* Customer Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-[#00AEEF]" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Customer Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Om Kumar"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit number"
                maxLength={10}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email Address{" "}
                <span className="text-slate-400 font-normal">(for e-bill)</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Notes / Requirements{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Pack with 9V battery connector"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Banknote className="w-4 h-4 text-[#00AEEF]" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Payment Method
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: "CASH",
                  label: "Pay with Cash",
                  sub: "Pay at store counter",
                  icon: Banknote,
                  color: "#059669",
                },
                {
                  value: "UPI",
                  label: "Pay via UPI",
                  sub: "Scan QR at counter",
                  icon: QrCode,
                  color: "#7C3AED",
                },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const isSelected = paymentMethod === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 text-left cursor-pointer active:scale-95 ${
                    isSelected
                      ? "border-current bg-emerald-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                  style={
                    isSelected
                      ? { borderColor: opt.color, background: `${opt.color}0D` }
                      : undefined
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isSelected ? opt.color : "#E2E8F0" }}
                  >
                    <Icon
                      className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-600"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900">
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {opt.sub}
                    </div>
                    {isSelected && (
                      <div
                        className="text-[9px] font-black uppercase tracking-wider mt-0.5"
                        style={{ color: opt.color }}
                      >
                        Selected ✓
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Price Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700 pb-1.5 border-b border-slate-100">
            <span>Order Summary</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {cartCount} items
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between items-center text-slate-600"
              >
                <span className="truncate max-w-[280px] font-medium">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-bold text-slate-900 shrink-0 ml-2">
                  ₹
                  {(item.product.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>In-Store GST &amp; Local Dispatch</span>
              <span className="text-emerald-600 font-bold">Included</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-100">
              <span>Payable Amount</span>
              <span className="text-[#00AEEF] text-base">
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Validation Error Message */}
        {(!customerName.trim() || !customerPhone.trim()) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Please enter Customer Name and 10-digit Mobile Number to place the
              order.
            </span>
          </div>
        )}

        {/* Submission Button */}
        <div className="pt-3 pb-12 flex flex-col items-center justify-center">
          <OrderTruckButton
            defaultText="Complete Order"
            successText="Order Placed"
            disabled={
              submitting || !customerName.trim() || !customerPhone.trim()
            }
            onClick={() => {
              // Trigger truck driving animation, then commit order to counter
              setTimeout(() => {
                handleSubmitOrder();
              }, 3200);
            }}
          />
          <span className="text-[11px] text-slate-400 mt-2.5 font-medium">
            Click to confirm &amp; dispatch order to counter
          </span>
        </div>
      </div>
    </div>
  );

  const handleStartNewSession = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCompletedSession(null);
    setView("browse");
  };

  const renderSuccessView = () => (
    <RoboticOrderSuccess
      session={completedSession}
      store={store}
      onReset={handleStartNewSession}
    />
  );

  if (checkingAuth) {
    return <KioskGridSkeleton count={8} />;
  }


  // ── 1. KIOSK LOCKED: Store Manager Setup & Login Form ──
  if (!isDeviceUnlocked) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Glow */}
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: store.accentColor }}
        />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#00AEEF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-900/95 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10"
                style={{ background: store.accentColor }}
              >
                <Tablet className="w-7 h-7" />
              </div>

              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white inline-block mb-1"
                  style={{ background: store.accentColor }}
                >
                  {store.shortName} · In-Store Kiosk
                </span>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Device Authentication Required
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Enter the store manager-assigned kiosk credentials to unlock
                  this tablet for customer shopping.
                </p>
              </div>
            </div>

            {/* Error banner */}
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Manager Login Form */}
            <form onSubmit={handleUnlockKiosk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Kiosk Device Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={kioskUsername}
                    onChange={(e) => setKioskUsername(e.target.value)}
                    placeholder={`e.g. ${storeId}_kiosk`}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] transition-all font-mono"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Device Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={kioskPassword}
                    onChange={(e) => setKioskPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
                style={{ background: store.accentColor }}
              >
                {loginLoading ? (
                  <span>Unlocking Terminal...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Kiosk for Customers</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
              Assigned Store:{" "}
              <span className="font-bold text-slate-300">{store.city}</span> ·
              Managed by Branch Store Manager
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. KIOSK UNLOCKED: Customer Shopping Screen ──
  return (
    <div
      className="fixed inset-0 h-screen h-[100dvh] max-h-screen w-screen overflow-hidden bg-slate-100 flex flex-col select-none"
      style={{ "--accent": store.accentColor } as React.CSSProperties}
    >
      <KioskHeader
        store={store}
        cartCount={cartCount}
        cartTotal={subtotal}
        view={view}
        search={search}
        setSearch={setSearch}
        onCartClick={() => setView("cart")}
        onBack={() => setView(view === "checkout" ? "cart" : "browse")}
        onLock={handleLockKiosk}
      />

      <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden relative">
        {renderBrowseView()}
        {view === "cart" && renderCartView()}
        {view === "checkout" && (
          <div className="absolute inset-0 bg-slate-100 z-50 flex flex-col">
            {renderCheckoutView()}
          </div>
        )}
        {view === "success" && (
          <div className="absolute inset-0 bg-[#E4ECFA] z-50 flex flex-col overflow-y-auto">
            {renderSuccessView()}
          </div>
        )}
      </div>

      {/* ── Full Multiple Images, Video & 360° View Modal ── */}
      {showProductDetail && (
        <QuickViewModal
          product={showProductDetail}
          storeId={storeId}
          onClose={() => setShowProductDetail(null)}
          onAddToCart={(prod, variantId, qty) => {
            addToCart(prod, variantId, qty || 1);
          }}
          onBuyNow={(prod, variantId, qty) => {
            addToCart(prod, variantId, qty || 1);
            setShowProductDetail(null);
            setView("cart");
          }}
        />
      )}

      {/* ── Top Floating Stock Limit Pill Popup ── */}
      <AnimatePresence>
        {showStockPopup.visible && (
          <aside
            aria-live="polite"
            className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto select-none"
            onClick={() => setShowStockPopup((prev) => ({ ...prev, visible: false }))}
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
              <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 tracking-tight font-sans">
                {showStockPopup.limit <= 0
                  ? `This item is currently out of stock at ${store.shortName}.`
                  : `Only ${showStockPopup.limit} units available in stock`}
              </span>
            </motion.div>
          </aside>
        )}
      </AnimatePresence>
    </div>
  );
}
