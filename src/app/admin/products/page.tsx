"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plane,
  Truck,
  ShieldAlert,
  Boxes,
  Layers,
  Sparkles,
  MapPin,
  Flame,
  BatteryCharging,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { PRODUCTS, ShippingTag } from "@/data/mockData";
import { ShippingTagType } from "@/data/productShippingConfig";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>(PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Section 26 Full Product Shipping Form State
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("Arduino & Microcontrollers");
  const [newSubcategory, setNewSubcategory] = useState("Development Boards");
  const [newPrice, setNewPrice] = useState("");
  const [newGstPercent, setNewGstPercent] = useState("18");
  const [newStock, setNewStock] = useState("25");
  const [newDescription, setNewDescription] = useState("");

  // Section 26 Physical & Freight Attributes
  const [weightGrams, setWeightGrams] = useState("250");
  const [dimLength, setDimLength] = useState("15");
  const [dimWidth, setDimWidth] = useState("10");
  const [dimHeight, setDimHeight] = useState("5");

  // Section 26 Freight Modes Checklist
  const [airFreightAllowed, setAirFreightAllowed] = useState(true);
  const [surfaceFreightAllowed, setSurfaceFreightAllowed] = useState(true);
  const [localPickupAllowed, setLocalPickupAllowed] = useState(true);

  // Section 26 Shipping Tags Classification
  const [shippingTag, setShippingTag] =
    useState<ShippingTagType>("Standard Product");

  // Section 26 Dangerous Goods & Safety Flags
  const [isHazardousItem, setIsHazardousItem] = useState(false);
  const [isBatteryProduct, setIsBatteryProduct] = useState(false);
  const [isFragileItem, setIsFragileItem] = useState(false);
  const [isDangerousGoods, setIsDangerousGoods] = useState(false);

  const handleShippingTagChange = (tag: ShippingTagType) => {
    setShippingTag(tag);
    if (tag === "Battery Product") {
      setIsBatteryProduct(true);
      setAirFreightAllowed(false);
      setSurfaceFreightAllowed(true);
    } else if (tag === "Fragile Product") {
      setIsFragileItem(true);
    } else if (tag === "Heavy Product" || tag === "Oversized Product") {
      setSurfaceFreightAllowed(true);
    } else {
      setIsBatteryProduct(false);
      setIsHazardousItem(false);
      setIsDangerousGoods(false);
      setAirFreightAllowed(true);
    }
  };

  const handleBatteryToggle = (checked: boolean) => {
    setIsBatteryProduct(checked);
    if (checked) {
      setShippingTag("Battery Product");
      setAirFreightAllowed(false);
      setSurfaceFreightAllowed(true);
    } else {
      setShippingTag("Standard Product");
      setAirFreightAllowed(true);
    }
  };

  const handleHazardousToggle = (checked: boolean) => {
    setIsHazardousItem(checked);
    if (checked) {
      setIsDangerousGoods(true);
      setAirFreightAllowed(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: newName,
      sku: newSku.toUpperCase().trim(),
      category: newCategory,
      subcategory: newSubcategory,
      price: parseFloat(newPrice),
      mrp: Math.round(parseFloat(newPrice) * 1.3),
      discount: "23% OFF",
      stock: parseInt(newStock, 10),
      inStock: parseInt(newStock, 10) > 0,
      description: newDescription,
      rating: 5.0,
      reviews: 1,
      image:
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
      specs: {},
      gstPercent: parseInt(newGstPercent, 10),
      weightGrams: parseInt(weightGrams, 10) || 250,
      dimensionsCm: {
        length: parseFloat(dimLength) || 15,
        width: parseFloat(dimWidth) || 10,
        height: parseFloat(dimHeight) || 5,
      },
      shippingTag,
      airFreightAllowed,
      surfaceFreightAllowed,
      localPickupAllowed,
      isHazardousItem,
      isBatteryProduct,
      isFragileItem,
      isDangerousGoods,
    };

    setProducts([newProduct, ...products]);
    setShowCreateModal(false);

    // Reset Form
    setNewName("");
    setNewSku("");
    setNewPrice("");
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 26 · Product Shipping Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Products &amp; Shipping Specs Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Configure dimensions ($L \times W \times H$), gram weights, GST %,
            DGCA freight modes (Air, Surface, Local Pickup), and dangerous goods
            tags.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#FFC20E]" />
          <span>Add Product with Shipping Specs</span>
        </button>
      </div>

      {/* 2. Products List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or SKU..."
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
            />
          </div>

          <span className="text-xs font-bold text-slate-400">
            Showing {filteredProducts.length} hardware items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 font-black">Product &amp; SKU</th>
                <th className="pb-3 font-black">Category</th>
                <th className="pb-3 font-black">Weight / Dims</th>
                <th className="pb-3 font-black">Shipping Tag</th>
                <th className="pb-3 font-black">Allowed Freight</th>
                <th className="pb-3 font-black">GST %</th>
                <th className="pb-3 font-black text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isBattery =
                  p.shippingTag === "Battery Item" ||
                  p.shippingTag === "Battery Product" ||
                  p.name.toLowerCase().includes("battery") ||
                  p.name.toLowerCase().includes("lipo");
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono font-bold">
                        {p.sku}
                      </div>
                    </td>

                    <td className="py-3.5 font-semibold text-slate-600">
                      {p.category}
                    </td>

                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">
                        {p.weightGrams || 250}g
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.dimensionsCm
                          ? `${p.dimensionsCm.length}x${p.dimensionsCm.width}x${p.dimensionsCm.height} cm`
                          : "15x10x5 cm"}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isBattery
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : p.shippingTag === "Fragile" ||
                                p.shippingTag === "Fragile Product"
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {p.shippingTag || "Standard"}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase">
                        {!isBattery && p.airFreightAllowed !== false ? (
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            Air
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded line-through">
                            Air
                          </span>
                        )}
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Surface
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                          Pickup
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 font-bold text-slate-700">
                      {p.gstPercent || 18}% GST
                    </td>

                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{p.price.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Section 26 Add / Edit Product Modal with Full Shipping Specs */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Section 26 Product Configurator
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Add Product &amp; Configure Shipping Specs
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Row 1: Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. 6S 22.2V 5200mAh Drone LiPo Battery Pack"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                    placeholder="PRG-LIPO-6S"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category, Subcategory & GST % */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Arduino & Microcontrollers">
                      Arduino &amp; Microcontrollers
                    </option>
                    <option value="Sensors & Modules">
                      Sensors &amp; Modules
                    </option>
                    <option value="Robotics & Drone Hardware">
                      Robotics &amp; Drone Hardware
                    </option>
                    <option value="Power, Batteries & Chargers">
                      Power, Batteries &amp; Chargers
                    </option>
                    <option value="Motors & Actuators">
                      Motors &amp; Actuators
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder="e.g. LiPo Flight Packs"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    GST % Rate
                  </label>
                  <select
                    value={newGstPercent}
                    onChange={(e) => setNewGstPercent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="18">
                      18% (Standard Electronic Hardware)
                    </option>
                    <option value="12">12% (Educational STEM Kits)</option>
                    <option value="5">5% (Specialized Components)</option>
                    <option value="28">
                      28% (Luxury Robotics Consumables)
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 3: Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="3499"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial Stock Units
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 26: Physical Shipping Dimensions & Weight */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-[#00AEEF]" /> Physical
                  Dimensions &amp; Volumetric Weight
                </span>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Weight (grams) *
                    </label>
                    <input
                      type="number"
                      required
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      value={dimLength}
                      onChange={(e) => setDimLength(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={dimWidth}
                      onChange={(e) => setDimWidth(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={dimHeight}
                      onChange={(e) => setDimHeight(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Shipping Tag Classification */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Shipping Tag Classification
                  </label>
                  <select
                    value={shippingTag}
                    onChange={(e) =>
                      handleShippingTagChange(e.target.value as ShippingTagType)
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="Standard Product">
                      Standard Product (General Air &amp; Surface)
                    </option>
                    <option value="Battery Product">
                      Battery Product (DGCA Safety Restriction - Surface Only)
                    </option>
                    <option value="Fragile Product">
                      Fragile Product (Bubble Packing Required)
                    </option>
                    <option value="Heavy Product">
                      Heavy Product (Pallet Freight)
                    </option>
                    <option value="Oversized Product">
                      Oversized Product (Surface Only)
                    </option>
                  </select>
                </div>

                {/* Allowed Freight Modes Checklist */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    Allowed Freight Modes
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={airFreightAllowed}
                        onChange={(e) => setAirFreightAllowed(e.target.checked)}
                        disabled={isBatteryProduct || isHazardousItem}
                        className="rounded text-[#00AEEF] accent-[#00AEEF]"
                      />
                      <span>Air Freight</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={surfaceFreightAllowed}
                        onChange={(e) =>
                          setSurfaceFreightAllowed(e.target.checked)
                        }
                        className="rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>Surface Freight</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localPickupAllowed}
                        onChange={(e) =>
                          setLocalPickupAllowed(e.target.checked)
                        }
                        className="rounded text-purple-600 accent-purple-600"
                      />
                      <span>Local Pickup</span>
                    </label>
                  </div>
                </div>

                {/* Additional Dangerous Goods & Safety Flags */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    Dangerous Goods &amp; Handling Flags
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBatteryProduct}
                        onChange={(e) => handleBatteryToggle(e.target.checked)}
                        className="rounded text-amber-600 accent-amber-600"
                      />
                      <span>Battery Product</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isHazardousItem}
                        onChange={(e) =>
                          handleHazardousToggle(e.target.checked)
                        }
                        className="rounded text-red-600 accent-red-600"
                      />
                      <span>Hazardous Item</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFragileItem}
                        onChange={(e) => setIsFragileItem(e.target.checked)}
                        className="rounded text-purple-600 accent-purple-600"
                      />
                      <span>Fragile Item</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDangerousGoods}
                        onChange={(e) => setIsDangerousGoods(e.target.checked)}
                        className="rounded text-red-600 accent-red-600"
                      />
                      <span>Dangerous Goods</span>
                    </label>
                  </div>
                </div>

                {isBatteryProduct && (
                  <p className="text-[10px] text-amber-800 bg-amber-100 p-2.5 rounded-xl font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      DGCA Safety Rule: Air cargo disabled automatically for
                      LiPo/Battery packs. Consignment will route via Surface
                      Ground.
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key features, pinouts, and technical documentation overview..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md"
                >
                  Save &amp; Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
