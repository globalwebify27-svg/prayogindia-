"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  DEFAULT_REWARD_RULES,
  INITIAL_POINTS_LEDGER,
  PointsLedgerEntry,
} from "@/data/rewardsData";
import {
  Award,
  ArrowRight,
  Coins,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Gift,
} from "lucide-react";

export const RewardsView: React.FC = () => {
  const { user } = useStore();
  const points = user?.rewardPoints || 100;

  const [activeTab, setActiveTab] = useState<"overview" | "history" | "rules">(
    "overview",
  );

  // Customer-specific ledger activity filter
  const userLedger: PointsLedgerEntry[] = INITIAL_POINTS_LEDGER.filter(
    (l) =>
      !user?.email || l.userEmail.toLowerCase() === user.email.toLowerCase(),
  );

  // Applicable rule for current user
  const activeRule =
    DEFAULT_REWARD_RULES.find(
      (r) => r.customerType === (user?.customerType || "Registered Customer"),
    ) || DEFAULT_REWARD_RULES[0];

  const cashValue = Math.round(points * activeRule.redemptionRateRupees);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-slate-900 animate-in fade-in duration-300">
      {/* 1. Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 22 · Prayog Coins &amp; Loyalty Program
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Rewards &amp; Loyalty Points
          </h1>
          <p className="text-xs text-slate-500">
            Earn Prayog Coins on every STEM hardware purchase and redeem them at
            checkout for instant cash discounts.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Points History
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "rules"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Earning Rules
          </button>
        </div>
      </div>

      {/* 2. Main Balance Hero Card */}
      <div className="bg-gradient-to-br from-[#0F172A] via-slate-900 to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC20E] bg-white/10 px-3 py-1 rounded-full border border-white/10">
              AVAILABLE COINS BALANCE
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Active Tier: {activeRule.name}
            </span>
          </div>

          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline justify-center md:justify-start gap-2">
            <span>{points.toLocaleString()}</span>
            <span className="text-lg text-[#FFC20E] font-bold">
              Prayog Coins
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium">
            Worth{" "}
            <strong className="text-white font-black text-sm">
              ₹{cashValue.toLocaleString()}
            </strong>{" "}
            in instant discounts at Checkout (1 Coin = ₹
            {activeRule.redemptionRateRupees}).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
          <Link
            href="/cart"
            className="w-full sm:w-auto bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Redeem at Checkout</span>
            <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
          </Link>
        </div>
      </div>

      {/* 3. Tab: Overview Metrics */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#00AEEF]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900">
                  {activeRule.pointsPer100Spent} Coin / ₹100
                </span>
                <h4 className="text-xs font-bold text-slate-500">
                  Earning Rate on Hardware
                </h4>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900">
                  Up to {activeRule.maxRedemptionPercentage}% Off
                </span>
                <h4 className="text-xs font-bold text-slate-500">
                  Max Cart Discount Cap
                </h4>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-purple-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900">
                  {activeRule.validityDays} Days
                </span>
                <h4 className="text-xs font-bold text-slate-500">
                  Points Expiry Validity
                </h4>
              </div>
            </div>
          </div>

          {/* Quick FAQ info */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#00AEEF]" /> How to Redeem
              Loyalty Points
            </h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Add electronics, kits, or robotics sensors to your shopping
                  cart.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  On the Checkout page, check{" "}
                  <strong>&quot;Redeem Prayog Coins&quot;</strong> in the Order
                  Summary sidebar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  The discount is deducted immediately from your Grand Total
                  Payable.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 4. Tab: History Ledger */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Points Ledger Activity Log
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {userLedger.length} transaction(s)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3">
            {userLedger.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-bold">
                No rewards activity recorded yet. Place orders to start earning
                coins!
              </div>
            ) : (
              userLedger.map((entry) => {
                const isPositive = entry.points > 0;
                return (
                  <div
                    key={entry.id}
                    className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{entry.notes}</span>
                          {entry.orderNumber && (
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {entry.orderNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Date: {entry.date}</span>
                          {entry.expiryDate && (
                            <span>• Expires: {entry.expiryDate}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-base font-black shrink-0 ${isPositive ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {isPositive ? `+${entry.points}` : entry.points} PTS
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Tab: Earning & Customer-Type Rules */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Customer-Type Eligibility &amp; Redemption Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEFAULT_REWARD_RULES.map((rule) => (
              <div
                key={rule.id}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h4 className="text-xs font-black text-slate-900">
                    {rule.name}
                  </h4>
                  <span className="text-[9px] bg-[#E0F7FC] text-[#00AEEF] px-2 py-0.5 rounded-full font-bold">
                    {rule.customerType}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">
                      Earning Rate:
                    </span>
                    <span className="font-black text-slate-900">
                      {rule.pointsPer100Spent} pts / ₹100
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
                      Min to Redeem:
                    </span>
                    <span className="font-bold text-slate-900">
                      {rule.minRedemptionPoints} pts
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
                      Registration Bonus:
                    </span>
                    <span className="font-bold text-purple-700">
                      {rule.registrationBonus} pts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">
                      Points Expiry:
                    </span>
                    <span className="font-bold text-slate-900">
                      {rule.validityDays} Days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
