'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Users,
  Headset,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Landmark,
  PieChart,
  Tablet,
  Globe,
  Sparkles,
  Award,
  Boxes,
  Truck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Business Analytics Metric State (§8.1)
  const totalRevenue = 1842500;
  const walkInSales = 720000;
  const onlineSales = 1122500;
  const gstCollected = Math.round(totalRevenue * 0.18 / 1.18);
  const purchaseCostCOGS = 1216050;
  const grossProfit = totalRevenue - purchaseCostCOGS;
  const operationalCosts = 142000;
  const netProfit = grossProfit - operationalCosts;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              PRAYOG EXECUTIVE HQ
            </span>
            <span className="text-xs text-slate-400 font-bold">Consolidated FY 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Executive Business Analytics</h1>
          <p className="text-xs text-slate-400">Multi-channel revenue, store walk-ins vs online orders, GST liability, and profit margin analysis.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/pos"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Tablet className="w-4 h-4" /> Open Walk-in POS
          </Link>
          <Link
            href="/admin/quotations"
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" /> B2B Quotes
          </Link>
        </div>
      </div>

      {/* 8.1 Core Financial Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00AEEF] flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs last quarter
          </div>
        </div>

        {/* GST Collected */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">18% GST Output Liability</span>
            <Landmark className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">₹{gstCollected.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-semibold">Filed via GSTIN: 20AABCP1234F1Z9</div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Gross Profit (Margin: 34%)</span>
            <PieChart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">₹{grossProfit.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-semibold">COGS: ₹{purchaseCostCOGS.toLocaleString()}</div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Net Realized Profit</span>
            <Sparkles className="w-4 h-4 text-[#FFC20E]" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{netProfit.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-bold">26.3% Net Retained Margin</div>
        </div>

      </div>

      {/* 8.1 Channel Split: Walk-in Physical Stores vs Online E-Commerce */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Walk-in vs Online Split Comparison (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Sales Attribution by Channel</h3>
              <p className="text-xs text-slate-500">Walk-in Physical POS vs Online Web App Store</p>
            </div>
            <span className="text-xs font-mono font-extrabold text-[#00AEEF]">1,248 Orders</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Online Channel */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Globe className="w-4 h-4 text-[#00AEEF]" /> Online E-Commerce Orders (61%)
                </span>
                <span className="font-mono text-slate-900">₹{onlineSales.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-[#00AEEF] h-full rounded-full" style={{ width: '61%' }} />
              </div>
              <span className="text-[10px] text-slate-400">762 Web checkouts • Free Surface Courier over ₹2000</span>
            </div>

            {/* Walk-in Channel */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Tablet className="w-4 h-4 text-emerald-600" /> Walk-in Physical Store POS (39%)
                </span>
                <span className="font-mono text-slate-900">₹{walkInSales.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '39%' }} />
              </div>
              <div className="flex gap-4 text-[10px] text-slate-500 font-semibold pt-0.5">
                <span>• Ranchi Central Hub: ₹3,80,000</span>
                <span>• Patna Branch: ₹2,10,000</span>
                <span>• Delhi Store: ₹1,30,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Queues & Inventory Summary (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase">Operational Hub Status</h3>
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Synchronized
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 text-[#00AEEF]" />
                <span className="font-bold text-slate-800">Multi-Location Inventory</span>
              </div>
              <Link href="/admin/inventory" className="text-xs font-extrabold text-[#00AEEF] hover:underline">
                3 Branches →
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-800">Sales Executive Incentives</span>
              </div>
              <Link href="/admin/incentives" className="text-xs font-extrabold text-purple-600 hover:underline">
                Attribution Desk →
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">B2B Institutional Quotes</span>
              </div>
              <Link href="/admin/quotations" className="text-xs font-extrabold text-emerald-600 hover:underline">
                Pipeline →
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
