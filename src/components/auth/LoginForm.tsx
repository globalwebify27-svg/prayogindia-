"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  AlertCircle,
  CheckCircle2,
  Smartphone,
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
      setError("Please enter your registered Email or Mobile No.");
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
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-[#F8FAFC]">
      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.03)] animate-in fade-in duration-300">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8">
          Login
        </h1>

        {isJustRegistered && !error && (
          <div className="mb-6 bg-emerald-50 text-emerald-800 text-xs font-medium p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Account created successfully! Please enter your password to sign in.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 text-xs font-medium p-3.5 rounded-xl border border-red-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input 1: Email or Mobile No */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or Mobile No"
              className="w-full bg-white text-slate-900 pl-12 pr-4 py-3.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Input 2: Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white text-slate-900 pl-12 pr-12 py-3.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all placeholder:text-slate-400 font-medium"
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

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#00AEEF] hover:text-[#0096D6] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-32 bg-[#00AEEF] hover:bg-[#0096D6] active:scale-[0.98] disabled:opacity-40 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        {/* Switch to Register */}
        <div className="mt-8 text-left text-xs font-medium text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#00AEEF] font-bold hover:text-[#0096D6] hover:underline transition-colors"
          >
            Register
          </Link>
        </div>

        {/* Alternative Login Options (Google & OTP) */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
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
              <span>Google Login</span>
            </button>

            <Link
              href="/verify-otp"
              className="w-full bg-[#E0F7FC] hover:bg-[#B3EBF9] text-[#00AEEF] border border-[#00AEEF]/20 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <Smartphone className="w-4 h-4 text-[#00AEEF]" />
              <span>Login with OTP</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
