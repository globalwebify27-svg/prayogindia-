"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Handshake,
  Users,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Eye,
  Edit3,
  Star,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  GripVertical,
  Trash2,
  Save,
  CheckSquare,
  Square,
  X,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { STORES } from "@/data/storeConfig";

// ────────────────────────────────────────────────────────────────
// TYPES & ENUMS
// ────────────────────────────────────────────────────────────────
export type RelationshipTab = "crm" | "product-intelligence";

export type RelationshipStatus =
  | "LEAD"
  | "PROSPECT"
  | "NEGOTIATION"
  | "ACTIVE_CUSTOMER"
  | "INACTIVE"
  | "LOST"
  | "BLOCKED";

export interface B2BContact {
  id: string;
  name: string;
  designation?: string;
  phone: string;
  email?: string;
  contactType: "PURCHASE" | "ACCOUNTS" | "MANAGEMENT" | "TECHNICAL";
  isPrimary: boolean;
  notes?: string;
}

export interface B2BActivity {
  id: string;
  activityType: string;
  title: string;
  description?: string;
  performedByStaffId?: string;
  createdAt: string;
  contact?: { id: string; name: string; designation?: string };
}

export interface B2BFollowUp {
  id: string;
  dueDate: string;
  reason: string;
  notes?: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "OVERDUE";
  assignedStaff?: { id: string; name: string; role?: string };
  contact?: { id: string; name: string; phone?: string };
}

export interface B2BCompany {
  id: string;
  name: string;
  companyType: string;
  industry?: string;
  gstin?: string;
  website?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: RelationshipStatus;
  rating: number;
  totalBusiness: number;
  outstanding?: number;
  quoteCount?: number;
  orderCount?: number;
  lastOrderDate?: string;
  assignedStoreId?: string;
  store?: { id: string; name: string; code: string; city: string };
  assignedStaff?: { id: string; name: string; role: string };
  contacts?: B2BContact[];
  activities?: B2BActivity[];
  followUps?: B2BFollowUp[];
  _count?: { contacts: number; activities: number; followUps: number };
}

// ────────────────────────────────────────────────────────────────
// SECTION 13 PRODUCT INTELLIGENCE TYPES & HELPERS (Preserved)
// ────────────────────────────────────────────────────────────────
type ProductRelType =
  | "related"
  | "frequentlyBoughtTogether"
  | "recommendedAccessories"
  | "similar"
  | "recentlyViewed"
  | "trending"
  | "bestSellers"
  | "personalized";

type RelationshipMap = Record<string, Record<ProductRelType, string[]>>;

