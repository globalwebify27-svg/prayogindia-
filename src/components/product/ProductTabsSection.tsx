"use client";

import React, { useState } from "react";
import {
  Check,
  ChevronRight,
  FileText,
  HelpCircle,
  Package,
  Layers,
  Star,
  ChevronDown,
} from "lucide-react";
import { Product } from "@/data/mockData";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { ProductDocuments } from "@/components/product/ProductDocuments";

interface ProductTabsSectionProps {
  product: Product;
}

type TabType =
  | "overview"
  | "specifications"
  | "box"
  | "compatibility"
  | "reviews"
  | "faq";

export const ProductTabsSection: React.FC<ProductTabsSectionProps> = ({
  product,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const specEntries = Object.entries(product.specs || {});
  const quickSpecs = specEntries.slice(0, 6);

  // Default FAQ items for robotics/electronics
  const faqItems = [
    {
      q: `What is the warranty coverage for ${product.name}?`,
      a: `All genuine Prayog India components come with a standard 6-month replacement warranty against manufacturing defects. Physical damage, reverse polarity burnout, or improper voltage input are not covered under warranty.`,
    },
    {
      q: `How quickly is this item dispatched?`,
      a: `Orders placed before 2:00 PM IST on business days are dispatched the same day from our Bengaluru fulfillment hub. Typical delivery timeline is 2-4 business days across India.`,
    },
    {
      q: `Can I get a GST invoice for tax credit?`,
      a: `Yes, enter your company name and GSTIN during checkout to receive an automatic B2B tax invoice with 100% input tax credit (ITC) eligibility.`,
    },
    {
      q: `Do you provide technical integration support?`,
      a: `Yes! Our embedded systems and UAV engineers are available on WhatsApp and email to assist you with datasheets, pinout diagrams, and firmware configuration.`,
    },
  ];

  // Features list
  const featuresList =
    product.features && product.features.length > 0
      ? product.features
      : [
          "High-efficiency power distribution and fast response",
          "Compact and lightweight design for easy integration",
          "Built-in protection mechanisms for safety and reliability",
          "Standard interface compatible with major robotics platforms",
          "Engineered and tested for industrial-grade endurance",
        ];

  // What's in the box list
  const boxList =
    product.whatsIncluded && product.whatsIncluded.length > 0
      ? product.whatsIncluded
      : [
          `1 x ${product.name}`,
          "1 x Quick Setup Guide / Pinout Diagram",
          "Standard Connection Hardware / Cables",
        ];

  return (
    <div id="reviews-tab" className="pt-8 pb-4">
      {/* ── Clean Horizontal Tab Bar (No Outer Card, No Grey Background) ── */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200 overflow-x-auto scrollbar-none scroll-smooth">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3.5 text-xs sm:text-sm font-extrabold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "overview"
              ? "text-[#2563EB]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Overview
          {activeTab === "overview" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("specifications")}
          className={`pb-3.5 text-xs sm:text-sm font-extrabold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "specifications"
              ? "text-[#2563EB]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Specifications
          {activeTab === "specifications" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("box")}
          className={`pb-3.5 text-xs sm:text-sm font-extrabold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "box"
              ? "text-[#2563EB]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          What&apos;s in the Box
          {activeTab === "box" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("compatibility")}
          className={`pb-3.5 text-xs sm:text-sm font-extrabold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "compatibility"
              ? "text-[#2563EB]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Compatibility
          {activeTab === "compatibility" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-3.5 text-xs sm:text-sm font-extrabold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "reviews"
              ? "text-[#2563EB]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Reviews ({product.reviews || 389})
          {activeTab === "reviews" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`pb-3.5 text-xs sm:text-sm font-extrabold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "faq"
              ? "text-[#2563EB]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          FAQ
          {activeTab === "faq" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-t-full" />
          )}
        </button>
      </div>

      {/* ── Tab Content Container (Open, clean, no nested boxes) ── */}
      <div className="pt-6 sm:pt-8">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Column 1: Product Overview */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Product Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description ||
                  `The ${product.name} is engineered for reliable and efficient performance in modern robotics, UAVs, and automation systems. Built with high-grade components for stable and durable operation.`}
              </p>
            </div>

            {/* Column 2: Key Features */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Key Features
              </h3>
              <ul className="space-y-2.5">
                {featuresList.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Technical Specifications (Clean Minimalist Table) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Technical Specifications
              </h3>

              <div className="text-xs">
                <table className="w-full text-left">
                  <tbody>
                    {quickSpecs.length > 0 ? (
                      quickSpecs.map(([k, v]) => (
                        <tr
                          key={k}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-2.5 pr-4 font-medium text-slate-400 w-1/2">
                            {k}
                          </td>
                          <td className="py-2.5 font-semibold text-slate-900">
                            {v}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="border-b border-slate-100">
                          <td className="py-2.5 pr-4 font-medium text-slate-400">
                            Category
                          </td>
                          <td className="py-2.5 font-semibold text-slate-900">
                            {product.category}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2.5 pr-4 font-medium text-slate-400">
                            SKU
                          </td>
                          <td className="py-2.5 font-semibold text-slate-900">
                            {product.sku}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 font-medium text-slate-400">
                            Brand
                          </td>
                          <td className="py-2.5 font-semibold text-slate-900">
                            {product.brand || "Prayog India"}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {specEntries.length > quickSpecs.length && (
                <button
                  type="button"
                  onClick={() => setActiveTab("specifications")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer pt-2"
                >
                  <span>View full specifications</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. SPECIFICATIONS TAB */}
        {activeTab === "specifications" && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Full Technical Specifications
            </h3>
            <div className="text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-2.5 pr-4 font-bold uppercase tracking-wider text-xs text-slate-400 w-1/3">
                      Parameter
                    </th>
                    <th className="py-2.5 font-bold uppercase tracking-wider text-xs text-slate-400">
                      Specification
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {specEntries.map(([key, val]) => (
                    <tr
                      key={key}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-slate-500">
                        {key}
                      </td>
                      <td className="py-3 font-semibold text-slate-900">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Documents Download Component */}
            {product.documents && product.documents.length > 0 && (
              <div className="pt-6">
                <ProductDocuments documents={product.documents} />
              </div>
            )}
          </div>
        )}

        {/* 3. WHAT'S IN THE BOX TAB */}
        {activeTab === "box" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Package Contents
            </h3>
            <ul className="space-y-3">
              {boxList.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700"
                >
                  <Package className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. COMPATIBILITY TAB */}
        {activeTab === "compatibility" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Compatibility &amp; Applications
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This component is validated for plug-and-play integration with standard robotics platforms, microcontrollers, and UAV build frames.
            </p>

            {product.applications && product.applications.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.applications.map((app, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    {app}
                  </span>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="space-y-1">
                  <div className="font-extrabold text-slate-900">
                    Drone &amp; RC Aircraft
                  </div>
                  <div className="text-slate-500">
                    Quadcopters, Hexacopters, Fixed-Wing UAVs
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-slate-900">
                    Robotics Platforms
                  </div>
                  <div className="text-slate-500">
                    Arduino, Raspberry Pi, STM32, ESP32
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <ProductReviewsSection
              rating={product.rating}
              reviewsCount={product.reviews}
              reviewItems={product.reviewItems}
            />
          </div>
        )}

        {/* 6. FAQ TAB (Clean, Open Minimalist Accordion - No Nested Boxes) */}
        {activeTab === "faq" && (
          <div className="space-y-2 max-w-3xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              Frequently Asked Questions
            </h3>
            <div>
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="border-b border-slate-200/80 py-4 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-[#2563EB] cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180 text-[#2563EB]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pt-2.5 pl-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
