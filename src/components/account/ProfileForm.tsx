"use client";

import React, { useState, useEffect } from "react";
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
  KeyRound,
  RefreshCw,
  X,
  Lock,
} from "lucide-react";

export const ProfileForm: React.FC = () => {
  const { user, updateUser } = useStore();

  const originalPhone = user?.phone || "";
  const cleanOriginal = originalPhone.replace(/\D/g, "").slice(-10);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email] = useState(user?.email || ""); // Email is read-only
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [gstin, setGstin] = useState(user?.gstin || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // OTP Verification Modal State for Phone Change
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const cleanCurrentPhone = phone.replace(/\D/g, "").slice(-10);
  const isPhoneChanged =
    cleanCurrentPhone.length === 10 && cleanCurrentPhone !== cleanOriginal;

  // Countdown timer for OTP modal
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  const handleOtpDigitChange = (val: string, index: number) => {
    const sanitized = val.replace(/\D/g, "");
    if (sanitized.length <= 1) {
      const updated = [...otpDigits];
      updated[index] = sanitized;
      setOtpDigits(updated);

      if (sanitized && index < 5) {
        const nextInput = document.getElementById(`profile-otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`profile-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const sendPhoneChangeOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: cleanCurrentPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpMessage(data.message || `OTP sent to +91 ${cleanCurrentPhone}.`);
        setOtpTimer(30);
      } else {
        setOtpError(data.message || "Failed to dispatch verification OTP.");
      }
    } catch {
      setOtpError("Network error. Could not send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleInitiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // If mobile number has changed, trigger OTP modal first
    if (isPhoneChanged) {
      setOtpDigits(["", "", "", "", "", ""]);
      setShowOtpModal(true);
      await sendPhoneChangeOtp();
      return;
    }

    // Otherwise, save name, company, gstin directly
    await executeSaveProfile(cleanOriginal || cleanCurrentPhone);
  };

  const handleVerifyOtpAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    const enteredCode = otpDigits.join("");

    if (enteredCode.length !== 6) {
      setOtpError("Please enter all 6 digits of the OTP code.");
      return;
    }

    setOtpLoading(true);

    try {
      // 1. Verify OTP code with backend
      const verifyRes = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: cleanCurrentPhone,
          code: enteredCode,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setOtpError(
          verifyData.message || "Invalid OTP code. Please check SMS and try again.",
        );
        setOtpLoading(false);
        return;
      }

      // 2. Save verified phone number and profile
      setShowOtpModal(false);
      await executeSaveProfile(cleanCurrentPhone);
    } catch {
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const executeSaveProfile = async (verifiedPhone: string) => {
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: verifiedPhone,
          companyName,
          gstin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateUser({
          name,
          phone: `+91 ${verifiedPhone}`,
          companyName,
          gstin,
        });
        setPhone(`+91 ${verifiedPhone}`);
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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-slate-900 relative">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Personal &amp; Institutional Profile
        </h2>
        <p className="text-xs text-slate-500">
          Manage your contact information, verified mobile number, institutional GSTIN
          invoice credentials, and business tier.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile and contact information successfully verified &amp; updated!</span>
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-xl border border-red-200 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleInitiateSubmit} className="space-y-6 text-xs">
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
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 block">
                Mobile Phone Number
              </label>
              {isPhoneChanged ? (
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                  OTP Verification Required
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border font-semibold transition-colors ${
                  isPhoneChanged
                    ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/30"
                    : "border-slate-200"
                }`}
              />
            </div>
            {isPhoneChanged && (
              <p className="text-[10px] text-amber-600 font-medium">
                Changing your registered phone number requires SMS OTP verification upon saving.
              </p>
            )}
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
          <p className="text-[10px] text-slate-400">
            Email is tied to your primary identity. Contact support to request email changes.
          </p>
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
                  maxLength={15}
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
          className="bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-2 cursor-pointer"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPhoneChanged ? "Verify New Number & Save Changes" : "Save Profile Changes"}
        </button>
      </form>

      {/* Re-verify Phone Number OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => !otpLoading && setShowOtpModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#00AEEF] tracking-widest block">
                  Security Re-verification
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Verify New Mobile Number
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !otpLoading && setShowOtpModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              We have dispatched a 6-digit OTP passcode to{" "}
              <strong className="text-slate-900 font-mono">+91 {cleanCurrentPhone}</strong>{" "}
              to verify this new phone number.
            </p>

            {otpMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{otpMessage}</span>
              </div>
            )}

            {otpError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndSave} className="space-y-5">
              {/* 6-box OTP digits */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`profile-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 font-mono shadow-2xs"
                  />
                ))}
              </div>

              {/* Countdown / Resend */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                {otpTimer > 0 ? (
                  <span className="text-slate-400 font-medium">
                    Resend code in <strong className="text-slate-700 font-mono">{otpTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendPhoneChangeOtp}
                    disabled={otpLoading}
                    className="text-[#00AEEF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP Code
                  </button>
                )}

                <span className="text-slate-400 text-[10px]">6-Digit SMS Code</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  disabled={otpLoading}
                  className="px-4 py-2.5 font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || otpDigits.join("").length !== 6}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Update</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
