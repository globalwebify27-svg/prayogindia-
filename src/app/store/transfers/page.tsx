"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Boxes,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Check,
  X,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  Minus,
  Trash2,
} from "lucide-react";
import { PRODUCTS } from "@/data/mockData";

export default function StoreTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState("PATNA");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "incoming" | "outgoing">("all");
  const [search, setSearch] = useState("");

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);

  // New Request Form State
  const [targetSourceStore, setTargetSourceStore] = useState("ranchi");
  const [requestItems, setRequestItems] = useState<{ productId: string; name: string; sku: string; quantity: number }[]>([
    { productId: PRODUCTS[0].id, name: PRODUCTS[0].name, sku: PRODUCTS[0].sku, quantity: 10 },
  ]);
  const [requestNotes, setRequestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchTransfers = async (overrideStore?: string) => {
    setLoading(true);
    try {
      const active = (overrideStore || storeCode || "PATNA").toLowerCase();
      const res = await fetch(`/api/store/transfers?storeId=${active}`);
      const data = await res.json();
      if (data.success) {
        setTransfers(data.data || []);
        if (data.store) {
          setStoreCode(data.store.toUpperCase());
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/staff/auth/me")
      .then((res) => res.json())
      .then((data) => {
        let chosenStore = "PATNA";
        if (data.success && data.user) {
          if (data.user.role === "STORE_MANAGER") {
            chosenStore = (data.user.storeCode || "PATNA").toUpperCase();
          } else {
            const urlStore =
              typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("storeId")
                : null;
            chosenStore = (
              urlStore ||
              data.user.storeCode ||
              "PATNA"
            ).toUpperCase();
          }
        }
        setStoreCode(chosenStore);
        fetchTransfers(chosenStore);
      })
      .catch(() => {
        fetchTransfers("PATNA");
      });
  }, []);

  // Filter transfers strictly for current store
  const currentStoreLower = storeCode.toLowerCase();
  const filtered = transfers.filter((t) => {
    const isIncoming =
      (t.destinationStoreId || "").toLowerCase() === currentStoreLower;
    const isOutgoing =
      (t.sourceStoreId || "").toLowerCase() === currentStoreLower;

    if (activeTab === "incoming" && !isIncoming) return false;
    if (activeTab === "outgoing" && !isOutgoing) return false;

    const q = search.toLowerCase().trim();
    if (q) {
      const matchNum = t.transferNumber?.toLowerCase().includes(q);
      const matchNote = t.notes?.toLowerCase().includes(q);
      const matchItem = t.items?.some(
        (i: any) =>
          i.name?.toLowerCase().includes(q) ||
          i.sku?.toLowerCase().includes(q),
      );
      return matchNum || matchNote || matchItem;
    }
    return true;
  });

  // Handle Create Transfer Request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/store/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceStoreId: targetSourceStore,
          items: requestItems,
          notes: requestNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess("Transfer request submitted to Central Operations.");
        setTimeout(() => {
          setShowRequestModal(false);
          setActionSuccess("");
          fetchTransfers();
        }, 1200);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Store Manager confirming receipt
  const handleConfirmReceived = async (transferId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/store/transfers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId,
          status: "RECEIVED",
          notes: "Physically verified and unpacked at store counter",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Stock marked as RECEIVED. Inventory updated!");
        fetchTransfers();
        setSelectedTransfer(null);
      } else {
        alert(data.message || "Failed to confirm receipt.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatStoreName = (name?: string, id?: string) => {
    if (!name && !id) return "Store";
    const raw = name || `${id?.toUpperCase()} Store`;
    return raw
      .replace("Prayog India ", "")
      .replace("Main Branch & ", "")
      .replace("Robotics & ", "")
      .trim();
  };

  const getStatusBadge = (st: string) => {
    const s = st?.toUpperCase() || "";
    if (
      s === "REQUESTED" ||
      s === "TRANSFER REQUESTED" ||
      s === "DRAFT / REQUESTED"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Transfer Requested
        </span>
      );
    }
    if (s === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Approved
        </span>
      );
    }
    if (
      s === "DISPATCHED" ||
      s === "IN_TRANSIT" ||
      s === "DISPATCHED (IN TRANSIT)" ||
      s === "DISPATCHED & IN TRANSIT"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Dispatched (In Transit)
        </span>
      );
    }
    if (
      s === "RECEIVED" ||
      s === "COMPLETED" ||
      s === "RECEIVED & STOCK UPDATED"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Received ✓
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 whitespace-nowrap">
        {st}
      </span>
    );
  };

  return (
    <div className="space-y-5 font-sans">
      {/* ── 1. Header ── */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {storeCode} Branch Transfers
            </span>
            <span className="text-slate-500 text-xs font-semibold">
              Stock Replenishment &amp; Logistics
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Inter-Branch Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Request stock from Central Warehouse (Ranchi) and confirm receipts upon physical arrival.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Stock</span>
          </button>

          <button
            onClick={() => fetchTransfers()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Tab Pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "All Branch Transfers" },
            { id: "incoming", label: "Incoming to Store" },
            { id: "outgoing", label: "Outgoing from Store" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transfer # or component..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-9 text-xs focus:bg-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* ── 3. Transfers Table ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Transfer #</th>
                <th className="py-3 px-3 whitespace-nowrap">Source Store</th>
                <th className="py-3 px-3 whitespace-nowrap">Destination Store</th>
                <th className="py-3 px-3 whitespace-nowrap">Items / Manifest</th>
                <th className="py-3 px-3 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading stock transfers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transfers found for {storeCode} Store.
                  </td>
                </tr>
              ) : (
                filtered.map((tr) => {
                  const isIncoming =
                    (tr.destinationStoreId || "").toLowerCase() ===
                    currentStoreLower;
                  const st = (tr.status || "").toUpperCase();
                  const canConfirmReceipt =
                    isIncoming &&
                    (st === "DISPATCHED" ||
                      st === "IN_TRANSIT" ||
                      st === "APPROVED" ||
                      st.includes("DISPATCHED") ||
                      st.includes("TRANSIT"));

                  return (
                    <tr
                      key={tr.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div>{tr.transferNumber || tr.id}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {new Date(tr.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        <div
                          className="font-bold text-slate-900 truncate max-w-[150px]"
                          title={tr.sourceStoreName}
                        >
                          {formatStoreName(tr.sourceStoreName, tr.sourceStoreId)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          {tr.sourceStoreId}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        <div
                          className="font-bold text-slate-900 truncate max-w-[150px]"
                          title={tr.destinationStoreName}
                        >
                          {formatStoreName(
                            tr.destinationStoreName,
                            tr.destinationStoreId,
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          {tr.destinationStoreId}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-[180px]">
                        <span className="font-bold text-slate-800">
                          {tr.items?.length || 1} distinct item(s)
                        </span>
                        <div
                          className="text-[10px] text-slate-400 truncate mt-0.5"
                          title={tr.items
                            ?.map((i: any) => `${i.name} (×${i.quantity})`)
                            .join(", ")}
                        >
                          {tr.items
                            ?.map((i: any) => `${i.name} (×${i.quantity})`)
                            .join(", ")}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(tr.status)}
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedTransfer(tr)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-100"
                            title="View Transfer Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canConfirmReceipt && (
                            <button
                              onClick={() => handleConfirmReceived(tr.id)}
                              disabled={submitting}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Confirm</span>
                            </button>
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

      {/* ── 4. Transfer Details Modal ── */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedTransfer(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2563EB]">
                  Transfer Inspection
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {selectedTransfer.transferNumber || selectedTransfer.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px]">Source</span>
                <div className="font-black text-slate-900">{selectedTransfer.sourceStoreName}</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px]">Destination</span>
                <div className="font-black text-slate-900">{selectedTransfer.destinationStoreName}</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400">Transfer Manifest</span>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-white">
                {selectedTransfer.items?.map((it: any, idx: number) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</div>
                    </div>
                    <span className="font-mono font-black text-sm text-[#2563EB]">
                      ×{it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedTransfer.notes && (
              <div className="text-[11px] text-slate-600 bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl">
                <span className="font-bold text-amber-800">Transfer Note:</span> {selectedTransfer.notes}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div>{getStatusBadge(selectedTransfer.status)}</div>
              {(selectedTransfer.status === "DISPATCHED" || selectedTransfer.status === "IN_TRANSIT" || selectedTransfer.status === "APPROVED") &&
                (selectedTransfer.destinationStoreId || "").toLowerCase() === currentStoreLower && (
                  <button
                    onClick={() => handleConfirmReceived(selectedTransfer.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Confirm Stock Received</span>
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. New Request Stock Modal ── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowRequestModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-5 text-xs animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                    Stock Replenishment Request
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Request Inventory from Central Hub
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              {/* Transfer Route Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Source Warehouse / Hub
                  </label>
                  <select
                    value={targetSourceStore}
                    onChange={(e) => setTargetSourceStore(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2563EB] shadow-2xs"
                  >
                    <option value="ranchi">🏢 Ranchi Main Branch &amp; Central Hub (Primary)</option>
                    <option value="patna">🏬 Patna STEM Branch</option>
                    <option value="delhi">🏬 Delhi NCR Center</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Destination Branch
                  </label>
                  <div className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#2563EB] flex items-center gap-1.5 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{storeCode} Branch (My Store)</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Components &amp; Quantities Needed
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {requestItems.length} {requestItems.length === 1 ? "SKU" : "SKUs"} selected
                  </span>
                </div>

                <div className="space-y-2.5">
                  {requestItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-colors"
                    >
                      {/* Product Select (min-w-0 prevents flex blowout) */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-slate-400 uppercase mb-0.5">
                          Product Component
                        </div>
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const sel = PRODUCTS.find((p) => p.id === e.target.value);
                            if (sel) {
                              const updated = [...requestItems];
                              updated[idx] = {
                                productId: sel.id,
                                name: sel.name,
                                sku: sel.sku,
                                quantity: item.quantity,
                              };
                              setRequestItems(updated);
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2563EB] truncate shadow-2xs"
                        >
                          {PRODUCTS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Stepper Control */}
                      <div className="shrink-0 flex items-center gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase mb-0.5">
                            Quantity
                          </div>
                          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...requestItems];
                                updated[idx].quantity = Math.max(1, item.quantity - 1);
                                setRequestItems(updated);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={500}
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...requestItems];
                                updated[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
                                setRequestItems(updated);
                              }}
                              className="w-14 text-center text-xs font-mono font-black text-slate-900 focus:outline-none border-x border-slate-200 py-1.5"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...requestItems];
                                updated[idx].quantity = item.quantity + 1;
                                setRequestItems(updated);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Delete item button */}
                        {requestItems.length > 1 && (
                          <div className="pt-3.5">
                            <button
                              type="button"
                              onClick={() =>
                                setRequestItems(requestItems.filter((_, i) => i !== idx))
                              }
                              className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-red-200"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRequestItems([
                      ...requestItems,
                      {
                        productId: PRODUCTS[1]?.id || PRODUCTS[0].id,
                        name: PRODUCTS[1]?.name || PRODUCTS[0].name,
                        sku: PRODUCTS[1]?.sku || PRODUCTS[0].sku,
                        quantity: 10,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-blue-700 bg-blue-50/60 hover:bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Component SKU</span>
                </button>
              </div>

              {/* Reason / Purpose */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason / Purpose (e.g. Student workshop demand)
                </label>
                <input
                  type="text"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g. Depleted shelf stock for upcoming weekend robotics workshop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB] shadow-2xs transition-all"
                />
              </div>

              {actionSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 active:scale-98 transition-all"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Requisition...</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-4 h-4" />
                      <span>Submit Transfer Request</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

