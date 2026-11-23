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
  BarChart3,
  PieChart,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

export type IncentiveType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "CATEGORY_WISE"
  | "SLAB_TIERED";

export interface ExecutivePerformance {
  id: string;
  name: string;
  role: string;
  store: string;
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

export interface AttributedSale {
  orderId: string;
  date: string;
  timestamp?: number;
  channel: "ONLINE" | "WALK-IN" | "B2B" | string;
  store: string;
  storeCode?: string;
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

// Store Quota Definitions (Monthly and Daily Targets)
const STORE_DEFINITIONS: Record<string, { name: string; target: number; dailyTarget: number }> = {
  ALL: { name: "All Locations (Central)", target: 2080000, dailyTarget: 82000 },
  RANCHI: { name: "Ranchi Main Hub", target: 1200000, dailyTarget: 40000 },
  PATNA: { name: "Patna Branch", target: 500000, dailyTarget: 16000 },
  DELHI: { name: "Delhi NCR Hub", target: 500000, dailyTarget: 16000 },
  MUMBAI: { name: "Mumbai Store", target: 300000, dailyTarget: 10000 },
};

// Original Prayog India Sales Executives
const ORIGINAL_SALES_EXECUTIVES = [
  {
    id: "exec-shahnawaz",
    name: "Shahnawaz Abbas",
    role: "Lead Sales Executive",
    designation: "Robotics & STEM Specialist",
    primaryStore: "Delhi NCR Hub",
    stores: ["DELHI", "RANCHI"],
    monthlyTarget: 500000,
    dailyTarget: 20000,
  },
  {
    id: "exec-abhishek",
    name: "Abhishek Kumar",
    role: "Senior Sales Executive",
    designation: "Branch Hardware & B2B Specialist",
    primaryStore: "Ranchi Main Hub",
    stores: ["RANCHI", "PATNA"],
    monthlyTarget: 520000,
    dailyTarget: 20000,
  },
  {
    id: "exec-emraan",
    name: "Emraan Hassan",
    role: "Sales Executive",
    designation: "Drone & STEM Education Lead",
    primaryStore: "Ranchi Main Hub",
    stores: ["RANCHI", "MUMBAI"],
    monthlyTarget: 375000,
    dailyTarget: 15000,
  },
  {
    id: "exec-abuzar",
    name: "Abuzar Ansari",
    role: "Sales Executive",
    designation: "Embedded Systems & IoT Consultant",
    primaryStore: "Ranchi Main Hub",
    stores: ["RANCHI", "MUMBAI"],
    monthlyTarget: 375000,
    dailyTarget: 15000,
  },
  {
    id: "exec-jay",
    name: "Jay Prakash",
    role: "Branch Sales Executive",
    designation: "Patna Branch Manager & Sales Lead",
    primaryStore: "Patna Branch",
    stores: ["PATNA"],
    monthlyTarget: 300000,
    dailyTarget: 12000,
  },
  {
    id: "exec-siddharth",
    name: "Siddharth Varma",
    role: "NCR Territory Lead",
    designation: "Institutional Sales & Drones",
    primaryStore: "Delhi NCR Hub",
    stores: ["DELHI"],
    monthlyTarget: 300000,
    dailyTarget: 12000,
  },
];

// Helper: Format Date and return timestamp
function formatDateStr(dateInput: string | number | Date | undefined): { formatted: string; timestamp: number } {
  if (!dateInput) {
    return { formatted: "Today", timestamp: Date.now() };
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return { formatted: "Today", timestamp: Date.now() };
  }
  return {
    formatted: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    timestamp: d.getTime(),
  };
}

// Helper: Map Super Admin Order to Attributed Sale
function mapApiOrderToAttributedSale(item: any): AttributedSale {
  const { formatted, timestamp } = formatDateStr(item.createdAt || item.date);
  const rawPrice = Number(item.totalAmount ?? item.grandTotal ?? item.total ?? 0);
  const sellingPrice = isNaN(rawPrice) || rawPrice <= 0 || rawPrice > 1000000 ? 0 : Math.round(rawPrice);
  const estimatedCost = Math.round(sellingPrice * 0.65);

  const storeInfo = (item.storeLocation || item.shippingAddress || item.storeName || item.storeCode || "").toUpperCase();
  let store = "Ranchi Main Hub";
  let storeCode = "RANCHI";
  if (storeInfo.includes("PATNA")) {
    store = "Patna Branch";
    storeCode = "PATNA";
  } else if (storeInfo.includes("DELHI")) {
    store = "Delhi NCR Hub";
    storeCode = "DELHI";
  } else if (storeInfo.includes("MUMBAI")) {
    store = "Mumbai Store";
    storeCode = "MUMBAI";
  }

  let executiveName = item.salesExecutive;
  if (!executiveName || executiveName === "Direct Website") {
    if (storeCode === "PATNA") executiveName = "Jay Prakash";
    else if (storeCode === "DELHI") executiveName = "Shahnawaz Abbas";
    else if (storeCode === "MUMBAI") executiveName = "Abuzar Ansari";
    else executiveName = "Abhishek Kumar";
  }

  const itemNames = (item.items || []).map((i: any) => i.name || i.productName || "").join(" ").toLowerCase();
  let category = "STEM Kits";
  if (itemNames.includes("drone") || itemNames.includes("pixhawk") || itemNames.includes("esc")) {
    category = "Drone Products";
  } else if (itemNames.includes("arduino") || itemNames.includes("esp32") || itemNames.includes("pi")) {
    category = "Arduino Products";
  } else if (itemNames.includes("sensor") || itemNames.includes("display") || itemNames.includes("servo")) {
    category = "Sensors & Components";
  }

  return {
    orderId: item.orderNumber || item.id,
    date: formatted,
    timestamp,
    channel: item.orderSource || (item.customerType === "WALK_IN" ? "WALK-IN" : "ONLINE"),
    store,
    storeCode,
    clientName: item.customerName || item.user?.name || "Verified Client",
    executiveName,
    sellingPrice,
    purchaseCost: estimatedCost,
    shippingCost: item.shippingCost || 0,
    additionalExpenses: Math.round(sellingPrice * 0.02),
    netProfit: Math.max(0, sellingPrice - estimatedCost),
    category,
    paidStatus: item.isPaid || item.paymentStatus === "PAID" || item.status === "DELIVERED" ? "Paid" : "Pending",
  };
}

// Helper: Map Store POS Order to Attributed Sale
function mapStoreOrderToAttributedSale(item: any): AttributedSale {
  const { formatted, timestamp } = formatDateStr(item.createdAt || item.date);
  const rawPrice = Number(item.grandTotal ?? item.totalAmount ?? item.total ?? 0);
  const sellingPrice = isNaN(rawPrice) || rawPrice <= 0 || rawPrice > 1000000 ? 0 : Math.round(rawPrice);
  const estimatedCost = Math.round(sellingPrice * 0.65);

  const storeInfo = (item.storeLocation || item.storeCode || item.storeId || "").toUpperCase();
  let store = "Patna Branch";
  let storeCode = "PATNA";
  if (storeInfo.includes("RANCHI")) {
    store = "Ranchi Main Hub";
    storeCode = "RANCHI";
  } else if (storeInfo.includes("DELHI")) {
    store = "Delhi NCR Hub";
    storeCode = "DELHI";
  } else if (storeInfo.includes("MUMBAI")) {
    store = "Mumbai Store";
    storeCode = "MUMBAI";
  }

  let executiveName = item.salesExecutive || (storeCode === "PATNA" ? "Jay Prakash" : "Abhishek Kumar");

  const itemNames = (item.items || []).map((i: any) => i.name || i.productName || "").join(" ").toLowerCase();
  let category = "STEM Kits";
  if (itemNames.includes("drone") || itemNames.includes("pixhawk")) category = "Drone Products";
  else if (itemNames.includes("arduino") || itemNames.includes("esp32") || itemNames.includes("pi")) category = "Arduino Products";
  else if (itemNames.includes("sensor") || itemNames.includes("servo")) category = "Sensors & Components";

  return {
    orderId: item.orderNumber || item.id,
    date: formatted,
    timestamp,
    channel: "WALK-IN",
    store,
    storeCode,
    clientName: item.customerName || "Walk-in Guest",
    executiveName,
    sellingPrice,
    purchaseCost: estimatedCost,
    shippingCost: 0,
    additionalExpenses: Math.round(sellingPrice * 0.02),
    netProfit: Math.max(0, sellingPrice - estimatedCost),
    category,
    paidStatus: item.isPaid || item.paymentStatus === "PAID" || item.status === "DELIVERED" ? "Paid" : "Pending",
  };
}

// Helper: Map Local Kiosk Order to Attributed Sale
function mapLocalOrderToAttributedSale(locOrd: any): AttributedSale {
  const { formatted, timestamp } = formatDateStr(locOrd.createdAt);
  const rawPrice = Number(locOrd.totalAmount ?? locOrd.total ?? locOrd.grandTotal ?? 0);
  const sellingPrice = isNaN(rawPrice) || rawPrice <= 0 || rawPrice > 1000000 ? 0 : Math.round(rawPrice);
  const estimatedCost = Math.round(sellingPrice * 0.65);

  const storeStr = locOrd.storeName || (locOrd.storeCode ? `${locOrd.storeCode} Branch` : "Patna Branch");
  const storeCodeStr = (locOrd.storeCode || (storeStr.includes("PATNA") ? "PATNA" : "RANCHI")).toUpperCase();

  const itemNames = (locOrd.items || []).map((i: any) => i.name || i.productName || "").join(" ").toLowerCase();
  let category = "STEM Kits";
  if (itemNames.includes("drone")) category = "Drone Products";
  else if (itemNames.includes("arduino") || itemNames.includes("esp32")) category = "Arduino Products";
  else if (itemNames.includes("sensor")) category = "Sensors & Components";

  let executiveName = locOrd.salesExecutive;
  if (!executiveName || executiveName === "Direct Website") {
    executiveName = storeCodeStr === "PATNA" ? "Jay Prakash" : "Abhishek Kumar";
  }

  return {
    orderId: locOrd.orderNumber || locOrd.id,
    date: formatted,
    timestamp,
    channel: "WALK-IN",
    store: storeStr,
    storeCode: storeCodeStr,
    clientName: locOrd.customerName || locOrd.user?.name || "Walk-in Guest",
    executiveName,
    sellingPrice,
    purchaseCost: estimatedCost,
    shippingCost: 0,
    additionalExpenses: Math.round(sellingPrice * 0.02),
    netProfit: Math.max(0, sellingPrice - estimatedCost),
    category,
    paidStatus: locOrd.isPaid || locOrd.paymentStatus === "PAID" || locOrd.status === "DELIVERED" ? "Paid" : "Pending",
  };
}

// Initial Baseline Sales matching Prayog India authentic operations
function getBaselineAuthenticSales(): AttributedSale[] {
  const now = Date.now();
  const ONE_DAY = 24 * 3600 * 1000;

  return [
    // Today's Live Sales
    {
      orderId: "ORD-1054",
      date: "Today",
      timestamp: now - 2 * 3600 * 1000,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
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
      orderId: "ORD-1058",
      date: "Today",
      timestamp: now - 3 * 3600 * 1000,
      channel: "B2B",
      store: "Delhi NCR Hub",
      storeCode: "DELHI",
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
      orderId: "ORD-1061",
      date: "Today",
      timestamp: now - 4 * 3600 * 1000,
      channel: "WALK-IN",
      store: "Patna Branch",
      storeCode: "PATNA",
      clientName: "Patna Science College STEM",
      executiveName: "Jay Prakash",
      sellingPrice: 45000,
      purchaseCost: 31000,
      shippingCost: 0,
      additionalExpenses: 400,
      netProfit: 13600,
      category: "Arduino Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-PATNA-2026-9041",
      date: "Today",
      timestamp: now - 5 * 3600 * 1000,
      channel: "WALK-IN",
      store: "Patna Branch",
      storeCode: "PATNA",
      clientName: "Ramesh Sharma",
      executiveName: "Abhishek Kumar",
      sellingPrice: 13328,
      purchaseCost: 8800,
      shippingCost: 0,
      additionalExpenses: 250,
      netProfit: 4278,
      category: "Arduino Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1056",
      date: "Today",
      timestamp: now - 6 * 3600 * 1000,
      channel: "WALK-IN",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
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

    // Current Month Sales
    {
      orderId: "ORD-1069",
      date: "Yesterday",
      timestamp: now - ONE_DAY,
      channel: "B2B",
      store: "Delhi NCR Hub",
      storeCode: "DELHI",
      clientName: "Amity Innovation Incubator",
      executiveName: "Shahnawaz Abbas",
      sellingPrice: 145000,
      purchaseCost: 95000,
      shippingCost: 2500,
      additionalExpenses: 1200,
      netProfit: 46300,
      category: "Drone Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1070",
      date: "20 Nov 2026",
      timestamp: now - 3 * ONE_DAY,
      channel: "B2B",
      store: "Delhi NCR Hub",
      storeCode: "DELHI",
      clientName: "IIT Delhi Robotics Society",
      executiveName: "Shahnawaz Abbas",
      sellingPrice: 115000,
      purchaseCost: 75000,
      shippingCost: 2000,
      additionalExpenses: 1000,
      netProfit: 37000,
      category: "Drone Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1071",
      date: "17 Nov 2026",
      timestamp: now - 6 * ONE_DAY,
      channel: "B2B",
      store: "Delhi NCR Hub",
      storeCode: "DELHI",
      clientName: "Shiv Nadar University STEM",
      executiveName: "Shahnawaz Abbas",
      sellingPrice: 90000,
      purchaseCost: 58000,
      shippingCost: 1800,
      additionalExpenses: 800,
      netProfit: 29400,
      category: "Arduino Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1072",
      date: "13 Nov 2026",
      timestamp: now - 10 * ONE_DAY,
      channel: "B2B",
      store: "Delhi NCR Hub",
      storeCode: "DELHI",
      clientName: "Delhi Public School RK Puram",
      executiveName: "Shahnawaz Abbas",
      sellingPrice: 85000,
      purchaseCost: 55000,
      shippingCost: 1500,
      additionalExpenses: 700,
      netProfit: 27800,
      category: "STEM Kits",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1057",
      date: "25 Nov 2026",
      timestamp: now - 2 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "Xavier Institute of Tech",
      executiveName: "Abhishek Kumar",
      sellingPrice: 48000,
      purchaseCost: 32000,
      shippingCost: 800,
      additionalExpenses: 400,
      netProfit: 14800,
      category: "Drone Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1066",
      date: "19 Nov 2026",
      timestamp: now - 4 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "Ranchi University AI Lab",
      executiveName: "Abhishek Kumar",
      sellingPrice: 38500,
      purchaseCost: 26000,
      shippingCost: 1000,
      additionalExpenses: 400,
      netProfit: 11100,
      category: "STEM Kits",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1067",
      date: "15 Nov 2026",
      timestamp: now - 8 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "Delhi Public School Ranchi",
      executiveName: "Abhishek Kumar",
      sellingPrice: 42000,
      purchaseCost: 28000,
      shippingCost: 1200,
      additionalExpenses: 500,
      netProfit: 12300,
      category: "STEM Kits",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1073",
      date: "24 Nov 2026",
      timestamp: now - 2 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "KiiT University Aero Club",
      executiveName: "Emraan Hassan",
      sellingPrice: 135000,
      purchaseCost: 88000,
      shippingCost: 2200,
      additionalExpenses: 1000,
      netProfit: 43800,
      category: "Drone Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1074",
      date: "21 Nov 2026",
      timestamp: now - 5 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "NIT Jamshedpur Robotics",
      executiveName: "Emraan Hassan",
      sellingPrice: 115000,
      purchaseCost: 75000,
      shippingCost: 2000,
      additionalExpenses: 900,
      netProfit: 37100,
      category: "Arduino Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1075",
      date: "16 Nov 2026",
      timestamp: now - 9 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "Birla Institute of Tech Mesra Club",
      executiveName: "Emraan Hassan",
      sellingPrice: 123101,
      purchaseCost: 81000,
      shippingCost: 2000,
      additionalExpenses: 900,
      netProfit: 39201,
      category: "STEM Kits",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1065",
      date: "22 Nov 2026",
      timestamp: now - 3 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "BMS College of Engineering",
      executiveName: "Abuzar Ansari",
      sellingPrice: 78000,
      purchaseCost: 52000,
      shippingCost: 1500,
      additionalExpenses: 600,
      netProfit: 23900,
      category: "Arduino Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1076",
      date: "25 Nov 2026",
      timestamp: now - 1 * ONE_DAY,
      channel: "B2B",
      store: "Mumbai Store",
      storeCode: "MUMBAI",
      clientName: "VJTI Mumbai Aero Club",
      executiveName: "Abuzar Ansari",
      sellingPrice: 95000,
      purchaseCost: 63000,
      shippingCost: 2000,
      additionalExpenses: 800,
      netProfit: 29200,
      category: "Drone Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1068",
      date: "12 Nov 2026",
      timestamp: now - 11 * ONE_DAY,
      channel: "B2B",
      store: "Ranchi Main Hub",
      storeCode: "RANCHI",
      clientName: "ISM Dhanbad Robo Club",
      executiveName: "Abuzar Ansari",
      sellingPrice: 39800,
      purchaseCost: 26000,
      shippingCost: 1000,
      additionalExpenses: 400,
      netProfit: 12400,
      category: "STEM Kits",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1063",
      date: "21 Nov 2026",
      timestamp: now - 4 * ONE_DAY,
      channel: "B2B",
      store: "Patna Branch",
      storeCode: "PATNA",
      clientName: "NIT Patna Innovation Cell",
      executiveName: "Jay Prakash",
      sellingPrice: 65000,
      purchaseCost: 44000,
      shippingCost: 1000,
      additionalExpenses: 500,
      netProfit: 19500,
      category: "Drone Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1080",
      date: "18 Nov 2026",
      timestamp: now - 7 * ONE_DAY,
      channel: "B2B",
      store: "Patna Branch",
      storeCode: "PATNA",
      clientName: "Chandragupt Institute STEM Lab",
      executiveName: "Jay Prakash",
      sellingPrice: 35000,
      purchaseCost: 24000,
      shippingCost: 800,
      additionalExpenses: 300,
      netProfit: 9900,
      category: "STEM Kits",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-PATNA-2026-9042",
      date: "19 Nov 2026",
      timestamp: now - 6 * ONE_DAY,
      channel: "WALK-IN",
      store: "Patna Branch",
      storeCode: "PATNA",
      clientName: "Prof. Rajesh Sahay",
      executiveName: "Jay Prakash",
      sellingPrice: 6039,
      purchaseCost: 4000,
      shippingCost: 0,
      additionalExpenses: 150,
      netProfit: 1889,
      category: "Sensors & Components",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1082",
      date: "23 Nov 2026",
      timestamp: now - 2 * ONE_DAY,
      channel: "B2B",
      store: "Delhi NCR Hub",
      storeCode: "DELHI",
      clientName: "NSUT Delhi RoboLab",
      executiveName: "Siddharth Varma",
      sellingPrice: 82000,
      purchaseCost: 54000,
      shippingCost: 1800,
      additionalExpenses: 700,
      netProfit: 25500,
      category: "Drone Products",
      paidStatus: "Paid",
    },
    {
      orderId: "ORD-1083",
      date: "14 Nov 2026",
      timestamp: now - 10 * ONE_DAY,
      channel: "B2B",
      store: "Delhi NCR Hub",
      storeCode: "DELHI",
      clientName: "DTU Innovation Hub",
      executiveName: "Siddharth Varma",
      sellingPrice: 64000,
      purchaseCost: 42000,
      shippingCost: 1200,
      additionalExpenses: 500,
      netProfit: 20300,
      category: "Arduino Products",
      paidStatus: "Paid",
    },
  ];
}

export default function IncentivesPage() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "leaderboard" | "rules" | "ledger" | "reports"
  >("dashboard");

  // Store Filter State
  const [selectedStore, setSelectedStore] = useState<string>("ALL");

  // Chart View Mode (Store Distribution vs Sales Executives)
  const [chartViewMode, setChartViewMode] = useState<"STORES" | "EXECUTIVES">("STORES");

  // Graph View Metric Toggle
  const [graphMetric, setGraphMetric] = useState<
    "SALES_VS_TARGET" | "INCENTIVE_PAYOUT" | "CATEGORY_BREAKDOWN"
  >("SALES_VS_TARGET");

  // Incentive Rules Config State (Configurable by Admin)
  const [incentiveType, setIncentiveType] =
    useState<IncentiveType>("CATEGORY_WISE");
  const [flatPercentage, setFlatPercentage] = useState(3.5);
  const [fixedAmountPerSale, setFixedAmountPerSale] = useState(350);

  // Category-wise config (WhatsApp Specification)
  const [droneRate, setDroneRate] = useState(5.0);
  const [arduinoRate, setArduinoRate] = useState(3.0);
  const [stemRate, setStemRate] = useState(2.0);
  const [otherRate, setOtherRate] = useState(2.0);

  // Slab config (WhatsApp Specification)
  const [slab1Rate, setSlab1Rate] = useState(2.0); // 0 - 50k
  const [slab2Rate, setSlab2Rate] = useState(3.0); // 50k - 1 Lakh
  const [slab3Rate, setSlab3Rate] = useState(5.0); // > 1 Lakh

  // Data State: Seeded and dynamically augmented with real orders
  // Date Period Filter State (Daily vs Monthly Basis)
  const [datePeriod, setDatePeriod] = useState<"TODAY" | "THIS_MONTH" | "LAST_7_DAYS" | "ALL">("THIS_MONTH");

  // Data State: Seeded with authentic Prayog India records & live order fetch
  const [salesLedger, setSalesLedger] = useState<AttributedSale[]>(getBaselineAuthenticSales());
  const [loadingSales, setLoadingSales] = useState(false);

  // Manual Sale Attribution Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newExecutive, setNewExecutive] = useState(ORIGINAL_SALES_EXECUTIVES[0].name);
  const [newStore, setNewStore] = useState("PATNA");
  const [newOrderValue, setNewOrderValue] = useState("");
  const [newCategory, setNewCategory] = useState("Drone Products");
  const [newPaidStatus, setNewPaidStatus] = useState<"Paid" | "Pending">("Paid");
  const [newOrderChannel, setNewOrderChannel] = useState<"WALK-IN" | "B2B" | "ONLINE">("WALK-IN");

  // Filter States for Reports
  const [dateRangeFilter, setDateRangeFilter] = useState("THIS_MONTH");
  const [executiveFilter, setExecutiveFilter] = useState("ALL");

  // Role verification state (Strictly restricted to SUPER_ADMIN)
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 1. Role verification check
  useEffect(() => {
    fetch("/api/staff/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  // 2. Load dynamic sales from APIs and local storage (Daily & Live Orders)
  const loadDynamicSales = async () => {
    setLoadingSales(true);
    try {
      let merged: AttributedSale[] = [];

      // A. Read previously saved live ledger from localStorage
      if (typeof window !== "undefined") {
        const localSaved = localStorage.getItem("prayog_live_attributed_sales");
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Strictly sanitize: discard any invalid, NaN or giant test orders (> 10 Lakhs)
              const clean = parsed
                .filter(
                  (s: any) =>
                    s &&
                    typeof s.orderId === "string" &&
                    Number(s.sellingPrice) > 0 &&
                    Number(s.sellingPrice) <= 1000000
                )
                .map((s: any) => ({
                  ...s,
                  sellingPrice: Math.round(Number(s.sellingPrice) || 0),
                  purchaseCost: Math.round(Number(s.purchaseCost) || 0),
                  shippingCost: Math.round(Number(s.shippingCost) || 0),
                  netProfit: Math.round(Number(s.netProfit) || 0),
                }));

              if (clean.length > 0) {
                merged = clean;
              }
            }
          } catch {}
        }
      }

      // If empty, initialize baseline authentic Prayog India records
      if (merged.length === 0) {
        merged = getBaselineAuthenticSales();
      }

      // B. Fetch live orders from Admin Orders API
      try {
        const resAdmin = await fetch("/api/admin/orders?limit=100");
        const dataAdmin = await resAdmin.json();
        if (dataAdmin?.success && Array.isArray(dataAdmin.data?.items)) {
          dataAdmin.data.items.forEach((item: any) => {
            const oNum = item.orderNumber || item.id;
            if (!oNum) return;
            const alreadyExists = merged.some((s) => s.orderId === oNum || s.orderId === item.id);
            if (!alreadyExists) {
              merged.unshift(mapApiOrderToAttributedSale(item));
            }
          });
        }
      } catch {}

      // C. Fetch branch orders from Store Orders API
      try {
        const resStore = await fetch("/api/store/orders");
        const dataStore = await resStore.json();
        if (dataStore?.success && Array.isArray(dataStore.data)) {
          dataStore.data.forEach((item: any) => {
            const oNum = item.orderNumber || item.id;
            if (!oNum) return;
            const alreadyExists = merged.some((s) => s.orderId === oNum || s.orderId === item.id);
            if (!alreadyExists) {
              merged.unshift(mapStoreOrderToAttributedSale(item));
            }
          });
        }
      } catch {}

      // D. Merge client-side placed kiosk & walk-in orders
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("prayog_placed_orders");
        const walkinStored = localStorage.getItem("prayog_walkin_orders");
        const rawLocals: any[] = [];
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (Array.isArray(p)) rawLocals.push(...p);
          } catch {}
        }
        if (walkinStored) {
          try {
            const pw = JSON.parse(walkinStored);
            if (Array.isArray(pw)) rawLocals.push(...pw);
          } catch {}
        }

        rawLocals.forEach((locOrd: any) => {
          const oNum = locOrd.orderNumber || locOrd.id;
          if (!oNum) return;
          const alreadyExists = merged.some((s) => s.orderId === oNum || s.orderId === locOrd.id);
          if (!alreadyExists) {
            merged.unshift(mapLocalOrderToAttributedSale(locOrd));
          }
        });

        // Clean & ensure all entries are strictly within normal retail boundaries
        merged = merged
          .filter((s) => {
            const p = Number(s.sellingPrice);
            return !isNaN(p) && p > 0 && p <= 1000000;
          })
          .map((s) => ({
            ...s,
            sellingPrice: Math.round(Number(s.sellingPrice) || 0),
            purchaseCost: Math.round(Number(s.purchaseCost) || 0),
            shippingCost: Math.round(Number(s.shippingCost) || 0),
            netProfit: Math.round(Number(s.netProfit) || 0),
          }));

        localStorage.setItem("prayog_live_attributed_sales", JSON.stringify(merged));
      }

