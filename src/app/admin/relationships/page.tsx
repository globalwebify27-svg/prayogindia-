"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Link2,
  ShoppingCart,
  Package,
  Puzzle,
  Eye,
  TrendingUp,
  Award,
  Sparkles,
  Search,
  X,
  CheckSquare,
  Square,
  ChevronRight,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Info,
  GripVertical,
  Tag,
  Star,
  CheckCircle2,
  History,
  ChevronDown,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";

// ────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────
type RelationshipType =
  | "related"
  | "frequentlyBoughtTogether"
  | "recommendedAccessories"
  | "similar"
  | "recentlyViewed"
  | "trending"
  | "bestSellers"
  | "personalized";

interface RelationshipConfig {
  id: RelationshipType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  isAutomatic?: boolean;
  maxItems: number;
}

// Maps source product id → relationship type → list of related product ids
type RelationshipMap = Record<string, Record<RelationshipType, string[]>>;

// ────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────
const RELATIONSHIP_CONFIGS: RelationshipConfig[] = [
  {
    id: "related",
    label: "Related Products",
    description:
      "Products from the same category or compatible with this item.",
    icon: <Link2 className="w-4 h-4" />,
    color: "text-[#00AEEF]",
    badgeColor: "bg-[#E0F7FC] text-[#00AEEF] border-[#00AEEF]/20",
    maxItems: 12,
  },
  {
    id: "frequentlyBoughtTogether",
    label: "Frequently Bought Together",
    description: "Products customers commonly purchase alongside this item.",
    icon: <ShoppingCart className="w-4 h-4" />,
    color: "text-emerald-600",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    maxItems: 6,
  },
  {
    id: "recommendedAccessories",
    label: "Recommended Accessories",
    description:
      "Cables, tools, mounts, and add-ons that complement this product.",
    icon: <Puzzle className="w-4 h-4" />,
    color: "text-purple-600",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    maxItems: 8,
  },
  {
    id: "similar",
    label: "Similar Products",
    description:
      "Alternative or comparable hardware options customers may consider.",
    icon: <Package className="w-4 h-4" />,
    color: "text-orange-600",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    maxItems: 8,
  },
  {
    id: "recentlyViewed",
    label: "Recently Viewed",
    description:
      "Automatically populated from customer browsing session history.",
    icon: <History className="w-4 h-4" />,
    color: "text-slate-500",
    badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
    isAutomatic: true,
    maxItems: 8,
  },
  {
    id: "trending",
    label: "Trending Products",
    description:
      "Products with high view and purchase velocity in last 7 days.",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-rose-600",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    isAutomatic: true,
    maxItems: 10,
  },
  {
    id: "bestSellers",
    label: "Best Sellers",
    description: "Top-selling products by revenue in the last 30 days.",
    icon: <Award className="w-4 h-4" />,
    color: "text-amber-600",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    isAutomatic: true,
    maxItems: 10,
  },
  {
    id: "personalized",
    label: "Personalized Recommendations",
    description:
      "AI-generated suggestions based on customer purchase history and preferences.",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-indigo-600",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    isAutomatic: true,
    maxItems: 8,
  },
];

// Initialize from product data
function buildInitialMap(): RelationshipMap {
  const map: RelationshipMap = {};
  PRODUCTS.forEach((p) => {
    map[p.id] = {
      related: p.relatedProductIds ?? [],
      frequentlyBoughtTogether: p.frequentlyBoughtTogetherIds ?? [],
      recommendedAccessories: p.recommendedAccessoryIds ?? [],
      similar: [],
      recentlyViewed: [],
      trending: [],
      bestSellers: [],
      personalized: [],
    };
  });
  return map;
}

// ────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────

