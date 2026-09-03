"use client";

import React, { useState } from "react";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Search,
  Building2,
  ShoppingBag,
  Headset,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  FileText,
  Tag,
  Gift,
  BadgeDollarSign,
  Info,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  Store,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  CustomerTypeCode,
  CustomerType,
  CUSTOMER_TYPE_RULES,
  CustomerTypeRule,
} from "@/data/customerTypes";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: CustomerTypeCode;
  companyName?: string;
  gstin?: string;
  storeLocation?: string;
  rewardPoints: number;
  totalOrders: number;
  totalSpend: number;
  openTickets: number;
  communityOptIn: boolean;
  registeredDate: string;
  lastActive: string;
}

const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: "usr-1",
    name: "Dr. Rajesh Vardhan",
    email: "robotics.lab@iitd.ac.in",
    phone: "+91 98765 43210",
    type: "B2B",
    companyName: "IIT Delhi Robotics & AI Lab",
    gstin: "07AAAAI0000A1Z5",
    rewardPoints: 4900,
    totalOrders: 6,
    totalSpend: 245000,
    openTickets: 0,
    communityOptIn: true,
    registeredDate: "15 Jan 2026",
    lastActive: "Today at 02:40 PM",
  },
  {
    id: "usr-2",
    name: "Vikram Singh",
    email: "stem@dpschool.org",
    phone: "+91 98123 45678",
    type: "B2B",
    companyName: "Delhi Public School STEM Wing",
    gstin: "20BBBBB1111B2Z6",
    rewardPoints: 3780,
    totalOrders: 4,
    totalSpend: 189000,
    openTickets: 1,
    communityOptIn: true,
    registeredDate: "02 Feb 2026",
    lastActive: "Yesterday",
  },
  {
    id: "usr-3",
    name: "Ananya Sharma",
    email: "ananya.robotics@gmail.com",
    phone: "+91 97777 66655",
    type: "REGISTERED",
    rewardPoints: 1250,
    totalOrders: 8,
    totalSpend: 28400,
    openTickets: 0,
    communityOptIn: true,
    registeredDate: "18 Feb 2026",
    lastActive: "2 days ago",
  },
  {
    id: "usr-4",
    name: "Rohan Verma",
    email: "rohan.drone@outlook.com",
    phone: "+91 98333 44455",
    type: "B2C",
    rewardPoints: 290,
    totalOrders: 3,
    totalSpend: 14500,
    openTickets: 0,
    communityOptIn: false,
    registeredDate: "10 Mar 2026",
    lastActive: "1 week ago",
  },
  {
    id: "usr-5",
    name: "Amit Kumar (Walk-in Buyer)",
    email: "amit.pos@prayogindia.com",
    phone: "+91 98222 11100",
    type: "WALK_IN",
    storeLocation: "Ranchi Experience Center (TAB-RNC-01)",
    rewardPoints: 340,
    totalOrders: 2,
    totalSpend: 17200,
    openTickets: 0,
    communityOptIn: true,
    registeredDate: "12 Aug 2026",
    lastActive: "Today at 11:15 AM",
  },
  {
    id: "usr-6",
    name: "Neha Gupta (Guest Checkout)",
    email: "neha.guest@gmail.com",
    phone: "+91 98444 33322",
    type: "GUEST",
    rewardPoints: 75, // Escrow
    totalOrders: 1,
    totalSpend: 7500,
    openTickets: 0,
    communityOptIn: false,
    registeredDate: "24 Aug 2026",
    lastActive: "3 days ago",
  },
  {
    id: "usr-7",
    name: "Prof. S. K. Roy",
    email: "skroy@iitb.ac.in",
    phone: "+91 98999 88877",
    type: "REGISTERED",
    companyName: "IIT Bombay Mechatronics",
    rewardPoints: 3200,
    totalOrders: 12,
    totalSpend: 72000,
    openTickets: 0,
    communityOptIn: true,
    registeredDate: "10 Jan 2026",
    lastActive: "Today at 09:30 AM",
  },
  {
    id: "usr-8",
    name: "Rajesh Ranjan (In-Store)",
    email: "rajesh.patna@yahoo.com",
    phone: "+91 98111 22334",
    type: "WALK_IN",
    storeLocation: "Patna Tech Store (TAB-PAT-02)",
    rewardPoints: 180,
    totalOrders: 3,
    totalSpend: 8900,
    openTickets: 0,
    communityOptIn: true,
    registeredDate: "20 Aug 2026",
    lastActive: "Yesterday at 04:20 PM",
  },
];

