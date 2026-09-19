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

  useEffect(() => {
    fetch("/api/admin/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.metrics) {
          setStats(data.data.metrics);
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
          {/* Date Picker Button */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs">
            <span>May 28 – Jun 3, 2025</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Customise Button */}
          <button className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer">
            <Sliders className="w-3.5 h-3.5" />
            <span>Customise</span>
          </button>
        </div>
      </div>

      {/* Row 1: 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Inventory Value */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-600">
              Total Inventory Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#00AEEF] flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">₹ 48,72,450</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-cyan-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 12.5%{" "}
                <span className="text-slate-400 font-normal">vs last week</span>
              </span>
              <svg
                className="w-16 h-5 text-[#00AEEF]"
                viewBox="0 0 64 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M0 16 Q 16 18, 28 10 T 48 6 T 64 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Total Stock */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-600">
              Total Stock (All Locations)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">
              {stats.totalProducts !== undefined ? stats.totalProducts.toLocaleString("en-IN") : "24,832"}{" "}
              <span className="text-xs font-semibold text-slate-500">
                Products
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {stats.activeProducts !== undefined ? `${stats.activeProducts} Active` : "8.4% vs last week"}
              </span>
              <svg
                className="w-16 h-5 text-emerald-500"
                viewBox="0 0 64 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M0 18 Q 20 16, 32 12 T 48 8 T 64 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-600">
              Low Stock Items
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">
              {stats.lowStockProducts !== undefined ? stats.lowStockProducts : 128}{" "}
              <span className="text-xs font-semibold text-slate-500">
                Items
              </span>
            </div>
            <div className="mt-1 text-[11px] text-rose-500 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> Requires Reorder
            </div>
          </div>
        </div>

        {/* Card 4: Inter-Store Transfers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-600">
              Open Support Tickets
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">
              {stats.openSupportTickets !== undefined ? stats.openSupportTickets : 24}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live Customer Tickets
            </div>
          </div>
        </div>

        {/* Card 5: Pending Orders */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-600">
              Total Customer Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">
              {stats.totalOrders !== undefined ? stats.totalOrders : 56}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> {stats.totalCustomers !== undefined ? `${stats.totalCustomers} Customers` : "Active Operations"}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts & Quick Actions (Grid 12 cols: 5 cols Bar Chart + 4 cols Donut + 3 cols Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Stock Overview Bar Chart (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stock Overview
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-[#2563EB]" /> In
                    Stock
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-amber-400" /> Low
                    Stock
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-rose-500" /> Out of
                    Stock
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold cursor-pointer">
                <span>All Locations</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Visual Bar Chart Graphic */}
            <div className="pt-4 space-y-3">
              <div className="h-44 flex items-end justify-between gap-4 px-2 border-b border-slate-100 pb-2">
                {/* Y Axis scale indicators on left */}
                <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 pr-2">
                  <span>20K</span>
                  <span>15K</span>
                  <span>10K</span>
                  <span>5K</span>
                  <span>0</span>
                </div>

                {/* Ranchi Hub Bars */}
                <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      className="w-3.5 bg-[#2563EB] rounded-t-sm"
                      style={{ height: "75%" }}
                      title="In Stock: 15,200"
                    />
                    <div
                      className="w-3.5 bg-amber-400 rounded-t-sm"
                      style={{ height: "35%" }}
                      title="Low Stock: 4,500"
                    />
                    <div
                      className="w-3.5 bg-rose-500 rounded-t-sm"
                      style={{ height: "8%" }}
                      title="Out of Stock: 800"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate mt-1">
                    Ranchi Hub
                  </span>
                </div>

                {/* Patna Store Bars */}
                <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      className="w-3.5 bg-[#2563EB] rounded-t-sm"
                      style={{ height: "65%" }}
                      title="In Stock: 13,000"
                    />
                    <div
                      className="w-3.5 bg-amber-400 rounded-t-sm"
                      style={{ height: "28%" }}
                      title="Low Stock: 3,800"
                    />
                    <div
                      className="w-3.5 bg-rose-500 rounded-t-sm"
                      style={{ height: "10%" }}
                      title="Out of Stock: 1,100"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate mt-1">
                    Patna Store
                  </span>
                </div>

                {/* Delhi Store Bars */}
                <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      className="w-3.5 bg-[#2563EB] rounded-t-sm"
                      style={{ height: "55%" }}
                      title="In Stock: 11,200"
                    />
                    <div
                      className="w-3.5 bg-amber-400 rounded-t-sm"
                      style={{ height: "22%" }}
                      title="Low Stock: 2,900"
                    />
                    <div
                      className="w-3.5 bg-rose-500 rounded-t-sm"
                      style={{ height: "6%" }}
                      title="Out of Stock: 600"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate mt-1">
                    Delhi Store
                  </span>
                </div>

                {/* Mumbai Store Bars */}
                <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      className="w-3.5 bg-[#2563EB] rounded-t-sm"
                      style={{ height: "78%" }}
                      title="In Stock: 16,100"
                    />
                    <div
                      className="w-3.5 bg-amber-400 rounded-t-sm"
                      style={{ height: "30%" }}
                      title="Low Stock: 4,100"
                    />
                    <div
                      className="w-3.5 bg-rose-500 rounded-t-sm"
                      style={{ height: "12%" }}
                      title="Out of Stock: 1,300"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate mt-1">
                    Mumbai Store
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Inventory Value by Location Donut Chart (Col 4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-2">
              Inventory Value by Location
            </h3>

            <div className="flex items-center justify-center py-4 gap-5">
              {/* Donut Chart SVG Graphic */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Ranchi Hub 46% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#2563EB"
                    strokeWidth="18"
                    strokeDasharray="109.8 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Patna Store 22% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="18"
                    strokeDasharray="52.5 238.7"
                    strokeDashoffset="-109.8"
                  />
                  {/* Delhi Store 18% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="18"
                    strokeDasharray="43 238.7"
                    strokeDashoffset="-162.3"
                  />
                  {/* Mumbai Store 14% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="18"
                    strokeDasharray="33.4 238.7"
                    strokeDashoffset="-205.3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-900">
                    ₹ 48.72L
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    Total Value
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />{" "}
                    Ranchi Hub
                  </span>
                  <span className="font-bold text-slate-900 text-[11px]">
                    46%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pl-4 font-mono">
                  ₹ 22.42L
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />{" "}
                    Patna Store
                  </span>
                  <span className="font-bold text-slate-900 text-[11px]">
                    22%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pl-4 font-mono">
                  ₹ 10.73L
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#8B5CF6]" />{" "}
                    Delhi Store
                  </span>
                  <span className="font-bold text-slate-900 text-[11px]">
                    18%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pl-4 font-mono">
                  ₹ 8.76L
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" />{" "}
                    Mumbai Store
                  </span>
                  <span className="font-bold text-slate-900 text-[11px]">
                    14%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pl-4 font-mono">
                  ₹ 6.81L
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quick Actions Panel (Col 3) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Quick Actions
          </h3>

          <div className="space-y-2.5">
            <Link
              href="/admin/inventory?tab=transfers"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Stock Transfer</span>
            </Link>

            <Link
              href="/admin/bulk-edit"
              className="w-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-400 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adjust Stock</span>
            </Link>

            <Link
              href="/admin/products?action=new"
              className="w-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-400 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </Link>

            <Link
              href="/admin/audit"
              className="w-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-400 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Stock Audit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products, Inter-Store Transfers, Low Stock & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Top Selling Products (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Top Selling Products
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2">Product</th>
                  <th className="py-2">Total Sold</th>
                  <th className="py-2">Total Revenue</th>
                  <th className="py-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  {
                    name: "Arduino UNO R3 Board",
                    sku: "PRG-ARD-001",
                    sold: "1,254 Units",
                    revenue: "₹ 12,54,000",
                  },
                  {
                    name: "ESP32 Dev Module",
                    sku: "PRG-ESP-002",
                    sold: "987 Units",
                    revenue: "₹ 9,87,000",
                  },
                  {
                    name: "Lithium Battery 18650",
                    sku: "PRG-BAT-003",
                    sold: "865 Units",
                    revenue: "₹ 4,32,500",
                  },
                  {
                    name: "Jumper Wires Pack (40pcs)",
                    sku: "PRG-JPR-004",
                    sold: "742 Units",
                    revenue: "₹ 2,22,600",
                  },
                  {
                    name: "5V Relay Module",
                    sku: "PRG-REL-005",
                    sold: "612 Units",
                    revenue: "₹ 1,83,600",
                  },
                ].map((p) => (
                  <tr key={p.sku} className="hover:bg-slate-50/70">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.sku}
                      </div>
                    </td>
                    <td className="py-2.5 font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {p.sold}
                    </td>
                    <td className="py-2.5 font-black text-slate-900 text-[11px] whitespace-nowrap">
                      {p.revenue}
                    </td>
                    <td className="py-2.5 text-right">
                      <svg
                        className="w-12 h-4 text-emerald-500 inline-block"
                        viewBox="0 0 48 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
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

        {/* 2. Inter-Store Transfers (Col 4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Inter-Store Transfers
            </h3>
            <Link
              href="/admin/inventory?tab=transfers"
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                route: "Ranchi Hub → Patna Store",
                code: "INV-TRF-2025-001",
                status: "Completed",
                color: "emerald",
                time: "2 mins ago",
              },
              {
                route: "Delhi Store → Mumbai Store",
                code: "INV-TRF-2025-002",
                status: "In Transit",
                color: "blue",
                time: "45 mins ago",
              },
              {
                route: "Patna Store → Delhi Store",
                code: "INV-TRF-2025-003",
                status: "Completed",
                color: "emerald",
                time: "2 hours ago",
              },
              {
                route: "Mumbai Store → Ranchi Hub",
                code: "INV-TRF-2025-004",
                status: "Pending",
                color: "amber",
                time: "5 hours ago",
              },
            ].map((t) => (
              <div
                key={t.code}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {t.route}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {t.code}
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      t.color === "emerald"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : t.color === "blue"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {t.status}
                  </span>
                  <div className="text-[10px] text-slate-400">{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Low Stock Alerts & Recent Activity (Col 3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Low Stock Alerts */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">
                Low Stock Alerts
              </h3>
              <Link
                href="/admin/inventory"
                className="text-[11px] font-bold text-[#2563EB] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  name: "Arduino Uno R3 Board",
                  loc: "Ranchi Hub",
                  units: "5 Units",
                },
                {
                  name: "ESP32 Dev Module",
                  loc: "Patna Store",
                  units: "4 Units",
                },
                { name: "18650 Battery", loc: "Delhi Store", units: "3 Units" },
                {
                  name: "Jumper Wires Pack",
                  loc: "Mumbai Store",
                  units: "6 Units",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.loc}</div>
                  </div>
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                    {item.units}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">
                Recent Activity
              </h3>
              <Link
                href="/admin/audit"
                className="text-[11px] font-bold text-[#2563EB] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2.5 text-[11px]">
              {[
                {
                  action: "Stock transfer from Ranchi to Patna",
                  time: "2 mins ago",
                  dot: "bg-blue-500",
                },
                {
                  action: "Stock adjusted for Arduino Uno R3",
                  time: "15 mins ago",
                  dot: "bg-emerald-500",
                },
                {
                  action: "New purchase order created",
                  time: "1 hour ago",
                  dot: "bg-amber-500",
                },
                {
                  action: "Stock audit completed – Delhi Store",
                  time: "2 hours ago",
                  dot: "bg-teal-500",
                },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${act.dot} mt-1.5 shrink-0`}
                  />
                  <div>
                    <div className="font-medium text-slate-800 leading-tight">
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
        </div>
      </div>
    </div>
  );
}
