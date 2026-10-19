"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore, CartItem } from "@/context/StoreContext";
import {
  Eye,
  EyeOff,
  ShoppingBag,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
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
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");

  // Form Fields
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

  // Switch tabs
  const handleTabChange = (tab: "register" | "login") => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
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

    if (activeTab === "login") {
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
        setActiveTab("login");
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
        {/* Segmented Tab Buttons */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-full mb-3.5 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`py-2 rounded-full transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`py-2 rounded-full transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Log in
          </button>
        </div>

        {/* Heading */}
        <div className="space-y-0.5 mb-3.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === "register" ? "Register" : "Log in"}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500">
            {activeTab === "register"
              ? "Register to place your order and track shipment updates."
              : "Sign in with your email or mobile to proceed to checkout."}
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

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
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

          {/* Login specific row: Remember me & Lost password */}
          {activeTab === "login" && (
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
                Lost your password?
              </Link>
            </div>
          )}

          {/* Register specific text: Privacy Policy Disclaimer */}
          {activeTab === "register" && (
            <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
              Your personal data will be used to support your experience
              throughout this website, to manage access to your account, and for
              other purposes described in our{" "}
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

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 h-11 bg-[#0A1128] hover:bg-[#12365D] active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>
                {activeTab === "register"
                  ? "Creating Account..."
                  : "Signing In..."}
              </span>
            ) : (
              <>
                <span className="whitespace-nowrap">
                  {activeTab === "register" ? "Register" : "Log in"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-3">
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
          disabled={loading || googleLoading}
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

        {/* Tab switch hint */}
        <div className="text-center pt-2.5 text-xs text-slate-500">
          {activeTab === "register" ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className="text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                Log in
              </button>
            </span>
          ) : (
            <span>
              New customer?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className="text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </span>
          )}
        </div>

        {/* Dedicated Guest Checkout Button */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full h-10 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue as Guest</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
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
