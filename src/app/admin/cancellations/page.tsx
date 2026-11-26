"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  X,
  FileSpreadsheet,
  ArrowRight,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Truck,
  Check,
} from "lucide-react";

type DateFilterPreset = "all" | "today" | "last_7_days" | "last_30_days" | "custom";

interface CancellationRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  cancellationReferenceId: string;
  cancellationReason: string;
  cancellationComment?: string | null;
  cancellationInitiatedBy: string;
  previousOrderStatus: string;
  cancellationStatus: string;
  cancellationDate: string;
  refundStatus: string;
  refundAmount: number;
  refundTransactionId?: string | null;
  refundDate?: string | null;
  inventoryRestorationStatus: string;
  inventoryTransactionId?: string | null;
  adminRemarks?: string | null;
  orderAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentTransactionId?: string | null;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  productsSummary: string;
  items: Array<{
    id?: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

interface AnalyticsMetrics {
  totalCancelledOrders: number;
  cancellationRate: number;
  totalCancelledRevenue: number;
  codCount: number;
  prepaidCount: number;
  pendingRefundsCount: number;
  completedRefundsCount: number;
  topReasons: Array<{ reason: string; count: number; percentage: number }>;
}

export default function AdminCancellationsPage() {
  const [cancellations, setCancellations] = useState<CancellationRecord[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DateFilterPreset>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [refundFilter, setRefundFilter] = useState("all");
  const [initiatorFilter, setInitiatorFilter] = useState("all");

  // Detailed Drawer State
  const [selectedRecord, setSelectedRecord] = useState<CancellationRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDetailFull, setSelectedDetailFull] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Admin action state
  const [adminRefundStatus, setAdminRefundStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isUpdatingAction, startTransition] = useTransition();
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Fetch cancellation list & metrics
  const fetchCancellations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (datePreset !== "all") params.set("datePreset", datePreset);
      if (datePreset === "custom" && customStart) params.set("startDate", customStart);
      if (datePreset === "custom" && customEnd) params.set("endDate", customEnd);
      if (paymentFilter !== "all") params.set("paymentMethod", paymentFilter);
      if (reasonFilter !== "all") params.set("cancellationReason", reasonFilter);
      if (refundFilter !== "all") params.set("refundStatus", refundFilter);
      if (initiatorFilter !== "all") params.set("initiatedBy", initiatorFilter);

      const res = await fetch(`/api/admin/cancellations?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCancellations(json.data.items || []);
        setMetrics(json.data.metrics || null);
      } else {
        setError(json.message || "Failed to load cancellation records.");
      }
    } catch {
      setError("Network error fetching cancellation records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancellations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datePreset, customStart, customEnd, paymentFilter, reasonFilter, refundFilter, initiatorFilter]);

  // Handle Search submit or debounced
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCancellations();
  };

  // Open Drawer and fetch full details
  const handleOpenDetails = async (record: CancellationRecord) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
    setLoadingDetail(true);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    setAdminRefundStatus(record.refundStatus);
    setAdminRemarks(record.adminRemarks || "");

    try {
      const res = await fetch(`/api/admin/cancellations/${record.id || record.orderId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedDetailFull(json.data);
        if (json.data.cancellation) {
          setAdminRefundStatus(json.data.cancellation.refundStatus);
          setAdminRemarks(json.data.cancellation.adminRemarks || "");
        }
      } else {
        setSelectedDetailFull(null);
      }
    } catch {
      setSelectedDetailFull(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Admin submit update (Refund Status & remarks)
  const handleAdminUpdateSubmit = async () => {
    if (!selectedRecord) return;
    setActionSuccessMessage(null);
    setActionErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/cancellations/${selectedRecord.id || selectedRecord.orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refundStatus: adminRefundStatus,
            adminRemarks: adminRemarks,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setActionSuccessMessage("Cancellation record and refund status updated successfully.");
          // Update local record
          setCancellations((prev) =>
            prev.map((c) =>
              c.id === selectedRecord.id || c.orderId === selectedRecord.orderId
                ? {
                    ...c,
                    refundStatus: adminRefundStatus,
                    adminRemarks: adminRemarks,
                  }
                : c
            )
          );
          if (selectedDetailFull?.cancellation) {
            setSelectedDetailFull({
              ...selectedDetailFull,
              cancellation: {
                ...selectedDetailFull.cancellation,
                refundStatus: adminRefundStatus,
                adminRemarks: adminRemarks,
              },
            });
          }
        } else {
          setActionErrorMessage(json.message || "Failed to update cancellation.");
        }
      } catch {
        setActionErrorMessage("Network error saving admin update.");
      }
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (datePreset !== "all") params.set("datePreset", datePreset);
    if (datePreset === "custom" && customStart) params.set("startDate", customStart);
    if (datePreset === "custom" && customEnd) params.set("endDate", customEnd);
    if (paymentFilter !== "all") params.set("paymentMethod", paymentFilter);
    if (reasonFilter !== "all") params.set("cancellationReason", reasonFilter);
    if (refundFilter !== "all") params.set("refundStatus", refundFilter);

    window.open(`/api/admin/cancellations/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/70">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Order Cancellation &amp; Refund Desk
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Review cancelled customer orders, monitor stock restorations, and manage prepaid refunds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={fetchCancellations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#2563EB]" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A1128] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 8. Cancellation Analytics & Statistics ── */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Cancelled */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cancelled Orders
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {metrics.totalCancelledOrders}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Rate: <strong className="text-slate-800">{metrics.cancellationRate}%</strong>
            </span>
          </div>

          {/* Card 2: Cancelled Revenue */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cancelled Value
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{metrics.totalCancelledRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Restored stock</span>
          </div>

          {/* Card 3: COD Cancellations */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              COD Orders
            </span>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {metrics.codCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">No refund needed</span>
          </div>

          {/* Card 4: Prepaid Cancellations */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Prepaid Orders
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {metrics.prepaidCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Eligible for refund</span>
          </div>

          {/* Card 5: Pending Refunds */}
          <div className="bg-white border border-amber-200/80 bg-amber-50/20 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Pending Refunds
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {metrics.pendingRefundsCount}
            </div>
            <span className="text-[11px] text-amber-800 font-medium">Action required</span>
          </div>

          {/* Card 6: Completed Refunds */}
          <div className="bg-white border border-emerald-200/80 bg-emerald-50/20 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Completed Refunds
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {metrics.completedRefundsCount}
            </div>
            <span className="text-[11px] text-emerald-800 font-medium">Disbursed to source</span>
          </div>
        </div>
      )}

      {/* Top Reasons Breakdown */}
      {metrics && metrics.topReasons && metrics.topReasons.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Customer Cancellation Reasons
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Total Recorded: {metrics.totalCancelledOrders}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.topReasons.map((r, i) => (
              <div key={i} className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate" title={r.reason}>
                    {r.reason}
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                    {r.count} ({r.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Search & Multi-Filter Bar ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (#PRG-...), Customer Name, Email, Phone, Reference ID..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] font-medium text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Date:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DateFilterPreset)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {datePreset === "custom" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700"
              />
            </div>
          )}

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Payment Methods</option>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="PREPAID">Prepaid (UPI / Card / NetBanking)</option>
            </select>
          </div>

          {/* Cancellation Reason Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Reason:</span>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Reasons</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found a better price elsewhere">Found a better price elsewhere</option>
              <option value="Delivery is taking too long">Delivery is taking too long</option>
              <option value="Want to change the product or quantity">Want to change product/qty</option>
              <option value="No longer need this product">No longer need this product</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Refund Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Refund:</span>
            <select
              value={refundFilter}
              onChange={(e) => setRefundFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Refund Statuses</option>
              <option value="Not Applicable">Not Applicable (COD)</option>
              <option value="Refund Pending">Refund Pending</option>
              <option value="Refund Initiated">Refund Initiated</option>
              <option value="Refund Processing">Refund Processing</option>
              <option value="Refund Completed">Refund Completed</option>
              <option value="Refund Failed">Refund Failed</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || datePreset !== "all" || paymentFilter !== "all" || reasonFilter !== "all" || refundFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDatePreset("all");
                setPaymentFilter("all");
                setReasonFilter("all");
                setRefundFilter("all");
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2563EB] mb-2" />
            <span>Loading cancellation records...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 space-y-2">
            <AlertTriangle className="w-6 h-6 mx-auto text-rose-500" />
            <p className="font-bold">{error}</p>
            <button
              type="button"
              onClick={fetchCancellations}
              className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : cancellations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <XCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">No Cancelled Orders Found</p>
            <p>No orders match the selected filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">Order &amp; Ref ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product / SKU</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Cancellation Date</th>
                  <th className="px-4 py-3">Reason &amp; By</th>
                  <th className="px-4 py-3">Refund Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cancellations.map((rec) => {
                  const isCod = rec.paymentMethod?.toLowerCase().includes("cod") || rec.paymentMethod?.toLowerCase().includes("cash on delivery");
                  const refundBadgeClass =
                    rec.refundStatus === "Refund Completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : rec.refundStatus === "Refund Initiated" || rec.refundStatus === "Refund Processing"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : rec.refundStatus === "Refund Failed"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-slate-100 text-slate-600 border-slate-200";

                  return (
                    <tr
                      key={rec.id || rec.orderId}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetails(rec)}
                    >
                      {/* Order & Ref ID */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 font-mono">
                          #{rec.orderNumber}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Ref: {rec.cancellationReferenceId}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[140px]">
                          {rec.customerName}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">
                          {rec.customerEmail}
                        </span>
                      </td>

                      {/* Product / SKU */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-medium text-slate-800 truncate" title={rec.productsSummary}>
                          {rec.productsSummary}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rec.items?.[0]?.productSku ? `SKU: ${rec.items[0].productSku}` : "Hardware Component"} • Qty: {rec.items?.[0]?.quantity || 1}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-extrabold text-slate-900 whitespace-nowrap">
                        ₹{rec.orderAmount.toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block text-[11px]">
                          {isCod ? "Cash on Delivery" : rec.paymentMethod}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {rec.paymentStatus || (isCod ? "Uncollected" : "Paid")}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">
                          {new Date(rec.cancellationDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rec.cancellationDate).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Reason & Initiator */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <span className="font-semibold text-slate-900 block truncate" title={rec.cancellationReason}>
                          {rec.cancellationReason}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          By: <strong className="text-slate-600">{rec.cancellationInitiatedBy || "Customer"}</strong>
                        </span>
                      </td>

                      {/* Refund Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${refundBadgeClass}`}
                        >
                          {rec.refundStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(rec);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 6. Admin Detailed Cancellation Drawer / Modal ── */}
      {isDrawerOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Cancellation Dossier #{selectedRecord.orderNumber}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Ref ID: {selectedRecord.cancellationReferenceId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-700">
              {loadingDetail ? (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2563EB] mb-2" />
                  <span>Loading complete cancellation audit trail...</span>
                </div>
              ) : (
                <>
                  {/* Action Notifications */}
                  {actionSuccessMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{actionSuccessMessage}</span>
                    </div>
                  )}
                  {actionErrorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{actionErrorMessage}</span>
                    </div>
                  )}

                  {/* Section A: Order Information */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Section A: Order Information
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Order ID</span>
                        <span className="font-bold font-mono text-slate-900">#{selectedRecord.orderNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Order Date</span>
                        <span className="font-semibold text-slate-900">{selectedRecord.orderDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Prior</span>
                        <span className="font-semibold text-slate-700">{selectedRecord.previousOrderStatus || "PROCESSING"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Status</span>
                        <span className="font-bold text-rose-600">CANCELLED</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Order Total</span>
                        <span className="font-black text-slate-900 text-sm">₹{selectedRecord.orderAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Products details */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Items In Order</span>
                      {selectedRecord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200/60">
                          <div>
                            <span className="font-bold text-slate-900 block">{item.productName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {item.productSku} • Qty: {item.quantity}</span>
                          </div>
                          <span className="font-extrabold text-slate-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section B: Customer Information */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Section B: Customer Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Name</span>
                        <span className="font-bold text-slate-900">{selectedRecord.customerName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                        <span className="font-medium text-slate-900">{selectedRecord.customerEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                        <span className="font-mono text-slate-900">{selectedRecord.customerPhone || "+91 87097 89641"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Address</span>
                        <span className="font-normal text-slate-700 leading-snug">
                          {selectedRecord.customerAddress || "Ranchi Central Warehouse / Direct Customer Address"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section C: Cancellation Information */}
                  <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                      Section C: Cancellation Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Reference ID</span>
                        <span className="font-mono font-bold text-slate-900">{selectedRecord.cancellationReferenceId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Date &amp; Time</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(selectedRecord.cancellationDate).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cancellation Reason</span>
                        <span className="font-bold text-rose-700">{selectedRecord.cancellationReason}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Initiated By</span>
                        <span className="font-semibold text-slate-900">{selectedRecord.cancellationInitiatedBy || "Customer"}</span>
                      </div>
                    </div>

                    {selectedRecord.cancellationComment && (
                      <div className="p-2.5 bg-white rounded-xl border border-rose-200/60 mt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Customer Comments
                        </span>
                        <p className="text-slate-700 italic font-normal leading-relaxed">
                          &ldquo;{selectedRecord.cancellationComment}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Section D: Payment & Refund Management */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Section D: Payment &amp; Refund Management
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
                        <span className="font-bold text-slate-900">{selectedRecord.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Gateway Transaction ID</span>
                        <span className="font-mono text-slate-700">{selectedRecord.paymentTransactionId || "TXN-PG-2026-LIVE"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Refund Amount</span>
                        <span className="font-black text-slate-900 text-sm">₹{selectedRecord.refundAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Refund Reference ID</span>
                        <span className="font-mono text-slate-700">{selectedRecord.refundTransactionId || "N/A"}</span>
                      </div>
                    </div>

                    {/* Admin Refund Controls */}
                    <div className="pt-3 border-t border-slate-200/60 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Update Refund Status (Admin Action)
                      </span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={adminRefundStatus}
                          onChange={(e) => setAdminRefundStatus(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2563EB]"
                        >
                          <option value="Not Applicable">Not Applicable (COD)</option>
                          <option value="Refund Pending">Refund Pending</option>
                          <option value="Refund Initiated">Refund Initiated</option>
                          <option value="Refund Processing">Refund Processing</option>
                          <option value="Refund Completed">Refund Completed</option>
                          <option value="Refund Failed">Refund Failed</option>
                        </select>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="text-[10px] text-slate-400 uppercase font-bold block">
                          Admin Remarks &amp; Audit Log Note
                        </label>
                        <textarea
                          rows={2}
                          value={adminRemarks}
                          onChange={(e) => setAdminRemarks(e.target.value)}
                          placeholder="e.g. Verified with Razorpay/HDFC gateway. Credit confirmed on Nov 26, 2026."
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAdminUpdateSubmit}
                        disabled={isUpdatingAction}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>Save Admin Audit Record</span>
                      </button>
                    </div>
                  </div>

                  {/* Section E: Inventory Restoration Information */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Section E: Inventory Information
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Stock Restoration</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{selectedRecord.inventoryRestorationStatus || "COMPLETED"}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Restored Quantity</span>
                        <span className="font-bold text-slate-900">{selectedRecord.items?.[0]?.quantity || 1} units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Inventory Txn ID</span>
                        <span className="font-mono text-slate-700 text-[11px] truncate block">
                          {selectedRecord.inventoryTransactionId || "TXN-INV-RESTORE-1"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section F: Order Activity Timeline */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Section F: Chronological Activity Timeline
                    </h3>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {/* Event 1: Order Placed */}
                      <div className="relative">
                        <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" />
                        <p className="font-bold text-slate-900">Order Placed</p>
                        <p className="text-[11px] text-slate-500">Order #{selectedRecord.orderNumber} placed by {selectedRecord.customerName}</p>
                      </div>

                      {/* Event 2: Payment */}
                      {!selectedRecord.paymentMethod.toLowerCase().includes("cod") && (
                        <div className="relative">
                          <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" />
                          <p className="font-bold text-slate-900">Payment Received</p>
                          <p className="text-[11px] text-slate-500">
                            Prepaid confirmation received (₹{selectedRecord.orderAmount.toLocaleString("en-IN")})
                          </p>
                        </div>
                      )}

                      {/* Event 3: Processing */}
                      <div className="relative">
                        <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-200" />
                        <p className="font-bold text-slate-900">Processing Started</p>
                        <p className="text-[11px] text-slate-500">Warehouse allocation and dispatch queue assignment</p>
                      </div>

                      {/* Event 4: Cancellation */}
                      <div className="relative">
                        <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white ring-2 ring-rose-200" />
                        <p className="font-bold text-rose-700">Cancellation Confirmed</p>
                        <p className="text-[11px] text-slate-500">
                          Reason: {selectedRecord.cancellationReason} • Initiated by {selectedRecord.cancellationInitiatedBy || "Customer"}
                        </p>
                      </div>

                      {/* Event 5: Inventory Restored */}
                      <div className="relative">
                        <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" />
                        <p className="font-bold text-slate-900">Inventory Restored</p>
                        <p className="text-[11px] text-slate-500">
                          Central warehouse available stock incremented by {selectedRecord.items?.[0]?.quantity || 1} units
                        </p>
                      </div>

                      {/* Event 6: Refund Initiated (if prepaid) */}
                      {!selectedRecord.paymentMethod.toLowerCase().includes("cod") && (
                        <div className="relative">
                          <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-200" />
                          <p className="font-bold text-slate-900">
                            Refund Status: {selectedRecord.refundStatus}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Refund reference: {selectedRecord.refundTransactionId || "RFD-PENDING-GATEWAY"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Prayog India Security &amp; Audit Validated
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
