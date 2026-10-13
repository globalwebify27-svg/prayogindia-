"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  X,
  ExternalLink,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import {
  HeroBanner,
  DEFAULT_HERO_BANNERS,
  sortHeroBanners,
} from "@/data/heroBannersData";

const PRESET_IMAGES = [
  {
    name: "Robot Rover Kit",
    url: "/images/robot_banner_stem.jpg",
    note: "From\nConcept\nto Creation",
  },
  {
    name: "Drone UAV Lab",
    url: "/images/drone_banner_lab.jpg",
    note: "Engineered\nfor Flight\nPrecision",
  },
  {
    name: "STEM AI & IoT",
    url: "/images/stem_robot_banner.jpg",
    note: "Powering\nNext-Gen\nMakers",
  },
];

const PRESET_LINKS = [
  { label: "All Products", url: "/products" },
  { label: "Robotics Kits", url: "/categories/robotics" },
  { label: "Drone Technology", url: "/categories/drone-technology" },
  { label: "IoT & AI Modules", url: "/categories/iot" },
  { label: "Arduino Boards", url: "/categories/arduino-development-boards" },
  { label: "Lab Services", url: "/services" },
  { label: "Deals & Offers", url: "/offers" },
];

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Form Fields
  const [badge, setBadge] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [titleHighlight, setTitleHighlight] = useState("");
  const [description, setDescription] = useState("");
  const [primaryBtnText, setPrimaryBtnText] = useState("");
  const [primaryBtnLink, setPrimaryBtnLink] = useState("");
  const [secondaryBtnText, setSecondaryBtnText] = useState("");
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [noteLinesRaw, setNoteLinesRaw] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Preview Selected Index
  const [previewIndex, setPreviewIndex] = useState(0);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      showNotification("File size exceeds 15MB limit.", "error");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/banners/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        setImageUrl(data.url);
        showNotification(
          `Uploaded ${data.originalName || file.name} (${(data.format || "img").toUpperCase()}) successfully!`
        );
      } else {
        const msg = data?.message || "Upload failed.";
        setUploadError(msg);
        showNotification(msg, "error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error during upload.";
      setUploadError(msg);
      showNotification(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/banners");
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setBanners(sortHeroBanners(json.data));
      }
    } catch (e) {
      console.error("Failed to fetch banners:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setBadge("🇮🇳 India's #1 Robotics & Electronics Platform");
    setTitlePrefix("Build. Learn.");
    setTitleHighlight("Innovate.");
    setDescription(
      "Premium quality robotics kits, microcontrollers, sensors and electronic components for students, makers and professionals."
    );
    setPrimaryBtnText("Explore Products");
    setPrimaryBtnLink("/products");
    setSecondaryBtnText("Explore Services");
    setSecondaryBtnLink("/services");
    setImageUrl("/images/robot_banner_stem.jpg");
    setNoteLinesRaw("From\nConcept\nto Creation");
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: HeroBanner) => {
    setEditingBanner(b);
    setBadge(b.badge || "");
    setTitlePrefix(b.titlePrefix || "");
    setTitleHighlight(b.titleHighlight || "");
    setDescription(b.description || "");
    setPrimaryBtnText(b.primaryButtonText || "");
    setPrimaryBtnLink(b.primaryButtonLink || "/products");
    setSecondaryBtnText(b.secondaryButtonText || "");
    setSecondaryBtnLink(b.secondaryButtonLink || "");
    setImageUrl(b.image || "");
    setNoteLinesRaw(b.noteLines ? b.noteLines.join("\n") : "");
    setDisplayOrder(b.displayOrder);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titlePrefix.trim() && !badge.trim()) {
      showNotification("Please provide a Title Prefix or Badge text.", "error");
      return;
    }

    const payload: HeroBanner = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      badge: badge.trim(),
      titlePrefix: titlePrefix.trim(),
      titleHighlight: titleHighlight.trim(),
      description: description.trim(),
      primaryButtonText: primaryBtnText.trim(),
      primaryButtonLink: primaryBtnLink.trim() || "/products",
      secondaryButtonText: secondaryBtnText.trim(),
      secondaryButtonLink: secondaryBtnLink.trim(),
      image: imageUrl.trim() || "/images/robot_banner_stem.jpg",
      alt: `${titlePrefix} ${titleHighlight}`,
      noteLines: noteLinesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      displayOrder: Number(displayOrder) || 1,
      isActive,
      theme: "blue-gradient",
    };

    try {
      const method = editingBanner ? "PUT" : "POST";
      const res = await fetch("/api/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success && data?.all) {
        setBanners(sortHeroBanners(data.all));
      } else {
        fetchBanners();
      }
      setIsModalOpen(false);
      showNotification(
        editingBanner
          ? "Hero banner updated successfully!"
          : "New hero banner published to website!"
      );
    } catch {
      showNotification("Failed to save banner.", "error");
    }
  };

  const handleToggleActive = async (b: HeroBanner) => {
    const updated = { ...b, isActive: !b.isActive };
    try {
      const res = await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data?.all) setBanners(sortHeroBanners(data.all));
      showNotification(`Banner ${updated.isActive ? "activated" : "deactivated"}.`);
    } catch {
      showNotification("Failed to update status.", "error");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const list = [...banners];
    const current = list[index];
    const swapWith = list[targetIndex];

    const currentOrder = current.displayOrder;
    current.displayOrder = swapWith.displayOrder;
    swapWith.displayOrder = currentOrder;

    try {
      await Promise.all([
        fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(current),
        }),
        fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(swapWith),
        }),
      ]);
      fetchBanners();
    } catch {
      showNotification("Failed to reorder banners.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`/api/banners?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.all) setBanners(sortHeroBanners(data.all));
      showNotification("Banner deleted successfully.");
    } catch {
      showNotification("Failed to delete banner.", "error");
    }
  };

  const activeBanners = banners.filter((b) => b.isActive);
  const previewBanner = banners[previewIndex] || banners[0] || DEFAULT_HERO_BANNERS[0];

  return (
    <div className="space-y-6 select-none">
      {/* CMS Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <div className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0062E0] text-white flex items-center gap-2 shadow-xs">
          <span>Hero Showcase Banners</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
            Home Hero
          </span>
        </div>
        <Link
          href="/admin/cms"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0062E0] hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <span>Website Announcement Bar</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            Top Bar
          </span>
        </Link>
      </div>

      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062E0] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hero Showcase Banners
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-[#0062E0]">
              {banners.length} Slides ({activeBanners.length} Live)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage the main homepage showcase banners. All headlines, badges, descriptions,
            and CTA buttons are rendered as <strong>real dynamic HTML text and interactive buttons</strong> over the banner artwork.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>
          <button
            onClick={openCreateModal}
            className="bg-[#0062E0] hover:bg-[#0052CC] active:scale-[0.98] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-[#0062E0]/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Live Visual Preview of Selected Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0062E0]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Banner Canvas Preview (How Customers See It)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Slide Preview:</span>
            {banners.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setPreviewIndex(idx)}
                className={`px-2 py-0.5 rounded-md font-semibold text-xs cursor-pointer ${
                  previewIndex === idx
                    ? "bg-[#0062E0] text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* The Live Render Mockup (Full-Bleed 100% Cover, Sleek Border-Radius) */}
        <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden min-h-[220px] flex items-center p-5 sm:p-7 bg-slate-900">
          {/* Full-bleed background image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <img
              src={previewBanner.image}
              alt={previewBanner.alt}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:w-[65%]" />
          </div>

          {/* Real Dynamic HTML Content */}
          <div className="w-full sm:w-[60%] space-y-2.5 z-10 text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {previewBanner.titlePrefix}{" "}
              <span className="text-[#0062E0]">
                {previewBanner.titleHighlight}
              </span>
            </h2>
            <p className="text-xs text-slate-600 line-clamp-2 max-w-lg">
              {previewBanner.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="bg-[#0062E0] text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                <span>{previewBanner.primaryButtonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              {previewBanner.secondaryButtonText && (
                <span className="bg-white text-[#0062E0] font-semibold px-4 py-2 rounded-xl text-xs border border-[#BFDBFE] shadow-2xs">
                  {previewBanner.secondaryButtonText}
                </span>
              )}
            </div>
          </div>

          {/* Indicator dots mockup */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 bg-white/85 px-2.5 py-1 rounded-full border border-slate-200">
            {banners.map((_, idx) => (
              <span
                key={idx}
                className={`rounded-full ${
                  previewIndex === idx
                    ? "w-4 h-1.5 bg-[#0062E0]"
                    : "w-1.5 h-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Banners Management List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">
              Active Showcase Banners Queue ({banners.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Drag or use arrows to change rotation sequence
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                banner.isActive ? "hover:bg-slate-50/60" : "bg-slate-50/40 opacity-75"
              }`}
            >
              {/* Left: Thumbnail & Content Details */}
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Order controls */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveOrder(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-600">
                    #{banner.displayOrder}
                  </span>
                  <button
                    onClick={() => handleMoveOrder(index, "down")}
                    disabled={index === banners.length - 1}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div className="w-24 sm:w-32 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative group">
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">
                      {banner.image.split("/").pop()}
                    </span>
                  </div>
                </div>

                {/* Text & Button Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0062E0] border border-blue-200">
                      {banner.badge}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        banner.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {banner.isActive ? "Live on Website" : "Inactive"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                    {banner.titlePrefix}{" "}
                    <span className="text-[#0062E0]">{banner.titleHighlight}</span>
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                    {banner.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      CTA 1:{" "}
                      <span className="text-[#0062E0]">
                        &quot;{banner.primaryButtonText}&quot;
                      </span>{" "}
                      &rarr; {banner.primaryButtonLink}
                    </span>
                    {banner.secondaryButtonText && (
                      <span className="flex items-center gap-1">
                        CTA 2: &quot;{banner.secondaryButtonText}&quot; &rarr;{" "}
                        {banner.secondaryButtonLink}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    banner.isActive
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {banner.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => openEditModal(banner)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#0062E0] cursor-pointer transition-colors"
                  title="Edit Banner"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">No hero showcase banners found.</p>
              <button
                onClick={openCreateModal}
                className="bg-[#0062E0] text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Create Your First Banner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingBanner ? "Edit Hero Showcase Banner" : "Add New Hero Showcase Banner"}
                </h3>
                <p className="text-xs text-slate-500">
                  Text and buttons will be live dynamic elements rendered over the banner artwork.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Badge Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pill Badge Text
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. 🇮🇳 India's #1 Robotics & Electronics Platform"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                />
              </div>

              {/* Title & Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Headline Prefix
                  </label>
                  <input
                    type="text"
                    value={titlePrefix}
                    onChange={(e) => setTitlePrefix(e.target.value)}
                    placeholder="e.g. Build. Learn."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Headline Highlight (Blue Color)
                  </label>
                  <input
                    type="text"
                    value={titleHighlight}
                    onChange={(e) => setTitleHighlight(e.target.value)}
                    placeholder="e.g. Innovate."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0062E0] font-bold focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description highlighting what makers, students, or institutions can build..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                />
              </div>

              {/* Primary CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <div>
                  <label className="block text-xs font-bold text-[#0062E0] mb-1">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={primaryBtnText}
                    onChange={(e) => setPrimaryBtnText(e.target.value)}
                    placeholder="e.g. Explore Products"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:border-[#0062E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0062E0] mb-1">
                    Primary Button Target Link
                  </label>
                  <input
                    type="text"
                    value={primaryBtnLink}
                    onChange={(e) => setPrimaryBtnLink(e.target.value)}
                    placeholder="e.g. /products"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:border-[#0062E0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Secondary CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Secondary Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={secondaryBtnText}
                    onChange={(e) => setSecondaryBtnText(e.target.value)}
                    placeholder="e.g. Explore Services"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:border-[#0062E0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Secondary Button Target Link
                  </label>
                  <input
                    type="text"
                    value={secondaryBtnLink}
                    onChange={(e) => setSecondaryBtnLink(e.target.value)}
                    placeholder="e.g. /services"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:border-[#0062E0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Banner Artwork Image & Multi-Format File Uploader */}
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Banner Artwork Image / File
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0062E0]">
                    PNG • JPG • JPEG • AVIF • WEBP • PDF
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.avif,.pdf,image/png,image/jpeg,image/webp,image/avif,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-[#0062E0] bg-blue-50/60"
                      : "border-slate-300 hover:border-[#0062E0] bg-white hover:bg-blue-50/20"
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-2">
                      <Loader2 className="w-6 h-6 text-[#0062E0] animate-spin" />
                      <span className="text-xs font-bold text-slate-700">
                        Uploading & processing artwork...
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Optimizing for instant display across devices
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062E0] flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        <span className="text-[#0062E0] hover:underline">
                          Click to upload
                        </span>{" "}
                        or drag & drop
                      </div>
                      <p className="text-[10.5px] text-slate-500">
                        Supports <strong>PNG, JPG, JPEG, AVIF, WEBP, PDF</strong> (up to 15MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded File / Current Image Preview */}
                {imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    {imageUrl.toLowerCase().endsWith(".pdf") ? (
                      <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex flex-col items-center justify-center shrink-0 border border-red-100">
                        <FileText className="w-5 h-5" />
                        <span className="text-[8px] font-bold">PDF</span>
                      </div>
                    ) : (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img
                          src={imageUrl}
                          alt="Banner artwork preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {imageUrl.split("/").pop()}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {imageUrl}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Clear artwork"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Or paste an Image URL:
                    </label>
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="e.g. /images/robot_banner_stem.jpg or Cloudinary URL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                  />
                </div>

                {/* Preset image buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Quick Presets:
                  </span>
                  {PRESET_IMAGES.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => {
                        setImageUrl(p.url);
                        setNoteLinesRaw(p.note);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#0062E0] text-[10.5px] font-semibold text-slate-700 hover:text-[#0062E0] bg-white cursor-pointer transition-colors shadow-2xs"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handwritten Note Callout */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Handwritten Callout Note Lines (Optional)
                </label>
                <textarea
                  rows={2}
                  value={noteLinesRaw}
                  onChange={(e) => setNoteLinesRaw(e.target.value)}
                  placeholder="One line per row, e.g.&#10;From&#10;Concept&#10;to Creation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                />
              </div>

              {/* Display Order & Active Checkbox */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="bannerActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0062E0] focus:ring-[#0062E0]"
                  />
                  <label
                    htmlFor="bannerActiveCheckbox"
                    className="text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    Active on Website
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0062E0] hover:bg-[#0052CC] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm shadow-[#0062E0]/20 cursor-pointer transition-all"
                >
                  {editingBanner ? "Save Changes" : "Create Showcase Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
