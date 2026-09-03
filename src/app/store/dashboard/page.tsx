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
} from "lucide-react";

import { getAllSessions } from "@/data/storeConfig";

export default function StoreDashboardPage() {
  const [storeData, setStoreData] = useState<any>(null);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, ordRes] = await Promise.all([
        fetch("/api/store/inventory"),
        fetch("/api/store/orders"),
      ]);

      const invData = await invRes.json();
      const ordData = await ordRes.json();

      if (invData.success) {
        setInventoryStats(invData.data);
      }
      if (ordData.success) {
        const currentStore = ordData.store || "RANCHI";
        const apiOrders = ordData.data.items || [];

        // Merge live kiosk walk-in orders for this branch
        const localSessions = getAllSessions()
          .filter((s) => s.storeId.toUpperCase() === currentStore.toUpperCase())
          .map((s) => ({
            id: s.id,
            storeCode: currentStore,
            storeLocation: `${currentStore} Central Branch`,
            customerName: s.customerName,
            totalAmount: s.total,
            status: s.status === "PENDING" ? "NEW KIOSK" : s.status,
            items: s.items,
          }));

        setOrders([...localSessions, ...apiOrders]);
        setStoreData({ code: currentStore });
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {storeData?.code || "Assigned Branch"}
            </span>
            <span className="text-slate-500 text-xs font-semibold">
              Store Manager Desk
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Branch Operational Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring live walk-in orders, localized inventory, and active
            kiosk terminals.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Store Total Units
            </span>
            <Boxes className="w-5 h-5 text-[#00AEEF]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {inventoryStats?.totalUnits ?? "—"}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Live catalog in stock
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Low Stock SKUs
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {inventoryStats?.lowStockCount ?? "—"}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            Units below threshold (10)
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Recent Orders
            </span>
            <ShoppingBag className="w-5 h-5 text-[#00AEEF]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {orders.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Walk-in &amp; pickup orders
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              POS Status
            </span>
            <Tablet className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">Ready</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Kiosk paired &amp; operational
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Branch Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Branch Orders */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#00AEEF]" /> Recent Branch
              Orders
            </h2>
            <Link
              href="/store/orders"
              className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <span>{order.id}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      ₹{order.totalAmount?.toLocaleString("en-IN") || "1,499"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {order.storeLocation || "Local Store"} •{" "}
                    {order.items?.length || 2} Items
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {order.status || "CONFIRMED"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Branch Operations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#00AEEF]" /> Quick Operations
          </h2>

          <div className="space-y-2.5">
            <Link
              href="/store-pos"
              target="_blank"
              className="block bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-[#00AEEF] transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-black text-slate-900 group-hover:text-[#00AEEF]">
                <span className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-[#00AEEF]" /> Open Store POS
                  Terminal
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Process walk-in checkouts and barcode scans for this branch.
              </p>
            </Link>

            <Link
              href="/store/inventory"
              className="block bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-[#00AEEF]">
                <span className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#FFC20E]" /> Audit Local Stock
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Verify physical shelf quantities against ERP records.
              </p>
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200/80 p-3.5 rounded-xl text-[11px] text-blue-800 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00AEEF]" /> Store
              Manager Scope
            </div>
            <p className="text-blue-700">
              Your credentials only permit actions for this store. Other stores
              are strictly isolated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
