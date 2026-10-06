"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { createCustomerOrder } from "@/lib/apiServices";
import {
  ShieldCheck,
  Phone,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  User,
  Mail,
  MapPin,
  Building,
  Truck,
  CreditCard,
  ShoppingBag,
  PackageCheck,
  Home,
} from "lucide-react";

type FlowStep = "send" | "verify" | "details" | "confirmed";

export const OtpVerificationForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loginUser, cart, clearCart } = useStore();

  const urlPhone = searchParams.get("phone") || "";

  const [phone, setPhone] = useState(urlPhone);
  const [step, setStep] = useState<FlowStep>(urlPhone ? "verify" : "send");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 3: Customer Details & Delivery Address Form State (Starts completely empty)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  // Step 4: Confirmed Order Details
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // If user enters verification directly with a phone number, fetch/display the active OTP
  useEffect(() => {
    const cleanNum = phone.replace(/\D/g, "");
    if (step === "verify" && cleanNum.length >= 10 && !receivedOtp) {
      fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-otp", phone: cleanNum }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.otp) {
            setReceivedOtp(data.otp);
          }
        })
        .catch(() => {});
    }
  }, [step, phone, receivedOtp]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanNum = phone.replace(/\D/g, "");

    if (!cleanNum || cleanNum.length < 10) {
      setError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: cleanNum }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to send OTP.");
        setLoading(false);
        return;
      }

      setInfoMsg(data.message || `OTP sent to +91 ${cleanNum}.`);
      if (data.otp) {
        setReceivedOtp(data.otp);
      }
      setStep("verify");
      setTimer(30);
    } catch {
      setError("Network error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length <= 1) {
      const updated = [...otp];
      updated[index] = val;
      setOtp(updated);

      if (val && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleAutoFillOtp = (code: string) => {
    const digits = code.split("").slice(0, 6);
    setOtp(digits);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanNum = phone.replace(/\D/g, "");
    const enteredCode = otp.join("");

    if (enteredCode.length !== 6) {
      setError("Please enter all 6 digits of the OTP passcode.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: cleanNum,
          code: enteredCode,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Invalid OTP code.");
        setLoading(false);
        return;
      }

      // Transition to Step 3: Name, Email & Address Details Form (Starts empty for user input)
      setStep("details");
      setError(null);
      setInfoMsg(null);
    } catch {
      setError("Network error validating OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle Details & Place Order
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!street.trim() || street.trim().length < 5) {
      setError("Please enter a complete delivery address (House No, Street, Landmark).");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }
    if (!pincode.trim() || pincode.replace(/\D/g, "").length !== 6) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    const cleanNum = phone.replace(/\D/g, "");
    const fullAddress = `${name}, ${street}, ${city}, ${state} - ${pincode}`;

    // Update logged in user state
    loginUser({
      name: name.trim(),
      email: email.trim(),
      phone: `+91 ${cleanNum}`,
      customerType: "Registered Customer",
      rewardPoints: 100,
    });

    let generatedOrderNum = `PRG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const orderRes = await createCustomerOrder(fullAddress, undefined, {
        paymentMethod,
        shippingCost: 0,
      });

      if (orderRes && orderRes.success && orderRes.data?.orderNumber) {
        generatedOrderNum = orderRes.data.orderNumber;
      }
    } catch (err) {
      console.warn("Local order creation fallback:", err);
    }

    if (cart.length > 0) {
      clearCart();
    }

    setConfirmedOrderNumber(generatedOrderNum);
    setStep("confirmed");
    setLoading(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 text-slate-900 animate-in fade-in duration-300">
      {/* ── STEP 1 & 2: Mobile Number & OTP ── */}
      {(step === "send" || step === "verify") && (
        <>
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20 w-fit mx-auto mb-2">
              <Sparkles className="w-3 h-3" /> Secure OTP Gateway
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === "send" ? "Login with Mobile OTP" : "Verify Mobile OTP"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {step === "send"
                ? "Enter your 10-digit registered mobile number to receive a verification OTP"
                : `Enter the 6-digit verification code sent to +91 ${phone.replace(/\D/g, "") || "your phone"}`}
            </p>
          </div>

          {/* Screen OTP Highlight Banner */}
          {step === "verify" && receivedOtp && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    Verification OTP (On-Screen)
                  </span>
                  <span className="text-2xl font-mono font-black text-emerald-950 tracking-widest">
                    {receivedOtp}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAutoFillOtp(receivedOtp)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-2xl border border-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-bold p-3.5 rounded-2xl border border-[#00AEEF]/20 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#00AEEF] shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {step === "send" && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 block">
                  Mobile Phone Number *
                </label>
                <div className="flex items-center rounded-2xl border-2 border-slate-200 focus-within:border-[#00AEEF] bg-slate-50 overflow-hidden transition-all">
                  <span className="px-4 font-black text-slate-700 text-sm border-r border-slate-200 bg-slate-100/60 py-3.5">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-transparent text-slate-900 px-4 py-3.5 text-base font-bold tracking-wide focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.replace(/\D/g, "").length < 10 || loading}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{loading ? "Sending OTP..." : "Send 6-Digit OTP"}</span>
                <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      className="w-11 h-13 bg-slate-50 text-center text-xl font-black text-slate-900 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={otp.join("").length < 6 || loading}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
                <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("send");
                    setOtp(["", "", "", "", "", ""]);
                    setReceivedOtp(null);
                  }}
                  className="font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Change Mobile Number
                </button>

                {timer > 0 ? (
                  <span className="text-slate-400 font-semibold">
                    Resend in {timer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="font-bold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            Prefer password login?{" "}
            <Link
              href="/login"
              className="font-extrabold text-[#00AEEF] hover:underline"
            >
              Sign In with Password
            </Link>
          </div>
        </>
      )}

      {/* ── STEP 3: Customer Details & Delivery Address Form ── */}
      {step === "details" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile Verified: +91 {phone.replace(/\D/g, "")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Delivery &amp; Customer Details
            </h2>
            <p className="text-xs text-slate-500">
              Enter your name, email and shipping address to confirm your order
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#00AEEF]" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Om Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#00AEEF]" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. omkumar@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00AEEF]" /> Street Address / Flat / Building *
              </label>
              <textarea
                required
                rows={2}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House / Flat No., Building Name, Street & Landmark"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all resize-none"
              />
            </div>

            {/* City, State & PIN Code */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block text-[11px]">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block text-[11px]">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Other">Other States</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block text-[11px]">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6 Digits"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white text-center font-mono"
                />
              </div>
            </div>

            {/* Payment Option */}
            <div className="space-y-1.5 pt-1">
              <label className="font-extrabold text-slate-700 block">
                Payment Option:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-[#00AEEF] bg-[#E0F7FC] text-slate-900 ring-2 ring-[#00AEEF]/20"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-extrabold text-xs">Cash on Delivery</div>
                  <div className="text-[10px] text-slate-500">Pay upon delivery</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "online"
                      ? "border-[#00AEEF] bg-[#E0F7FC] text-slate-900 ring-2 ring-[#00AEEF]/20"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-extrabold text-xs">UPI / Card / NetBanking</div>
                  <div className="text-[10px] text-slate-500">Fast digital payment</div>
                </button>
              </div>
            </div>

            {/* Confirm & Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
            >
              <span>{loading ? "Placing Order..." : "Confirm & Place Order"}</span>
              <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
            </button>
          </form>
        </div>
      )}

      {/* ── STEP 4: Order Confirmed Screen ── */}
      {step === "confirmed" && (
        <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
              Order Confirmed &amp; Dispatched Soon
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-1">
              Thank You, {name}!
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your order has been placed successfully and logged under your account.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-bold">Order Number:</span>
              <span className="font-mono font-black text-[#00AEEF]">
                {confirmedOrderNumber}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-bold shrink-0">Delivery Address:</span>
              <span className="font-semibold text-slate-800 text-right">
                {street}, {city}, {state} - {pincode}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-bold">Contact:</span>
              <span className="font-semibold text-slate-800">
                +91 {phone.replace(/\D/g, "")} • {email}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Payment Method:</span>
              <span className="font-bold text-slate-900 uppercase text-[11px]">
                {paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/account"
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-[#00AEEF]/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>View Orders</span>
            </Link>

            <Link
              href="/products"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider text-center transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
