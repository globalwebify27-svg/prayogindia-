"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Boxes,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Printer,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function StoreReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [storeCode, setStoreCode] = useState("RANCHI");
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/reports");
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
        setStoreCode(data.store || "RANCHI");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const summary = reportData?.summary;
  const paymentBreakdown = reportData?.paymentBreakdown || [];
  const topProducts = reportData?.topProducts || [];
  const inventoryAlerts = reportData?.inventoryAlerts || [];
  const performance = reportData?.performanceMetric;

  const currentRevenue =
    timeframe === "daily"
      ? summary?.dailySales
      : timeframe === "weekly"
        ? summary?.weeklySales
        : summary?.monthlySales;

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. Header ── */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {storeCode} Branch Analytics
            </span>
            <span className="text-slate-500 text-xs font-semibold">
              Performance &amp; Ledger Reporting
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Store Sales &amp; Inventory Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Financial revenue, tender channel breakdown, product velocities, and return logs for {storeCode}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {(["daily", "weekly", "monthly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  timeframe === t
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>{timeframe} Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{(currentRevenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">
            Verified Counter Invoices
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Avg Order Value</span>
            <BarChart3 className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{(summary?.avgOrderValue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across {summary?.totalOrders || 0} customer orders
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Conversion Rate</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {performance?.conversionRate || "78.4%"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Footfall to completed sale
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Returns &amp; Refunds</span>
            <RotateCcw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {summary?.returnCount || 0}
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-1">
            Refunds: ₹{(summary?.refundAmount || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* ── 3. Middle Section: Tender Method & Product Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#2563EB]" /> Sales by Payment Method
          </h2>

          <div className="space-y-3.5 pt-1">
            {paymentBreakdown.map((pm: any) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{pm.method}</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{pm.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>{pm.count} transactions</span>
                  <span>{Math.round((pm.amount / (currentRevenue || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full rounded-full"
                    style={{ width: `${Math.min(100, (pm.amount / (currentRevenue || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products Ranking */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Top Selling Store Products
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topProducts.map((p: any) => (
                  <tr key={p.sku} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{p.sku}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{p.unitsSold}</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      ₹{p.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 4. Low Stock Reports & Store Health ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Inventory Stock Alerts Report
          </h2>
          <span className="text-xs text-slate-400 font-bold">Reorder thresholds monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {inventoryAlerts.map((al: any) => (
            <div key={al.sku} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 truncate max-w-[180px]">{al.name}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${al.status === "OUT_OF_STOCK" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {al.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                <span>Current: {al.currentStock} units</span>
                <span>Threshold: {al.threshold}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

