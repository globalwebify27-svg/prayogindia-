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
  ShieldCheck,
  Wifi,
  Navigation,
  Search,
  Cpu,
  X,
} from "lucide-react";
import { PrayogLogo } from "@/components/PrayogLogo";
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50/20 text-slate-900 flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* 1. Top Navbar */}
      <nav className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <PrayogLogo size="sm" showSubtitle={false} />
            </Link>
            <div className="hidden sm:block h-4 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200/60">
              <Store className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Retail Experience Centers</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Terminal Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>4 Kiosks Live &amp; Online</span>
            </div>

            {/* Back to Online Store button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>← Back to Online Store</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <div className="relative pt-10 sm:pt-14 pb-8 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle background glow */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Visit Our Store
        </h1>

        <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Explore innovative hardware, robotics, and electronic components in person.
        </p>

        {/* Unified Search & Location Filter Toolbar */}
        <div className="mt-8 max-w-4xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm backdrop-blur-md">
            {/* Horizontal Location Chips (No line wrap) */}
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
                        ? "bg-[#2563EB] text-white shadow-sm font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>{filter.label}</span>
                    {filter.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white font-black"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
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
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner focus:ring-2 focus:ring-blue-500/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
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
      <div id="store-locations" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pb-12 w-full scroll-mt-20">
        {filteredStoreIds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Store className="w-9 h-9 text-slate-400 mx-auto mb-2.5" />
            <p className="text-slate-600 text-xs sm:text-sm font-semibold">
              No store location matches your search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCity("all");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-[#2563EB] hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {filteredStoreIds.map((storeId) => {
              const store = STORES[storeId];
              const meta = STORE_METADATA[storeId];
              const cityName = store.city.split(",")[0].trim().toUpperCase();

              return (
                <div
                  key={storeId}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col group shadow-xs"
                >
                  {/* Visual Header */}
                  <div className="h-36 sm:h-40 relative overflow-hidden bg-slate-900">
                    <Image
                      src={meta.image}
                      alt={store.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-white/60 shadow-xs text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                        <Cpu className="w-3 h-3 text-slate-800" />
                        <span>ROBOTICS &amp; ELECTRONICS</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00C274] text-white font-black text-[10px] uppercase tracking-wider shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>OPEN NOW</span>
                      </div>
                    </div>

                    {/* Bottom Store Title overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF] drop-shadow-xs block">
                        {cityName}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-100 transition-colors leading-tight drop-shadow-sm">
                        {store.shortName}
                      </h2>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 gap-3 bg-white">
                    {/* Store Address & Contact Details */}
                    <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-xl p-3 sm:p-3.5 space-y-2.5">
                      {/* Address */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100/70 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            STORE ADDRESS
                          </span>
                          <p className="text-slate-800 font-bold text-[11px] sm:text-xs leading-snug">
                            {store.address}
                          </p>
                        </div>
                      </div>

                      {/* Phone & Timings */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-200/60 items-center">
                        {/* Mobile / Phone */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100/70 text-[#2563EB] flex items-center justify-center shrink-0">
                            <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              MOBILE / PHONE
                            </span>
                            <a
                              href={`tel:${store.phone}`}
                              className="font-mono text-slate-900 font-bold text-[11px] sm:text-xs hover:text-[#2563EB] transition-colors truncate block"
                            >
                              {store.phone}
                            </a>
                          </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200 sm:pl-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              OPERATING HOURS
                            </span>
                            <span className="text-slate-700 font-semibold text-[11px] sm:text-xs block leading-tight">
                              {store.timings}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Embedded Store Map */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs px-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800 uppercase tracking-wider">
                          <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>STORE LOCATION</span>
                        </div>
                        <a
                          href={store.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:underline font-bold text-[11px] flex items-center gap-1"
                        >
                          <span>Get directions</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-28 sm:h-32 w-full shadow-inner">
                        <iframe
                          title={`${store.name} Map Location`}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            store.shortName + ", " + store.address
                          )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          className="w-full h-full border-0 filter contrast-[1.02]"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>

                    {/* Outlined Action Button */}
                    <div className="pt-0.5">
                      <Link
                        href={`/walk-in/${store.id}`}
                        className="w-full py-2.5 px-3 rounded-full border border-slate-300 hover:border-[#2563EB] hover:bg-blue-50/40 text-slate-800 hover:text-[#2563EB] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
                      >
                        <span>View Store Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              How the In-Store Terminal Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Engineered for zero-waiting time and instant counter pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Select &amp; Launch
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Choose your physical store location above or on our in-store
                  touchscreen terminal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Browse Live Shelf Stock
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inspect verified hardware specs, test robotics modules, and add
                  components to your terminal cart.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Counter Pickup &amp; Pay
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Present your order token at the checkout counter. Pay via UPI,
                  Card, or Cash and collect your hardware immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">
              Authorized Prayog India Omnichannel Retail Terminal Network
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Customer Helpline:{" "}
              <a
                href="tel:+91912345678"
                className="text-[#2563EB] hover:underline font-bold"
              >
                +91 912345678
              </a>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">
                Store Sync: Active
              </span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
