"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  ShieldCheck,
  User,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Check,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface StoreProfileData {
  storeInfo: {
    code: string;
    name: string;
    type: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
    operatingHours: string;
    posTillsCount: number;
    kiosksCount: number;
  };
  managerProfile: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    storeCode: string;
    assignedDevice: string;
    status: string;
  };
}

export default function StoreProfilePage() {
  const [profile, setProfile] = useState<StoreProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/store/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (e) {
      console.error("Failed to load store profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (newPassword.length < 6) {
      setPasswordStatus({
        type: "error",
        message: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/store/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordStatus({
          type: "success",
          message: data.message || "Password updated successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordStatus({
          type: "error",
          message: data.message || "Failed to update password.",
        });
      }
    } catch {
      setPasswordStatus({
        type: "error",
        message: "Network error occurred while updating password.",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {profile?.storeInfo.code || "Store"} Branch
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Profile &amp; Location Overview
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store Profile &amp; Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official branch registry, manager credentials, and local terminal security.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Refresh Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Store Information (View-Only) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Store Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official enterprise store record &amp; legal registration
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>View Only</span>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Store Name & Type */}
                  <div className="border-b border-slate-100 pb-5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Store Branch Name
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {profile?.storeInfo.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {profile?.storeInfo.type}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <MapPin className="w-4 h-4 text-[#2563EB]" />
                        <span>Branch Address</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {profile?.storeInfo.address}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>GSTIN &amp; Tax ID</span>
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-900 pt-1">
                        {profile?.storeInfo.gstin}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Authorized for B2C &amp; B2B in-store tax billing
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Phone className="w-4 h-4 text-purple-600" />
                        <span>Store Helpline &amp; Contact</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 pt-1">
                        {profile?.storeInfo.phone}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {profile?.storeInfo.email}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Operating Hours</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 pt-1">
                        {profile?.storeInfo.operatingHours}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Active walk-in customer support hours
                      </p>
                    </div>
                  </div>

                  {/* Registered Devices Summary */}
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-[#2563EB]" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Branch Hardware Provisioning
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Authorized billing points connected to this store inventory
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="bg-white border border-blue-200 px-2.5 py-1 rounded-lg text-blue-700">
                        {profile?.storeInfo.posTillsCount} POS Tills
                      </span>
                      <span className="bg-white border border-blue-200 px-2.5 py-1 rounded-lg text-blue-700">
                        {profile?.storeInfo.kiosksCount} Walk-in Kiosks
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    * To modify store location, legal GST details, or hardware quotas, please contact Prayog Central Corporate Administration.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Manager Profile & Change Password */}
        <div className="space-y-6">
          {/* Manager Profile Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <User className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                My Staff Profile
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {profile?.managerProfile.name.charAt(0) || "M"}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {profile?.managerProfile.name || "Store Manager"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Active
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      @{profile?.managerProfile.username}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Assigned Role</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {profile?.managerProfile.role}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Branch Location</span>
                  <span className="font-bold text-[#2563EB]">
                    {profile?.managerProfile.storeCode} Store
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Terminal Node</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {profile?.managerProfile.assignedDevice}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Email Address</span>
                  <span className="text-slate-700 font-medium text-[11px]">
                    {profile?.managerProfile.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Change Password
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {passwordStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 text-[11px] font-bold mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] font-bold mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] font-bold mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {updatingPassword ? (
                  <span>Updating...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