const RELATIONSHIP_CONFIGS: {
  id: ProductRelType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  isAutomatic?: boolean;
  maxItems: number;
}[] = [
  {
    id: "related",
    label: "Related Products",
    description: "Hand-picked companion products shown on product page",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-[#00AEEF]",
    badgeColor: "bg-[#E0F7FC] text-[#00AEEF]",
    maxItems: 6,
  },
  {
    id: "frequentlyBoughtTogether",
    label: "Frequently Bought Together",
    description: "Bundle combo recommendations shown with 1-click add",
    icon: <ShoppingBag className="w-4 h-4" />,
    color: "text-emerald-600",
    badgeColor: "bg-emerald-50 text-emerald-700",
    maxItems: 4,
  },
  {
    id: "recommendedAccessories",
    label: "Recommended Accessories",
    description: "Cables, sensors, power supplies & compatible add-ons",
    icon: <SlidersHorizontal className="w-4 h-4" />,
    color: "text-purple-600",
    badgeColor: "bg-purple-50 text-purple-700",
    maxItems: 8,
  },
  {
    id: "similar",
    label: "Similar Alternatives",
    description: "Direct alternatives in the same spec/price tier",
    icon: <Layers className="w-4 h-4" />,
    color: "text-blue-600",
    badgeColor: "bg-blue-50 text-blue-700",
    maxItems: 6,
  },
];

function buildInitialMap(): RelationshipMap {
  const map: RelationshipMap = {};
  PRODUCTS.forEach((p) => {
    map[p.id] = {
      related: p.relatedProductIds ?? [],
      frequentlyBoughtTogether: p.frequentlyBoughtTogetherIds ?? [],
      recommendedAccessories: p.recommendedAccessoryIds ?? [],
      similar: [],
      recentlyViewed: [],
      trending: [],
      bestSellers: [],
      personalized: [],
    };
  });
  return map;
}

// ────────────────────────────────────────────────────────────────
// MAIN RELATIONSHIPS PAGE COMPONENT
// ────────────────────────────────────────────────────────────────
export default function AdminRelationshipsPage() {
  const [activeTab, setActiveTab] = useState<RelationshipTab>("crm");

  // CRM State
  const [companies, setCompanies] = useState<B2BCompany[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  // Create Company Modal
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    companyType: "Corporate",
    industry: "Education & Research",
    gstin: "",
    website: "",
    email: "",
    phone: "",
    city: "Ranchi",
    state: "Jharkhand",
    assignedStoreId: "ranchi",
    status: "PROSPECT" as RelationshipStatus,
    notes: "",
    primaryContact: {
      name: "",
      designation: "Procurement Manager",
      phone: "",
      email: "",
      contactType: "PURCHASE",
    },
    initialFollowUp: {
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      reason: "Initial introductory call & equipment requirements review",
    },
  });

  // Drawer Action Modals
  const [activeDrawerTab, setActiveDrawerTab] = useState<"overview" | "contacts" | "quotes" | "orders" | "activities" | "followups">("overview");
  const [newContactModal, setNewContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    designation: "",
    phone: "",
    email: "",
    contactType: "PURCHASE",
    isPrimary: false,
  });

  const [newActivityModal, setNewActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activityType: "CALL",
    title: "",
    description: "",
  });

  const [newFollowUpModal, setNewFollowUpModal] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    reason: "",
    notes: "",
  });

  // Product Intelligence State (Preserved)
  const [relationshipMap, setRelationshipMap] = useState<RelationshipMap>(buildInitialMap);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");

  // Fetch Companies & Metrics
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const [compRes, dashRes] = await Promise.all([
        fetch(`/api/admin/crm/companies?status=${statusFilter}&storeId=${storeFilter}&industry=${industryFilter}&search=${encodeURIComponent(searchQuery)}`),
        fetch("/api/admin/crm/dashboard"),
      ]);
      const compData = await compRes.json();
      const dashData = await dashRes.json();

      if (compData.success) setCompanies(compData.data || []);
      if (dashData.success) setDashboardMetrics(dashData.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "crm") {
      fetchCompanies();
    }
  }, [activeTab, statusFilter, storeFilter, industryFilter]);

  // Load Company Profile
  const openCompanyProfile = async (id: string) => {
    setSelectedCompanyId(id);
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/companies/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCompanyProfile(data.data);
      }
    } catch {
      // fallback
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreatingCompany(false);
        fetchCompanies();
        openCompanyProfile(data.data.id);
      } else {
        alert(data.message || "Failed to create company");
      }
    } catch {
      alert("Error creating B2B company");
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    try {
      const res = await fetch(`/api/admin/crm/companies/${selectedCompanyId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) {
        setNewContactModal(false);
        openCompanyProfile(selectedCompanyId);
      } else {
        alert(data.message || "Error adding contact");
      }
    } catch {
      alert("Network error adding contact");
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    try {
      const res = await fetch(`/api/admin/crm/companies/${selectedCompanyId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityForm),
      });
      const data = await res.json();
      if (data.success) {
        setNewActivityModal(false);
        setActivityForm({ activityType: "CALL", title: "", description: "" });
        openCompanyProfile(selectedCompanyId);
      } else {
        alert(data.message || "Error logging activity");
      }
    } catch {
      alert("Network error logging activity");
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    try {
      const res = await fetch(`/api/admin/crm/companies/${selectedCompanyId}/follow-ups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpForm),
      });
      const data = await res.json();
      if (data.success) {
        setNewFollowUpModal(false);
        setFollowUpForm({ dueDate: new Date().toISOString().split("T")[0], reason: "", notes: "" });
        openCompanyProfile(selectedCompanyId);
        fetchCompanies();
      } else {
        alert(data.message || "Error scheduling follow up");
      }
    } catch {
      alert("Network error scheduling follow up");
    }
  };

  const handleMarkFollowUpDone = async (followUpId: string) => {
    try {
      const res = await fetch(`/api/admin/crm/follow-ups/${followUpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await res.json();
      if (data.success && selectedCompanyId) {
        openCompanyProfile(selectedCompanyId);
        fetchCompanies();
      }
    } catch {
      alert("Error marking follow-up completed");
    }
  };

  const handleStatusChange = async (companyId: string, newStatus: RelationshipStatus) => {
    try {
      const res = await fetch(`/api/admin/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
        if (selectedCompanyProfile?.id === companyId) {
          openCompanyProfile(companyId);
        }
      }
    } catch {
      alert("Error updating status");
    }
  };

  const getStatusBadge = (status: RelationshipStatus) => {
    switch (status) {
      case "ACTIVE_CUSTOMER":
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Active Customer</span>;
      case "PROSPECT":
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Prospect</span>;
      case "NEGOTIATION":
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Negotiation</span>;
      case "LEAD":
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">New Lead</span>;
      case "LOST":
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Lost</span>;
      case "BLOCKED":
        return <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Blocked</span>;
      case "INACTIVE":
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="bg-[#0F172A] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              B2B CRM &amp; Relationship Engine
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              Multi-Store Account Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            B2B Relationships &amp; CRM Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage enterprise &amp; institutional accounts, contacts, activity logs, follow-ups, quotes, and lifetime business value.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab("crm")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "crm"
                ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏢 B2B CRM Accounts
          </button>
          <button
            onClick={() => setActiveTab("product-intelligence")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "product-intelligence"
                ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🧩 Product Cross-Selling (Sec 13)
          </button>
        </div>
      </div>

      {activeTab === "crm" ? (
        /* ── B2B CRM VIEW ── */
        <div className="space-y-6">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total B2B Accounts</span>
              <div className="text-2xl font-black text-slate-900">{dashboardMetrics?.totalCompanies || companies.length}</div>
              <div className="text-[11px] text-emerald-600 font-bold">{dashboardMetrics?.activeCustomers || 0} Active Customers</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Sales Pipeline</span>
              <div className="text-2xl font-black text-[#00AEEF]">{dashboardMetrics?.prospects || 0}</div>
              <div className="text-[11px] text-slate-500 font-medium">Leads &amp; Prospects In Negotiation</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Pending Follow-ups</span>
              <div className="text-2xl font-black text-amber-500">{dashboardMetrics?.pendingFollowUps || 0}</div>
              <div className="text-[11px] text-rose-500 font-bold">{dashboardMetrics?.overdueFollowUps || 0} Overdue Action Items</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Monthly Realized Value</span>
              <div className="text-2xl font-black text-purple-600 font-mono">
                ₹{(dashboardMetrics?.monthlySales || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{dashboardMetrics?.monthlyQuotes || 0} New Quotes This Month</div>
            </div>
          </div>

          {/* Search, Filter Bar & New Account Action */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, contact, GST, city..."
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Lifecycle Stages</option>
                <option value="ACTIVE_CUSTOMER">Active Customer</option>
                <option value="PROSPECT">Prospect</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="LEAD">Lead</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LOST">Lost</option>
              </select>

              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Stores</option>
                <option value="ranchi">Ranchi Central Hub</option>
                <option value="patna">Patna Branch</option>
                <option value="delhi">Delhi Experience Center</option>
                <option value="mumbai">Mumbai Hub</option>
              </select>

              <button
                onClick={() => setIsCreatingCompany(true)}
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add B2B Account
              </button>
            </div>
          </div>

          {/* Companies Master Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-slate-900">
                B2B Enterprise &amp; Institutional Accounts ({companies.length})
              </h2>
              <button
                onClick={fetchCompanies}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">Loading B2B accounts...</div>
            ) : companies.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No B2B Accounts Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Get started by adding your first enterprise client, university research lab, or institutional prospect.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {companies.map((comp) => {
                  const primaryContact = comp.contacts?.[0];
                  const nextFollowUp = comp.followUps?.[0];

                  return (
                    <div
                      key={comp.id}
                      onClick={() => openCompanyProfile(comp.id)}
                      className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 truncate">{comp.name}</span>
                          {getStatusBadge(comp.status)}
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {comp.companyType}
                          </span>
                          {comp.store && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              • Store: <strong>{comp.store.name}</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          {primaryContact && (
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {primaryContact.name} ({primaryContact.designation || "Contact"})
                            </span>
                          )}
                          {comp.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {comp.phone}
                            </span>
                          )}
                          {comp.city && (
                            <span>📍 {comp.city}, {comp.state}</span>
                          )}
                        </div>

                        {nextFollowUp && (
                          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>Follow-up: <strong>{new Date(nextFollowUp.dueDate).toLocaleDateString("en-IN")}</strong> — {nextFollowUp.reason}</span>
                          </div>
                        )}
                      </div>

                      {/* Right metrics */}
                      <div className="flex items-center gap-6 self-end md:self-auto shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Business</div>
                          <div className="text-sm font-black font-mono text-slate-900">
                            ₹{comp.totalBusiness?.toLocaleString("en-IN") || "0"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {comp.orderCount || 0} orders • {comp.quoteCount || 0} quotes
                          </div>
                        </div>

                        <button className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-[#00AEEF] hover:text-white flex items-center justify-center transition-all cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── COMPANY CRM PROFILE SLIDE-OVER DRAWER ── */}
          {selectedCompanyId && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-end">
              <div
                onClick={() => {
                  setSelectedCompanyId(null);
                  setSelectedCompanyProfile(null);
                }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
              />

              <div className="relative w-full max-w-3xl bg-white h-full min-h-screen shadow-2xl border-l border-slate-200 p-6 sm:p-8 z-10 overflow-y-auto space-y-6">
                {profileLoading || !selectedCompanyProfile ? (
                  <div className="p-12 text-center text-xs font-bold text-slate-400">Loading company profile...</div>
                ) : (
                  <>
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {selectedCompanyProfile.companyType}
                          </span>
                          {getStatusBadge(selectedCompanyProfile.status)}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">{selectedCompanyProfile.name}</h2>
                        <p className="text-xs text-slate-500">
                          {selectedCompanyProfile.industry || "General Institutional Partner"} • Serviced by {selectedCompanyProfile.store?.name || "Ranchi Central Hub"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCompanyId(null);
                          setSelectedCompanyProfile(null);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Quick Status Bar */}
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Relationship Status:</span>
                        <select
                          value={selectedCompanyProfile.status}
                          onChange={(e) => handleStatusChange(selectedCompanyProfile.id, e.target.value as RelationshipStatus)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1 font-bold text-slate-800"
                        >
                          <option value="LEAD">Lead</option>
                          <option value="PROSPECT">Prospect</option>
                          <option value="NEGOTIATION">Negotiation</option>
                          <option value="ACTIVE_CUSTOMER">Active Customer</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="LOST">Lost</option>
                          <option value="BLOCKED">Blocked</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setNewActivityModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          + Log Activity
                        </button>
                        <button
                          onClick={() => setNewFollowUpModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-[#00AEEF] text-white text-[11px] font-bold hover:bg-[#0096D6] cursor-pointer"
                        >
                          + Follow-up
                        </button>
                      </div>
                    </div>

                    {/* CRM Profile Sub-tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
                      {[
                        { id: "overview", label: "Overview & Stats" },
                        { id: "contacts", label: `Contacts (${selectedCompanyProfile.contacts?.length || 0})` },
                        { id: "quotes", label: `Quotes (${selectedCompanyProfile.quotations?.length || 0})` },
                        { id: "orders", label: `Orders (${selectedCompanyProfile.orders?.length || 0})` },
                        { id: "activities", label: `Timeline (${selectedCompanyProfile.activities?.length || 0})` },
                        { id: "followups", label: `Follow-ups (${selectedCompanyProfile.followUps?.length || 0})` },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveDrawerTab(t.id as any)}
                          className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                            activeDrawerTab === t.id
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* SUBTAB: OVERVIEW */}
                    {activeDrawerTab === "overview" && (
                      <div className="space-y-6">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black">Lifetime Revenue</span>
                            <div className="text-lg font-black font-mono text-slate-900 mt-1">
                              ₹{selectedCompanyProfile.metrics?.totalBusiness?.toLocaleString("en-IN") || "0"}
                            </div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black">Outstanding Due</span>
                            <div className="text-lg font-black font-mono text-rose-600 mt-1">
                              ₹{selectedCompanyProfile.metrics?.outstanding?.toLocaleString("en-IN") || "0"}
                            </div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black">Quote Win Rate</span>
                            <div className="text-lg font-black text-emerald-600 mt-1">
                              {selectedCompanyProfile.metrics?.quoteConversionRate || 0}%
                            </div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black">Orders / Quotes</span>
                            <div className="text-lg font-black text-slate-900 mt-1">
                              {selectedCompanyProfile.metrics?.totalOrders || 0} / {selectedCompanyProfile.metrics?.totalQuotes || 0}
                            </div>
                          </div>
                        </div>

                        {/* Account Info Details */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="font-bold text-slate-400 uppercase text-[10px]">Contact &amp; Tax Info</span>
                            <div>Email: <strong>{selectedCompanyProfile.email || "Not Provided"}</strong></div>
                            <div>Phone: <strong>{selectedCompanyProfile.phone || "Not Provided"}</strong></div>
                            {selectedCompanyProfile.gstin && (
                              <div>GSTIN: <strong className="font-mono text-slate-800">{selectedCompanyProfile.gstin}</strong></div>
                            )}
                            {selectedCompanyProfile.website && (
                              <div>Website: <a href={selectedCompanyProfile.website} target="_blank" className="text-[#00AEEF] underline font-bold">{selectedCompanyProfile.website}</a></div>
                            )}
                          </div>

                          <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="font-bold text-slate-400 uppercase text-[10px]">Campus / Delivery Location</span>
                            <p className="text-slate-700 leading-relaxed font-medium">
                              {selectedCompanyProfile.shippingAddress || selectedCompanyProfile.billingAddress || `${selectedCompanyProfile.city || "Ranchi"}, ${selectedCompanyProfile.state || "Jharkhand"}`}
                            </p>
                            <p className="text-slate-400 text-[11px]">Assigned Store: <strong>{selectedCompanyProfile.store?.name || "Ranchi Hub"}</strong></p>
                          </div>
                        </div>

                        {/* Notes */}
                        {selectedCompanyProfile.notes && (
                          <div className="space-y-1 text-xs">
                            <span className="font-bold text-slate-600 uppercase text-[10px]">Account Notes &amp; Scope:</span>
                            <p className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                              {selectedCompanyProfile.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBTAB: CONTACTS */}
                    {activeDrawerTab === "contacts" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase text-slate-800">Authorized Company Contacts</h3>
                          <button
                            onClick={() => setNewContactModal(true)}
                            className="bg-[#00AEEF] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            + Add Contact
                          </button>
                        </div>

                        <div className="space-y-2">
                          {selectedCompanyProfile.contacts?.map((contact: B2BContact) => (
                            <div key={contact.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">{contact.name}</span>
                                  {contact.isPrimary && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Primary</span>
                                  )}
                                  <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                    {contact.contactType}
                                  </span>
                                </div>
                                <p className="text-slate-500 mt-0.5">{contact.designation || "Contact Person"}</p>
                                <div className="flex items-center gap-3 text-slate-600 mt-1 font-mono text-[11px]">
                                  <span>📞 {contact.phone}</span>
                                  {contact.email && <span>✉️ {contact.email}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUBTAB: QUOTATIONS */}
                    {activeDrawerTab === "quotes" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase text-slate-800">Connected Quotation History</h3>
                          <Link href="/admin/quotations" className="text-xs font-bold text-[#00AEEF] underline">
                            Open Quotations Desk →
                          </Link>
                        </div>

                        {selectedCompanyProfile.quotations?.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400">No quotation history found for this account.</div>
                        ) : (
                          <div className="space-y-2">
                            {selectedCompanyProfile.quotations?.map((q: any) => (
                              <div key={q.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-mono font-bold text-slate-900">{q.quoteNumber}</div>
                                  <div className="text-slate-500">{q.items?.length || 0} hardware items • Issued {new Date(q.createdAt).toLocaleDateString("en-IN")}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-black text-slate-900">₹{q.grandTotal?.toLocaleString("en-IN")}</div>
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">{q.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBTAB: ORDERS */}
                    {activeDrawerTab === "orders" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase text-slate-800">Connected Order Records</h3>
                          <Link href="/admin/orders" className="text-xs font-bold text-[#00AEEF] underline">
                            Open Orders Desk →
                          </Link>
                        </div>

                        {selectedCompanyProfile.orders?.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400">No confirmed orders found yet.</div>
                        ) : (
                          <div className="space-y-2">
                            {selectedCompanyProfile.orders?.map((ord: any) => (
                              <div key={ord.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-mono font-bold text-slate-900">{ord.orderNumber}</div>
                                  <div className="text-slate-500">{ord.items?.length || 0} items • {new Date(ord.createdAt).toLocaleDateString("en-IN")}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-black text-slate-900">₹{ord.totalAmount?.toLocaleString("en-IN")}</div>
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{ord.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBTAB: ACTIVITIES TIMELINE */}
                    {activeDrawerTab === "activities" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase text-slate-800">Activity &amp; Interaction Timeline</h3>
                          <button
                            onClick={() => setNewActivityModal(true)}
                            className="bg-[#00AEEF] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            + Log Call / Note
                          </button>
                        </div>

                        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                          {selectedCompanyProfile.activities?.map((act: B2BActivity) => (
                            <div key={act.id} className="relative space-y-1 text-xs">
                              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#00AEEF] border-2 border-white shadow-xs" />
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{act.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(act.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              {act.description && (
                                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{act.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUBTAB: FOLLOW-UPS */}
                    {activeDrawerTab === "followups" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase text-slate-800">Action Items &amp; Follow-ups</h3>
                          <button
                            onClick={() => setNewFollowUpModal(true)}
                            className="bg-[#00AEEF] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            + Schedule Follow-up
                          </button>
                        </div>

                        <div className="space-y-2">
                          {selectedCompanyProfile.followUps?.map((fu: B2BFollowUp) => (
                            <div key={fu.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{fu.reason}</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${fu.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                    {fu.status}
                                  </span>
                                </div>
                                <div className="text-slate-500 text-[11px]">
                                  Due: <strong>{new Date(fu.dueDate).toLocaleDateString("en-IN")}</strong> • Assigned to: {fu.assignedStaff?.name || "Sales Manager"}
                                </div>
                                {fu.notes && <p className="text-slate-600 italic mt-1">{fu.notes}</p>}
                              </div>

                              {fu.status === "PENDING" && (
                                <button
                                  onClick={() => handleMarkFollowUpDone(fu.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Mark Done ✓
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── CREATE COMPANY MODAL ── */}
          {isCreatingCompany && (
            <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
              <div onClick={() => setIsCreatingCompany(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
              <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-black text-slate-900">Add B2B Account / Lead</h3>
                <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      placeholder="Company / Institution Name *"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <select
                      value={companyForm.companyType}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyType: e.target.value })}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="School">School / ATL Lab</option>
                      <option value="College">College / Polytechnic</option>
                      <option value="University">University Research Lab</option>
                      <option value="Corporate">Corporate / Enterprise</option>
                      <option value="STEM Lab">STEM / Robotics Lab</option>
                      <option value="Government">Government / Tender</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      placeholder="Phone"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="GSTIN (Optional)"
                      value={companyForm.gstin}
                      onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value.toUpperCase() })}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"
                    />
                    <select
                      value={companyForm.assignedStoreId}
                      onChange={(e) => setCompanyForm({ ...companyForm, assignedStoreId: e.target.value })}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="ranchi">Ranchi Central Hub</option>
                      <option value="patna">Patna Branch</option>
                      <option value="delhi">Delhi Experience Center</option>
                      <option value="mumbai">Mumbai Hub</option>
                    </select>
                  </div>

                  <div className="border border-slate-200 p-3 rounded-2xl space-y-2 bg-slate-50/50">
                    <span className="font-bold text-slate-700">Primary Contact Person</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Contact Name"
                        value={companyForm.primaryContact.name}
                        onChange={(e) => setCompanyForm({
                          ...companyForm,
                          primaryContact: { ...companyForm.primaryContact, name: e.target.value },
                        })}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl"
                      />
                      <input
                        placeholder="Designation"
                        value={companyForm.primaryContact.designation}
                        onChange={(e) => setCompanyForm({
                          ...companyForm,
                          primaryContact: { ...companyForm.primaryContact, designation: e.target.value },
                        })}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCompany(false)}
                      className="px-4 py-2 bg-slate-100 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#00AEEF] text-white rounded-xl font-bold cursor-pointer"
                    >
                      Create B2B Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── ADD CONTACT MODAL ── */}
          {newContactModal && (
            <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
              <div onClick={() => setNewContactModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 space-y-4">
                <h3 className="text-base font-black text-slate-900">Add Company Contact</h3>
                <form onSubmit={handleAddContact} className="space-y-3 text-xs">
                  <input
                    required
                    placeholder="Contact Full Name *"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <input
                    placeholder="Designation (e.g. Purchase Manager)"
                    value={contactForm.designation}
                    onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <input
                    required
                    placeholder="Mobile Phone (+91) *"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <input
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={contactForm.isPrimary}
                      onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                    />
                    <label htmlFor="isPrimary" className="font-medium text-slate-700">Set as primary contact</label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setNewContactModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-[#00AEEF] text-white rounded-xl font-bold cursor-pointer">Save Contact</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── LOG ACTIVITY MODAL ── */}
          {newActivityModal && (
            <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
              <div onClick={() => setNewActivityModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 space-y-4">
                <h3 className="text-base font-black text-slate-900">Log Interaction</h3>
                <form onSubmit={handleLogActivity} className="space-y-3 text-xs">
                  <select
                    value={activityForm.activityType}
                    onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="CALL">📞 Phone Call</option>
                    <option value="MEETING">🤝 In-person / Zoom Meeting</option>
                    <option value="EMAIL">✉️ Email Exchange</option>
                    <option value="NOTE">📝 Internal Note</option>
                  </select>
                  <input
                    required
                    placeholder="Activity Title (e.g. Discussed ATL Lab Grant) *"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                  <textarea
                    rows={3}
                    placeholder="Interaction details, customer expectations, next action..."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setNewActivityModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-[#00AEEF] text-white rounded-xl font-bold cursor-pointer">Save Log</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── SCHEDULE FOLLOW-UP MODAL ── */}
          {newFollowUpModal && (
            <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
              <div onClick={() => setNewFollowUpModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 space-y-4">
                <h3 className="text-base font-black text-slate-900">Schedule CRM Follow-up</h3>
                <form onSubmit={handleScheduleFollowUp} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Due Date *</label>
                    <input
                      required
                      type="date"
                      value={followUpForm.dueDate}
                      onChange={(e) => setFollowUpForm({ ...followUpForm, dueDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <input
                    required
                    placeholder="Follow-up Reason (e.g. Confirm PO approval) *"
                    value={followUpForm.reason}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, reason: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                  <textarea
                    rows={2}
                    placeholder="Preparation notes or agenda..."
                    value={followUpForm.notes}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setNewFollowUpModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-[#00AEEF] text-white rounded-xl font-bold cursor-pointer">Schedule Follow-up</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── SECTION 13: PRODUCT CROSS-SELLING INTELLIGENCE (Preserved) ── */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {RELATIONSHIP_CONFIGS.map((config) => (
              <div key={config.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`${config.color}`}>{config.icon}</span>
                  <span className="text-[10px] font-bold text-slate-400">Max {config.maxItems}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{config.label}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{config.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-900">Select Product to Configure Recommendations</h3>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search catalogue..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PRODUCTS.filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 12).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedProduct?.id === prod.id
                      ? "border-[#00AEEF] bg-[#E0F7FC]/30 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain rounded-lg bg-slate-50" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{prod.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">₹{prod.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
