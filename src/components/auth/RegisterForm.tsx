"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Package,
  Heart,
  MapPin,
  Coins,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const REGISTRATION_BENEFITS = [
  {
    icon: <Package className="w-5 h-5 text-[#00AEEF]" />,
    title: "Live Order Tracking",
    description:
      "Track dispatch, courier AWB numbers & real-time delivery status.",
  },
  {
    icon: <Heart className="w-5 h-5 text-red-500" />,
    title: "Multi-Device Wishlist",
    description: "Save hardware kits, modules, and sensors across all devices.",
  },
  {
    icon: <MapPin className="w-5 h-5 text-emerald-600" />,
    title: "Saved Address Book",
    description:
      "Save multiple lab, college, office, and home shipping addresses.",
  },
  {
    icon: <Coins className="w-5 h-5 text-amber-500" />,
    title: "Reward Points (Prayog Coins)",
    description:
      "Earn 100 welcome coins + coins on every order for instant discounts.",
  },
  {
    icon: <Clock className="w-5 h-5 text-purple-600" />,
    title: "Previous Order Invoices",
    description: "One-click GST tax invoices, re-order, and purchase history.",
  },
  {
    icon: <Zap className="w-5 h-5 text-sky-500" />,
    title: "1-Click Faster Checkout",
    description:
      "Pre-filled billing, GSTIN numbers & express delivery options.",
  },
];

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { loginUser } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Field validation helper checks
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    email.trim(),
  );
  const isPhoneValid = /^\d{10}$/.test(phone.replace(/\D/g, ""));
  const isPasswordLengthValid = password.length >= 6;
  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-Side Strict Validation Rules
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full legal name (minimum 2 characters).");
      return;
    }
    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit Indian mobile phone number.");
      return;
    }
    if (!isEmailValid) {
      setError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    if (!isPasswordLengthValid) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter confirm password.");
      return;
    }
    if (!agreeTerms) {
      setError(
        "You must accept the Terms of Service & Privacy Policy to create an account.",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.message || "Registration failed. Please check your details.",
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(
          `/login?registered=true&email=${encodeURIComponent(email.trim().toLowerCase())}`,
        );
      }, 1000);
    } catch (err: any) {
      setError(
        "Network error connecting to registration server. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="text-center space-y-1.5 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20 w-fit mx-auto">
          <Sparkles className="w-3 h-3" /> Section 18 · Customer Registration
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Create Your Prayog Account
        </h1>
        <p className="text-xs text-slate-500">
          Register to access student/maker discounts, track lab shipments, and
          earn Prayog Coins.
        </p>
      </div>

      {/* 2-Column Split: Form (Left) & Registration Benefits (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Registration Form (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900">
              Personal &amp; Security Credentials
            </h2>
            <p className="text-[11px] text-slate-500">
              All registration data is securely verified and encrypted.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-2xl border border-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Account created successfully! Redirecting to Sign In...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Name */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 block">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Om Prakash / Tanvi Sharma"
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-bold"
                />
              </div>
            </div>

            {/* 2-Column: Mobile & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 2. Mobile Number */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10-digit number"
                    className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-bold"
                  />
                </div>
                {phone.length > 0 && !isPhoneValid && (
                  <span className="text-[10px] text-amber-600 font-bold block">
                    Must be 10 digits
                  </span>
                )}
              </div>

              {/* 3. Email */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-bold"
                  />
                </div>
                {email.length > 0 && !isEmailValid && (
                  <span className="text-[10px] text-amber-600 font-bold block">
                    Valid email required
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 4. Password */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-50 text-slate-900 pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {password.length > 0 && !isPasswordLengthValid && (
                  <span className="text-[10px] text-amber-600 font-bold block">
                    Min. 6 characters
                  </span>
                )}
              </div>

              {/* 5. Confirm Password */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-50 text-slate-900 pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && !isPasswordMatch && (
                  <span className="text-[10px] text-red-500 font-bold block">
                    Passwords do not match
                  </span>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00AEEF] accent-[#00AEEF] mt-0.5"
                />
                <span className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  I agree to the Prayog India{" "}
                  <Link
                    href="/about"
                    className="text-[#00AEEF] font-bold hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  &amp;{" "}
                  <Link
                    href="/about"
                    className="text-[#00AEEF] font-bold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
            >
              <span>
                {loading
                  ? "Creating Account & Securing Password..."
                  : "Create Free Account"}
              </span>
              <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-extrabold text-[#00AEEF] hover:underline"
            >
              Sign In Here →
            </Link>
          </div>
        </div>

        {/* Right Column: Registration Benefits Showcase (Span 5) */}
        <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF] block">
              MEMBER PRIVILEGES
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              Registration Benefits
            </h3>
            <p className="text-xs text-slate-400">
              Why 50,000+ makers, engineers &amp; institutions trust Prayog
              India.
            </p>
          </div>

          <div className="space-y-4">
            {REGISTRATION_BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl hover:border-slate-700 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                  {benefit.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-white">
                    {benefit.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#00AEEF]/20 to-[#FFC20E]/10 border border-[#00AEEF]/30 p-4 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-slate-300 font-medium leading-tight">
              100% Genuine Certified Hardware &amp; Instant GST Invoices for
              Colleges &amp; Businesses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
