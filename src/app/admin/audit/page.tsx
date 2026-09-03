"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Edit3,
  Trash2,
  Tag,
  Building2,
  Smartphone,
  Lock,
  Download,
} from "lucide-react";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  actionCategory:
    | "PRICE_CHANGE"
    | "GST_CHANGE"
    | "SKU_CHANGE"
    | "STOCK_ADJUSTMENT"
    | "PURCHASE_ENTRY"
    | "STOCK_TRANSFER"
    | "ORDER_STATUS"
    | "REFUND"
    | "INVOICE_MODIFICATION"
    | "INCENTIVE_RULE"
    | "DEVICE_PAIRING";
  description: string;
  previousValue?: string;
  newValue: string;
  ipAddress: string;
  deviceContext: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-101",
    timestamp: "29 Aug 2026, 15:45:10",
    user: "Abhishek Kumar (Super Admin)",
    role: "Super Admin",
    actionCategory: "PRICE_CHANGE",
    description: "Bulk Price Update on Arduino Microcontrollers (+10%)",
    previousValue: "Arduino UNO: ₹1,350",
    newValue: "Arduino UNO: ₹1,499",
    ipAddress: "103.212.14.88",
    deviceContext: "MacBook Pro (Chrome 128 / macOS)",
  },
  {
    id: "log-102",
    timestamp: "29 Aug 2026, 14:12:05",
    user: "Jay Prakash (Patna Store Manager)",
    role: "Store Manager",
    actionCategory: "STOCK_TRANSFER",
    description: "Received Inter-Store Stock Transfer from Ranchi Central",
    previousValue: "Patna Stock: 10 units",
    newValue: "Patna Stock: 35 units (+25 Units)",
    ipAddress: "115.240.89.12",
    deviceContext: "iPad Air 5 (Store POS App)",
  },
  {
    id: "log-103",
    timestamp: "28 Aug 2026, 17:30:22",
    user: "Abhishek Kumar (Super Admin)",
    role: "Super Admin",
    actionCategory: "INCENTIVE_RULE",
    description: "Updated Role-Based Profit Sharing Policy",
    previousValue: "Sales Executive: 5%",
    newValue: "Sales Executive: 7% of Net Profit",
    ipAddress: "103.212.14.88",
    deviceContext: "MacBook Pro (Admin Desk)",
  },
  {
    id: "log-104",
    timestamp: "28 Aug 2026, 11:20:18",
    user: "Vikramaditya Sahay (Delhi Manager)",
    role: "Store Manager",
    actionCategory: "DEVICE_PAIRING",
    description: "Paired New Store POS Tablet Terminal",
    previousValue: "None",
    newValue: "PRG_POS_AUTH_DEL_TAB01 (Active)",
    ipAddress: "49.36.110.45",
    deviceContext: "Lenovo Tab P12 Pro (Android 14)",
  },
  {
    id: "log-105",
    timestamp: "27 Aug 2026, 16:05:40",
    user: "Emraan Hassan (Sales Executive)",
    role: "Sales Executive",
    actionCategory: "STOCK_ADJUSTMENT",
    description: "Recorded Damaged Goods Write-off",
    previousValue: "4S LiPo Battery: 45 units",
    newValue: "4S LiPo Battery: 43 units (-2 damaged in unloading)",
    ipAddress: "103.212.14.90",
    deviceContext: "Store POS Terminal 1",
  },
];

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const matchesCat =
      categoryFilter === "ALL" || log.actionCategory === categoryFilter;
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 bg-purple-100 px-3.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-700" /> Section 103 ·
              Immutable System Activity &amp; Audit Logs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Audit &amp; Activity Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable tracking of critical inventory changes, price
            modifications, GST adjustments, store transfers, device pairings,
            and financial records.
          </p>
        </div>

        <button
          onClick={() => alert("Exporting signed Audit Log CSV...")}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#FFC20E]" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit descriptions, user, SKU..."
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Action Filter:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">All System Actions</option>
              <option value="PRICE_CHANGE">Price Changes</option>
              <option value="STOCK_TRANSFER">Stock Transfers</option>
              <option value="STOCK_ADJUSTMENT">Stock Adjustments</option>
              <option value="INCENTIVE_RULE">Incentive Policy Changes</option>
              <option value="DEVICE_PAIRING">POS Device Pairings</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-bold">
          Showing {filteredLogs.length} verified audit records
        </span>
      </div>

      {/* 3. Audit Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3">Timestamp &amp; User</th>
                <th className="pb-3">Action Category</th>
                <th className="pb-3">Audit Description</th>
                <th className="pb-3">Previous Value</th>
                <th className="pb-3">New Value Committed</th>
                <th className="pb-3 text-right">IP &amp; Device Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Timestamp & User */}
                  <td className="py-3.5 space-y-0.5">
                    <div className="font-mono text-[11px] font-black text-slate-900">
                      {log.timestamp}
                    </div>
                    <div className="font-bold text-slate-700">{log.user}</div>
                    <span className="text-[10px] text-slate-400 block">
                      {log.role}
                    </span>
                  </td>

                  {/* Category Tag */}
                  <td className="py-3.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        log.actionCategory === "PRICE_CHANGE"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : log.actionCategory === "STOCK_TRANSFER"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : log.actionCategory === "DEVICE_PAIRING"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {log.actionCategory.replace(/_/g, " ")}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 font-bold text-slate-900 max-w-xs">
                    {log.description}
                  </td>

                  {/* Previous Value */}
                  <td className="py-3.5 font-mono text-slate-400 line-through text-[11px]">
                    {log.previousValue || "—"}
                  </td>

                  {/* New Value Committed */}
                  <td className="py-3.5 font-mono font-black text-emerald-700 text-xs">
                    {log.newValue}
                  </td>

                  {/* IP & Device Context */}
                  <td className="py-3.5 text-right space-y-0.5">
                    <div className="font-mono text-[10px] text-slate-500 font-bold">
                      {log.ipAddress}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">
                      {log.deviceContext}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
