"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  Edit3,
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  AlertTriangle,
  ExternalLink,
  Sliders,
  Sparkles,
  RefreshCw,
  X,
  Play,
  Pause,
  Layers,
  Tag,
} from "lucide-react";
import {
  WebsiteNotification,
  NotificationPriority,
  DEFAULT_NOTIFICATIONS,
  sortNotifications,
  isNotificationLive,
} from "@/data/notificationSlider";

const QUICK_LINKS = [
  { label: "Deals & Offers Page", value: "/offers" },
  { label: "All Products Catalogue", value: "/products" },
  { label: "Product Categories", value: "/categories" },
  { label: "Store / Walk-in Shopping", value: "/store-pos" },
  { label: "STEM Lab Setup", value: "/services/stem-lab-setup" },
  { label: "Robotics Lab Setup", value: "/services/robotics-lab-setup" },
  { label: "Drone Lab Setup", value: "/services/drone-lab-setup" },
  { label: "Contact & Support", value: "/contact" },
  { label: "Careers Portal", value: "/careers" },
];

export default function AdminCMSPage() {
  const [notifications, setNotifications] = useState<WebsiteNotification[]>(
    DEFAULT_NOTIFICATIONS,
  );
  const [loading, setLoading] = useState(false);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WebsiteNotification | null>(
    null,
  );

  // Form Fields
  const [badgeTag, setBadgeTag] = useState("FESTIVAL SALE");
  const [text, setText] = useState("");
  const [link, setLink] = useState("/offers");
  const [linkText, setLinkText] = useState("Shop Deals");
  const [priority, setPriority] = useState<NotificationPriority>("HIGH");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [theme, setTheme] = useState<
    "dark" | "amber" | "red" | "blue" | "emerald"
  >("emerald");

  // Preview Slider State
  const [previewIndex, setPreviewIndex] = useState(0);

  // Fetch latest notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
    } catch (e) {
      console.error("Error loading announcements:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Live Slider Preview timer
  const liveNotifications = sortNotifications(
    notifications.filter((n) => isNotificationLive(n)),
  );

  useEffect(() => {
    if (liveNotifications.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % liveNotifications.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [liveNotifications.length]);

  const openCreateModal = () => {
    setEditingItem(null);
    setBadgeTag("ANNOUNCEMENT");
    setText("");
    setLink("/products");
    setLinkText("Learn More");
    setPriority("MEDIUM");
    setDisplayOrder(notifications.length + 1);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setTheme("blue");
    setIsModalOpen(true);
  };

  const openEditModal = (notif: WebsiteNotification) => {
    setEditingItem(notif);
    setBadgeTag(notif.badgeTag);
    setText(notif.text);
    setLink(notif.link || "/products");
    setLinkText(notif.linkText || "Learn More");
    setPriority(notif.priority);
    setDisplayOrder(notif.displayOrder);
    setIsActive(notif.isActive);
    setStartDate(notif.startDate || "");
    setEndDate(notif.endDate || "");
    setTheme(notif.theme || "dark");
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !badgeTag.trim()) return;

    const payload: WebsiteNotification = {
      id: editingItem ? editingItem.id : `notif-${Date.now()}`,
      badgeTag: badgeTag.toUpperCase().trim(),
      text: text.trim(),
      link: link.trim(),
      linkText: linkText.trim(),
      priority,
      displayOrder: Number(displayOrder) || 1,
      isActive,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      theme,
    };

    try {
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch("/api/announcements", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success && data?.all) {
        setNotifications(data.all);
      } else {
        fetchNotifications();
      }

      setIsModalOpen(false);
      setSavedAlert(
        editingItem
          ? "Notification updated successfully!"
          : "New announcement published!",
      );
      setTimeout(() => setSavedAlert(null), 3500);
    } catch {
      alert("Error saving notification.");
    }
  };

  const handleToggleActive = async (notif: WebsiteNotification) => {
    const updated = { ...notif, isActive: !notif.isActive };
    try {
      const res = await fetch("/api/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data?.all) setNotifications(data.all);
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website announcement?"))
      return;
    try {
      const res = await fetch(
        `/api/announcements?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (data?.all) setNotifications(data.all);
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === notifications.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const current = notifications[index];
    const target = notifications[targetIndex];

    const currentNewOrder = target.displayOrder;
    const targetNewOrder = current.displayOrder;

    // Update both
    await fetch("/api/announcements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, displayOrder: currentNewOrder }),
    });

    await fetch("/api/announcements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...target, displayOrder: targetNewOrder }),
    });

    fetchNotifications();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              SECTION 5.0 NOTIFICATION SLIDER
            </span>
            <span className="text-xs text-slate-400 font-bold">
              Public Header Announcements
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Important Website Notification Slider
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl font-medium">
            Publish maintenance alerts, high shipping delay notices, festival
            sale promotions, and location timeline updates with priority
            scheduling and direct links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-[#00AEEF]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Notification</span>
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {savedAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedAlert}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. Live Interactive Header Slider Preview Strip */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00AEEF]" /> Live Public Header
              Slider Preview
            </h2>
            <p className="text-xs text-slate-500">
              Real-time simulation of how notifications display on the customer
              storefront header.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {liveNotifications.length} Live on Website
            </span>
          </div>
        </div>

        {/* Live Ticker Bar Simulation */}
        <div className="bg-[#0A1128] text-white p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 overflow-hidden relative shadow-inner">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {liveNotifications.length > 0 ? (
              <>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                    liveNotifications[previewIndex % liveNotifications.length]
                      .priority === "CRITICAL"
                      ? "bg-red-600 text-white animate-pulse"
                      : liveNotifications[
                            previewIndex % liveNotifications.length
                          ].priority === "HIGH"
                        ? "bg-emerald-500 text-white"
                        : liveNotifications[
                              previewIndex % liveNotifications.length
                            ].priority === "MEDIUM"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-[#00AEEF] text-white"
                  }`}
                >
                  {
                    liveNotifications[previewIndex % liveNotifications.length]
                      .badgeTag
                  }
                </span>

                <span className="text-xs font-semibold text-slate-200 truncate">
                  {
                    liveNotifications[previewIndex % liveNotifications.length]
                      .text
                  }
                </span>

                {liveNotifications[previewIndex % liveNotifications.length]
                  .link && (
                  <span className="text-xs font-bold text-[#FFC20E] hover:underline shrink-0 hidden sm:inline">
                    {liveNotifications[previewIndex % liveNotifications.length]
                      .linkText || "Learn More"}{" "}
                    →
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-500 italic">
                No active notifications scheduled for live display.
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono shrink-0">
            {liveNotifications.length > 0
              ? `${(previewIndex % liveNotifications.length) + 1} of ${liveNotifications.length}`
              : "0 of 0"}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Admin Controls: Notifications Management Table */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#00AEEF]" /> Section 5 Admin
              Announcement Controls
            </h2>
            <p className="text-xs text-slate-500">
              Configure priority, scheduling start/end dates, display order, and
              target navigation links.
            </p>
          </div>

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Notifications Grid */}
        <div className="space-y-3">
          {notifications.map((notif, index) => {
            const isLive = isNotificationLive(notif);

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isLive
                    ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                    : "bg-slate-100/60 border-slate-200/80 opacity-75"
                }`}
              >
                {/* Left: Tag, Text, Priority, Link */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Display Order Badge */}
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-mono font-black flex items-center justify-center">
                      #{notif.displayOrder}
                    </span>

                    {/* Badge Tag */}
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                        notif.priority === "CRITICAL"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : notif.priority === "HIGH"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : notif.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {notif.badgeTag}
                    </span>

                    {/* Priority Indicator */}
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Priority: {notif.priority}
                    </span>

                    {/* Live Status Indicator */}
                    {isLive ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE ON SITE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        {!notif.isActive ? "DISABLED" : "SCHEDULED / EXPIRED"}
                      </span>
                    )}
                  </div>

                  {/* Announcement Text */}
                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {notif.text}
                  </h4>

                  {/* Metadata: Link & Scheduling Details */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-[#00AEEF]" />
                      <span>Link:</span>
                      <strong className="text-slate-700 font-mono">
                        {notif.link}
                      </strong>
                    </span>

                    {(notif.startDate || notif.endDate) && (
                      <span className="flex items-center gap-1 font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          Schedule:{" "}
                          {notif.startDate
                            ? notif.startDate.replace("T", " ")
                            : "Immediate"}{" "}
                          →{" "}
                          {notif.endDate
                            ? notif.endDate.replace("T", " ")
                            : "Indefinite"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action Controls: Order Shift, Enable/Disable, Edit, Delete */}
                <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200">
                  {/* Order shift buttons */}
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5">
                    <button
                      onClick={() => handleMoveOrder(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, "down")}
                      disabled={index === notifications.length - 1}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Enable / Disable Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(notif)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                      notif.isActive
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {notif.isActive ? "Enabled" : "Disabled"}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(notif)}
                    className="p-2 text-slate-600 hover:text-[#00AEEF] hover:bg-white rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Announcement"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Modal: Create / Edit Website Notification */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 my-8">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF]">
                  {editingItem ? "EDIT NOTIFICATION" : "NEW NOTIFICATION"}
                </span>
                <h3 className="text-lg font-black text-white">
                  {editingItem
                    ? "Edit Header Announcement"
                    : "Publish Website Announcement"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              {/* Row 1: Badge Tag & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Badge Tag (e.g. FESTIVAL SALE, MAINTENANCE)
                  </label>
                  <input
                    type="text"
                    required
                    value={badgeTag}
                    onChange={(e) => setBadgeTag(e.target.value)}
                    placeholder="e.g. SHIPPING NOTICE"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold uppercase text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as NotificationPriority)
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="CRITICAL">
                      Critical (Maintenance / Urgent Emergency)
                    </option>
                    <option value="HIGH">
                      High (Festival Sales / Key Offers)
                    </option>
                    <option value="MEDIUM">
                      Medium (Shipping / Dispatch Delays)
                    </option>
                    <option value="LOW">
                      Low (General Updates / Delivery Info)
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 2: Announcement Text */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Announcement Message / Text
                </label>
                <textarea
                  required
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Shipping may be delayed due to high order frequency across selected pin codes."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Row 3: Target Link & Link Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700 uppercase">
                      Target Link URL
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Where click navigates
                    </span>
                  </div>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/offers or /products"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                  />
                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {QUICK_LINKS.slice(0, 4).map((ql) => (
                      <button
                        key={ql.value}
                        type="button"
                        onClick={() => {
                          setLink(ql.value);
                          setLinkText(ql.label);
                        }}
                        className="text-[9px] bg-slate-100 hover:bg-[#E0F7FC] text-slate-600 hover:text-[#00AEEF] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer"
                      >
                        {ql.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Link Button Label
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="e.g. Shop Deals, Track Order, Details"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Row 4: Scheduling Start & End Date/Time */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 font-black uppercase text-slate-800 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[#00AEEF]" />
                  <span>Automated Scheduling Controls</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Set optional start and end date/time. The notification will
                  only be displayed during this window.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                      Start Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-800 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                      End Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-800 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Display Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Display Order Position (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono text-slate-900"
                  />
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#00AEEF] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="isActiveToggle"
                    className="font-bold text-slate-800 cursor-pointer"
                  >
                    Enable &amp; Publish this notification immediately
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md shadow-[#00AEEF]/20 cursor-pointer"
                >
                  {editingItem ? "Update Notification" : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
