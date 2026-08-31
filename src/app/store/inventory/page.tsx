'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, Search, AlertTriangle, CheckCircle2, RefreshCw, Plus } from 'lucide-react';

export default function StoreInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data.data.items || []);
        setStoreCode(data.store || 'STORE');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventory.filter(it => 
    it.name?.toLowerCase().includes(search.toLowerCase()) ||
    it.sku?.toLowerCase().includes(search.toLowerCase()) ||
    it.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {storeCode} Branch Stock
            </span>
            <span className="text-xs text-slate-400 font-semibold">Inventory Control</span>
          </div>
          <h1 className="text-2xl font-black text-white">Local Shelf & Warehouse Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage product quantities and safety stock thresholds for this physical store branch.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Local Quantities</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search local SKUs, product titles, or components..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Store Stock</th>
                <th className="px-6 py-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
                      <span>Loading local store inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No matching items in this store warehouse.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white max-w-xs truncate">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-black text-sm">
                      {item.localStock} units
                    </td>
                    <td className="px-6 py-4">
                      {item.localStock > 10 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      ) : item.localStock > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
