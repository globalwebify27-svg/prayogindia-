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
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Lock,
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

  // Login Multi-Step (Amazon-style: Identifier -> Password -> Optional OTP -> Optional Profile Completion)
  const [loginStep, setLoginStep] = useState<"identifier" | "password" | "otp" | "complete_profile">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [detectedAccountName, setDetectedAccountName] = useState("");
  const [verifiedMobileForProfile, setVerifiedMobileForProfile] = useState("");

  // Profile Completion Fields for New Mobile Customers
  const [profileFullName, setProfileFullName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileHouse, setProfileHouse] = useState("");
  const [profileStreet, setProfileStreet] = useState("");
  const [profileLandmark, setProfileLandmark] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileState, setProfileState] = useState("");
  const [profilePincode, setProfilePincode] = useState("");
  const [profileAddressType, setProfileAddressType] = useState<"Home" | "Office" | "Other">("Home");

  // Registration Multi-Step (Amazon-style: Form Details -> Mobile OTP Verification)
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification States (Shared for Registration & Login OTP)
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);

  // Login Options
  const [rememberMe, setRememberMe] = useState(true);

  // Optional B2B fields for Register
  const [showB2B, setShowB2B] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    isJustRegistered
      ? "Account created successfully! Please sign in with your credentials."
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setLoginStep("identifier");
    setRegisterStep("form");
  }, [initialMode]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((registerStep === "otp" || loginStep === "otp") && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [registerStep, loginStep, countdown]);

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setLoginStep("identifier");
    setRegisterStep("form");
    setError(null);
    setSuccessMsg(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = newMode === "register" ? "/register" : "/login";
      window.history.replaceState({}, "", url.toString());
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN FLOW (AMAZON-STYLE STEP 1: IDENTIFIER CHECK & MOBILE OTP PRIMARY)
  // ══════════════════════════════════════════════════════════════════════════
  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError("Please enter your email or mobile phone number.");
      return;
    }

    const cleanDigits = cleanId.replace(/\D/g, "");
    const isMobile = cleanDigits.length >= 10 && !cleanId.includes("@");

    // Primary Auth Method: Mobile Number + OTP
    if (isMobile) {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/mobile/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanDigits.slice(-10) }),
        });
        const data = await res.json();
        if (data.success) {
          setLoginStep("otp");
          setCountdown(data.cooldownSeconds || 30);
          setTestOtpNotice(data.testOtp || "1234");
          setSuccessMsg(`OTP sent to +91 ${cleanDigits.slice(-10)}. Please enter it below.`);
        } else {
          setError(data.message || "Failed to send OTP to mobile number.");
        }
      } catch {
        setError("Network error sending mobile OTP. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Secondary Auth Method: Email Authentication
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", identifier: cleanId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "We cannot find an account with that email address. Please create an account.");
        setLoading(false);
        return;
      }

      setDetectedAccountName(data.name || "");
      setLoginStep("password");
    } catch {
      setError("Network error while verifying account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN FLOW (AMAZON-STYLE STEP 2: PASSWORD AUTHENTICATION)
  // ══════════════════════════════════════════════════════════════════════════
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Incorrect password. Please verify or reset your password.");
        setLoading(false);
        return;
      }

      if (data?.user) {
        loginUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || "",
          phone: data.user.phone || "",
          customerType: data.user.customerType || "Registered Customer",
          companyName: data.user.companyName,
          gstin: data.user.gstin,
          rewardPoints: typeof data.user.rewardPoints === "number" ? data.user.rewardPoints : 100,
        });
        router.push(targetRedirect);
      }
    } catch {
      setError("Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN FLOW (STEP 3: 1-CLICK MOBILE OTP SIGN-IN)
  // ══════════════════════════════════════════════════════════════════════════
  const handleInitiateLoginOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    const cleanPhone = identifier.replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please provide a valid 10-digit mobile number to sign in with OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: cleanPhone }),
      });
      const data = await res.json();

      if (data.success) {
        setLoginStep("otp");
        setCountdown(30);
        setTestOtpNotice(data.testOtp || "1234");
        setSuccessMsg(`OTP sent to +91 ${cleanPhone}. Please enter it below.`);
      } else {
        setError(data.message || "Failed to send OTP code.");
      }
    } catch {
      setError("Network error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = identifier.replace(/\D/g, "").slice(-10);
    const code = otpCode.trim();

    if (!code) {
      setError("Please enter the OTP verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/mobile/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, code }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.isNewUser) {
          setVerifiedMobileForProfile(cleanPhone);
          setLoginStep("complete_profile");
          setSuccessMsg("Mobile number verified! Please complete your delivery profile.");
          return;
        }

        if (data.user) {
          loginUser({
            id: data.user.id,
            name: data.user.name && !data.user.name.startsWith("Customer ") ? data.user.name : "",
            email: data.user.email || "",
            phone: data.user.phone || `+91 ${cleanPhone}`,
            customerType: data.user.customerType || "Registered Customer",
            companyName: data.user.companyName,
            gstin: data.user.gstin,
            rewardPoints: data.user.rewardPoints || 100,
          });
          router.push(targetRedirect);
        }
      } else {
        setError(data.message || "Invalid or expired OTP passcode.");
      }
    } catch {
      setError("Network error verifying code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!profileFullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!profileHouse.trim() || !profileStreet.trim() || !profileCity.trim() || !profileState.trim() || !profilePincode.trim()) {
      setError("Please fill in all mandatory delivery address fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifiedMobile: verifiedMobileForProfile || identifier.replace(/\D/g, "").slice(-10),
          fullName: profileFullName.trim(),
          email: profileEmail.trim() || undefined,
          houseFlatBuilding: profileHouse.trim(),
          streetArea: profileStreet.trim(),
          landmark: profileLandmark.trim() || undefined,
          city: profileCity.trim(),
          state: profileState.trim(),
          pincode: profilePincode.trim(),
          addressType: profileAddressType,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        loginUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || "",
          phone: data.user.phone,
          customerType: data.user.customerType || "Registered Customer",
          rewardPoints: data.user.rewardPoints || 100,
        });
        router.push(targetRedirect);
      } else {
        setError(data.message || "Failed to create customer profile.");
      }
    } catch {
      setError("Network error while creating customer profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // REGISTRATION FLOW (AMAZON-STYLE STEP 1: FORM DETAILS & INITIATE OTP)
  // ══════════════════════════════════════════════════════════════════════════
  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your confirm password.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        action: "initiate",
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || undefined,
        password,
        confirmPassword,
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
        if (data.code === "ACCOUNT_EXISTS") {
          setError("An account with this mobile number or email already exists. Please sign in.");
        } else {
          setError(data.message || "Registration failed. Please check your details.");
        }
        setLoading(false);
        return;
      }

      // Transition to Amazon-style OTP Verification Screen
      setRegisterStep("otp");
      setCountdown(30);
      setTestOtpNotice(data.testOtp || "1234");
      setSuccessMsg(`We sent a verification code to +91 ${cleanPhone}. Please enter it below to create your account.`);
    } catch {
      setError("Failed to initiate registration. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // REGISTRATION FLOW (AMAZON-STYLE STEP 2: VERIFY OTP & CREATE ACCOUNT)
  // ══════════════════════════════════════════════════════════════════════════
  const handleVerifyRegisterOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const code = otpCode.trim();

    if (!code) {
      setError("Please enter the OTP verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        setError(data.message || "Invalid or expired OTP. Please try again.");
        setLoading(false);
        return;
      }

      // Successfully verified & created account! Auto-login customer
      loginUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email || "",
        phone: data.user.phone || `+91 ${cleanPhone}`,
        customerType: data.user.customerType || "Registered Customer",
        companyName: data.user.companyName,
        gstin: data.user.gstin,
        rewardPoints: typeof data.user.rewardPoints === "number" ? data.user.rewardPoints : 100,
      });

      setSuccessMsg("Account created and verified! Redirecting...");
      router.push(targetRedirect);
    } catch {
      setError("Verification failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", phone: cleanPhone }),
      });
      const data = await res.json();

      if (data.success) {
        setCountdown(30);
        setTestOtpNotice(data.testOtp || "1234");
        setSuccessMsg(`New OTP sent to +91 ${cleanPhone}.`);
      } else {
        setError(data.message || "Failed to resend code.");
      }
    } catch {
      setError("Network error resending code.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with Unified Identity Verification
  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      const fbUser = result.user;

      // 1. Authenticate via Unified Google Identity API
      const googleRes = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sub: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          picture: fbUser.photoURL,
        }),
      });

      const googleData = await googleRes.json();

      if (googleData.success && googleData.isLinked && googleData.user) {
        loginUser({
          id: googleData.user.id,
          name: googleData.user.name,
          email: googleData.user.email || "",
          phone: googleData.user.phone || "",
          customerType: googleData.user.customerType || "Registered Customer",
          rewardPoints: typeof googleData.user.rewardPoints === "number" ? googleData.user.rewardPoints : 100,
        });
        router.push(targetRedirect);
        return;
      }

      // 2. If not linked, prompt customer to verify mobile number to link account
      if (googleData.success && !googleData.isLinked) {
        setSuccessMsg(googleData.message || "Google identity verified. Please verify your mobile number to link your account.");
        setMode("login");
        setLoginStep("identifier");
        if (fbUser.phoneNumber) {
          setIdentifier(fbUser.phoneNumber.replace(/\D/g, "").slice(-10));
        }
        return;
      }

      // 3. Fallback sync
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
          name: data.user.name,
          email: data.user.email || "",
          phone: data.user.phone || "",
          customerType: data.user.customerType || "Registered Customer",
          rewardPoints: typeof data.user.rewardPoints === "number" ? data.user.rewardPoints : 100,
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
    <div className="w-full min-h-[calc(100vh-180px)] bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block group">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A233F]">
              PRAYOG <span className="text-[#2563EB]">INDIA</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Hardware &amp; Robotics Component Platform
          </p>
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-100/80 animate-in fade-in duration-300">
        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-red-200 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold p-3.5 rounded-xl border border-emerald-200 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: SIGN IN (AMAZON-STYLE MULTI-STEP LOGIN)                       */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {mode === "login" && (
          <div>
            {/* Step 1: Identifier Entry */}
            {loginStep === "identifier" && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Sign in
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your mobile phone number or email address.
                  </p>
                </div>

                <form onSubmit={handleIdentifierSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Email or mobile phone number
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 9876543210 or name@example.com"
                      className="w-full bg-white text-slate-900 px-4 py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !identifier.trim()}
                    className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Checking...</span>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  By continuing, you agree to Prayog India&apos;s{" "}
                  <Link href="/terms-of-service" className="text-[#2563EB] font-semibold hover:underline">
                    Conditions of Use
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-[#2563EB] font-semibold hover:underline">
                    Privacy Notice
                  </Link>
                  .
                </p>

                {/* Divider & Switch to Register */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider">
                      New to Prayog India?
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="w-full h-11 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-bold text-xs sm:text-sm rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                >
                  Create your Prayog account
                </button>
              </div>
            )}

            {/* Step 2: Password Entry */}
            {loginStep === "password" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Sign in
                    </h1>
                    {detectedAccountName && (
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Welcome back, {detectedAccountName}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("identifier");
                      setPassword("");
                      setError(null);
                    }}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-bold text-slate-900">{identifier}</span>
                </div>

                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-bold text-slate-900">
                        Password
                      </label>
                      <Link
                        href={`/forgot-password?identifier=${encodeURIComponent(identifier)}`}
                        className="text-xs text-[#2563EB] font-bold hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white text-slate-900 pl-4 pr-11 py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Optional: Sign in with OTP button */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-white px-2.5 text-slate-400 font-bold uppercase tracking-wider">
                      Or
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInitiateLoginOtp}
                  disabled={loading}
                  className="w-full h-11 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Get an OTP on your phone</span>
                </button>
              </div>
            )}

            {/* Step 3: Login OTP Entry */}
            {loginStep === "otp" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Sign in with OTP
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("password");
                      setOtpCode("");
                      setError(null);
                    }}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Use Password
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  We sent a temporary verification code to <span className="font-bold text-slate-800">+91 {identifier.replace(/\D/g, "").slice(-10)}</span>.
                </p>

                <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-bold text-slate-900">
                        Enter OTP Code
                      </label>
                      {testOtpNotice && (
                        <button
                          type="button"
                          onClick={() => setOtpCode(testOtpNotice)}
                          className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold hover:bg-amber-100 cursor-pointer"
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
                        placeholder="Enter 4 or 6-digit code"
                        className="w-full bg-white text-slate-900 pl-10 pr-4 py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-mono tracking-widest font-semibold placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500">Didn&apos;t receive code?</span>
                    {countdown > 0 ? (
                      <span className="text-slate-400 font-medium">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInitiateLoginOtp}
                        disabled={loading}
                        className="text-[#2563EB] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otpCode.trim()}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <span>Verifying...</span> : <span>Verify &amp; Sign In</span>}
                  </button>
                </form>
              </div>
            )}

            {/* Step 4: Profile Completion (Phase 4: Mandatory Verified Mobile & Delivery Address) */}
            {loginStep === "complete_profile" && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Complete your profile
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Your mobile number is verified. Enter your delivery address to start shopping.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold">Verified Mobile:</span>{" "}
                    <span className="font-bold">+91 {verifiedMobileForProfile || identifier.replace(/\D/g, "").slice(-10)}</span>
                  </div>
                </div>

                <form onSubmit={handleCompleteProfileSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      placeholder="e.g. Om Kumar"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Email Address <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      House / Flat / Building <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileHouse}
                      onChange={(e) => setProfileHouse(e.target.value)}
                      placeholder="Flat No, House No, Building Name"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Street / Area / Colony <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileStreet}
                      onChange={(e) => setProfileStreet(e.target.value)}
                      placeholder="Road, Area, Sector, Colony"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Landmark <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={profileLandmark}
                      onChange={(e) => setProfileLandmark(e.target.value)}
                      placeholder="e.g. Near City Hospital"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-900">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        placeholder="City"
                        className="w-full bg-white text-slate-900 px-3.5 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-900">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={profilePincode}
                        onChange={(e) => setProfilePincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit PIN"
                        className="w-full bg-white text-slate-900 px-3.5 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileState}
                      onChange={(e) => setProfileState(e.target.value)}
                      placeholder="State (e.g. Jharkhand, Bihar, Delhi)"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <span>Creating account...</span> : <span>Save &amp; Continue</span>}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: CREATE ACCOUNT (AMAZON-STYLE REGISTRATION + OTP)              */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {mode === "register" && (
          <div>
            {/* Step 1: Account Registration Form */}
            {registerStep === "form" && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Create Account
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Register with your mobile number to manage orders and track shipments.
                  </p>
                </div>

                <form onSubmit={handleRegisterFormSubmit} className="space-y-3.5">
                  {/* Your Name */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Your name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First and last name"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Mobile number <span className="text-red-500">*</span>
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
                        placeholder="Mobile number"
                        className="w-full bg-white text-slate-900 pl-16 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400 tracking-wide"
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-bold text-slate-900">
                        Email <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white text-slate-900 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-white text-slate-900 pl-4 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Re-enter password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full bg-white text-slate-900 pl-4 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Optional B2B Section */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium select-none">
                      <input
                        type="checkbox"
                        checked={showB2B}
                        onChange={(e) => setShowB2B(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-slate-900 accent-slate-900 cursor-pointer"
                      />
                      <span>Buying for my organization / school (GST invoice)</span>
                    </label>
                  </div>

                  {showB2B && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-800">
                          Company / School / College Name
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Institution Name"
                          className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-800">
                          GSTIN <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          placeholder="22AAAAA0000A1Z5"
                          className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none uppercase font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    To verify your number, we will send you a text message with a temporary code. Message and data rates may apply.
                  </p>

                  <button
                    type="submit"
                    disabled={loading || phone.replace(/\D/g, "").length < 10}
                    className="w-full mt-2 h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <span>Verify mobile number</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                  >
                    Sign in &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Amazon-Style OTP Verification Screen */}
            {registerStep === "otp" && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Verify mobile number
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    A text with a One Time Password (OTP) has been sent to:
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs bg-blue-50/70 border border-blue-100 rounded-xl px-3.5 py-2.5 text-blue-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>+91 {phone.replace(/\D/g, "").slice(-10)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep("form");
                      setOtpCode("");
                      setError(null);
                    }}
                    className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <form onSubmit={handleVerifyRegisterOtpSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-bold text-slate-900">
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
                        className="w-full bg-white text-slate-900 pl-10 pr-4 py-3 text-xs sm:text-sm rounded-full border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-mono tracking-widest font-semibold placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500">Didn&apos;t receive code?</span>
                    {countdown > 0 ? (
                      <span className="text-slate-400 font-medium">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendRegisterOtp}
                        disabled={loading}
                        className="text-[#2563EB] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otpCode.trim()}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.99] text-white rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Creating your account...</span>
                    ) : (
                      <>
                        <span>Create your Prayog account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-[11px] text-slate-500 leading-relaxed text-center pt-1">
                  By creating an account, you agree to Prayog India&apos;s Conditions of Use and Privacy Notice.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Google 1-Tap Alternative (Only shown on initial step) */}
        {((mode === "login" && loginStep === "identifier") || (mode === "register" && registerStep === "form")) && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading || googleLoading}
              className="w-full h-10 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-semibold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
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
              <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Legal & Trust Links */}
      <div className="mt-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600">
          <Link href="/terms-of-service" className="hover:text-[#2563EB] hover:underline">
            Conditions of Use
          </Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:text-[#2563EB] hover:underline">
            Privacy Notice
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-[#2563EB] hover:underline">
            Help
          </Link>
        </div>
        <p className="text-[10px] text-slate-400">
          © 2026 Prayog India Store. All rights reserved.
        </p>
      </div>
    </div>
  );
};
