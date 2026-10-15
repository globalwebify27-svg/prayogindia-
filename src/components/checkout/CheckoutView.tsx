"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { MOCK_SAVED_ADDRESSES, Address } from "@/data/accountData";
import { createCustomerOrder } from "@/lib/apiServices";
import {
  ShoppingBag,
  MapPin,
  Truck,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  Plus,
  Tag,
  ArrowLeft,
  BadgePercent,
  Gift,
  UserCheck,
  ShieldCheck,
  Building2,
  Receipt,
  Trash2,
  Edit2,
  Star,
  Check,
  X,
  Plane,
  Coins,
  QrCode,
  Smartphone,
  Landmark,
  Banknote,
  Sparkles,
  Zap,
  Phone,
  Lock,
} from "lucide-react";
import {
  CustomerType,
  CUSTOMER_TYPE_RULES,
  calculateCustomerPrice,
  isCouponEligibleForCustomer,
  calculateEarnedRewards,
  getCustomerTypeCode,
} from "@/data/customerTypes";
import { INITIAL_PROMO_COUPONS, evaluatePromoCoupon } from "@/data/promoData";
import { calculateDeliveryRules } from "@/data/deliveryRules";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
  "Chandigarh",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

export const CheckoutView: React.FC = () => {
  const { cart, user, isLoggedIn, clearCart, redeemRewardPoints } = useStore();

  // ── Customer Profile Information (Auto-populated if logged in, empty otherwise)
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerMobile, setCustomerMobile] = useState(
    user?.phone?.replace(/\D/g, "").slice(-10) || "",
  );
  const [isPhoneVerified, setIsPhoneVerified] = useState(!!user);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [checkoutOtp, setCheckoutOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [checkoutReceivedOtp, setCheckoutReceivedOtp] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with logged in user state
  React.useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone)
        setCustomerMobile(user.phone.replace(/\D/g, "").slice(-10));
      setIsPhoneVerified(true);
    }
  }, [user]);

  // When mobile number changes and does not match logged-in user phone, require re-verification
  const handleMobileChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setCustomerMobile(clean);
    if (
      user &&
      user.phone &&
      user.phone.replace(/\D/g, "").slice(-10) === clean
    ) {
      setIsPhoneVerified(true);
    } else {
      setIsPhoneVerified(false);
    }
  };

  const handleSendCheckoutOtp = async () => {
    setOtpError(null);
    setOtpMessage(null);
    if (!customerMobile || customerMobile.length < 10) {
      setOtpError("Please enter a valid 10-digit mobile phone number first.");
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: customerMobile }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpMessage(data.message || `OTP sent to +91 ${customerMobile}`);
        if (data.otp) setCheckoutReceivedOtp(data.otp);
        setShowOtpModal(true);
      } else {
        setOtpError(data.message || "Failed to send OTP.");
      }
    } catch {
      setOtpError("Network error sending verification code.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyCheckoutOtp = async () => {
    setOtpError(null);
    if (!checkoutOtp.trim() || checkoutOtp.trim().length !== 6) {
      setOtpError("Please enter the 6-digit OTP code.");
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: customerMobile,
          code: checkoutOtp.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPhoneVerified(true);
        setShowOtpModal(false);
        setCheckoutOtp("");
        setValidationError(null);
      } else {
        setOtpError(data.message || "Invalid or expired OTP passcode.");
      }
    } catch {
      setOtpError("Network error verifying code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Customer Type Selection
  const [activeCustomerType, setActiveCustomerType] = useState<CustomerType>(
    user?.customerType || "B2C Customer",
  );

  // ── Multiple Addresses Management (Add, Edit, Delete, Set Default)
  const [addresses, setAddresses] = useState<Address[]>(MOCK_SAVED_ADDRESSES);
  const [selectedShippingAddressId, setSelectedShippingAddressId] =
    useState<string>(
      addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || "",
    );
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedBillingAddressId, setSelectedBillingAddressId] =
    useState<string>(
      addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || "",
    );

  // Add/Edit Address Modal State
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrFormName, setAddrFormName] = useState("");
  const [addrFormPhone, setAddrFormPhone] = useState("");
  const [addrFormStreet, setAddrFormStreet] = useState("");
  const [addrFormCity, setAddrFormCity] = useState("");
  const [addrFormState, setAddrFormState] = useState("Karnataka");
  const [addrFormPincode, setAddrFormPincode] = useState("");
  const [addrFormType, setAddrFormType] = useState<
    "Home" | "Office" | "Lab / College"
  >("Office");
  const [addrFormIsDefault, setAddrFormIsDefault] = useState(false);
  const [pincodeValidationMsg, setPincodeValidationMsg] = useState<
    string | null
  >(null);

  // ── GST Details & Company Information
  const [requireGSTInvoice, setRequireGSTInvoice] = useState(
    activeCustomerType === "B2B Customer" || !!user?.gstin,
  );
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [gstinNumber, setGstinNumber] = useState(user?.gstin || "");

  // ── Shipping Method State
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<
    "standard" | "ranchi_24h" | "faster_express" | "store_pickup"
  >("standard");

  // ── Coupon & Rewards State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [useRewardPoints, setUseRewardPoints] = useState(false);

  // ── Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<
    "upi" | "card" | "netbanking" | "cod"
  >("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlacedDemo, setIsOrderPlacedDemo] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(
    null,
  );

  // ── Customer Type Change
  const handleCustomerTypeChange = (newType: CustomerType) => {
    setActiveCustomerType(newType);
    if (newType === "B2B Customer") {
      setRequireGSTInvoice(true);
    }
    if (appliedCoupon && couponCode) {
      const validation = isCouponEligibleForCustomer(couponCode, newType);
      if (!validation.eligible) {
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponError(`Applied coupon removed: ${validation.message}`);
      }
    }
  };

  // ── Cart Calculations
  const subtotal = cart.reduce((sum, item) => {
    const rawPrice = item.variant ? item.variant.price : item.product.price;
    const { unitPrice } = calculateCustomerPrice(
      rawPrice,
      activeCustomerType,
      item.quantity,
    );
    return sum + unitPrice * item.quantity;
  }, 0);

  const mrpTotal = cart.reduce((sum, item) => {
    const mrp = item.variant ? item.variant.mrp : item.product.mrp;
    return sum + mrp * item.quantity;
  }, 0);

  const rewardPointsAvailable = user?.rewardPoints || 1250;
  const rewardDiscount = Math.round(rewardPointsAvailable * 0.5);

  // ── DGCA Shipping Restriction Check
  const hasRestrictedBatteryItem = cart.some(
    (item) =>
      item.product.shippingTag === "Battery Item" ||
      item.product.shippingTag === "Hazardous" ||
      item.product.airFreightAllowed === false ||
      item.product.name.toLowerCase().includes("battery") ||
      item.product.name.toLowerCase().includes("lipo"),
  );

  // ── Section 24 Delivery Calculation Engine
  const selectedAddr = addresses.find(
    (a) => a.id === selectedShippingAddressId,
  );
  const deliveryCity = selectedAddr?.city || "Bengaluru";
  const deliveryPincode = selectedAddr?.pincode || "560100";

  const totalWeightGrams = cart.reduce(
    (sum, item) => sum + item.quantity * 250,
    0,
  );

  const deliveryCalc = calculateDeliveryRules({
    subtotal,
    totalWeightGrams,
    deliveryCity,
    pincode: deliveryPincode,
    deliveryOption: selectedDeliveryMethod as any,
    hasRestrictedBattery: hasRestrictedBatteryItem,
  });

  const shippingFee = deliveryCalc.fee;
  const grandTotal = Math.max(
    0,
    subtotal -
      couponDiscount -
      (useRewardPoints ? rewardDiscount : 0) +
      shippingFee,
  );
  const isFreeStandardShipping = subtotal >= 2000;
  const isRanchiEligible = deliveryCalc.isRanchiEligible;
  const effectiveDeliveryMethod = selectedDeliveryMethod;

  // ── Section 23 Promo Coupon Application (Server-Authoritative)
  const handleApplyCoupon = async (code: string) => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setCouponCode(c);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: c,
          cartTotal: subtotal,
          customerType: activeCustomerType,
          cartItems: cart.map((item) => ({
            category: item.product.category,
            sku: item.product.sku,
            price: item.product.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCouponDiscount(data.data.discountAmount);
        setAppliedCoupon(
          `${data.data.couponCode} (-₹${data.data.discountAmount.toLocaleString()})`,
        );
        setCouponError(null);
        return;
      } else {
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponError(data.message || "Invalid coupon code.");
        return;
      }
    } catch {
      // Local fallback evaluation if offline
      const matchedCoupon = INITIAL_PROMO_COUPONS.find(
        (item) => item.code.toUpperCase() === c,
      );
      if (matchedCoupon) {
        const evaluation = evaluatePromoCoupon(
          matchedCoupon,
          subtotal,
          activeCustomerType,
          user?.email,
          false,
          false,
          cart.map((item) => ({
            category: item.product.category,
            sku: item.product.sku,
            price: item.product.price,
            quantity: item.quantity,
          })),
        );

        if (evaluation.valid) {
          setCouponDiscount(evaluation.discountAmount);
          setAppliedCoupon(
            `${matchedCoupon.code} (-₹${evaluation.discountAmount.toLocaleString()})`,
          );
          setCouponError(null);
          return;
        }
      }
      setCouponDiscount(0);
      setAppliedCoupon(null);
      setCouponError("Could not validate coupon. Please try again.");
    }
  };

  // ── Address CRUD Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrFormName(customerName);
    setAddrFormPhone(customerMobile);
    setAddrFormStreet("");
    setAddrFormCity("Bengaluru");
    setAddrFormState("Karnataka");
    setAddrFormPincode("560100");
    setAddrFormType("Office");
    setAddrFormIsDefault(addresses.length === 0);
    setPincodeValidationMsg(null);
    setShowAddressModal(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddrFormName(addr.name);
    setAddrFormPhone(addr.phone);
    setAddrFormStreet(addr.street);
    setAddrFormCity(addr.city);
    setAddrFormState(addr.state);
    setAddrFormPincode(addr.pincode);
    setAddrFormType(addr.type);
    setAddrFormIsDefault(addr.isDefault);
    setPincodeValidationMsg(null);
    setShowAddressModal(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      alert("You must have at least one delivery address.");
      return;
    }
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (selectedShippingAddressId === id) {
      setSelectedShippingAddressId(updated[0].id);
    }
    if (selectedBillingAddressId === id) {
      setSelectedBillingAddressId(updated[0].id);
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    );
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrFormPincode.trim().length !== 6 || !/^\d+$/.test(addrFormPincode)) {
      setPincodeValidationMsg("Please enter a valid 6-digit Indian PIN Code.");
      return;
    }

    if (editingAddressId) {
      // Edit existing
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === editingAddressId) {
            return {
              ...a,
              name: addrFormName,
              phone: addrFormPhone,
              street: addrFormStreet,
              city: addrFormCity,
              state: addrFormState,
              pincode: addrFormPincode,
              type: addrFormType,
              isDefault: addrFormIsDefault,
            };
          }
          return addrFormIsDefault ? { ...a, isDefault: false } : a;
        }),
      );
    } else {
      // Create new
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        name: addrFormName,
        phone: addrFormPhone,
        street: addrFormStreet,
        city: addrFormCity,
        state: addrFormState,
        pincode: addrFormPincode,
        type: addrFormType,
        isDefault: addrFormIsDefault || addresses.length === 0,
      };

      setAddresses((prev) => {
        const next = addrFormIsDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : [...prev];
        return [...next, newAddr];
      });
      setSelectedShippingAddressId(newAddr.id);
    }
    setShowAddressModal(false);
  };

  // ── Place Order Final Action with Strict Validations
  const handlePlaceOrder = async () => {
    setValidationError(null);

    // 1. Mandatory Customer Contact Validation
    if (!customerName.trim() || customerName.trim().length < 2) {
      setValidationError("Please enter a valid Full Name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (
      !customerMobile.trim() ||
      customerMobile.replace(/\D/g, "").length < 10
    ) {
      setValidationError("Please enter a valid 10-digit Mobile Phone Number.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setValidationError(
        "Please enter a valid Email Address for invoice delivery.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Mandatory Phone Verification Gate
    if (!isPhoneVerified) {
      setValidationError(
        "Please verify your mobile number via OTP before placing the order.",
      );
      handleSendCheckoutOtp();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Mandatory Shipping Address Validation
    const selectedAddr = addresses.find(
      (a) => a.id === selectedShippingAddressId,
    );
    if (
      !selectedAddr ||
      !selectedAddr.street.trim() ||
      !selectedAddr.city.trim() ||
      selectedAddr.pincode.trim().length !== 6
    ) {
      setValidationError(
        "Please select or add a complete delivery address with a valid 6-digit PIN code.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 3. Mandatory B2B GST Validation
    if (requireGSTInvoice) {
      if (!companyName.trim()) {
        setValidationError(
          "Company / Institution Name is required for B2B GST Tax Invoice.",
        );
        return;
      }
      if (!gstinNumber.trim() || gstinNumber.trim().length !== 15) {
        setValidationError(
          "A valid 15-character GSTIN number is required for B2B Input Tax Credit.",
        );
        return;
      }
    }

    setIsSubmitting(true);
    let confirmedOrderNumber: string | null = null;

    try {
      const fullAddressStr = `${selectedAddr.name}, ${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`;
      const res = await createCustomerOrder(fullAddressStr, selectedAddr.id, {
        couponCode: appliedCoupon ? couponCode : undefined,
        rewardPointsUsed: useRewardPoints ? rewardPointsAvailable : 0,
        paymentMethod,
        shippingCost: shippingFee,
      });

      if (res && res.success && res.data) {
        confirmedOrderNumber = res.data.orderNumber;
        const createdOrderId = res.data.id;

        // If online payment (Razorpay flow)
        if (paymentMethod !== "cod") {
          try {
            const payOrderRes = await fetch("/api/payment/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: createdOrderId }),
            });
            const payData = await payOrderRes.json();

            if (payData.success && payData.data) {
              await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: createdOrderId,
                  razorpay_order_id: payData.data.razorpayOrderId,
                  razorpay_payment_id: `pay_${Date.now()}`,
                  razorpay_signature: "mock_verified_signature",
                }),
              });
            }
          } catch (payErr) {
            console.warn("Payment flow note:", payErr);
          }
        }
      }
    } catch (e) {
      console.warn("Order placement fallback:", e);
    }

    if (!confirmedOrderNumber) {
      confirmedOrderNumber = `PRG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (useRewardPoints) {
      redeemRewardPoints(rewardPointsAvailable);
    }

    clearCart();
    setPlacedOrderNumber(confirmedOrderNumber);
    setIsOrderPlacedDemo(true);
    setIsSubmitting(false);
  };

  // ── Order Confirmation Screen
  if (isOrderPlacedDemo) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We’ve received your order and are preparing it for shipment.
          </p>
        </div>

        {/* Clean Summary Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Order Number
              </span>
              <span className="font-mono font-extrabold text-slate-900 text-sm">
                {placedOrderNumber}
              </span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              Confirmed
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Payment</span>
              <span className="font-bold text-slate-800 uppercase">
                {paymentMethod === "cod" ? "Cash on Delivery" : `${paymentMethod.toUpperCase()} (Paid)`}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Delivery</span>
              <span className="font-medium text-slate-800">
                {effectiveDeliveryMethod === "ranchi_24h"
                  ? "Ranchi 24-Hour Express"
                  : effectiveDeliveryMethod === "store_pickup"
                    ? "In-Store Pickup"
                    : "Standard Surface Express (2-4 Days)"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/account/orders"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>View My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty Cart Fallback
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-[#2563EB]/20">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Your Cart is Empty
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Please add microcontrollers, sensors, or robotics kits before opening
          checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Products</span>
        </Link>
      </div>
    );
  }

  // ── Unauthenticated / Unverified Checkout Gate Screen
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 space-y-6 animate-in fade-in duration-300">
        <CategoryBreadcrumb
          items={[
            { label: "Cart", href: "/cart" },
            { label: "Verification Required" },
          ]}
        />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-[#2563EB]/20 shadow-md">
            <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-3.5 py-1 rounded-full border border-[#2563EB]/20 inline-block">
              Authentication Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In or Verify Mobile to Order
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              To prevent fraudulent orders, guarantee GST tax invoicing, and
              track courier dispatch, please sign in to your account or verify
              your 10-digit mobile number with an OTP.
            </p>
          </div>

          {/* Quick Action Pathways */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <Link
              href="/login"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/20 active:scale-95 transition-all"
            >
              <span>Sign In with Password</span>
              <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
            </Link>

            <Link
              href="/verify-otp"
              className="bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-[#2563EB]/30 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-[#2563EB]" />
              <span>Verify Mobile OTP</span>
            </Link>
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-extrabold text-[#2563EB] hover:underline"
            >
              Create New Account (+100 Coins) →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Full-Page Address Add / Edit Screen (Amazon-style Layout)
  if (showAddressModal) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
          <button
            type="button"
            onClick={() => setShowAddressModal(false)}
            className="text-slate-600 hover:text-[#2563EB] cursor-pointer"
          >
            Your Account
          </button>
          <span>›</span>
          <button
            type="button"
            onClick={() => setShowAddressModal(false)}
            className="text-slate-600 hover:text-[#2563EB] cursor-pointer"
          >
            Your Addresses
          </button>
          <span>›</span>
          <span className="text-[#E65100] font-bold">
            {editingAddressId ? "Edit Address" : "New Address"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Column (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {editingAddressId ? "Edit address" : "Add a new address"}
              </h1>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Prayog collection hub delivery points: Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, Pune.",
                  )
                }
                className="text-xs text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1.5 mt-1 font-medium"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                  P
                </span>
                Or find a Prayog collection location near you
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              {/* Autofill Current Location Banner */}
              <div className="bg-[#EBF8FA] border border-[#BCE9F5] rounded-xl p-3.5 flex items-center justify-between gap-3 max-w-2xl">
                <span className="text-xs font-bold text-slate-800">
                  Save time. Autofill your current location.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        () => {
                          setAddrFormCity((c) => c || "Bengaluru");
                          setAddrFormState((s) => s || "Karnataka");
                          setAddrFormPincode((p) => p || "560103");
                        },
                        () => {
                          setAddrFormCity((c) => c || "Bengaluru");
                          setAddrFormState((s) => s || "Karnataka");
                          setAddrFormPincode((p) => p || "560103");
                        },
                      );
                    }
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-300 font-bold text-xs px-4 py-1.5 rounded-full text-slate-800 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  Autofill
                </button>
              </div>

              {/* Country/Region */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Country/Region
                </label>
                <select
                  disabled
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none max-w-2xl cursor-not-allowed"
                >
                  <option value="India">India</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Full name (First and Last name)
                </label>
                <input
                  type="text"
                  required
                  value={addrFormName}
                  onChange={(e) => setAddrFormName(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all max-w-2xl"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Mobile number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={addrFormPhone}
                  onChange={(e) => setAddrFormPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all max-w-2xl"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  May be used to assist delivery
                </p>
              </div>

              {/* Pincode */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6 digits [0-9] PIN code"
                  value={addrFormPincode}
                  onChange={(e) => setAddrFormPincode(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all max-w-2xl"
                />
                {pincodeValidationMsg && (
                  <p className="text-red-500 text-[11px] mt-1 font-semibold">
                    {pincodeValidationMsg}
                  </p>
                )}
              </div>

              {/* Flat, House no., Building */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Flat, House no., Building, Company, Apartment
                </label>
                <input
                  type="text"
                  required
                  value={addrFormStreet}
                  onChange={(e) => setAddrFormStreet(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all max-w-2xl"
                />
              </div>

              {/* Area, Street, Sector, Village */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Area, Street, Sector, Village
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all max-w-2xl"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Landmark
                </label>
                <input
                  type="text"
                  placeholder="E.g. near apollo hospital"
                  className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all max-w-2xl"
                />
              </div>

              {/* Town/City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Town/City
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFormCity}
                    onChange={(e) => setAddrFormCity(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    State
                  </label>
                  <select
                    value={addrFormState}
                    onChange={(e) => setAddrFormState(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
                  >
                    <option value="">Choose a state</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address Type Selection */}
              <div className="max-w-2xl">
                <label className="block font-bold text-slate-900 mb-1.5">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {(["Home", "Office", "Lab / College"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddrFormType(t)}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs transition-colors cursor-pointer ${
                        addrFormType === t
                          ? "bg-[#2563EB] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Address Checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={addrFormIsDefault}
                  onChange={(e) => setAddrFormIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] accent-[#2563EB] cursor-pointer"
                />
                <span>Make this my default address</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 max-w-2xl">
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-sm active:scale-95 cursor-pointer transition-all"
                >
                  {editingAddressId ? "Save Address" : "Add address"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="text-slate-600 hover:text-slate-900 font-bold px-4 py-3 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Amazon-style Sidebar (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">
                  Subtotal
                </span>
                <div className="text-2xl font-black text-rose-600">
                  ₹{subtotal.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 py-2.5 rounded-full font-bold text-xs shadow-2xs transition-colors cursor-pointer text-center"
                >
                  Return to Checkout
                </button>
                <Link
                  href="/cart"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-full font-bold text-xs transition-colors text-center"
                >
                  Go to Cart
                </Link>
              </div>

              {/* Cart Items List */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">
                  Items in your cart ({cart.length})
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {cart.map((item, idx) => {
                    const prod = item.product;
                    const prodImg = prod.images?.[0] || "/placeholder.png";
                    const prodPrice = item.variant?.price || prod.price;
                    return (
                      <div
                        key={item.variant?.id || prod.id || idx}
                        className="flex gap-3 items-center"
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={prodImg}
                            alt={prod.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {prod.name}
                          </p>
                          <p className="text-[11px] font-bold text-slate-700">
                            ₹{prodPrice.toLocaleString("en-IN")}{" "}
                            <span className="text-slate-400 font-normal">
                              × {item.quantity}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <CategoryBreadcrumb
        items={[{ label: "Cart", href: "/cart" }, { label: "Secure Checkout" }]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete your order with express delivery across India.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>256-Bit SSL Encrypted &amp; Verified</span>
        </div>
      </div>

      {/* 2-Column One-Page Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: One-Page Flow (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3 text-red-900 text-xs shadow-md animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-red-950">
                  Validation Error — Action Required
                </h4>
                <p className="text-red-800 font-semibold mt-0.5 leading-relaxed">
                  {validationError}
                </p>
              </div>
            </div>
          )}

          {/* Unauthenticated Quick Login Prompt */}
          {!isLoggedIn && (
            <div className="bg-gradient-to-r from-[#0F172A] to-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-[#2563EB] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                  <h4 className="text-xs font-black text-white">
                    Have a Prayog Account?
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sign in or register to auto-fill verified addresses, access
                  wholesale/student discounts, and earn Prayog Coins.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-700"
                >
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* ── 1. Customer Information Card ── */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:border-slate-300/80 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm shadow-[#0A1128]/20">
                  1
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    Customer Contact Details
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Order confirmation &amp; dispatch tracking SMS/Email will be sent here
                  </p>
                </div>
              </div>

              {isPhoneVerified && (
                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Account
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Om Kumar"
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#0A1128] focus:ring-2 focus:ring-[#0A1128]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 outline-none shadow-2xs"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  {isPhoneVerified ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendCheckoutOtp}
                      disabled={customerMobile.length < 10 || otpSending}
                      className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline disabled:opacity-50 flex items-center gap-0.5 cursor-pointer transition-colors"
                    >
                      <span>
                        {otpSending ? "Sending OTP..." : "Verify via OTP →"}
                      </span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder="10-digit number"
                    className={`w-full border rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-none shadow-2xs placeholder:text-slate-400 ${
                      isPhoneVerified
                        ? "border-emerald-300 bg-emerald-50/20 pr-10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        : "bg-slate-50/70 hover:bg-white focus:bg-white border-slate-200 hover:border-slate-300 focus:border-[#0A1128] focus:ring-2 focus:ring-[#0A1128]/10"
                    }`}
                  />
                  {isPhoneVerified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {!isPhoneVerified && customerMobile.length === 10 && (
                  <button
                    type="button"
                    onClick={handleSendCheckoutOtp}
                    className="text-[11px] text-[#2563EB] font-bold mt-1 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Click to verify this number via SMS OTP</span>
                    <ArrowRight className="w-3 h-3 text-[#FFC20E]" />
                  </button>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#0A1128] focus:ring-2 focus:ring-[#0A1128]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* OTP Verification Modal Dialog */}
            {showOtpModal && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-xl text-[#2563EB]">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          Verify Mobile Phone
                        </h4>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          +91 {customerMobile}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOtpModal(false)}
                      className="text-slate-400 hover:text-slate-700 font-black p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {otpMessage && (
                    <div className="bg-blue-50 text-[#2563EB] text-xs font-bold p-3 rounded-xl border border-[#2563EB]/20">
                      {otpMessage}
                    </div>
                  )}

                  {checkoutReceivedOtp && (
                    <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-black uppercase text-emerald-800 block">
                          Screen OTP Code:
                        </span>
                        <span className="text-base font-mono font-black text-emerald-950 tracking-wider">
                          {checkoutReceivedOtp}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCheckoutOtp(checkoutReceivedOtp)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  {otpError && (
                    <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200">
                      {otpError}
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <label className="font-extrabold text-slate-700 block">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={checkoutOtp}
                      onChange={(e) =>
                        setCheckoutOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border-2 border-slate-200 focus:border-[#0A1128] text-center text-lg font-black tracking-widest focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleVerifyCheckoutOtp}
                      disabled={checkoutOtp.length < 6 || otpVerifying}
                      className="w-full bg-[#0A1128] hover:bg-[#12365D] disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      {otpVerifying ? "Verifying..." : "Confirm & Verify"}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendCheckoutOtp}
                      disabled={otpSending}
                      className="text-[11px] font-extrabold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Resend OTP Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GST & B2B Company Details Toggle */}
            <div className="pt-1 border-t border-slate-100">
              <div
                onClick={() => setRequireGSTInvoice(!requireGSTInvoice)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  requireGSTInvoice
                    ? "bg-purple-50/50 border-purple-200 shadow-xs"
                    : "bg-slate-50/60 hover:bg-slate-50 border-slate-200/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      requireGSTInvoice
                        ? "bg-purple-100 text-purple-700"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Add Business GSTIN for Input Tax Credit (B2B Tax Invoice)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Claim 18% GST credit with an official tax invoice in your school, college or company name
                    </span>
                  </div>
                </div>
                <div className="flex items-center pl-2">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      requireGSTInvoice
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {requireGSTInvoice && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {requireGSTInvoice && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 sm:p-5 bg-purple-50/30 rounded-2xl border border-purple-200 animate-in fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-950">
                      Company / Institution Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prayog Tech Labs Pvt Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-950">
                      GSTIN Number <span className="text-red-500">*</span> (15 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={gstinNumber}
                      onChange={(e) =>
                        setGstinNumber(e.target.value.toUpperCase())
                      }
                      className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 uppercase shadow-2xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 2. Shipping Address & Multiple Address Book ── */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:border-slate-300/80 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm shadow-[#0A1128]/20">
                  2
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Delivery Address
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Select where you want your STEM &amp; robotics kits shipped
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-[#0A1128] hover:bg-[#12365D] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Grid Cards */}
            {addresses.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                <MapPin className="w-8 h-8 text-[#0A1128] mx-auto opacity-70" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    No Delivery Address Added Yet
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please add your shipping address to calculate courier dispatch and delivery timelines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-1.5 bg-[#0A1128] hover:bg-[#12365D] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((addr) => {
                  const isSelected = selectedShippingAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedShippingAddressId(addr.id);
                        setValidationError(null);
                      }}
                      className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between group ${
                        isSelected
                          ? "border-2 border-[#0A1128] bg-slate-50/40 shadow-sm ring-4 ring-[#0A1128]/5"
                          : "border border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white"
                      }`}
                    >
                      <div>
                        {/* Top Row: Type Badge + Default Badge + Radio Indicator */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          {/* Circular Selection Radio Indicator */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-[#0A1128] text-white shadow-2xs"
                                : "border-2 border-slate-300 group-hover:border-slate-400"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Address Content */}
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          {addr.name}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                          {addr.street}
                        </p>
                        <p className="text-xs font-bold text-slate-800 mt-1.5">
                          {addr.city}, {addr.state} —{" "}
                          <span className="font-extrabold text-[#0A1128]">
                            {addr.pincode}
                          </span>
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between pt-3 mt-3.5 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditAddress(addr);
                            }}
                            className="font-bold text-slate-600 hover:text-[#0A1128] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefaultAddress(addr.id);
                              }}
                              className="font-bold text-slate-500 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              Set Default
                            </button>
                          )}
                        </div>

                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Billing Address Toggle */}
            <div className="pt-1 border-t border-slate-100">
              <div
                onClick={() => setSameAsShipping(!sameAsShipping)}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      sameAsShipping
                        ? "bg-[#0A1128] border-[#0A1128] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {sameAsShipping && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Billing address is same as shipping address
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Tax and delivery invoices will use this primary shipping address
                    </span>
                  </div>
                </div>
              </div>

              {!sameAsShipping && (
                <div className="mt-3 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in fade-in">
                  <span className="text-xs font-bold text-slate-700 block">
                    Select Billing Address:
                  </span>
                  <select
                    value={selectedBillingAddressId}
                    onChange={(e) =>
                      setSelectedBillingAddressId(e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0A1128]"
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.street}, {a.city} ({a.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. Dispatch & Delivery Selection ── */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:border-slate-300/80 transition-all">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm shadow-[#0A1128]/20">
                3
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Dispatch &amp; Courier Mode
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select your preferred freight speed and logistics carrier
                </p>
              </div>
            </div>

            {hasRestrictedBatteryItem && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Section 30: Entire Order → Surface Freight Only</span>
                  </span>
                  <span className="text-[10px] bg-amber-200/80 font-bold px-2 py-0.5 rounded-full text-amber-900">
                    Mixed Cart Locked to Ground Courier
                  </span>
                </div>
                <p className="text-amber-900 font-medium">
                  <strong>Battery Item DGCA Rule:</strong> Air Express courier
                  is restricted for safety. All items in this order will be
                  dispatched together via Ground Surface Cargo.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Standard Delivery */}
              <div
                onClick={() => setSelectedDeliveryMethod("standard")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  effectiveDeliveryMethod === "standard"
                    ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-[#2563EB]/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-600" /> Standard
                    Delivery
                  </span>
                  <span
                    className={`text-[10px] font-black ${isFreeStandardShipping ? "text-emerald-600" : "text-slate-900"}`}
                  >
                    {isFreeStandardShipping ? "FREE" : "₹99"}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-700">
                  Timeline: 7–10 Days
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isFreeStandardShipping
                    ? "FREE Delivery applied (Order > ₹2,000)"
                    : "Free for orders above ₹2,000"}
                </p>
              </div>

              {/* 2. Ranchi 24-Hour Delivery */}
              <div
                onClick={() => {
                  if (isRanchiEligible) setSelectedDeliveryMethod("ranchi_24h");
                }}
                className={`p-3.5 rounded-2xl border transition-all ${
                  !isRanchiEligible
                    ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                    : effectiveDeliveryMethod === "ranchi_24h"
                      ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400 cursor-pointer"
                      : "border-slate-200 hover:border-slate-300 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> Ranchi City
                    Fast Track
                  </span>
                  <span className="text-[10px] font-black text-emerald-600">
                    {isFreeStandardShipping ? "FREE" : "₹49"}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-emerald-700">
                  Within 24 Hours
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isRanchiEligible
                    ? "Eligible for Ranchi address (PIN 834xxx)"
                    : "Only for Ranchi City address"}
                </p>
              </div>

              {/* 3. Faster Delivery (Priority Freight) */}
              <div
                onClick={() => setSelectedDeliveryMethod("faster_express")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  effectiveDeliveryMethod === "faster_express"
                    ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-[#2563EB]/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-blue-600" /> Faster
                    Delivery
                  </span>
                  <span className="text-[10px] font-black text-slate-900">
                    ₹
                    {
                      calculateDeliveryRules({
                        subtotal,
                        totalWeightGrams,
                        deliveryCity,
                        pincode: deliveryPincode,
                        deliveryOption: "faster_express",
                        hasRestrictedBattery: hasRestrictedBatteryItem,
                      }).fee
                    }
                  </span>
                </div>
                <p className="text-[11px] font-bold text-blue-700">
                  {hasRestrictedBatteryItem
                    ? "2–4 Days (Surface)"
                    : "24–48 Hours (Air)"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Priority express courier by weight &amp; zone
                </p>
              </div>

              {/* 4. Store Pickup */}
              <div
                onClick={() => setSelectedDeliveryMethod("store_pickup")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  effectiveDeliveryMethod === "store_pickup"
                    ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-[#2563EB]/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" /> Store
                    Pickup
                  </span>
                  <span className="text-[10px] font-black text-emerald-600">
                    FREE
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-700">
                  Same-Day Pickup
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Collect from local Prayog desk
                </p>
              </div>
            </div>
          </div>

          {/* ── 4. Payment Method Selection ── */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:border-slate-300/80 transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm shadow-[#0A1128]/20">
                  4
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Payment Method
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    100% secure encrypted checkout via UPI, Cards, NetBanking or COD
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                {
                  id: "upi",
                  label: "UPI / QR Code",
                  icon: <QrCode className="w-5 h-5 text-emerald-600" />,
                  desc: "GPay, PhonePe, Paytm",
                },
                {
                  id: "card",
                  label: "Debit / Credit Card",
                  icon: <CreditCard className="w-5 h-5 text-[#2563EB]" />,
                  desc: "Visa, Master, RuPay",
                },
                {
                  id: "netbanking",
                  label: "Net Banking",
                  icon: <Landmark className="w-5 h-5 text-purple-600" />,
                  desc: "50+ Indian Banks",
                },
                {
                  id: "cod",
                  label: "Cash on Delivery",
                  icon: <Banknote className="w-5 h-5 text-amber-600" />,
                  desc: "Pay at Doorstep",
                },
              ].map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? "border-2 border-[#0A1128] bg-slate-50/50 ring-4 ring-[#0A1128]/5 shadow-sm"
                        : "border border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs transition-colors ${
                          isSelected
                            ? "bg-white border-slate-300"
                            : "bg-slate-50 border-slate-200/80 group-hover:bg-white"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-[#0A1128] text-white shadow-2xs"
                            : "border-2 border-slate-300 group-hover:border-slate-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Contextual payment helper banner */}
            {paymentMethod === "upi" && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Instant UPI &amp; Dynamic QR</span>
                    <span className="text-[11px] text-slate-600 block">Scan QR on next step via Google Pay, PhonePe, Paytm, or BHIM UPI</span>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                  Zero Surcharge
                </span>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-slate-800 flex items-center gap-2.5 animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0A233F] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Cards (Credit / Debit / ATM)</span>
                  <span className="text-[11px] text-slate-600 block">Supports all major banks across Visa, Mastercard, RuPay &amp; Maestro with 256-Bit SSL security</span>
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-xs text-purple-950 flex items-center gap-2.5 animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Net Banking Portal</span>
                  <span className="text-[11px] text-slate-600 block">Instant gateway connection with SBI, HDFC, ICICI, Axis, PNB and 50+ other Indian retail banks</span>
                </div>
              </div>
            )}

            {paymentMethod === "cod" && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-center gap-2.5 animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Cash on Delivery (Pay at Doorstep)</span>
                  <span className="text-[11px] text-slate-600 block">Pay via Cash or UPI upon parcel arrival. A quick verification call will be placed prior to dispatch</span>
                </div>
              </div>
            )}
          </div>

          {/* Place Order CTA */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-[#0A1128] hover:bg-[#12365D] active:scale-[0.99] text-white py-4 sm:py-4.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#0A1128]/15 flex items-center justify-between cursor-pointer disabled:opacity-50 group border border-slate-800"
            >
              {isSubmitting ? (
                <div className="w-full text-center py-0.5">
                  <span>Confirming Order...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FFC20E] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>Complete Order &amp; Generate Tax Invoice</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-extrabold text-[#FFC20E] tracking-tight">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </>
              )}
            </button>

            {/* Trust and Guarantee Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-semibold pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#0A1128]" />
                Official GST Tax Invoice
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                100% Genuine Robotics
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (Span 5) */}
        <div className="lg:col-span-5 sticky top-24">
          <CheckoutOrderSummary
            cart={cart}
            subtotal={subtotal}
            mrpTotal={mrpTotal}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            useRewardPoints={useRewardPoints}
            rewardDiscount={rewardDiscount}
            selectedShippingFee={shippingFee}
            onApplyCoupon={handleApplyCoupon}
            onToggleRewardPoints={setUseRewardPoints}
            rewardPointsAvailable={rewardPointsAvailable}
          />
        </div>
      </div>
    </div>
  );
};
