"use client";

import React, { useState } from "react";
import {
  Award,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Percent,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Calculator,
  Sliders,
  Layers,
  ShoppingBag,
  Tablet,
  FileText,
} from "lucide-react";

export type IncentiveFormulaMode =
  "profit_based" | "slab_based" | "category_wise";

interface ExecutiveStat {
  id: string;
  name: string;
  avatar: string;
  region: string;
  monthlyTarget: number;
  achievedSales: number;
  totalCost: number;
  shippingCost: number;
  additionalExpenses: number;
  profitCommissionPct: number;
  categorySales: {
    drones: number;
    arduino: number;
    stemKits: number;
    sensors: number;
  };
}

interface AttributedOrder {
  orderId: string;
  date: string;
  channel: "ONLINE" | "WALK-IN" | "B2B";
  executiveName: string;
  clientName: string;
  sellingPrice: number;
  purchaseCost: number;
  shippingCost: number;
  additionalExpenses: number;
  category: "Drone Tech" | "Arduino & IoT" | "STEM Kits" | "Sensors";
}

const EXECUTIVES: ExecutiveStat[] = [
  {
    id: "exec-1",
    name: "Amitabh Sen",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    region: "Eastern Region (Ranchi & Patna)",
    monthlyTarget: 500000,
    achievedSales: 620000,
    totalCost: 410000,
    shippingCost: 24000,
    additionalExpenses: 8000,
    profitCommissionPct: 10,
    categorySales: {
      drones: 280000,
      arduino: 190000,
      stemKits: 110000,
      sensors: 40000,
    },
  },
  {
    id: "exec-2",
    name: "Pooja Verma",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    region: "Northern Region (Delhi & NCR)",
    monthlyTarget: 400000,
    achievedSales: 445000,
    totalCost: 305000,
    shippingCost: 18000,
    additionalExpenses: 6000,
    profitCommissionPct: 10,
    categorySales: {
      drones: 180000,
      arduino: 145000,
      stemKits: 80000,
      sensors: 40000,
    },
  },
  {
    id: "exec-3",
    name: "Rahul Mukherji",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    region: "Institutional STEM Labs Lead",
    monthlyTarget: 800000,
    achievedSales: 940000,
    totalCost: 610000,
    shippingCost: 42000,
    additionalExpenses: 14000,
    profitCommissionPct: 12,
    categorySales: {
      drones: 450000,
      arduino: 210000,
      stemKits: 220000,
      sensors: 60000,
    },
  },
];

const ATTRIBUTED_ORDERS: AttributedOrder[] = [
  {
    orderId: "PRG-B2B-8841",
    date: "26 Aug 2026",
    channel: "B2B",
    executiveName: "Rahul Mukherji",
    clientName: "IIT Delhi Robotics Lab",
    sellingPrice: 185000,
    purchaseCost: 122000,
    shippingCost: 4500,
    additionalExpenses: 1500,
    category: "Drone Tech",
  },
  {
    orderId: "POS-RNC-9021",
    date: "25 Aug 2026",
    channel: "WALK-IN",
    executiveName: "Amitabh Sen",
    clientName: "Walk-in (Ranchi Hub)",
    sellingPrice: 34500,
    purchaseCost: 23000,
    shippingCost: 0,
    additionalExpenses: 500,
    category: "Arduino & IoT",
  },
  {
    orderId: "PRG-ONL-4412",
    date: "24 Aug 2026",
    channel: "ONLINE",
    executiveName: "Pooja Verma",
    clientName: "Tech Innovations Noida",
    sellingPrice: 56000,
    purchaseCost: 38000,
    shippingCost: 1800,
    additionalExpenses: 600,
    category: "STEM Kits",
  },
];