type FilterType = "ALL" | CustomerTypeCode | "COMMUNITY";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("ALL");
  const [activeRuleModal, setActiveRuleModal] =
    useState<CustomerTypeRule | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.companyName &&
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.storeLocation &&
        c.storeLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedFilter === "ALL") return matchesSearch;
    if (selectedFilter === "COMMUNITY")
      return matchesSearch && c.communityOptIn;
    return matchesSearch && c.type === selectedFilter;
  });

  // Calculate Customer Type Breakdown Reports
  const typeStats = (
    ["B2C", "B2B", "WALK_IN", "REGISTERED", "GUEST"] as CustomerTypeCode[]
  ).map((code) => {
    const records = customers.filter((c) => c.type === code);
    const count = records.length;
    const totalSpend = records.reduce((sum, c) => sum + c.totalSpend, 0);
    const totalOrders = records.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgOrder = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0;
    return {
      code,
      rule: CUSTOMER_TYPE_RULES[code],
      count,
      totalSpend,
      totalOrders,
      avgOrder,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              SECTION 2.2 CUSTOMER TYPES & ATTRIBUTION
            </span>
            <span className="text-xs text-slate-400 font-bold">
              CRM & Classification Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Customer Types, Pricing & Rules Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
            Manage all 5 customer types: B2C, B2B, Walk-in, Registered, and
            Guest with automated attribution for pricing, promotions, invoices,
            reports, and applicable rewards.
          </p>
        </div>

        {/* Action Button: View Rule Attribution */}
        <button
          onClick={() => setActiveRuleModal(CUSTOMER_TYPE_RULES.B2B)}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <Info className="w-4 h-4 text-[#00AEEF]" />
          <span>Customer Rules Matrix</span>
        </button>
      </div>

      {/* 2.2 Customer Types Breakdown & Revenue Reports Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00AEEF]" /> Customer Type
            Segmentation & Channel Performance
          </span>
          <span className="text-xs font-bold text-slate-500">
            Total LTV: ₹
            {customers
              .reduce((sum, c) => sum + c.totalSpend, 0)
              .toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {typeStats.map(
            ({ code, rule, count, totalSpend, totalOrders, avgOrder }) => (
              <div
                key={code}
                onClick={() => setActiveRuleModal(rule)}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs hover:border-[#00AEEF] hover:shadow-md transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${rule.badgeBg} ${rule.badgeColor} ${rule.badgeBorder}`}
                  >
                    {rule.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00AEEF] group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div>
                  <div className="text-xl font-black text-slate-900">
                    ₹{totalSpend.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {count} Accounts • {totalOrders} Orders
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Pricing Rule:</span>
                    <span className="font-bold text-slate-900">
                      {rule.pricing.discountPercent > 0
                        ? `-${rule.pricing.discountPercent}% Tier`
                        : "Retail"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Invoice:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[110px]">
                      {rule.invoice.label.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Rewards:</span>
                    <span className="font-bold text-emerald-600">
                      {rule.rewards.coinsPerHundredRs} Coin/₹100
                    </span>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, company, GSTIN, or store ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-9 text-xs text-slate-800 focus:outline-none focus:border-[#00AEEF]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {(
            [
              "ALL",
              "B2C",
              "B2B",
              "WALK_IN",
              "REGISTERED",
              "GUEST",
            ] as FilterType[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === tab
                  ? "bg-[#00AEEF] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "ALL"
                ? "All Types"
                : tab === "B2C"
                  ? "B2C"
                  : tab === "B2B"
                    ? "B2B"
                    : tab === "WALK_IN"
                      ? "Walk-in"
                      : tab === "REGISTERED"
                        ? "Registered"
                        : "Guest"}
            </button>
          ))}
        </div>
      </div>

      {/* Customer CRM Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Customer Type</th>
                <th className="p-4">Profile & Channel</th>
                <th className="p-4">Applied Rules</th>
                <th className="p-4 text-center">Orders</th>
                <th className="p-4 text-right">Lifetime Spend</th>
                <th className="p-4 text-right">Coins / Rewards</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.map((c) => {
                const rule = CUSTOMER_TYPE_RULES[c.type];

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 space-y-0.5">
                      <span className="font-bold text-slate-900 text-xs block">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {c.email}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {c.phone}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => setActiveRuleModal(rule)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border transition-all hover:scale-105 cursor-pointer flex items-center gap-1 ${rule.badgeBg} ${rule.badgeColor} ${rule.badgeBorder}`}
                      >
                        <span>{rule.name}</span>
                        <Info className="w-2.5 h-2.5 opacity-70" />
                      </button>
                    </td>

                    <td className="p-4 space-y-0.5">
                      {c.companyName ? (
                        <>
                          <span className="font-extrabold text-slate-800 block text-xs">
                            {c.companyName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            GSTIN: {c.gstin}
                          </span>
                        </>
                      ) : c.storeLocation ? (
                        <>
                          <span className="font-extrabold text-slate-800 block text-xs flex items-center gap-1">
                            <Store className="w-3 h-3 text-amber-600" /> POS
                            Walk-in
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {c.storeLocation}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          Online Consumer Portal
                        </span>
                      )}
                    </td>

                    <td className="p-4 space-y-1 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Tag className="w-3 h-3 text-[#00AEEF]" />
                        <span>{rule.pricing.ruleName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <FileText className="w-3 h-3 text-purple-500" />
                        <span className="truncate max-w-[130px]">
                          {rule.invoice.label}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <ShoppingBag className="w-3 h-3 text-[#00AEEF]" />{" "}
                        {c.totalOrders}
                      </span>
                    </td>

                    <td className="p-4 text-right font-mono font-black text-slate-900 text-sm">
                      ₹{c.totalSpend.toLocaleString()}
                    </td>

                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Gift className="w-3 h-3" /> {c.rewardPoints} Coins
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-1.5">
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${c.name}, greetings from Prayog India! How can we assist with your hardware requirements?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors inline-flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                        title="Direct WhatsApp Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Type & Rules Attribution Detail Modal */}
      {activeRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${activeRuleModal.badgeBg} ${activeRuleModal.badgeColor} ${activeRuleModal.badgeBorder}`}
                >
                  {activeRuleModal.name}
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Rule Attribution & Benefits
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specification 2.2 Customer Type Configuration
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveRuleModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {activeRuleModal.description}
              </p>

              {/* 5 Pillars of Attribution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Pricing Rule */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                    <BadgeDollarSign className="w-4 h-4 text-amber-600" />
                    <span>1. Pricing Rule</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {activeRuleModal.pricing.ruleName}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {activeRuleModal.pricing.description}
                  </p>
                  {activeRuleModal.pricing.discountPercent > 0 && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded">
                      {activeRuleModal.pricing.discountPercent}% Applicable Tier
                      Discount
                    </span>
                  )}
                </div>

                {/* 2. Promotions Rule */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>2. Promotions Rule</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {activeRuleModal.promotions.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeRuleModal.promotions.eligibleCoupons.map((code) => (
                      <span
                        key={code}
                        className="bg-white border border-blue-200 text-blue-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Invoice Rule */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>3. Invoices Rule</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {activeRuleModal.invoice.label}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {activeRuleModal.invoice.description}
                  </p>
                </div>

                {/* 4. Applicable Rewards Rule */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <span>4. Applicable Rewards</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {activeRuleModal.rewards.specialPerk}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {activeRuleModal.rewards.description}
                  </p>
                </div>

                {/* 5. Reports & Channel Attribution (Full Width) */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                    <span>5. Reports & Analytics Segmentation</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Attributed channel:{" "}
                    <strong className="text-slate-900">
                      {activeRuleModal.reports.channelAttribution}
                    </strong>{" "}
                    • Segment:{" "}
                    <strong className="text-slate-900">
                      {activeRuleModal.reports.segmentName}
                    </strong>
                    . {activeRuleModal.reports.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveRuleModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Rule Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
