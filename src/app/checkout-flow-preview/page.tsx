"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Home,
  Building,
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  QrCode,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  ChevronRight,
  ShoppingBag,
  Info,
} from "lucide-react";

// Mock Existing Customer Data
const MOCK_EXISTING_CUSTOMER = {
  name: "Om Kumar",
  phone: "9876543210",
  email: "ohhmkumar4138@gmail.com",
  addresses: [
    {
      id: "addr-1",
      name: "Om Kumar",
      phone: "+91 98765 43210",
      houseNo: "Lab Block B, Floor 2",
      street: "Prayog Robotics Innovation Hub, Sector 62",
      city: "Ranchi",
      state: "Jharkhand",
      pincode: "834001",
      type: "Lab / Office",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "Om Kumar",
      phone: "+91 98765 43210",
      houseNo: "Flat 402, Skyline Residency",
      street: "Tech Zone 4, Near IT Park",
      city: "Ranchi",
      state: "Jharkhand",
      pincode: "834002",
      type: "Home",
      isDefault: false,
    },
  ],
};

const MOCK_ORDER_ITEMS = [
  {
    id: "p1",
    name: "Arduino Uno R3 SMD Edition Starter Pack",
    sku: "PRG-ARD-UNO-01",
    price: 2400,
    qty: 1,
    image: "/products/arduino_cutout.png",
  },
  {
    id: "p2",
    name: "HC-SR04 Ultrasonic Sensor Module (Pack of 2)",
    sku: "PRG-SEN-US-02",
    price: 299,
    qty: 1,
    image: "/products/robot_car_stem.png",
  },
];

type FlowStep = "phone" | "otp" | "customer_screen" | "payment" | "success";