export default function IncentivesPage() {
  const [executives, setExecutives] = useState<ExecutiveStat[]>(EXECUTIVES);
  const [attributedOrders, setAttributedOrders] = useState<AttributedOrder[]>(ATTRIBUTED_ORDERS);
  const [calculationMode, setCalculationMode] =
    useState<IncentiveFormulaMode>("profit_based");
  const [payoutApproved, setPayoutApproved] = useState<Record<string, boolean>>(
    {},
  );

  React.useEffect(() => {
    fetch("/api/admin/incentives")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.orders?.length > 0) {
          setAttributedOrders(data.data.orders);
        }
      })
      .catch(() => {});
  }, []);

  const totalRevenue = executives.reduce((sum, e) => sum + e.achievedSales, 0);
  const totalTarget = executives.reduce((sum, e) => sum + e.monthlyTarget, 0);

  // Section 8.2 Calculation Formulas
  const calculateIncentive = (
    exec: ExecutiveStat,
  ): { incentive: number; breakdownNote: string } => {
    // Mode 1: Profit-based Commission: Net Profit = Selling Price - Purchase Cost - Shipping - Additional Expenses
    if (calculationMode === "profit_based") {
      const netProfit =
        exec.achievedSales -
        exec.totalCost -
        exec.shippingCost -
        exec.additionalExpenses;
      const incentive = Math.round(
        netProfit * (exec.profitCommissionPct / 100),
      );
      return {
        incentive,
        breakdownNote: `${exec.profitCommissionPct}% of Net Profit (₹${netProfit.toLocaleString()})`,
      };
    }

    // Mode 2: Slab-based Formula: ₹0-₹50k = 2%, ₹50k-₹1L = 3%, >₹1L = 5%
    if (calculationMode === "slab_based") {
      const sales = exec.achievedSales;
      let slabPct = 2;
      if (sales > 100000) slabPct = 5;
      else if (sales > 50000) slabPct = 3;
      const incentive = Math.round(sales * (slabPct / 100));
      return {
        incentive,
        breakdownNote: `Slab Rate: ${slabPct}% on ₹${sales.toLocaleString()}`,
      };
    }

    // Mode 3: Category-wise Formula: Drone Tech = 5%, Arduino = 3%, STEM Kits = 2%, Sensors = 2%
    if (calculationMode === "category_wise") {
      const droneInc = exec.categorySales.drones * 0.05;
      const ardInc = exec.categorySales.arduino * 0.03;
      const stemInc = exec.categorySales.stemKits * 0.02;
      const sensorInc = exec.categorySales.sensors * 0.02;
      const incentive = Math.round(droneInc + ardInc + stemInc + sensorInc);
      return {
        incentive,
        breakdownNote: `Drones 5% (₹${droneInc}) + Arduino 3% (₹${ardInc}) + STEM 2% (₹${stemInc})`,
      };
    }

    return { incentive: 0, breakdownNote: "" };
  };

  const totalIncentivesPaid = executives.reduce(
    (sum, e) => sum + calculateIncentive(e).incentive,
    0,
  );

  const togglePayout = (id: string) => {
    setPayoutApproved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              SECTION 8.2 SALES ATTRIBUTION & INCENTIVES
            </span>
            <span className="text-xs text-slate-400 font-bold">
              August 2026 Cycle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Executive Performance & Incentive Engine
          </h1>
          <p className="text-xs text-slate-400">
            Track multi-channel sales attribution and calculate commissions
            using profit, slab, or category formulas.
          </p>
        </div>

        {/* 8.2 Calculation Formula Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-700 p-1.5 rounded-2xl text-xs">
          <button
            onClick={() => setCalculationMode("profit_based")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              calculationMode === "profit_based"
                ? "bg-[#00AEEF] text-white shadow-xs font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Profit-Based (Net Profit %)
          </button>
          <button
            onClick={() => setCalculationMode("slab_based")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              calculationMode === "slab_based"
                ? "bg-[#00AEEF] text-white shadow-xs font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Slab-Based (2% - 5%)
          </button>
          <button
            onClick={() => setCalculationMode("category_wise")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              calculationMode === "category_wise"
                ? "bg-[#00AEEF] text-white shadow-xs font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Category-Wise %
          </button>
        </div>
      </div>

      {/* Formula Mathematical Definition Box */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-900">
          <Calculator className="w-4 h-4 text-[#00AEEF]" /> Active Incentive
          Formula Model:
        </div>

        {calculationMode === "profit_based" && (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl font-mono text-xs text-slate-800 space-y-1">
            <div className="font-bold text-[#00AEEF]">
              1. Profit-Based Commission Formula:
            </div>
            <div className="text-slate-600">
              {
                "Net Profit = Selling Price − Purchase Cost − Shipping Cost − Additional Expenses"
              }
            </div>
            <div className="text-slate-900 font-bold">
              {"Commission = Configured % × Net Profit"}
            </div>
          </div>
        )}

        {calculationMode === "slab_based" && (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl font-mono text-xs text-slate-800 space-y-1">
            <div className="font-bold text-[#00AEEF]">
              2. Slab-Based Revenue Formula:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 pt-1">
              <span className="bg-white p-2 rounded-xl border border-slate-200">
                • ₹0 to ₹50,000 → <strong>2.0% Commission</strong>
              </span>
              <span className="bg-white p-2 rounded-xl border border-slate-200">
                • ₹50,000 to ₹1,00,000 → <strong>3.0% Commission</strong>
              </span>
              <span className="bg-white p-2 rounded-xl border border-slate-200">
                • &gt; ₹1,00,000 → <strong>5.0% Commission</strong>
              </span>
            </div>
          </div>
        )}

        {calculationMode === "category_wise" && (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl font-mono text-xs text-slate-800 space-y-1">
            <div className="font-bold text-[#00AEEF]">
              3. Category-Wise Incentive Multipliers:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 pt-1">
              <span className="bg-white p-2 rounded-xl border border-slate-200">
                🚁 Drone Tech: <strong>5.0%</strong>
              </span>
              <span className="bg-white p-2 rounded-xl border border-slate-200">
                ⚡ Arduino / Micro: <strong>3.0%</strong>
              </span>
              <span className="bg-white p-2 rounded-xl border border-slate-200">
                🎓 STEM Kits: <strong>2.0%</strong>
              </span>
              <span className="bg-white p-2 rounded-xl border border-slate-200">
                🎯 Sensors / IoT: <strong>2.0%</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Sales Attributed
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            ₹{totalRevenue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold">
            118% of monthly target (₹{totalTarget.toLocaleString()})
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Commission Pool
            </span>
            <Award className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <h3 className="text-2xl font-black text-[#00AEEF] font-mono">
            ₹{totalIncentivesPaid.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Mode: {calculationMode.replace("_", " ").toUpperCase()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Active Field Executives
            </span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            {executives.length} Leads
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            All regional targets attained
          </p>
        </div>
      </div>

      {/* Executive Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-900">
            Executive Target & Commission Performance
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            August 2026 Cycle
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {executives.map((exec) => {
            const netProfit =
              exec.achievedSales -
              exec.totalCost -
              exec.shippingCost -
              exec.additionalExpenses;
            const { incentive, breakdownNote } = calculateIncentive(exec);
            const attainment = Math.round(
              (exec.achievedSales / exec.monthlyTarget) * 100,
            );
            const isApproved = payoutApproved[exec.id];

            return (
              <div
                key={exec.id}
                className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                {/* Profile info */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <img
                    src={exec.avatar}
                    alt={exec.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {exec.name}
                    </h3>
                    <p className="text-xs text-slate-500">{exec.region}</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {attainment}% Target Attained
                    </span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono w-full lg:w-auto">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase block">
                      Target
                    </span>
                    <span className="font-bold text-slate-700">
                      ₹{exec.monthlyTarget.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase block">
                      Sales Achieved
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{exec.achievedSales.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase block">
                      Net Margin Profit
                    </span>
                    <span className="font-bold text-emerald-600">
                      ₹{netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans uppercase block">
                      Commission
                    </span>
                    <span className="font-black text-[#00AEEF] text-sm block">
                      ₹{incentive.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans block">
                      {breakdownNote}
                    </span>
                  </div>
                </div>

                {/* Payout Action */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => togglePayout(exec.id)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isApproved
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {isApproved ? "Payout Approved" : "Approve Payout"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8.2 Order Attribution Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-900">
            Multi-Channel Sales Attribution Ledger
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            Online • Walk-in POS • B2B Quotations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Assigned Executive</th>
                <th className="p-4">Customer / Institution</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4 text-right">Net Profit</th>
                <th className="p-4 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {attributedOrders.map((ord) => {
                const netProfit =
                  ord.sellingPrice -
                  ord.purchaseCost -
                  ord.shippingCost -
                  ord.additionalExpenses;
                const comm = Math.round(netProfit * 0.1);

                return (
                  <tr
                    key={ord.orderId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-slate-900">
                      <span>{ord.orderId}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {ord.date}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          ord.channel === "B2B"
                            ? "bg-blue-50 text-[#00AEEF] border-blue-200"
                            : ord.channel === "WALK-IN"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {ord.channel}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      {ord.executiveName}
                    </td>
                    <td className="p-4 text-slate-600">{ord.clientName}</td>
                    <td className="p-4 text-right font-mono font-bold text-slate-900">
                      ₹{ord.sellingPrice.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">
                      ₹{netProfit.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono font-black text-[#00AEEF]">
                      ₹{comm.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
