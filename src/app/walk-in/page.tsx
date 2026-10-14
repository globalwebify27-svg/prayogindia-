"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Store,
  Tablet,
  ShieldCheck,
  Wifi,
  CheckCircle2,
  Navigation,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { STORES, ALL_STORE_IDS, StoreId } from "@/data/storeConfig";

interface StoreDisplayMeta {
  tagline: string;
  description: string;
  image: string;
  badge: string;
  isFlagship?: boolean;
  features: string[];
}

const STORE_METADATA: Record<StoreId, StoreDisplayMeta> = {
  ranchi: {
    tagline: "National Flagship & Central Prototyping Hub",
    description:
      "Our premier 3,500 sq.ft facility featuring live drone flight arena, 3D prototyping farm, component dispensing bar, and instant counter checkout.",
    image: "/images/drone_banner_lab.jpg",
    badge: "Flagship Central Hub",
    isFlagship: true,
    features: [
      "Live Drone Flight Cage",
      "Central Inventory Dispatch",
      "15-Min Counter Pickup",
      "Resident Robotics Engineers",
    ],
  },
  patna: {
    tagline: "Robotics & STEM Education Center",
    description:
      "Dedicated hands-on learning center with testing benches for Arduino, Raspberry Pi, robotics kits, and school ATL lab hardware.",
    image: "/images/robot_banner_stem.jpg",
    badge: "STEM & Robotics Lab",
    features: [
      "Live Breadboard Testing Bench",
      "STEM Prototyping Kits",
      "Instant Counter Pickup",
      "Academic Lab Consultations",
    ],
  },
  delhi: {
    tagline: "NCR Industrial Prototyping & UAV Center",
    description:
      "Advanced engineering hub specializing in commercial drone autopilots, industrial sensors, BLDC propulsion, and high-torque servos.",
    image: "/images/robotics_banner.jpg",
    badge: "Innovation & UAV Hub",
    features: [
      "Aerospace & Flight Hardware",
      "Industrial Automation Stock",
      "Immediate Counter Collection",
      "Enterprise B2B Desk",
    ],
  },
  mumbai: {
    tagline: "Western Robotics & IoT Solutions Studio",
    description:
      "State-of-the-art tech experience studio catering to IoT makers, industrial automation engineers, and university tech teams.",
    image: "/images/hero_3d_stage.jpg",
    badge: "IoT & Automation Studio",
    features: [
      "Microcontroller Workbench",
      "IoT & Wireless Modules",
      "Instant Counter Collection",
      "Component Consultation",
    ],
  },
};

const CITY_FILTERS = [
  { id: "all", label: "All Hubs", count: 4 },
  { id: "ranchi", label: "Ranchi" },
  { id: "patna", label: "Patna" },
  { id: "delhi", label: "Delhi NCR" },
  { id: "mumbai", label: "Mumbai" },
];

