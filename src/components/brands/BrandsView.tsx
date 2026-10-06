"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  X,
  Cpu,
  CircuitBoard,
  Radio,
  Zap,
  Bot,
  Plane,
  Award,
  Truck,
  Headphones,
  CheckCircle2,
  ExternalLink,
  Layers,
} from "lucide-react";
import {
  ArduinoCategoryIcon,
  RoboticsCategoryIcon,
  SensorsCategoryIcon,
  DroneCategoryIcon,
  StemCategoryIcon,
  IoTCategoryIcon,
  DevBoardCategoryIcon,
  ComponentsCategoryIcon,
} from "@/components/icons/CategoryIcons";

export interface BrandPartner {
  id: string;
  name: string;
  slug: string;
  country: string;
  flag: string;
  category: string;
  categoryType:
    | "mcu"
    | "sbc"
    | "ai"
    | "iot"
    | "drones"
    | "stem"
    | "components";
  description: string;
  badge: "Official Distributor" | "Authorized Partner" | "Proprietary Hardware";
  productCount: number;
  featured?: boolean;
  accentColor: string;
  popularItems: string[];
}

export const BRANDS_LIST: BrandPartner[] = [
  {
    id: "arduino",
    name: "Arduino",
    slug: "arduino",
    country: "Italy",
    flag: "🇮🇹",
    category: "Microcontrollers & Dev Boards",
    categoryType: "mcu",
    description:
      "World standard open-source electronics platform powering mechatronics, STEM, and smart automation.",
    badge: "Authorized Partner",
    productCount: 18,
    featured: true,
    accentColor: "#00878F",
    popularItems: ["UNO R4 WiFi", "Mega 2560", "Nano ESP32", "Portenta H7"],
  },
  {
    id: "raspberry-pi",
    name: "Raspberry Pi",
    slug: "raspberry-pi",
    country: "United Kingdom",
    flag: "🇬🇧",
    category: "Single Board Computers",
    categoryType: "sbc",
    description:
      "Industry-leading 64-bit ARM compute modules, Raspberry Pi 5, active coolers, and camera ecosystems.",
    badge: "Official Distributor",
    productCount: 14,
    featured: true,
    accentColor: "#C51A4A",
    popularItems: ["Raspberry Pi 5 (8GB)", "Pi 4 Model B", "HQ Camera 12MP", "CM4 Compute Module"],
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    slug: "nvidia",
    country: "USA",
    flag: "🇺🇸",
    category: "Edge AI & Embedded Computing",
    categoryType: "ai",
    description:
      "Supercharged Edge AI compute platforms for computer vision, ROS 2 autonomous robotics, and deep learning.",
    badge: "Authorized Partner",
    productCount: 8,
    featured: true,
    accentColor: "#76B900",
    popularItems: ["Jetson Orin Nano 8GB", "Jetson Xavier NX", "TensorRT Carrier", "Depth Camera Kits"],
  },
  {
    id: "espressif",
    name: "Espressif Systems",
    slug: "espressif",
    country: "China / Global",
    flag: "🌐",
    category: "IoT & Wireless Microcontrollers",
    categoryType: "iot",
    description:
      "Ubiquitous Wi-Fi 6 & Bluetooth 5 (LE) SoC microcontrollers for ultra-low power connected hardware.",
    badge: "Authorized Partner",
    productCount: 16,
    featured: true,
    accentColor: "#E7352C",
    popularItems: ["ESP32-S3 Dual-Core", "ESP32-C3 RISC-V", "NodeMCU V3", "ESP32-CAM AI Vision"],
  },
  {
    id: "stmicroelectronics",
    name: "STMicroelectronics",
    slug: "stmicroelectronics",
    country: "Switzerland",
    flag: "🇨🇭",
    category: "ARM Cortex Microcontrollers",
    categoryType: "mcu",
    description:
      "High-reliability STM32 32-bit ARM Cortex-M4/M7 microcontrollers and Nucleo prototyping ecosystem.",
    badge: "Authorized Partner",
    productCount: 10,
    accentColor: "#03234B",
    popularItems: ["STM32F401 BlackPill", "STM32F103 BluePill", "Nucleo-F446RE", "ST-Link V2 Programmer"],
  },
  {
    id: "holybro",
    name: "Holybro & Pixhawk",
    slug: "holybro",
    country: "USA / Global",
    flag: "🇺🇸",
    category: "UAV Autopilots & Avionics",
    categoryType: "drones",
    description:
      "Mission-critical PX4 / ArduPilot autonomous flight controllers, precision RTK GNSS, and telemetry links.",
    badge: "Authorized Partner",
    productCount: 12,
    featured: true,
    accentColor: "#00AEEF",
    popularItems: ["Pixhawk 6C Autopilot", "M9N High-Precision GPS", "SiK Telemetry Radio", "PM02 Power Module"],
  },
  {
    id: "prayog",
    name: "Prayog Tech Labs",
    slug: "prayog",
    country: "India",
    flag: "🇮🇳",
    category: "Robotics & STEM Lab Systems",
    categoryType: "stem",
    description:
      "Proprietary Indian-engineered mechatronics platforms, ATL Innovation Lab setups, and ROS SLAM rovers.",
    badge: "Proprietary Hardware",
    productCount: 25,
    featured: true,
    accentColor: "#FFC20E",
    popularItems: ["6-DOF Metal Robotic Arm", "Autonomous Mecanum Rover", "ATL Mega Innovation Kit", "IoT Weather Station"],
  },
  {
    id: "speedybee",
    name: "SpeedyBee & Foxeer",
    slug: "speedybee",
    country: "Global",
    flag: "🌐",
    category: "FPV & Drone Power Stacks",
    categoryType: "drones",
    description:
      "Wireless-configurable F405 flight controller stacks, 55A BLHeli_S ESCs, and low-latency micro FPV cameras.",
    badge: "Authorized Partner",
    productCount: 9,
    accentColor: "#FF6B00",
    popularItems: ["SpeedyBee F405 V3 Stack", "55A 4-in-1 BLHeli_S ESC", "Foxeer Cat 3 Night Camera", "TX800 VTX"],
  },
  {
    id: "seeed",
    name: "Seeed Studio",
    slug: "seeed",
    country: "Global",
    flag: "🌐",
    category: "Grove Sensors & Edge Hardware",
    categoryType: "components",
    description:
      "Modular plug-and-play Grove sensor ecosystem, Seeed XIAO miniature boards, and industrial reTerminal.",
    badge: "Authorized Partner",
    productCount: 11,
    accentColor: "#84BD00",
    popularItems: ["Seeed XIAO ESP32C3", "Grove Shield for Arduino", "Grove Temperature Probe", "reComputer Jetson Case"],
  },
  {
    id: "waveshare",
    name: "Waveshare Electronics",
    slug: "waveshare",
    country: "Global",
    flag: "🌐",
    category: "Displays & Hardware HATs",
    categoryType: "components",
    description:
      "E-Paper paper displays, HDMI IPS touchscreens, motor driver expansions, and Jetson carrier boards.",
    badge: "Authorized Partner",
    productCount: 15,
    accentColor: "#1B365D",
    popularItems: ["7-inch HDMI Capacitive IPS", "2.9-inch E-Ink Display HAT", "Jetson Nano Dual Gigabit Base", "Motor Driver HAT"],
  },
  {
    id: "sparkfun",
    name: "SparkFun Electronics",
    slug: "sparkfun",
    country: "USA",
    flag: "🇺🇸",
    category: "Prototyping & Qwiic Sensors",
    categoryType: "components",
    description:
      "I2C Qwiic connect system, high-accuracy IMU breakouts, GPS dead reckoning, and OpenLog data loggers.",
    badge: "Authorized Partner",
    productCount: 8,
    accentColor: "#E53935",
    popularItems: ["Qwiic 6-DOF IMU (LSM6DSO)", "OpenLog Artemis Data Logger", "GPS-RTK Dead Reckoning", "RedBoard Qwiic"],
  },
  {
    id: "adafruit",
    name: "Adafruit Industries",
    slug: "adafruit",
    country: "USA",
    flag: "🇺🇸",
    category: "Maker Hardware & CircuitPython",
    categoryType: "components",
    description:
      "Feather development ecosystem, NeoPixel addressable LEDs, STEMMA QT sensor boards, and CircuitPython.",
    badge: "Authorized Partner",
    productCount: 9,
    accentColor: "#FF007F",
    popularItems: ["Adafruit Feather RP2040", "NeoPixel RGB LED Ring (16x)", "BME680 Environmental Sensor", "Motor Shield V2"],
  },
];

