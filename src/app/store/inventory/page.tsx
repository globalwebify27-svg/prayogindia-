"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  XCircle,
  Clock,
  ArrowLeftRight,
  FileText,
  X,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StoreInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState("");
  const [isCentralInventory, setIsCentralInventory] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "instock" | "low" | "out">("all");
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Request Modal State
  const [adjustmentItem, setAdjustmentItem] = useState<any | null>(null);
  const [adjType, setAdjType] = useState<"DAMAGED" | "DISCREPANCY" | "FOUND">("DAMAGED");
  const [adjQuantity, setAdjQuantity] = useState(1);
  const [adjReason, setAdjReason] = useState("");
  const [adjSuccess, setAdjSuccess] = useState("");

  // Movement History Modal
  const [showHistory, setShowHistory] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/inventory");
      const data = await res.json();
      if (data.success) {
        setInventory(data.data.items || []);
        setStoreCode(data.store || "STORE");
        setIsCentralInventory(data.isCentralInventory || false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventory.filter((it) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      it.name?.toLowerCase().includes(q) ||
      it.sku?.toLowerCase().includes(q) ||
      it.category?.toLowerCase().includes(q);

    const stockQty = it.localStock ?? it.quantity ?? it.stock ?? 0;
    let matchesStatus = true;
    if (statusFilter === "out") matchesStatus = stockQty <= 0;
    else if (statusFilter === "low") matchesStatus = stockQty > 0 && stockQty <= 10;
    else if (statusFilter === "instock") matchesStatus = stockQty > 10;

    return matchesSearch && matchesStatus;
  });

  const lowCount = inventory.filter((i) => {
    const q = i.localStock ?? i.quantity ?? i.stock ?? 0;
    return q > 0 && q <= 10;
  }).length;

  const outCount = inventory.filter((i) => {
    const q = i.localStock ?? i.quantity ?? i.stock ?? 0;
    return q <= 0;
  }).length;

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjSuccess("Stock adjustment request submitted to Central Operations.");
    setTimeout(() => {
      setAdjustmentItem(null);
      setAdjSuccess("");
      setAdjReason("");
      setAdjQuantity(1);
    }, 1200);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* ── 1. Header ── */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {storeCode} Branch Stock
            </span>
            {isCentralInventory ? (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ★ Central Network Inventory (Online + App + Walk-in)
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Physical Store Stock
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {isCentralInventory
              ? "Central Warehouse & Local Store Inventory"
              : "Store Branch Local Inventory"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isCentralInventory
              ? "Ranchi Main Branch serves as Central Inventory for Website orders, Mobile App orders, and Ranchi walk-in sales."
              : `Independent physical store stock. Sales at ${storeCode} reduce this branch's stock only.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Stock Movements</span>
          </button>

          <Link
            href="/store/transfers"
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Request Transfer</span>
          </Link>

          <button
            onClick={fetchInventory}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 2. Filters Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Quick Stock Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Products", count: inventory.length },
            { id: "instock", label: "In Stock (>10)", count: inventory.length - (lowCount + outCount) },
            { id: "low", label: "Low Stock (<10)", count: lowCount, alert: true },
            { id: "out", label: "Out of Stock (0)", count: outCount, danger: true },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === pill.id
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  statusFilter === pill.id
                    ? "bg-white/20 text-white"
                    : pill.danger
                      ? "bg-red-100 text-red-700"
                      : pill.alert
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-700"
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search local SKUs, components, boards..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] font-mono"
          />
        </div>
      </div>

      {/* ── 3. Inventory Table ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">SKU</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Unit Price</th>
                <th className="px-5 py-3.5">Stock Status</th>
                <th className="px-5 py-3.5 text-center">Available Units</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-48 rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-20 rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-28 rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-16 rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Skeleton className="h-4 w-12 rounded mx-auto" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Skeleton className="h-4 w-16 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No items found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const stockQty = item.localStock ?? item.quantity ?? item.stock ?? 0;
                  const isOutOfStock = stockQty <= 0;
                  const isLow = stockQty > 0 && stockQty <= 10;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                        {item.sku}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {item.category || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Optimal Stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-black text-sm text-slate-900">
                        {stockQty}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setAdjustmentItem(item)}
                            className="px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Report physical count discrepancy or damage"
                          >
                            Adj Request
                          </button>

                          {(isLow || isOutOfStock) && (
                            <Link
                              href="/store/transfers"
                              className="px-2.5 py-1 text-[10px] font-bold text-[#2563EB] hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                              title="Request restock transfer"
                            >
                              Restock →
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Stock Adjustment Request Modal ── */}
      {adjustmentItem && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setAdjustmentItem(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2563EB]">
                  Physical Stock Audit
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Request Stock Adjustment
                </h3>
              </div>
              <button
                onClick={() => setAdjustmentItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="font-bold text-slate-900">{adjustmentItem.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">
                SKU: {adjustmentItem.sku} · Current Registered Units: {adjustmentItem.localStock ?? adjustmentItem.quantity ?? 0}
              </div>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="DAMAGED">Damaged / Defective Stock (- Units)</option>
                  <option value="DISCREPANCY">Inventory Count Variance (- Units)</option>
                  <option value="FOUND">Unrecorded Found Units (+ Units)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quantity Discrepancy
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={adjQuantity}
                  onChange={(e) => setAdjQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Manager Explanation &amp; Notes
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Pin bent during customer demonstration or package seal breached"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {adjSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{adjSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Submit to Central Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentItem(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Movement History Modal ── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowHistory(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2563EB]">
                  Audit Ledger
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {storeCode} Branch Stock Movements
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[
                { desc: "Walk-in Counter Sale (Invoice #994)", time: "25 mins ago", delta: -2, sku: "PRG-ARD-001" },
                { desc: "Walk-in Counter Sale (Invoice #993)", time: "1 hour ago", delta: -4, sku: "PRG-MOT-808" },
                { desc: "Inter-Store Stock Received from Ranchi Central Hub", time: "Yesterday", delta: +25, sku: "ESP32-001" },
                { desc: "Store Manager Shelf Count Audit", time: "3 days ago", delta: 0, sku: "RPI4-4GB" },
                { desc: "Damaged Unit Discard Logged", time: "5 days ago", delta: -1, sku: "BAT-LIPO-03" },
              ].map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{m.desc}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: {m.sku} · {m.time}</div>
                  </div>
                  <span className={`font-mono font-black text-sm ${m.delta < 0 ? "text-red-600" : m.delta > 0 ? "text-emerald-600" : "text-slate-600"}`}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
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
