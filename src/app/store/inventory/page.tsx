"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function StoreInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState("");
  const [isCentralInventory, setIsCentralInventory] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/inventory");
      const data = await res.json();
      if (data.success) {
        setInventory(data.data.items || []);
        setStoreCode(data.store || "STORE");
        setIsCentralInventory(data.isCentralInventory || false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventory.filter(
    (it) =>
      it.name?.toLowerCase().includes(search.toLowerCase()) ||
      it.sku?.toLowerCase().includes(search.toLowerCase()) ||
      it.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {storeCode} Branch Stock
            </span>
            {isCentralInventory ? (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ★ Central Network Inventory (Online + App + Walk-in)
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Physical Store Stock
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900">
            {isCentralInventory
              ? "Central Warehouse & Local Store Inventory"
              : "Store Branch Local Inventory"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isCentralInventory
              ? "Ranchi Main Branch serves as Central Inventory for Website orders, Mobile App orders, and Ranchi walk-in sales."
              : `Independent physical store stock. Sales at ${storeCode} reduce this branch's stock only.`}
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Sync Quantities</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-center gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search local SKUs, product titles, or components..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 cursor-pointer font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">SKU</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Unit Price</th>
                <th className="px-5 py-3.5">Stock Status</th>
                <th className="px-5 py-3.5 text-right">Available Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
                      <span>Loading store stock levels...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    No items found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = (item.stock ?? item.localStock ?? 0) <= 10;
                  const stockQty = item.stock ?? item.localStock ?? 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                        {item.sku}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isLow
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isLow ? (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-sm text-slate-900 font-mono">
                        {stockQty} units
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
