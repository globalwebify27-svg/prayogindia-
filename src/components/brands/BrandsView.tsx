"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Search, ArrowRight } from "lucide-react";

interface BrandInfo {
  name: string;
  slug: string;
  country: string;
  category: string;
  description: string;
  badge: "Official Distributor" | "Authorized Partner" | "Proprietary Hardware";
  productCount: number;
}

const BRANDS_LIST: BrandInfo[] = [
  {
    name: "Arduino",
    slug: "arduino",
    country: "Italy",
    category: "Microcontrollers & Dev Boards",
    description:
      "Official open-source electronics platform based on easy-to-use hardware and software.",
    badge: "Authorized Partner",
    productCount: 8,
  },
  {
    name: "Raspberry Pi",
    slug: "raspberry-pi",
    country: "United Kingdom",
    category: "Single Board Computers",
    description:
      "High-performance single-board computers for education, IoT, and embedded AI development.",
    badge: "Official Distributor",
    productCount: 4,
  },
  {
    name: "NVIDIA",
    slug: "nvidia",
    country: "USA",
    category: "Edge AI & Embedded Computing",
    description:
      "Leading edge AI platforms including Jetson Orin Nano for computer vision and robotics.",
    badge: "Authorized Partner",
    productCount: 3,
  },
  {
    name: "Espressif Systems",
    slug: "espressif",
    country: "China",
    category: "IoT & Wireless Modules",
    description:
      "World-renowned Wi-Fi and Bluetooth wireless microcontrollers (ESP32, ESP32-S3, ESP8266).",
    badge: "Authorized Partner",
    productCount: 7,
  },
  {
    name: "STMicroelectronics",
    slug: "stmicroelectronics",
    country: "Switzerland",
    category: "ARM Cortex Microcontrollers",
    description:
      "Industry-standard STM32 32-bit ARM Cortex microcontrollers and Nucleo prototyping boards.",
    badge: "Authorized Partner",
    productCount: 5,
  },
  {
    name: "Holybro & Pixhawk",
    slug: "holybro",
    country: "USA / Global",
    category: "UAV & Autonomous Flight",
    description:
      "Mission-critical drone autopilots, Pixhawk 6C flight controllers, and precision GNSS receivers.",
    badge: "Authorized Partner",
    productCount: 6,
  },
  {
    name: "Prayog Tech Labs",
    slug: "prayog",
    country: "India",
    category: "Robotics & STEM Lab Systems",
    description:
      "Proprietary Indian-engineered mechatronics platforms, ATL Innovation Mega Kits, and SLAM rovers.",
    badge: "Proprietary Hardware",
    productCount: 15,
  },
  {
    name: "SpeedyBee & Foxeer",
    slug: "speedybee",
    country: "Global",
    category: "FPV & Racing Drone Stacks",
    description:
      "High-power F405 flight controller stacks, 55A ESCs, and low-latency micro FPV cameras.",
    badge: "Authorized Partner",
    productCount: 4,
  },
];

export const BrandsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = BRANDS_LIST.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.country.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              SECTION 3.0 BRANDS DIRECTORY
            </span>
            <span className="text-xs text-slate-400 font-bold">
              100% Genuine Certified Hardware
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Official Hardware Brand Partners
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
            Explore world-class robotics, microcontroller, and autonomous drone
            brands with official warranty, GST tax invoicing, and pan-India
            technical support.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-semibold">
            100% OEM Authenticity Guarantee
          </span>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand partners (e.g. Arduino, Raspberry Pi, Jetson, Holybro)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 focus:outline-none focus:border-[#00AEEF]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <span className="text-xs font-extrabold text-slate-500 shrink-0 pr-2">
          Showing {filteredBrands.length} Brand Partners
        </span>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredBrands.map((brand) => (
          <div
            key={brand.slug}
            className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:border-[#00AEEF] hover:shadow-xl hover:shadow-sky-500/10 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    brand.badge === "Official Distributor"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : brand.badge === "Proprietary Hardware"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-blue-50 text-[#00AEEF] border-blue-200"
                  }`}
                >
                  {brand.badge}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {brand.country}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#00AEEF] transition-colors">
                  {brand.name}
                </h3>
                <span className="text-[11px] font-bold text-[#00AEEF] block mt-0.5">
                  {brand.category}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {brand.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {brand.productCount}+ Components
              </span>
              <Link
                href={`/products?category=${encodeURIComponent(brand.name)}`}
                className="text-xs font-extrabold text-[#00AEEF] group-hover:text-[#0086B8] flex items-center gap-1 group-hover:translate-x-1 transition-all"
              >
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
