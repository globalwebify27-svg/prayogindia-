"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  TrendingUp,
  Target,
  Percent,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  ShoppingBag,
  Tag,
  Sliders,
  Trophy,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  X,
  CreditCard,
  FileText,
  BarChart3,
  UserCheck,
} from "lucide-react";
import { StaffSessionUser } from "@/lib/staffAuth";

export interface BranchAttributedSale {
  orderId: string;
  date: string;
  timestamp?: number;
  channel: "WALK-IN" | "B2B" | "ONLINE" | string;
  store: string;
  storeCode: string;
  clientName: string;
  executiveName: string;
  sellingPrice: number;
  purchaseCost: number;
  shippingCost: number;
  additionalExpenses: number;
  netProfit: number;
  category: string;
  paidStatus: "Paid" | "Pending";
}

// Store branch definitions and quotas
const STORE_BRANCH_METRICS: Record<string, { name: string; monthlyTarget: number; dailyTarget: number }> = {
  PATNA: { name: "Patna Branch & STEM Center", monthlyTarget: 500000, dailyTarget: 16000 },
  RANCHI: { name: "Ranchi Main Hub & Robotics Center", monthlyTarget: 1200000, dailyTarget: 40000 },
  DELHI: { name: "Delhi NCR Innovation Center", monthlyTarget: 500000, dailyTarget: 16000 },
  MUMBAI: { name: "Mumbai Store", monthlyTarget: 300000, dailyTarget: 10000 },
};

// Roster of executives per store
const STORE_STAFF_ROSTER: Record<string, Array<{ id: string; name: string; role: string; monthlyTarget: number; dailyTarget: number }>> = {
  PATNA: [
    { id: "staff-jay", name: "Jay Prakash", role: "Store Manager & Sales Lead", monthlyTarget: 300000, dailyTarget: 10000 },
    { id: "staff-abhishek-patna", name: "Abhishek Kumar", role: "Senior Branch Sales Executive", monthlyTarget: 200000, dailyTarget: 6000 },
  ],
  RANCHI: [
    { id: "staff-abhishek", name: "Abhishek Kumar", role: "Store Manager & Lead Sales", monthlyTarget: 450000, dailyTarget: 15000 },
    { id: "staff-emraan", name: "Emraan Hassan", role: "Branch Sales Executive", monthlyTarget: 350000, dailyTarget: 12000 },
    { id: "staff-abuzar", name: "Abuzar Ansari", role: "Sales Executive", monthlyTarget: 400000, dailyTarget: 13000 },
  ],
  DELHI: [
    { id: "staff-shahnawaz", name: "Shahnawaz Abbas", role: "Lead Sales Executive", monthlyTarget: 450000, dailyTarget: 15000 },
    { id: "staff-siddharth", name: "Siddharth Varma", role: "Store Manager & NCR Sales", monthlyTarget: 300000, dailyTarget: 10000 },
  ],
  MUMBAI: [
    { id: "staff-abuzar-mum", name: "Abuzar Ansari", role: "Sales Executive", monthlyTarget: 300000, dailyTarget: 10000 },
  ],
};

