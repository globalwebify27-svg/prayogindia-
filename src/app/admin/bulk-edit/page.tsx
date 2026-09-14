"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Percent,
  DollarSign,
  Tag,
  Hash,
  Boxes,
  RefreshCw,
  Sparkles,
  Save,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FolderTree,
  TrendingUp,
  PackageCheck,
  Building2,
  FolderSync,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { STORES, StoreId, ALL_STORE_IDS } from "@/data/storeConfig";

type BulkAction =
  | "PRICE_PERCENT"
  | "PRICE_FLAT"
  | "MRP_UPDATE"
  | "DISCOUNT_PERCENT"
  | "GST_RATE"
  | "SKU_PREFIX"
  | "CATEGORY_UPDATE"
  | "STOCK_UPDATE";

function BulkEditContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode");

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Bulk Operation Drawer / Modal State
  const [bulkActionType, setBulkActionType] =
    useState<BulkAction>("PRICE_PERCENT");
  const [bulkActionValue, setBulkActionValue] = useState("10");
  const [targetCategory, setTargetCategory] = useState(
    "Arduino & Microcontrollers",
  );
  const [targetStore, setTargetStore] = useState<StoreId>("ranchi");
  const [stockOperation, setStockOperation] = useState<"INCREMENT" | "SET" | "LOW_THRESHOLD">("INCREMENT");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Synchronize initial mode from URL search query (e.g. ?mode=price, ?mode=discount, ?mode=gst, ?mode=sku)
  useEffect(() => {
    if (initialMode === "price") {
      setBulkActionType("PRICE_PERCENT");
      setBulkActionValue("10");
    } else if (initialMode === "discount") {
      setBulkActionType("DISCOUNT_PERCENT");
      setBulkActionValue("15");
    } else if (initialMode === "gst") {
      setBulkActionType("GST_RATE");
      setBulkActionValue("18");
    } else if (initialMode === "sku") {
      setBulkActionType("SKU_PREFIX");
      setBulkActionValue("PRG-2026");
    }
  }, [initialMode]);

  // Categories & Subcategories extraction
  const categories = [
    "All",
    ...Array.from(new Set(PRODUCTS.map((p) => p.category))),
  ];

  const availableSubcategories = [
    "All",
    ...Array.from(
      new Set(
        PRODUCTS.filter(
          (p) => selectedCategory === "All" || p.category === selectedCategory,
        ).map((p) => p.subcategory || "General"),
      ),
    ),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSubcat =
      selectedSubcategory === "All" ||
      (p.subcategory || "General") === selectedSubcategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSubcat && matchesSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const handleApplyBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      alert("Please select at least one product to apply bulk update.");
      return;
    }

    const numVal = parseFloat(bulkActionValue);
    if (isNaN(numVal)) {
      alert("Please enter a valid numeric value.");
      return;
    }

    // 1. If action is STOCK_UPDATE, execute through the real Inventory API
    if (bulkActionType === "STOCK_UPDATE") {
      try {
        setSubmitting(true);
        setErrorNotice(null);

        const targetStoreObj = STORES[targetStore] || STORES.ranchi;
        const res = await fetch("/api/admin/inventory/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: targetStore,
            operation: stockOperation,
            value: numVal,
            productIds: selectedProductIds,
            reason: `Admin Bulk Edit (${stockOperation} ${numVal})`,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          // Update local state for immediate visual responsiveness
          setProducts((prev) =>
            prev.map((prod) => {
              if (!selectedProductIds.includes(prod.id)) return prod;
              const currentStock = (prod as any).stock || 25;
              let newStock = currentStock;
              if (stockOperation === "INCREMENT") {
                newStock = Math.max(0, currentStock + numVal);
              } else if (stockOperation === "SET") {
                newStock = Math.max(0, numVal);
              }
              return { ...prod, stock: newStock, inStock: newStock > 0 };
            }),
          );

          setShowApplyModal(false);
          setSuccessNotice(
            `Successfully updated inventory for ${json.updatedCount} items in ${targetStoreObj.name}!`,
          );
          setTimeout(() => setSuccessNotice(null), 6000);
          return;
        } else {
          setErrorNotice(json.message || "Failed to update inventory.");
          return;
        }
      } catch (err: any) {
        setErrorNotice(err.message || "Network error while updating inventory.");
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // 2. Pricing, SKU, GST, Discount and Category batch operations
    setProducts((prev) =>
      prev.map((prod) => {
        if (!selectedProductIds.includes(prod.id)) return prod;

        const updated = { ...prod };

        switch (bulkActionType) {
          case "PRICE_PERCENT": {
            // Bulk Selling Price Percentage Update (e.g. supplier cost hike +10% or -5%)
            const newPrice = Math.round(prod.price * (1 + numVal / 100));
            updated.price = Math.max(1, newPrice);
            if (updated.mrp < updated.price) {
              updated.mrp = Math.round(updated.price * 1.25);
            }
            break;
          }
          case "PRICE_FLAT": {
            // Bulk Selling Price Flat Update (e.g. +₹100)
            updated.price = Math.max(1, prod.price + numVal);
            if (updated.mrp < updated.price) {
              updated.mrp = Math.round(updated.price * 1.2);
            }
            break;
          }
          case "MRP_UPDATE": {
            // Bulk MRP Update (% markup above selling price)
            updated.mrp = Math.round(prod.price * (1 + numVal / 100));
            break;
          }
          case "DISCOUNT_PERCENT": {
            // Bulk Discount % and Tag update
            const discPercent = Math.max(0, Math.min(99, numVal));
            updated.discount = `${Math.round(discPercent)}% OFF`;
            updated.price = Math.round(prod.mrp * (1 - discPercent / 100));
            break;
          }
          case "GST_RATE": {
            // Bulk GST Rate update (e.g. 18%, 12%, 5%, 0%)
            // @ts-ignore
            updated.gstPercent = Math.round(numVal);
            break;
          }
          case "SKU_PREFIX": {
            // Bulk SKU Standardization (e.g. PRG-2026-ARD-001)
            const cleanPrefix = bulkActionValue.trim().toUpperCase();
            if (cleanPrefix && !prod.sku.startsWith(cleanPrefix)) {
              updated.sku = `${cleanPrefix}-${prod.sku.replace(/^PRG-/, "")}`;
            }
            break;
          }
          case "CATEGORY_UPDATE": {
            // Bulk Category reassignment
            updated.category = targetCategory;
            break;
          }
        }

        return updated;
      }),
    );

    setShowApplyModal(false);
    setSuccessNotice(
      `Successfully applied ${bulkActionType} to ${selectedProductIds.length} products!`,
    );
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Bulk Product Management Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Bulk Catalogue &amp; Batch Operations
          </h1>
          <p className="text-xs text-slate-500">
            Execute batch selling price adjustments, MRP markups, seasonal
            discount launches, GST tax standardization, SKU formatting, and
            category migrations.
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedProductIds.length === 0) {
              alert("Select products using checkboxes first.");
              return;
            }
            setShowApplyModal(true);
          }}
          disabled={selectedProductIds.length === 0}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all ${
            selectedProductIds.length > 0
              ? "bg-[#00AEEF] hover:bg-[#0096D6] text-white active:scale-95 cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FFC20E]" />
          <span>Apply Bulk Operation ({selectedProductIds.length})</span>
        </button>
      </div>

      {/* Success Alert */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* 2. Business Use-Case Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            title: "Supplier Cost Change",
            desc: "+8% Selling Price",
            icon: TrendingUp,
            color: "text-amber-600 bg-amber-50 border-amber-200",
            action: () => {
              setBulkActionType("PRICE_PERCENT");
              setBulkActionValue("8");
              if (selectedProductIds.length > 0) setShowApplyModal(true);
            },
          },
          {
            title: "Category Clearance Offer",
            desc: "25% Seasonal Discount",
            icon: Percent,
            color: "text-blue-600 bg-blue-50 border-blue-200",
            action: () => {
              setBulkActionType("DISCOUNT_PERCENT");
              setBulkActionValue("25");
              if (selectedProductIds.length > 0) setShowApplyModal(true);
            },
          },
          {
            title: "GST Rate Compliance",
            desc: "Set GST to 18%",
            icon: Tag,
            color: "text-purple-600 bg-purple-50 border-purple-200",
            action: () => {
              setBulkActionType("GST_RATE");
              setBulkActionValue("18");
              if (selectedProductIds.length > 0) setShowApplyModal(true);
            },
          },
          {
            title: "SKU Standardization",
            desc: "Prefix: PRG-2026",
            icon: Hash,
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
            action: () => {
              setBulkActionType("SKU_PREFIX");
              setBulkActionValue("PRG-2026");
              if (selectedProductIds.length > 0) setShowApplyModal(true);
            },
          },
          {
            title: "Shelf Restock Batch",
            desc: "+50 Units Stock",
            icon: Boxes,
            color: "text-cyan-600 bg-cyan-50 border-cyan-200",
            action: () => {
              setBulkActionType("STOCK_UPDATE");
              setBulkActionValue("50");
              if (selectedProductIds.length > 0) setShowApplyModal(true);
            },
          },
        ].map((shortcut, i) => {
          const Icon = shortcut.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={shortcut.action}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:shadow-sm active:scale-95 cursor-pointer ${shortcut.color}`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">
                  Batch Preset
                </span>
              </div>
              <div className="mt-2">
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  {shortcut.title}
                </div>
                <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                  {shortcut.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Category & Subcategory Filtering Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory("All");
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">
                Subcategory:
              </span>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
              >
                {availableSubcategories.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search SKU or Name */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU or name..."
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          {/* Selection Counter */}
          <div className="text-xs font-bold text-slate-600">
            Selected{" "}
            <strong className="text-[#00AEEF]">
              {selectedProductIds.length}
            </strong>{" "}
            of {filteredProducts.length} items
          </div>
        </div>
      </div>

      {/* 4. Products Batch Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedProductIds.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-[#00AEEF] accent-[#00AEEF]"
                  />
                </th>
                <th className="pb-3 font-black">Product Name &amp; SKU</th>
                <th className="pb-3 font-black">Category &amp; Subcategory</th>
                <th className="pb-3 font-black text-right">Selling Price</th>
                <th className="pb-3 font-black text-right">MRP</th>
                <th className="pb-3 font-black text-right">Discount</th>
                <th className="pb-3 font-black text-center">GST %</th>
                <th className="pb-3 font-black text-center">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleProduct(p.id)}
                        className="rounded text-[#00AEEF] accent-[#00AEEF]"
                      />
                    </td>

                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900">
                        {p.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 font-bold">
                        {p.sku}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-semibold text-slate-700">
                        {p.category}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.subcategory || "General"}
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{p.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-right font-mono text-slate-400 line-through">
                      ₹{p.mrp.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-right">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        {p.discount || "20% OFF"}
                      </span>
                    </td>

                    <td className="py-3.5 text-center font-bold text-slate-800">
                      {/* @ts-ignore */}
                      {p.gstPercent || 18}%
                    </td>

                    <td className="py-3.5 text-center">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          p.inStock
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bulk Edit Configuration Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowApplyModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Bulk Product Editor
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Execute Bulk Operation
                </h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyBulkUpdate} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Bulk Operation Type *
                </label>
                <select
                  value={bulkActionType}
                  onChange={(e) => setBulkActionType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                >
                  <option value="PRICE_PERCENT">
                    Bulk Selling Price Update (+ / - %)
                  </option>
                  <option value="PRICE_FLAT">
                    Bulk Selling Price Update (+ / - Flat ₹)
                  </option>
                  <option value="MRP_UPDATE">
                    Bulk MRP Markup (% above Selling Price)
                  </option>
                  <option value="DISCOUNT_PERCENT">
                    Bulk Discount Percentage Update (%)
                  </option>
                  <option value="GST_RATE">
                    Bulk GST Tax Rate Update (18%, 12%, 5%, 0%)
                  </option>
                  <option value="SKU_PREFIX">
                    Bulk SKU Code Standardization (Add Prefix)
                  </option>
                  <option value="CATEGORY_UPDATE">
                    Bulk Category / Department Reassignment
                  </option>
                  <option value="STOCK_UPDATE">
                    Bulk Stock Quantity Increment (+ Units)
                  </option>
                </select>
              </div>

              {bulkActionType === "STOCK_UPDATE" && (
                <div className="space-y-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Target Physical Store *
                    </label>
                    <select
                      value={targetStore}
                      onChange={(e) => setTargetStore(e.target.value as StoreId)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      {ALL_STORE_IDS.map((sId) => {
                        const s = STORES[sId];
                        return (
                          <option key={sId} value={sId}>
                            {s.name} ({s.city}) {s.isCentralInventory ? "★ Central Hub" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Inventory Update Strategy *
                    </label>
                    <select
                      value={stockOperation}
                      onChange={(e) => setStockOperation(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="INCREMENT">Increment / Restock Stock (+ Units)</option>
                      <option value="SET">Set Exact Stock Count (Overwrites Quantity)</option>
                      <option value="LOW_THRESHOLD">Set Low-Stock Reorder Threshold</option>
                    </select>
                  </div>
                </div>
              )}

              {bulkActionType === "CATEGORY_UPDATE" ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Category *
                  </label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {bulkActionType === "SKU_PREFIX"
                      ? "SKU Prefix Code (e.g. PRG-2026)"
                      : bulkActionType === "STOCK_UPDATE"
                        ? stockOperation === "INCREMENT"
                          ? "Quantity Change (+/- Units)"
                          : stockOperation === "SET"
                            ? "New Exact Quantity"
                            : "Low Stock Alert Threshold"
                        : "Operation Parameter Value"}{" "}
                    *
                  </label>
                  <input
                    type={bulkActionType === "SKU_PREFIX" ? "text" : "number"}
                    required
                    value={bulkActionValue}
                    onChange={(e) => setBulkActionValue(e.target.value)}
                    placeholder={
                      bulkActionType === "SKU_PREFIX" ? "PRG-2026" : "10"
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none uppercase"
                  />
                </div>
              )}

              {errorNotice && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-red-800 text-[11px] font-bold">
                  {errorNotice}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-blue-900 text-[11px] font-medium space-y-1">
                <span className="font-bold block">Scope Summary:</span>
                <p>
                  Will modify <strong>{selectedProductIds.length}</strong>{" "}
                  selected hardware products
                  {bulkActionType === "STOCK_UPDATE" ? (
                    <> in <strong>{STORES[targetStore]?.name}</strong> ({STORES[targetStore]?.city})</>
                  ) : (
                    <> under category "{selectedCategory}" {selectedSubcategory !== "All" ? `> "${selectedSubcategory}"` : ""}</>
                  )}
                  .
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplyModal(false);
                    setErrorNotice(null);
                  }}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? "Applying..." : "Commit Batch Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBulkEditPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 font-bold">
          Loading Bulk Product Editor...
        </div>
      }
    >
      <BulkEditContent />
    </Suspense>
  );
}
