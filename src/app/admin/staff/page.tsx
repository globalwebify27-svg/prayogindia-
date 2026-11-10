"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Store,
  Tablet,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  RefreshCw,
  X,
  Building2,
  Search,
  Filter,
  Check,
  Copy,
  MapPin,
  Lock,
  Phone,
  Mail,
  UserCheck,
  Sparkles,
  LayoutGrid,
  List,
  Laptop,
} from "lucide-react";
import { INITIAL_STORES } from "@/data/storesData";

export default function AdminStaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>(INITIAL_STORES);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // View Mode: STORE_WISE (grouped by branch) or FLAT (all staff table)
  const [viewMode, setViewMode] = useState<"STORE_WISE" | "FLAT">("STORE_WISE");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null);

  // New staff form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<
    "STORE_MANAGER" | "KIOSK_USER" | "SUPER_ADMIN"
  >("STORE_MANAGER");
  const [storeId, setStoreId] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isSuperAdmin, setIsSuperAdmin] = useState(true);

  const fetchStaffAndStores = async () => {
    setLoading(true);
    try {
      const [staffRes, storeRes] = await Promise.all([
        fetch("/api/admin/staff"),
        fetch("/api/admin/stores"),
      ]);

      const staffData = await staffRes.json();
      const storeData = await storeRes.json();

      if (staffData.success) {
        setStaffList(staffData.data || []);
        setIsSuperAdmin(staffData.isSuperAdmin ?? true);
        if (!staffData.isSuperAdmin) {
          setRole("KIOSK_USER");
        }
      }
      if (storeData.success && storeData.data?.length) {
        setStores(storeData.data);
        setStoreId(storeData.data[0].id || storeData.data[0].code);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndStores();
  }, []);

  const openAddModalForStore = (
    targetStoreId: string,
    defaultRole: "STORE_MANAGER" | "KIOSK_USER" = "STORE_MANAGER",
  ) => {
    setStoreId(targetStoreId);
    setRole(defaultRole);
    setName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setPhone("");
    setFormError("");
    setShowAddModal(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          username: username.trim().toLowerCase(),
          password,
          role,
          storeId: role === "SUPER_ADMIN" ? null : storeId,
          phone: phone.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create staff account.");
        setSubmitting(false);
        return;
      }

      // Reset form & reload
      setShowAddModal(false);
      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setPhone("");
      fetchStaffAndStores();
    } catch {
      setFormError("Network error while provisioning staff user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchStaffAndStores();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke and delete this staff user account?",
      )
    )
      return;
    try {
      await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      fetchStaffAndStores();
    } catch (err) {
      console.error("Failed to delete staff user:", err);
    }
  };

  const copyUsername = (uname: string) => {
    navigator.clipboard.writeText(uname);
    setCopiedUsername(uname);
    setTimeout(() => setCopiedUsername(null), 2000);
  };

  const getInitials = (userName: string) => {
    if (!userName) return "ST";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  // Filtered flat staff for FLAT view
  const filteredStaff = staffList.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      user.name?.toLowerCase().includes(q) ||
      user.username?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.store?.name?.toLowerCase().includes(q) ||
      user.store?.code?.toLowerCase().includes(q);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    const matchesStore =
      storeFilter === "ALL" ||
      user.store?.code === storeFilter ||
      user.store?.id === storeFilter ||
      (!user.store && storeFilter === "GLOBAL");

    return matchesSearch && matchesRole && matchesStore;
  });

  // Stores to display in STORE_WISE view
  const storesToDisplay = stores.filter((st) => {
    if (storeFilter === "ALL") return true;
    if (storeFilter === "GLOBAL") return false;
    return st.code === storeFilter || st.id === storeFilter;
  });

  // Global Super Admins
  const globalSuperAdmins = staffList.filter((u) => {
    if (u.role !== "SUPER_ADMIN" && u.store) return false;
    if (storeFilter !== "ALL" && storeFilter !== "GLOBAL") return false;
    if (roleFilter !== "ALL" && roleFilter !== "SUPER_ADMIN") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const totalStaffCount = staffList.length;
  const storeManagersCount = staffList.filter(
    (u) => u.role === "STORE_MANAGER",
  ).length;
  const kioskUsersCount = staffList.filter(
    (u) => u.role === "KIOSK_USER",
  ).length;
  const activeCount = staffList.filter(
    (u) => (u.status || "ACTIVE") === "ACTIVE",
  ).length;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-5 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-0.5 rounded-full border border-[#00AEEF]/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#005CA9]" />
              Role-Based Access Control (RBAC)
            </span>
            <span className="text-slate-400 text-xs font-semibold">
              Super Admin Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#005CA9]" />
            Staff Management &amp; Store Provisioning
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Store-wise organization of Branch Managers, Kiosks, and authorized POS devices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("STORE_WISE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "STORE_WISE"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#005CA9]" />
              <span>By Store</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("FLAT")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "FLAT"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5 text-slate-500" />
              <span>All Staff</span>
            </button>
          </div>

          <button
            onClick={fetchStaffAndStores}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#005CA9]" : ""}`}
            />
            <span>Sync</span>
          </button>

          <button
            onClick={() => {
              setRole("STORE_MANAGER");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-[#005CA9] hover:bg-[#004b8a] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-[#005CA9]/20 cursor-pointer transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Staff</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Staff */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#005CA9]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Staff Users
            </p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {totalStaffCount}
            </p>
          </div>
        </div>

        {/* Card 2: Store Managers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Store Managers
            </p>
            <p className="text-xl font-black text-indigo-700 mt-0.5">
              {storeManagersCount}
            </p>
          </div>
        </div>

        {/* Card 3: Active Kiosks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Tablet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kiosks &amp; Tablets
            </p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">
              {kioskUsersCount}
            </p>
          </div>
        </div>

        {/* Card 4: Active Ratio */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Status
            </p>
            <p className="text-xl font-black text-slate-900 mt-0.5 flex items-baseline gap-1">
              <span>{activeCount}</span>
              <span className="text-xs font-semibold text-slate-400">
                / {totalStaffCount} Active
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "All Roles" },
            { id: "STORE_MANAGER", label: "Store Managers" },
            { id: "KIOSK_USER", label: "Kiosk Tablets" },
            { id: "SUPER_ADMIN", label: "Super Admins" },
          ].map((tab) => {
            const active = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-[#005CA9] text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Store Selector & Search Input */}
        <div className="flex items-center gap-2">
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
          >
            <option value="ALL">All Store Locations</option>
            {stores.map((st) => (
              <option key={st.id || st.code} value={st.code}>
                {st.code} — {st.name}
              </option>
            ))}
            <option value="GLOBAL">Global (Headquarters Only)</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
            />
          </div>
        </div>
      </div>

      {/* 4. CONTENT VIEW: STORE-WISE (DEFAULT) OR FLAT */}
      {viewMode === "STORE_WISE" ? (
        <div className="space-y-6">
          {/* Loop over Stores */}
          {storesToDisplay.map((store) => {
            // Find staff assigned to this store
            const storeStaff = staffList.filter((u) => {
              if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
              const belongs =
                (u.store?.code &&
                  u.store.code.toUpperCase() === store.code.toUpperCase()) ||
                (u.store?.id && u.store.id === store.id) ||
                u.storeId === store.id ||
                u.storeId === store.code;

              if (!belongs) return false;

              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase().trim();
              return (
                u.name?.toLowerCase().includes(q) ||
                u.username?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
              );
            });

            // Find devices for this store
            const rawDevices = store.devices || store.authorizedDevices || [];
            const storeDevices = rawDevices.filter((d: any) => {
              if (roleFilter !== "ALL" && roleFilter !== "KIOSK_USER")
                return false;
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase().trim();
              return (
                d.deviceName?.toLowerCase().includes(q) ||
                d.deviceModel?.toLowerCase().includes(q) ||
                d.token?.toLowerCase().includes(q)
              );
            });

            const managersCount = storeStaff.filter(
              (u) => u.role === "STORE_MANAGER",
            ).length;
            const kiosksCount = storeStaff.filter(
              (u) => u.role === "KIOSK_USER",
            ).length;

            return (
              <div
                key={store.code}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs"
              >
                {/* Store Header Card */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-slate-50/70 to-blue-50/30 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[#005CA9]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-[11px] text-white bg-[#005CA9] px-2 py-0.5 rounded tracking-wider">
                          {store.code}
                        </span>
                        <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                          {store.name}
                        </h2>
                        {store.isCentralHub && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                            Central Hub
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {store.address || store.city}
                        </span>
                        {store.storeManager && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-700 font-bold">
                              Lead Manager: {store.storeManager}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quick stats and Add action */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-md font-bold text-[10px]">
                        {managersCount} Manager{managersCount !== 1 ? "s" : ""}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-md font-bold text-[10px]">
                        {kiosksCount} Kiosk{kiosksCount !== 1 ? "s" : ""}
                      </span>
                      {storeDevices.length > 0 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold text-[10px]">
                          {storeDevices.length} Hardware Tab{storeDevices.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openAddModalForStore(store.id || store.code)
                      }
                      className="flex items-center gap-1 bg-white hover:bg-slate-50 text-[#005CA9] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to {store.code}</span>
                    </button>
                  </div>
                </div>

                {/* Staff Members Table under this Store */}
                <div className="w-full">
                  {storeStaff.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50/30">
                      <p className="text-xs font-bold text-slate-600">
                        No user accounts provisioned for {store.name} yet.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          openAddModalForStore(store.id || store.code)
                        }
                        className="mt-2 text-xs font-bold text-[#005CA9] hover:underline"
                      >
                        + Create First Store Account
                      </button>
                    </div>
                  ) : (
                    <table className="w-full table-fixed text-left text-xs border-collapse">
                      <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="w-[32%] pl-4 pr-2 py-2.5">Staff / Account</th>
                          <th className="w-[22%] px-2 py-2.5">Username</th>
                          <th className="w-[20%] px-2 py-2.5">Role</th>
                          <th className="w-[16%] px-2 py-2.5">Status</th>
                          <th className="w-[10%] pl-2 pr-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {storeStaff.map((user) => {
                          const isActive =
                            (user.status || "ACTIVE") === "ACTIVE";
                          const initials = getInitials(user.name);

                          return (
                            <tr
                              key={user.id}
                              className="hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="pl-4 pr-2 py-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 border ${
                                      user.role === "STORE_MANAGER"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}
                                  >
                                    {initials}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-extrabold text-slate-900 text-xs truncate">
                                      {user.name}
                                    </div>
                                    {user.email ? (
                                      <div className="text-[10px] text-slate-400 font-normal truncate">
                                        {user.email}
                                      </div>
                                    ) : user.phone ? (
                                      <div className="text-[10px] text-slate-400 font-normal truncate">
                                        {user.phone}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </td>

                              <td className="px-2 py-2.5">
                                <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] max-w-full">
                                  <span className="truncate">@{user.username}</span>
                                  <button
                                    type="button"
                                    onClick={() => copyUsername(user.username)}
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                                    title="Copy Username"
                                  >
                                    {copiedUsername === user.username ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="px-2 py-2.5">
                                {user.role === "STORE_MANAGER" ? (
                                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200/80 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                                    <Store className="w-3 h-3 text-[#005CA9] shrink-0" />
                                    Store Manager
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                                    <Tablet className="w-3 h-3 text-emerald-600 shrink-0" />
                                    Kiosk User
                                  </span>
                                )}
                              </td>

                              <td className="px-2 py-2.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleStatus(user.id, user.status)
                                  }
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap ${
                                    isActive
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                                  }`}
                                  title="Click to toggle status"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isActive
                                        ? "bg-emerald-500 animate-pulse"
                                        : "bg-rose-500"
                                    }`}
                                  />
                                  <span>{isActive ? "Active" : "Suspended"}</span>
                                </button>
                              </td>

                              <td className="pl-2 pr-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(user.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Sub-strip for Authorized Physical Hardware Terminals */}
                {storeDevices.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tablet className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Authorized Physical Store Devices ({store.code})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {storeDevices.map((dev: any) => (
                        <div
                          key={dev.id}
                          className="bg-white border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-slate-900 truncate text-[11px]">
                              {dev.deviceName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {dev.deviceModel || dev.token}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paired
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Headquarters / Global Super Admins Section */}
          {globalSuperAdmins.length > 0 && (
            <div className="bg-white border border-amber-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/60 to-slate-50 border-b border-amber-200/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-[11px] text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded tracking-wider">
                        HEADQUARTERS
                      </span>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        Global Super Administrator Desk
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Unrestricted master access across Website, Mobile App, and all regional branches.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                  Master Authority
                </span>
              </div>

              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="w-[32%] pl-4 pr-2 py-2.5">Super Admin Member</th>
                    <th className="w-[22%] px-2 py-2.5">Username</th>
                    <th className="w-[20%] px-2 py-2.5">Role</th>
                    <th className="w-[16%] px-2 py-2.5">Status</th>
                    <th className="w-[10%] pl-2 pr-4 py-2.5 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {globalSuperAdmins.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="pl-4 pr-2 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 border bg-amber-50 text-amber-700 border-amber-200">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-900 text-xs truncate">
                              {user.name}
                            </div>
                            {user.email && (
                              <div className="text-[10px] text-slate-400 font-normal truncate">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2.5">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] max-w-full">
                          <span className="truncate">@{user.username}</span>
                          <button
                            type="button"
                            onClick={() => copyUsername(user.username)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                            title="Copy Username"
                          >
                            {copiedUsername === user.username ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-2 py-2.5">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                          <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                          Super Admin
                        </span>
                      </td>

                      <td className="px-2 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          Active
                        </span>
                      </td>

                      <td className="pl-2 pr-4 py-2.5 text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Global
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* FLAT TABLE VIEW (Fallback) */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs w-full">
          <table className="w-full table-fixed text-left text-xs border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="w-[28%] pl-4 pr-2 py-3">Staff Member</th>
                <th className="w-[16%] px-2 py-3">Username</th>
                <th className="w-[16%] px-2 py-3">Role</th>
                <th className="w-[23%] px-2 py-3">Assigned Store</th>
                <th className="w-[11%] px-2 py-3">Status</th>
                <th className="w-[6%] pl-2 pr-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#005CA9]" />
                      <span className="text-xs font-bold">Loading staff directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">
                      No staff accounts found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your search criteria or role filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((user) => {
                  const isActive = (user.status || "ACTIVE") === "ACTIVE";
                  const initials = getInitials(user.name);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="pl-4 pr-2 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 border ${
                              user.role === "SUPER_ADMIN"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : user.role === "STORE_MANAGER"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-900 text-xs truncate">
                              {user.name}
                            </div>
                            {user.email ? (
                              <div className="text-[10px] text-slate-400 font-normal truncate">
                                {user.email}
                              </div>
                            ) : user.phone ? (
                              <div className="text-[10px] text-slate-400 font-normal truncate">
                                {user.phone}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2.5">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] max-w-full">
                          <span className="truncate">@{user.username}</span>
                          <button
                            type="button"
                            onClick={() => copyUsername(user.username)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                            title="Copy Username"
                          >
                            {copiedUsername === user.username ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-2 py-2.5">
                        {user.role === "SUPER_ADMIN" ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                            <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                            Super Admin
                          </span>
                        ) : user.role === "STORE_MANAGER" ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200/80 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                            <Store className="w-3 h-3 text-[#005CA9] shrink-0" />
                            Store Manager
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                            <Tablet className="w-3 h-3 text-emerald-600 shrink-0" />
                            Kiosk User
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-2.5">
                        {user.store ? (
                          <div
                            className="flex items-center gap-1.5 text-xs min-w-0"
                            title={`${user.store.code} • ${user.store.name}`}
                          >
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-extrabold text-slate-900 shrink-0 text-[11px]">
                              {user.store.code}
                            </span>
                            <span className="text-slate-300 shrink-0">•</span>
                            <span className="text-slate-600 truncate text-[11px]">
                              {user.store.name.replace(/^Prayog India\s*/i, "")}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-block text-slate-500 italic text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                            Global (All Stores)
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(user.id, user.status)
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-rose-500"
                            }`}
                          />
                          <span>{isActive ? "Active" : "Suspended"}</span>
                        </button>
                      </td>

                      <td className="pl-2 pr-4 py-2.5 text-right">
                        {user.role !== "SUPER_ADMIN" ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(user.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Create Staff Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <UserPlus className="w-6 h-6 text-[#005CA9]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Create Staff / Manager Account
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Provision branch manager credentials or retail shopping tablet logins.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Full Name / Device Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar (or Front Kiosk Tablet)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Username (Unique) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ranchi_manager"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Staff Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all cursor-pointer"
                  >
                    {isSuperAdmin ? (
                      <>
                        <option value="STORE_MANAGER">
                          Store Manager (Branch Portal)
                        </option>
                        <option value="KIOSK_USER">
                          Kiosk User (Store Tablet)
                        </option>
                        <option value="SUPER_ADMIN">
                          Super Admin (Global Access)
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="KIOSK_USER">
                          Kiosk User (Store Tablet)
                        </option>
                      </>
                    )}
                  </select>
                </div>

                {role !== "SUPER_ADMIN" && isSuperAdmin && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                      Assigned Branch <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all cursor-pointer"
                    >
                      {stores.map((st) => (
                        <option key={st.id || st.code} value={st.id || st.code}>
                          {st.code} — {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@prayogindia.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94311 00000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#005CA9] hover:bg-[#004b8a] text-white font-black px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-[#005CA9]/25 hover:shadow-lg transition-all"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Provision Staff Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
