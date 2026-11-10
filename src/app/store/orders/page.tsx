"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  Search,
  Printer,
  Send,
  Mail,
  Download,
  FileText,
  X,
  Wallet,
  Banknote,
  QrCode,
  CreditCard,
  Check,
  RefreshCw,
  Building2,
  Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getAllSessions,
  saveSession,
  generateInvoiceNo,
  WalkInSession,
  POS_BROADCAST_CHANNEL,
} from "@/data/storeConfig";
import { ProfessionalBillModal } from "@/components/invoice/ProfessionalBillModal";

export default function StoreOrdersPage() {
  const [staff, setStaff] = useState<any | null>(null);
  const [staffLoaded, setStaffLoaded] = useState(false);

  // The active store shown in the UI - we also keep a ref so closures always read latest value
  const [storeCode, setStoreCode] = useState("");
  const storeCodeRef = useRef<string>("");

  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<any | null>(null);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Update both state and ref together so closures always see latest value
  const setActiveStore = (code: string) => {
    const upper = code.toUpperCase();
    setStoreCode(upper);
    storeCodeRef.current = upper;
  };

  // Fetch orders for a specific store
  const fetchOrders = useCallback((targetStore: string) => {
    if (!targetStore) return;
    setLoading(true);

    fetch(`/api/store/orders?storeId=${targetStore.toUpperCase()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const apiOrders = data.data?.items || [];
          const activeStore = (data.store || targetStore).toUpperCase();

          // Merge live walk-in kiosk sessions for this EXACT store only
          const localSessions = getAllSessions().filter(
            (s) => (s.storeId || "").toUpperCase() === activeStore,
          );

          const walkInOrders = localSessions.map((s) => ({
            id: s.id,
            orderNumber: s.id,
            invoiceNo: s.invoiceNo || s.id,
            storeCode: activeStore,
            storeLocation: `${activeStore} Branch`,
            customerName: s.customerName,
            customerPhone: s.customerPhone,
            customerEmail: s.customerEmail,
            totalAmount: s.total,
            status:
              s.status === "PENDING"
                ? "NEW KIOSK ORDER"
                : s.status === "ACCEPTED"
                  ? "ACCEPTED"
                  : s.status === "PAID"
                    ? "PAID & BILLED"
                    : s.status,
            createdAt: s.createdAt,
            items: s.items,
            isLiveWalkIn: true,
            isPaid: s.status === "PAID",
            rawSession: s,
          }));

          // Merge & deduplicate: local sessions take priority (freshest data)
          const seen = new Set<string>();
          const combined: any[] = [];
          [...walkInOrders, ...apiOrders].forEach((item) => {
            const key = item.id || item.orderNumber;
            if (key && !seen.has(key)) {
              seen.add(key);
              combined.push(item);
            }
          });

          // Sort newest first
          combined.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );

          setOrders(combined);
        } else {
          // Backend rejected (e.g. 403 for wrong store) — clear orders
          setOrders([]);
          console.warn("Store orders fetch rejected:", data.message);
        }
      })
      .catch((err) => {
        console.error("Failed to load store orders", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Load staff session ONCE on mount ──
  useEffect(() => {
    fetch("/api/staff/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setStaff(data.user);

          if (data.user.role === "STORE_MANAGER") {
            // STRICT LOCK: Store Manager is strictly locked to their assigned store only.
            // A Patna manager only sees Patna; a Ranchi manager only sees Ranchi.
            const assigned = (data.user.storeCode || "PATNA").toUpperCase();
            setActiveStore(assigned);
            fetchOrders(assigned);
          } else {
            // In Store Portal, respect storeId if specified in URL query, otherwise default to user's store or PATNA
            const urlStore = typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("storeId")
              : null;
            const chosen = (urlStore || data.user.storeCode || "PATNA").toUpperCase();
            setActiveStore(chosen);
            fetchOrders(chosen);
          }
        } else {
          setActiveStore("PATNA");
          fetchOrders("PATNA");
        }
      })
      .catch(() => {
        setActiveStore("PATNA");
        fetchOrders("PATNA");
      })
      .finally(() => setStaffLoaded(true));

    // Live kiosk BroadcastChannel listener — uses ref so always reads current store
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined") {
      bc = new BroadcastChannel(POS_BROADCAST_CHANNEL);
      bc.onmessage = (e) => {
        if (
          e.data?.type === "NEW_SESSION" ||
          e.data?.type === "SESSION_UPDATED"
        ) {
          // Always use ref (not stale closure) to fetch the correct store
          if (storeCodeRef.current) {
            fetchOrders(storeCodeRef.current);
          }
        }
      };
    }
    return () => bc?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only ONCE on mount — no storeCode dependency

  // Confirm payment for a kiosk / counter order
  const handleConfirmPayment = async () => {
    if (!paymentOrder) return;
    setProcessingPayment(true);

    try {
      const res = await fetch("/api/store/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paymentOrder.id || paymentOrder.orderNumber,
          paymentMethod: paymentMode,
          status: "PAID",
        }),
      });
      await res.json();

      // Update local kiosk session if applicable
      if (paymentOrder.rawSession) {
        const invNo = generateInvoiceNo(paymentOrder.rawSession.storeId);
        const updated: WalkInSession = {
          ...paymentOrder.rawSession,
          status: "PAID",
          invoiceNo: invNo,
          updatedAt: new Date().toISOString(),
        };
        saveSession(updated);

        if (typeof window !== "undefined") {
          const bc = new BroadcastChannel(POS_BROADCAST_CHANNEL);
          bc.postMessage({ type: "SESSION_UPDATED", session: updated });
          bc.close();
        }

        fetch("/api/pos/sessions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: updated.storeId,
            sessionId: updated.id,
            updates: { status: "PAID", invoiceNo: invNo },
          }),
        }).catch(() => {});
      }

      // Immediately update local state — no waiting for re-fetch
      setOrders((prev) =>
        prev.map((o) => {
          if (
            o.id === paymentOrder.id ||
            o.orderNumber === paymentOrder.id ||
            o.id === paymentOrder.orderNumber
          ) {
            return {
              ...o,
              status: "PAID & BILLED",
              isPaid: true,
              paymentStatus: "PAID",
              paymentMethod: paymentMode,
            };
          }
          return o;
        }),
      );

      setPaymentOrder(null);
      // Sync from server in background
      fetchOrders(storeCodeRef.current || storeCode);
    } catch (err) {
      console.error("Payment confirmation failed", err);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Filtered orders by search and tab
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.id?.toLowerCase().includes(q) ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusTab === "PAID") {
      return o.isPaid || o.status === "PAID & BILLED" || o.status === "PAID";
    }
    if (statusTab === "PENDING") {
      return !o.isPaid && o.status !== "PAID & BILLED" && o.status !== "PAID";
    }
    return true;
  });

  const paidCount = orders.filter(
    (o) => o.isPaid || o.status === "PAID & BILLED" || o.status === "PAID",
  ).length;
  const pendingCount = orders.filter(
    (o) => !o.isPaid && o.status !== "PAID & BILLED" && o.status !== "PAID",
  ).length;

  const managerStore = staff?.storeCode?.toUpperCase() || storeCode;
  const managerStoreName = {
    RANCHI: "Prayog India Ranchi Central Hub",
    PATNA: "Prayog India Patna STEM Branch",
    DELHI: "Prayog India Delhi NCR Center",
  }[storeCode] || `${storeCode} Branch`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {storeCode || "..."} Branch
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Live In-Store Counter &amp; POS Receipts
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Branch Orders &amp; Counter Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official desk for branch managers to collect payments, print GST invoices, and dispatch counter orders.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(storeCodeRef.current || storeCode)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Store context banner - strictly locked, NO cross-store switcher buttons */}
      {staffLoaded && (
        <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">{storeCode} Branch Desk:</span>
            <span>You are viewing {storeCode} branch inventory and counter orders only. Cross-store access is blocked.</span>
          </div>
          <span className="shrink-0 text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {storeCode} Locked ✓
          </span>
        </div>
      )}

      {/* Orders Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, customer name, or phone..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all shadow-2xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
            {[
              { key: "ALL", label: `All Orders (${orders.length})` },
              { key: "PAID", label: `Paid & Delivered (${paidCount})` },
              { key: "PENDING", label: `New Kiosk (${pendingCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key as any)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusTab === tab.key
                    ? tab.key === "PENDING"
                      ? "bg-white text-amber-700 shadow-2xs"
                      : tab.key === "PAID"
                        ? "bg-white text-emerald-700 shadow-2xs"
                        : "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date &amp; Time</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-28 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto stroke-1 mb-2" />
                    <p className="font-bold text-sm text-slate-600">No Orders Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search
                        ? "No orders match your search query."
                        : `No ${statusTab === "PENDING" ? "pending" : statusTab === "PAID" ? "completed" : ""} orders for ${storeCode} branch.`}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isOrderPaid =
                    order.isPaid ||
                    order.status === "PAID & BILLED" ||
                    order.status === "PAID" ||
                    order.paymentStatus === "PAID";

                  return (
                    <tr
                      key={order.id || order.orderNumber}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {order.id}
                        </div>
                        {order.orderNumber && order.orderNumber !== order.id && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {order.orderNumber}
                          </div>
                        )}
                        <span className="text-[10px] text-[#2563EB] font-bold">
                          {order.storeCode || storeCode} Store
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {order.customerName || order.user?.name || "Walk-in Customer"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.customerPhone || order.user?.phone || "Counter Sale"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.items?.length || 1} items
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isOrderPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paid &amp; Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            New Kiosk Order
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[11px] text-slate-500">
                        <div className="font-medium text-slate-700">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.createdAt || Date.now()).toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isOrderPaid && (
                            <button
                              onClick={() => { setPaymentOrder(order); setPaymentMode("CASH"); }}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              Take Payment
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(order)}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            View Bill
                          </button>
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

      {/* ── Payment Modal ── */}
      {paymentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Receive Customer Payment</h2>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Order #{paymentOrder.id || paymentOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Amount Due</span>
              <div className="text-3xl font-black text-emerald-600 font-mono">
                ₹{(paymentOrder.totalAmount || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-slate-600 font-medium pt-1">
                Customer: <span className="text-slate-900 font-bold">
                  {paymentOrder.customerName || paymentOrder.user?.name}
                </span>{" "}
                ({paymentOrder.customerPhone || "Walk-in"})
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Select Received Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "CASH", label: "Cash Desk", Icon: Banknote },
                  { id: "UPI", label: "UPI / QR", Icon: QrCode },
                  { id: "CARD", label: "Card Swipe", Icon: CreditCard },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMode(id as any)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMode === id
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={processingPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {processingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recording Payment...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Received ₹{(paymentOrder.totalAmount || 0).toLocaleString("en-IN")} &amp; Mark Paid
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Professional Multi-Format Bill Modal ── */}
      {selectedInvoice && (
        <ProfessionalBillModal
          order={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          defaultFormat="modern"
        />
      )}
    </div>
  );
}
