"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Clock,
  BarChart3,
  Layers,
  Tag,
  Upload,
  Save,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const CATEGORIES = [
  "Arduino & Microcontrollers",
  "Robotics",
  "Drones & UAV",
  "STEM & Electronics",
  "IoT & Embedded",
  "AI & Machine Learning",
  "3D Printing",
  "General",
];

interface LearningItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  level: string;
  shortDescription: string;
  bannerImage: string;
  content: string;
  relatedProductIds: string[];
  createdAt: string;
}

export default function AdminLearningPage() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LearningItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fSlug, setFSlug] = useState("");
  const [fCategory, setFCategory] = useState("STEM & Electronics");
  const [fLevel, setFLevel] = useState("Beginner");
  const [fReadTime, setFReadTime] = useState("5 min");
  const [fDesc, setFDesc] = useState("");
  const [fContent, setFContent] = useState("");
  const [fBanner, setFBanner] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (filterLevel !== "all") params.set("level", filterLevel);

      const res = await fetch(`/api/admin/learning?${params}`);
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filterCategory, filterLevel]);

  const openCreate = () => {
    setEditItem(null);
    setFTitle("");
    setFSlug("");
    setFCategory("STEM & Electronics");
    setFLevel("Beginner");
    setFReadTime("5 min");
    setFDesc("");
    setFContent("");
    setFBanner("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (item: LearningItem) => {
    setEditItem(item);
    setFTitle(item.title);
    setFSlug(item.slug);
    setFCategory(item.category);
    setFLevel(item.level);
    setFReadTime(item.readTime);
    setFDesc(item.shortDescription);
    setFContent(item.content);
    setFBanner(item.bannerImage);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const payload = {
        id: editItem?.id,
        slug: fSlug,
        title: fTitle,
        category: fCategory,
        level: fLevel,
        readTime: fReadTime,
        shortDescription: fDesc,
        content: fContent,
        bannerImage: fBanner,
        relatedProductIds: [],
      };

      const res = await fetch("/api/admin/learning", {
        method: editItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        await fetchItems();
      } else {
        setFormError(data.message || "Failed to save content");
      }
    } catch {
      setFormError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/learning", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) await fetchItems();
      else alert(data.message || "Delete failed");
    } catch {
      alert("Network error");
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      !search ||
      item.title.toLowerCase().includes(q) ||
      item.shortDescription.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const LEVEL_COLORS: Record<string, string> = {
    Beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
    Advanced: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-0.5 rounded-full border border-purple-200 inline-block mb-2">
            Learning Hub Content Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Learning Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create and manage educational articles, tutorials, and guides for
            STEM kits, drones, and robotics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchItems}
            className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-[#0B132B] hover:bg-[#1a2544] text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#00AEEF]" />
            Add Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Articles",
            value: items.length,
            color: "bg-slate-50 border-slate-200 text-slate-900",
          },
          {
            label: "Beginner",
            value: items.filter((i) => i.level === "Beginner").length,
            color: "bg-emerald-50 border-emerald-200 text-emerald-800",
          },
          {
            label: "Intermediate",
            value: items.filter((i) => i.level === "Intermediate").length,
            color: "bg-amber-50 border-amber-200 text-amber-800",
          },
          {
            label: "Advanced",
            value: items.filter((i) => i.level === "Advanced").length,
            color: "bg-red-50 border-red-200 text-red-800",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 ${stat.color}`}
          >
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
              {stat.label}
            </span>
            <span className="text-3xl font-black mt-1 block">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] w-60"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
        >
          <option value="all">All Levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Level</th>
                <th className="p-4">Read Time</th>
                <th className="p-4">Published</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#00AEEF]" />
                      <span>Loading learning content...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <BookOpen className="w-8 h-8 opacity-30" />
                      <p className="font-bold">No learning content found</p>
                      <button
                        onClick={openCreate}
                        className="text-[#00AEEF] font-bold hover:underline text-xs cursor-pointer"
                      >
                        + Create your first article
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.slug}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${LEVEL_COLORS[item.level] || LEVEL_COLORS.Beginner}`}
                      >
                        {item.level}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.readTime}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 animate-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0B132B] to-[#1a2544] rounded-t-3xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] block">
                  {editItem ? "Edit Content" : "Create New Article"}
                </span>
                <h2 className="text-lg font-black text-white">
                  {editItem ? editItem.title : "Learning Hub Article"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={fTitle}
                    onChange={(e) => {
                      setFTitle(e.target.value);
                      if (!editItem) setFSlug(autoSlug(e.target.value));
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                    placeholder="e.g. Getting Started with Arduino Uno"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Slug *
                  </label>
                  <input
                    required
                    type="text"
                    value={fSlug}
                    onChange={(e) => setFSlug(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#00AEEF]"
                    placeholder="getting-started-with-arduino"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={fReadTime}
                    onChange={(e) => setFReadTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                    placeholder="5 min"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Category
                  </label>
                  <select
                    value={fCategory}
                    onChange={(e) => setFCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Level
                  </label>
                  <select
                    value={fLevel}
                    onChange={(e) => setFLevel(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={fDesc}
                    onChange={(e) => setFDesc(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] resize-none"
                    placeholder="Brief description (shown in card preview)..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={fBanner}
                    onChange={(e) => setFBanner(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#00AEEF]"
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Content (Markdown) *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={fContent}
                    onChange={(e) => setFContent(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00AEEF] resize-y"
                    placeholder="# Getting Started&#10;&#10;Write your article content in Markdown format..."
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-600 font-bold">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-60 text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting
                    ? "Saving..."
                    : editItem
                      ? "Update Article"
                      : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
