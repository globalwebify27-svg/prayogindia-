"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import {
  User,
  Phone,
  Mail,
  Building,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";


export const ProfileForm: React.FC = () => {
  const { user, updateUser } = useStore();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email] = useState(user?.email || ""); // Email is read-only
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [gstin, setGstin] = useState(user?.gstin || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, companyName, gstin }),
      });
      const data = await res.json();
      if (data.success) {
        updateUser({ name, phone, companyName, gstin });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(data.message || "Failed to update profile.");
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-slate-900">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Personal & Institutional Profile
        </h2>
        <p className="text-xs text-slate-500">
          Manage your contact information, institutional GSTIN invoice
          credentials, and business tier.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes successfully updated!</span>
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* System Customer Type Tier */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              System Customer Tier
            </span>
            <span className="text-sm font-extrabold text-[#00AEEF]">
              {user?.customerType || "B2C Customer"}
            </span>
          </div>
          <span className="bg-[#E0F7FC] text-[#00AEEF] text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-[#00AEEF]/20">
            Verified Account
          </span>
        </div>

        {/* Contact Information Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full bg-slate-100 text-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-semibold cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-slate-400">Email cannot be changed here. Contact support to update.</p>
        </div>

        {/* Company & GST Tax Credentials Group */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#00AEEF]" /> Institutional / B2B
            GST Information (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Company / Institution Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Prayog Tech Labs Pvt Ltd"
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                GSTIN Number
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono font-semibold uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Profile Changes
        </button>
      </form>
    </div>
  );
};
