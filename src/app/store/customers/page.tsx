"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  RefreshCw,
  Eye,
  X,
  CreditCard,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function StoreCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState("RANCHI");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
        setStoreCode(data.store || "RANCHI");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 font-sans">
      {/* ── 1. Header ── */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {storeCode} Branch Directory
            </span>
            <span className="text-slate-500 text-xs font-semibold">
              Walk-in &amp; Local Clientele
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Store Customers &amp; Walk-in Guests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles, purchase histories, and contact records for patrons of the {storeCode} branch.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── 2. Search Bar ── */}
      <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, 10-digit mobile number, or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <div className="text-xs font-bold text-slate-400">
          Showing <span className="text-slate-900">{filtered.length}</span> patrons
        </div>
      </div>

      {/* ── 3. Customers Table ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Branch Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Spent</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading store customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No customers found matching search query.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.name}
                      <div className="text-[10px] text-slate-400 font-normal">
                        Type: {c.customerType || "WALK_IN"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {c.phone}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {c.email || "—"}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {c.totalOrders || 1}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      ₹{(c.totalSpent || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(c.lastVisit).toLocaleDateString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                        title="View Purchase History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Customer Purchase History Drawer / Modal ── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedCustomer(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2563EB]">
                  Patron Profile
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {selectedCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px]">Mobile</span>
                <div className="font-mono font-bold text-slate-900">{selectedCustomer.phone}</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px]">Branch Lifetime Spend</span>
                <div className="font-mono font-black text-[#2563EB]">₹{selectedCustomer.totalSpent?.toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400">Recent Components Purchased</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {(selectedCustomer.recentPurchases || []).map((p: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-900">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