function getBranchBaselineSales(storeCode: string): BranchAttributedSale[] {
  const now = Date.now();
  const ONE_DAY = 24 * 3600 * 1000;

  if (storeCode === "PATNA") {
    return [
      {
        orderId: "ORD-PATNA-2026-9041",
        date: "Today",
        timestamp: now - 2 * 3600 * 1000,
        channel: "WALK-IN",
        store: "Patna Branch",
        storeCode: "PATNA",
        clientName: "Ramesh Sharma",
        executiveName: "Abhishek Kumar",
        sellingPrice: 13328,
        purchaseCost: 8800,
        shippingCost: 0,
        additionalExpenses: 260,
        netProfit: 4268,
        category: "Arduino Products",
        paidStatus: "Paid",
      },
      {
        orderId: "ORD-PATNA-2026-9042",
        date: "Today",
        timestamp: now - 5 * 3600 * 1000,
        channel: "WALK-IN",
        store: "Patna Branch",
        storeCode: "PATNA",
        clientName: "Prof. Rajesh Sahay",
        executiveName: "Jay Prakash",
        sellingPrice: 6039,
        purchaseCost: 3900,
        shippingCost: 0,
        additionalExpenses: 120,
        netProfit: 2019,
        category: "Arduino Products",
        paidStatus: "Paid",
      },
      {
        orderId: "ORD-PATNA-2026-9044",
        date: "Today",
        timestamp: now - 30 * 60 * 1000,
        channel: "WALK-IN",
        store: "Patna Branch",
        storeCode: "PATNA",
        clientName: "Amitav Sen",
        executiveName: "Abhishek Kumar",
        sellingPrice: 2501,
        purchaseCost: 1600,
        shippingCost: 0,
        additionalExpenses: 50,
        netProfit: 851,
        category: "STEM Kits",
        paidStatus: "Pending",
      },
      {
        orderId: "ORD-PATNA-2026-9043",
        date: "Yesterday",
        timestamp: now - ONE_DAY,
        channel: "WALK-IN",
        store: "Patna Branch",
        storeCode: "PATNA",
        clientName: "Priya Kumari",
        executiveName: "Abhishek Kumar",
        sellingPrice: 3746,
        purchaseCost: 2400,
        shippingCost: 0,
        additionalExpenses: 75,
        netProfit: 1271,
        category: "Arduino Products",
        paidStatus: "Paid",
      },
      {
        orderId: "ORD-PATNA-1061",
        date: "20 Nov 2026",
        timestamp: now - 3 * ONE_DAY,
        channel: "B2B",
        store: "Patna Branch",
        storeCode: "PATNA",
        clientName: "Patna Science College STEM Club",
        executiveName: "Jay Prakash",
        sellingPrice: 45000,
        purchaseCost: 31000,
        shippingCost: 0,
        additionalExpenses: 900,
        netProfit: 13100,
        category: "Arduino Products",
        paidStatus: "Paid",
      },
      {
        orderId: "ORD-PATNA-1075",
        date: "18 Nov 2026",
        timestamp: now - 5 * ONE_DAY,
        channel: "B2B",
        store: "Patna Branch",
        storeCode: "PATNA",
        clientName: "NIT Patna Robotics Lab",
        executiveName: "Jay Prakash",
        sellingPrice: 85000,
        purchaseCost: 58000,
        shippingCost: 0,
        additionalExpenses: 1700,
        netProfit: 25300,
        category: "Drone Products",
        paidStatus: "Paid",
      },
    ];
  }

  // Default Ranchi / Central fallback
  return [
    {
      orderId: "ORD-1054",
      date: "Today",
      timestamp: now - 2 * 3600 * 1000,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "BIT Mesra Robotics Club",
      executiveName: "Abhishek Kumar",
      sellingPrice: 52000,
      purchaseCost: 35000,
      shippingCost: 800,
      additionalExpenses: 1040,
      netProfit: 15160,
      category: "STEM Kits",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1056",
      date: "Today",
      timestamp: now - 4 * 3600 * 1000,
      channel: "WALK-IN",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "Priya Verma",
      executiveName: "Emraan Hassan",
      sellingPrice: 1899,
      purchaseCost: 1250,
      shippingCost: 0,
      additionalExpenses: 38,
      netProfit: 611,
      category: "Sensors & Components",
      paidStatus: "Paid",
    },
  ];
}

