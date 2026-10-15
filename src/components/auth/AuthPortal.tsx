"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles,
  Truck,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";

interface AuthPortalProps {
  initialMode?: "login" | "register";
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  initialMode = "login",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useStore();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const targetRedirect = searchParams.get("redirect") || "/account";
  const isJustRegistered = searchParams.get("registered") === "true";
  const prefilledEmail = searchParams.get("email") || "";

  // Common Fields
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Optional B2B fields for Register
  const [showB2B, setShowB2B] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    isJustRegistered
      ? "Account created successfully! Please enter your credentials to sign in."
      : null
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    // Update browser URL without triggering full page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = newMode === "register" ? "/register" : "/login";
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(
        mode === "register"
          ? "Please enter your email address."
          : "Please enter your email address or mobile number."
      );
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(
            data.message ||
              "Invalid email/phone or password. Please check your credentials."
          );
          setLoading(false);
          return;
        }

        if (data?.user) {
          loginUser({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "+91 98765 43210",
            customerType: data.user.customerType || "Registered Customer",
            rewardPoints: data.user.rewardPoints || 1250,
          });
          router.push(targetRedirect);
        }
      } catch (err: any) {
        setError("Authentication server error. Please try again.");
        setLoading(false);
      }
    } else {
      // Register Mode
      try {
        const payload: any = {
          email: cleanEmail,
          password,
        };

        if (showB2B && companyName.trim()) {
          payload.b2b = {
            companyName: companyName.trim(),
            gstNumber: gstNumber.trim() || undefined,
          };
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Registration failed. Please try again.");
          setLoading(false);
          return;
        }

        // Auto-login upon successful registration
        try {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.success && loginData.user) {
            loginUser({
              name: loginData.user.name,
              email: loginData.user.email,
              phone: loginData.user.phone || "+91 98765 43210",
              customerType: loginData.user.customerType || "Registered Customer",
              rewardPoints: loginData.user.rewardPoints || 100,
            });
            router.push(targetRedirect);
            return;
          }
        } catch {
          // If auto-login fails, switch to login view with success notification
        }

        setSuccessMsg(
          "Account created successfully! Please sign in with your password."
        );
        switchMode("login");
      } catch (err: any) {
        setError("Failed to create account. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Google Sign-In / Sign-Up
  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      const fbUser = result.user;

      const res = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          phoneNumber: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        loginUser({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "+91 98765 00000",
          customerType: data.user.customerType || "Registered Customer",
          rewardPoints: data.user.rewardPoints || 500,
        });
        router.push(targetRedirect);
      } else {
        setError(data.message || "Failed to authenticate with Google.");
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google authentication failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-220px)] bg-[#F8FAFC] py-8 sm:py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 lg:p-14 shadow-[0_4px_30px_rgba(0,0,0,0.03)] animate-in fade-in duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-start">
          {/* ══════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: ACTIVE FORM (REGISTER OR LOGIN)              */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="w-full md:pr-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6 sm:mb-8">
              {mode === "register" ? "Register" : "Login"}
            </h1>

            {successMsg && (
              <div className="mb-6 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium p-3.5 sm:p-4 rounded-2xl border border-emerald-200 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 text-red-700 text-xs sm:text-sm font-medium p-3.5 sm:p-4 rounded-2xl border border-red-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Field 1: Email / Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  {mode === "register"
                    ? "Email address"
                    : "Username or email address"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type={mode === "register" ? "email" : "text"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === "register"
                      ? "Enter your email address"
                      : "Enter your email or username"
                  }
                  className="w-full bg-white text-slate-900 px-4 py-3 sm:py-3.5 text-sm rounded-xl sm:rounded-2xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#0A233F] focus:ring-1 focus:ring-[#0A233F] transition-all font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Field 2: Password with Eye Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white text-slate-900 pl-4 pr-12 py-3 sm:py-3.5 text-sm rounded-xl sm:rounded-2xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#0A233F] focus:ring-1 focus:ring-[#0A233F] transition-all font-medium placeholder:text-slate-400"
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
              </div>

              {/* REGISTER ONLY: Optional B2B Tax Invoicing */}
              {mode === "register" && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowB2B(!showB2B)}
                    className="text-xs font-semibold text-slate-700 hover:text-[#0A233F] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#FFC20E]" />
                    <span>
                      {showB2B
                        ? "Hide Institution / B2B Details"
                        : "+ Registering for School, College or Company? (GST Invoicing)"}
                    </span>
                  </button>

                  {showB2B && (
                    <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          School / College / Company Name
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. IIT Bombay / Prayog Tech Lab"
                          className="w-full bg-white text-slate-900 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A233F]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          GSTIN (Optional)
                        </label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          placeholder="22AAAAA0000A1Z5"
                          className="w-full bg-white text-slate-900 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A233F] uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LOGIN ONLY: Remember Me & Lost Password */}
              {mode === "login" && (
                <div className="flex items-center justify-between pt-1 text-xs sm:text-sm text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0A1128] focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    href={
                      targetRedirect !== "/account"
                        ? `/forgot-password?redirect=${encodeURIComponent(
                            targetRedirect
                          )}`
                        : "/forgot-password"
                    }
                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-medium transition-colors"
                  >
                    Lost your password?
                  </Link>
                </div>
              )}

              {/* REGISTER ONLY: Privacy Policy text (Matches Reference Image) */}
              {mode === "register" && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  Your personal data will be used to support your experience
                  throughout this website, to manage access to your account, and
                  for other purposes described in our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-[#2563EB] hover:text-[#1D4ED8] underline font-medium"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              )}

              {/* PRIMARY ACTION BUTTON (Pill-shaped, Prayog Navy #0A1128) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A1128] hover:bg-[#0A233F] active:scale-[0.99] text-white py-3.5 sm:py-4 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-slate-950/20 cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading
                  ? mode === "register"
                    ? "Creating Account..."
                    : "Signing In..."
                  : mode === "register"
                  ? "REGISTER"
                  : "LOG IN"}
              </button>

              {/* Social Login Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  or
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm border border-slate-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {googleLoading
                    ? "Connecting..."
                    : mode === "register"
                    ? "Sign up with Google"
                    : "Sign in with Google"}
                </span>
              </button>
            </form>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: INFORMATIONAL CARD & TOGGLE (MATCHES IMAGE) */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="w-full md:border-l md:border-slate-200/90 md:pl-10 lg:pl-16 pt-8 md:pt-0 border-t border-slate-200/90 md:border-t-0 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6 sm:mb-8">
                {mode === "register" ? "Register" : "Register"}
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                Registering for this site allows you to access your order status
                and history. Just fill in the fields below, and we&apos;ll get a
                new account set up for you in no time. We will only ask you for
                information necessary to make the purchase process faster and
                easier.
              </p>

              {/* Prayog India Perks & Highlights */}
              <div className="space-y-3.5 my-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0A233F] flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Live Order Tracking
                    </h4>
                    <p className="text-xs text-slate-500">
                      Real-time courier dispatch status for all your robotics
                      kits & STEM components.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-[#FFC20E] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Prayog STEM Reward Coins
                    </h4>
                    <p className="text-xs text-slate-500">
                      Earn coins on every purchase and redeem for free drone parts,
                      sensors & accessories.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ReceiptText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Instant GST Invoicing
                    </h4>
                    <p className="text-xs text-slate-500">
                      Download valid GST tax invoices anytime for school, college,
                      or lab grants.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Saved Lab Addresses
                    </h4>
                    <p className="text-xs text-slate-500">
                      Save multiple delivery locations for fast 1-click reordering.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TOGGLE BUTTON (MATCHES IMAGE: LOGIN / REGISTER PILL BUTTON) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "register" ? "login" : "register")
                }
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold uppercase text-xs sm:text-sm px-10 py-3.5 rounded-full transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              >
                {mode === "register" ? "LOGIN" : "REGISTER"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
