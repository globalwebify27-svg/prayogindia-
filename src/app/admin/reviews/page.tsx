"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  XCircle,
  Flag,
  Trash2,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Award,
  Eye,
  Camera,
  Video,
  Play,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { INITIAL_ADMIN_REVIEWS } from "@/lib/reviewsStore";

interface AdminReview {
  id: string;
  author: string;
  email?: string;
  role?: string;
  rating: number;
  date: string;
  title?: string;
  comment: string;
  verified: boolean;
  productId: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  isFeatured?: boolean;
  isReported?: boolean;
  reportReason?: string;
  reportedAt?: string;
  helpfulCount?: number;
  images?: string[];
  videoUrl?: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REPORTED" | "FEATURED" | "REJECTED"
  >("ALL");

  // Moderation Edit Modal State
  const [moderatingReview, setModeratingReview] = useState<AdminReview | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load reviews from API or cached storage
  const loadReviews = async () => {
    setLoading(true);
    try {
      // Check localStorage for any newly submitted customer reviews
      let localReviews: any[] = [];
      try {
        const stored = localStorage.getItem("prayog_product_reviews");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localReviews = parsed;
        }
      } catch {}

      const res = await fetch(`/api/admin/reviews?status=ALL`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.reviews) {
          const apiReviews: AdminReview[] = json.data.reviews;
          const localMap = new Map(localReviews.map((r) => [r.id, r]));

          // Merge local customer submissions with API data (local moderation actions take precedence)
          const merged = [
            ...localReviews
              .filter((r) => !apiReviews.some((apiR) => apiR.id === r.id))
              .map((r) => ({
                id: r.id,
                author: r.author || "Customer",
                rating: r.rating || 5,
                date: r.date || "Today",
                title: r.title || "Customer Review",
                comment: r.body || r.comment || "",
                verified: true,
                productId: r.productId || "p-default",
                productName: r.productName || "Hardware Component",
                productSku: r.productSku || "PRG-SKU",
                productImage: r.productImage || "/images/products/arduino-uno-r3.png",
                status: r.status || "PENDING",
                isFeatured: !!r.isFeatured,
                isReported: !!r.isReported,
                reportReason: r.reportReason,
                images: r.images || [],
                videoUrl: r.videoUrl,
              })),
            ...apiReviews.map((apiR) => {
              const localOverride = localMap.get(apiR.id);
              if (localOverride) {
                return {
                  ...apiR,
                  status: localOverride.status || apiR.status,
                  isFeatured:
                    localOverride.isFeatured !== undefined
                      ? localOverride.isFeatured
                      : apiR.isFeatured,
                  title:
                    localOverride.title !== undefined
                      ? localOverride.title
                      : apiR.title,
                  comment:
                    localOverride.comment !== undefined
                      ? localOverride.comment
                      : apiR.comment,
                };
              }
              return apiR;
            }),
          ];

          setReviews(merged);
        }
      } else {
        // Fallback to initial seeds
        setReviews(INITIAL_ADMIN_REVIEWS as any);
      }
    } catch {
      setReviews(INITIAL_ADMIN_REVIEWS as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Synchronize review updates with shared persistent storage for immediate storefront visibility
  const syncLocalReviewStore = (
    reviewId: string,
    updates: Partial<AdminReview> | null
  ) => {
    try {
      const stored = localStorage.getItem("prayog_product_reviews");
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];

      if (updates === null) {
        // Delete review
        list = list.filter((r: any) => r.id !== reviewId);
      } else {
        const idx = list.findIndex((r: any) => r.id === reviewId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updates };
        } else {
          const currentRev = reviews.find((r) => r.id === reviewId);
          if (currentRev) {
            list.unshift({ ...currentRev, ...updates });
          }
        }
      }

      localStorage.setItem("prayog_product_reviews", JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(
        new CustomEvent("prayog_reviews_updated", {
          detail: { reviewId, updates },
        })
      );
    } catch (err) {
      console.warn("Failed to sync local review store:", err);
    }
  };

  // 1. Approve Review (Immediately displays in product page review section)
  const handleApprove = async (review: AdminReview) => {
    const updated = reviews.map((r) =>
      r.id === review.id ? { ...r, status: "APPROVED" as const } : r
    );
    setReviews(updated);
    syncLocalReviewStore(review.id, { status: "APPROVED" });
    showToast(`Approved review by ${review.author}. Visible on product page!`);

    try {
      await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
    } catch {}
  };

  // 2. Reject Review (Immediately hidden from product page review section)
  const handleReject = async (review: AdminReview) => {
    const updated = reviews.map((r) =>
      r.id === review.id ? { ...r, status: "REJECTED" as const, isFeatured: false } : r
    );
    setReviews(updated);
    syncLocalReviewStore(review.id, { status: "REJECTED", isFeatured: false });
    showToast(`Rejected review by ${review.author}.`);

    try {
      await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
    } catch {}
  };

  // 3. Toggle Featured Review
  const handleToggleFeature = async (review: AdminReview) => {
    const nextFeatured = !review.isFeatured;
    const updated = reviews.map((r) =>
      r.id === review.id ? { ...r, isFeatured: nextFeatured } : r
    );
    setReviews(updated);
    syncLocalReviewStore(review.id, { isFeatured: nextFeatured });
    showToast(
      nextFeatured
        ? `Featured review by ${review.author} on storefront!`
        : `Removed featured badge from ${review.author}'s review.`
    );

    try {
      await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });
    } catch {}
  };

  // 4. Dismiss Report
  const handleDismissReport = async (review: AdminReview) => {
    const updated = reviews.map((r) =>
      r.id === review.id
        ? { ...r, isReported: false, reportReason: undefined }
        : r
    );
    setReviews(updated);
    syncLocalReviewStore(review.id, { isReported: false });
    showToast(`Dismissed report flag for review #${review.id}.`);

    try {
      await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissReport: true }),
      });
    } catch {}
  };

  // 5. Remove / Delete Inappropriate Review
  const handleDelete = async (review: AdminReview) => {
    if (!window.confirm(`Are you sure you want to permanently delete this review by ${review.author}?`)) {
      return;
    }

    const updated = reviews.filter((r) => r.id !== review.id);
    setReviews(updated);
    syncLocalReviewStore(review.id, null);
    showToast(`Removed review by ${review.author}.`);

    try {
      await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    } catch {}
  };

  // 6. Save Moderated Content
  const handleSaveModeration = async () => {
    if (!moderatingReview) return;

    const updated = reviews.map((r) =>
      r.id === moderatingReview.id
        ? {
            ...r,
            title: editTitle.trim() || undefined,
            comment: editBody.trim(),
            status: "APPROVED" as const, // auto-approve after moderation
            isReported: false, // resolve report upon manual review
          }
        : r
    );

    setReviews(updated);
    syncLocalReviewStore(moderatingReview.id, {
      title: editTitle.trim() || undefined,
      comment: editBody.trim(),
      status: "APPROVED",
      isReported: false,
    });
    showToast(`Moderated review content saved and approved on product page.`);

    try {
      await fetch(`/api/admin/reviews/${moderatingReview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          body: editBody.trim(),
          status: "APPROVED",
          dismissReport: true,
        }),
      });
    } catch {}

    setModeratingReview(null);
  };

  // Filtered List calculation
  const filteredReviews = useMemo(() => {
    let result = reviews;

    if (statusFilter === "PENDING") {
      result = result.filter((r) => r.status === "PENDING" && !r.isReported);
    } else if (statusFilter === "APPROVED") {
      result = result.filter((r) => r.status === "APPROVED");
    } else if (statusFilter === "REPORTED") {
      result = result.filter((r) => r.isReported === true);
    } else if (statusFilter === "FEATURED") {
      result = result.filter((r) => r.isFeatured === true);
    } else if (statusFilter === "REJECTED") {
      result = result.filter((r) => r.status === "REJECTED");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.author.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          (r.productSku && r.productSku.toLowerCase().includes(q)) ||
          r.comment.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q))
      );
    }

    return result;
  }, [reviews, statusFilter, searchQuery]);

  // Metrics
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;
  const reportedCount = reviews.filter((r) => r.isReported === true).length;
  const featuredCount = reviews.filter((r) => r.isFeatured === true).length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
      : "4.8";

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00AEEF] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#00AEEF]">
              Customer Sentiment &amp; Moderation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Reviews &amp; Ratings Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve verified purchases, moderate user-submitted photos/videos, feature top reviews, and handle report flags.
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Floating Action Notice */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Reviews
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">All Storefronts</span>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white rounded-2xl border border-amber-200/90 p-4 shadow-2xs bg-amber-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Pending Approval
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            {pendingCount}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting action</span>
        </div>

        {/* Approved Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Approved
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            {approvedCount}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Publicly visible</span>
        </div>

        {/* Reported / Flagged */}
        <div className="bg-white rounded-2xl border border-rose-200/90 p-4 shadow-2xs bg-rose-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
            Reported
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
            {reportedCount}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Flagged by users</span>
        </div>

        {/* Featured Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Featured
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
            {featuredCount}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Highlighted on PDP</span>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Average Rating
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-1">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Verified purchases</span>
        </div>
      </div>

      {/* ── Toolbar: Search & Filter Tabs ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, product, SKU, review title, or feedback text..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#00AEEF] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: "ALL", label: "All Reviews", count: totalCount },
            { id: "PENDING", label: "Pending Moderation", count: pendingCount },
            { id: "REPORTED", label: "Flagged / Reported", count: reportedCount },
            { id: "APPROVED", label: "Approved", count: approvedCount },
            { id: "FEATURED", label: "Featured", count: featuredCount },
            { id: "REJECTED", label: "Rejected", count: reviews.filter((r) => r.status === "REJECTED").length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Review Cards Feed ── */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-2xs animate-pulse">
          Loading reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 space-y-2 bg-white rounded-2xl border border-slate-200 shadow-2xs px-4">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No reviews found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "No reviews match your search query."
              : `No reviews found under the ${statusFilter.toLowerCase()} tab.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            return (
              <div
                key={review.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all space-y-4 ${
                  review.isReported
                    ? "border-rose-300/90 ring-1 ring-rose-200"
                    : review.status === "PENDING"
                    ? "border-amber-300/80"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* ── Report Notice Banner (if flagged) ── */}
                {review.isReported && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        <strong>Reported by customer:</strong>{" "}
                        {review.reportReason || "Violation of review policy"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDismissReport(review)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Header: Customer Info + Product + Status Badges ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  {/* Left: Customer + Product */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 uppercase">
                      {review.author.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {review.author}
                        </span>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                        {review.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Reviewed product:{" "}
                        <strong className="text-slate-700">
                          {review.productName}
                        </strong>{" "}
                        {review.productSku && (
                          <span className="font-mono text-slate-400">
                            [{review.productSku}]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Star Rating & Status Badge */}
                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-900 font-mono ml-1">
                        {review.rating}.0
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider ${
                        review.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : review.status === "REJECTED"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                </div>

                {/* ── Review Content ── */}
                <div className="space-y-1.5 text-xs sm:text-sm">
                  {review.title && (
                    <h4 className="font-bold text-slate-900">{review.title}</h4>
                  )}
                  <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {review.comment}
                  </p>
                  <span className="text-[11px] text-slate-400 block pt-1">
                    Submitted on {review.date}
                  </span>
                </div>

                {/* ── User Uploaded Images & Videos ── */}
                {((review.images && review.images.length > 0) || review.videoUrl) && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Customer Attachments
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {review.images?.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 relative bg-slate-50 border border-slate-200 rounded-lg overflow-hidden group"
                        >
                          <Image
                            src={img}
                            alt="Customer photo"
                            fill
                            sizes="56px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}

                      {review.videoUrl && (
                        <div className="h-14 px-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-blue-800">
                          <Play className="w-4 h-4 text-blue-600 fill-blue-600 shrink-0" />
                          <span>Video Attached</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Admin Action Toolbar ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Left: Moderate / Edit Content */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setModeratingReview(review);
                        setEditTitle(review.title || "");
                        setEditBody(review.comment);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                      title="Moderate & Edit Content"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Moderate Content</span>
                    </button>

                    <button
                      onClick={() => handleToggleFeature(review)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                        review.isFeatured
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                      title="Feature on Product Landing Page"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{review.isFeatured ? "Featured" : "Feature Review"}</span>
                    </button>
                  </div>

                  {/* Right: Approve, Reject, Delete */}
                  <div className="flex items-center gap-2">
                    {review.status !== "APPROVED" && (
                      <button
                        onClick={() => handleApprove(review)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {review.status !== "REJECTED" && (
                      <button
                        onClick={() => handleReject(review)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(review)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove inappropriate content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Content Moderation Modal ── */}
      {moderatingReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Moderate Review Content
                </h3>
              </div>
              <button
                onClick={() => setModeratingReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-500">Author:</span>{" "}
                <strong className="text-slate-900">{moderatingReview.author}</strong>{" "}
                • <span className="text-slate-500">Product:</span>{" "}
                <strong className="text-slate-900">{moderatingReview.productName}</strong>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Review Headline / Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Review Description (Remove profanity, spam, or links)
                </label>
                <textarea
                  rows={5}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModeratingReview(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModeration}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer active:scale-95 shadow-2xs"
                >
                  Save &amp; Approve Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