export default function StoreIncentivesPage() {
  const [staff, setStaff] = useState<StaffSessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "leaderboard" | "ledger" | "reports">("dashboard");
  const [datePeriod, setDatePeriod] = useState<"TODAY" | "THIS_MONTH" | "LAST_7_DAYS" | "ALL">("THIS_MONTH");
  const [salesLedger, setSalesLedger] = useState<BranchAttributedSale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExecutiveFilter, setSelectedExecutiveFilter] = useState("ALL");

  // Record Sale Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newExecutive, setNewExecutive] = useState("");
  const [newOrderValue, setNewOrderValue] = useState("");
  const [newCategory, setNewCategory] = useState("Arduino Products");
  const [newPaidStatus, setNewPaidStatus] = useState<"Paid" | "Pending">("Paid");
  const [newChannel, setNewChannel] = useState<"WALK-IN" | "B2B">("WALK-IN");

  const storeCode = (staff?.storeCode || "PATNA").toUpperCase();
  const storeInfo = STORE_BRANCH_METRICS[storeCode] || STORE_BRANCH_METRICS.PATNA;
  const storeStaffList = STORE_STAFF_ROSTER[storeCode] || STORE_STAFF_ROSTER.PATNA;

  // 1. Fetch Staff Session & Verify Store Access
  useEffect(() => {
    fetch("/api/staff/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.user) {
          setStaff(data.user);
          const sc = (data.user.storeCode || "PATNA").toUpperCase();
          const roster = STORE_STAFF_ROSTER[sc] || STORE_STAFF_ROSTER.PATNA;
          setNewExecutive(roster[0]?.name || "Jay Prakash");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 2. Load Sales Data strictly for this store
  const loadStoreSales = async () => {
    if (!storeCode) return;
    setLoadingSales(true);
    try {
      let merged: BranchAttributedSale[] = getBranchBaselineSales(storeCode);

      // Fetch live branch orders from API
      try {
        const res = await fetch(`/api/store/orders?storeId=${storeCode}`);
        const data = await res.json();
        const ordersList = data?.data?.items || data?.data;
        if (Array.isArray(ordersList)) {
          ordersList.forEach((ord: any) => {
            const ordCode = (ord.storeCode || ord.storeId || storeCode).toUpperCase();
            if (ordCode !== storeCode) return;

            const oId = ord.orderNumber || ord.id;
            if (!oId) return;

            const exists = merged.some((m) => m.orderId === oId);
            if (!exists) {
              const rawPrice = Number(ord.grandTotal ?? ord.totalAmount ?? ord.total ?? 0);
              const price = isNaN(rawPrice) || rawPrice <= 0 || rawPrice > 1000000 ? 0 : Math.round(rawPrice);
              if (price > 0) {
                merged.unshift({
                  orderId: oId,
                  date: ord.date || "Today",
                  timestamp: ord.createdAt ? new Date(ord.createdAt).getTime() : Date.now(),
                  channel: ord.orderSource || "WALK-IN",
                  store: storeInfo.name,
                  storeCode,
                  clientName: ord.customerName || ord.user?.name || "Walk-in Guest",
                  executiveName: ord.salesExecutive || storeStaffList[0]?.name || "Jay Prakash",
                  sellingPrice: price,
                  purchaseCost: Math.round(price * 0.65),
                  shippingCost: 0,
                  additionalExpenses: Math.round(price * 0.02),
                  netProfit: Math.round(price * 0.33),
                  category: "Arduino Products",
                  paidStatus: ord.isPaid || ord.paymentStatus === "PAID" ? "Paid" : "Pending",
                });
              }
            }
          });
        }
      } catch {}

      // Merge local storage walk-ins for this store
      if (typeof window !== "undefined") {
        ["prayog_placed_orders", "prayog_walkin_orders"].forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsed.forEach((locOrd: any) => {
                  const locStore = (locOrd.storeCode || locOrd.storeId || "").toUpperCase();
                  if (locStore && locStore !== storeCode) return;

                  const oId = locOrd.orderNumber || locOrd.id;
                  if (!oId) return;

                  const exists = merged.some((m) => m.orderId === oId);
                  if (!exists) {
                    const rawPrice = Number(locOrd.totalAmount ?? locOrd.total ?? locOrd.grandTotal ?? 0);
                    const price = isNaN(rawPrice) || rawPrice <= 0 || rawPrice > 1000000 ? 0 : Math.round(rawPrice);
                    if (price > 0) {
                      merged.unshift({
                        orderId: oId,
                        date: "Today",
                        timestamp: locOrd.createdAt ? new Date(locOrd.createdAt).getTime() : Date.now(),
                        channel: locOrd.orderSource || "WALK-IN",
                        store: storeInfo.name,
                        storeCode,
                        clientName: locOrd.customerName || locOrd.user?.name || "Walk-in Guest",
                        executiveName: locOrd.salesExecutive || storeStaffList[0]?.name || "Jay Prakash",
                        sellingPrice: price,
                        purchaseCost: Math.round(price * 0.65),
                        shippingCost: 0,
                        additionalExpenses: Math.round(price * 0.02),
                        netProfit: Math.round(price * 0.33),
                        category: "STEM Kits",
                        paidStatus: locOrd.isPaid || locOrd.paymentStatus === "PAID" ? "Paid" : "Pending",
                      });
                    }
                  }
                });
              }
            }
          } catch {}
        });
      }

      setSalesLedger(merged);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    if (storeCode) {
      loadStoreSales();
    }
  }, [storeCode]);

  // 3. Incentive Calculation Helper: 3% standard branch commission rate
  const getSaleIncentive = (sale: BranchAttributedSale) => {
    let rate = 3.0;
    const cat = (sale.category || "").toLowerCase();
    if (cat.includes("drone")) rate = 5.0;
    else if (cat.includes("arduino")) rate = 3.0;
    else if (cat.includes("stem")) rate = 2.0;

    const amount = Math.round(sale.sellingPrice * (rate / 100));
    return { rate, amount };
  };

  // 4. Date Filtered Sales
  const dateFilteredSales = useMemo(() => {
    if (datePeriod === "ALL") return salesLedger;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const sevenDaysAgo = todayStart - 6 * ONE_DAY_MS;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return salesLedger.filter((sale) => {
      const t = sale.timestamp || new Date(sale.date).getTime();
      if (isNaN(t)) return true;

      if (datePeriod === "TODAY") return t >= todayStart;
      if (datePeriod === "LAST_7_DAYS") return t >= sevenDaysAgo;
      if (datePeriod === "THIS_MONTH") return t >= monthStart;
      return true;
    });
  }, [salesLedger, datePeriod]);

  // 5. Store Metrics Calculation
  const metrics = useMemo(() => {
    let salesTotal = 0;
    let earnedTotal = 0;
    let paidTotal = 0;
    let pendingTotal = 0;

    dateFilteredSales.forEach((s) => {
      salesTotal += s.sellingPrice;
      const { amount } = getSaleIncentive(s);
      earnedTotal += amount;
      if (s.paidStatus === "Paid") {
        paidTotal += amount;
      } else {
        pendingTotal += amount;
      }
    });

    const target = datePeriod === "TODAY" ? storeInfo.dailyTarget : storeInfo.monthlyTarget;
    const achievementPct = target > 0 ? Math.min(999, Math.round((salesTotal / target) * 100)) : 0;

    return {
      salesTotal,
      target,
      achievementPct,
      earnedTotal,
      paidTotal,
      pendingTotal,
      orderCount: dateFilteredSales.length,
    };
  }, [dateFilteredSales, datePeriod, storeInfo]);

  // 6. Branch Executives Rollup
  const branchExecutives = useMemo(() => {
    return storeStaffList.map((staffMember) => {
      const execSales = dateFilteredSales.filter((s) => s.executiveName === staffMember.name);
      const revenue = execSales.reduce((sum, s) => sum + s.sellingPrice, 0);
      const ordersCount = execSales.length;
      const clientsSet = new Set(execSales.map((s) => s.clientName));
      const customersCount = clientsSet.size;

      const earnedIncentive = execSales.reduce((sum, s) => sum + getSaleIncentive(s).amount, 0);
      const paidIncentive = execSales
        .filter((s) => s.paidStatus === "Paid")
        .reduce((sum, s) => sum + getSaleIncentive(s).amount, 0);
      const pendingIncentive = earnedIncentive - paidIncentive;

      const target = datePeriod === "TODAY" ? staffMember.dailyTarget : staffMember.monthlyTarget;
      const achievementPct = target > 0 ? Math.round((revenue / target) * 100) : 0;

      return {
        ...staffMember,
        revenue,
        ordersCount,
        customersCount,
        earnedIncentive,
        paidIncentive,
        pendingIncentive,
        target,
        achievementPct,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [dateFilteredSales, storeStaffList, datePeriod]);

  // 7. Search & Filter for Ledger / Reports
  const filteredSalesForTable = useMemo(() => {
    return dateFilteredSales.filter((s) => {
      if (selectedExecutiveFilter !== "ALL" && s.executiveName !== selectedExecutiveFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.orderId.toLowerCase().includes(q) ||
          s.clientName.toLowerCase().includes(q) ||
          s.executiveName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dateFilteredSales, selectedExecutiveFilter, searchQuery]);

  // Handle Recording New Sale directly from Store Portal
  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newOrderValue);
    if (isNaN(val) || val <= 0 || val > 1000000) return;

    const newSale: BranchAttributedSale = {
      orderId: `ORD-${storeCode}-${Date.now().toString().slice(-4)}`,
      date: "Today",
      timestamp: Date.now(),
      channel: newChannel,
      store: storeInfo.name,
      storeCode,
      clientName: newClientName.trim() || "Walk-in Guest",
      executiveName: newExecutive,
      sellingPrice: Math.round(val),
      purchaseCost: Math.round(val * 0.65),
      shippingCost: 0,
      additionalExpenses: Math.round(val * 0.02),
      netProfit: Math.round(val * 0.33),
      category: newCategory,
      paidStatus: newPaidStatus,
    };

    setSalesLedger((prev) => [newSale, ...prev]);
    setShowRecordModal(false);
    setNewOrderValue("");
    setNewClientName("");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. Page Header (Store Manager Theme) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {storeCode} Branch Operational Portal
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase">
              August 2026 Audit
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {storeCode} Desk Locked
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Leaderboard &amp; Incentives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Track {storeCode} branch sales executives, counter performance, and commission payouts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadStoreSales}
            disabled={loadingSales}
            title="Refresh Branch Sales"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs hover:shadow-xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSales ? "animate-spin text-[#2563EB]" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowRecordModal(true)}
            className="bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Store Sale</span>
          </button>
        </div>
      </div>

      {/* ── 2. Navigation & Period Selector Bar ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "leaderboard", label: "Branch Leaderboard", icon: Trophy },
            { id: "ledger", label: "Order Attribution", icon: ShoppingBag },
            { id: "reports", label: "Payout Reports", icon: FileText },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-xs font-black"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Period Selector (Segmented control) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60 self-start md:self-auto">
          {[
            { id: "TODAY", label: "Today (Daily)" },
            { id: "THIS_MONTH", label: "This Month" },
            { id: "LAST_7_DAYS", label: "7 Days" },
            { id: "ALL", label: "All Time" },
          ].map((p) => {
            const isSelected = datePeriod === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setDatePeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-slate-900 font-black shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content 1: Dashboard Overview ── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Branch KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Sales Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider truncate">
                  {datePeriod === "TODAY" ? "Today's Branch Sales" : `${storeCode} Sales`}
                </span>
                <TrendingUp className="w-4 h-4 text-[#2563EB] shrink-0" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight truncate">
                ₹{metrics.salesTotal.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Across {metrics.orderCount} branch orders
              </p>
            </div>

            {/* Target Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider truncate">
                  Branch Target
                </span>
                <Target className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-mono tracking-tight truncate">
                ₹{metrics.target.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {datePeriod === "TODAY" ? "Daily store benchmark" : "Monthly quota target"}
              </p>
            </div>

            {/* Achievement Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider truncate">
                  Achievement
                </span>
                <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight truncate">
                {metrics.achievementPct}%
              </h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, metrics.achievementPct))}%` }}
                />
              </div>
            </div>

            {/* Commission Earned Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider truncate">
                  Incentives Earned
                </span>
                <Award className="w-4 h-4 text-[#2563EB] shrink-0" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2563EB] font-mono tracking-tight truncate">
                ₹{metrics.earnedTotal.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-emerald-600 font-bold truncate">
                Audited &amp; Calculated
              </p>
            </div>

            {/* Pending Incentive Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider truncate">
                  Pending Clearance
                </span>
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight truncate">
                ₹{metrics.pendingTotal.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Awaiting head office sign-off
              </p>
            </div>
          </div>

          {/* Executive Performance Cards for this Store */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {storeCode} Branch Sales Staff Performance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executive-wise sales, revenue generated, completed orders, and earned incentives for {storeInfo.name}.
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                Branch Total: <span className="text-slate-900 font-extrabold">₹{metrics.salesTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {branchExecutives.map((exec, idx) => (
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
                      Rank #{idx + 1}
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
                        Clients
                      </span>
                      <span className="text-xs font-black text-slate-800 block mt-0.5">
                        {exec.customersCount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Target Quota</span>
                      <span className="font-bold text-slate-800">
                        {exec.achievementPct}% (₹{exec.target.toLocaleString("en-IN")})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, exec.achievementPct))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Incentive Earned:</span>
                    <span className="font-mono font-black text-emerald-600">
                      ₹{exec.earnedIncentive.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payout Tracking Summary */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {storeCode} Branch Commission Pool
              </h2>
              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                August Cycle
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#2563EB] tracking-wider block">
                  Total Commission
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  ₹{metrics.earnedTotal.toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Generated by staff</span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider block">
                  Disbursed (Paid)
                </span>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  ₹{metrics.paidTotal.toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed to accounts
                </span>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider block">
                  Pending Clearance
                </span>
                <div className="text-2xl font-black text-amber-700 font-mono">
                  ₹{metrics.pendingTotal.toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Awaiting approval
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content 2: Branch Leaderboard ── */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {storeCode} Branch Leaderboard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Monthly Sales Ranking for {storeInfo.name}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200/80 px-3 py-1 rounded-full font-bold">
                August 2026 Standings
              </span>
            </div>

            <div className="space-y-3">
              {branchExecutives.map((exec, index) => (
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
                        index === 0
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-slate-100 text-slate-700 border-slate-200"
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
                            Branch Lead
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
                        Clients
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content 3: Order Attribution Ledger ── */}
      {activeTab === "ledger" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {storeCode} Branch Order Attribution
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every sale attributed to branch sales staff for commission tracking.
              </p>
            </div>
          </div>

          {/* Search & Staff Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by ID, client, or sales executive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedExecutiveFilter}
                onChange={(e) => setSelectedExecutiveFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-blue-500"
              >
                <option value="ALL">All Branch Staff</option>
                {storeStaffList.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Sales Executive</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5 text-right">Order Value</th>
                  <th className="p-3.5 text-right">Incentive</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSalesForTable.map((sale) => {
                  const { amount, rate } = getSaleIncentive(sale);
                  return (
                    <tr key={sale.orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {sale.orderId}
                        <span className="text-[10px] text-slate-400 block font-normal">{sale.date}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 block">{sale.clientName}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                          {sale.executiveName}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {sale.channel}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        ₹{sale.sellingPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-emerald-600">
                        ₹{amount.toLocaleString("en-IN")}
                        <span className="text-[9px] text-slate-400 font-sans block">{rate}% rate</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sale.paidStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
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

      {/* ── Tab Content 4: Payout Reports ── */}
      {activeTab === "reports" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {storeCode} Branch Incentive Reports
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed commission statements by sales executive and clearance status.
              </p>
            </div>

            <button
              onClick={() => {
                const csvRows = [
                  ["Order ID", "Date", "Customer", "Executive", "Branch", "Revenue", "Incentive %", "Incentive Amount", "Payout Status"],
                  ...filteredSalesForTable.map((s) => {
                    const { rate, amount } = getSaleIncentive(s);
                    return [s.orderId, s.date, s.clientName, s.executiveName, storeCode, s.sellingPrice, `${rate}%`, amount, s.paidStatus];
                  }),
                ];
                const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `prayog_${storeCode.toLowerCase()}_incentive_report.csv`);
                document.body.appendChild(link);
                link.click();
              }}
              className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="p-3.5">Executive</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Client &amp; Order</th>
                  <th className="p-3.5 text-right">Revenue</th>
                  <th className="p-3.5 text-center">Rate</th>
                  <th className="p-3.5 text-right">Incentive</th>
                  <th className="p-3.5 text-center">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSalesForTable.map((sale) => {
                  const { rate, amount } = getSaleIncentive(sale);
                  return (
                    <tr key={sale.orderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {sale.executiveName}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {sale.date}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 block">{sale.clientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sale.orderId}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        ₹{sale.sellingPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 text-center font-mono font-extrabold text-[#2563EB]">
                        {rate}%
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-emerald-600">
                        ₹{amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sale.paidStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
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

      {/* ── Modal: Record Attributed Sale directly from Store Portal ── */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Record {storeCode} Store Sale
                  </h3>
                  <p className="text-xs text-slate-500">
                    Attribute completed order to a {storeCode} sales executive.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Sales Executive ({storeCode} Branch)
                </label>
                <select
                  value={newExecutive}
                  onChange={(e) => setNewExecutive(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-blue-500"
                >
                  {storeStaffList.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Channel</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-blue-500"
                >
                  <option value="WALK-IN">Store Walk-in / POS Counter</option>
                  <option value="B2B">Local Institutional / B2B Sale</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Client / Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma / Science College"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Order Value (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15000"
                    value={newOrderValue}
                    onChange={(e) => setNewOrderValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-blue-500"
                  >
                    <option value="Arduino Products">Arduino Products (3%)</option>
                    <option value="Drone Products">Drone Products (5%)</option>
                    <option value="STEM Kits">STEM Kits (2%)</option>
                    <option value="Sensors & Components">Sensors & Components (2%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Clearance Status</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="storePaidStatus"
                      checked={newPaidStatus === "Paid"}
                      onChange={() => setNewPaidStatus("Paid")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Paid &amp; Received</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="storePaidStatus"
                      checked={newPaidStatus === "Pending"}
                      onChange={() => setNewPaidStatus("Pending")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Pending Counter Clearance</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold transition-all cursor-pointer shadow-sm"
                >
                  Save &amp; Attribute Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
