"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Upload,
  Video,
  X,
  Sparkles,
  Layers,
  FileText,
  ListPlus,
  Trash2,
  Globe,
  Tag,
  Eye,
  RefreshCw,
} from "lucide-react";
import { PRODUCTS } from "@/data/mockData";
import { ShippingTagType } from "@/data/productShippingConfig";
import { CATEGORIES_HIERARCHY, flattenCategories } from "@/data/categoriesHierarchy";

interface UploadedMediaItem {
  name: string;
  type: "image" | "video";
  url: string;
  publicId?: string;
  bytes?: number;
}

interface ProductItemRow {
  id: string;
  name: string;
  sku: string;
  brand?: string;
  category?: string | { name: string };
  subcategory?: string;
  price: number;
  weightGrams?: number;
  dimensionsCm?: { length: number; width: number; height: number };
  shippingTag?: string;
  image?: string;
  images?: Array<string | { imageUrl: string }>;
  slug?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItemRow[]>(PRODUCTS as unknown as ProductItemRow[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "media" | "specs" | "shipping">("general");

  // Categories list from Hierarchy
  const flatCategories = React.useMemo(() => {
    return flattenCategories(CATEGORIES_HIERARCHY);
  }, []);

  // Form Fields - Basic
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newBrand, setNewBrand] = useState("Prayog India");
  const [newCategory, setNewCategory] = useState("Arduino & Microcontrollers");
  const [newSubcategory, setNewSubcategory] = useState("Development Boards");
  const [newPrice, setNewPrice] = useState("");
  const [newMrp, setNewMrp] = useState("");
  const [newGstPercent, setNewGstPercent] = useState("18");
  const [newStock, setNewStock] = useState("25");
  const [newDescription, setNewDescription] = useState("");

  // Form Fields - Media (Images & Videos)
  const [mediaList, setMediaList] = useState<UploadedMediaItem[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields - Rich Details (Shown on Frontend)
  const [featuresList, setFeaturesList] = useState<string[]>([
    "High-speed 32-bit core microcontroller",
    "Onboard USB-C interface & voltage regulators",
  ]);
  const [featureInput, setFeatureInput] = useState("");

  const [applicationsList, setApplicationsList] = useState<string[]>([
    "Robotics",
    "STEM Education",
    "IoT Smart Devices",
  ]);
  const [appInput, setAppInput] = useState("");

  const [includedList, setIncludedList] = useState<string[]>([
    "1x Hardware Board Module",
    "1x Quickstart Pinout Guide",
  ]);
  const [includedInput, setIncludedInput] = useState("");

  const [specsRows, setSpecsRows] = useState<Array<{ key: string; val: string }>>([
    { key: "Operating Voltage", val: "5V DC" },
    { key: "Input Voltage (Limits)", val: "6-20V" },
    { key: "Clock Speed", val: "16 MHz" },
  ]);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");

  // Physical & Freight Attributes
  const [weightGrams, setWeightGrams] = useState("250");
  const [dimLength, setDimLength] = useState("15");
  const [dimWidth, setDimWidth] = useState("10");
  const [dimHeight, setDimHeight] = useState("5");

  // Freight Modes Checklist
  const [airFreightAllowed, setAirFreightAllowed] = useState(true);
  const [surfaceFreightAllowed, setSurfaceFreightAllowed] = useState(true);
  const [localPickupAllowed, setLocalPickupAllowed] = useState(true);

  // Shipping Tags Classification
  const [shippingTag, setShippingTag] = useState<ShippingTagType>("Standard Product");
  const [isHazardousItem, setIsHazardousItem] = useState(false);
  const [isBatteryProduct, setIsBatteryProduct] = useState(false);
  const [isFragileItem, setIsFragileItem] = useState(false);
  const [isDangerousGoods, setIsDangerousGoods] = useState(false);

  const refreshProductList = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products?limit=50");
      const json = await res.json();
      if (json.success && json.data?.items?.length > 0) {
        setProducts(json.data.items);
      }
    } catch {
      // Keep mock fallback
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function startFetching() {
      try {
        const res = await fetch("/api/admin/products?limit=50");
        const json = await res.json();
        if (!ignore && json.success && json.data?.items?.length > 0) {
          setProducts(json.data.items);
        }
      } catch {
        // Keep mock fallback
      }
    }
    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

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

  // Handle Multi-file upload to Cloudinary CDN
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    setUploadError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", "products");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to upload files to Cloudinary.");
      }

