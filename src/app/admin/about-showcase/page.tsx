// src/app/admin/about-showcase/page.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Eye,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Plane,
  ShieldCheck,
  Award,
  Bot,
  Cpu,
  Wrench,
  Loader2,
  Check,
} from "lucide-react";
import {
  AboutShowcaseItem,
  DEFAULT_ABOUT_SHOWCASE,
  ShowcaseIconType,
  ShowcaseBubbleColor,
  BUBBLE_COLOR_MAP,
  sortShowcaseItems,
} from "@/data/aboutShowcaseData";

const ICON_OPTIONS: { id: ShowcaseIconType; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "Mentorship (Users)", icon: Users },
  { id: "plane", label: "Flight / Drone (Plane)", icon: Plane },
  { id: "shield", label: "QC Verification (Shield)", icon: ShieldCheck },
  { id: "award", label: "Certification (Award)", icon: Award },
  { id: "bot", label: "Robotics (Bot)", icon: Bot },
  { id: "cpu", label: "Silicon / Chips (CPU)", icon: Cpu },
  { id: "wrench", label: "Turnkey Lab (Wrench)", icon: Wrench },
];

const COLOR_OPTIONS: { id: ShowcaseBubbleColor; label: string; colorClass: string; borderClass: string }[] = [
  { id: "amber", label: "Amber Gold", colorClass: "bg-[#FFC20E] text-slate-900", borderClass: "border-[#FFC20E]" },
  { id: "blue", label: "Vibrant Blue", colorClass: "bg-[#2563EB] text-white", borderClass: "border-[#2563EB]" },
  { id: "emerald", label: "Emerald Green", colorClass: "bg-emerald-600 text-white", borderClass: "border-emerald-600" },
  { id: "purple", label: "Tech Purple", colorClass: "bg-purple-600 text-white", borderClass: "border-purple-600" },
  { id: "rose", label: "Coral Rose", colorClass: "bg-rose-600 text-white", borderClass: "border-rose-600" },
];

