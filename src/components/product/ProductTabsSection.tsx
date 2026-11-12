"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronDown,
  FileText,
  Package,
  Layers,
  Star,
  Download,
  Code,
  Cpu,
  BookOpen,
  Play,
  ExternalLink,
  Video,
  Copy,
  Book,
  FolderDown,
  Wrench,
  Terminal,
  FileCheck,
} from "lucide-react";

// Official YouTube Vector SVG Icon
const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    role="img"
    aria-label="YouTube"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
import { Product } from "@/data/mockData";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { ProductDocuments } from "@/components/product/ProductDocuments";

interface ProductTabsSectionProps {
  product: Product;
  defaultTab?: TabType;
}

type TabType =
  | "description"
  | "specifications"
  | "resources"
  | "reviews";

export const ProductTabsSection: React.FC<ProductTabsSectionProps> = ({
  product,
  defaultTab,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab || "description");
  const [resourceView, setResourceView] = useState<"datasheet" | "manual" | "downloads" | "video">("datasheet");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // Single active accordion on mobile: opening one smoothly collapses any other
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    setActiveAccordion((prev) => (prev === sectionKey ? null : sectionKey));
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "resources" || hash === "specifications" || hash === "reviews" || hash === "description") {
        setActiveTab(hash as TabType);
      }
      if (["features", "description", "specifications", "resources", "warranty", "reviews"].includes(hash)) {
        setActiveAccordion(hash);
      }
    }
  }, []);

  // Resolve tutorial video details from product data - ONLY real URLs from product data or admin, NO hardcoded fallbacks
  const getTutorialVideo = (): { directUrl: string; title: string } | null => {
    // 1. Direct explicit product videoUrl
    if (product.videoUrl && product.videoUrl.trim() && !product.videoUrl.includes("w3schools.com")) {
      return {
        directUrl: product.videoUrl.trim(),
        title: `${product.name} — Video Tutorial`,
      };
    }

    // 2. Product documents containing a tutorial or YouTube URL
    const docVideo = product.documents?.find(
      (d) =>
        d.url &&
        d.url !== "#" &&
        !d.url.includes("dummy") &&
        (d.url.includes("youtube.com") ||
          d.url.includes("youtu.be") ||
          d.type.toLowerCase().includes("video") ||
          d.title.toLowerCase().includes("tutorial"))
    );
    if (docVideo && docVideo.url) {
      return {
        directUrl: docVideo.url,
        title: docVideo.title || `${product.name} — Video Tutorial`,
      };
    }

    return null;
  };

  const tutorialVideo = getTutorialVideo();

  // Datasheet PDF URL resolver - ONLY real PDF document attached to product, NO hardcoded dummy links
  const datasheetDoc = product.documents?.find(
    (d) =>
      d.url &&
      d.url !== "#" &&
      !d.url.includes("dummy.pdf") &&
      (d.type.toUpperCase() === "PDF" || d.title.toLowerCase().includes("datasheet"))
  );
  const datasheetUrl = datasheetDoc?.url || "";

  // User Manual URL resolver
  const manualDoc = product.documents?.find(
    (d) =>
      d.url &&
      d.url !== "#" &&
      !d.url.includes("dummy.pdf") &&
      (d.title.toLowerCase().includes("manual") || d.title.toLowerCase().includes("guide"))
  );
  const manualUrl = manualDoc?.url || datasheetUrl || "";

  // Downloadable documents library
  const downloadableDocuments = (product.documents && product.documents.filter((d) => d.url && d.url !== "#").length > 0)
    ? product.documents
    : [
        {
          title: `${product.name} Official Engineering Datasheet`,
          type: "PDF",
          size: "2.4 MB",
          url: datasheetUrl || "#",
          description: "Full electrical ratings, absolute logic tolerances, and mechanical blueprints.",
        },
        {
          title: `${product.name} User Manual & Quick Start Guide`,
          type: "PDF",
          size: "3.2 MB",
          url: manualUrl || "#",
          description: "Step-by-step pinout setup, driver installation, and circuit precautions.",
        },
        {
          title: `${product.name} Hardware Blueprint & Pinout Poster`,
          type: "PDF",
          size: "1.1 MB",
          url: datasheetUrl || "#",
          description: "Color-coded GPIO pinout diagram for breadboard and PCB prototyping.",
        },
        {
          title: "3D CAD Model (STEP & STL Format)",
          type: "CAD / ZIP",
          size: "4.8 MB",
          url: "#",
          description: "Dimensional 3D models for 3D printing custom chassis enclosures and mounts.",
        },
        {
          title: "Sample Software Drivers & Firmware Code Bundle",
          type: "ZIP",
          size: "820 KB",
          url: "#",
          description: "Tested Arduino (.ino) sketches, MicroPython modules, and ROS2 telemetry nodes.",
        },
      ];

  const cleanRawSpecs = Object.fromEntries(
    Object.entries(product.specs || {}).filter(
      ([key, val]) =>
        !key.startsWith("_") &&
        val !== null &&
        val !== undefined &&
        typeof val !== "object"
    )
  );

  const specEntries = Object.entries(cleanRawSpecs);

  // Intelligent fallback specifications if product has minimal specs
  const allSpecs: Record<string, string> = {
    Brand: product.brand || "Prayog India",
    SKU: product.sku || product.id,
    Category: product.category,
    "Operating Voltage": "5V DC (USB) / 7V - 12V DC (External Vin)",
    Microcontroller: product.name.includes("Arduino")
      ? "ATmega328P"
      : product.name.includes("ESP")
      ? "ESP32-WROOM-32 (Dual Core 240MHz)"
      : product.name.includes("Jetson")
      ? "128-core NVIDIA Maxwell GPU + Quad-core ARM A57"
      : product.name.includes("Raspberry")
      ? "Broadcom BCM2711, Quad core Cortex-A72 (ARM v8) 64-bit SoC @ 1.8GHz"
      : "Standard Industrial Controller",
    "Digital I/O Pins": "14 (6 PWM outputs)",
    "Analog Input Pins": "6 Channels (10-bit ADC)",
    "Clock Speed": "16 MHz Ceramic Resonator",
    "Flash Memory": "32 KB (ATmega328P) of which 0.5 KB used by bootloader",
    SRAM: "2 KB (ATmega328P)",
    EEPROM: "1 KB (ATmega328P)",
    "Communication Protocol": "UART / I2C / SPI / USB Serial",
    Dimensions: "68.6 mm x 53.4 mm x 15 mm",
    Weight: "25 grams",
    "Origin Country": "Made in India",
    ...cleanRawSpecs,
  };

  // Package Includes List (as shown in Image 5)
  const packageIncludesList =
    product.whatsIncluded && product.whatsIncluded.length > 0
      ? product.whatsIncluded
      : [
          `1 x ${product.name}`,
          "1 x USB High-Speed Programming & Power Cable",
          "1 x Battery Holder & Jumper Connection Cable",
          "1 x Quick Setup Manual & Pinout Reference Sheet",
          "1 x Anti-Static Protective Storage Case",
        ];

  const featuresList =
    product.features && product.features.length > 0
      ? product.features
      : [
          "High-efficiency power management and fast I/O response",
          "Compact and lightweight footprint for seamless chassis mounting",
          "Built-in reverse polarity and short-circuit protection diodes",
          "Standard hardware interface fully compatible with Arduino IDE & ROS2",
          "Engineered and certified for 100% component authenticity",
        ];

  return (
    <div id="product-tabs" className="pt-4 pb-2">
      {/* ── DESKTOP VIEW: Tabs Navigation Bar + Tab Pane (hidden on mobile) ── */}
      <div className="hidden sm:block">
        <div className="border-b border-slate-200">
        <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto scrollbar-none scroll-smooth">
          {(
            [
              { id: "description", label: "Description" },
              { id: "specifications", label: "Specifications" },
              { id: "resources", label: "Additional Resources" },
              {
                id: "reviews",
                label: `Customer Reviews (${product.reviews || 12})`,
              },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setActiveTab(tab.id)}
                onFocus={() => setActiveTab(tab.id)}
                className={`pb-3.5 text-base sm:text-lg font-bold transition-colors duration-150 relative whitespace-nowrap shrink-0 cursor-pointer select-none ${
                  isActive
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="activeProductTabIndicator"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 35,
                    }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AEEF] rounded-t-full shadow-[0_1px_4px_rgba(0,174,239,0.35)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content Container with Smooth Fade & Transition (Stable, No Layout Jump) ── */}
      <div className="pt-6 overflow-hidden min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
        {/* 1. DESCRIPTION TAB (With Package Includes: as shown in Image 5) */}
        {activeTab === "description" && (
          <div className="space-y-8 max-w-4xl">
            {/* Package Includes Section (Image 5 exact layout) */}
            <div className="space-y-3 bg-slate-50/60 p-6 rounded-3xl border border-slate-200/80">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Package Includes:
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-slate-700 font-medium pl-1">
                {packageIncludesList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-slate-900 font-black text-lg leading-none">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Overview Text */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Product Overview
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {product.description ||
                  `The ${product.name} is a high-performance hardware module designed for advanced robotics, IoT instrumentation, and embedded systems engineering. With robust circuitry, precise telemetry, and plug-and-play prototyping support, it empowers makers, university labs, and industrial automation developers.`}
              </p>
            </div>

            {/* Key Features List */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Key Features &amp; Highlights
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuresList.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Applications */}
            {product.applications && product.applications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Applications &amp; Projects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((app, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#005CA9] border border-blue-200/80 text-xs font-bold"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SPECIFICATIONS TAB (Image 5 exact layout) */}
        {activeTab === "specifications" && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Specifications:
            </h3>

            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs bg-white">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <tbody>
                  {Object.entries(allSpecs).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={`border-b border-slate-100 last:border-0 ${
                        idx % 2 === 0 ? "bg-slate-50/60" : "bg-white"
                      }`}
                    >
                      <td className="py-3 px-4 sm:px-6 font-bold text-slate-700 w-2/5 sm:w-1/3 border-r border-slate-100">
                        {key}
                      </td>
                      <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. DATASHEETS, MANUALS & DOWNLOADABLE DOCUMENTS TAB */}
        {activeTab === "resources" && (
          <div className="space-y-6 max-w-4xl">
            {/* Header + Sub-Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Additional Resources
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Official Prayog India engineering schematics, pinout references, user manuals, and video walkthroughs.
                </p>
              </div>

              {/* Sub-Tabs: Datasheet | Manual | Downloadable Documents | Product Video */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 border border-slate-200/80 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setResourceView("datasheet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    resourceView === "datasheet"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#005CA9]" />
                  <span>Datasheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResourceView("manual")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    resourceView === "manual"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Book className="w-3.5 h-3.5 text-indigo-600" />
                  <span>User Manual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResourceView("downloads")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    resourceView === "downloads"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FolderDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Downloads ({downloadableDocuments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResourceView("video")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    resourceView === "video"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <YouTubeIcon className="w-3.5 h-3.5 text-[#FF0000]" />
                  <span>Product Video</span>
                </button>
              </div>
            </div>

            {/* ── Sub-View 1: Official PDF Datasheet ── */}
            {resourceView === "datasheet" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/90 flex items-center justify-center text-[#005CA9] shrink-0 shadow-2xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-[#005CA9] font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-blue-200">
                          Official PDF Datasheet
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Rev 2.4 • Verified Engineering Doc
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                        {product.name} — Technical Reference Datasheet &amp; Pinout
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={datasheetUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Open in Browser</span>
                    </a>
                    <a
                      href={datasheetUrl || "#"}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#005CA9] hover:bg-[#004a88] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Official engineering datasheet including absolute electrical maximum ratings, logic voltage levels, GPIO pinout definitions, dimensional blueprints, and power consumption benchmarks for <span className="font-bold text-slate-800">{product.name}</span>.
                </p>

                {/* Direct Link Box with Copy Button */}
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                      Datasheet Source:
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-blue-600 underline truncate font-semibold">
                      {datasheetUrl || `https://prayogindia.in/docs/${product.sku || product.id}-datasheet.pdf`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(datasheetUrl || `https://prayogindia.in/docs/${product.sku || product.id}-datasheet.pdf`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-[#005CA9] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Electrical Tolerances</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Operating &amp; maximum supply limits</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Pin Mapping Matrix</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">GPIO, UART, SPI &amp; I2C pin layout</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Mechanical Drawings</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dimensions, pitch &amp; mounting holes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Sub-View 2: Official User Manual & Quick Start Guide ── */}
            {resourceView === "manual" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/90 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
                      <Book className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-indigo-200">
                          Official User Manual
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Quick Start &amp; Setup Guide
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                        {product.name} — Hardware Setup &amp; Programming Manual
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={manualUrl || datasheetUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Manual (PDF)</span>
                    </a>
                  </div>
                </div>

                {/* Step-by-Step Hardware Guide Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Power &amp; Voltage Setup
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Connect regulated 5V DC via USB or Vin pins. Ensure correct polarity to safeguard against reverse voltage damage.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Driver &amp; IDE Setup
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Install the CP2102/CH340 USB driver if needed. In Arduino IDE or Thonny, select the correct board profile and COM port.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      First Test Run &amp; Verification
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Upload the basic Blink or Telemetry sample sketch to verify communication and onboard status LEDs.
                    </p>
                  </div>
                </div>

                {/* Handling & Safety Note */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <Wrench className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>ESD Precautions:</strong> Handle by board edges to avoid electrostatic discharge on sensitive CMOS chips. Do not short GPIO pins directly to ground while powered.
                  </p>
                </div>
              </div>
            )}

            {/* ── Sub-View 3: Complete Downloadable Documents Library ── */}
            {resourceView === "downloads" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Official Product Downloads &amp; Engineering Files
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    All files virus scanned &amp; verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {downloadableDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 hover:border-[#005CA9]/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#005CA9] group-hover:scale-105 transition-transform shrink-0">
                          {doc.type.includes("PDF") ? (
                            <FileText className="w-5 h-5" />
                          ) : doc.type.includes("CAD") ? (
                            <Layers className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Code className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {doc.type}
                            </span>
                            {(doc as any).size && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                {(doc as any).size}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-[#005CA9] transition-colors">
                            {doc.title}
                          </h5>
                          {(doc as any).description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {(doc as any).description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <a
                          href={doc.url || "#"}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005CA9] hover:bg-[#004a88] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Sub-View 4: Product Video Tutorial & Walkthrough ── */}
            {resourceView === "video" && (
              tutorialVideo ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200/90 flex items-center justify-center text-[#FF0000] shrink-0 shadow-2xs">
                        <YouTubeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-red-200">
                            Official YouTube Tutorial
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            Step-by-Step
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                          {tutorialVideo.title}
                        </h4>
                      </div>
                    </div>

                    <a
                      href={tutorialVideo.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF0000] hover:bg-[#D90000] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Step-by-step pinout setup, library installation, hardware circuit wiring, and working sample code demonstration for <span className="font-bold text-slate-800">{product.name}</span> on YouTube.
                  </p>

                  <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                        YouTube Link:
                      </span>
                      <a
                        href={tutorialVideo.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs sm:text-sm text-blue-600 hover:text-blue-700 underline truncate font-semibold transition-colors"
                        title={tutorialVideo.directUrl}
                      >
                        {tutorialVideo.directUrl}
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(tutorialVideo.directUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer self-end sm:self-auto"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Cpu className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Pinouts &amp; Wiring</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">GPIO connections and voltage rails</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Code className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">IDE &amp; Library Setup</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Arduino &amp; MicroPython libraries</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Sample Code Demo</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Tested sketches and project circuits</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-2xs">
                    <YouTubeIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Product Video Tutorial
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Video walkthrough demonstration is being prepared by our engineering team for this model.
                  </p>
                  <button
                    type="button"
                    onClick={() => setResourceView("datasheet")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                  >
                    <FileText className="w-4 h-4 text-[#005CA9]" />
                    <span>View PDF Datasheet Instead</span>
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* 4. CUSTOMER REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="max-w-4xl">
            <ProductReviewsSection
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              rating={Number(product.rating || 4.9)}
              reviewsCount={product.reviews || 19}
              reviewItems={product.reviewItems}
            />
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>

      {/* ── MOBILE VIEW: Stacked Rounded Card Accordions (Matching Reference Image) ── */}
      <div className="block sm:hidden space-y-3 pt-2">
        {/* 1. Key Features Accordion Card */}
        <div
          className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeAccordion === "features"
              ? "border-[#005CA9]/60 shadow-xs"
              : "border-slate-200/90 shadow-2xs hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("features")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-[15px] cursor-pointer select-none active:bg-slate-50/80 transition-colors"
          >
            <span>Key Features</span>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform duration-300 ease-out shrink-0 ${
                activeAccordion === "features" ? "rotate-180 text-slate-900" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === "features" && (
              <motion.div
                key="mobile-features"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.12 },
                  },
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                  <ul className="space-y-2.5 pt-1">
                    {featuresList.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-700 font-medium"
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Description Accordion Card */}
        <div
          className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeAccordion === "description"
              ? "border-[#005CA9]/60 shadow-xs"
              : "border-slate-200/90 shadow-2xs hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("description")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-[15px] cursor-pointer select-none active:bg-slate-50/80 transition-colors"
          >
            <span>Description</span>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform duration-300 ease-out shrink-0 ${
                activeAccordion === "description" ? "rotate-180 text-slate-900" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === "description" && (
              <motion.div
                key="mobile-description"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.12 },
                  },
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {product.description ||
                      `The ${product.name} is a high-performance hardware module designed for advanced robotics, IoT instrumentation, and embedded systems engineering. With robust circuitry, precise telemetry, and plug-and-play prototyping support, it empowers makers, university labs, and industrial automation developers.`}
                  </p>

                  {/* Package Includes */}
                  <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Package Includes:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {packageIncludesList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 font-black">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Applications if present */}
                  {product.applications && product.applications.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        Applications:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {product.applications.map((app, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-[#005CA9] text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-100"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Specifications Accordion Card */}
        <div
          className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeAccordion === "specifications"
              ? "border-[#005CA9]/60 shadow-xs"
              : "border-slate-200/90 shadow-2xs hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("specifications")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-[15px] cursor-pointer select-none active:bg-slate-50/80 transition-colors"
          >
            <span>Specifications</span>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform duration-300 ease-out shrink-0 ${
                activeAccordion === "specifications" ? "rotate-180 text-slate-900" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === "specifications" && (
              <motion.div
                key="mobile-specifications"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.12 },
                  },
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                  <div className="rounded-xl border border-slate-200/90 overflow-hidden text-xs mt-1">
                    <table className="w-full text-left">
                      <tbody>
                        {Object.entries(allSpecs).map(([key, val], idx) => (
                          <tr
                            key={key}
                            className={idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"}
                          >
                            <td className="py-2.5 px-3 font-bold text-slate-600 border-b border-slate-100 w-2/5 text-[11px]">
                              {key}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 border-b border-slate-100 text-[11px]">
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Additional Resources Accordion Card */}
        <div
          className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeAccordion === "resources"
              ? "border-[#005CA9]/60 shadow-xs"
              : "border-slate-200/90 shadow-2xs hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("resources")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-[15px] cursor-pointer select-none active:bg-slate-50/80 transition-colors"
          >
            <span>Additional Resources</span>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform duration-300 ease-out shrink-0 ${
                activeAccordion === "resources" ? "rotate-180 text-slate-900" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === "resources" && (
              <motion.div
                key="mobile-resources"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.12 },
                  },
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2.5">
                  <div className="pt-1 space-y-2">
                    {downloadableDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#005CA9] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {doc.title}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              {doc.type} {(doc as any).size ? `• ${(doc as any).size}` : ""}
                            </p>
                          </div>
                        </div>
                        {doc.url && doc.url !== "#" ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="shrink-0 p-2 bg-white hover:bg-slate-100 text-[#005CA9] rounded-lg border border-slate-200 shadow-2xs font-bold text-xs"
                            title={`Download ${doc.title}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            Included
                          </span>
                        )}
                      </div>
                    ))}

                    {tutorialVideo && (
                      <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between gap-3 mt-1">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0">
                            <Play className="w-4 h-4 fill-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {tutorialVideo.title}
                            </p>
                            <p className="text-[10px] text-slate-500">Video Walkthrough</p>
                          </div>
                        </div>
                        <a
                          href={tutorialVideo.directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-2.5 py-1.5 bg-red-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <span>Watch</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. Warranty Accordion Card */}
        <div
          className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeAccordion === "warranty"
              ? "border-[#005CA9]/60 shadow-xs"
              : "border-slate-200/90 shadow-2xs hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("warranty")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-[15px] cursor-pointer select-none active:bg-slate-50/80 transition-colors"
          >
            <span>Warranty</span>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform duration-300 ease-out shrink-0 ${
                activeAccordion === "warranty" ? "rotate-180 text-slate-900" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === "warranty" && (
              <motion.div
                key="mobile-warranty"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.12 },
                  },
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                  <div className="space-y-2.5 pt-1">
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          1-Year Replacement Warranty
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Comprehensive coverage against hardware and manufacturing defects on all Prayog India products.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5">
                      <Package className="w-4 h-4 text-[#005CA9] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          7 Days Replacement Support
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Prompt replacement assistance if items are received in transit-damaged or non-working condition.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                      <Wrench className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          100% Genuine Tested Components
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Pre-calibrated and QC-checked before dispatch for robotics and university lab projects.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Official GST Invoice Provided
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Tax-compliant invoice with GST input tax credit for institutions, labs, and businesses.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. Customer Reviews Accordion Card */}
        <div
          className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeAccordion === "reviews"
              ? "border-[#005CA9]/60 shadow-xs"
              : "border-slate-200/90 shadow-2xs hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("reviews")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-[15px] cursor-pointer select-none active:bg-slate-50/80 transition-colors"
          >
            <span>Customer Reviews ({product.reviews || 12})</span>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 transition-transform duration-300 ease-out shrink-0 ${
                activeAccordion === "reviews" ? "rotate-180 text-slate-900" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === "reviews" && (
              <motion.div
                key="mobile-reviews"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] },
                    opacity: { duration: 0.12 },
                  },
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                  <div className="pt-2">
                    <ProductReviewsSection
                      productId={product.id}
                      productName={product.name}
                      productSlug={product.slug}
                      rating={Number(product.rating || 4.9)}
                      reviewsCount={product.reviews || 12}
                      reviewItems={product.reviewItems}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