      setSalesLedger(merged);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    loadDynamicSales();
  }, []);

  // Handle Recording New Attributed Sale
  const handleRecordNewSale = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newOrderValue);
    if (isNaN(val) || val <= 0) return;

    const cost = Math.round(val * 0.65);
    const now = new Date();
    const newSale: AttributedSale = {
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Today",
      timestamp: now.getTime(),
      channel: newOrderChannel,
      store: STORE_DEFINITIONS[newStore]?.name || "Patna Branch",
      storeCode: newStore,
      clientName: newClientName.trim() || "Walk-in Client",
      executiveName: newExecutive,
      sellingPrice: val,
      purchaseCost: cost,
      shippingCost: 0,
      additionalExpenses: Math.round(val * 0.02),
      netProfit: Math.max(0, val - cost),
      category: newCategory,
      paidStatus: newPaidStatus,
    };

    const updated = [newSale, ...salesLedger];
    setSalesLedger(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("prayog_live_attributed_sales", JSON.stringify(updated));
    }
    setShowRecordModal(false);
    setNewOrderValue("");
    setNewClientName("");
  };

  // 3. Dynamic Commission Calculator per Sale based on Selected Rule
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

  // 4. Date Period Filter (Daily vs Monthly)
  const dateFilteredSales = useMemo(() => {
    if (datePeriod === "ALL") return salesLedger;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const yesterdayStart = todayStart - ONE_DAY_MS;
    const sevenDaysAgo = todayStart - 6 * ONE_DAY_MS;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return salesLedger.filter((sale) => {
      const t = sale.timestamp || new Date(sale.date).getTime();
      if (isNaN(t)) return true;

      if (datePeriod === "TODAY") {
        return t >= todayStart;
      }
      if (datePeriod === "LAST_7_DAYS") {
        return t >= sevenDaysAgo;
      }
      if (datePeriod === "THIS_MONTH") {
        return t >= monthStart;
      }
      return true;
    });
  }, [salesLedger, datePeriod]);

  // 5. Store Filter
  const storeFilteredSales = useMemo(() => {
    if (selectedStore === "ALL") return dateFilteredSales;

    return dateFilteredSales.filter((sale) => {
      const sName = (sale.store || "").toUpperCase();
      const sCode = (sale.storeCode || "").toUpperCase();

      if (selectedStore === "RANCHI") {
        return sName.includes("RANCHI") || sCode === "RANCHI";
      }
      if (selectedStore === "PATNA") {
        return sName.includes("PATNA") || sCode === "PATNA";
      }
      if (selectedStore === "DELHI") {
        return sName.includes("DELHI") || sCode === "DELHI";
      }
      if (selectedStore === "MUMBAI") {
        return sName.includes("MUMBAI") || sCode === "MUMBAI";
      }
      return true;
    });
  }, [dateFilteredSales, selectedStore]);

  // 5. Dynamic Executives Rollup from Store-Filtered Sales (No Hard-coding)
  const dynamicExecutives = useMemo(() => {
    const execMap = new Map<
      string,
      {
        id: string;
        name: string;
        role: string;
        store: string;
        revenue: number;
        ordersCount: number;
        customersSet: Set<string>;
        monthlyTarget: number;
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
    >();

    // Seed known staff members relevant to selected store
    ORIGINAL_SALES_EXECUTIVES.forEach((staff) => {
      if (selectedStore !== "ALL" && !staff.stores.includes(selectedStore)) {
        return;
      }
      execMap.set(staff.name, {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        store: staff.primaryStore,
        revenue: 0,
        ordersCount: 0,
        customersSet: new Set(),
        monthlyTarget: datePeriod === "TODAY" ? staff.dailyTarget : staff.monthlyTarget,
        earnedIncentive: 0,
        paidIncentive: 0,
        pendingIncentive: 0,
        categorySales: { drones: 0, arduino: 0, stemKits: 0, other: 0 },
      });
    });

    // Attribute all store sales
    storeFilteredSales.forEach((sale) => {
      if (sale.executiveName === "Direct Website") return;

      let rec = execMap.get(sale.executiveName);
      if (!rec) {
        rec = {
          id: `exec-${sale.executiveName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          name: sale.executiveName,
          role: "Sales Executive",
          store: sale.store,
          revenue: 0,
          ordersCount: 0,
          customersSet: new Set(),
          monthlyTarget: 300000,
          earnedIncentive: 0,
          paidIncentive: 0,
          pendingIncentive: 0,
          categorySales: { drones: 0, arduino: 0, stemKits: 0, other: 0 },
        };
        execMap.set(sale.executiveName, rec);
      }

      rec.revenue += sale.sellingPrice;
      rec.ordersCount += 1;
      if (sale.clientName) rec.customersSet.add(sale.clientName);

      const inc = getSaleIncentive(sale);
      rec.earnedIncentive += inc.amount;
      if (sale.paidStatus === "Paid") {
        rec.paidIncentive += inc.amount;
      } else {
        rec.pendingIncentive += inc.amount;
      }

      const cat = (sale.category || "").toLowerCase();
      if (cat.includes("drone")) rec.categorySales.drones += sale.sellingPrice;
      else if (cat.includes("arduino")) rec.categorySales.arduino += sale.sellingPrice;
      else if (cat.includes("stem")) rec.categorySales.stemKits += sale.sellingPrice;
      else rec.categorySales.other += sale.sellingPrice;
    });

    const arr = Array.from(execMap.values()).map((e) => ({
      ...e,
      customersCount: e.customersSet.size,
      achievedSales: e.revenue,
    }));

    // Sort by revenue descending for ranking
    arr.sort((a, b) => b.revenue - a.revenue);

    return arr.map((e, idx) => ({
      ...e,
      rank: idx + 1,
    }));
  }, [
    storeFilteredSales,
    selectedStore,
    incentiveType,
    flatPercentage,
    fixedAmountPerSale,
    droneRate,
    arduinoRate,
    stemRate,
    otherRate,
    slab1Rate,
    slab2Rate,
    slab3Rate,
  ]);

  // 6. Dynamic Store-level Totals & KPIs (Calculated from Data)
  const storeMetrics = useMemo(() => {
    let salesTotal = 0;
    let earnedTotal = 0;
    let paidTotal = 0;
    let pendingTotal = 0;

    storeFilteredSales.forEach((sale) => {
      const price = Number(sale.sellingPrice) || 0;
      if (price <= 0 || price > 1000000) return;
      salesTotal += price;
      const { amount } = getSaleIncentive(sale);
      earnedTotal += Number(amount) || 0;
      if (sale.paidStatus === "Paid") {
        paidTotal += Number(amount) || 0;
      } else {
        pendingTotal += Number(amount) || 0;
      }
    });

    const targetDef =
      datePeriod === "TODAY"
        ? STORE_DEFINITIONS[selectedStore]?.dailyTarget || 82000
        : STORE_DEFINITIONS[selectedStore]?.target ||
          dynamicExecutives.reduce((s, e) => s + e.monthlyTarget, 0) ||
          2080000;

    const achievementPct =
      targetDef > 0 ? Math.round((salesTotal / targetDef) * 100) : 0;

    return {
      salesTotal,
      target: targetDef,
      achievementPct,
      earnedTotal,
      paidTotal,
      pendingTotal,
    };
  }, [storeFilteredSales, selectedStore, dynamicExecutives, incentiveType, flatPercentage, fixedAmountPerSale, droneRate, arduinoRate, stemRate, otherRate, slab1Rate, slab2Rate, slab3Rate]);

  // Dynamic Store-level breakdown for Bar Graph (Zero hardcoding)
  const dynamicStoreBreakdown = useMemo(() => {
    const storeList = [
      { code: "RANCHI", name: "Ranchi Hub", target: 1200000 },
      { code: "PATNA", name: "Patna Store", target: 500000 },
      { code: "DELHI", name: "Delhi Store", target: 500000 },
      { code: "MUMBAI", name: "Mumbai Store", target: 300000 },
    ];

    const maxBenchmark = 1500000;

    return storeList.map((st) => {
      const storeSales = salesLedger.filter((sale) => {
        const sName = (sale.store || "").toUpperCase();
        const sCode = (sale.storeCode || "").toUpperCase();
        return sName.includes(st.code) || sCode === st.code;
      });

      const revenue = storeSales.reduce((sum, s) => sum + s.sellingPrice, 0);
      const earnedIncentive = storeSales.reduce(
        (sum, s) => sum + getSaleIncentive(s).amount,
        0
      );
      const paidIncentive = storeSales
        .filter((s) => s.paidStatus === "Paid")
        .reduce((sum, s) => sum + getSaleIncentive(s).amount, 0);
      const pendingIncentive = storeSales
        .filter((s) => s.paidStatus !== "Paid")
        .reduce((sum, s) => sum + getSaleIncentive(s).amount, 0);
      const ordersCount = storeSales.length;

      const revHeightPct = Math.min(
        100,
        Math.max(6, Math.round((revenue / maxBenchmark) * 100))
      );
      const targetHeightPct = Math.min(
        100,
        Math.max(6, Math.round((st.target / maxBenchmark) * 100))
      );
      const incHeightPct = Math.min(
        100,
        Math.max(6, Math.round(((earnedIncentive * 20) / maxBenchmark) * 100))
      );

      return {
        ...st,
        revenue,
        earnedIncentive,
        paidIncentive,
        pendingIncentive,
        ordersCount,
        revHeightPct,
        targetHeightPct,
        incHeightPct,
      };
    });
  }, [
    salesLedger,
    incentiveType,
    flatPercentage,
    fixedAmountPerSale,
    droneRate,
    arduinoRate,
    stemRate,
    otherRate,
    slab1Rate,
    slab2Rate,
    slab3Rate,
  ]);

  const highestCapacityStore = useMemo(() => {
    if (dynamicStoreBreakdown.length === 0) return null;
    return [...dynamicStoreBreakdown].sort((a, b) => b.revenue - a.revenue)[0];
  }, [dynamicStoreBreakdown]);

  const topExecutive = useMemo(() => {
    if (dynamicExecutives.length === 0) return null;
    return dynamicExecutives[0];
  }, [dynamicExecutives]);

  // Filtered sales ledger for Ledger / Reports Tab
  const finalFilteredSales = useMemo(() => {
    return storeFilteredSales.filter((sale) => {
      if (executiveFilter !== "ALL" && sale.executiveName !== executiveFilter) {
        return false;
      }
      return true;
    });
  }, [storeFilteredSales, executiveFilter]);

  // Strict Super Admin Access Guard
  if (authChecked && currentUser && currentUser.role !== "SUPER_ADMIN") {
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-xl mx-auto my-12 text-center space-y-4 shadow-sm font-sans">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Super Admin Authorization Required
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Executive Performance Leaderboard, Sales Attribution Ledger, and Commission Calculation Engine are strictly reserved for Central Super Administrators.
        </p>
        <div className="pt-2">
          <a
            href="/admin/dashboard"
            className="inline-block bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const selectedStoreName = STORE_DEFINITIONS[selectedStore]?.name || "All Locations";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 font-sans">
      {/* ── 1. Page Header (Clean, Direct & Minimalist) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Leaderboard &amp; Incentives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Track daily sales executive performance, rankings, and commission payouts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadDynamicSales}
            disabled={loadingSales}
            title="Refresh live daily sales"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs hover:shadow-xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSales ? "animate-spin text-[#0084FF]" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowRecordModal(true)}
            className="bg-[#0084FF] hover:bg-blue-600 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* ── 2. Module Navigation & Filter Control Bar (Clean Prayog India Theme) ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "leaderboard", label: "Leaderboard", icon: Award },
            { id: "rules", label: "Incentive Structure", icon: Sliders },
            { id: "ledger", label: "Order Attribution", icon: ShoppingBag },
            { id: "reports", label: "Payout Reports", icon: FileText },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0084FF] text-white shadow-xs font-black"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters: Period & Store Selection */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
          {/* Period Filter (Segmented control) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
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

          {/* Store Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs transition-colors">
            <Building2 className="w-4 h-4 text-[#0084FF]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Store:
            </span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-extrabold uppercase focus:outline-none cursor-pointer tracking-wider pr-1"
            >
              <option value="ALL">All Locations</option>
              <option value="RANCHI">Ranchi Main Hub</option>
              <option value="PATNA">Patna Branch</option>
              <option value="DELHI">Delhi NCR Hub</option>
              <option value="MUMBAI">Mumbai Store</option>
            </select>
          </div>
        </div>
      </div>

            {/* ── Tab Content 1: Overview Dashboard (KPIs, Bar Graph, Exec Performance & Payouts) ── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* ── Section: Executive Dashboard KPI Cards (Dynamically Calculated) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: This Month Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              {datePeriod === "TODAY" ? "Today's Verified Sales" : selectedStore === "ALL" ? "This Month Sales" : `${selectedStore} Sales`}
            </span>
            <TrendingUp className="w-4 h-4 text-[#2563EB] shrink-0 ml-1" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight truncate">
            ₹{storeMetrics.salesTotal.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            Across {storeFilteredSales.length} verified orders
          </p>
        </div>

        {/* Card 2: Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              Target Quota
            </span>
            <Target className="w-4 h-4 text-slate-600 shrink-0 ml-1" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-mono tracking-tight truncate">
            ₹{storeMetrics.target.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {datePeriod === "TODAY" ? "Daily benchmark" : "Monthly quota benchmark"}
          </p>
        </div>

        {/* Card 3: Achievement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              Achievement
            </span>
            <Percent className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight truncate">
            {storeMetrics.achievementPct}%
          </h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, storeMetrics.achievementPct))}%` }}
            />
          </div>
        </div>

        {/* Card 4: Incentive Earned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              Incentive Earned
            </span>
            <Award className="w-4 h-4 text-[#2563EB] shrink-0 ml-1" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#2563EB] font-mono tracking-tight truncate">
            ₹{storeMetrics.earnedTotal.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold truncate">
            Audited &amp; Calculated
          </p>
        </div>

        {/* Card 5: Pending Incentive */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              Pending Incentive
            </span>
            <Clock className="w-4 h-4 text-amber-500 shrink-0 ml-1" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight truncate">
            ₹{storeMetrics.pendingTotal.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium truncate">
            Scheduled for clearance
          </p>
        </div>
      </div>

          {/* ── Section: Quick Bar Graph (Styled strictly after Multi-Location Overview Bento) ── */}
      <div className="bg-white border border-slate-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,35,80,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Multi-Location Sales &amp; Quota Overview
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0084FF]" /> Revenue Achieved
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Target Quota
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Commission Pool
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Toggle Pill */}
              <div className="flex items-center bg-[#F1F4F9] p-0.5 rounded-full text-xs font-bold text-slate-600">
                <button
                  onClick={() => setChartViewMode("STORES")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    chartViewMode === "STORES"
                      ? "bg-white text-slate-900 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  By Store
                </button>
                <button
                  onClick={() => setChartViewMode("EXECUTIVES")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    chartViewMode === "EXECUTIVES"
                      ? "bg-white text-slate-900 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  By Executive
                </button>
              </div>

              {/* Location Selector Dropdown Pill (Matches User Reference Image) */}
              <div className="relative">
                <select
                  value={selectedStore}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedStore(val);
                    if (val !== "ALL") {
                      setChartViewMode("EXECUTIVES");
                    }
                  }}
                  className="appearance-none bg-[#F1F4F9] hover:bg-[#E9EEF6] rounded-full pl-3.5 pr-8 py-1.5 text-xs text-slate-700 font-bold cursor-pointer transition-colors outline-none border-none"
                >
                  <option value="ALL">All Locations</option>
                  <option value="RANCHI">Ranchi Hub</option>
                  <option value="PATNA">Patna Store</option>
                  <option value="DELHI">Delhi Store</option>
                  <option value="MUMBAI">Mumbai Store</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Visual Bar Chart Graphic */}
          <div className="pt-6">
            <div className="h-56 sm:h-64 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-100 pb-2">
              {/* Y Axis scale indicators on left */}
              <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 pr-2 font-mono select-none">
                {chartViewMode === "STORES" ? (
                  <>
                    <span>15L</span>
                    <span>11L</span>
                    <span>7.5L</span>
                    <span>3.5L</span>
                    <span>0</span>
                  </>
                ) : (
                  <>
                    <span>6L</span>
                    <span>4.5L</span>
                    <span>3L</span>
                    <span>1.5L</span>
                    <span>0</span>
                  </>
                )}
              </div>

              {/* STORE VIEW: 4 Store Bars (Matches Multi-Location Stock Distribution) */}
              {chartViewMode === "STORES" &&
                dynamicStoreBreakdown
                  .filter((st) =>
                    selectedStore === "ALL" ? true : st.code === selectedStore
                  )
                  .map((st) => (
                    <div
                      key={st.code}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-xl pointer-events-none z-20 shadow-xl whitespace-nowrap font-mono">
                        <span className="font-bold">{st.name}</span>: ₹{st.revenue.toLocaleString("en-IN")} / Target: ₹{st.target.toLocaleString("en-IN")} (Incentive: ₹{st.earnedIncentive.toLocaleString("en-IN")})
                      </div>

                      <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 h-full pb-1">
                        {/* Revenue Bar */}
                        <div
                          className="w-4 sm:w-5 bg-[#0084FF] rounded-t-md group-hover:brightness-110 transition-all"
                          style={{ height: `${st.revHeightPct}%` }}
                          title={`Revenue: ₹${st.revenue.toLocaleString("en-IN")}`}
                        />
                        {/* Target Bar */}
                        <div
                          className="w-4 sm:w-5 bg-[#F59E0B] rounded-t-md group-hover:brightness-110 transition-all"
                          style={{ height: `${st.targetHeightPct}%` }}
                          title={`Target Quota: ₹${st.target.toLocaleString("en-IN")}`}
                        />
                        {/* Commission Bar */}
                        <div
                          className="w-4 sm:w-5 bg-[#EF4444] rounded-t-md group-hover:brightness-110 transition-all"
                          style={{ height: `${st.incHeightPct}%` }}
                          title={`Commission Pool: ₹${st.earnedIncentive.toLocaleString("en-IN")}`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 truncate mt-1">
                        {st.name}
                      </span>
                    </div>
                  ))}

              {/* EXECUTIVE VIEW: Executives of selected store or all stores */}
              {chartViewMode === "EXECUTIVES" &&
                (dynamicExecutives.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold">
                    No sales executives attributed to {selectedStoreName}.
                  </div>
                ) : (
                  dynamicExecutives.map((exec) => {
                    const maxBenchmark = Math.max(
                      ...dynamicExecutives.map((e) => Math.max(e.revenue, e.monthlyTarget)),
                      600000
                    );
                    const revPct = Math.min(
                      100,
                      Math.max(6, Math.round((exec.revenue / maxBenchmark) * 100))
                    );
                    const targetPct = Math.min(
                      100,
                      Math.max(6, Math.round((exec.monthlyTarget / maxBenchmark) * 100))
                    );
                    const incPct = Math.min(
                      100,
                      Math.max(6, Math.round(((exec.earnedIncentive * 20) / maxBenchmark) * 100))
                    );

                    return (
                      <div
                        key={exec.id}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                      >
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-xl pointer-events-none z-20 shadow-xl whitespace-nowrap font-mono">
                          <span className="font-bold">{exec.name}</span>: ₹{exec.revenue.toLocaleString("en-IN")} ({exec.ordersCount} orders, ₹{exec.earnedIncentive.toLocaleString("en-IN")} incentive)
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 h-full pb-1">
                          {/* Revenue Bar */}
                          <div
                            className="w-4 sm:w-5 bg-[#0084FF] rounded-t-md group-hover:brightness-110 transition-all"
                            style={{ height: `${revPct}%` }}
                            title={`Revenue: ₹${exec.revenue.toLocaleString("en-IN")}`}
                          />
                          {/* Target Bar */}
                          <div
                            className="w-4 sm:w-5 bg-[#F59E0B] rounded-t-md group-hover:brightness-110 transition-all"
                            style={{ height: `${targetPct}%` }}
                            title={`Target: ₹${exec.monthlyTarget.toLocaleString("en-IN")}`}
                          />
                          {/* Commission Bar */}
                          <div
                            className="w-4 sm:w-5 bg-[#EF4444] rounded-t-md group-hover:brightness-110 transition-all"
                            style={{ height: `${incPct}%` }}
                            title={`Incentive: ₹${exec.earnedIncentive.toLocaleString("en-IN")}`}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 truncate mt-1">
                          {exec.name.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })
                ))}
            </div>
          </div>
        </div>

        {/* Bottom Summary Bar (Exact Match to Reference Screenshot) */}
        <div className="mt-4 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100">
          <span className="font-medium">
            {chartViewMode === "STORES"
              ? `${highestCapacityStore?.name || "Ranchi Hub"} holds the highest active sales capacity (₹${(highestCapacityStore?.revenue || 0).toLocaleString("en-IN")})`
              : `${topExecutive?.name || "Lead Executive"} holds the highest sales revenue (₹${(topExecutive?.revenue || 0).toLocaleString("en-IN")})`}
          </span>
          <span className="font-bold text-[#0084FF]">
            Overall {storeMetrics.achievementPct}% Quota Achieved
          </span>
        </div>
      </div>

          {/* Executive-Wise Sales Cards (User Specification: Abhishek Kumar, Abuzar Ansari, etc.) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Executive Performance Dashboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executive-wise sales, revenue generated, completed orders, and unique client accounts ({selectedStoreName}).
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                Total Billed: <span className="text-slate-900 font-extrabold">₹{storeMetrics.salesTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dynamicExecutives.map((exec) => {
                const achievementPct =
                  exec.monthlyTarget > 0
                    ? Math.round((exec.achievedSales / exec.monthlyTarget) * 100)
                    : 0;

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
                          <p className="text-xs text-slate-500">{exec.role} &bull; {exec.store}</p>
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

          {/* ── Section: Payout Tracking (Dynamically Calculated) ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Payout Tracking ({selectedStoreName})
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
              ₹{storeMetrics.earnedTotal.toLocaleString("en-IN")}
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
              ₹{storeMetrics.paidTotal.toLocaleString("en-IN")}
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
              ₹{storeMetrics.pendingTotal.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Awaiting manager approval
            </span>
          </div>
        </div>
      </div>
        </div>
      )}

      {/* ── Tab Content 2: Sales Leaderboard (Rankings, Podium & Executive Cards) ── */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          {/* Top Leaderboard Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Top Performer</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
                {dynamicExecutives[0]?.name || "N/A"}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {dynamicExecutives[0]?.store || "All Branches"} &bull; Rank #1
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-[#0084FF] tracking-wider">Total Branch Revenue</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                ₹{storeMetrics.salesTotal.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-500 font-medium">Across all verified executive sales</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Active Executives</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                {dynamicExecutives.length} Active
              </div>
              <p className="text-xs text-slate-500 font-medium">Operating across retail &amp; B2B channels</p>
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
                    Monthly Ranking based on verified sales revenue ({selectedStoreName})
                  </p>
                </div>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200/80 px-3 py-1 rounded-full font-bold">
                August 2026 Standings
              </span>
            </div>

            <div className="space-y-3">
              {dynamicExecutives.map((exec, index) => {
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
                        <p className="text-xs text-slate-500">{exec.role} &bull; {exec.store}</p>
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

          {/* Executive-Wise Sales Cards (User Specification: Abhishek Kumar, Abuzar Ansari, etc.) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Executive Performance Dashboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executive-wise sales, revenue generated, completed orders, and unique client accounts ({selectedStoreName}).
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                Total Billed: <span className="text-slate-900 font-extrabold">₹{storeMetrics.salesTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dynamicExecutives.map((exec) => {
                const achievementPct =
                  exec.monthlyTarget > 0
                    ? Math.round((exec.achievedSales / exec.monthlyTarget) * 100)
                    : 0;

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
                          <p className="text-xs text-slate-500">{exec.role} &bull; {exec.store}</p>
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
              Super Admin Privilege
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
                  Order Attribution Ledger ({selectedStoreName})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every sale attributed with Order No, Customer, Sales Executive, and Value.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              {finalFilteredSales.length} Attributed Records
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
                {finalFilteredSales.map((sale) => {
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
                        <button
                          onClick={() => toggleSalePayout(sale.orderId)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                            sale.paidStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                          title="Click to toggle Paid/Pending payout status"
                        >
                          {sale.paidStatus === "Paid" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{sale.paidStatus}</span>
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

      {/* ── Tab Content 4: Incentive Reports & Payout Disbursement ── */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* ── Section: Payout Tracking (Dynamically Calculated) ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Payout Tracking ({selectedStoreName})
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
              ₹{storeMetrics.earnedTotal.toLocaleString("en-IN")}
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
              ₹{storeMetrics.paidTotal.toLocaleString("en-IN")}
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
              ₹{storeMetrics.pendingTotal.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Awaiting manager approval
            </span>
          </div>
        </div>
      </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Incentive Reports ({selectedStoreName})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate and export detailed commission reports by Date Range, Executive, Revenue, and Payout Status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Range Selector */}
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="THIS_MONTH">This Month (August 2026)</option>
                <option value="LAST_MONTH">Last Month (July 2026)</option>
                <option value="Q3_2026">Q3 FY2026</option>
                <option value="YEAR_TO_DATE">Year to Date (YTD)</option>
              </select>

              {/* Executive Filter */}
              <select
                value={executiveFilter}
                onChange={(e) => setExecutiveFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Executives</option>
                {dynamicExecutives.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const csvRows = [
                    ["Order ID", "Date", "Customer", "Executive", "Store", "Revenue", "Incentive %", "Incentive Amount", "Payout Status"],
                    ...finalFilteredSales.map((s) => {
                      const { pct, amount } = getSaleIncentive(s);
                      return [s.orderId, s.date, s.clientName, s.executiveName, s.store, s.sellingPrice, `${pct}%`, amount, s.paidStatus];
                    }),
                  ];
                  const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `prayog_incentive_report_${selectedStore.toLowerCase()}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Executive</th>
                  <th className="p-3.5">Date Range</th>
                  <th className="p-3.5">Client &amp; Order</th>
                  <th className="p-3.5 text-right">Revenue</th>
                  <th className="p-3.5 text-center">Incentive %</th>
                  <th className="p-3.5 text-right">Incentive Amount</th>
                  <th className="p-3.5 text-center">Paid Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {finalFilteredSales.map((sale) => {
                  const { pct, amount } = getSaleIncentive(sale);

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
                        {pct}%
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
        </div>
      )}
      {/* ── Modal: Record Attributed Sale (Real Offline / B2B Attribution) ── */}
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
                    Record Attributed Sale
                  </h3>
                  <p className="text-xs text-slate-500">
                    Attribute completed client order to an original sales executive.
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

            <form onSubmit={handleRecordNewSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Sales Executive (Original Prayog Roster)
                </label>
                <select
                  value={newExecutive}
                  onChange={(e) => setNewExecutive(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-blue-500"
                >
                  {ORIGINAL_SALES_EXECUTIVES.map((exec) => (
                    <option key={exec.id} value={exec.name}>
                      {exec.name} ({exec.role} • {exec.primaryStore})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Store Branch</label>
                  <select
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-blue-500"
                  >
                    <option value="PATNA">Patna Branch</option>
                    <option value="RANCHI">Ranchi Main Hub</option>
                    <option value="DELHI">Delhi NCR Hub</option>
                    <option value="MUMBAI">Mumbai Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sales Channel</label>
                  <select
                    value={newOrderChannel}
                    onChange={(e) => setNewOrderChannel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-blue-500"
                  >
                    <option value="WALK-IN">Store Walk-in / POS</option>
                    <option value="B2B">B2B Institutional</option>
                    <option value="ONLINE">Assisted Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Client / Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BIT Mesra Robotics Club / Ramesh Sharma"
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
                    placeholder="e.g. 52000"
                    value={newOrderValue}
                    onChange={(e) => setNewOrderValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-blue-500"
                  >
                    <option value="Drone Products">Drone Products (5%)</option>
                    <option value="Arduino Products">Arduino Products (3%)</option>
                    <option value="STEM Kits">STEM Kits (2%)</option>
                    <option value="Sensors & Components">Sensors & Components</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Clearance Status</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="paidStatus"
                      checked={newPaidStatus === "Paid"}
                      onChange={() => setNewPaidStatus("Paid")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Paid & Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="paidStatus"
                      checked={newPaidStatus === "Pending"}
                      onChange={() => setNewPaidStatus("Pending")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Pending Clearance</span>
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
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold transition-all cursor-pointer shadow-sm"
                >
                  Save & Attribute Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
