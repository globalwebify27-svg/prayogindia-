'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Building2, 
  Boxes, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award,
  Layers,
  ChevronDown,
  CheckCircle2,
  FileText
} from 'lucide-react';

export type ReportType = 'SALES' | 'INVENTORY' | 'CATEGORY' | 'STORE' | 'FINANCIAL';

export default function AdminReportsPage() {
  const [activeReportType, setActiveReportType] = useState<ReportType>('SALES');
  const [dateRange, setDateRange] = useState('THIS_MONTH');
  const [selectedStore, setSelectedStore] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Category Sales Dataset (Section 55)
  const categoryReports = [
    { category: 'Drone Technology & UAV Kits', revenue: 280000, qtySold: 42, orders: 38, aov: 7368, profit: 84000, margin: '30.0%' },
    { category: 'Robotics Kits & STEM Lab Sets', revenue: 125000, qtySold: 65, orders: 45, aov: 2777, profit: 41250, margin: '33.0%' },
    { category: 'Arduino, ESP32 & IoT Microcontrollers', revenue: 95000, qtySold: 140, orders: 82, aov: 1158, profit: 27550, margin: '29.0%' },
    { category: 'STEM Educational Kits', revenue: 60000, qtySold: 35, orders: 28, aov: 2142, profit: 21000, margin: '35.0%' },
    { category: 'Sensors, Modules & LiDAR', revenue: 48000, qtySold: 88, orders: 56, aov: 857, profit: 13920, margin: '29.0%' },
  ];

  // Store-Wise Sales Dataset (Section 85)
  const storeReports = [
    { store: 'Ranchi Main Branch (Central Hub)', onlineSales: 412000, posSales: 215000, totalRev: 627000, orders: 198, profit: 188100 },
    { store: 'Patna Robotics & STEM Branch', onlineSales: 0, posSales: 165000, totalRev: 165000, orders: 58, profit: 51150 },
    { store: 'Delhi NCR Innovation Center', onlineSales: 0, posSales: 248000, totalRev: 248000, orders: 74, profit: 74400 },
  ];

  // Inventory & Stock Valuation Dataset (Section 86)
  const inventoryReports = [
    { sku: 'PRG-ARD-001', name: 'Arduino UNO R3 Official Board', totalStock: 125, ranchiStock: 90, patnaStock: 20, delhiStock: 15, unitCost: 320, valuation: 40000, status: 'Healthy' },
    { sku: 'PRG-UAV-601', name: 'Pixhawk 6C Autopilot Flight Controller Unit', totalStock: 34, ranchiStock: 22, patnaStock: 7, delhiStock: 5, unitCost: 10200, valuation: 346800, status: 'Healthy' },
    { sku: 'PRG-BAT-4S52', name: '4S 14.8V 5200mAh LiPo Battery Pack', totalStock: 12, ranchiStock: 8, patnaStock: 2, delhiStock: 2, unitCost: 3100, valuation: 37200, status: 'Low Stock' },
    { sku: 'PRG-RPI-508', name: 'Raspberry Pi 5 Model B (8GB RAM)', totalStock: 24, ranchiStock: 15, patnaStock: 5, delhiStock: 4, unitCost: 6800, valuation: 163200, status: 'Healthy' },
  ];

  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    alert(`Generating & exporting ${activeReportType} Report in ${format} format...`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 53–58, 85, 86 &amp; 105 · Comprehensive Business Reports
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Business Intelligence &amp; Export Center
          </h1>
          <p className="text-xs text-slate-500">
            Generate and export granular sales, category performance, store-wise breakdown, inventory valuation, and financial reports in PDF, CSV, and Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={() => handleExport('EXCEL')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={() => handleExport('CSV')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#FFC20E]" /> Print
          </button>
        </div>
      </div>

      {/* 2. Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveReportType('SALES')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === 'SALES' ? 'bg-[#00AEEF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />
          Overall Sales Report
        </button>

        <button
          onClick={() => setActiveReportType('CATEGORY')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === 'CATEGORY' ? 'bg-[#00AEEF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1.5" />
          Category-Wise Sales (§55)
        </button>

        <button
          onClick={() => setActiveReportType('STORE')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === 'STORE' ? 'bg-[#00AEEF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
          Store-Wise Performance (§85)
        </button>

        <button
          onClick={() => setActiveReportType('INVENTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeReportType === 'INVENTORY' ? 'bg-[#00AEEF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 inline mr-1.5" />
          Inventory &amp; Valuation (§86)
        </button>
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
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
              <option value="THIS_MONTH">This Month (August 2026)</option>
              <option value="THIS_YEAR">This Fiscal Year</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Store Filter:</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Stores &amp; Channels</option>
              <option value="RANCHI">Ranchi Central Hub</option>
              <option value="PATNA">Patna Branch</option>
              <option value="DELHI">Delhi NCR Hub</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-bold">
          Filters Active · Live Data Sync
        </span>
      </div>

      {/* 4. Report Views */}
      
      {/* Category Sales View */}
      {activeReportType === 'CATEGORY' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Section 55 Category-Wise Sales &amp; Margin Report
              </h3>
              <p className="text-xs text-slate-500">Analyze strongest business segments, unit sales, average order value, and profit margins.</p>
            </div>
            <span className="text-sm font-black text-emerald-600">Total: ₹6,08,000</span>
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
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-extrabold text-slate-900">{cat.category}</td>
                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">₹{cat.revenue.toLocaleString()}</td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{cat.qtySold}</td>
                    <td className="py-3.5 text-center font-mono text-slate-500">{cat.orders}</td>
                    <td className="py-3.5 text-right font-mono text-slate-700">₹{cat.aov.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-mono font-black text-emerald-600">+₹{cat.profit.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-black text-emerald-700">{cat.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Store Performance View */}
      {activeReportType === 'STORE' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Section 85 Store-Wise Revenue &amp; Channel Breakdown
              </h3>
              <p className="text-xs text-slate-500">Compare online orders vs physical store walk-in sales across branches.</p>
            </div>
            <span className="text-sm font-black text-emerald-600">Total Billed: ₹10,40,000</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Store Location</th>
                  <th className="pb-3 text-right">Online Sales</th>
                  <th className="pb-3 text-right">Walk-in POS</th>
                  <th className="pb-3 text-right">Total Revenue</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {storeReports.map((st, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-extrabold text-slate-900">{st.store}</td>
                    <td className="py-3.5 text-right font-mono text-slate-700">₹{st.onlineSales.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-mono text-slate-700">₹{st.posSales.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">₹{st.totalRev.toLocaleString()}</td>
                    <td className="py-3.5 text-center font-bold text-slate-800">{st.orders}</td>
                    <td className="py-3.5 text-right font-mono font-black text-emerald-600">+₹{st.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory & Valuation View */}
      {activeReportType === 'INVENTORY' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Section 86 Stock Valuation &amp; Location Stock Breakdown
              </h3>
              <p className="text-xs text-slate-500">Real-time inventory levels across Ranchi Hub, Patna, and Delhi stores with asset valuation.</p>
            </div>
            <span className="text-sm font-black text-[#00AEEF]">Stock Value: ₹5,87,200</span>
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
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900">{inv.name}</div>
                      <span className="font-mono text-[10px] text-slate-400">{inv.sku}</span>
                    </td>
                    <td className="py-3.5 text-center font-black text-slate-900">{inv.totalStock}</td>
                    <td className="py-3.5 text-center font-bold text-blue-800">{inv.ranchiStock}</td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{inv.patnaStock}</td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{inv.delhiStock}</td>
                    <td className="py-3.5 text-right font-mono text-slate-600">₹{inv.unitCost}</td>
                    <td className="py-3.5 text-right font-mono font-black text-slate-900">₹{inv.valuation.toLocaleString()}</td>
                    <td className="py-3.5 text-center">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        inv.status === 'Healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
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

      {/* Overall Sales Summary View */}
      {activeReportType === 'SALES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Sales Channel Distribution
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">Online Website &amp; Mobile App</span>
                <span className="font-black text-slate-900">₹4,12,000 (39.6%)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">Physical Store Walk-in POS</span>
                <span className="font-black text-slate-900">₹6,28,000 (60.4%)</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                <span className="font-bold text-emerald-900">Total Billed Gross Revenue</span>
                <span className="font-black text-emerald-700 text-sm">₹10,40,000</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Customer Segment Revenue
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">B2B Institutional &amp; STEM Labs</span>
                <span className="font-black text-purple-900">₹5,20,000 (50.0%)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">B2C Retail &amp; Hobbyist Buyers</span>
                <span className="font-black text-slate-900">₹3,45,000 (33.2%)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="font-bold text-slate-700">Registered Loyalty Members</span>
                <span className="font-black text-slate-900">₹1,75,000 (16.8%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
