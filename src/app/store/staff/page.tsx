"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Search,
  ShieldCheck,
  RefreshCw,
  X,
  User,
  KeyRound,
  Tablet,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function StoreStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState("RANCHI");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Staff Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"POS_CASHIER" | "KIOSK_USER">("POS_CASHIER");
  const [assignedDevice, setAssignedDevice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/staff");
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data || []);
        setStoreCode(data.store || "RANCHI");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/store/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          role,
          assignedDevice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create staff account.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || "Account registered successfully!");
      setTimeout(() => {
        setShowModal(false);
        setName("");
        setUsername("");
        setEmail("");
        setAssignedDevice("");
        setSuccessMsg("");
        fetchStaff();
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = staffList.filter((s) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 font-sans">
      {/* ── 1. Header ── */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {storeCode} Branch Team
            </span>
            <span className="text-slate-500 text-xs font-semibold">
              Cashiers &amp; In-Store Kiosk Logins
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Store Staff &amp; Terminal Operators
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage register cashiers and shopping tablet device logins assigned exclusively to this branch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cashier Account</span>
          </button>

          <button
            onClick={fetchStaff}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Search Bar ── */}
      <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, username, or role..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* ── 3. Staff Table ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Store Role</th>
                <th className="py-3 px-4">Assigned Hardware</th>
                <th className="py-3 px-4">Activity Status</th>
                <th className="py-3 px-4">Local Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading branch staff directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No staff found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {s.name}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {s.email || "Device Login"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      @{s.username}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          s.role === "STORE_MANAGER"
                            ? "bg-blue-100 text-[#2563EB]"
                            : s.role === "POS_CASHIER"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {s.role?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {s.assignedDevice || `${storeCode} Counter`}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {s.lastActive || "Active"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(s.permissions || []).map((perm: string) => (
                          <span
                            key={perm}
                            className="bg-slate-100 text-slate-600 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Add Cashier Account Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2563EB]">
                  Store Staff Management
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Register Cashier for {storeCode} Store
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. rnc_cashier_2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Staff Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="POS_CASHIER">POS Cashier (Register Billing &amp; Invoices)</option>
                  <option value="KIOSK_USER">Kiosk Tablet Login (Self-Service Shopping)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assigned Terminal / Hardware Name
                </label>
                <input
                  type="text"
                  value={assignedDevice}
                  onChange={(e) => setAssignedDevice(e.target.value)}
                  placeholder={`e.g. ${storeCode} POS Counter 2`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl text-red-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{submitting ? "Saving..." : "Create Store Login"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