export default function WalkInGatewayPage() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStoreIds = useMemo(() => {
    return ALL_STORE_IDS.filter((id) => {
      const store = STORES[id];
      const meta = STORE_METADATA[id];

      if (selectedCity !== "all" && id !== selectedCity) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(query);
        const matchesCity = store.city.toLowerCase().includes(query);
        const matchesAddress = store.address.toLowerCase().includes(query);
        const matchesTag = meta?.tagline.toLowerCase().includes(query);
        return matchesName || matchesCity || matchesAddress || matchesTag;
      }

      return true;
    });
  }, [selectedCity, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col font-sans selection:bg-[#00AEEF] selection:text-slate-950">
      {/* 1. Top Navbar */}
      <nav className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/images/prayog-logo-white.png"
                alt="Prayog India"
                width={140}
                height={32}
                className="h-7 w-auto object-contain"
                priority
              />
            </Link>
            <div className="hidden sm:block h-4 w-px bg-slate-800" />
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Store className="w-3.5 h-3.5 text-[#00AEEF]" />
              <span>Retail Experience Centers</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Terminal Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>4 Kiosks Live &amp; Online</span>
            </div>

            {/* Back to Online Store button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <span>← Back to Online Store</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <div className="relative pt-10 pb-8 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00AEEF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00AEEF]/10 border border-[#00AEEF]/30 text-[#00AEEF] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#00AEEF]" />
          <span>Interactive In-Store Kiosk Network</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4">
          Visit a Prayog Experience Center
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Select your local branch below to launch the self-service in-store terminal.
          Browse real-time shelf stock, inspect robotics modules hands-on, and complete counter checkout with staff assistance.
        </p>

        {/* Unified Search & Location Filter Toolbar */}
        <div className="mt-8 max-w-4xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2 rounded-2xl shadow-xl backdrop-blur-md">
            {/* Horizontal Location Chips (No line wrap!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto p-0.5">
              {CITY_FILTERS.map((filter) => {
                const isActive = selectedCity === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setSelectedCity(filter.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-[#00AEEF] text-slate-950 shadow-md font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <span>{filter.label}</span>
                    {filter.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-slate-950/20 text-slate-950 font-black"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {filter.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Matching Height Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, area, or store..."
                className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-[#00AEEF] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Clear Search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Store Cards Grid */}
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 pb-12 w-full">
        {filteredStoreIds.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Store className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold">
              No store location matches your search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCity("all");
                setSearchQuery("");
              }}
              className="mt-4 text-xs text-[#00AEEF] hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStoreIds.map((storeId) => {
              const store = STORES[storeId];
              const meta = STORE_METADATA[storeId];
              const isCentral = Boolean(store.isCentralInventory);

              return (
                <div
                  key={storeId}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-[#00AEEF]/5 transition-all duration-300 flex flex-col group"
                >
                  {/* Visual Header */}
                  <div className="h-44 sm:h-52 relative overflow-hidden bg-slate-950">
                    <Image
                      src={meta.image}
                      alt={store.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      {isCentral ? (
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          ★ Central Hub
                        </span>
                      ) : (
                        <span className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {meta.badge}
                        </span>
                      )}

                      <span className="bg-emerald-500/90 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Open Now</span>
                      </span>
                    </div>

                    {/* Bottom Store Title overlay */}
                    <div className="absolute bottom-4 left-5 right-5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#00AEEF]">
                        {store.city}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#00AEEF] transition-colors leading-tight">
                        {store.shortName}
                      </h2>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 gap-4">
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {meta.description}
                    </p>

                    {/* In-Store Capabilities */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                      {meta.features.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-center gap-1.5 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Essential Location Details */}
                    <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-400">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
                        <span className="leading-snug text-slate-300">
                          {store.address}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-[#00AEEF]" />
                          <a
                            href={`tel:${store.phone}`}
                            className="font-mono hover:text-[#00AEEF] transition-colors"
                          >
                            {store.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{store.timings}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-2 flex items-center gap-2">
                      <Link
                        href={`/walk-in/${store.id}`}
                        className="flex-1 bg-[#00AEEF] hover:bg-[#38BDF8] active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/20 transition-all cursor-pointer"
                      >
                        <Tablet className="w-4 h-4" />
                        <span>Launch Store Terminal</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>

                      <a
                        href={store.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                        aria-label="Open in Google Maps"
                        title="Open in Google Maps"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. 3-Step In-Store Shopping Guide */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-14 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              How the In-Store Terminal Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Engineered for zero-waiting time and instant counter pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00AEEF]/10 border border-[#00AEEF]/30 text-[#00AEEF] flex items-center justify-center font-black text-sm shrink-0">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Select &amp; Launch
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose your physical store location above or on our in-store
                  touchscreen terminal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00AEEF]/10 border border-[#00AEEF]/30 text-[#00AEEF] flex items-center justify-center font-black text-sm shrink-0">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Browse Live Shelf Stock
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect verified hardware specs, test robotics modules, and add
                  components to your terminal cart.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00AEEF]/10 border border-[#00AEEF]/30 text-[#00AEEF] flex items-center justify-center font-black text-sm shrink-0">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Counter Pickup &amp; Pay
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Present your order token at the checkout counter. Pay via UPI,
                  Card, or Cash and collect your hardware immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Authorized Prayog India Omnichannel Retail Terminal Network
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Customer Helpline:{" "}
              <a
                href="tel:+91912345678"
                className="text-[#00AEEF] hover:underline font-bold"
              >
                +91 912345678
              </a>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">
                Store Sync: Active
              </span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
