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
    <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 pb-32 sm:pb-12 space-y-5 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "Shopping Cart" }]} />

      {/* 2. Page Header & Segment Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-6">
        <div>
          {isLoggedIn ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
              <User className="w-3 h-3 text-emerald-600" /> Logged In: {user?.name}
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              Guest Cart
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Your Shopping Cart
          </h1>
        </div>

        {/* Customer Type Pricing Tier */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium shrink-0">Pricing Tier:</span>
          <select
            value={currentCustomerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerType)}
            className="bg-transparent text-xs font-bold text-slate-800 hover:text-[#2563EB] focus:outline-none cursor-pointer border-b border-slate-300 pb-0.5"
          >
            <option value="B2C Customer">B2C Customer (Standard)</option>
            <option value="B2B Customer">B2B Customer (15% Wholesale)</option>
            <option value="Registered Customer">Registered Customer (5% Loyalty)</option>
            <option value="Guest Customer">Guest Customer (Retail)</option>
          </select>
        </div>
      </div>

      {/* 3. Empty State */}
      {cart.length === 0 ? (
        <div className="py-24 text-center bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto my-8">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-200/60 shadow-sm">
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
            className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 active:scale-95"
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
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 text-xs text-emerald-900">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-[11px] sm:text-xs leading-tight">
                    {currentCustomerType} Privilege: {customerDiscountPercent}% instant discount applied!
                  </span>
                </div>
                <span className="font-extrabold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200 text-xs shrink-0 whitespace-nowrap shadow-2xs">
                  -₹{segmentDiscount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cart Items ({cart.reduce((a, b) => a + b.quantity, 0)})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
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
                      className="py-4 first:pt-0 last:pb-0 flex items-start sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.slug || item.product.id}`}
                        >
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 p-1 shrink-0 overflow-hidden">
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
                            <span className="text-[10px] font-mono text-slate-400">
                              {sku}
                            </span>
                            {!isInStock && (
                              <span className="text-[9px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/products/${item.product.slug || item.product.id}`}
                          >
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 hover:text-[#2563EB] transition-colors leading-snug">
                              {item.product.name}
                            </h3>
                          </Link>

                          {/* Variant Pill */}
                          {item.variant && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              Variant: {item.variant.name}
                            </span>
                          )}

                          {/* Price */}
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-sm sm:text-base font-bold text-slate-900">
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                            {mrp > price && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stepper & Actions */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                -1,
                                item.variant?.id,
                              )
                            }
                            className="w-7 h-7 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-2 text-slate-900 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, 1, item.variant?.id)
                            }
                            className="w-7 h-7 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              moveToWishlist(item.product, item.variant?.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Save for Later in Wishlist"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.variant?.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
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
            </div>

            {/* Delivery Method & Pincode (Clean, Integrated, No box-in-box) */}
            <div className="pt-6 border-t border-slate-200 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#2563EB]" /> Dispatch &amp; Delivery Method
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Air Freight */}
                <button
                  type="button"
                  onClick={() => {
                    if (hasBatteryOrHazardous) {
                      setShowRestrictionModal(true);
                    } else {
                      setDeliveryMethod("express");
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    effectiveDeliveryMethod === "express"
                      ? "border-[#2563EB] bg-blue-50/50"
                      : hasBatteryOrHazardous
                        ? "border-slate-200 bg-slate-50 opacity-60"
                        : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-blue-600" /> Air Freight
                    </span>
                    <span className="text-[10px] text-emerald-600">
                      {hasBatteryOrHazardous ? "Unavailable" : "FREE >₹999"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    24-48h flight cargo
                  </p>
                </button>

                {/* Surface Freight */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("surface")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    effectiveDeliveryMethod === "surface"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" /> Surface Freight
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Standard
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    3-5 days ground freight
                  </p>
                </button>

                {/* Store Pickup */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("store_pickup")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    effectiveDeliveryMethod === "store_pickup"
                      ? "border-[#2563EB] bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" /> Store Pickup
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Collect from nearest tech desk
                  </p>
                </button>
              </div>

              {/* Inline Pincode Check */}
              <div className="flex items-center gap-2 pt-1 max-w-sm">
                <div className="relative flex-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter PIN Code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <button
                  onClick={handleCheckPincode}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Check
                </button>
              </div>
              {pincodeStatus && (
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {pincodeStatus}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (Span 4) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Order Summary</h3>
                <span className="text-xs text-slate-500">
                  {cart.reduce((a, b) => a + b.quantity, 0)} Items
                </span>
              </div>

              {/* 1. Coupon Section */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#2563EB]" /> Have a Coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PRAYOG10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] uppercase font-mono font-bold"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Applied {appliedCoupon}
                  </p>
                )}
                {couponError && (
                  <p className="text-xs font-semibold text-red-500">
                    {couponError}
                  </p>
                )}
              </div>

              {/* 2. Reward Points Redemption (if logged in) */}
              {isLoggedIn && user && user.rewardPoints > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-500" /> Prayog Coins
                    </span>
                    <span className="text-[11px] text-amber-600 font-bold">
                      {user.rewardPoints} Available
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Coins to redeem"
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="flex-1 bg-white text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB]"
                    />
                    <button
                      onClick={handleRedeemPoints}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Redeem
                    </button>
                  </div>
                  {redeemedDiscount > 0 && (
                    <p className="text-xs font-bold text-emerald-600">
                      ✓ Redeemed ₹{redeemedDiscount.toLocaleString("en-IN")} off
                    </p>
                  )}
                  {pointsError && (
                    <p className="text-xs font-semibold text-red-500">
                      {pointsError}
                    </p>
                  )}
                </div>
              )}

              {/* 3. Detailed Calculation Matrix */}
              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <span className="text-slate-400 line-through">
                    ₹{mrpTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {catalogSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Catalogue Savings</span>
                    <span>-₹{catalogSavings.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {segmentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{currentCustomerType} Discount</span>
                    <span>-₹{segmentDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ₹{discountedSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {redeemedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coins Redeemed</span>
                    <span>-₹{redeemedDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    GST 18% <Info className="w-3 h-3 text-slate-400" />
                  </span>
                  <span className="text-slate-700 font-medium">
                    ₹{gstAmount.toLocaleString("en-IN")} (Incl.)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? "text-emerald-600 font-bold" : "text-slate-900 font-medium"}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-[#2563EB] text-base sm:text-lg font-extrabold">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* 4. Checkout Action */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                    outOfStockItems.length > 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none"
                      : "bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white shadow-blue-500/20 active:scale-95"
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure 256-Bit SSL Checkout</span>
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
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
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