/** Small product row in picker search list */
const PickerProductRow: React.FC<{
  product: Product;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ product, isSelected, onToggle }) => (
  <button
    onClick={onToggle}
    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left border ${
      isSelected
        ? "bg-[#E0F7FC] border-[#00AEEF]/40"
        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
    }`}
  >
    <span className="shrink-0">
      {isSelected ? (
        <CheckSquare className="w-4 h-4 text-[#00AEEF]" />
      ) : (
        <Square className="w-4 h-4 text-slate-300" />
      )}
    </span>
    <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-contain p-0.5"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-bold text-slate-900 line-clamp-1">
        {product.name}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[9px] font-mono text-slate-400">
          {product.sku}
        </span>
        <span className="text-[9px] text-slate-400">·</span>
        <span className="text-[9px] font-bold text-slate-600">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        <span
          className={`text-[9px] font-bold ${product.inStock ? "text-emerald-600" : "text-red-500"}`}
        >
          {product.inStock ? "✓ In Stock" : "✗ OOS"}
        </span>
      </div>
    </div>
  </button>
);

/** Draggable selected product chip */
const SelectedProductChip: React.FC<{
  product: Product;
  onRemove: () => void;
  index: number;
}> = ({ product, onRemove, index }) => (
  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 group hover:border-[#00AEEF]/40 hover:bg-slate-50 transition-all">
    <GripVertical className="w-3.5 h-3.5 text-slate-300 cursor-grab" />
    <span className="text-[10px] font-black text-slate-300 w-4 text-center">
      {index + 1}
    </span>
    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-contain"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-bold text-slate-900 line-clamp-1">
        {product.name}
      </div>
      <div className="text-[9px] font-mono text-slate-400">{product.sku}</div>
    </div>
    <button
      onClick={onRemove}
      className="w-5 h-5 rounded-full bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

// ────────────────────────────────────────────────────────────────
// RELATIONSHIP PANEL — shown when a product is selected
// ────────────────────────────────────────────────────────────────
const RelationshipPanel: React.FC<{
  sourceProduct: Product;
  relationships: Record<RelationshipType, string[]>;
  onUpdate: (type: RelationshipType, ids: string[]) => void;
  onBack: () => void;
  onSave: () => void;
}> = ({ sourceProduct, relationships, onUpdate, onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState<RelationshipType>("related");
  const [pickerQuery, setPickerQuery] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const activeConfig = RELATIONSHIP_CONFIGS.find((c) => c.id === activeTab)!;
  const currentIds = relationships[activeTab] ?? [];
  const currentProducts = currentIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const pickerResults = useMemo(() => {
    const q = pickerQuery.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.id !== sourceProduct.id &&
        !currentIds.includes(p.id) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false)),
    ).slice(0, 30);
  }, [pickerQuery, currentIds, sourceProduct.id]);

  const handleAdd = (id: string) => {
    if (currentIds.includes(id) || currentIds.length >= activeConfig.maxItems)
      return;
    onUpdate(activeTab, [...currentIds, id]);
  };

  const handleRemove = (id: string) => {
    onUpdate(
      activeTab,
      currentIds.filter((x) => x !== id),
    );
  };

  const handleSave = () => {
    onSave();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={sourceProduct.image}
                  alt={sourceProduct.name}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400">
                  {sourceProduct.sku}
                </p>
                <h2 className="text-sm font-black text-slate-900 line-clamp-1">
                  {sourceProduct.name}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md ${
            savedFlash
              ? "bg-emerald-600 text-white shadow-emerald-200"
              : "bg-[#00AEEF] hover:bg-[#0096D6] text-white shadow-[#00AEEF]/20"
          }`}
        >
          {savedFlash ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Relationships
            </>
          )}
        </button>
      </div>

      {/* Relationship Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {RELATIONSHIP_CONFIGS.map((config) => {
          const count = (relationships[config.id] ?? []).length;
          return (
            <button
              key={config.id}
              onClick={() => {
                setActiveTab(config.id);
                setPickerQuery("");
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer border ${
                activeTab === config.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {config.icon}
              <span>{config.label}</span>
              <span
                className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                  activeTab === config.id
                    ? "bg-white/20 text-white"
                    : config.badgeColor
                } border`}
              >
                {count}/{config.maxItems}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Tab Description Banner */}
        <div
          className={`px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 ${
            activeConfig.isAutomatic
              ? "bg-slate-50"
              : "bg-gradient-to-r from-slate-50 to-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`${activeConfig.color}`}>{activeConfig.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  {activeConfig.label}
                </span>
                {activeConfig.isAutomatic && (
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5" /> AUTO
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {activeConfig.description}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            Max {activeConfig.maxItems} items
          </span>
        </div>

        {activeConfig.isAutomatic ? (
          /* Auto Managed Notice */
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                {activeConfig.label}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                This module is <strong>automatically managed</strong> by the
                Prayog India engine based on real-time order data, browsing
                sessions, and AI signals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 text-left">
              {activeConfig.id === "trending" && (
                <>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-rose-700 mb-1">
                      View Velocity
                    </div>
                    <div className="text-rose-600 font-medium">
                      Last 7-day page view count
                    </div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-rose-700 mb-1">
                      Cart Add Rate
                    </div>
                    <div className="text-rose-600 font-medium">
                      % of views leading to add-to-cart
                    </div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-rose-700 mb-1">
                      Search Rank
                    </div>
                    <div className="text-rose-600 font-medium">
                      Frequency in search queries
                    </div>
                  </div>
                </>
              )}
              {activeConfig.id === "bestSellers" && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-amber-700 mb-1">
                      Revenue (30d)
                    </div>
                    <div className="text-amber-600 font-medium">
                      Sales revenue in last 30 days
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-amber-700 mb-1">
                      Units Sold
                    </div>
                    <div className="text-amber-600 font-medium">
                      Total quantity dispatched
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-amber-700 mb-1">
                      Category Rank
                    </div>
                    <div className="text-amber-600 font-medium">
                      Rank within category
                    </div>
                  </div>
                </>
              )}
              {(activeConfig.id === "personalized" ||
                activeConfig.id === "recentlyViewed") && (
                <>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-indigo-700 mb-1">
                      Session History
                    </div>
                    <div className="text-indigo-600 font-medium">
                      Customer browsing sessions
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-indigo-700 mb-1">
                      Purchase History
                    </div>
                    <div className="text-indigo-600 font-medium">
                      Previous orders & repeat buys
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs">
                    <div className="font-black text-indigo-700 mb-1">
                      Similar Customers
                    </div>
                    <div className="text-indigo-600 font-medium">
                      Collaborative filtering model
                    </div>
                  </div>
                </>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              No manual configuration required. Data refreshes every 6 hours.
            </span>
          </div>
        ) : (
          /* Manual Selection Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Left — Selected Products */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className={activeConfig.color}>
                    {activeConfig.icon}
                  </span>
                  Selected ({currentProducts.length}/{activeConfig.maxItems})
                </h4>
                {currentProducts.length > 0 && (
                  <button
                    onClick={() => onUpdate(activeTab, [])}
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>

              {currentProducts.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-semibold">
                  <Plus className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  No products selected yet.
                  <br />
                  Search and add products from the right panel.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-slate-200">
                  {currentProducts.map((prod, idx) => (
                    <SelectedProductChip
                      key={prod.id}
                      product={prod}
                      index={idx}
                      onRemove={() => handleRemove(prod.id)}
                    />
                  ))}
                </div>
              )}

              {currentIds.length >= activeConfig.maxItems && (
                <p className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  ⚠️ Maximum {activeConfig.maxItems} products reached for this
                  relationship type.
                </p>
              )}
            </div>

            {/* Right — Product Picker */}
            <div className="p-5 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Product Search & Add
              </h4>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  placeholder="Search by name, SKU, brand, or category..."
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                />
                {pickerQuery && (
                  <button
                    onClick={() => setPickerQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-slate-200">
                {pickerResults.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No products found matching your search.
                  </div>
                ) : (
                  pickerResults.map((prod) => (
                    <PickerProductRow
                      key={prod.id}
                      product={prod}
                      isSelected={currentIds.includes(prod.id)}
                      onToggle={() => handleAdd(prod.id)}
                    />
                  ))
                )}
              </div>

              <p className="text-[10px] text-slate-400 font-medium">
                Showing {pickerResults.length} available products ·{" "}
                {currentIds.length} already selected
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 13 Info Footer */}
      <div className="bg-[#0F172A] text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
        <Info className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-slate-300 font-medium leading-relaxed">
          <strong className="text-white">Section 13 Rule:</strong> Manually
          configured relationships (Related, FBT, Accessories, Similar) take
          priority over algorithmic suggestions. The store front shows manual
          selections first, then auto-generated suggestions to fill remaining
          slots up to the display limit.
        </p>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// MAIN PAGE — Product Relationships Manager
// ────────────────────────────────────────────────────────────────
export default function AdminRelationshipsPage() {
  const [relationshipMap, setRelationshipMap] =
    useState<RelationshipMap>(buildInitialMap);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(PRODUCTS.map((p) => p.category));
    return Array.from(cats).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false);
      const matchesCategory =
        filterCategory === "" || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, filterCategory]);

  const handleUpdate = (type: RelationshipType, ids: string[]) => {
    if (!selectedProduct) return;
    setRelationshipMap((prev) => ({
      ...prev,
      [selectedProduct.id]: {
        ...prev[selectedProduct.id],
        [type]: ids,
      },
    }));
  };

  const handleSave = () => {
    setSavedMessage(
      `Relationships saved for "${selectedProduct?.name}" successfully.`,
    );
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const getTotalRelationships = (productId: string): number => {
    const rel = relationshipMap[productId];
    if (!rel) return 0;
    return (
      (rel.related?.length ?? 0) +
      (rel.frequentlyBoughtTogether?.length ?? 0) +
      (rel.recommendedAccessories?.length ?? 0) +
      (rel.similar?.length ?? 0)
    );
  };

  // ── Show relationship panel if a product is selected
  if (selectedProduct) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {savedMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-5 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {savedMessage}
          </div>
        )}
        <RelationshipPanel
          sourceProduct={selectedProduct}
          relationships={
            relationshipMap[selectedProduct.id] ??
            ({} as Record<RelationshipType, string[]>)
          }
          onUpdate={handleUpdate}
          onBack={() => setSelectedProduct(null)}
          onSave={handleSave}
        />
      </div>
    );
  }

  // ── Main product list view
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#00AEEF] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              SECTION 13 · PRODUCT INTELLIGENCE
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              8 Relationship Modules
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Related Products & Recommendations
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Manually configure product relationships (Related, FBT, Accessories,
            Similar) and view the status of auto-managed modules (Trending, Best
            Sellers, Personalized, Recently Viewed).
          </p>
        </div>
      </div>

      {/* ── Relationship Module Status Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RELATIONSHIP_CONFIGS.map((config) => (
          <div
            key={config.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className={`${config.color}`}>{config.icon}</span>
              {config.isAutomatic ? (
                <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  AUTO
                </span>
              ) : (
                <span className="text-[9px] font-black bg-[#E0F7FC] text-[#00AEEF] border border-[#00AEEF]/20 px-1.5 py-0.5 rounded-full">
                  MANUAL
                </span>
              )}
            </div>
            <div className="text-sm font-black text-slate-900">
              {config.label.split(" ")[0]}
            </div>
            <div className="text-[10px] text-slate-500 font-medium line-clamp-2">
              {config.description}
            </div>
            <div className="text-[10px] font-bold text-slate-400">
              Max {config.maxItems} per product
            </div>
          </div>
        ))}
      </div>

      {/* ── Product List with Relationship Summary ── */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or brand..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00AEEF]"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#00AEEF] cursor-pointer shrink-0"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 font-bold shrink-0">
            {filteredProducts.length} products
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Related</th>
                <th className="px-4 py-3">FBT</th>
                <th className="px-4 py-3">Accessories</th>
                <th className="px-4 py-3">Similar</th>
                <th className="px-4 py-3">Total Links</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const rel = relationshipMap[prod.id] ?? {};
                const relatedCount = rel.related?.length ?? 0;
                const fbtCount = rel.frequentlyBoughtTogether?.length ?? 0;
                const accCount = rel.recommendedAccessories?.length ?? 0;
                const simCount = rel.similar?.length ?? 0;
                const total = relatedCount + fbtCount + accCount + simCount;

                return (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    {/* Product Info */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-[220px]">
                            {prod.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {prod.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
                        {prod.category.split(" ")[0]}
                      </span>
                    </td>

                    {/* Related */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-extrabold ${relatedCount > 0 ? "text-[#00AEEF]" : "text-slate-300"}`}
                      >
                        {relatedCount}
                      </span>
                    </td>

                    {/* FBT */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-extrabold ${fbtCount > 0 ? "text-emerald-600" : "text-slate-300"}`}
                      >
                        {fbtCount}
                      </span>
                    </td>

                    {/* Accessories */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-extrabold ${accCount > 0 ? "text-purple-600" : "text-slate-300"}`}
                      >
                        {accCount}
                      </span>
                    </td>

                    {/* Similar */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-extrabold ${simCount > 0 ? "text-orange-500" : "text-slate-300"}`}
                      >
                        {simCount}
                      </span>
                    </td>

                    {/* Total Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                          total > 0
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {total} links
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white text-[10px] font-extrabold px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-[#00AEEF]/20 ml-auto"
                      >
                        <Link2 className="w-3 h-3" />
                        Manage
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