export default function CheckoutFlowPreviewPage() {
  // Simulator Controls
  const [simulationMode, setSimulationMode] = useState<"existing" | "new">("existing");
  const [step, setStep] = useState<FlowStep>("phone");

  // Form states
  const [phoneNumber, setPhoneNumber] = useState(
    simulationMode === "existing" ? "9876543210" : "9123456789"
  );
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);

  // Existing Customer states
  const [existingAddresses, setExistingAddresses] = useState(MOCK_EXISTING_CUSTOMER.addresses);
  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  // New Customer Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newHouseNo, setNewHouseNo] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newPincode, setNewPincode] = useState("834001");
  const [newCity, setNewCity] = useState("Ranchi");
  const [newState, setNewState] = useState("Jharkhand");
  const [newAddressType, setNewAddressType] = useState<"Home" | "Lab / Office">("Lab / Office");

  // Order & Payment state
  const [selectedPayment, setSelectedPayment] = useState<"upi" | "card" | "cod">("upi");
  const [isPlaced, setIsPlaced] = useState(false);

  // Switch simulation mode
  const handleSwitchMode = (mode: "existing" | "new") => {
    setSimulationMode(mode);
    setStep("phone");
    setOtp("");
    setOtpSent(false);
    setIsPlaced(false);
    if (mode === "existing") {
      setPhoneNumber("9876543210");
    } else {
      setPhoneNumber("9123456789");
      setNewName("");
      setNewEmail("");
      setNewHouseNo("");
      setNewStreet("");
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.replace(/\D/g, "").length < 10) return;
    setOtpSent(true);
    setOtp("1234"); // Auto-fill test OTP for testing
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234" && otp !== "123456") {
      alert("Please enter test OTP: 1234");
      return;
    }
    // Navigate to respective customer branch
    setStep("customer_screen");
  };

  // Calculate order totals
  const subtotal = MOCK_ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  // Selected address object
  const activeAddress =
    simulationMode === "existing"
      ? existingAddresses.find((a) => a.id === selectedAddressId) || existingAddresses[0]
      : {
          name: newName || "New Customer",
          phone: `+91 ${phoneNumber}`,
          houseNo: newHouseNo,
          street: newStreet,
          city: newCity,
          state: newState,
          pincode: newPincode,
          type: newAddressType,
        };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* 1. Global Simulation Switcher Banner */}
      <div className="bg-[#005CA9] text-white px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#00AEEF] text-slate-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider">
              Interactive Prototype
            </span>
            <span className="font-bold text-sm hidden sm:inline">
              Phone Number Login &amp; Checkout Flow
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-sky-200 font-medium">Test Scenario:</span>
            <button
              onClick={() => handleSwitchMode("existing")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulationMode === "existing"
                  ? "bg-white text-[#005CA9] shadow-sm font-black"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              👤 Existing Customer (Om Kumar)
            </button>
            <button
              onClick={() => handleSwitchMode("new")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulationMode === "new"
                  ? "bg-white text-[#005CA9] shadow-sm font-black"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              ✨ New Customer (First-Time)
            </button>
            <button
              onClick={() => {
                setStep("phone");
                setOtp("");
                setOtpSent(false);
              }}
              title="Reset flow to Step 1"
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer ml-1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* Step Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${step === "phone" ? "text-[#00AEEF]" : "text-slate-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${step === "phone" ? "bg-[#00AEEF] text-white" : "bg-slate-200"}`}>
                1
              </div>
              <span>Mobile Entry</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step === "otp" ? "text-[#00AEEF]" : "text-slate-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${step === "otp" ? "bg-[#00AEEF] text-white" : "bg-slate-200"}`}>
                2
              </div>
              <span>OTP Verify</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step === "customer_screen" ? "text-[#00AEEF]" : "text-slate-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${step === "customer_screen" ? "bg-[#00AEEF] text-white" : "bg-slate-200"}`}>
                3
              </div>
              <span>{simulationMode === "existing" ? "Saved Address" : "New Registration"}</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step === "payment" || step === "success" ? "text-[#00AEEF]" : "text-slate-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${step === "payment" || step === "success" ? "bg-[#00AEEF] text-white" : "bg-slate-200"}`}>
                4
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {/* Dynamic Step View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Flow Box */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            {/* STEP 1: Phone Number Entry */}
            {step === "phone" && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-[#E0F7FC] text-[#00AEEF] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    <Phone className="w-3.5 h-3.5" /> Fast 1-Step Login
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Enter your mobile number to checkout
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    We will send a 4-digit verification code to confirm your phone number.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2.5">
                        <span className="text-base">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 10-digit number"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white pl-22 pr-4 py-3 rounded-xl text-sm font-bold text-slate-900 outline-none transition-all tracking-wider"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-start gap-2.5 text-xs text-sky-900 font-medium">
                    <Info className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
                    <div>
                      {simulationMode === "existing" ? (
                        <span>
                          <strong>Simulating Existing Customer:</strong> Phone{" "}
                          <code>9876543210</code> will automatically match saved profile <strong>Om Kumar</strong>.
                        </span>
                      ) : (
                        <span>
                          <strong>Simulating New Customer:</strong> Phone{" "}
                          <code>{phoneNumber}</code> will trigger the new customer registration &amp; delivery form.
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#00AEEF]/20 cursor-pointer transition-all"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === "otp" && (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setStep("phone")}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-3 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Phone Number
                  </button>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Verify Your Mobile Number
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Enter the 4-digit OTP sent to{" "}
                    <strong className="text-slate-900">+91 {phoneNumber}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      4-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-[#00AEEF] text-center font-mono text-2xl tracking-[0.5em] font-black py-3 rounded-xl text-slate-900 outline-none"
                      placeholder="1234"
                      autoFocus
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Test OTP Code: <strong>1234</strong> (Auto-filled)
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp("1234")}
                      className="underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#00AEEF]/20 cursor-pointer transition-all"
                  >
                    <span>Verify &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3 - SCENARIO 1: Existing Customer Identified */}
            {step === "customer_screen" && simulationMode === "existing" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#005CA9] uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Verified Customer Found
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">
                      Welcome back, {MOCK_EXISTING_CUSTOMER.name}!
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      +91 {phoneNumber} · {MOCK_EXISTING_CUSTOMER.email}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white text-[#005CA9] border border-sky-200 rounded-full text-[10px] font-black uppercase">
                    Saved Profile
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Select Delivery Address ({existingAddresses.length})
                    </h3>
                    <button
                      onClick={() =>
                        alert(
                          "Modal opened: In full implementation, this opens a quick dialog to save an additional address."
                        )
                      }
                      className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Address
                    </button>
                  </div>

                  <div className="space-y-3">
                    {existingAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                            isSelected
                              ? "border-[#00AEEF] bg-sky-50/40 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-1 w-4 h-4 text-[#00AEEF] focus:ring-[#00AEEF]"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-slate-900">
                                    {addr.name}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                    {addr.type}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 font-medium mt-1">
                                  {addr.houseNo}, {addr.street}
                                </p>
                                <p className="text-xs text-slate-600 font-medium">
                                  {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono mt-1">
                                  Phone: {addr.phone}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedStreet = prompt("Edit Street / Landmark:", addr.street);
                                if (updatedStreet) {
                                  setExistingAddresses((prev) =>
                                    prev.map((a) => (a.id === addr.id ? { ...a, street: updatedStreet } : a))
                                  );
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setStep("payment")}
                    className="w-full py-3.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#00AEEF]/20 cursor-pointer transition-all"
                  >
                    <span>Proceed Directly to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 - SCENARIO 2: New Customer Registration Form */}
            {step === "customer_screen" && simulationMode === "new" && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> New Customer Setup
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Complete Your Delivery Details
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Your number <strong className="text-slate-900">+91 {phoneNumber}</strong> is verified. Please provide your shipping details below.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newName || !newHouseNo || !newStreet) {
                      alert("Please fill out your Name, House/Flat and Street.");
                      return;
                    }
                    setStep("payment");
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Rohan Sharma"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (for Invoices) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. rohan@example.com"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        House / Flat / Lab No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newHouseNo}
                        onChange={(e) => setNewHouseNo(e.target.value)}
                        placeholder="e.g. Flat 302, Block C"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Street / Area / Landmark <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="e.g. Circular Road, Near Nucleus Mall"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="834001"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00AEEF] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Address Type
                    </label>
                    <div className="flex gap-2">
                      {(["Lab / Office", "Home"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewAddressType(type)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            newAddressType === type
                              ? "bg-[#00AEEF] text-white border-[#00AEEF]"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#00AEEF]/20 cursor-pointer transition-all mt-4"
                  >
                    <span>Save Details &amp; Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: Payment Selection & Place Order */}
            {step === "payment" && !isPlaced && (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setStep("customer_screen")}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-3 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Delivery Details
                  </button>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Select Payment Method
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Delivering to:{" "}
                    <strong className="text-slate-900">
                      {activeAddress.houseNo}, {activeAddress.street}, {activeAddress.city} - {activeAddress.pincode}
                    </strong>
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "upi", label: "Instant UPI (GPay / PhonePe / Paytm / BHIM)", sub: "Zero gateway fees · Instant confirmation", icon: QrCode },
                    { id: "card", label: "Credit / Debit Card / NetBanking", sub: "Visa, Mastercard, RuPay, 50+ Banks", icon: CreditCard },
                    { id: "cod", label: "Cash on Delivery (COD)", sub: "Pay upon physical delivery at doorstep", icon: Truck },
                  ].map((method) => {
                    const isSelected = selectedPayment === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id as any)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#00AEEF] bg-sky-50/40 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedPayment(method.id as any)}
                            className="w-4 h-4 text-[#00AEEF] focus:ring-[#00AEEF]"
                          />
                          <div>
                            <div className="text-xs font-black text-slate-900">{method.label}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{method.sub}</div>
                          </div>
                        </div>
                        <method.icon className="w-5 h-5 text-slate-400" />
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPlaced(true)}
                  className="w-full py-4 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/20 cursor-pointer transition-all"
                >
                  <Lock className="w-4 h-4 text-[#FFC20E]" />
                  <span>Pay ₹{grandTotal.toLocaleString()} &amp; Confirm Order</span>
                </button>
              </div>
            )}

            {/* STEP 5: Success & Live Confirmation */}
            {isPlaced && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Order Successfully Placed!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Order ID: <code className="font-mono font-bold text-slate-900">PRG-2026-9821</code>
                  <br />
                  A confirmation SMS has been dispatched to <strong>+91 {phoneNumber}</strong>.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-1">
                  <div className="font-bold text-slate-900">Consignee: {activeAddress.name}</div>
                  <div className="text-slate-600">{activeAddress.houseNo}, {activeAddress.street}</div>
                  <div className="text-slate-600">{activeAddress.city}, {activeAddress.state} - {activeAddress.pincode}</div>
                  <div className="text-[#005CA9] font-bold pt-1">Payment: {selectedPayment.toUpperCase()} (₹{grandTotal.toLocaleString()})</div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setIsPlaced(false);
                      setStep("phone");
                    }}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Test Another Scenario
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Order Summary Column */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#00AEEF]" />
                Cart Consignment ({MOCK_ORDER_ITEMS.length} items)
              </h3>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {MOCK_ORDER_ITEMS.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-slate-500 font-bold">{item.qty}x</span>{" "}
                    <span className="font-black text-slate-900 ml-1">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Standard Delivery</span>
                <span className="font-bold text-emerald-600 uppercase">FREE</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Estimated GST (18%)</span>
                <span className="font-bold text-slate-900">₹{gst.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-[#005CA9] text-base">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1 font-bold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Genuine Robotics &amp; STEM Hardware
              </div>
              <p>Safe checkout powered by SSL 256-bit encryption with express insured courier dispatch.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

