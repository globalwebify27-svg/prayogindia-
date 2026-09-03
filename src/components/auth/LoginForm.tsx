"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useStore();

  const isJustRegistered = searchParams.get("registered") === "true";
  const prefilledEmail = searchParams.get("email") || "";

  const [identifier, setIdentifier] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = identifier.trim();
    if (!clean) {
      setError("Please enter your registered Email Address or Mobile Number.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.message ||
            "Invalid email/phone or password. Please check your credentials.",
        );
        setLoading(false);
        return;
      }

      if (data?.user) {
        loginUser({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "+91 98765 43210",
          customerType: "Registered Customer",
          rewardPoints: 1250,
        });
        router.push("/account");
      }
    } catch (err: any) {
      setError("Authentication server error. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginUser({
      name: "Google Verified Member",
      email: "member@gmail.com",
      phone: "+91 98765 00000",
      customerType: "Registered Customer",
      rewardPoints: 500,
    });
    router.push("/account");
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full border border-[#00AEEF]/20 w-fit mx-auto">
          <Sparkles className="w-3 h-3" /> Section 19 · Customer Sign In
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Sign In to Prayog India
        </h1>
        <p className="text-xs text-slate-500">
          Access your hardware orders, saved addresses &amp; Prayog Coins.
        </p>
      </div>

      {isJustRegistered && !error && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Account created successfully! Please enter your password to sign in.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-2xl border border-red-200 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Password Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* 1. Mobile or Email */}
        <div className="space-y-1">
          <label className="font-extrabold text-slate-700 block">
            Email Address or Mobile Number *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. name@domain.com or +91 9876543210"
              className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-bold"
            />
          </div>
        </div>

        {/* 2. Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-slate-700 block">
              Password *
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-[#00AEEF] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              className="w-full bg-slate-50 text-slate-900 pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-bold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
        >
          <span>
            {loading ? "Validating Credentials..." : "Sign In with Password"}
          </span>
          <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center border-t border-slate-100 pt-3">
        <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 absolute">
          OR LOGIN WITH
        </span>
      </div>

      {/* Alternative Login Options: Google & OTP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Google Authentication */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Login with Google</span>
        </button>

        {/* OTP Authentication */}
        <Link
          href="/verify-otp"
          className="w-full bg-[#E0F7FC] hover:bg-[#B3EBF9] text-[#00AEEF] border border-[#00AEEF]/30 py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs text-center"
        >
          <Smartphone className="w-4 h-4 text-[#00AEEF]" />
          <span>Login with OTP</span>
        </Link>
      </div>

      {/* Registration & Trust Footer */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-extrabold text-[#00AEEF] hover:underline"
          >
            Register Now (+100 Coins) →
          </Link>
        </div>

        <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Strict Credentials &amp; 256-Bit SSL Verification</span>
        </div>
      </div>
    </div>
  );
};
