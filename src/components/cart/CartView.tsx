"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { useStore, CartItem } from "@/context/StoreContext";
import { CUSTOMER_TYPE_RULES, CustomerType } from "@/data/customerTypes";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Heart,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Plane,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Coins,
  Sparkles,
  User,
  LogIn,
  RotateCcw,
  Check,
  X,
  Info,
} from "lucide-react";

type DeliveryMethod = "express" | "surface" | "store_pickup";

export const CartView: React.FC = () => {
  const {
    cart,
    wishlist,
    user,
    isLoggedIn,
    loginUser,
    logoutUser,
    setCustomerType,
    updateQuantity,
    removeFromCart,
    moveToWishlist,
    clearCart,
    redeemRewardPoints,
  } = useStore();

  // ── Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // ── Reward Points State
  const [pointsInput, setPointsInput] = useState("");
  const [redeemedDiscount, setRedeemedDiscount] = useState(0);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("surface");
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictionModalShown, setRestrictionModalShown] = useState(false);

  // ── Stock Validation Check
  const outOfStockItems = cart.filter((item) => {
    const isAvailable = item.variant
      ? item.variant.inStock
      : item.product.inStock;
    return !isAvailable;
  });

  // ── DGCA Shipping Restriction Check (Battery / Hazardous)
  const hasBatteryOrHazardous = cart.some((item) => {
    const tag = item.product.shippingTag;
    const name = item.product.name.toLowerCase();
    return (
      tag === "Battery Item" ||
      tag === "Hazardous" ||
      name.includes("battery") ||
      name.includes("lipo")
    );
  });

  // If battery item in cart, force Surface Freight and trigger Section 29 popup
  React.useEffect(() => {
    if (hasBatteryOrHazardous && !restrictionModalShown) {
      setShowRestrictionModal(true);
      setRestrictionModalShown(true);
      setDeliveryMethod("surface");
    }
  }, [hasBatteryOrHazardous, restrictionModalShown]);

  const effectiveDeliveryMethod =
    hasBatteryOrHazardous && deliveryMethod === "express"
      ? "surface"
      : deliveryMethod;

  // ── Customer Type & Promotional Pricing Matrix
  const currentCustomerType: CustomerType =
    user?.customerType || "Guest Customer";
  const customerRule = Object.values(CUSTOMER_TYPE_RULES).find(
    (r) => r.name === currentCustomerType,
  );
  const customerDiscountPercent = customerRule?.pricing.discountPercent || 0;

  // ── Math Calculations
  const mrpTotal = cart.reduce((sum, item) => {
    const mrp = item.variant ? item.variant.mrp : item.product.mrp;
    return sum + mrp * item.quantity;
  }, 0);

  // Base price (before customer-type promotional discount)
  const baseCatalogSubtotal = cart.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Customer segment discount (e.g. B2B 15% off, Registered 5% off)
  const segmentDiscount =
    customerDiscountPercent > 0
      ? Math.round(baseCatalogSubtotal * (customerDiscountPercent / 100))
      : 0;

  const discountedSubtotal = Math.max(0, baseCatalogSubtotal - segmentDiscount);
  const catalogSavings = Math.max(0, mrpTotal - baseCatalogSubtotal);

  // Delivery fee
  const deliveryFee =
    effectiveDeliveryMethod === "store_pickup"
      ? 0
      : discountedSubtotal > 999
        ? 0
        : 99; // Free above ₹999

  // GST 18% calculation (embedded / inclusive)
  const totalTaxable = Math.round(discountedSubtotal / 1.18);
  const gstAmount = discountedSubtotal - totalTaxable;

  // Grand total
  const grandTotal = Math.max(
    0,
    discountedSubtotal - couponDiscount - redeemedDiscount + deliveryFee,
  );

  // ── Handlers
  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (code === "PRAYOG10") {
      const discount = Math.round(discountedSubtotal * 0.1);
      setCouponDiscount(discount);
      setAppliedCoupon("PRAYOG10 (10% OFF)");
    } else if (code === "MAKER500") {
      const discount = Math.min(discountedSubtotal, 500);
      setCouponDiscount(discount);
      setAppliedCoupon("MAKER500 (Flat ₹500 OFF)");
    } else if (code === "ROBOTICS20" && discountedSubtotal >= 3000) {
      const discount = Math.round(discountedSubtotal * 0.2);
      setCouponDiscount(discount);
      setAppliedCoupon("ROBOTICS20 (20% OFF)");
    } else {
      setCouponError("Invalid or ineligible code. Try PRAYOG10 or MAKER500.");
    }
  };

  const handleRedeemPoints = () => {
    setPointsError(null);
    const pts = parseInt(pointsInput, 10);
    if (isNaN(pts) || pts <= 0) {
      setPointsError("Enter a valid number of coins.");
      return;
    }
    if (!user || user.rewardPoints < pts) {
      setPointsError(
        `Insufficient coins. You have ${user?.rewardPoints || 0} coins.`,
      );
      return;
    }
    const maxRedeemablePts = Math.floor(discountedSubtotal / 0.5);
    const appliedPts = Math.min(pts, maxRedeemablePts);
    const discount = redeemRewardPoints(appliedPts);
    setRedeemedDiscount((prev) => prev + discount);
    setPointsInput("");
  };

  const handleCheckPincode = () => {
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode)) {
      if (hasBatteryOrHazardous) {
        setPincodeStatus(
          `PIN ${pincode} verified: Surface Cargo Ground Delivery (3-5 business days).`,
        );
      } else {
        setPincodeStatus(
          `PIN ${pincode} verified: Priority Air Express Dispatch (24-48 hours).`,
        );
      }
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian postal PIN Code.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "Shopping Cart" }]} />

      {/* 2. Page Header & Segment Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full border border-[#00AEEF]/20">
              Section 16 · Unified Shopping Cart
            </span>
            {isLoggedIn ? (
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <User className="w-3 h-3" /> Logged In: {user?.name}
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                Guest Cart
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Your Shopping Cart
          </h1>
        </div>

        {/* Customer Type Pricing Tier Simulator */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 pl-2">
            Pricing Tier:
          </span>
          <select
            value={currentCustomerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerType)}
            className="text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
          >
            <option value="B2C Customer">B2C Customer (Standard)</option>
            <option value="B2B Customer">B2B Customer (15% Wholesale)</option>
            <option value="Registered Customer">
              Registered Customer (5% Loyalty)
            </option>
            <option value="Walk-in Customer">
              Walk-in Customer (Store POS)
            </option>
            <option value="Guest Customer">Guest Customer (Retail)</option>
          </select>
        </div>
      </div>

      {/* 3. Empty State */}
      {cart.length === 0 ? (
        <div className="py-24 text-center bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto my-8">
          <div className="w-20 h-20 rounded-3xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center mx-auto border border-[#00AEEF]/20 shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Explore our catalogue of Arduino boards, drone kits, LiDAR
              sensors, and STEM robotics hardware.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 active:scale-95"
          >
            <span>Explore Hardware Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items & Delivery (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Out of Stock Warning */}
            {outOfStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900 text-xs animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-black">Stock Validation Alert</h4>
                  <p className="text-red-700">
                    {outOfStockItems.length} item(s) in your cart are currently
                    out of stock. Please remove or move them to wishlist before
                    checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Section 30: Mixed Cart Shipping Restriction Notice */}
            {hasBatteryOrHazardous && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 space-y-2.5 text-amber-950 text-xs shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-200/80 text-amber-900 rounded-xl font-black text-[10px] uppercase tracking-wider">
                      Section 30 · Mixed Cart Rule
                    </span>
                    <h4 className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Entire Order → Surface Freight Only</span>
                    </h4>
                  </div>
                  <span className="font-mono text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                    Air Freight Disabled
                  </span>
                </div>

                <p className="text-amber-900 font-medium leading-relaxed">
                  Your cart contains mixed hardware (e.g. Flight Controllers,
                  Microcontrollers, and Lithium/LiPo Batteries). Because
                  aviation safety regulations prohibit flying lithium cells, the{" "}
                  <strong>
                    entire consignment will be safely transported via Surface
                    Ground Logistics
                  </strong>
                  .
                </p>

                <div className="bg-white/80 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">
                    Restricted Item Detected:
                  </span>
                  <span className="text-amber-900 font-extrabold font-mono">
                    {cart.find(
                      (i) =>
                        i.product.shippingTag === "Battery Item" ||
                        i.product.name.toLowerCase().includes("battery") ||
                        i.product.name.toLowerCase().includes("lipo"),
                    )?.product.name || "LiPo Battery Pack"}
                  </span>
                </div>
              </div>
            )}

            {/* Customer Type Promo Badge */}
            {customerDiscountPercent > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-black">
                    {currentCustomerType} Privilege: {customerDiscountPercent}%
                    instant discount applied!
                  </span>
                </div>
                <span className="font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  -₹{segmentDiscount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase text-slate-400">
                  Cart Items ({cart.reduce((a, b) => a + b.quantity, 0)})
                </span>
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              {cart.map((item) => {
                const price = item.variant
                  ? item.variant.price
                  : item.product.price;
                const mrp = item.variant ? item.variant.mrp : item.product.mrp;
                const sku = item.variant ? item.variant.sku : item.product.sku;
                const isInStock = item.variant
                  ? item.variant.inStock
                  : item.product.inStock;

                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || "std"}`}
                    className={`bg-white rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-2xs ${
                      !isInStock
                        ? "border-red-200 bg-red-50/20"
                        : "border-slate-200 hover:border-[#00AEEF]/40"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.product.slug || item.product.id}`}
                      >
                        <div className="relative w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 p-1 shrink-0 overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {sku}
                          </span>
                          {!isInStock && (
                            <span className="text-[9px] font-black uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/products/${item.product.slug || item.product.id}`}
                        >
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-[#00AEEF] transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>

                        {/* Variant Pill */}
                        {item.variant && (
                          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                              Variant: {item.variant.name}
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                          {mrp > price && (
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      {/* Stepper */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              -1,
                              item.variant?.id,
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black px-2 text-slate-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, 1, item.variant?.id)
                          }
                          className="w-7 h-7 rounded-lg bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Move to Wishlist / Remove */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            moveToWishlist(item.product, item.variant?.id)
                          }
                          className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                          title="Save for Later in Wishlist"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.variant?.id)
                          }
                          className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Method Selection */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
              <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#00AEEF]" /> Select Dispatch
                &amp; Delivery Mode
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Express Air */}
                <button
                  type="button"
                  disabled={hasBatteryOrHazardous}
                  onClick={() => {
                    if (hasBatteryOrHazardous) {
                      setShowRestrictionModal(true);
                    } else {
                      setDeliveryMethod("express");
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    effectiveDeliveryMethod === "express"
                      ? "border-[#00AEEF] bg-[#E0F7FC]/40 ring-2 ring-[#00AEEF]/20 cursor-pointer"
                      : hasBatteryOrHazardous
                        ? "border-red-200 bg-red-50/40 opacity-75 cursor-not-allowed"
                        : "border-slate-200 hover:border-slate-300 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-blue-600" /> Air
                      Freight
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase ${hasBatteryOrHazardous ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {hasBatteryOrHazardous ? "❌ Unavailable" : "FREE >₹999"}
                    </span>
                  </div>
                  {hasBatteryOrHazardous ? (
                    <div className="space-y-0.5 mt-1">
                      <p className="text-[10px] text-red-700 font-extrabold">
                        ❌ Air Freight – Unavailable
                      </p>
                      <span className="text-[9px] text-slate-500 font-bold block">
                        Reason: Contains Battery Products
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">
                      24-48 Hours pan-India flight cargo
                    </p>
                  )}
                </button>

                {/* Surface Express */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("surface")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    effectiveDeliveryMethod === "surface"
                      ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" /> Surface
                      Freight
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase">
                      ✔ Surface Freight
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    3-5 days ground freight (DGCA Battery Certified)
                  </p>
                </button>

                {/* Store Pickup */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("store_pickup")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    effectiveDeliveryMethod === "store_pickup"
                      ? "border-[#00AEEF] bg-[#E0F7FC]/40 ring-2 ring-[#00AEEF]/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" /> Store
                      Pickup
                    </span>
                    <span className="text-[10px] font-black text-emerald-600">
                      FREE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Collect from nearest tech desk
                  </p>
                </button>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#00AEEF]" /> Check Delivery
                Timelines by PIN Code
              </h4>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Indian PIN Code (e.g. 560100)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF]"
                />
                <button
                  onClick={handleCheckPincode}
                  className="bg-slate-900 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl hover:bg-[#00AEEF] transition-colors cursor-pointer"
                >
                  Check
                </button>
              </div>
              {pincodeStatus && (
                <p className="text-xs font-bold text-[#00AEEF] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                  {pincodeStatus}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout (Span 4) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
              <h3 className="text-base font-black tracking-tight text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-slate-400 font-normal">
                  {cart.reduce((a, b) => a + b.quantity, 0)} Items
                </span>
              </h3>

              {/* 1. Coupon Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#FFC20E]" /> Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PRAYOG10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-[#00AEEF] uppercase font-mono font-bold"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Applied {appliedCoupon}
                  </p>
                )}
                {couponError && (
                  <p className="text-xs font-bold text-red-400">
                    {couponError}
                  </p>
                )}
              </div>

              {/* 2. Reward Points Redemption (if logged in) */}
              {isLoggedIn && user && user.rewardPoints > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" /> Prayog
                      Coins
                    </label>
                    <span className="text-[11px] text-amber-300 font-bold">
                      {user.rewardPoints} Available (₹
                      {(user.rewardPoints * 0.5).toFixed(0)})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Enter coins to redeem"
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="flex-1 bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-bold"
                    />
                    <button
                      onClick={handleRedeemPoints}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 rounded-xl transition-colors cursor-pointer"
                    >
                      Redeem
                    </button>
                  </div>
                  {redeemedDiscount > 0 && (
                    <p className="text-xs font-bold text-amber-400">
                      ✓ Redeemed ₹{redeemedDiscount.toLocaleString("en-IN")} off
                    </p>
                  )}
                  {pointsError && (
                    <p className="text-xs font-bold text-red-400">
                      {pointsError}
                    </p>
                  )}
                </div>
              )}

              {/* 3. Detailed Calculation Matrix */}
              <div className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <span className="font-bold text-slate-400 line-through">
                    ₹{mrpTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Catalogue Discount</span>
                  <span>-₹{catalogSavings.toLocaleString("en-IN")}</span>
                </div>

                {segmentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-300 font-bold">
                    <span>{currentCustomerType} Discount</span>
                    <span>-₹{segmentDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-white">
                    ₹{discountedSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#FFC20E] font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {redeemedDiscount > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Coins Redeemed</span>
                    <span>-₹{redeemedDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    GST 18% <Info className="w-3 h-3 text-slate-500" />
                  </span>
                  <span className="text-emerald-400 font-bold">
                    ₹{gstAmount.toLocaleString("en-IN")} (Incl.)
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>
                    Delivery ({effectiveDeliveryMethod.replace("_", " ")})
                  </span>
                  <span
                    className={
                      deliveryFee === 0
                        ? "text-emerald-400 font-extrabold"
                        : "text-white font-bold"
                    }
                  >
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-[#FFC20E] text-lg">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* 4. Checkout Action */}
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
                    outOfStockItems.length > 0
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed pointer-events-none"
                      : "bg-[#00AEEF] hover:bg-[#0096D6] text-white shadow-[#00AEEF]/25 active:scale-95"
                  }`}
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
                </Link>

                <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    256-Bit Encrypted Payment Gateway &amp; Tax Invoice
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 29: Customer Shipping Restriction Popup Modal */}
      {showRestrictionModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowRestrictionModal(false)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                    DGCA AVIATION SAFETY REGULATION
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    ⚠ Shipping Restriction
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowRestrictionModal(false)}
                className="text-slate-400 hover:text-slate-700 font-black p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2 text-slate-800 font-medium leading-relaxed">
              <p className="font-extrabold text-amber-900 text-xs">
                Battery products cannot be shipped via Air Freight.
              </p>
              <p className="text-slate-600 text-xs">
                Your cart contains lithium battery cells or flight battery
                hardware. Please select <strong>Surface Mode</strong> for
                delivery.
              </p>
            </div>

            {/* Visual Restriction Switch */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 block">
                Automatic Restriction Applied:
              </span>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/80">
                <span className="font-bold text-slate-500 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-slate-400" /> Air Freight:
                </span>
                <span className="font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  ❌ Unavailable
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" /> Surface
                  Freight:
                </span>
                <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ✔ Selected (Safe Transit)
                </span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod("surface");
                  setShowRestrictionModal(false);
                }}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
              >
                Proceed with Surface Freight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
