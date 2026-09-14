"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
} from "lucide-react";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { loginUser } = useStore();

  // Step 1: Mobile Number, Step 2: OTP, Email, Password
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Optional B2B fields
  const [isB2B, setIsB2B] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const cleanDigits = phone.replace(/\D/g, "");
  const isPhoneValid = cleanDigits.length === 10;

  // Step 1: Send OTP to Mobile Number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: cleanDigits,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      setInfoMessage(`OTP sent to +91 ${cleanDigits}.`);
      setStep(2);
    } catch (err: any) {
      setError("Failed to send OTP. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError(null);
    setInfoMessage(null);
    setResending(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: cleanDigits,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInfoMessage("A fresh OTP has been sent to your mobile number.");
      } else {
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP and complete Registration with Email and Password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError("Please enter the OTP sent to your mobile number.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isEmailValid =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail);
    if (!cleanEmail || !isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP first
      const otpRes = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: cleanDigits,
          code: cleanOtp,
        }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData.success) {
        setError(otpData.message || "Invalid OTP code. Please check and retry.");
        setLoading(false);
        return;
      }

      // 2. Register account with Email, Phone, Password
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `User ${cleanDigits.slice(-4)}`,
          email: cleanEmail,
          phone: cleanDigits,
          password,
          b2b: isB2B
            ? {
                companyName: companyName.trim(),
                gstNumber: gstNumber.trim().toUpperCase(),
              }
            : undefined,
        }),
      });

      const regData = await regRes.json();

      // If registration fails because user already created by OTP, we log them in directly
      if (otpData?.user) {
        loginUser({
          name: regData?.user?.name || otpData.user.name || `User ${cleanDigits.slice(-4)}`,
          email: cleanEmail,
          phone: `+91 ${cleanDigits}`,
          customerType: "Registered Customer",
          rewardPoints: 100,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/account");
      }, 1000);
    } catch (err: any) {
      setError("Registration failed. Please check your details and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-[#F8FAFC]">
      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.03)] animate-in fade-in duration-300">
        {/* Step 1: Sign Up Mobile Form */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8">
              Sign Up
            </h1>

            {error && (
              <div className="mb-6 bg-red-50 text-red-700 text-xs font-medium p-3.5 rounded-xl border border-red-200 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Mobile Number input with +91 prefix */}
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-700 font-semibold text-sm">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Mobile Number"
                  className="w-full bg-white text-slate-900 pl-14 pr-4 py-3.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Send OTP Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-32 bg-[#00AEEF] hover:bg-[#0096D6] active:scale-[0.98] disabled:opacity-40 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center cursor-pointer"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </form>

            {/* Switch to Login */}
            <div className="mt-8 text-left text-xs font-medium text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#00AEEF] font-bold hover:text-[#0096D6] hover:underline transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Enter OTP, Email, and Password */}
        {step === 2 && (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-8">
              Step 2: Enter OTP, Email, and Password
            </h1>

            {error && (
              <div className="mb-6 bg-red-50 text-red-700 text-xs font-medium p-3.5 rounded-xl border border-red-200 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-6 bg-emerald-50 text-emerald-800 text-xs font-medium p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-50 text-emerald-800 text-xs font-medium p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Registration completed successfully! Redirecting to your account...
                </span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* 1. Mobile Number (Readonly / Click to Edit) */}
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={cleanDigits}
                  className="w-full bg-slate-50 text-slate-700 px-4 py-3.5 text-sm rounded-xl border border-slate-200 font-medium cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#00AEEF] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* 2. OTP */}
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="OTP"
                  className="w-full bg-white text-slate-900 px-4 py-3.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* 3. Email */}
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-white text-slate-900 px-4 py-3.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* 4. Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white text-slate-900 pl-4 pr-12 py-3.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Optional B2B/Institution Registration Toggle */}
              <div className="pt-2 pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isB2B}
                    onChange={(e) => setIsB2B(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00AEEF] accent-[#00AEEF]"
                  />
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#00AEEF]" />
                    Register as Business / Institution (GST Invoicing)
                  </span>
                </label>

                {isB2B && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company / Institution Name"
                      className="w-full bg-white text-slate-900 px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-medium"
                    />
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="GSTIN (Optional / 15-digits)"
                      className="w-full bg-white text-slate-900 px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-medium uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons: Register & Resend OTP */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-32 bg-[#00AEEF] hover:bg-[#0096D6] active:scale-[0.98] disabled:opacity-40 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center cursor-pointer"
                >
                  {loading ? "Registering..." : "Register"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="w-36 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 text-slate-800 border border-slate-200 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center cursor-pointer"
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </form>

            {/* Switch to Login */}
            <div className="mt-8 text-left text-xs font-medium text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#00AEEF] font-bold hover:text-[#0096D6] hover:underline transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