export default function AdminAboutShowcasePage() {
  const [items, setItems] = useState<AboutShowcaseItem[]>(DEFAULT_ABOUT_SHOWCASE);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutShowcaseItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("");
  const [iconType, setIconType] = useState<ShowcaseIconType>("users");
  const [bubbleColor, setBubbleColor] = useState<ShowcaseBubbleColor>("amber");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/about-showcase");
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (e) {
      console.error("Error loading showcase items:", e);
      showNotification("Failed to load showcase items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setBadge("");
    setIconType("users");
    setBubbleColor("amber");
    setDescription("");
    setImageUrl("");
    setAlt("");
    setDisplayOrder(items.length + 1);
    setIsActive(true);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AboutShowcaseItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setBadge(item.badge);
    setIconType(item.iconType);
    setBubbleColor(item.bubbleColor);
    setDescription(item.description);
    setImageUrl(item.image);
    setAlt(item.alt);
    setDisplayOrder(item.displayOrder);
    setIsActive(item.isActive);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showNotification("File size exceeds 15MB limit.", "error");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/about-showcase/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        setImageUrl(data.url);
        if (!title) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          setTitle(autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1));
        }
        showNotification(`Uploaded ${data.originalName || file.name} successfully!`);
      } else {
        setUploadError(data?.message || "Upload failed.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      setUploadError("Network error during file upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !imageUrl.trim()) {
      showNotification("Title and Picture are required.", "error");
      return;
    }

    setLoading(true);

    const payload: Partial<AboutShowcaseItem> = {
      title: title.trim(),
      badge: badge.trim() || "Showcase",
      iconType,
      bubbleColor,
      description: description.trim(),
      image: imageUrl.trim(),
      alt: alt.trim() || title.trim(),
      displayOrder: Number(displayOrder) || 1,
      isActive,
    };

    try {
      if (editingItem) {
        // Update existing item
        const res = await fetch("/api/about-showcase", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...payload }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("Showcase card updated successfully!");
          closeModal();
          fetchItems();
        } else {
          showNotification(json.message || "Failed to update item", "error");
        }
      } else {
        // Create new item
        const res = await fetch("/api/about-showcase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          showNotification("New showcase picture added successfully!");
          closeModal();
          fetchItems();
        } else {
          showNotification(json.message || "Failed to add item", "error");
        }
      }
    } catch (e) {
      console.error("Save error:", e);
      showNotification("Failed to save showcase card", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${itemTitle}" from the About page showcase?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/about-showcase?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showNotification("Item removed successfully.");
        fetchItems();
      } else {
        showNotification(json.message || "Failed to delete item", "error");
      }
    } catch (e) {
      console.error("Delete error:", e);
      showNotification("Failed to delete item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item: AboutShowcaseItem) => {
    try {
      const res = await fetch("/api/about-showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification(`Card ${!item.isActive ? "activated" : "hidden from site"}.`);
        fetchItems();
      }
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const sorted = sortShowcaseItems(items);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const temp = sorted[index].displayOrder;
    sorted[index].displayOrder = sorted[targetIndex].displayOrder;
    sorted[targetIndex].displayOrder = temp;

    try {
      setLoading(true);
      const res = await fetch("/api/about-showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sorted),
      });
      const json = await res.json();
      if (json.success) {
        showNotification("Display order updated.");
        fetchItems();
      }
    } catch (e) {
      console.error("Reorder error:", e);
    } finally {
      setLoading(false);
    }
  };

  const CurrentIconComponent =
    ICON_OPTIONS.find((opt) => opt.id === iconType)?.icon || Users;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              About Page Showcase Gallery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage the showcase pictures, tags, icons, and captions displayed in the "Our Aim At Prayog India" section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Eye className="w-4 h-4 text-[#2563EB]" />
            <span>View Live /about</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Picture</span>
          </button>
        </div>
      </div>

      {/* Notification Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-2xl text-xs font-bold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Pictures
          </span>
          <div className="text-2xl font-black text-slate-900">{items.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active on Site
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {items.filter((i) => i.isActive).length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Live Carousel Section
          </span>
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Our Aim At Prayog India</span>
          </div>
        </div>
      </div>

      {/* Showcase Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Showcase Cards ({items.length})
          </h2>
          <button
            onClick={fetchItems}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortShowcaseItems(items).map((item, idx) => {
            const IconComp =
              ICON_OPTIONS.find((o) => o.id === item.iconType)?.icon || Users;
            const bubbleClass = BUBBLE_COLOR_MAP[item.bubbleColor] || "bg-[#FFC20E] text-slate-900";

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                  item.isActive ? "border-slate-200" : "border-slate-200/60 opacity-60"
                }`}
              >
                {/* Image & Floating Badge Preview */}
                <div className="relative aspect-[10/9] bg-slate-900 overflow-hidden group">
                  <Image
                    src={item.image}
                    alt={item.alt || item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Floating Badge Tag ("Tip") */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md pl-1.5 pr-3 py-1 rounded-full shadow-md border border-white/80">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${bubbleClass}`}
                      >
                        <IconComp className="w-3 h-3" />
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 tracking-tight">
                        {item.badge}
                      </span>
                    </span>
                  </div>

                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.isActive
                          ? "bg-emerald-500/90 text-white backdrop-blur-sm"
                          : "bg-slate-700/90 text-slate-200 backdrop-blur-sm"
                      }`}
                    >
                      {item.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      #{item.displayOrder}
                    </span>
                  </div>

                  {/* Quick Bottom Preview Title */}
                  <div className="absolute bottom-3 left-3 right-12 z-10">
                    <h3 className="text-xs font-bold text-white truncate drop-shadow-sm">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Card Info & Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <span>Tag:</span>
                      <strong className="text-slate-700">{item.badge}</strong>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(idx, "down")}
                        disabled={idx === items.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? "Hide from website" : "Show on website"}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-all ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {item.isActive ? "Live" : "Draft"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Edit Picture Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        title="Delete Picture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add / Edit Showcase Picture */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
                  {editingItem ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {editingItem ? "Edit Showcase Picture" : "Add Picture to Showcase"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload a high-resolution photo and configure the badge tag and caption.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Image Upload Zone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Picture / Photo <span className="text-rose-500">*</span>
                </label>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-[#2563EB] bg-blue-50/60"
                      : "border-slate-300 hover:border-[#2563EB]/70 bg-slate-50/50 hover:bg-blue-50/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                      <span className="text-xs font-bold text-slate-700">Uploading picture...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-2xs shrink-0">
                          <Image src={imageUrl} alt="Uploaded preview" fill className="object-cover" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <Check className="w-3.5 h-3.5" /> Picture Selected
                          </span>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{imageUrl}</p>
                          <span className="text-[10px] text-slate-400">Click to change picture</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageUrl("");
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove Picture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#2563EB]">Click to upload picture</span>
                        <span className="text-xs text-slate-500"> or drag and drop here</span>
                      </div>
                      <span className="text-[11px] text-slate-400">JPG, PNG, WebP up to 15MB</span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs font-semibold text-rose-600">{uploadError}</p>
                )}

                {/* Optional manual URL input */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">Or paste image URL:</span>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or /images/..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Tag / Badge Label & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Badge Tag Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Hands-On Mentorship"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <span className="text-[10px] text-slate-400">
                    Displays in the floating white pill tag
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Tag Icon
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ICON_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = iconType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIconType(opt.id)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all text-center ${
                            isSelected
                              ? "bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs font-bold"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[9px] truncate w-full">{opt.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tag Bubble Color Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tag Bubble Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((col) => {
                    const isSelected = bubbleColor === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setBubbleColor(col.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                          isSelected
                            ? "ring-2 ring-[#2563EB] border-[#2563EB] bg-blue-50/50"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${col.colorClass}`} />
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Card Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Flight & Arena Demonstrations"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Card Caption / Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activity, lab facility, or engineering capability..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-normal focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Status on Site
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        Active (Visible in live carousel)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Preview of Tag on Photo */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Live Tag Preview:
                </span>
                <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md pl-1.5 pr-3.5 py-1 rounded-full shadow-md border border-white/80">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                      BUBBLE_COLOR_MAP[bubbleColor] || "bg-[#FFC20E] text-slate-900"
                    }`}
                  >
                    <CurrentIconComponent className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-slate-900 tracking-tight">
                    {badge || "Tag Preview"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Add to Showcase"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
