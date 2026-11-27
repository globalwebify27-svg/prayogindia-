"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore, CartItem } from "@/context/StoreContext";
import {
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  ShoppingBag,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";

interface CheckoutAuthGateProps {
  cart: CartItem[];
  subtotal: number;
  onContinueAsGuest: () => void;
}

export const CheckoutAuthGate: React.FC<CheckoutAuthGateProps> = ({
  cart,
  subtotal,
  onContinueAsGuest,
}) => {
  const { loginUser } = useStore();

  // Auth Method: "otp" (Default/Fast) or "password" (Email & Password)
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [emailMode, setEmailMode] = useState<"login" | "register">("register");

  // Mobile OTP States
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);

  // Email/Password Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // OTP Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  // Clean phone digits
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: cleanPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setCountdown(30);
        setTestOtpNotice(data.testOtp || "1234");
        setSuccessMsg(`OTP sent to +91 ${cleanPhone}. Please enter it below.`);
      } else {
        setError(data.message || "Failed to send OTP. Please check your number.");
      }
    } catch {
      setError("Network error sending OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const code = otpCode.trim();
    if (!code || (code.length !== 4 && code.length !== 6)) {
      setError("Please enter the 4-digit or 6-digit OTP code.");
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: cleanPhone,
          code,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setSuccessMsg("Mobile verified successfully! Redirecting to delivery address...");
        loginUser({
          id: data.user.id,
          name:
            data.user.name && !data.user.name.startsWith("Customer ")
              ? data.user.name
              : "",
          email:
            data.user.email &&
            !data.user.email.includes("@prayogindia.com") &&
            !data.user.email.includes("@otp.") &&
            !data.user.email.startsWith("user.")
              ? data.user.email
              : "",
          phone: `+91 ${cleanPhone}`,
          customerType: data.user.customerType || "Registered Customer",
          rewardPoints: data.user.rewardPoints || 100,
        });
      } else {
        setError(data.message || "Invalid or expired OTP. Please try again.");
      }
    } catch {
      setError("Network error verifying code. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Switch auth methods
  const handleMethodChange = (method: "otp" | "password") => {
    setAuthMethod(method);
    setError(null);
    setSuccessMsg(null);
  };

  // Email/Password Submit Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (emailMode === "login") {
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
              "Invalid email or password. Please check your credentials.",
          );
          setLoading(false);
          return;
        }

        if (data?.user) {
          loginUser({
            id: data.user.id,
            name: data.user.name || cleanEmail.split("@")[0],
            email: data.user.email,
            phone: data.user.phone || "+91 98765 43210",
            customerType: data.user.customerType || "Registered Customer",
            rewardPoints: data.user.rewardPoints || 100,
          });
        }
      } catch {
        setError("Network error while logging in. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Register Mode
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName.trim() || cleanEmail.split("@")[0],
            email: cleanEmail,
            password,
          }),
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
              id: loginData.user.id,
              name: loginData.user.name || fullName || cleanEmail.split("@")[0],
              email: loginData.user.email,
              phone: loginData.user.phone || "+91 98765 43210",
              customerType:
                loginData.user.customerType || "Registered Customer",
              rewardPoints: loginData.user.rewardPoints || 100,
            });
            return;
          }
        } catch {
          // If auto-login fails, switch to login view
        }

        setSuccessMsg(
          "Account created successfully! Please sign in with your password.",
        );
        setEmailMode("login");
      } catch {
        setError("Failed to create account. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Google 1-Tap Sign-In
  const handleGoogleSignIn = async () => {
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
          id: data.user.id,
          name: data.user.name || fbUser.displayName || "Customer",
          email: data.user.email || fbUser.email || "",
          phone: data.user.phone || "+91 98765 00000",
          customerType: data.user.customerType || "Registered Customer",
          rewardPoints: data.user.rewardPoints || 500,
        });
      } else {
        setError(data.message || "Failed to authenticate with Google.");
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(
          err.message || "Google authentication failed. Please try again.",
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-3 sm:py-6 px-3.5 sm:px-6 pb-6 sm:pb-8 animate-in fade-in duration-300">
      {/* Cart Reminder Pill */}
      <div className="bg-slate-100/90 border border-slate-200/90 rounded-xl px-3.5 py-2 mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-bold">
            {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in cart
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-extrabold text-slate-900">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        <Link
          href="/cart"
          className="text-[#2563EB] font-bold hover:underline"
        >
          View Cart
        </Link>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-lg shadow-slate-100/80">
        {/* Method Toggle Buttons: Mobile OTP (Recommended) vs Email & Password */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-full mb-4 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => handleMethodChange("otp")}
            className={`py-2 px-2 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === "otp"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Mobile OTP</span>
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider hidden sm:inline-block">
              Fast
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleMethodChange("password")}
            className={`py-2 px-2 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === "password"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Email / Password</span>
          </button>
        </div>

        {/* Heading */}
        <div className="space-y-0.5 mb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {authMethod === "otp" ? (
              <>
                <span>Quick Checkout with Mobile OTP</span>
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              </>
            ) : emailMode === "register" ? (
              "Create Account"
            ) : (
              "Welcome Back"
            )}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500">
            {authMethod === "otp"
              ? "Verify with your mobile number to instantly autofill address and preserve your order history."
              : emailMode === "register"
              ? "Register to place your order and track shipment updates."
              : "Sign in with your email and password to proceed to checkout."}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 mb-3.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 mb-3.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* OPTION 1: MOBILE OTP FLOW (RECOMMENDED FOR SEAMLESS CHECKOUT) */}
        {/* ============================================================== */}
        {authMethod === "otp" && (
          <div className="space-y-3.5 animate-in fade-in">
            {!otpSent ? (
              // Step 1: Phone input & Send OTP
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-slate-600 border-r border-slate-300 pr-2.5 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-full pl-16 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium tracking-wide"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 pl-1">
                    We will send an OTP via SMS to verify your identity.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpSending || cleanPhone.length < 10}
                  className="w-full mt-2 h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {otpSending ? (
                    <span>Sending OTP...</span>
                  ) : (
                    <>
                      <span>Get Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Step 2: OTP Entry & Verify
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-blue-50/70 border border-blue-100 rounded-xl px-3.5 py-2 text-blue-900">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>+91 {cleanPhone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                      setError(null);
                    }}
                    className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                      Enter OTP Code <span className="text-red-500">*</span>
                    </label>
                    {testOtpNotice && (
                      <button
                        type="button"
                        onClick={() => setOtpCode(testOtpNotice)}
                        className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold hover:bg-amber-100 cursor-pointer"
                        title="Click to auto-fill test code"
                      >
                        Auto-fill Test OTP: {testOtpNotice}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 4 or 6-digit OTP"
                      className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-mono tracking-widest font-semibold"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-slate-500">
                    Didn&apos;t receive code?
                  </span>
                  {countdown > 0 ? (
                    <span className="text-slate-400 font-medium">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={otpSending}
                      className="text-[#2563EB] font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying || !otpCode.trim()}
                  className="w-full mt-2 h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {otpVerifying ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify &amp; Proceed to Address</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* OPTION 2: EMAIL & PASSWORD FLOW (LOGIN / REGISTER)             */}
        {/* ============================================================== */}
        {authMethod === "password" && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Inner Sub-Tabs: Register vs Login */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmailMode("register");
                  setError(null);
                }}
                className={`font-bold pb-1 cursor-pointer transition-all ${
                  emailMode === "register"
                    ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create New Account
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setEmailMode("login");
                  setError(null);
                }}
                className={`font-bold pb-1 cursor-pointer transition-all ${
                  emailMode === "login"
                    ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Log In with Password
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {emailMode === "register" && (
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                    Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-full pl-4 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {emailMode === "login" && (
                <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                  <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-slate-900 accent-slate-900 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#2563EB] hover:underline font-semibold"
                  >
                    Lost password?
                  </Link>
                </div>
              )}

              {emailMode === "register" && (
                <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                  By registering, you agree to our{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="text-slate-800 font-semibold underline hover:text-[#2563EB]"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full mt-2 h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>
                    {emailMode === "register"
                      ? "Creating Account..."
                      : "Signing In..."}
                  </span>
                ) : (
                  <>
                    <span className="whitespace-nowrap">
                      {emailMode === "register" ? "Register & Continue" : "Log in & Continue"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Divider */}
        <div className="relative my-3.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white px-2.5 text-slate-400 font-medium uppercase tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google 1-Tap Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading || otpSending || otpVerifying}
          className="w-full h-11 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-semibold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
          <span className="whitespace-nowrap">
            {googleLoading
              ? "Connecting Google..."
              : "Continue with Google"}
          </span>
        </button>

        {/* Mandatory Verified Mobile Notice */}
        <div className="pt-3 mt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Fast 10-second checkout with your mobile number. Verified phone required for delivery and dispatch updates.
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-500 font-semibold">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          SSL Encrypted
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          Secure Checkout
        </span>
      </div>
    </div>
  );
};