      const newMedia: UploadedMediaItem[] = (json.data as UploadedMediaItem[]).map((item) => ({
        name: item.name,
        type: item.type,
        url: item.url,
        publicId: item.publicId,
        bytes: item.bytes,
      }));

      setMediaList((prev) => [...prev, ...newMedia]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading files";
      setUploadError(msg);
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove uploaded media
  const handleRemoveMedia = (idx: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add Feature
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  // Add Application
  const handleAddApp = () => {
    if (appInput.trim()) {
      setApplicationsList([...applicationsList, appInput.trim()]);
      setAppInput("");
    }
  };

  // Add What's Included
  const handleAddIncluded = () => {
    if (includedInput.trim()) {
      setIncludedList([...includedList, includedInput.trim()]);
      setIncludedInput("");
    }
  };

  // Add Spec Row
  const handleAddSpec = () => {
    if (specKey.trim() && specVal.trim()) {
      setSpecsRows([...specsRows, { key: specKey.trim(), val: specVal.trim() }]);
      setSpecKey("");
      setSpecVal("");
    }
  };

  // Submit Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newSku) {
      alert("Please fill in the Product Name, SKU, and Price.");
      return;
    }

    setIsSubmitting(true);

    const imageUrls = mediaList
      .filter((m) => m.type === "image")
      .map((m) => m.url);
    const uploadedVideo = mediaList.find((m) => m.type === "video")?.url;
    const finalVideoUrl = videoUrlInput.trim() || uploadedVideo || "";

    const specsObj: Record<string, string> = {};
    specsRows.forEach((r) => {
      if (r.key.trim()) specsObj[r.key.trim()] = r.val.trim();
    });

    const payload = {
      name: newName.trim(),
      sku: newSku.toUpperCase().trim(),
      brand: newBrand.trim(),
      categoryName: newCategory,
      subcategory: newSubcategory.trim(),
      price: parseFloat(newPrice),
      mrp: newMrp ? parseFloat(newMrp) : Math.round(parseFloat(newPrice) * 1.3),
      gstPercent: parseInt(newGstPercent, 10),
      stock: parseInt(newStock, 10) || 0,
      description: newDescription.trim(),
      images: imageUrls,
      videoUrl: finalVideoUrl,
      features: featuresList,
      applications: applicationsList,
      whatsIncluded: includedList,
      specs: specsObj,
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

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create product.");
      }

      alert(`✅ Product "${newName}" published successfully to Cloudinary & Central Catalog!`);
      setShowCreateModal(false);
      refreshProductList();

      // Reset form
      setNewName("");
      setNewSku("");
      setNewPrice("");
      setNewMrp("");
      setNewDescription("");
      setMediaList([]);
      setVideoUrlInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating product.";
      alert(`❌ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Enterprise Catalog &middot; Central Media Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Products &amp; Master Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Add products with rich frontend specs (Key Features, In-Box, Technical Specs) and multi-image / video Cloudinary CDN uploads.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#FFC20E]" />
          <span>Add New Product</span>
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

          <div className="flex items-center gap-3">
            <button
              onClick={refreshProductList}
              className="text-xs font-bold text-slate-500 hover:text-[#00AEEF] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredProducts.length} items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 font-black">Media</th>
                <th className="pb-3 font-black">Product &amp; SKU</th>
                <th className="pb-3 font-black">Category</th>
                <th className="pb-3 font-black">Weight / Dims</th>
                <th className="pb-3 font-black">Shipping Tag</th>
                <th className="pb-3 font-black text-right">Price</th>
                <th className="pb-3 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isBattery =
                  p.shippingTag === "Battery Item" ||
                  p.shippingTag === "Battery Product" ||
                  p.name.toLowerCase().includes("battery") ||
                  p.name.toLowerCase().includes("lipo");

                const imgUrl =
                  p.images && p.images.length > 0
                    ? typeof p.images[0] === "string"
                      ? p.images[0]
                      : p.images[0]?.imageUrl
                    : p.image ||
                      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=120&q=80";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900 line-clamp-1 max-w-xs">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono font-bold">
                        {p.sku} &middot; <span className="text-slate-500 font-sans">{p.brand || "Prayog India"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 font-semibold text-slate-600">
                      <div>{typeof p.category === "object" ? p.category?.name : p.category}</div>
                      {p.subcategory && (
                        <div className="text-[10px] text-slate-400">{p.subcategory}</div>
                      )}
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

                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{p.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-right">
                      <a
                        href={`/products/${p.slug || p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00AEEF] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Comprehensive Add Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative max-w-4xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Enterprise Product Master
                </span>
                <h3 className="text-lg font-black text-slate-900 uppercase">
                  Add New Product &middot; Full Frontend Details
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-2 pb-1">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`pb-2 px-3 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "border-[#00AEEF] text-[#00AEEF]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>1. General &amp; Category</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`pb-2 px-3 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "media"
                    ? "border-[#00AEEF] text-[#00AEEF]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>2. Images &amp; Video ({mediaList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`pb-2 px-3 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "specs"
                    ? "border-[#00AEEF] text-[#00AEEF]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <ListPlus className="w-4 h-4" />
                <span>3. Frontend Specs &amp; Features</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("shipping")}
                className={`pb-2 px-3 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "shipping"
                    ? "border-[#00AEEF] text-[#00AEEF]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>4. Shipping &amp; Logistics</span>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* TAB 1: GENERAL & CATEGORY */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  {/* Name & SKU */}
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
                        placeholder="e.g. Arduino UNO R4 WiFi Official Board (Renesas RA4M1)"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        SKU (Stock Keeping Unit) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSku}
                        onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                        placeholder="PRG-ARD-R4W"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                      />
                    </div>
                  </div>

                  {/* Brand & Category Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        placeholder="Prayog India / Arduino"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Select Category *
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                      >
                        {flatCategories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {"\u00A0\u00A0".repeat(cat.level)}
                            {cat.level > 0 ? "↳ " : ""}
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Subcategory / Tag
                      </label>
                      <input
                        type="text"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="e.g. WiFi Development Boards"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Price, MRP, GST & Initial Stock */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="2499"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        MRP (₹)
                      </label>
                      <input
                        type="number"
                        value={newMrp}
                        onChange={(e) => setNewMrp(e.target.value)}
                        placeholder={newPrice ? String(Math.round(parseFloat(newPrice) * 1.3)) : "3299"}
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
                        <option value="18">18% (Standard Electronics)</option>
                        <option value="12">12% (STEM Educational Kits)</option>
                        <option value="5">5% (Essential Components)</option>
                        <option value="28">28% (Luxury Robotics)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Initial Stock (Ranchi Central)
                      </label>
                      <input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Product Overview / Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Comprehensive hardware description displayed prominently on the product page..."
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MULTIPLE IMAGES & VIDEO */}
              {activeTab === "media" && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-50 to-[#E0F7FC]/20 border border-dashed border-[#00AEEF]/40 p-6 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#00AEEF]/10 text-[#00AEEF] flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Upload Product Images &amp; Video to Cloudinary CDN
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Supports multiple files at once. PNG, JPG, WEBP, MP4, WEBM (Max 25MB).
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="product-media-upload"
                    />

                    <label
                      htmlFor="product-media-upload"
                      className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
                    >
                      {isUploadingMedia ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-[#FFC20E]" />
                          <span>Choose Media Files</span>
                        </>
                      )}
                    </label>

                    {uploadError && (
                      <p className="text-red-600 font-bold text-xs">{uploadError}</p>
                    )}
                  </div>

                  {/* Video URL Input */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#00AEEF]" />
                      <span>Product Video URL (Cloudinary / YouTube / Direct MP4)</span>
                    </label>
                    <input
                      type="url"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="https://res.cloudinary.com/fyueflvh/video/upload/demo.mp4"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Uploaded Media Gallery Previews */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase mb-2">
                      Media Queue ({mediaList.length} items)
                    </h4>
                    {mediaList.length === 0 ? (
                      <p className="text-slate-400 italic text-xs">
                        No media uploaded yet. The first uploaded image will automatically serve as the primary product card image.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {mediaList.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative group bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden aspect-square"
                          >
                            {item.type === "video" ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2 text-center">
                                <Video className="w-8 h-8 text-[#00AEEF] mb-1" />
                                <span className="text-[10px] font-mono font-bold line-clamp-1">{item.name}</span>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}

                            {idx === 0 && item.type === "image" && (
                              <span className="absolute top-2 left-2 bg-[#00AEEF] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                                Primary
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(idx)}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FRONTEND SPECS & FEATURES */}
              {activeTab === "specs" && (
                <div className="space-y-4">
                  {/* 1. Key Features List */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800 flex items-center justify-between">
                      <span>Key Hardware Features (Shown on Product Page)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Displayed as checkmark list</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                        placeholder="e.g. Dual-core Xtensa 32-bit LX7 CPU up to 240MHz"
                        className="flex-1 bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="bg-[#00AEEF] text-white px-3 py-2 rounded-xl font-bold text-xs"
                      >
                        Add Feature
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {featuresList.map((feat, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF]" />
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => setFeaturesList(featuresList.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 2. Target Applications */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      Target Applications
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appInput}
                        onChange={(e) => setAppInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddApp())}
                        placeholder="e.g. Industrial Automation, Drone Telemetry"
                        className="flex-1 bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddApp}
                        className="bg-[#00AEEF] text-white px-3 py-2 rounded-xl font-bold text-xs"
                      >
                        Add App
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {applicationsList.map((app, idx) => (
                        <span
                          key={idx}
                          className="bg-[#E0F7FC] border border-[#00AEEF]/20 text-[#0096D6] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>{app}</span>
                          <button
                            type="button"
                            onClick={() => setApplicationsList(applicationsList.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3. What's Included In Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      What&apos;s Included in Box
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={includedInput}
                        onChange={(e) => setIncludedInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIncluded())}
                        placeholder="e.g. 1x USB-C High Speed Cable (1 Meter)"
                        className="flex-1 bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddIncluded}
                        className="bg-[#00AEEF] text-white px-3 py-2 rounded-xl font-bold text-xs"
                      >
                        Add Box Item
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {includedList.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5"
                        >
                          <span>{idx + 1}. {item}</span>
                          <button
                            type="button"
                            onClick={() => setIncludedList(includedList.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4. Technical Specifications Table */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <label className="block font-bold text-slate-800 flex items-center justify-between">
                      <span>Technical Specifications Table</span>
                      <span className="text-[10px] text-slate-400 font-normal">Parameter &middot; Value</span>
                    </label>

                    <div className="grid grid-cols-5 gap-2">
                      <input
                        type="text"
                        value={specKey}
                        onChange={(e) => setSpecKey(e.target.value)}
                        placeholder="Parameter (e.g. Clock Speed)"
                        className="col-span-2 bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-900"
                      />
                      <input
                        type="text"
                        value={specVal}
                        onChange={(e) => setSpecVal(e.target.value)}
                        placeholder="Value (e.g. 48 MHz)"
                        className="col-span-2 bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpec}
                        className="bg-[#00AEEF] text-white p-2 rounded-xl font-bold text-xs"
                      >
                        Add Row
                      </button>
                    </div>

                    <table className="w-full text-xs text-left bg-white rounded-xl overflow-hidden border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-extrabold">
                          <th className="p-2">Parameter</th>
                          <th className="p-2">Value</th>
                          <th className="p-2 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {specsRows.map((r, idx) => (
                          <tr key={idx}>
                            <td className="p-2 text-slate-700">{r.key}</td>
                            <td className="p-2 text-slate-900">{r.val}</td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => setSpecsRows(specsRows.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5 ml-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SHIPPING & LOGISTICS */}
              {activeTab === "shipping" && (
                <div className="space-y-4">
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

                    {/* Shipping Tag */}
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

                    {/* Freight Modes */}
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
                            onChange={(e) => setSurfaceFreightAllowed(e.target.checked)}
                            className="rounded text-emerald-600 accent-emerald-600"
                          />
                          <span>Surface Freight</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localPickupAllowed}
                            onChange={(e) => setLocalPickupAllowed(e.target.checked)}
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
                            onChange={(e) => setIsHazardousItem(e.target.checked)}
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
                          DGCA Safety Rule: Air cargo disabled automatically for LiPo/Battery packs.
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Form Bottom Navigation & Submit Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-bold">
                  {activeTab === "general" && "Step 1 of 4: Product Name, Price & Category"}
                  {activeTab === "media" && "Step 2 of 4: Direct Cloudinary Image & Video Upload"}
                  {activeTab === "specs" && "Step 3 of 4: Frontend Specifications & Included Items"}
                  {activeTab === "shipping" && "Step 4 of 4: Freight Rules & Logistics Classification"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingMedia}
                    className="bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#FFC20E]" />
                        <span>Publish Product &amp; Media</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
