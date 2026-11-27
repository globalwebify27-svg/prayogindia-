"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/context/StoreContext";
import {
  User,
  Phone,
  Mail,
  Building,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Pencil,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
type ChangePhoneStep = "idle" | "enter-new" | "verify-otp" | "success";

// ─── Helpers ───────────────────────────────────────────────────────────────
const digits10 = (raw: string) => raw.replace(/\D/g, "").slice(-10);
const formatDisplay = (raw: string) => {
  const d = digits10(raw);
  return d.length === 10 ? `+91 ${d}` : raw;
};

// ─── Component ─────────────────────────────────────────────────────────────
export const ProfileForm: React.FC = () => {
  const { user, updateUser } = useStore();

  // ── Profile form state ────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [gstin, setGstin] = useState(user?.gstin || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Change-phone modal state ───────────────────────────────────────────────
  const [cpStep, setCpStep] = useState<ChangePhoneStep>("idle");
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);
  const [cpMessage, setCpMessage] = useState<string | null>(null);
  const [currentDisplayPhone, setCurrentDisplayPhone] = useState(
    user?.phone || "",
  );

  const newPhoneRef = useRef<HTMLInputElement>(null);
  const firstOtpRef = useRef<HTMLInputElement>(null);

  // Focus new-phone input when that step opens
  useEffect(() => {
    if (cpStep === "enter-new") {
      setTimeout(() => newPhoneRef.current?.focus(), 80);
    }
  }, [cpStep]);

  // Focus first OTP box when OTP step opens
  useEffect(() => {
    if (cpStep === "verify-otp") {
      setTimeout(() => firstOtpRef.current?.focus(), 80);
    }
  }, [cpStep]);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  const closeChangePhone = useCallback(() => {
    setCpStep("idle");
    setNewPhoneInput("");
    setOtpDigits(["", "", "", "", "", ""]);
    setCpError(null);
    setCpMessage(null);
    setOtpTimer(0);
  }, []);

  // ── Send OTP to new number ─────────────────────────────────────────────────
  const sendOtp = async (phone10: string) => {
    setCpLoading(true);
    setCpError(null);
    setCpMessage(null);
    try {
      const res = await fetch("/api/users/me/change-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", newPhone: phone10 }),
      });
      const data = await res.json();
      if (data.success) {
        setCpMessage(data.message);
        setCpStep("verify-otp");
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpTimer(60);
      } else {
        setCpError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch {
      setCpError("Network error. Could not send OTP.");
    } finally {
      setCpLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone10 = digits10(newPhoneInput);
    if (phone10.length !== 10) {
      setCpError("Please enter a valid 10-digit mobile number.");
      return;
    }
    await sendOtp(phone10);
  };

  // ── Verify OTP & update phone ──────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setCpError("Please enter all 6 digits of the OTP.");
      return;
    }
    setCpLoading(true);
    setCpError(null);
    try {
      const res = await fetch("/api/users/me/change-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          newPhone: digits10(newPhoneInput),
          code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const formatted = data.newPhone || `+91${digits10(newPhoneInput)}`;
        setCurrentDisplayPhone(formatted);
        updateUser({ phone: formatted });
        setCpStep("success");
        // Auto-close after 2.5 s
        setTimeout(() => closeChangePhone(), 2500);
      } else {
        setCpError(data.message || "Incorrect OTP. Please try again.");
      }
    } catch {
      setCpError("Network error while verifying OTP.");
    } finally {
      setCpLoading(false);
    }
  };

  // ── OTP input helpers ──────────────────────────────────────────────────────
  const handleOtpChange = (val: string, idx: number) => {
    const d = val.replace(/\D/g, "");
    // Handle paste of full 6-digit OTP
    if (d.length === 6) {
      setOtpDigits(d.split(""));
      document.getElementById(`cp-otp-5`)?.focus();
      return;
    }
    if (d.length > 1) return;
    const updated = [...otpDigits];
    updated[idx] = d;
    setOtpDigits(updated);
    if (d && idx < 5) document.getElementById(`cp-otp-${idx + 1}`)?.focus();
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      document.getElementById(`cp-otp-${idx - 1}`)?.focus();
    }
  };

  // ── Save profile (name / company / gstin) ─────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, companyName, gstin }),
      });
      const data = await res.json();
      if (data.success) {
        updateUser({ name, companyName, gstin });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setSaveError(data.message || "Failed to update profile.");
      }
    } catch {
      setSaveError("Network error while saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayPhone = formatDisplay(currentDisplayPhone || user?.phone || "");
  const modalOpen = cpStep !== "idle";

  return (
    <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-2xs space-y-5 text-slate-900 relative">
      {/* ── Heading ── */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Edit Profile
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal and business details.
        </p>
      </div>

      {/* ── Global success / error banners ── */}
      {savedSuccess && (
        <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
        {/* ── Name ── */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-colors"
            />
          </div>
        </div>

        {/* ── Verified Mobile (read-only) + Change Number button ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 block">
              Mobile Phone Number
            </label>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Read-only display */}
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <div className="w-full bg-slate-100 text-slate-700 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-semibold select-none cursor-default">
                {displayPhone || "Not set"}
              </div>
            </div>

            {/* Change Number button */}
            <button
              type="button"
              onClick={() => {
                setNewPhoneInput("");
                setCpError(null);
                setCpMessage(null);
                setCpStep("enter-new");
              }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-700 active:scale-95 transition-all shadow-xs"
            >
              <Pencil className="w-3 h-3" />
              Change
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-1">
            Changing your number requires OTP verification on the new number.
          </p>
        </div>

        {/* ── Registered Email (read-only) ── */}
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
          <p className="text-[10px] text-slate-400">
            Email is tied to your primary identity. Contact support to request
            email changes.
          </p>
        </div>

        {/* ── Company & GST ── */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" /> Institutional / B2B
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
                  placeholder="Enter company name"
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-colors"
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
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="ENTER GSTIN NUMBER"
                  maxLength={15}
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold font-mono uppercase transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Save button ── */}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0A1128] hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Profile
            details are verified and stored securely
          </span>
        </div>
      </form>

      {/* ══════════════════════════════════════════════════════════════════════
          CHANGE MOBILE NUMBER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !cpLoading) closeChangePhone();
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-5 relative animate-in zoom-in-95 fade-in duration-150">
            {/* Modal header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block">
                  Security Verification Required
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {cpStep === "enter-new" && "Enter New Mobile Number"}
                  {cpStep === "verify-otp" && "Verify Your New Number"}
                  {cpStep === "success" && "Number Updated!"}
                </h3>
              </div>
              {!cpLoading && (
                <button
                  type="button"
                  onClick={closeChangePhone}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ── SUCCESS ── */}
            {cpStep === "success" && (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm">
                    Mobile Number Updated
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your account is now linked to{" "}
                    <strong className="font-mono text-slate-800">
                      +91 {digits10(newPhoneInput)}
                    </strong>
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 1: Enter new number ── */}
            {cpStep === "enter-new" && (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the new mobile number you want to link to your account.
                  We will send a one-time verification code to confirm ownership.
                </p>

                {cpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{cpError}</span>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      New Mobile Number
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                      <span className="px-3 py-2.5 text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-100 select-none">
                        +91
                      </span>
                      <input
                        ref={newPhoneRef}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={newPhoneInput}
                        onChange={(e) =>
                          setNewPhoneInput(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="10-digit mobile number"
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none font-mono"
                      />
                      {newPhoneInput.length > 0 && (
                        <span
                          className={`pr-3 text-[10px] font-bold ${digits10(newPhoneInput).length === 10 ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {digits10(newPhoneInput).length}/10
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeChangePhone}
                      disabled={cpLoading}
                      className="px-4 py-2.5 font-bold text-xs text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        cpLoading || digits10(newPhoneInput).length !== 10
                      }
                      className="bg-[#0A1128] hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
                    >
                      {cpLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Send OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── STEP 2: Enter OTP ── */}
            {cpStep === "verify-otp" && (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A 6-digit verification code has been sent to{" "}
                  <strong className="font-mono text-slate-900">
                    +91 {digits10(newPhoneInput)}
                  </strong>
                  . Enter it below to confirm and update your number.
                </p>

                {cpMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-[11px] font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{cpMessage}</span>
                  </div>
                )}

                {cpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{cpError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {/* 6-box OTP input */}
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`cp-otp-${idx}`}
                        ref={idx === 0 ? firstOtpRef : undefined}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-10 h-12 text-center text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono shadow-sm transition-all"
                      />
                    ))}
                  </div>

                  {/* Countdown / Resend */}
                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCpStep("enter-new")}
                      className="text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2 transition-colors"
                    >
                      Change number
                    </button>

                    {otpTimer > 0 ? (
                      <span className="text-slate-400 font-medium">
                        Resend in{" "}
                        <strong className="text-slate-700 font-mono">
                          {otpTimer}s
                        </strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sendOtp(digits10(newPhoneInput))}
                        disabled={cpLoading}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={closeChangePhone}
                      disabled={cpLoading}
                      className="px-4 py-2.5 font-bold text-xs text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={cpLoading || otpDigits.join("").length !== 6}
                      className="bg-[#0A1128] hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
                    >
                      {cpLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Confirm & Update Number</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
