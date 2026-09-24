"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RewardPointsRule, PointsLedgerEntry } from "@/data/rewardsData";
import {
  Award,
  Coins,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calendar,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
} from "lucide-react";

export interface LiveLedgerEntry {
  id: string;
  userId: string;
  orderId?: string | null;
  type: string;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
  expiryDate?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    customerType: string;
    rewardPoints: number;
  } | null;
}

export default function AdminRewardsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [ledger, setLedger] = useState<LiveLedgerEntry[]>([]);
  const [stats, setStats] = useState<{
    totalCirculatingCoins: number;
    totalCustomers: number;
  }>({
    totalCirculatingCoins: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Manual Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustEmail, setAdjustEmail] = useState("");
  const [adjustPoints, setAdjustPoints] = useState(100);
  const [adjustType, setAdjustType] = useState<
    "Earned" | "Admin Adjustment" | "Expired" | "Bonus"
  >("Admin Adjustment");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Edit Rule Modal State
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [savingRule, setSavingRule] = useState(false);

  // 1. Fetch Tier Rules
  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/rewards/rules");
      if (res.ok) {
        const data = await res.json();
        if (data.rules) setRules(data.rules);
      }
    } catch (err) {
      console.warn("Failed to fetch rules:", err);
    }
  }, []);

  // 2. Fetch Ledger Records
  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/rewards?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLedger(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.warn("Failed to fetch reward ledger:", err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, searchQuery]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Submit Manual Adjustment
  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustEmail.trim() || !adjustPoints) return;

    setSubmittingAdjust(true);
    setAdjustError(null);
    try {
      const res = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adjustEmail.trim(),
          points: Number(adjustPoints),
          type: adjustType,
          reason: adjustNotes.trim() || "Manual administrator adjustment",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.details || "Adjustment failed");
      }

      setShowAdjustModal(false);
      setAdjustEmail("");
      setAdjustPoints(100);
      setAdjustNotes("");
      fetchLedger();
    } catch (err: any) {
      setAdjustError(err.message || "Adjustment failed");
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Save Modified Tier Rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setSavingRule(true);
    try {
      const res = await fetch("/api/admin/rewards/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRule),
      });

      if (res.ok) {
        setEditingRule(null);
        fetchRules();
      }
    } catch (err) {
      console.warn("Failed to save rule:", err);
    } finally {
      setSavingRule(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 22 · Loyalty &amp; Rewards Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Rewards &amp; Loyalty Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Authoritative loyalty engine for earning multipliers, checkout
            redemption caps, validity expiry rules, and customer point
            adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchRules();
              fetchLedger();
            }}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-[#00AEEF]" : ""}`}
            />
          </button>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-[#FFC20E]" />
            <span>Manual Points Adjustment</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Circulating Coins
            </span>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalCirculatingCoins.toLocaleString()} PTS
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              ≈ ₹{(stats.totalCirculatingCoins * 0.5).toLocaleString("en-IN")}{" "}
              Value
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Registered Accounts
            </span>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalCustomers.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Eligible for loyalty perks
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Loyalty Engine Status
            </span>
            <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
              <span>ACTIVE</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {rules.length} Configured Tiers
            </span>
          </div>
        </div>
      </div>

      {/* 1. Configurable Loyalty Tier Rules */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" /> Customer Type Loyalty
              Tiers
            </h2>
            <p className="text-xs text-slate-500">
              Per-tier earning rates, redemption values, minimum thresholds, and
              checkout percentage caps.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id || rule.tierCode}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 relative hover:border-[#00AEEF]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#00AEEF] tracking-wider">
                    {rule.tierCode} Tier
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {rule.name}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Edit Rule"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">
                    Earning Rate:
                  </span>
                  <span className="font-black text-slate-900">
                    {rule.pointsPer100Spent} pt / ₹100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">
                    Redemption Value:
                  </span>
                  <span className="font-black text-emerald-600">
                    1 pt = ₹{rule.redemptionRateRupees}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">
                    Min. Redeem Points:
                  </span>
                  <span className="font-bold text-slate-900">
                    {rule.minRedemptionPoints} PTS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">
                    Max Cart Cap:
                  </span>
                  <span className="font-bold text-slate-900">
                    {rule.maxRedemptionPercentage}% of subtotal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">
                    Welcome Bonus:
                  </span>
                  <span className="font-bold text-purple-700">
                    +{rule.registrationBonus} PTS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Validity:</span>
                  <span className="font-bold text-slate-900">
                    {rule.validityDays} Days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Customer Points Ledger & Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#00AEEF]" /> Global Points Ledger
              &amp; Adjustments History
            </h2>
            <p className="text-xs text-slate-500">
              Live immutable audit log of customer earnings, checkout
              redemptions, welcome bonuses, and manual adjustments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search user, email, order #..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="EARNED">Earned (Orders)</option>
              <option value="REDEEMED">Redeemed (Checkout)</option>
              <option value="BONUS">Welcome Bonus</option>
              <option value="ADJUSTMENT">Admin Adjustments</option>
              <option value="REFUND_REVERSAL">Refund Reversals</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 font-black">Customer</th>
                <th className="pb-3 font-black">Type &amp; Ref</th>
                <th className="pb-3 font-black">Points</th>
                <th className="pb-3 font-black">Balance (Before → After)</th>
                <th className="pb-3 font-black">Timestamp</th>
                <th className="pb-3 font-black">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && ledger.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 font-bold"
                  >
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00AEEF]" />
                    Loading loyalty transactions...
                  </td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 font-bold"
                  >
                    No reward transactions found matching current criteria.
                  </td>
                </tr>
              ) : (
                ledger.map((entry) => {
                  const isPositive = entry.points > 0;
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3">
                        <div className="font-extrabold text-slate-900">
                          {entry.user?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {entry.user?.email || "No email"}
                        </div>
                      </td>
                      <td className="py-3 space-y-0.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                            entry.type === "EARNED" || entry.type === "BONUS"
                              ? "bg-emerald-100 text-emerald-800"
                              : entry.type === "ADJUSTMENT"
                                ? "bg-[#E0F7FC] text-[#00AEEF]"
                                : entry.type === "REFUND_REVERSAL"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {entry.type}
                        </span>
                        {entry.referenceId && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Ref: {entry.referenceId}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-black text-sm ${isPositive ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {isPositive ? `+${entry.points}` : entry.points} PTS
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-600">
                        <span className="line-through text-slate-400">
                          {entry.balanceBefore}
                        </span>
                        <span className="mx-1 text-slate-300">→</span>
                        <span className="font-bold text-slate-900">
                          {entry.balanceAfter} PTS
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-600">
                        {new Date(entry.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 text-slate-700 max-w-sm">
                        {entry.description}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-bold">
              Showing {ledger.length} of {totalRecords} transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowAdjustModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#00AEEF]" /> Manual Points
                Adjustment
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. customer@example.com"
                  value={adjustEmail}
                  onChange={(e) => setAdjustEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Adjustment Points *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100 or -50"
                    value={adjustPoints}
                    onChange={(e) => setAdjustPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                  />
                  <span className="text-[10px] text-slate-400">
                    Positive adds, negative deducts
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Admin Adjustment">Admin Adjustment</option>
                    <option value="Bonus">Bonus Perk</option>
                    <option value="Earned">Manual Earned</option>
                    <option value="Expired">Manual Expiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Audit Reason / Note *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="State the justification for this balance change..."
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="bg-[#00AEEF] text-white px-5 py-2 rounded-xl font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {submittingAdjust ? "Applying..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setEditingRule(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Edit {editingRule.name}
              </h3>
              <button
                onClick={() => setEditingRule(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Points per ₹100 Spent
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingRule.pointsPer100Spent}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        pointsPer100Spent: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Redemption Value (₹/pt)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRule.redemptionRateRupees}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        redemptionRateRupees: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Min. Points to Redeem
                  </label>
                  <input
                    type="number"
                    value={editingRule.minRedemptionPoints}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        minRedemptionPoints: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Max Cart % Cap
                  </label>
                  <input
                    type="number"
                    value={editingRule.maxRedemptionPercentage}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        maxRedemptionPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Registration Bonus
                  </label>
                  <input
                    type="number"
                    value={editingRule.registrationBonus}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        registrationBonus: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Expiry (Days)
                  </label>
                  <input
                    type="number"
                    value={editingRule.validityDays}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        validityDays: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 font-bold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRule}
                  className="bg-[#00AEEF] text-white px-5 py-2 rounded-xl font-black uppercase cursor-pointer disabled:opacity-50"
                >
                  {savingRule ? "Saving..." : "Save Tier Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
