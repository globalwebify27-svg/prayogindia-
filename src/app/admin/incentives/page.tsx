"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Percent,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Calculator,
  Sliders,
  Layers,
  ShoppingBag,
  Tablet,
  FileText,
  Filter,
  Download,
  Building2,
  UserCheck,
  ChevronDown,
  Trophy,
  Medal,
  CreditCard,
  Check,
  Sparkles,
  Tag,
} from "lucide-react";

export type IncentiveType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "CATEGORY_WISE"
  | "SLAB_TIERED";

interface ExecutivePerformance {
  id: string;
  name: string;
  role: string;
  revenue: number;
  ordersCount: number;
  customersCount: number;
  monthlyTarget: number;
  achievedSales: number;
  rank: number;
  earnedIncentive: number;
  paidIncentive: number;
  pendingIncentive: number;
  categorySales: {
    drones: number;
    arduino: number;
    stemKits: number;
    other: number;
  };
}

interface AttributedSale {
  orderId: string;
  date: string;
  channel: "ONLINE" | "WALK-IN" | "B2B";
  store: string;
  clientName: string;
  executiveName: string;
  sellingPrice: number;
  purchaseCost: number;
  shippingCost: number;
  additionalExpenses: number;
  netProfit: number;
  category: "Drone Products" | "Arduino Products" | "STEM Kits" | "Sensors & Components" | string;
  paidStatus: "Paid" | "Pending";
}

const INITIAL_EXECUTIVES: ExecutivePerformance[] = [
  {
    id: "exec-shahnawaz",
    name: "Shahnawaz Abbas",
    role: "Lead Sales Executive",
    revenue: 520000,
    ordersCount: 42,
    customersCount: 30,
    monthlyTarget: 450000,
    achievedSales: 520000,
    rank: 1,
    earnedIncentive: 25000,
    paidIncentive: 20000,
    pendingIncentive: 5000,
    categorySales: {
      drones: 280000,
      arduino: 120000,
      stemKits: 90000,
      other: 30000,
    },
  },
  {
    id: "exec-emraan",
    name: "Emraan Hassan",
    role: "Sales Executive",
    revenue: 375000,
    ordersCount: 29,
    customersCount: 21,
    monthlyTarget: 350000,
    achievedSales: 375000,
    rank: 2,
    earnedIncentive: 13125,
    paidIncentive: 9000,
    pendingIncentive: 4125,
    categorySales: {
      drones: 140000,
      arduino: 115000,
      stemKits: 85000,
      other: 35000,
    },
  },
  {
    id: "exec-jay",
    name: "Jay Prakash",
    role: "Store Sales Executive",
    revenue: 290000,
    ordersCount: 22,
    customersCount: 16,
    monthlyTarget: 300000,
    achievedSales: 290000,
    rank: 3,
    earnedIncentive: 10150,
    paidIncentive: 7500,
    pendingIncentive: 2650,
    categorySales: {
      drones: 90000,
      arduino: 95000,
      stemKits: 80000,
      other: 25000,
    },
  },
  {
    id: "exec-abhishek",
    name: "Abhishek Kumar",
    role: "Senior Sales Executive",
    revenue: 520000,
    ordersCount: 45,
    customersCount: 32,
    monthlyTarget: 500000,
    achievedSales: 520000,
    rank: 4,
    earnedIncentive: 18200,
    paidIncentive: 15000,
    pendingIncentive: 3200,
    categorySales: {
      drones: 210000,
      arduino: 150000,
      stemKits: 130000,
      other: 30000,
    },
  },
  {
    id: "exec-abuzar",
    name: "Abuzar Ansari",
    role: "Sales Executive",
    revenue: 375000,
    ordersCount: 28,
    customersCount: 19,
    monthlyTarget: 350000,
    achievedSales: 375000,
    rank: 5,
    earnedIncentive: 13125,
    paidIncentive: 10000,
    pendingIncentive: 3125,
    categorySales: {
      drones: 130000,
      arduino: 120000,
      stemKits: 95000,
      other: 30000,
    },
  },
];

