"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  AlertTriangle,
  Download,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Info,
} from "lucide-react";

export interface LiveAuditLog {
  id: string;
  actionCategory: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  actorEmail: string | null;
  storeId: string | null;
  previousValue: any;
  newValue: any;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    code: string;
    city: string;
  } | null;
}

const CATEGORIES = [
  { value: "ALL", label: "All System Categories" },
  { value: "INVENTORY", label: "Inventory Adjustments" },
  { value: "ORDER_FULFILLMENT", label: "Order & Shipping" },
  { value: "SUPPLIER_PROCUREMENT", label: "Procurement & Receiving" },
  { value: "QUOTATION_B2B", label: "Quotations & Revisions" },
  { value: "CRM_RELATIONSHIPS", label: "CRM & Relationships" },
  { value: "AUTH", label: "Auth & Security" },
  { value: "PRODUCT_CATALOG", label: "Catalog & Pricing" },
  { value: "STORE_MANAGEMENT", label: "Store Management" },
  { value: "PAYMENT_FINANCE", label: "Payment & Finance" },
];

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<LiveAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<LiveAuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "25");
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (storeFilter !== "ALL") params.set("storeId", storeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load logs: ${res.statusText}`);
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalRecords(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, storeFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (categoryFilter !== "ALL") params.set("category", categoryFilter);
    if (storeFilter !== "ALL") params.set("storeId", storeFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    window.open(`/api/admin/audit/export?${params.toString()}`, "_blank");
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "INVENTORY":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "ORDER_FULFILLMENT":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "SUPPLIER_PROCUREMENT":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "QUOTATION_B2B":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "CRM_RELATIONSHIPS":
        return "bg-pink-50 text-pink-800 border-pink-200";
      case "AUTH":
        return "bg-slate-100 text-slate-800 border-slate-300";
      default:
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
    }
  };

  const formatDisplayValue = (val: any) => {
    if (!val) return null;
    try {
      const parsed = typeof val === "string" && (val.startsWith("{") || val.startsWith("[")) ? JSON.parse(val) : val;
      if (typeof parsed === "object" && parsed !== null) {
        if ("quantity" in parsed) return `Stock: ${parsed.quantity} units`;
        if ("status" in parsed) return `Status: ${parsed.status}`;
        if ("grandTotal" in parsed) return `₹${Number(parsed.grandTotal).toLocaleString("en-IN")}`;
        if ("name" in parsed && "status" in parsed) return `${parsed.name} (${parsed.status})`;
        if ("name" in parsed) return `${parsed.name}`;
        // Fallback: take first key-value pair cleanly
        const entries = Object.entries(parsed);
        if (entries.length > 0) {
          return `${entries[0][0]}: ${String(entries[0][1])}`;
        }
      }
      return String(parsed);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 bg-purple-100 px-3.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Section 103 · Immutable System Activity &amp; Audit Logs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Audit &amp; Activity Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable tracking of stock adjustments, order fulfillment, B2B quotes, CRM updates, procurement, and administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-2xl shadow-xs transition-colors cursor-pointer"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <button
            onClick={handleExportCsv}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#FFC20E]" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search actions, user, SKU, order..."
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Store:</span>
            <select
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Stores &amp; Global</option>
              <option value="str-ranchi-01">Ranchi Central Hub</option>
              <option value="str-patna-02">Patna STEM Branch</option>
              <option value="str-delhi-03">Delhi Innovation Center</option>
              <option value="str-mumbai-04">Mumbai Western Center</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-bold">
          Showing {logs.length} of {totalRecords} records
        </span>
      </div>

      {/* 3. Error Banner if any */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Audit Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3">Timestamp &amp; User</th>
                <th className="pb-3">Category &amp; Action</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Store Context</th>
                <th className="pb-3">Values (Prev → New)</th>
                <th className="pb-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading immutable audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No audit records matching your current filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp & User */}
                    <td className="py-3.5 space-y-0.5">
                      <div className="font-mono text-[11px] font-black text-slate-900">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                      <div className="font-bold text-slate-800">{log.actorName}</div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {log.actorRole}
                      </span>
                    </td>

                    {/* Category & Action */}
                    <td className="py-3.5 space-y-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border inline-block ${getCategoryBadgeClass(log.actionCategory)}`}>
                        {log.actionCategory.replace(/_/g, " ")}
                      </span>
                      <div className="font-mono text-[10px] text-slate-500 font-bold">
                        {log.action}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 font-bold text-slate-900 max-w-sm">
                      <div className="leading-snug">{log.description}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[9px] font-bold">
                          {log.entityType}
                        </span>
                      </div>
                    </td>

                    {/* Store Context */}
                    <td className="py-3.5">
                      {log.store ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {log.store.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            [{log.store.code}] · {log.store.city}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                          GLOBAL / CENTRAL
                        </span>
                      )}
                    </td>

                    {/* Value Changes */}
                    <td className="py-3.5 text-xs space-y-1 max-w-xs">
                      {formatDisplayValue(log.previousValue) && (
                        <div className="text-slate-400 line-through text-[11px] font-medium truncate">
                          Prev: {formatDisplayValue(log.previousValue)}
                        </div>
                      )}
                      {formatDisplayValue(log.newValue) ? (
                        <div className="font-bold text-emerald-700 text-[11px] truncate flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{formatDisplayValue(log.newValue)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Details action button */}
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-bold">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border inline-block ${getCategoryBadgeClass(selectedLog.actionCategory)}`}>
                  {selectedLog.actionCategory}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {selectedLog.action}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Log ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-black p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Description</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{selectedLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Actor</span>
                  <p className="font-bold text-slate-900">{selectedLog.actorName}</p>
                  <p className="text-[10px] font-mono text-slate-500">{selectedLog.actorRole} · {selectedLog.actorEmail || "No Email"}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Store Context</span>
                  <p className="font-bold text-slate-900">{selectedLog.store?.name || "Global / Central Hub"}</p>
                  <p className="text-[10px] font-mono text-slate-500">{selectedLog.store?.code || "GLOBAL"}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Client IP Address</span>
                  <p className="font-mono text-slate-700">{selectedLog.ipAddress || "Direct Internal"}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Timestamp</span>
                  <p className="font-mono text-slate-700">{new Date(selectedLog.createdAt).toISOString()}</p>
                </div>
              </div>

              {selectedLog.previousValue && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Previous State</span>
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto mt-1">
                    {JSON.stringify(selectedLog.previousValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">New State Committed</span>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto mt-1">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Metadata</span>
                  <pre className="bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200 font-mono text-[11px] overflow-x-auto mt-1">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