type CategoryFilter = "all" | "mcu" | "sbc" | "ai" | "iot" | "drones" | "stem" | "components";
type SortOption = "popular" | "name" | "count";

const CATEGORY_TABS: { key: CategoryFilter; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: "all", label: "All Brands", icon: Layers },
  { key: "mcu", label: "Microcontrollers", icon: ArduinoCategoryIcon },
  { key: "sbc", label: "Single Board Computers", icon: CircuitBoard },
  { key: "ai", label: "Edge AI & Robotics", icon: Bot },
  { key: "iot", label: "IoT & Wireless", icon: IoTCategoryIcon },
  { key: "drones", label: "Avionics & Drones", icon: DroneCategoryIcon },
  { key: "stem", label: "Robotics & STEM Labs", icon: StemCategoryIcon },
  { key: "components", label: "Sensors & Displays", icon: SensorsCategoryIcon },
];

export const BrandsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [activeBadge, setActiveBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  // Filtering & Sorting Logic
  const filteredBrands = useMemo(() => {
    let list = [...BRANDS_LIST];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.popularItems.some((item) => item.toLowerCase().includes(q)),
      );
    }

    // Filter by Category Type
    if (activeCategory !== "all") {
      list = list.filter((b) => b.categoryType === activeCategory);
    }

    // Filter by Badge / Partner Status
    if (activeBadge !== "all") {
      list = list.filter((b) => b.badge === activeBadge);
    }

    // Sort
    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "count") {
      list.sort((a, b) => b.productCount - a.productCount);
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [searchQuery, activeCategory, activeBadge, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Top Hero Banner Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-100/90 shadow-2xs min-h-[190px] sm:min-h-[210px] lg:min-h-[225px] flex items-center bg-[#EBF5FC]">
        {/* Ambient Decorative Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-blue-100/50 rounded-full blur-2xl pointer-events-none -z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EBF5FC]/95 via-[#EBF5FC]/80 sm:via-[#EBF5FC]/60 to-transparent pointer-events-none lg:w-3/5" />

        <div className="relative z-10 p-4 sm:p-5 lg:px-7 lg:py-4 max-w-2xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#00AEEF] bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full inline-block shadow-2xs border border-sky-100/80">
              OFFICIAL HARDWARE ECOSYSTEM
            </span>
            <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
              100% Genuine Certified OEM Supply
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
            Direct OEM Brand Partners &amp; Distributors
          </h1>

          <p className="text-[11px] sm:text-xs text-slate-600 max-w-lg leading-relaxed font-medium">
            Authentic microcontrollers, Edge AI computing modules, mechatronics platforms,
            sensors, and avionics flight stacks with manufacturer warranty.
          </p>

          {/* 4 Trust Feature Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
              <div className="w-6 h-6 rounded-md bg-sky-50 text-[#00AEEF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-bold text-slate-900">
                  100% Genuine
                </div>
                <div className="text-[8.5px] font-medium text-slate-500">
                  OEM Sourced
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-bold text-slate-900">
                  GST Invoiced
                </div>
                <div className="text-[8.5px] font-medium text-slate-500">
                  Tax Compliant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-bold text-slate-900">
                  Pan-India
                </div>
                <div className="text-[8.5px] font-medium text-slate-500">
                  Rapid Dispatch
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xs">
              <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-bold text-slate-900">
                  Warranty
                </div>
                <div className="text-[8.5px] font-medium text-slate-500">
                  OEM Supported
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Filter, Search & Sorting Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands, microcontrollers, AI boards (e.g. Jetson, ESP32, Pixhawk)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9.5 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Selectors: Status Filter & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Badge Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={activeBadge}
                onChange={(e) => setActiveBadge(e.target.value)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="all">All Partnerships</option>
                <option value="Official Distributor">Official Distributors</option>
                <option value="Authorized Partner">Authorized Partners</option>
                <option value="Proprietary Hardware">Proprietary Hardware</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="popular">Featured First</option>
                <option value="name">Name (A-Z)</option>
                <option value="count">Most Products</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#00AEEF] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Results Count Sub-Row ── */}
      <div className="flex items-center justify-between px-1 -mt-3">
        <span className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-extrabold">{filteredBrands.length}</span> verified brand partners
        </span>
        {(searchQuery || activeCategory !== "all" || activeBadge !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
              setActiveBadge("all");
            }}
            className="text-xs font-bold text-[#00AEEF] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── 4. Brand Partner Cards Grid ── */}
      {filteredBrands.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-700">
            No brand partners match your current search criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
              setActiveBadge("all");
            }}
            className="text-xs font-black text-[#00AEEF] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredBrands.map((brand, idx) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex flex-col justify-between hover:border-[#00AEEF] hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 relative group h-full">
                <div className="space-y-3.5">
                  {/* Card Header: Brand Monogram Box + Partner Badge & Country */}
                  <div className="flex items-start justify-between gap-2">
                    {/* Brand Monogram Avatar */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundColor: brand.accentColor }}
                    >
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Status Badge */}
                      <span
                        className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          brand.badge === "Official Distributor"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : brand.badge === "Proprietary Hardware"
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-sky-50 text-[#00AEEF] border-sky-200"
                        }`}
                      >
                        {brand.badge}
                      </span>

                      {/* Country Flag Badge */}
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <span>{brand.flag}</span>
                        <span>{brand.country}</span>
                      </span>
                    </div>
                  </div>

                  {/* Brand Title & Technical Specialty */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#00AEEF] transition-colors flex items-center gap-1.5">
                      <span>{brand.name}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-[#00AEEF] block mt-0.5">
                      {brand.category}
                    </span>
                  </div>

                  {/* Brand Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {brand.description}
                  </p>

                  {/* Popular Hardware Tags */}
                  <div className="pt-1">
                    <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                      Popular Hardware:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {brand.popularItems.map((item, i) => (
                        <span
                          key={i}
                          className="bg-slate-50 group-hover:bg-sky-50/70 border border-slate-100 group-hover:border-sky-100 text-slate-600 group-hover:text-slate-800 text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-colors"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Product Count & Action Link */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    <span className="text-slate-900 font-extrabold">{brand.productCount}+</span> Products
                  </span>

                  <Link
                    href={`/products?brand=${encodeURIComponent(brand.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-black text-[#00AEEF] group-hover:text-[#0086B8] hover:underline transition-all group/link"
                  >
                    <span>Browse Hardware</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 5. Institutional & Brand Partnership CTA Banner ── */}
      <div className="bg-gradient-to-r from-[#00AEEF] via-[#0096D6] to-[#1E56A0] text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block">
            OEM PARTNERSHIP &amp; B2B PROCUREMENT
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Want to Onboard Your Hardware Brand with Prayog India?
          </h3>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
            We partner directly with genuine component manufacturers, mechatronics innovators,
            and institutional lab vendors with pan-India distribution and dedicated maker support.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#FFC20E] text-slate-950 font-black px-6 py-3.5 rounded-full text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md shrink-0 cursor-pointer active:scale-95"
        >
          <span>Contact Brand Team</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