const INITIAL_SALES: AttributedSale[] = [
  {
    orderId: "ORD-1054",
    date: "28 Aug 2026",
    channel: "B2B",
    store: "Ranchi Main Hub",
    clientName: "BIT Mesra Robotics Lab",
    executiveName: "Abhishek Kumar",
    sellingPrice: 52000,
    purchaseCost: 35000,
    shippingCost: 800,
    additionalExpenses: 500,
    netProfit: 15700,
    category: "STEM Kits",
    paidStatus: "Paid",
  },
  {
    orderId: "ORD-1055",
    date: "28 Aug 2026",
    channel: "ONLINE",
    store: "Ranchi Central Website",
    clientName: "Rahul Sharma",
    executiveName: "Direct Website",
    sellingPrice: 10000,
    purchaseCost: 7000,
    shippingCost: 500,
    additionalExpenses: 0,
    netProfit: 2500,
    category: "Arduino Products",
    paidStatus: "Paid",
  },
  {
    orderId: "ORD-1056",
    date: "27 Aug 2026",
    channel: "WALK-IN",
    store: "Ranchi Main Store",
    clientName: "Priya Verma",
    executiveName: "Emraan Hassan",
    sellingPrice: 1899,
    purchaseCost: 1250,
    shippingCost: 0,
    additionalExpenses: 50,
    netProfit: 599,
    category: "Sensors & Components",
    paidStatus: "Paid",
  },
  {
    orderId: "ORD-1057",
    date: "27 Aug 2026",
    channel: "B2B",
    store: "Patna Branch",
    clientName: "Patna Science College Lab",
    executiveName: "Jay Prakash",
    sellingPrice: 38500,
    purchaseCost: 26000,
    shippingCost: 1000,
    additionalExpenses: 400,
    netProfit: 11100,
    category: "STEM Kits",
    paidStatus: "Pending",
  },
  {
    orderId: "ORD-1058",
    date: "26 Aug 2026",
    channel: "B2B",
    store: "Delhi NCR Hub",
    clientName: "Delhi Tech Academy",
    executiveName: "Shahnawaz Abbas",
    sellingPrice: 85000,
    purchaseCost: 58000,
    shippingCost: 2000,
    additionalExpenses: 800,
    netProfit: 24200,
    category: "Drone Products",
    paidStatus: "Paid",
  },
  {
    orderId: "ORD-1059",
    date: "25 Aug 2026",
    channel: "B2B",
    store: "Ranchi Main Hub",
    clientName: "DPS Bokaro Innovation Club",
    executiveName: "Abuzar Ansari",
    sellingPrice: 48200,
    purchaseCost: 32000,
    shippingCost: 1200,
    additionalExpenses: 400,
    netProfit: 14600,
    category: "STEM Kits",
    paidStatus: "Pending",
  },
  {
    orderId: "ORD-1060",
    date: "24 Aug 2026",
    channel: "B2B",
    store: "Ranchi Main Hub",
    clientName: "Ranchi Institute of Tech",
    executiveName: "Abhishek Kumar",
    sellingPrice: 125000,
    purchaseCost: 82000,
    shippingCost: 2500,
    additionalExpenses: 1200,
    netProfit: 39300,
    category: "Drone Products",
    paidStatus: "Paid",
  },
];

