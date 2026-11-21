"use client";

import React, { useState, useEffect } from "react";
import {
  Tablet,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  KeyRound,
  User,
  Lock,
  Smartphone,
  UserCheck,
  Award,
  TrendingUp,
  Tag,
  Building2,
} from "lucide-react";

const KNOWN_EXECUTIVES = [
  "Abhishek Kumar",
  "Abuzar Ansari",
  "Shahnawaz Abbas",
  "Emraan Hassan",
  "Jay Prakash",
];

export default function StoreDevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [salesExecutive, setSalesExecutive] = useState(KNOWN_EXECUTIVES[0]);
  const [deviceName, setDeviceName] = useState(`${KNOWN_EXECUTIVES[0]}'s Store Tablet`);
  const [username, setUsername] = useState("abhishek_tab");
  const [password, setPassword] = useState("");
  const [deviceType, setDeviceType] = useState<"KIOSK_TABLET" | "POS_TERMINAL">(
    "KIOSK_TABLET",
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/devices");
      const data = await res.json();
      if (data.success) {
        setDevices(data.data || []);
        setStoreCode(data.store || "STORE");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleExecutiveChange = (name: string) => {
    setSalesExecutive(name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    setDeviceName(`${name}'s Store Tablet`);
    setUsername(`${slug}_tab`);
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/store/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName,
          username,
          password,
          deviceType,
          salesExecutive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create kiosk device.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || "Kiosk tablet registered and attributed to sales executive successfully!");
      setTimeout(() => {
        setShowModal(false);
        setDeviceName(`${KNOWN_EXECUTIVES[0]}'s Store Tablet`);
        setUsername("abhishek_tab");
        setPassword("");
        setSuccessMsg("");
        fetchDevices();
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || "Network error creating kiosk.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {storeCode} Branch Hardware
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Store-Isolated Fleet &amp; Sales Attribution
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Authorized Store Tablets &amp; Kiosks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store Managers create and assign self-checkout kiosk tablets and billing POS terminals
            under their designated Sales Executives for automated sales attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDevices}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Kiosk / Tablet</span>
          </button>
        </div>
      </div>

      {/* Attribution Context Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-blue-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-blue-900 uppercase tracking-tight block">
              Automated Sales Executive Attribution Active
            </span>
            <span className="text-slate-600">
              Every checkout completed on an authorized branch tablet automatically logs the order under the designated Sales Executive for commission &amp; performance tracking.
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">Fleet Active:</span>
          <span className="font-mono font-black text-[#2563EB] text-sm">
            {devices.length} Devices
          </span>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Connecting to store device fleet...</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            No dedicated hardware terminals registered for this store yet. Click
            &quot;Add Kiosk / Tablet&quot; to provision one.
          </div>
        ) : (
          devices.map((device, idx) => {
            const executiveDisplay =
              device.salesExecutive ||
              device.assignedStaff?.replace(/^@/, "").replace(/_/g, " ") ||
              KNOWN_EXECUTIVES[idx % KNOWN_EXECUTIVES.length];

            return (
              <div
                key={device.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 hover:border-blue-300 transition-all shadow-2xs hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-center text-[#2563EB]">
                    <Tablet className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                    {device.status || "Active"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {device.deviceName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {device.deviceModel}
                  </p>
                </div>

                {/* Sales Executive Assignment Pill */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-[11px] font-mono border border-slate-200">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-sans font-bold text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                      Sales Executive:
                    </span>
                    <span className="text-[#2563EB] font-sans font-black bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      {executiveDisplay}
                    </span>
                  </div>
                  <div className="text-slate-500 flex justify-between font-mono">
                    <span>Executive Login ID:</span>
                    <span className="text-slate-900 font-bold">
                      {device.assignedStaff || `@${device.deviceName.toLowerCase().replace(/\s+/g, "_")}`}
                    </span>
                  </div>
                  <div className="text-slate-500 flex justify-between font-mono">
                    <span>Device Code:</span>
                    <span className="text-slate-800 font-bold">
                      {device.deviceCode || "TAB-ACTIVE"}
                    </span>
                  </div>
                  <div className="text-slate-500 flex justify-between font-mono">
                    <span>Fleet Status:</span>
                    <span className="text-emerald-700 font-bold">
                      {device.lastActiveAt || "Active"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Commission Linked
                  </span>
                  <span className="font-mono text-slate-400">Order Auto-Attribution</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Kiosk Tablet Assigned to Sales Executive */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                <Tablet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Register Kiosk / Store Tablet
                </h3>
                <p className="text-xs text-slate-500">
                  Store Manager provisioned for{" "}
                  <span className="text-[#2563EB] font-bold">
                    {storeCode || "Branch"} Store
                  </span>
                </p>
              </div>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                {formError}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateDevice} className="space-y-3.5">
              {/* Sales Executive Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Designated Sales Executive
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={salesExecutive}
                    onChange={(e) => handleExecutiveChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB] font-bold cursor-pointer"
                  >
                    {KNOWN_EXECUTIVES.map((exec) => (
                      <option key={exec} value={exec}>
                        {exec} (Branch Sales Executive)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Device Display Name
                </label>
                <input
                  type="text"
                  required
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={`e.g. Abhishek Kumar's Kiosk Tablet`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Device Hardware Type
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="KIOSK_TABLET">
                    Store Shopping Tablet (Self-Checkout Kiosk Mode)
                  </option>
                  <option value="POS_TERMINAL">
                    POS Billing Terminal (Sales Counter Mode)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Terminal Login
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value.toLowerCase().replace(/\s+/g, "_"),
                        )
                      }
                      placeholder="tablet_username"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Terminal PIN / Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? "Registering..." : "Assign & Register Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
