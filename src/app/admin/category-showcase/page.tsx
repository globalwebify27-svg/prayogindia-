"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Eye,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  Save,
  ImageIcon,
  RotateCcw,
  Bot,
  Cpu,
  Radio,
  Navigation,
  GraduationCap,
  Wifi,
  Code,
} from "lucide-react";
import {
  CategoryCardItem,
  DEFAULT_CATEGORY_SHOWCASE,
} from "@/data/defaultCategoryShowcase";

const PRESET_IMAGES = [
  { name: "Yellow 4WD Robot Car", url: "/products/robot_car_stem.png" },
  { name: "Arduino Uno Board", url: "/products/arduino_cutout.png" },
  { name: "HC-SR04 Sensor", url: "/products/sensors_cutout.png" },
  { name: "Aerial Drone", url: "/products/drone_cutout.png" },
  { name: "ESP32 Wireless", url: "/products/esp32_devkit_cutout.png" },
  { name: "Raspberry Pi Board", url: "/products/raspberry_pi_board.png" },
  { name: "Jumper Wires & Parts", url: "/products/jumper_wires.png" },
  { name: "Robotics Catalog", url: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595386/prayog/products/prod_catalog_template_4.jpg" },
  { name: "Drone Flight Lab", url: "/images/drone_banner_lab.jpg" },
];

const THEME_OPTIONS = [
  { value: "blue", label: "Sky Blue", bg: "bg-blue-50 text-blue-700" },
  { value: "teal", label: "Mint Teal", bg: "bg-teal-50 text-teal-700" },
  { value: "purple", label: "Lavender Purple", bg: "bg-purple-50 text-purple-700" },
  { value: "amber", label: "Warm Amber", bg: "bg-amber-50 text-amber-700" },
  { value: "emerald", label: "Emerald Green", bg: "bg-emerald-50 text-emerald-700" },
  { value: "rose", label: "Rose Pink", bg: "bg-rose-50 text-rose-700" },
  { value: "cyan", label: "Cyan Ice", bg: "bg-cyan-50 text-cyan-700" },
];

const ICON_OPTIONS = [
  { value: "robot", label: "Robot Car" },
  { value: "cpu", label: "Microcontroller (CPU)" },
  { value: "radio", label: "Radio / Sensors" },
  { value: "drone", label: "Drone / Flight" },
  { value: "graduation", label: "Graduation (STEM)" },
  { value: "wifi", label: "Wifi (IoT)" },
  { value: "code", label: "Code (Dev Boards)" },
  { value: "chip", label: "Chip (Components)" },
];

function getBadgeIcon(icon?: string) {
  switch (icon) {
    case "robot":
      return <Bot className="w-4 h-4" />;
    case "cpu":
      return <Cpu className="w-4 h-4" />;
    case "radio":
      return <Radio className="w-4 h-4" />;
    case "drone":
      return <Navigation className="w-4 h-4" />;
    case "graduation":
      return <GraduationCap className="w-4 h-4" />;
    case "wifi":
      return <Wifi className="w-4 h-4" />;
    case "code":
      return <Code className="w-4 h-4" />;
    case "chip":
      return <Layers className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

export default function AdminCategoryShowcasePage() {
  const [items, setItems] = useState<CategoryCardItem[]>(DEFAULT_CATEGORY_SHOWCASE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryCardItem | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formProductCount, setFormProductCount] = useState("");
  const [formThemeColor, setFormThemeColor] = useState<string>("blue");
  const [formBadgeIcon, setFormBadgeIcon] = useState<string>("robot");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSlug, setFormSlug] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImageAlt, setFormImageAlt] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/category-showcase");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setItems(json.data);
        }
      } catch (e: any) {
        console.warn("Using default showcase categories:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenEdit = (item: CategoryCardItem) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormTagline(item.tagline || "");
    setFormProductCount(item.productCount || "");
    setFormThemeColor(item.themeColor || "blue");
    setFormBadgeIcon(item.badgeIcon || "robot");
    setFormIsFeatured(item.isFeatured ?? false);
    setFormSlug(item.slug || "");
    setFormHref(item.href || `/categories/${item.slug}`);
    setFormImage(item.image || "");
    setFormImageAlt(item.imageAlt || item.name || "");
    setFormIsActive(item.isActive !== false);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("New Category");
    setFormTagline("Build. Innovate. Create.");
    setFormProductCount("50+ Products");
    setFormThemeColor("blue");
    setFormBadgeIcon("cpu");
    setFormIsFeatured(false);
    setFormSlug("new-category");
    setFormHref("/categories/new-category");
    setFormImage("/products/arduino_cutout.png");
    setFormImageAlt("New Category Card");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "Please upload an image file (PNG, JPG, WebP, SVG)");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", formSlug || "category");

      const res = await fetch("/api/category-showcase/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Upload failed");
      }

      setFormImage(json.url);
      showToast("success", "Image uploaded successfully!");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveModal = () => {
    if (!formImage.trim()) {
      showToast("error", "Image URL or uploaded file is required");
      return;
    }

    const updatedItem: CategoryCardItem = {
      id: editingItem?.id || formSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `cat-${Date.now()}`,
      name: formName.trim() || "Category",
      tagline: formTagline.trim(),
      productCount: formProductCount.trim(),
      badgeIcon: (formBadgeIcon as any) || "robot",
      themeColor: (formThemeColor as any) || "blue",
      isFeatured: formIsFeatured,
      slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      href: formHref.trim() || `/categories/${formSlug.trim()}`,
      image: formImage.trim(),
      imageAlt: formImageAlt.trim() || formName.trim() || "Category Card",
      sortOrder: editingItem?.sortOrder ?? items.length + 1,
      isActive: formIsActive,
      showOverlay: true,
    };

    let nextItems: CategoryCardItem[];
    if (editingItem) {
      nextItems = items.map((it) => (it.id === editingItem.id ? updatedItem : it));
    } else {
      nextItems = [...items, updatedItem];
    }

    setItems(nextItems);
    setIsModalOpen(false);
    showToast("success", `${updatedItem.name} updated. Click "Save to Live Store" to publish!`);
  };

  const handleDelete = (id: string) => {
    if (items.length <= 1) {
      showToast("error", "You must keep at least 1 category showcase card.");
      return;
    }
    if (confirm("Are you sure you want to remove this category showcase card?")) {
      const nextItems = items.filter((it) => it.id !== id);
      setItems(nextItems);
      showToast("success", "Card removed. Click 'Save to Live Store' to apply.");
    }
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const reordered = newItems.map((it, idx) => ({ ...it, sortOrder: idx + 1 }));
    setItems(reordered);
  };

  const handleSaveToStore = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/category-showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Save failed");
      }

      showToast("success", "🎉 Category showcase cards published live to homepage!");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to publish categories.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (confirm("Reset showcase category cards to initial 8 default cards?")) {
      setItems(DEFAULT_CATEGORY_SHOWCASE);
      try {
        await fetch("/api/category-showcase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(DEFAULT_CATEGORY_SHOWCASE),
        });
        showToast("success", "Reset to 8 default category cards.");
      } catch {
        showToast("error", "Failed to write reset defaults to disk.");
      }
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 ${
            toast.type === "success"
              ? "bg-emerald-900/90 text-emerald-100 border-emerald-500/40"
              : "bg-red-900/90 text-red-100 border-red-500/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/categories"
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Back to Categories"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#2563EB]" />
              <span>Category Showcase Cards</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-9">
            Manage the pastel category cards shown under &apos;Shop by Category&apos; on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            title="Reset to initial 8 default showcase cards"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0A233F] hover:bg-[#123660] active:scale-95 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>

          <button
            onClick={handleSaveToStore}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#FFC20E] hover:bg-[#E5AC0D] active:scale-95 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Publishing..." : "Save to Live Store"}</span>
          </button>
        </div>
      </div>

      {/* Visual Preview Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Live Interactive Preview ({items.length} Cards)</span>
          </h2>
          <span className="text-xs text-slate-500">
            Click &apos;Edit&apos; on any card to update theme, icons, product count, and cutout image
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-medium">Loading categories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 pb-4">
            {items.map((cat, idx) => (
              <div
                key={cat.id}
                className={`relative group bg-white rounded-2xl border p-3 transition-all shadow-xs hover:shadow-md ${
                  cat.isActive === false ? "opacity-50 border-dashed border-slate-300" : "border-slate-200"
                }`}
              >
                {/* Order Badge & Controls Toolbar */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-400 flex items-center gap-1">
                    #{idx + 1}
                    {cat.isFeatured && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                        Featured 2-Col
                      </span>
                    )}
                    {cat.isActive === false && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-semibold">
                        Hidden
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, "left")}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "right")}
                      disabled={idx === items.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer font-bold ml-1"
                      title="Edit Image & Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Appearance Preview */}
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-3.5 flex flex-col justify-between border border-slate-100">
                  <div className="relative z-10 max-w-[65%]">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mb-1.5">
                      {getBadgeIcon(cat.badgeIcon)}
                    </div>
                    <span className="block font-bold text-slate-900 text-[13px] leading-tight truncate">
                      {cat.name}
                    </span>
                    {cat.tagline && (
                      <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
                        {cat.tagline}
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600">
                      {cat.productCount || "50+ Products"}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="absolute -bottom-1 -right-1 w-20 h-20 pointer-events-none">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="100px"
                      className="object-contain object-bottom-right"
                    />
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[150px] font-mono text-[10px] text-slate-400">
                    {cat.href}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="text-[#2563EB] hover:underline font-semibold cursor-pointer shrink-0"
                  >
                    Edit Card
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? `Edit "${editingItem.name}"` : "Add Showcase Category Card"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Robotics Kits"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Build. Learn. Create."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Count Badge</label>
                  <input
                    type="text"
                    value={formProductCount}
                    onChange={(e) => setFormProductCount(e.target.value)}
                    placeholder="e.g. 120+ Products"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Link (URL)</label>
                  <input
                    type="text"
                    value={formHref}
                    onChange={(e) => setFormHref(e.target.value)}
                    placeholder="/categories/robotics"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Theme Pastel Color</label>
                  <select
                    value={formThemeColor}
                    onChange={(e) => setFormThemeColor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {THEME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Icon</label>
                  <select
                    value={formBadgeIcon}
                    onChange={(e) => setFormBadgeIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Is Featured checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsFeatured"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="formIsFeatured" className="font-semibold text-slate-800 cursor-pointer">
                  Featured Card (spans 2 columns on desktop)
                </label>
              </div>

              {/* Cutout Image Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block font-bold text-slate-900">
                  Product Cutout Image <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/webp,image/jpeg,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="card-file-upload"
                  />
                  <label
                    htmlFor="card-file-upload"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm text-xs shrink-0"
                  >
                    {uploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload Cutout Image"}</span>
                  </label>

                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/products/arduino_cutout.png"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>

                {/* Presets Picker */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    Select from cutout library:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          setFormImage(preset.url);
                          setFormImageAlt(preset.name);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border cursor-pointer transition-all ${
                          formImage === preset.url
                            ? "bg-blue-600 text-white border-blue-600 font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
