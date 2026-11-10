"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Boxes,
  ShoppingBag,
  Tablet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  RefreshCw,
  ArrowLeftRight,
  XCircle,
  CreditCard,
  Banknote,
  QrCode,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

export default function StoreDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState("PATNA");
  const [storeName, setStoreName] = useState("Prayog India Store");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // First get staff session to identify active branch
      let activeCode = "PATNA";
      try {
        const staffRes = await fetch("/api/staff/auth/me");
        const staffData = await staffRes.json();
        if (staffData?.success && staffData?.user?.storeCode) {
          activeCode = staffData.user.storeCode.toUpperCase();
        }
      } catch {
        // Fallback to PATNA
      }

      const [dashRes, ordRes] = await Promise.all([
        fetch(`/api/store/dashboard?storeId=${activeCode}`),
        fetch(`/api/store/orders?storeId=${activeCode}`),
      ]);

      const dashData = await dashRes.json();
      const ordData = await ordRes.json();

      if (dashData?.success) {
        setDashboardData(dashData.data);
        setStoreCode(dashData.store || activeCode);
        setStoreName(dashData.storeName || `${activeCode} Branch`);
      }

      if (ordData?.success) {
        setOrders(ordData.data.items || []);
      }
    } catch (err) {
      console.error("Failed to load store dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = dashboardData?.kpis;
  const payments = dashboardData?.payments;
  const topProducts = dashboardData?.topProducts || [];
  const recentActivities = dashboardData?.recentActivities || [];

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. Header Banner ── */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {storeCode} Branch
            </span>
            <span className="text-slate-500 text-xs font-semibold">
              Store Manager Operational Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {storeName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time branch overview: walk-in orders, localized inventory, POS billing, and incoming transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/store/pos"
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Open POS Terminal</span>
          </Link>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Refresh Store Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Primary KPI Cards (8 Key Metrics) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Sales
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ₹{(kpis?.todaySales || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Counter &amp; Kiosk Gross
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {kpis?.todayOrdersCount ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Fulfilled at store counter
          </div>
        </div>

        {/* Total Store Inventory */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Stock Units
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {(kpis?.totalStoreUnits || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Physical on-shelf inventory
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Inventory Health
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-600 font-mono">
            {kpis?.inventoryHealthScore || 92}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Catalog availability index
          </div>
        </div>

        {/* Low Stock SKUs */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alert
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
            {kpis?.lowStockCount ?? 0}
          </div>
          <Link
            href="/store/inventory?filter=low"
            className="text-[10px] text-amber-700 font-bold hover:underline mt-1 block"
          >
            Review &amp; reorder →
          </Link>
        </div>

        {/* Out of Stock SKUs */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Out of Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 font-mono">
            {kpis?.outOfStockCount ?? 0}
          </div>
          <Link
            href="/store/transfers?action=request"
            className="text-[10px] text-red-700 font-bold hover:underline mt-1 block"
          >
            Request transfer →
          </Link>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#00AEEF] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#00AEEF] font-mono">
            {kpis?.pendingOrdersCount ?? 0}
          </div>
          <Link
            href="/store/orders"
            className="text-[10px] text-[#00AEEF] font-bold hover:underline mt-1 block"
          >
            Awaiting counter cashier →
          </Link>
        </div>

        {/* Pending Transfers */}
        <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Transfers
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 font-mono">
            {kpis?.pendingTransfersCount ?? 0}
          </div>
          <Link
            href="/store/transfers"
            className="text-[10px] text-purple-700 font-bold hover:underline mt-1 block"
          >
            Confirm receipt →
          </Link>
        </div>
      </div>

      {/* ── 3. Middle Section: Sales Overview & Payment Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2563EB]" /> Payment Breakdown
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Today</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* UPI */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <QrCode className="w-3.5 h-3.5 text-purple-600" /> UPI / Counter QR
                </span>
                <span className="font-mono text-slate-900">
                  ₹{(payments?.upi || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round(((payments?.upi || 0) / (payments?.total || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Cash */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash Register
                </span>
                <span className="font-mono text-slate-900">
                  ₹{(payments?.cash || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round(((payments?.cash || 0) / (payments?.total || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Card */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Card (POS Terminal)
                </span>
                <span className="font-mono text-slate-900">
                  ₹{(payments?.card || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round(((payments?.card || 0) / (payments?.total || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Total Tendered</span>
            <span className="font-mono text-slate-900 text-sm">
              ₹{(payments?.total || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Top Selling Store Products */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Top Selling In-Store Products
            </h2>
            <Link
              href="/store/reports"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>Full Sales Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topProducts.slice(0, 4).map((p: any, idx: number) => (
              <div
                key={p.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      SKU: {p.sku}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-slate-900">
                    ₹{p.revenue?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    {p.salesCount} sold
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Lower Section: Recent Orders & Stock Movements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Store Orders Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#2563EB]" /> Recent Branch Orders
            </h2>
            <Link
              href="/store/orders"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.slice(0, 5).map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {ord.orderNumber || ord.id}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {ord.customerName || ord.user?.name || "Walk-in Guest"}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {ord.items?.length || 1} units
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      ₹{(ord.totalAmount || ord.total || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ord.status || "CONFIRMED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inventory Movements Activity Feed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" /> Stock Movements
            </h2>
            <Link
              href="/store/inventory"
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              Audits
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {recentActivities.map((act: any) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {act.description}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    SKU: {act.sku}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-xs ${
                      act.delta < 0
                        ? "text-red-600"
                        : act.delta > 0
                          ? "text-emerald-600"
                          : "text-slate-600"
                    }`}
                  >
                    {act.delta > 0 ? `+${act.delta}` : act.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 font-medium">
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" /> Store Manager Authority
            </div>
            Your credentials only permit actions for the {storeCode} branch. Stock transfers and cash registers are strictly isolated.
          </div>
        </div>
      </div>
    </div>
  );
}
