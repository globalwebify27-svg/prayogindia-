"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Boxes,
  Bell,
  ArrowLeftRight,
  ShoppingBag,
  SlidersHorizontal,
  Plus,
  ClipboardList,
  Calendar,
  Sliders,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Landmark,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [selectedBranchFilter, setSelectedBranchFilter] =
    useState("All Locations");
  const [stats, setStats] = useState<{
    totalProducts?: number;
    activeProducts?: number;
    lowStockProducts?: number;
    totalOrders?: number;
    totalCustomers?: number;
    openSupportTickets?: number;
  }>({});

  const [dashboardData, setDashboardData] = useState<{
    totalInventoryValueFormatted?: string;
    multiLocationStock?: Array<{
      code: string;
      name: string;
      inStock: number;
      lowStock: number;
      outOfStock: number;
      totalUnits: number;
      inStockHeightPct: number;
      lowStockHeightPct: number;
      outOfStockHeightPct: number;
    }>;
    overallInStockRate?: number;
    highestCapacityStore?: {
      name: string;
      units: number;
    };
    valueByLocation?: {
      totalValuation: number;
      formattedTotal: string;
      locations: Array<{
        code: string;
        name: string;
        value: number;
        formattedValue: string;
        percentage: number;
        color: string;
        dashArray: string;
        dashOffset: number;
      }>;
    };
    recentTransfers?: Array<{
      id: string;
      code: string;
      route: string;
      status: string;
      color: string;
      time: string;
    }>;
    lowStockAlerts?: Array<{
      id: string;
      name: string;
      loc: string;
      units: string;
    }>;
    topSellingProducts?: Array<{
      rank: string;
      name: string;
      sku: string;
      sold: string;
      revenue: string;
    }>;
    recentActivity?: Array<{
      action: string;
      time: string;
      dot: string;
    }>;
  }>({});

  useEffect(() => {
    fetch("/api/admin/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDashboardData(data.data);
          if (data.data.metrics) {
            setStats(data.data.metrics);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of your multi-location inventory operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Link to Unified Hub */}
          <Link
            href="/admin/hub"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black px-4 py-2.5 rounded-full shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Open All-in-1 Admin Hub</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </Link>

          {/* Date Picker Button */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-full px-4 py-2 text-xs font-bold text-slate-700 shadow-xs">
            <span>
              {new Date().toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Customise Button */}
          <button className="flex items-center gap-1.5 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-[#0084FF]/25 transition-all cursor-pointer active:scale-95">
            <Sliders className="w-3.5 h-3.5" />
            <span>Customise</span>
          </button>
        </div>
      </div>

      {/* 🚀 HIGH-VISIBILITY CORE OPERATIONS: Order Management, Payments, Add Product */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Order Management Card */}
        <Link
          href="/admin/orders"
          className="bg-white hover:bg-[#F8FAFD] border border-slate-100/90 rounded-[26px] p-5 shadow-[0_8px_30px_rgba(15,35,80,0.04)] hover:shadow-[0_14px_35px_rgba(15,35,80,0.08)] hover:-translate-y-0.5 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-[#EBF5FF] text-[#0084FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0084FF] transition-colors truncate">
                  Order Management
                </span>
                <span className="bg-[#EBF5FF] text-[#0084FF] text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Track customer orders, dispatches & invoices
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F1F4F9] text-slate-400 group-hover:text-[#0084FF] group-hover:bg-[#EBF5FF] flex items-center justify-center shrink-0 transition-all ml-2">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* 2. Payment Management Card */}
        <Link
          href="/admin/payments"
          className="bg-white hover:bg-[#F8FAFD] border border-slate-100/90 rounded-[26px] p-5 shadow-[0_8px_30px_rgba(15,35,80,0.04)] hover:shadow-[0_14px_35px_rgba(15,35,80,0.08)] hover:-translate-y-0.5 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-[#EAFBF3] text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#10B981] transition-colors truncate">
                  Payment Management
                </span>
                <span className="bg-[#EAFBF3] text-[#059669] text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                  NEFT / UPI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Verify bank transfers, receipts & settlements
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F1F4F9] text-slate-400 group-hover:text-[#10B981] group-hover:bg-[#EAFBF3] flex items-center justify-center shrink-0 transition-all ml-2">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* 3. Add New Product Card */}
        <Link
          href="/admin/products?action=new"
          className="bg-gradient-to-r from-[#0084FF] to-[#006CE6] text-white rounded-[26px] p-5 shadow-lg shadow-[#0084FF]/25 hover:shadow-xl hover:shadow-[#0084FF]/35 hover:-translate-y-0.5 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform backdrop-blur-xs">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white truncate">
                  Add New Product
                </span>
                <span className="bg-white text-[#0084FF] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shrink-0">
                  + CREATE
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5 truncate">
                Add catalog items with photos & stock specs
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 transition-all ml-2">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 🍱 BENTO GRID MAIN CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        {/* Bento Tile 1: Unified Operations Control Room (Hero Bento Module - 8 Cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#0C2556] via-[#10316B] to-[#153D85] text-white rounded-[28px] p-6 sm:p-7 shadow-[0_12px_35px_rgba(12,37,86,0.18)] border border-[#1E488F] relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle Bento ambient glow effects */}
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-24 -bottom-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  All In One Place
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-300 border border-white/10 backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Active
                </span>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
              Unified Operations Control Room
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-2xl">
              Access User Details CRM, Live Orders & Invoices, Add New Products, Edit Catalog & Stock, Categories, and Support Tickets in a single tabbed dashboard.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-blue-100/90 font-medium">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                🏢 Ranchi Central Hub
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                📍 4 Active Branches
              </span>
            </div>

            <Link
              href="/admin/hub"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-full shadow-md shadow-amber-400/25 transition-all cursor-pointer active:scale-95"
            >
              <span>Launch Control Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bento Tile 2: Total Inventory Value - Featured Bento Metric (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-100/90 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(15,35,80,0.04)] hover:shadow-[0_14px_35px_rgba(15,35,80,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Inventory Value
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {dashboardData.totalInventoryValueFormatted ||
                  (stats.totalProducts ? `₹ ${(stats.totalProducts * 1850).toLocaleString("en-IN")}` : "₹ 0")}
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#E6F9FC] text-[#00C2E0] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100/80">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 bg-[#E6F9FC] text-[#00C2E0] px-2.5 py-1 rounded-full font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> Live Sync Active
              </span>
              <span className="text-slate-400 text-[11px] font-medium">
                across all stores
              </span>
            </div>

            {/* Sparkline Visual */}
            <div className="mt-3">
              <svg
                className="w-full h-8 text-[#00C2E0]"
                viewBox="0 0 100 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M0 20 Q 25 22, 45 12 T 75 8 T 100 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bento Tile 3: Total Stock (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-100/90 rounded-[24px] p-5 shadow-[0_8px_30px_rgba(15,35,80,0.04)] hover:shadow-[0_14px_35px_rgba(15,35,80,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400">
              Total Stock
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAFBF3] text-[#10B981] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalProducts !== undefined
                ? stats.totalProducts.toLocaleString("en-IN")
                : "0"}{" "}
              <span className="text-xs font-bold text-slate-400">Products</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-[#10B981] font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />{" "}
                {stats.activeProducts !== undefined
                  ? `${stats.activeProducts} Active`
                  : "0 Active"}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">4 Stores</span>
            </div>
          </div>
        </div>

        {/* Bento Tile 4: Low Stock Alert (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-100/90 rounded-[24px] p-5 shadow-[0_8px_30px_rgba(15,35,80,0.04)] hover:shadow-[0_14px_35px_rgba(15,35,80,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400">
              Low Stock Items
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FEF6E9] text-[#F59E0B] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats.lowStockProducts ?? 0}{" "}
              <span className="text-xs font-bold text-slate-400">Items</span>
            </div>
            <div className="mt-2 text-[11px] text-[#F59E0B] font-bold flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Requires Reorder
            </div>
          </div>
        </div>

        {/* Bento Tile 5: Support Tickets (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-100/90 rounded-[24px] p-5 shadow-[0_8px_30px_rgba(15,35,80,0.04)] hover:shadow-[0_14px_35px_rgba(15,35,80,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400">
              Support Tickets
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#F5F0FF] text-[#8B5CF6] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats.openSupportTickets ?? 0}{" "}
              <span className="text-xs font-bold text-slate-400">Open</span>
            </div>
            <div className="mt-2 text-[11px] text-[#8B5CF6] font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Customer Tickets
            </div>
          </div>
        </div>

        {/* Bento Tile 6: Customer Orders (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-100/90 rounded-[24px] p-5 shadow-[0_8px_30px_rgba(15,35,80,0.04)] hover:shadow-[0_14px_35px_rgba(15,35,80,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400">
              Customer Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EBF5FF] text-[#0084FF] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalOrders ?? 0}{" "}
              <span className="text-xs font-bold text-slate-400">Total</span>
            </div>
            <div className="mt-2 text-[11px] text-[#0084FF] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />{" "}
              {stats.totalCustomers !== undefined
                ? `${stats.totalCustomers} Customers`
                : "Active Operations"}
            </div>
          </div>
        </div>

        {/* Bento Tile 7: Multi-Location Stock Distribution (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,35,80,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Multi-Location Stock Overview
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0084FF]" /> In Stock
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Low Stock
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Out of Stock
                  </span>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="appearance-none bg-[#F1F4F9] hover:bg-[#E9EEF6] rounded-full pl-3.5 pr-8 py-1.5 text-xs text-slate-700 font-bold cursor-pointer transition-colors outline-none border-none"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Ranchi">Ranchi Hub</option>
                  <option value="Patna">Patna Store</option>
                  <option value="Delhi">Delhi Store</option>
                  <option value="Mumbai">Mumbai Store</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Visual Bar Chart Graphic */}
            <div className="pt-6">
              <div className="h-48 flex items-end justify-between gap-4 px-2 border-b border-slate-100 pb-2">
                {/* Y Axis scale indicators on left */}
                <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 pr-2 font-mono">
                  <span>20K</span>
                  <span>15K</span>
                  <span>10K</span>
                  <span>5K</span>
                  <span>0</span>
                </div>

                {(dashboardData.multiLocationStock || [])
                  .filter((st) =>
                    selectedBranchFilter === "All Locations"
                      ? true
                      : st.name.toLowerCase().includes(selectedBranchFilter.toLowerCase()) ||
                        st.code.toLowerCase() === selectedBranchFilter.toLowerCase(),
                  )
                  .map((st) => (
                    <div
                      key={st.code}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                    >
                      <div className="w-full flex items-end justify-center gap-1.5 h-full">
                        <div
                          className="w-4 bg-[#0084FF] rounded-t-md group-hover:brightness-110 transition-all"
                          style={{ height: `${st.inStockHeightPct}%` }}
                          title={`In Stock: ${st.inStock.toLocaleString()}`}
                        />
                        <div
                          className="w-4 bg-[#F59E0B] rounded-t-md group-hover:brightness-110 transition-all"
                          style={{ height: `${st.lowStockHeightPct}%` }}
                          title={`Low Stock: ${st.lowStock.toLocaleString()}`}
                        />
                        <div
                          className="w-4 bg-[#EF4444] rounded-t-md group-hover:brightness-110 transition-all"
                          style={{ height: `${st.outOfStockHeightPct}%` }}
                          title={`Out of Stock: ${st.outOfStock.toLocaleString()}`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 truncate mt-1">
                        {st.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">
              💡 {dashboardData.highestCapacityStore?.name || "Ranchi Hub"} holds the highest active stock capacity ({(dashboardData.highestCapacityStore?.units || 15200).toLocaleString()} units)
            </span>
            <span className="font-bold text-[#0084FF]">
              Overall {dashboardData.overallInStockRate ?? 91.8}% In-Stock
            </span>
          </div>
        </div>

        {/* Bento Tile 8: Quick Actions Center (4 Cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-white to-[#F8FAFD] border border-slate-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,35,80,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Quick Actions
              </h3>
              <span className="bg-[#EBF5FF] text-[#0084FF] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Instant Tools
              </span>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/admin/inventory?tab=transfers"
                className="w-full bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-between transition-all shadow-md shadow-[#0084FF]/25 cursor-pointer active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Stock Transfer</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/bulk-edit"
                className="w-full bg-white hover:bg-slate-50 text-slate-800 hover:text-[#0084FF] border border-slate-200/80 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-between transition-all shadow-xs cursor-pointer active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#0084FF] stroke-[2.5]" />
                  <span>Adjust Stock</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/products?action=new"
                className="w-full bg-white hover:bg-slate-50 text-slate-800 hover:text-[#0084FF] border border-slate-200/80 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-between transition-all shadow-xs cursor-pointer active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-[#10B981] stroke-[2.5]" />
                  <span>Add New Product</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/audit"
                className="w-full bg-white hover:bg-slate-50 text-slate-800 hover:text-[#0084FF] border border-slate-200/80 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-between transition-all shadow-xs cursor-pointer active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-[#8B5CF6] stroke-[2.5]" />
                  <span>Stock Audit</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
            Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 shadow-2xs">⌘K</kbd> to access quick search
          </div>
        </div>

        {/* Bento Tile 9: Inventory Value by Location Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,35,80,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Value by Location
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Total {dashboardData.valueByLocation?.formattedTotal || "₹ 48.72L"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center py-5 gap-6">
              {/* Donut Chart SVG Graphic */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {(dashboardData.valueByLocation?.locations || []).map((loc) => (
                    <circle
                      key={loc.name}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={loc.color}
                      strokeWidth="18"
                      strokeDasharray={loc.dashArray}
                      strokeDashoffset={loc.dashOffset}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    {dashboardData.valueByLocation?.formattedTotal || "₹ 0"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Total Value
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-2.5 text-xs flex-1 w-full">
                {(dashboardData.valueByLocation?.locations || []).map((loc) => (
                  <div
                    key={loc.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: loc.color }}
                      />
                      {loc.name}
                    </span>
                    <span className="font-black text-slate-900 text-xs">
                      {loc.percentage}%{" "}
                      <span className="text-[10px] text-slate-400 font-normal font-mono">
                        ({loc.formattedValue})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bento Tile 10: Inter-Store Transfers Feed (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-100/90 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(15,35,80,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Live Store Transfers
              </h3>
              <Link
                href="/admin/inventory?tab=transfers"
                className="text-xs font-bold text-[#0084FF] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2.5 pt-3">
              {(dashboardData.recentTransfers && dashboardData.recentTransfers.length > 0) ? (
                dashboardData.recentTransfers.map((t) => (
                  <div
                    key={t.code}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFD] border border-slate-100 text-xs hover:border-slate-200 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {t.route}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t.code}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.color === "emerald"
                            ? "bg-[#EAFBF3] text-[#059669] border border-[#A7F3D0]/70"
                            : t.color === "blue"
                              ? "bg-[#EBF5FF] text-[#0084FF] border border-[#BFDBFE]/70"
                              : "bg-[#FEF6E9] text-[#D97706] border border-[#FDE68A]/70"
                        }`}
                      >
                        {t.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No active store transfers
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Tile 11: Low Stock Alert Watchlist (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-100/90 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(15,35,80,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Low Stock Alert
              </h3>
              <Link
                href="/admin/inventory"
                className="text-xs font-bold text-[#0084FF] hover:underline"
              >
                View
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {(dashboardData.lowStockAlerts && dashboardData.lowStockAlerts.length > 0) ? (
                dashboardData.lowStockAlerts.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 pr-1">
                      <div className="font-bold text-slate-800 text-xs truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.loc}</div>
                    </div>
                    <span className="bg-[#FEE2E2]/60 text-[#EF4444] border border-[#FECACA]/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                      {item.units}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  All inventory healthy
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Tile 12: Top Selling Products Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,35,80,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Selling Products
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Highest turnover items across all regional stores
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#0084FF] hover:underline"
            >
              View All Products →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5">Rank & Product</th>
                  <th className="py-2.5">Total Sold</th>
                  <th className="py-2.5">Total Revenue</th>
                  <th className="py-2.5 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(dashboardData.topSellingProducts || []).map((p) => (
                  <tr key={p.sku} className="hover:bg-[#F8FAFD] transition-colors">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {p.rank}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {p.sold}
                    </td>
                    <td className="py-3 font-black text-slate-900 text-[11px] whitespace-nowrap">
                      {p.revenue}
                    </td>
                    <td className="py-3 text-right">
                      <svg
                        className="w-12 h-4 text-[#10B981] inline-block"
                        viewBox="0 0 48 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M0 14 Q 16 12, 24 6 T 48 2" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bento Tile 13: Recent Operational Activity Stream (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-100/90 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(15,35,80,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Activity
              </h3>
              <Link
                href="/admin/audit"
                className="text-xs font-bold text-[#0084FF] hover:underline"
              >
                Audit Log
              </Link>
            </div>

            <div className="space-y-3.5 pt-3 text-[11px]">
              {(dashboardData.recentActivity || []).map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${act.dot} mt-1 shrink-0 ring-4 ring-slate-50`}
                  />
                  <div>
                    <div className="font-semibold text-slate-800 leading-tight">
                      {act.action}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Real-time audit log active across all branches.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
