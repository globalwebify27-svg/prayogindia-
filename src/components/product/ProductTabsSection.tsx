"use client";

import React, { useState } from "react";
import {
  Check,
  ChevronRight,
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
  const [resourceView, setResourceView] = useState<"video" | "datasheet">("video");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "resources" || hash === "specifications" || hash === "reviews" || hash === "description") {
        setActiveTab(hash as TabType);
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

  React.useEffect(() => {
    if (!tutorialVideo && datasheetUrl) {
      setResourceView("datasheet");
    } else if (tutorialVideo) {
      setResourceView("video");
    }
  }, [tutorialVideo, datasheetUrl]);

  const specEntries = Object.entries(product.specs || {});

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
    ...(product.specs || {}),
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
      {/* ── Tabs Navigation Bar (Exact Match to Image 4: Description | Specifications | Additional Resources) ── */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto scrollbar-none scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`pb-3.5 text-base sm:text-lg font-bold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "description"
                ? "text-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Description
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AEEF] rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specifications")}
            className={`pb-3.5 text-base sm:text-lg font-bold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "specifications"
                ? "text-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Specifications
            {activeTab === "specifications" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AEEF] rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`pb-3.5 text-base sm:text-lg font-bold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "resources"
                ? "text-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Additional Resources
            {activeTab === "resources" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AEEF] rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3.5 text-base sm:text-lg font-bold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "reviews"
                ? "text-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Customer Reviews ({product.reviews || 19})
            {activeTab === "reviews" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AEEF] rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* ── Tab Content Container ── */}
      <div className="pt-6">
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

        {/* 3. ADDITIONAL RESOURCES TAB (Embedded YouTube Tutorial & Embedded PDF Datasheet) */}
        {activeTab === "resources" && (
          <div className="space-y-6 max-w-4xl">
            {/* Header + Sub-Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Product Guides, Tutorials &amp; Datasheets
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Official Prayog India video walkthroughs, pinouts, and engineering schematics.
                </p>
              </div>

              {/* Sub-Tabs: YouTube Tutorial Link | PDF Datasheet */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl shrink-0 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setResourceView("video")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    resourceView === "video"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />
                  <span>YouTube Tutorial Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResourceView("datasheet")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    resourceView === "datasheet"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#005CA9]" />
                  <span>PDF Datasheet</span>
                </button>
              </div>
            </div>

            {/* View 1: YouTube Tutorial Link Card */}
            {resourceView === "video" && (
              tutorialVideo ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                  {/* Header & Badges */}
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

                    {/* Primary CTA */}
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

                  {/* Direct YouTube Link Box with Copy Button */}
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

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(tutorialVideo.directUrl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
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

                      <a
                        href={tutorialVideo.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Quick Highlights of the Video Guide */}
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
                    No YouTube Tutorial Added Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    A video tutorial has not been linked for this product yet. Admins can add a tutorial link directly from the admin product management dashboard.
                  </p>
                  {datasheetUrl && (
                    <button
                      type="button"
                      onClick={() => setResourceView("datasheet")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                    >
                      <FileText className="w-4 h-4 text-[#005CA9]" />
                      <span>View PDF Datasheet Instead</span>
                    </button>
                  )}
                </div>
              )
            )}

            {/* View 2: PDF Datasheet Resource Card (No blocked external iframe) */}
            {resourceView === "datasheet" && (
              datasheetUrl ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                  {/* Header & Badges */}
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
                            Technical Document
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                          {product.name} — Technical Reference Manual &amp; Pinout
                        </h4>
                      </div>
                    </div>

                    {/* Primary CTA Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Open in Browser</span>
                      </a>
                      <a
                        href={datasheetUrl}
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
                        Datasheet Link:
                      </span>
                      <a
                        href={datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs sm:text-sm text-blue-600 hover:text-blue-700 underline truncate font-semibold transition-colors"
                        title={datasheetUrl}
                      >
                        {datasheetUrl}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(datasheetUrl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
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

                      <a
                        href={datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Document Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Cpu className="w-4 h-4 text-[#005CA9] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Electrical Limits</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Input voltage &amp; GPIO current ratings</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Pin Mapping Matrix</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">UART, SPI, I2C &amp; PWM assignments</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Mechanical Drawings</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Board dimensions &amp; mounting holes</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005CA9] flex items-center justify-center mx-auto shadow-2xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    No PDF Datasheet Added Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    An official technical datasheet document has not been linked for this product yet.
                  </p>
                  {tutorialVideo && (
                    <button
                      type="button"
                      onClick={() => setResourceView("video")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                    >
                      <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />
                      <span>View YouTube Tutorial Instead</span>
                    </button>
                  )}
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
      </div>
    </div>
  );
};
