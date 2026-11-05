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
  Smartphone,
  Link2,
  Upload,
} from "lucide-react";
import {
  HeroBanner,
  DEFAULT_HERO_BANNERS,
  sortHeroBanners,
} from "@/data/heroBannersData";
import {
  ProductPromoBanner,
  DEFAULT_PRODUCT_PROMO_BANNER,
} from "@/data/productPromoBannerData";

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
  const [activeCmsTab, setActiveCmsTab] = useState<"hero" | "product_promo">("hero");
  const [banners, setBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Product Promo Banner State
  const [promoBanner, setPromoBanner] = useState<ProductPromoBanner>(
    DEFAULT_PRODUCT_PROMO_BANNER
  );
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);
  const [uploadingPromoImg, setUploadingPromoImg] = useState(false);
  const promoFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Form Fields
  const [badge, setBadge] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [titleHighlight, setTitleHighlight] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [primaryBtnText, setPrimaryBtnText] = useState("");
  const [primaryBtnLink, setPrimaryBtnLink] = useState("");
  const [secondaryBtnText, setSecondaryBtnText] = useState("");
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [noteLinesRaw, setNoteLinesRaw] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [showTextOverlay, setShowTextOverlay] = useState<boolean>(false);

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
      const res = await fetch(`/api/banners?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
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

  const fetchPromoBanner = async () => {
    try {
      setLoadingPromo(true);
      const res = await fetch(`/api/banners/promo?_t=${Date.now()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        setPromoBanner(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch product promo banner:", e);
    } finally {
      setLoadingPromo(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchPromoBanner();
  }, []);

  const handleSavePromoBanner = async () => {
    try {
      setSavingPromo(true);
      const res = await fetch("/api/banners/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoBanner),
      });
      const data = await res.json();
      if (data?.success && data?.data) {
        setPromoBanner(data.data);
        showNotification("Product promo banner published to website successfully!");
      } else {
        showNotification(data?.message || "Failed to update banner.", "error");
      }
    } catch {
      showNotification("Error saving promo banner.", "error");
    } finally {
      setSavingPromo(false);
    }
  };

  const handlePromoImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showNotification("File size exceeds 15MB limit.", "error");
      return;
    }
    setUploadingPromoImg(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/banners/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        setPromoBanner((prev) => ({
          ...prev,
          bannerImageUrl: data.url,
          useCustomImage: true,
        }));
        showNotification("Banner artwork uploaded successfully!");
      } else {
        showNotification(data?.message || "Upload failed.", "error");
      }
    } catch {
      showNotification("Upload failed.", "error");
    } finally {
      setUploadingPromoImg(false);
    }
  };

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setShowTextOverlay(false);
    setBadge("");
    setTitlePrefix("");
    setTitleHighlight("");
    setSubtitle("");
    setDescription("");
    setPrimaryBtnText("Explore Products");
    setPrimaryBtnLink("/products");
    setSecondaryBtnText("");
    setSecondaryBtnLink("");
    setImageUrl("");
    setNoteLinesRaw("");
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: HeroBanner) => {
    setEditingBanner(b);
    setShowTextOverlay(
      b.showTextOverlay ??
        Boolean(b.titlePrefix && b.titlePrefix.trim() !== "." && b.titlePrefix.trim().length > 1)
    );
    setBadge(b.badge || "");
    setTitlePrefix(b.titlePrefix === "." ? "" : b.titlePrefix || "");
    setTitleHighlight(b.titleHighlight || "");
    setSubtitle(b.subtitle || "");
    setDescription(b.description === "." ? "" : b.description || "");
    setPrimaryBtnText(b.primaryButtonText || "Explore Products");
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
    if (!imageUrl.trim()) {
      showNotification("Please upload or provide a banner artwork image.", "error");
      return;
    }

    const payload: HeroBanner = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      badge: badge.trim(),
      titlePrefix: titlePrefix.trim(),
      titleHighlight: titleHighlight.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      primaryButtonText: primaryBtnText.trim() || "Explore Products",
      primaryButtonLink: primaryBtnLink.trim() || "/products",
      secondaryButtonText: secondaryBtnText.trim(),
      secondaryButtonLink: secondaryBtnLink.trim(),
      image: imageUrl.trim() || "/images/robot_banner_stem.jpg",
      alt: titlePrefix.trim()
        ? `${titlePrefix} ${titleHighlight}`.trim()
        : "Prayog India Robotics Banner",
      noteLines: noteLinesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      displayOrder: Number(displayOrder) || 1,
      isActive,
      showTextOverlay,
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
        <button
          type="button"
          onClick={() => setActiveCmsTab("hero")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeCmsTab === "hero"
              ? "bg-[#0062E0] text-white shadow-xs"
              : "text-slate-600 hover:text-[#0062E0] hover:bg-slate-100"
          }`}
        >
          <span>Hero Showcase Banners</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeCmsTab === "hero" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            Home Hero
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCmsTab("product_promo")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeCmsTab === "product_promo"
              ? "bg-[#0062E0] text-white shadow-xs"
              : "text-slate-600 hover:text-[#0062E0] hover:bg-slate-100"
          }`}
        >
          <span>Product Promo Banner</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeCmsTab === "product_promo" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            Product Page
          </span>
        </button>

        <Link
          href="/admin/cms"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0062E0] hover:bg-slate-100 transition-colors flex items-center gap-2 ml-auto"
        >
          <span>Website Announcement Bar</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            Top Bar
          </span>
        </Link>
      </div>

      {activeCmsTab === "hero" && (
        <>
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
        <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden min-h-[240px] flex items-center p-5 sm:p-7 bg-slate-900">
          {/* Full-bleed background image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <img
              src={previewBanner.image}
              alt={previewBanner.alt}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {/* Real Dynamic HTML Content (Only rendered if showTextOverlay is true or enabled) */}
          {previewBanner.showTextOverlay !== false && (
            <div className="w-full sm:w-[60%] space-y-2 z-10 text-left">
              {(previewBanner.titlePrefix || previewBanner.titleHighlight) && (
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {previewBanner.titlePrefix}{" "}
                  <span className="text-[#2563EB]">
                    {previewBanner.titleHighlight}
                  </span>
                </h2>
              )}

              {/* Subtitle Tagline Separator */}
              {previewBanner.subtitle && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-800 tracking-wide">
                  {previewBanner.subtitle
                    .split("|")
                    .map((word, i, arr) => (
                      <React.Fragment key={i}>
                        <span
                          className={
                            i === arr.length - 1 ? "text-[#2563EB]" : "text-slate-800"
                          }
                        >
                          {word.trim()}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="text-slate-300 font-light">|</span>
                        )}
                      </React.Fragment>
                    ))}
                </div>
              )}

              {previewBanner.description && (
                <p className="text-xs text-slate-600 line-clamp-2 max-w-lg leading-relaxed">
                  {previewBanner.description}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                {previewBanner.primaryButtonText && (
                  <span className="bg-slate-950 text-white font-bold px-5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                    <span>{previewBanner.primaryButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
                {previewBanner.secondaryButtonText && (
                  <span className="bg-white text-slate-800 font-bold px-4 py-2 rounded-full text-xs border border-slate-200/90 shadow-2xs">
                    {previewBanner.secondaryButtonText}
                  </span>
                )}
              </div>
            </div>
          )}

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
              {/* Mode Toggle: Graphic Banner vs Text Overlay */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="pr-3">
                  <span className="block text-xs font-bold text-slate-900">
                    Overlay HTML Text &amp; Buttons over Banner
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    {showTextOverlay
                      ? "Enabled: Title, subtitle tagline, description, and buttons will be rendered over the artwork."
                      : "Disabled (Recommended for designed banners): Shows your 100% clean banner graphic. Clicking anywhere on the banner opens the products page."}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={showTextOverlay}
                    onChange={(e) => setShowTextOverlay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>

              {/* Destination Link (Only shown when text overlay is disabled / Graphic Banner Mode) */}
              {!showTextOverlay && (
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <label className="block text-xs font-bold text-[#0062E0] mb-1">
                    Destination Link (Opens when user clicks banner anywhere)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={primaryBtnLink}
                      onChange={(e) => setPrimaryBtnLink(e.target.value)}
                      placeholder="e.g. /products or /categories/robotics"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:border-[#0062E0] focus:outline-none font-medium"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPrimaryBtnLink("/products")}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0062E0] text-[11px] font-bold text-slate-700 hover:text-[#0062E0] transition-colors cursor-pointer"
                      >
                        /products
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryBtnLink("/offers")}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0062E0] text-[11px] font-bold text-slate-700 hover:text-[#0062E0] transition-colors cursor-pointer"
                      >
                        /offers
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditionally rendered text overlay fields */}
              {showTextOverlay && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                  <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
                    <span>💡</span>
                    <span>
                      <strong>All text fields are completely optional.</strong> You can fill only what you want, or leave any field blank.
                    </span>
                  </div>

                  {/* Badge Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pill Badge Text <span className="font-normal text-slate-400">(Optional)</span>
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
                        Headline Prefix <span className="font-normal text-slate-400">(Optional)</span>
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
                        Headline Highlight (Blue Color) <span className="font-normal text-slate-400">(Optional)</span>
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

                  {/* Subtitle / Separator Tagline (Learn | Code | Build | Innovate) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Tagline / Separator Words <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSubtitle("Learn | Code | Build | Innovate")}
                          className="text-[10.5px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Learn | Code | Build | Innovate
                        </button>
                        <span className="text-slate-300 text-[10px]">•</span>
                        <button
                          type="button"
                          onClick={() => setSubtitle("Design | Fly | Automate")}
                          className="text-[10.5px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Design | Fly | Automate
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Learn | Code | Build | Innovate"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description / Subtitle <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description highlighting what makers, students, or institutions can build..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                    />
                  </div>

                  {/* CTA Action Buttons & Links */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>🔘</span> Action Buttons &amp; Redirection Links <span className="font-normal text-slate-400">(Optional)</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Leave blank to omit button
                      </span>
                    </div>

                    {/* Primary Button */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200/90 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Primary Button Label
                          </label>
                          <input
                            type="text"
                            value={primaryBtnText}
                            onChange={(e) => setPrimaryBtnText(e.target.value)}
                            placeholder="e.g. Explore Products (or Shop Now)"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#0062E0] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Primary Redirection Link
                          </label>
                          <input
                            type="text"
                            value={primaryBtnLink}
                            onChange={(e) => setPrimaryBtnLink(e.target.value)}
                            placeholder="e.g. /products"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#0062E0] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Quick link:</span>
                        {["/products", "/offers", "/categories/robotics"].map((link) => (
                          <button
                            key={link}
                            type="button"
                            onClick={() => setPrimaryBtnLink(link)}
                            className="text-[10.5px] font-bold text-[#0062E0] bg-blue-50/80 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            {link}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Button */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200/90 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Secondary Button Label <span className="font-normal text-slate-400">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={secondaryBtnText}
                            onChange={(e) => setSecondaryBtnText(e.target.value)}
                            placeholder="e.g. Explore Services, Learn More, Shop Now"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#0062E0] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Secondary Button Redirection Link <span className="font-normal text-slate-400">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={secondaryBtnLink}
                            onChange={(e) => setSecondaryBtnLink(e.target.value)}
                            placeholder="e.g. /services, /offers, or /categories/iot"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#0062E0] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Quick link:</span>
                        {["/services", "/offers", "/products", "/categories/robotics"].map((link) => (
                          <button
                            key={link}
                            type="button"
                            onClick={() => setSecondaryBtnLink(link)}
                            className="text-[10.5px] font-bold text-[#0062E0] bg-blue-50/80 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            {link}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
        </>
      )}

      {/* Product Page Promotional Banner Management Tab */}
      {activeCmsTab === "product_promo" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062E0] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Product Page Promotional Banner
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    promoBanner.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {promoBanner.isActive ? "Live on Product Pages" : "Draft / Inactive"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Manage the promotional banner shown next to the Bulk Order box on all product detail pages. Admin can upload custom banner artwork or configure the dynamic offer card, and set custom click-through redirection links.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={fetchPromoBanner}
                disabled={loadingPromo}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPromo ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/product/stm32f103c8t6-blue-pill"
                target="_blank"
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View On Product</span>
              </Link>
              <button
                type="button"
                onClick={handleSavePromoBanner}
                disabled={savingPromo}
                className="bg-[#0062E0] hover:bg-[#0052CC] active:scale-[0.98] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-[#0062E0]/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {savingPromo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save &amp; Publish</span>
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

          {/* 2-Column Grid: Left Controls, Right Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card 1: Banner Redirection Link (User Core Request) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062E0] flex items-center justify-center">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Redirection Link (Click-Through URL)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Where the user will be redirected when clicking anywhere on this banner or its action buttons.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Destination URL or Path *
                  </label>
                  <input
                    type="text"
                    value={promoBanner.redirectUrl}
                    onChange={(e) =>
                      setPromoBanner((prev) => ({ ...prev, redirectUrl: e.target.value }))
                    }
                    placeholder="e.g. /download or https://play.google.com/store/apps/details?id=..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0062E0]/20 focus:border-[#0062E0]"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                    Quick Link Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "App Download Page", url: "/download" },
                      { label: "Deals & Offers", url: "/offers" },
                      { label: "All Products", url: "/products" },
                      { label: "Robotics Kits", url: "/categories/robotics" },
                      {
                        label: "Google Play Store",
                        url: "https://play.google.com/store/apps",
                      },
                      { label: "Apple App Store", url: "https://apps.apple.com" },
                      {
                        label: "WhatsApp Channel",
                        url: "https://whatsapp.com/channel/prayogindia",
                      },
                    ].map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() =>
                          setPromoBanner((prev) => ({ ...prev, redirectUrl: p.url }))
                        }
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                          promoBanner.redirectUrl === p.url
                            ? "bg-[#0062E0] text-white border-[#0062E0]"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-[#0062E0] hover:text-[#0062E0]"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Banner Format (Custom Artwork Image vs Interactive Card) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Banner Type &amp; Artwork
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Choose between an uploaded graphic banner image or an interactive Prayog card.
                    </p>
                  </div>

                  {/* Mode Toggle Pills */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setPromoBanner((prev) => ({ ...prev, useCustomImage: true }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        promoBanner.useCustomImage
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Uploaded Image
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPromoBanner((prev) => ({ ...prev, useCustomImage: false }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !promoBanner.useCustomImage
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Interactive Card
                    </button>
                  </div>
                </div>

                {/* Sub-view A: Upload Custom Artwork Image */}
                {promoBanner.useCustomImage ? (
                  <div className="space-y-3.5">
                    <div
                      onClick={() => promoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-[#0062E0] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
                    >
                      <input
                        ref={promoFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePromoImageUpload(file);
                        }}
                      />
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062E0] flex items-center justify-center mx-auto mb-2">
                        {uploadingPromoImg ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {uploadingPromoImg
                          ? "Uploading artwork image..."
                          : "Click to upload banner artwork image"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        PNG, JPG, or WebP up to 15MB. Recommended ratio: ~2:1 or ~2.5:1 (e.g. 1200x500px).
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Or Paste Direct Banner Image URL
                      </label>
                      <input
                        type="text"
                        value={promoBanner.bannerImageUrl || ""}
                        onChange={(e) =>
                          setPromoBanner((prev) => ({
                            ...prev,
                            bannerImageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://... or /images/..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  /* Sub-view B: Interactive Card Customization */
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Banner Heading Title
                        </label>
                        <input
                          type="text"
                          value={promoBanner.title}
                          onChange={(e) =>
                            setPromoBanner((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. ORDER ON PRAYOG APP"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Subtitle / Slogan
                        </label>
                        <input
                          type="text"
                          value={promoBanner.subtitle}
                          onChange={(e) =>
                            setPromoBanner((prev) => ({
                              ...prev,
                              subtitle: e.target.value,
                            }))
                          }
                          placeholder="e.g. ROBOTICS AT YOUR FINGERTIPS"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Discount Pill Tag
                        </label>
                        <input
                          type="text"
                          value={promoBanner.tagText}
                          onChange={(e) =>
                            setPromoBanner((prev) => ({ ...prev, tagText: e.target.value }))
                          }
                          placeholder="e.g. GET FLAT 5% OFF"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          value={promoBanner.couponCode}
                          onChange={(e) =>
                            setPromoBanner((prev) => ({
                              ...prev,
                              couponCode: e.target.value,
                            }))
                          }
                          placeholder="e.g. PRGAPP"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Phone Screen Badge
                        </label>
                        <input
                          type="text"
                          value={promoBanner.phoneBadgeText}
                          onChange={(e) =>
                            setPromoBanner((prev) => ({
                              ...prev,
                              phoneBadgeText: e.target.value,
                            }))
                          }
                          placeholder="e.g. 5% OFF"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Phone Screen Title
                        </label>
                        <input
                          type="text"
                          value={promoBanner.phoneTitle}
                          onChange={(e) =>
                            setPromoBanner((prev) => ({
                              ...prev,
                              phoneTitle: e.target.value,
                            }))
                          }
                          placeholder="e.g. APP 2.0"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Status Toggle */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Publish Banner on Product Detail Pages
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    When active, this banner appears alongside the Bulk Order box on every product page.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="promoActiveCheck"
                  checked={promoBanner.isActive}
                  onChange={(e) =>
                    setPromoBanner((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="w-5 h-5 rounded text-[#0062E0] focus:ring-[#0062E0] cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSavePromoBanner}
                  disabled={savingPromo}
                  className="w-full py-3 bg-[#0062E0] hover:bg-[#0052CC] text-white rounded-xl font-bold text-xs shadow-md shadow-[#0062E0]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {savingPromo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save &amp; Publish Promotional Banner</span>
                </button>
              </div>
            </div>

            {/* Right Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-200">
                      Live Product Page Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">
                    {promoBanner.useCustomImage ? "Artwork Mode" : "Card Mode"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-3">
                  Clicking this banner on the live product page will redirect to:
                  <span className="block font-mono text-xs text-[#00AEEF] truncate mt-0.5">
                    {promoBanner.redirectUrl || "/download"}
                  </span>
                </p>

                {/* Rendered Live Simulation Card */}
                <div className="overflow-hidden rounded-2xl">
                  {promoBanner.useCustomImage && promoBanner.bannerImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black min-h-[160px] flex items-center justify-center">
                      <img
                        src={promoBanner.bannerImageUrl}
                        alt="Promo Banner Preview"
                        className="w-full h-auto object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded border border-white/20">
                        Redirects ↗
                      </span>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-[#0A1128] via-[#005CA9] to-[#00AEEF] rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 border border-cyan-500/20">
                      {/* Left Phone Mockup */}
                      <div className="relative w-24 h-36 shrink-0 rounded-xl bg-[#061128]/85 border border-cyan-400/30 p-2 shadow-lg flex flex-col items-center justify-between">
                        <div className="w-8 h-1 bg-white/40 rounded-full" />
                        <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-1">
                          <span className="text-[9px] font-black tracking-widest uppercase text-[#00AEEF]">
                            PRAYOG
                          </span>
                          <span className="text-[11px] font-black text-white">
                            {promoBanner.phoneTitle || "APP 2.0"}
                          </span>
                          <span className="text-[8px] bg-[#FFC20E] text-slate-950 font-black px-1.5 py-0.5 rounded-full mt-1.5">
                            {promoBanner.phoneBadgeText || "5% OFF"}
                          </span>
                        </div>
                        <div className="w-6 h-1 bg-white/30 rounded-full" />
                      </div>

                      {/* Right Text */}
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div>
                          <h4 className="text-sm font-black uppercase text-white leading-tight">
                            {promoBanner.title || "ORDER ON PRAYOG APP"}
                          </h4>
                          <p className="text-[10px] font-bold text-[#00F0FF] uppercase mt-0.5">
                            {promoBanner.subtitle || "ROBOTICS AT YOUR FINGERTIPS"}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-cyan-400/30">
                          <span className="bg-[#FFC20E] text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                            {promoBanner.tagText || "GET FLAT 5% OFF"}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-cyan-200 px-1">
                            CODE: {promoBanner.couponCode || "PRGAPP"}
                          </span>
                        </div>

                        <div className="flex gap-1.5 pt-0.5 justify-center sm:justify-start">
                          <span className="bg-[#061128] text-white px-2 py-1 rounded-lg text-[9px] font-bold border border-cyan-400/30">
                            Google Play
                          </span>
                          <span className="bg-[#061128] text-white px-2 py-1 rounded-lg text-[9px] font-bold border border-cyan-400/30">
                            App Store
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between text-xs border-t border-slate-800 mt-4">
                  <span className="text-slate-400">Clicking triggers:</span>
                  <a
                    href={promoBanner.redirectUrl || "/download"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#00AEEF] hover:underline font-bold"
                  >
                    <span>Test Redirection Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
