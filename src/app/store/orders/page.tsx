'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/store/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data.items || []);
          setStoreCode(data.store || 'STORE');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {storeCode} Branch
            </span>
            <span className="text-xs text-slate-400 font-semibold">Store Orders Management</span>
          </div>
          <h1 className="text-2xl font-black text-white">Branch Orders & Counter Receipts</h1>
          <p className="text-xs text-slate-400 mt-1">
            All orders placed at or assigned to this branch location.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or Customer name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Store Code</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
                      <span>Loading branch orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-950 text-[#00AEEF] border border-blue-800/50 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {order.storeCode || storeCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.user?.name || order.customerName || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ₹{order.totalAmount?.toLocaleString('en-IN') || '2,499'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> {order.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
