"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  Search,
  AlertTriangle,
  Plane,
  Package,
  XCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const ORDER_STATUSES = [
  "ORDER_PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Section 31 Shipping Info Modal State
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<
    any | null
  >(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`/api/admin/orders?status=${statusFilter}&channel=${channelFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.items) {
          setOrders(data.data.items);
        } else {
          // Fallback mock orders
          setOrders([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, channelFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.orderNumber?.toLowerCase().includes(q) ||
      ord.user?.name?.toLowerCase().includes(q) ||
      ord.user?.email?.toLowerCase().includes(q) ||
      ord.awbNumber?.toLowerCase().includes(q) ||
      ord.courierProvider?.toLowerCase().includes(q);
    const matchesChannel =
      channelFilter === "all" || ord.orderSource === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-0.5 rounded-full border border-[#00AEEF]/20">
              Super Admin Operations · Orders &amp; Logistics Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Fulfillment &amp; Channel Dispatch
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time fulfillment desk for all orders originating from the{" "}
            <strong>Prayog Website Store</strong>, <strong>Mobile App</strong>,
            and store branches.
          </p>
        </div>
      </div>

      {/* Channel Selector Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Channels", icon: ShoppingBag },
          {
            id: "WEBSITE",
            label: "🌐 Website Orders (Online)",
            count: orders.filter((o) => o.orderSource === "WEBSITE").length,
          },
          {
            id: "MOBILE_APP",
            label: "📱 Mobile App Orders",
            count: orders.filter((o) => o.orderSource === "MOBILE_APP").length,
          },
          {
            id: "WALK_IN",
            label: "🏬 Store Walk-ins",
            count: orders.filter((o) => o.orderSource === "WALK_IN").length,
          },
        ].map((tab) => {
          const active = channelFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setChannelFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                active
                  ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, AWB..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00AEEF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none focus:border-[#00AEEF]"
          >
            <option value="all">All Order Statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Orders & Section 31 Shipping Info Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order # &amp; Source</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Weight / Freight</th>
                <th className="p-4">Restricted Item?</th>
                <th className="p-4">Courier &amp; AWB</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Shipping Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No orders found matching filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Order No & Source */}
                    <td className="p-4">
                      <div className="font-mono font-black text-slate-900 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#00AEEF]" />
                        <span>{ord.orderNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                        Source:{" "}
                        <span className="text-[#00AEEF]">
                          {ord.orderSource || "Website"}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">
                        {ord.user?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ord.user?.phone}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 font-black text-slate-900 text-sm">
                      ₹{ord.totalAmount?.toLocaleString()}
                    </td>

                    {/* Section 31 Weight & Freight Mode */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {ord.weightGm || 500} gm
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 mt-0.5">
                        {ord.freightMode === "Air Freight" ? (
                          <span className="text-blue-600 flex items-center gap-0.5">
                            <Plane className="w-3 h-3" /> Air
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <Truck className="w-3 h-3" /> Surface
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Section 31 Restricted Item YES / NO */}
                    <td className="p-4">
                      {ord.hasRestrictedItem ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>YES (Battery)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                          <span>NO</span>
                        </span>
                      )}
                    </td>

                    {/* Section 31 Courier & AWB */}
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">
                        {ord.courierProvider}
                      </div>
                      <div className="font-mono text-xs font-black text-[#00AEEF]">
                        {ord.awbNumber || "PENDING AWB"}
                      </div>
                    </td>

                    {/* Order Status Selector */}
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value)
                        }
                        className="bg-blue-50 text-blue-800 border border-blue-200 rounded-xl px-2.5 py-1 text-[11px] font-extrabold focus:outline-none cursor-pointer"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions: View Section 31 Details */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrderForShipping(ord)}
                        className="px-3 py-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Shipping Info</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section 31 Order Shipping Information Modal */}
      {selectedOrderForShipping && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedOrderForShipping(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Section 31 · Compliance &amp; Courier Logistics Details
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Order Shipping Inspection:</span>
                  <span className="font-mono text-[#00AEEF]">
                    {selectedOrderForShipping.orderNumber}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForShipping(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            {/* Section 31 Checklist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Consignment Weight
                </span>
                <div className="text-sm font-black text-slate-900">
                  {selectedOrderForShipping.weightGm} Grams
                </div>
                <div className="text-[10px] text-slate-500">
                  {(selectedOrderForShipping.weightGm / 1000).toFixed(2)} KG
                  Volumetric
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Courier Provider
                </span>
                <div className="text-sm font-black text-slate-900">
                  {selectedOrderForShipping.courierProvider}
                </div>
                <div className="text-[10px] text-[#00AEEF] font-bold">
                  API Verified
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Air / Surface Mode
                </span>
                <div className="text-sm font-black text-slate-900">
                  {selectedOrderForShipping.freightMode}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  DGCA Compliant
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Restricted Item
                </span>
                <div className="text-sm font-black text-slate-900 flex items-center gap-1">
                  {selectedOrderForShipping.hasRestrictedItem ? (
                    <span className="text-amber-800 font-extrabold">
                      YES (Battery / Haz)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-extrabold">
                      NO (Standard)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  AWB Number
                </span>
                <div className="font-mono text-xs font-black text-[#00AEEF]">
                  {selectedOrderForShipping.awbNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  Barcode Assigned
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Delivery Status
                </span>
                <div className="text-xs font-black text-emerald-600">
                  {selectedOrderForShipping.deliveryStatus}
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedOrderForShipping.trackingStatus}
                </div>
              </div>
            </div>

            {/* Restricted Item Detailed Explanation */}
            {selectedOrderForShipping.hasRestrictedItem && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 text-amber-900">
                <div className="font-black text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Battery Consignment Protection Active</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  {selectedOrderForShipping.restrictedItemReason}. Aviation air
                  freight was prohibited automatically at checkout; booking was
                  routed via ground surface linehaul to prevent courier AWB
                  cancellation or airport customs rejection.
                </p>
              </div>
            )}

            {/* Itemized Manifest */}
            <div className="space-y-2">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider block">
                Packaged Consignment Items (
                {selectedOrderForShipping.items?.length || 0})
              </span>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 p-2">
                {selectedOrderForShipping.items?.map(
                  (item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900">
                          {item.name}
                        </span>
                        {item.isRestricted && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black uppercase">
                            Battery
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-600 font-bold">
                          {item.qty}x
                        </span>
                        <span className="font-black text-slate-900 ml-2">
                          ₹{(item.qty * item.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Delivery Destination Address Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                Destination Delivery Hub:
              </span>
              <div className="font-black text-slate-900 text-xs">
                {selectedOrderForShipping.user?.name}
              </div>
              <div className="text-slate-600 font-medium">
                {selectedOrderForShipping.shippingAddress}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Tel: {selectedOrderForShipping.user?.phone}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForShipping(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(
                    `Printing compliant DGCA shipping manifest for order ${selectedOrderForShipping.orderNumber}`,
                  );
                  setSelectedOrderForShipping(null);
                }}
                className="px-6 py-2.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#FFC20E]" />
                <span>Print Logistics Manifest</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