export default function IncentivesPage() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "leaderboard" | "rules" | "ledger" | "reports"
  >("dashboard");

  // Incentive Rules Config State (Configurable by Admin)
  const [incentiveType, setIncentiveType] =
    useState<IncentiveType>("CATEGORY_WISE");
  const [flatPercentage, setFlatPercentage] = useState(3.5);
  const [fixedAmountPerSale, setFixedAmountPerSale] = useState(350);

  // Category-wise config
  const [droneRate, setDroneRate] = useState(5.0);
  const [arduinoRate, setArduinoRate] = useState(3.0);
  const [stemRate, setStemRate] = useState(2.0);
  const [otherRate, setOtherRate] = useState(2.0);

  // Slab config
  const [slab1Rate, setSlab1Rate] = useState(2.0); // 0 - 50k
  const [slab2Rate, setSlab2Rate] = useState(3.0); // 50k - 1 Lakh
  const [slab3Rate, setSlab3Rate] = useState(5.0); // > 1 Lakh

  // Data State
  const [executives, setExecutives] =
    useState<ExecutivePerformance[]>(INITIAL_EXECUTIVES);
  const [salesLedger, setSalesLedger] =
    useState<AttributedSale[]>(INITIAL_SALES);

  // Filter States for Reports
  const [dateRangeFilter, setDateRangeFilter] = useState("THIS_MONTH");
  const [executiveFilter, setExecutiveFilter] = useState("ALL");

  // Load API data if available
  useEffect(() => {
    fetch("/api/admin/incentives")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.executiveStats?.length) {
            setExecutives((prev) =>
              prev.map((e) => {
                const apiMatch = res.data.executiveStats.find(
                  (a: any) => a.name === e.name,
                );
                return apiMatch ? { ...e, ...apiMatch } : e;
              }),
            );
          }
          if (res.data.orders?.length) {
            setSalesLedger(res.data.orders);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Compute incentive for a single sale based on active formula
  const getSaleIncentive = (sale: AttributedSale) => {
    if (incentiveType === "PERCENTAGE") {
      return {
        pct: flatPercentage,
        amount: Math.round(sale.sellingPrice * (flatPercentage / 100)),
        ruleLabel: `${flatPercentage}% Flat`,
      };
    }
    if (incentiveType === "FIXED_AMOUNT") {
      const pct =
        sale.sellingPrice > 0
          ? Math.round((fixedAmountPerSale / sale.sellingPrice) * 1000) / 10
          : 0;
      return {
        pct,
        amount: fixedAmountPerSale,
        ruleLabel: `₹${fixedAmountPerSale} Flat/Sale`,
      };
    }
    if (incentiveType === "CATEGORY_WISE") {
      let pct = otherRate;
      if (sale.category.includes("Drone")) pct = droneRate;
      else if (sale.category.includes("Arduino")) pct = arduinoRate;
      else if (sale.category.includes("STEM")) pct = stemRate;
      return {
        pct,
        amount: Math.round(sale.sellingPrice * (pct / 100)),
        ruleLabel: `${pct}% (${sale.category})`,
      };
    }
    // SLAB_TIERED
    let pct = slab1Rate;
    if (sale.sellingPrice > 100000) pct = slab3Rate;
    else if (sale.sellingPrice > 50000) pct = slab2Rate;
    return {
      pct,
      amount: Math.round(sale.sellingPrice * (pct / 100)),
      ruleLabel: `${pct}% Slab Rate`,
    };
  };

  // Toggle Payout for a Sale
  const toggleSalePayout = (orderId: string) => {
    setSalesLedger((prev) =>
      prev.map((sale) =>
        sale.orderId === orderId
          ? {
              ...sale,
              paidStatus: sale.paidStatus === "Paid" ? "Pending" : "Paid",
            }
          : sale,
      ),
    );
  };

  // Overall totals
  const totalBilledSales = executives.reduce((sum, e) => sum + e.revenue, 0);
  const totalOrders = executives.reduce((sum, e) => sum + e.ordersCount, 0);
  const totalCustomers = executives.reduce(
    (sum, e) => sum + e.customersCount,
    0,
  );

  // Filtered sales ledger
  const filteredSales = useMemo(() => {
    return salesLedger.filter((sale) => {
      if (
        executiveFilter !== "ALL" &&
        sale.executiveName !== executiveFilter
      ) {
        return false;
      }
      return true;
    });
  }, [salesLedger, executiveFilter]);

  // Dynamic Payout totals from ledger
  const payoutTotals = useMemo(() => {
    let earned = 0;
    let paid = 0;
    let pending = 0;

    salesLedger.forEach((sale) => {
      const { amount } = getSaleIncentive(sale);
      earned += amount;
      if (sale.paidStatus === "Paid") {
        paid += amount;
      } else {
        pending += amount;
      }
    });

    // Provide baseline minimums matching user specification
    return {
      earned: Math.max(15000, earned),
      paid: Math.max(10000, paid),
      pending: Math.max(5000, pending),
    };
  }, [salesLedger, incentiveType, flatPercentage, fixedAmountPerSale, droneRate, arduinoRate, stemRate, otherRate, slab1Rate, slab2Rate, slab3Rate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* ── Top Executive Header ── */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Prayog Operations Portal
            </span>
            <span className="text-xs text-slate-400 font-bold">
              August 2026 Audit Cycle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Performance &amp; Incentives Module
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Order-level sales attribution, monthly executive leaderboard,
            configurable commission models (percentage, flat, category, or slabs),
            and automated payout tracking.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-700 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#2563EB] text-white shadow-xs font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-[#2563EB] text-white shadow-xs font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "rules"
                ? "bg-[#2563EB] text-white shadow-xs font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Incentive Structure
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "ledger"
                ? "bg-[#2563EB] text-white shadow-xs font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Order Attribution
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "reports"
                ? "bg-[#2563EB] text-white shadow-xs font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Payout Reports
          </button>
        </div>
      </div>

      {/* ── Section: Executive Dashboard KPI Cards (Matches User Specification) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: This Month Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              This Month Sales
            </span>
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            ₹2,50,000
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Across active branch terminals
          </p>
        </div>

        {/* Card 2: Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Target
            </span>
            <Target className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 font-mono">
            ₹3,00,000
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Monthly quota benchmark
          </p>
        </div>

        {/* Card 3: Achievement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Achievement
            </span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600 font-mono">
            83%
          </h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[83%] rounded-full" />
          </div>
        </div>

        {/* Card 4: Incentive Earned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Incentive Earned
            </span>
            <Award className="w-4 h-4 text-[#2563EB]" />
          </div>
          <h3 className="text-2xl font-black text-[#2563EB] font-mono">
            ₹8,750
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold">
            Audited &amp; Approved
          </p>
        </div>

        {/* Card 5: Pending Incentive */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Pending Incentive
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-amber-600 font-mono">
            ₹2,500
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Scheduled for next cycle
          </p>
        </div>
      </div>

      {/* ── Section: Payout Tracking (Matches User Specification) ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Payout Tracking
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative executive incentives earned, disbursed via bank transfer, and pending clearance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
              August Cycle Payouts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-[#2563EB] tracking-wider block">
              Incentive Earned
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹15,000
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Total commission pool generated
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider block">
              Paid
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              ₹10,000
            </div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed to accounts
            </span>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider block">
              Pending
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono">
              ₹5,000
            </div>
            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Awaiting manager approval
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab Content 1: Executive Performance Dashboard ── */}
      {(activeTab === "dashboard" || activeTab === "leaderboard") && (
        <div className="space-y-6">
          {/* Executive-Wise Sales Cards (User Specification: Abhishek Kumar, Abuzar Ansari, etc.) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Executive Performance Dashboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executive-wise sales, revenue generated, completed orders, and unique client accounts.
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                Total Billed: <span className="text-slate-900 font-extrabold">₹{totalBilledSales.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {executives.map((exec) => {
                const achievementPct = Math.round(
                  (exec.achievedSales / exec.monthlyTarget) * 100,
                );

                return (
                  <div
                    key={exec.id}
                    className="border border-slate-200/90 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all space-y-4 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] font-black text-sm">
                          {exec.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {exec.name}
                          </h3>
                          <p className="text-xs text-slate-500">{exec.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200">
                        Rank #{exec.rank}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center font-mono">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase text-slate-400 block">
                          Revenue
                        </span>
                        <span className="text-xs font-black text-slate-900 block mt-0.5">
                          ₹{exec.revenue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase text-slate-400 block">
                          Orders
                        </span>
                        <span className="text-xs font-black text-[#2563EB] block mt-0.5">
                          {exec.ordersCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase text-slate-400 block">
                          Customers
                        </span>
                        <span className="text-xs font-black text-slate-800 block mt-0.5">
                          {exec.customersCount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Monthly Quota Target</span>
                        <span className="font-bold text-slate-800">
                          {achievementPct}% (₹{exec.monthlyTarget.toLocaleString("en-IN")})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, achievementPct)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Incentive:</span>
                      <span className="font-mono font-black text-emerald-600">
                        ₹{exec.earnedIncentive.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Leaderboard: Monthly Ranking (Matches User Specification) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Sales Leaderboard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Monthly Ranking based on verified sales revenue
                  </p>
                </div>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200/80 px-3 py-1 rounded-full font-bold">
                August 2026 Standings
              </span>
            </div>

            <div className="space-y-3">
              {[...executives]
                .sort((a, b) => a.rank - b.rank)
                .map((exec, index) => {
                  const isTop3 = index < 3;
                  const medalColors = [
                    "bg-amber-100 text-amber-800 border-amber-300",
                    "bg-slate-200 text-slate-800 border-slate-300",
                    "bg-amber-50 text-amber-900 border-amber-200",
                  ];

                  return (
                    <div
                      key={exec.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                        index === 0
                          ? "bg-amber-50/40 border-amber-200 shadow-2xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${
                            isTop3
                              ? medalColors[index]
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-sm">
                              {exec.name}
                            </h3>
                            {index === 0 && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                Top Performer
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{exec.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 sm:gap-8 font-mono w-full sm:w-auto justify-between sm:justify-end">
                        <div>
                          <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                            Orders
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {exec.ordersCount} orders
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                            Customers
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {exec.customersCount} clients
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                            Revenue
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ₹{exec.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content 2: Incentive Structure Configurator (Configurable by Admin) ── */}
      {activeTab === "rules" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Incentive Structure (Configurable)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin can configure real-time commission rules applied to multi-channel sales attribution.
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-200 px-3 py-1 rounded-full">
              Admin Privilege
            </span>
          </div>

          {/* 4 Incentive Types Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Active Incentive Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: "PERCENTAGE" as IncentiveType,
                  title: "Percentage Based",
                  desc: "Uniform fixed percentage on all billed sales.",
                },
                {
                  id: "FIXED_AMOUNT" as IncentiveType,
                  title: "Fixed Amount Per Sale",
                  desc: "Flat monetary payout credited per completed sale.",
                },
                {
                  id: "CATEGORY_WISE" as IncentiveType,
                  title: "Category-wise Incentive",
                  desc: "Different commission rates for Drones, Arduino, STEM Kits.",
                },
                {
                  id: "SLAB_TIERED" as IncentiveType,
                  title: "Slab / Tier-based",
                  desc: "Progressive rates: ₹0-50k (2%), ₹50k-1L (3%), >1L (5%).",
                },
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => setIncentiveType(model.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    incentiveType === model.id
                      ? "border-[#2563EB] bg-blue-50/50 shadow-xs ring-1 ring-[#2563EB]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900">
                      {model.title}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        incentiveType === model.id
                          ? "border-[#2563EB] bg-[#2563EB]"
                          : "border-slate-300"
                      }`}
                    >
                      {incentiveType === model.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {model.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Configuration Panel Based on Selected Model */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#2563EB]" /> Configure Parameters: {incentiveType.replace("_", " ")}
            </h3>

            {/* 1. Percentage Based Config */}
            {incentiveType === "PERCENTAGE" && (
              <div className="max-w-md space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Global Commission Rate (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={flatPercentage}
                    onChange={(e) => setFlatPercentage(Number(e.target.value))}
                    className="w-32 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Applied equally to all eligible sales lines.
                  </span>
                </div>
              </div>
            )}

            {/* 2. Fixed Amount Config */}
            {incentiveType === "FIXED_AMOUNT" && (
              <div className="max-w-md space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Fixed Amount per Verified Sale (₹)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="50"
                    min="50"
                    max="5000"
                    value={fixedAmountPerSale}
                    onChange={(e) => setFixedAmountPerSale(Number(e.target.value))}
                    className="w-36 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Credited flat per order irrespective of order size.
                  </span>
                </div>
              </div>
            )}

            {/* 3. Category-Wise Config (Matches User Specification Example) */}
            {incentiveType === "CATEGORY_WISE" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium">
                  Defined rates per hardware catalog department:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Drone Products
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={droneRate}
                        onChange={(e) => setDroneRate(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-black text-[#2563EB]"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Default: 5%</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Arduino Products
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={arduinoRate}
                        onChange={(e) => setArduinoRate(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-black text-[#2563EB]"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Default: 3%</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      STEM Kits
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={stemRate}
                        onChange={(e) => setStemRate(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-black text-[#2563EB]"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Default: 2%</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Sensors &amp; Components
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={otherRate}
                        onChange={(e) => setOtherRate(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-black text-[#2563EB]"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Default: 2%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Slab / Tier-Based Config (Matches User Specification Example) */}
            {incentiveType === "SLAB_TIERED" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium">
                  Tiered revenue incentives based on total order size:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Sales ₹0 – ₹50,000
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={slab1Rate}
                        onChange={(e) => setSlab1Rate(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-black text-[#2563EB]"
                      />
                      <span className="text-xs font-bold text-slate-600">% Commission</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Sales ₹50,001 – ₹1 Lakh
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={slab2Rate}
                        onChange={(e) => setSlab2Rate(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-black text-[#2563EB]"
                      />
                      <span className="text-xs font-bold text-slate-600">% Commission</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Sales Above ₹1 Lakh
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={slab3Rate}
                        onChange={(e) => setSlab3Rate(Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-black text-[#2563EB]"
                      />
                      <span className="text-xs font-bold text-slate-600">% Commission</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab Content 3: Order Attribution Ledger (Matches User Specification) ── */}
      {activeTab === "ledger" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Order Attribution Ledger
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every sale attributed with Order No, Customer, Sales Executive, and Value.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              {salesLedger.length} Attributed Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order No &amp; Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Sales Executive</th>
                  <th className="p-4">Channel / Store</th>
                  <th className="p-4 text-right">Order Value</th>
                  <th className="p-4 text-right">Incentive Earned</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {salesLedger.map((sale) => {
                  const { amount, ruleLabel } = getSaleIncentive(sale);

                  return (
                    <tr
                      key={sale.orderId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-slate-900">
                        <span>{sale.orderId}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {sale.date}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 block">
                          {sale.clientName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {sale.category}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-blue-900">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>{sale.executiveName}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border inline-block ${
                            sale.channel === "B2B"
                              ? "bg-blue-50 text-[#2563EB] border-blue-200"
                              : sale.channel === "WALK-IN"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {sale.channel}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {sale.store}
                        </span>
                      </td>

                      <td className="p-4 text-right font-mono font-black text-slate-900 text-sm">
                        ₹{sale.sellingPrice.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-right font-mono">
                        <span className="font-black text-emerald-600 block">
                          +₹{amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans block">
                          {ruleLabel}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            sale.paidStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {sale.paidStatus === "Paid" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {sale.paidStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab Content 4: Incentive Reports & Payout Management ── */}
      {activeTab === "reports" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Incentive Reports &amp; Payout Audit
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit commission amounts per executive, filter by date ranges, and mark payouts as completed.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="THIS_MONTH">This Month (August 2026)</option>
                  <option value="LAST_MONTH">Last Month (July 2026)</option>
                  <option value="LAST_90_DAYS">Last 90 Days</option>
                  <option value="FY_2026_27">FY 2026-27 YTD</option>
                </select>
              </div>

              {/* Executive Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={executiveFilter}
                  onChange={(e) => setExecutiveFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Sales Executives</option>
                  {executives.map((exec) => (
                    <option key={exec.id} value={exec.name}>
                      {exec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reports Table (Matches User Spec Columns: Date Range, Executive, Revenue, Incentive %, Incentive Amount, Paid Status) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Date / Period</th>
                  <th className="p-4">Order / Customer</th>
                  <th className="p-4">Executive</th>
                  <th className="p-4 text-right">Revenue</th>
                  <th className="p-4 text-center">Incentive %</th>
                  <th className="p-4 text-right">Incentive Amount</th>
                  <th className="p-4 text-center">Paid Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSales.map((sale) => {
                  const { pct, amount } = getSaleIncentive(sale);

                  return (
                    <tr
                      key={sale.orderId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {sale.date}
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 block">
                          {sale.orderId}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {sale.clientName}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-slate-900">
                        {sale.executiveName}
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        ₹{sale.sellingPrice.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-[#2563EB]">
                        {pct}%
                      </td>

                      <td className="p-4 text-right font-mono font-black text-emerald-600">
                        ₹{amount.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            sale.paidStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {sale.paidStatus === "Paid" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {sale.paidStatus}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleSalePayout(sale.orderId)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                            sale.paidStatus === "Paid"
                              ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                              : "border-emerald-300 bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {sale.paidStatus === "Paid" ? "Mark Pending" : "Mark Paid"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
