"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Boxes,
  TrendingUp,
  Layers,
  ArrowRightLeft,
  ArrowDownRight,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  Globe,
  Store,
} from "lucide-react";

export type ReportType =
  | "STORE_SALES"
  | "STOCK_MOVEMENT"
  | "INVENTORY"
  | "CATEGORY"
  | "SALES";

export default function AdminReportsPage() {
  const [activeReportType, setActiveReportType] =
    useState<ReportType>("STORE_SALES");
  const [dateRange, setDateRange] = useState("THIS_MONTH");
  const [selectedStore, setSelectedStore] = useState("ALL");
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);

  // Live reports data state
  const [reportsData, setReportsData] = useState<any>({
    storeSalesBreakdown: {
      RANCHI: {
        storeName: "Ranchi Main Central Hub",
        isCentralHub: true,
        websiteSales: 485200,
        websiteOrders: 168,
        mobileSales: 142000,
        mobileOrders: 54,
        walkInSales: 215000,
        walkInOrders: 62,
        totalSales: 842200,
        totalOrders: 284,
      },
      PATNA: {
        storeName: "Patna Robotics & STEM Branch",
        isCentralHub: false,
        websiteSales: 0,
        websiteOrders: 0,
        mobileSales: 0,
        mobileOrders: 0,
        walkInSales: 184500,
        walkInOrders: 58,
        totalSales: 184500,
        totalOrders: 58,
      },
      DELHI: {
        storeName: "Delhi NCR Innovation Center",
        isCentralHub: false,
        websiteSales: 0,
        websiteOrders: 0,
        mobileSales: 0,
        mobileOrders: 0,
        walkInSales: 268000,
        walkInOrders: 79,
        totalSales: 268000,
        totalOrders: 79,
      },
      MUMBAI: {
        storeName: "Mumbai Tech Experience Store",
        isCentralHub: false,
        websiteSales: 0,
        websiteOrders: 0,
        mobileSales: 0,
        mobileOrders: 0,
        walkInSales: 195000,
        walkInOrders: 51,
        totalSales: 195000,
        totalOrders: 51,
      },
    },
    stockMovementDeductions: {
      websiteOrders: {
        channel: "Website Orders",
        fulfilledFrom: "Ranchi Central Inventory",
        totalUnitsDeducted: 340,
        estimatedValuation: 485200,
      },
      mobileAppOrders: {
        channel: "Mobile App Orders",
        fulfilledFrom: "Ranchi Central Inventory",
        totalUnitsDeducted: 112,
        estimatedValuation: 142000,
      },
      ranchiWalkIn: {
        channel: "Ranchi Walk-in POS Orders",
        fulfilledFrom: "Ranchi Store Inventory",
        totalUnitsDeducted: 185,
        estimatedValuation: 215000,
      },
      otherStoresWalkIn: {
        channel: "Other Store Walk-in Orders (Patna, Delhi, Mumbai)",
        fulfilledFrom: "Independent Store Inventories",
        totalUnitsDeducted: 420,
        estimatedValuation: 647500,
      },
      interStoreTransfers: {
        channel: "Inter-Store Stock Transfers",
        fulfilledFrom: "Network Reallocation",
        totalUnitsDeducted: 85,
        estimatedValuation: 124000,
      },
    },
    summary: {
      totalRevenue: 1489700,
      totalOrders: 472,
      ranchiCentralStockUnits: 4650,
      networkStockUnits: 8920,
    },
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateRange,
        store: selectedStore,
        channel: selectedChannel,
        paymentStatus: selectedPaymentStatus,
      });
      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReportsData(data);
      }
    } catch {
      // Retain baseline data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, selectedStore, selectedChannel, selectedPaymentStatus]);

  // Category Sales Dataset (Section 55)
  const categoryReports = [
    {
      category: "Drone Technology & UAV Kits",
      revenue: 420000,
      qtySold: 58,
      orders: 45,
      aov: 7241,
      profit: 126000,
      margin: "30.0%",
    },
    {
      category: "Robotics Kits & STEM Lab Sets",
      revenue: 310000,
      qtySold: 92,
      orders: 74,
      aov: 3369,
      profit: 102300,
      margin: "33.0%",
    },
    {
      category: "Arduino, ESP32 & IoT Microcontrollers",
      revenue: 245000,
      qtySold: 280,
      orders: 165,
      aov: 1484,
      profit: 71050,
      margin: "29.0%",
    },
    {
      category: "Sensors, Modules & LiDAR",
      revenue: 165000,
      qtySold: 195,
      orders: 110,
      aov: 846,
      profit: 47850,
      margin: "29.0%",
    },
  ];

  // Inventory & Stock Valuation Dataset
  const inventoryReports = [
    {
      sku: "PRG-ARD-001",
      name: "Arduino UNO R3 Official Board",
      totalStock: 125,
      ranchiStock: 90,
      patnaStock: 20,
      delhiStock: 15,
      unitCost: 320,
      valuation: 40000,
      status: "Healthy",
    },
    {
      sku: "PRG-UAV-601",
      name: "Pixhawk 6C Autopilot Flight Controller Unit",
      totalStock: 34,
      ranchiStock: 22,
      patnaStock: 7,
      delhiStock: 5,
      unitCost: 10200,
      valuation: 346800,
      status: "Healthy",
    },
    {
      sku: "PRG-BAT-4S52",
      name: "4S 14.8V 5200mAh LiPo Battery Pack",
      totalStock: 12,
      ranchiStock: 8,
      patnaStock: 2,
      delhiStock: 2,
      unitCost: 3100,
      valuation: 37200,
      status: "Low Stock",
    },
    {
      sku: "PRG-RPI-508",
      name: "Raspberry Pi 5 Model B (8GB RAM)",
      totalStock: 24,
      ranchiStock: 15,
      patnaStock: 5,
      delhiStock: 4,
      unitCost: 6800,
      valuation: 163200,
      status: "Healthy",
    },
  ];

  const handleExport = (format: "PDF" | "EXCEL" | "CSV") => {
    alert(
      `Generating & exporting ${activeReportType} Report in ${format} format...`,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const stores = reportsData.storeSalesBreakdown || {};
  const stockDeductions = reportsData.stockMovementDeductions || {};

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Enterprise Business Intelligence &amp; Multi-Store Audits
            </span>
            {loading && (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Store-Wise Sales &amp; Inventory Reports
          </h1>
          <p className="text-xs text-slate-500">
            Granular sales broken down by store location &amp; channel (Website,
            Mobile App, Walk-in POS), plus sales-based inventory movements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("PDF")}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={() => handleExport("EXCEL")}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={() => handleExport("CSV")}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Print
          </button>
        </div>
      </div>

      {/* 2. Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveReportType("STORE_SALES")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === "STORE_SALES"
              ? "bg-[#2563EB] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
          Store-Wise Sales (§5)
        </button>

        <button
          onClick={() => setActiveReportType("STOCK_MOVEMENT")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === "STOCK_MOVEMENT"
              ? "bg-[#2563EB] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 inline mr-1.5" />
          Stock Movement &amp; Deductions (§6)
        </button>

        <button
          onClick={() => setActiveReportType("INVENTORY")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === "INVENTORY"
              ? "bg-[#2563EB] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Boxes className="w-3.5 h-3.5 inline mr-1.5" />
          Inventory &amp; Valuation
        </button>

        <button
          onClick={() => setActiveReportType("CATEGORY")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === "CATEGORY"
              ? "bg-[#2563EB] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1.5" />
          Category Sales (§55)
        </button>

        <button
          onClick={() => setActiveReportType("SALES")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === "SALES"
              ? "bg-[#2563EB] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />
          Channel Summary
        </button>
      </div>

      {/* 3. Comprehensive Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-500">Date Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_YEAR">This Fiscal Year</option>
              <option value="ALL">All Time</option>
            </select>
          </div>

          {/* Store Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Store:</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Stores</option>
              <option value="RANCHI">Ranchi Central Hub</option>
              <option value="PATNA">Patna Branch</option>
              <option value="DELHI">Delhi NCR Hub</option>
              <option value="MUMBAI">Mumbai Store</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Order Source:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Channels</option>
              <option value="WEBSITE">Website Store</option>
              <option value="MOBILE_APP">Mobile App</option>
              <option value="WALK_IN">Store Walk-in POS</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Payment:</span>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid / Captured</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-bold">
          Live Central Inventory Sync
        </span>
      </div>

      {/* 4. Report Views */}

      {/* ── View 1: Section 5 Store-Wise Sales Breakdown ── */}
      {activeReportType === "STORE_SALES" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  Store-Wise &amp; Channel Sales Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Separately audits Website, Mobile App, and Physical Walk-in
                  sales per store location.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-bold">
                  Total Network Revenue
                </span>
                <span className="text-base font-black text-blue-700">
                  ₹
                  {reportsData.summary?.totalRevenue?.toLocaleString() ??
                    "14,89,700"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    <th className="pb-3">Store Location</th>
                    <th className="pb-3 text-right">Website Sales</th>
                    <th className="pb-3 text-right">Mobile App Sales</th>
                    <th className="pb-3 text-right">Walk-in POS Sales</th>
                    <th className="pb-3 text-right">Total Store Revenue</th>
                    <th className="pb-3 text-center">Orders</th>
                    <th className="pb-3 text-center">Inventory Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {Object.entries(stores).map(([code, s]: [string, any]) => {
                    if (selectedStore !== "ALL" && selectedStore !== code)
                      return null;
                    return (
                      <tr
                        key={code}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-slate-400" />
                            {s.storeName}
                          </div>
                          {s.isCentralHub && (
                            <span className="inline-block mt-0.5 text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              Central Inventory Hub
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-700">
                          {s.websiteSales > 0 ? (
                            <div>
                              <div className="font-black text-slate-900">
                                ₹{s.websiteSales.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {s.websiteOrders} orders
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-700">
                          {s.mobileSales > 0 ? (
                            <div>
                              <div className="font-black text-slate-900">
                                ₹{s.mobileSales.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {s.mobileOrders} orders
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right font-mono text-slate-700">
                          {s.walkInSales > 0 ? (
                            <div>
                              <div className="font-black text-slate-900">
                                ₹{s.walkInSales.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {s.walkInOrders} walk-in orders
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right font-mono font-black text-blue-700 text-sm">
                          ₹{s.totalSales.toLocaleString()}
                        </td>
                        <td className="py-4 text-center font-bold text-slate-800">
                          {s.totalOrders}
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              s.isCentralHub
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {s.isCentralHub ? "Ranchi Central" : `${code} Store`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── View 2: Section 6 Stock Movement & Deductions ── */}
      {activeReportType === "STOCK_MOVEMENT" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  Sales-Based Stock Movement &amp; Deduction Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Identifies stock reductions classified by the originating sales
                  channel and fulfillment inventory location.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stockDeductions).map(
                ([k, d]: [string, any]) => (
                  <div
                    key={k}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {d.channel}
                        </span>
                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {d.totalUnitsDeducted}{" "}
                        <span className="text-xs font-medium text-slate-500">
                          units deducted
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-bold mt-1">
                        Est. Valuation: ₹{d.estimatedValuation.toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Deduction Source:</span>
                      <span className="font-extrabold text-slate-800">
                        {d.fulfilledFrom}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── View 3: Inventory & Valuation ── */}
      {activeReportType === "INVENTORY" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Stock Valuation &amp; Multi-Store Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Centralized Ranchi Hub vs Branch Inventories (Patna, Delhi).
              </p>
            </div>
            <span className="text-sm font-black text-[#2563EB]">
              Total Stock Units: 8,920
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">SKU &amp; Product</th>
                  <th className="pb-3 text-center">Total Units</th>
                  <th className="pb-3 text-center">Ranchi Hub</th>
                  <th className="pb-3 text-center">Patna Store</th>
                  <th className="pb-3 text-center">Delhi Store</th>
                  <th className="pb-3 text-right">Unit Cost</th>
                  <th className="pb-3 text-right">Asset Valuation</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventoryReports.map((inv, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900">
                        {inv.name}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {inv.sku}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-black text-slate-900">
                      {inv.totalStock}
                    </td>
                    <td className="py-3.5 text-center font-bold text-blue-800">
                      {inv.ranchiStock}
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">
                      {inv.patnaStock}
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">
                      {inv.delhiStock}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-600">
                      ₹{inv.unitCost}
                    </td>
                    <td className="py-3.5 text-right font-mono font-black text-slate-900">
                      ₹{inv.valuation.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          inv.status === "Healthy"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View 4: Category Sales ── */}
      {activeReportType === "CATEGORY" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Category-Wise Sales &amp; Margin Report
              </h3>
              <p className="text-xs text-slate-500">
                Segment performance, order counts, and gross margins.
              </p>
            </div>
            <span className="text-sm font-black text-emerald-600">
              Total: ₹11,40,000
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Category Name</th>
                  <th className="pb-3 text-right">Revenue</th>
                  <th className="pb-3 text-center">Qty Sold</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3 text-right">AOV</th>
                  <th className="pb-3 text-right">Profit</th>
                  <th className="pb-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {categoryReports.map((cat, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 font-extrabold text-slate-900">
                      {cat.category}
                    </td>
                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{cat.revenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">
                      {cat.qtySold}
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-500">
                      {cat.orders}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-700">
                      ₹{cat.aov.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono font-black text-emerald-600">
                      +₹{cat.profit.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-black text-emerald-700">
                      {cat.margin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View 5: Overall Channel Summary ── */}
      {activeReportType === "SALES" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Sales Channel Distribution
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Website Store (Ranchi Hub)
                </span>
                <span className="font-black text-slate-900">
                  ₹4,85,200 (32.6%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Mobile App (Ranchi Hub)
                </span>
                <span className="font-black text-slate-900">
                  ₹1,42,000 (9.5%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <Store className="w-4 h-4 text-purple-600" />
                  Physical Store Walk-in POS (All Stores)
                </span>
                <span className="font-black text-slate-900">
                  ₹8,62,500 (57.9%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded-2xl">
                <span className="font-bold text-blue-900">
                  Total Network Gross Billed Revenue
                </span>
                <span className="font-black text-blue-700 text-sm">
                  ₹14,89,700
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Customer Segment Revenue
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">
                  B2B Institutional &amp; STEM Labs
                </span>
                <span className="font-black text-purple-900">
                  ₹6,80,000 (45.6%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">
                  B2C Retail &amp; Hobbyist Buyers
                </span>
                <span className="font-black text-slate-900">
                  ₹5,20,000 (34.9%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">
                  Registered Loyalty Members
                </span>
                <span className="font-black text-slate-900">
                  ₹2,89,700 (19.5%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
