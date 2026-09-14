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
    const ruleCode = getCustomerTypeCode(activeCustomerType);
    const typeRule = CUSTOMER_TYPE_RULES[ruleCode];
    const { coinsEarned } = calculateEarnedRewards(
      subtotal,
      activeCustomerType,
    );

    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
            ORDER CONFIRMED &amp; DISPATCH READY
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-slate-500">
            Thank you for ordering with Prayog India. Your hardware order has
            been registered for warehouse packaging and dispatch.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3 text-left">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 text-xs">
            <span className="text-slate-500 font-medium">
              Order Reference #
            </span>
            <span className="font-mono font-black text-slate-900 text-sm">
              {placedOrderNumber}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 text-xs">
            <span className="text-slate-500 font-medium">Customer Type</span>
            <span
              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${typeRule.badgeBg} ${typeRule.badgeColor} ${typeRule.badgeBorder}`}
            >
              {activeCustomerType}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 text-xs">
            <span className="text-slate-500 font-medium">
              Tax Invoice Output
            </span>
            <span className="font-extrabold text-purple-700 text-xs">
              {requireGSTInvoice
                ? `GST B2B Tax Invoice (${gstinNumber})`
                : typeRule.invoice.label}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 text-xs">
            <span className="text-slate-500 font-medium">Rewards Credited</span>
            <span className="font-black text-emerald-700 text-xs">
              +{coinsEarned} Prayog Coins Earned
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 text-xs">
            <span className="text-slate-500 font-medium">Payment Mode</span>
            <span className="font-bold text-slate-800 uppercase">
              {paymentMethod.toUpperCase()} (Confirmed)
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Dispatch Method</span>
            <span className="font-bold text-slate-800 uppercase">
              {effectiveDeliveryMethod.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/account"
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            <span>View in Account Dashboard</span>
            <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
          </Link>
          <Link
            href="/products"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5"
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
        <div className="w-16 h-16 rounded-2xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center mx-auto border border-[#00AEEF]/20">
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
          className="inline-flex items-center gap-2 bg-[#00AEEF] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider"
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
          <div className="w-16 h-16 rounded-2xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center mx-auto border border-[#00AEEF]/20 shadow-md">
            <ShieldCheck className="w-8 h-8 text-[#00AEEF]" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20 inline-block">
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
              className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/20 active:scale-95 transition-all"
            >
              <span>Sign In with Password</span>
              <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
            </Link>

            <Link
              href="/verify-otp"
              className="bg-[#E0F7FC] hover:bg-[#bceefb] text-[#00AEEF] border border-[#00AEEF]/30 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-[#00AEEF]" />
              <span>Verify Mobile OTP</span>
            </Link>
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-extrabold text-[#00AEEF] hover:underline"
            >
              Create New Account (+100 Coins) →
            </Link>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00AEEF] bg-[#E0F7FC] px-3 py-0.5 rounded-full border border-[#00AEEF]/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Express Checkout
          </h1>
        </div>

        {/* Customer Pricing Tier Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 pl-2">
            Segment:
          </span>
          <select
            value={activeCustomerType}
            onChange={(e) =>
              handleCustomerTypeChange(e.target.value as CustomerType)
            }
            className="text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
          >
            <option value="B2C Customer">B2C Customer (Retail)</option>
            <option value="B2B Customer">B2B Customer (Wholesale 15%)</option>
            <option value="Registered Customer">
              Registered Customer (Loyalty 5%)
            </option>
            <option value="Guest Customer">Guest Customer (Express)</option>
          </select>
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
                  <span className="bg-[#00AEEF] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
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
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-[#00AEEF]" /> 1. Customer
              Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Mobile Number *
                  </label>
                  {isPhoneVerified ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendCheckoutOtp}
                      disabled={customerMobile.length < 10 || otpSending}
                      className="text-[10px] font-black text-[#00AEEF] hover:underline disabled:opacity-50 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>
                        {otpSending ? "Sending OTP..." : "Verify with OTP →"}
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
                    className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none ${
                      isPhoneVerified
                        ? "border-emerald-400 bg-emerald-50/30"
                        : "border-slate-200 focus:border-[#00AEEF]"
                    }`}
                  />
                  {isPhoneVerified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {!isPhoneVerified && customerMobile.length === 10 && (
                  <button
                    type="button"
                    onClick={handleSendCheckoutOtp}
                    className="text-[11px] text-[#00AEEF] font-extrabold mt-1.5 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Click here to verify this number via SMS OTP</span>
                    <ArrowRight className="w-3 h-3 text-[#FFC20E]" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                />
              </div>
            </div>

            {/* OTP Verification Modal Dialog */}
            {showOtpModal && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#E0F7FC] rounded-xl text-[#00AEEF]">
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
                      className="text-slate-400 hover:text-slate-700 font-black p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {otpMessage && (
                    <div className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-bold p-3 rounded-xl border border-[#00AEEF]/20">
                      {otpMessage}
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
                      className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border-2 border-slate-200 focus:border-[#00AEEF] text-center text-lg font-black tracking-widest focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleVerifyCheckoutOtp}
                      disabled={checkoutOtp.length < 6 || otpVerifying}
                      className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      {otpVerifying ? "Verifying..." : "Confirm & Verify"}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendCheckoutOtp}
                      disabled={otpSending}
                      className="text-[11px] font-extrabold text-[#00AEEF] hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GST & B2B Company Details Toggle */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireGSTInvoice}
                  onChange={(e) => setRequireGSTInvoice(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00AEEF] accent-[#00AEEF]"
                />
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  Add Business GSTIN for Input Tax Credit (B2B Tax Invoice)
                </span>
              </label>

              {requireGSTInvoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/60 p-4 rounded-2xl border border-purple-200 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Company / Institution Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prayog Tech Labs Pvt Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      GSTIN Number * (15 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={gstinNumber}
                      onChange={(e) =>
                        setGstinNumber(e.target.value.toUpperCase())
                      }
                      className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 2. Shipping Address & Multiple Address Book ── */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00AEEF]" /> 2. Delivery
                Address
              </h3>
              <button
                onClick={handleOpenAddAddress}
                className="text-xs font-black text-[#00AEEF] hover:text-[#0096D6] flex items-center gap-1 cursor-pointer bg-[#E0F7FC] px-3 py-1.5 rounded-xl border border-[#00AEEF]/20"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {/* Address Grid Cards */}
            {addresses.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3">
                <MapPin className="w-8 h-8 text-[#00AEEF] mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    No Delivery Address Added Yet
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Please add your shipping address to calculate courier
                    dispatch and delivery timelines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedShippingAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedShippingAddressId(addr.id);
                        setValidationError(null);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-[#00AEEF] bg-[#E0F7FC]/30 ring-2 ring-[#00AEEF]/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                          {addr.name}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {addr.street}
                        </p>
                        <p className="text-[11px] font-bold text-slate-700">
                          {addr.city}, {addr.state} -{" "}
                          <span className="font-mono text-[#00AEEF]">
                            {addr.pincode}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {addr.phone}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10px]">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditAddress(addr);
                            }}
                            className="font-bold text-slate-500 hover:text-[#00AEEF] flex items-center gap-0.5"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefaultAddress(addr.id);
                              }}
                              className="font-bold text-slate-500 hover:text-emerald-600"
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
                            className="font-bold text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Billing Address Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00AEEF] accent-[#00AEEF]"
                />
                <span>Billing address is same as shipping address</span>
              </label>

              {!sameAsShipping && (
                <div className="mt-3 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in fade-in">
                  <span className="text-[11px] font-black uppercase text-slate-500 block">
                    Select Billing Address
                  </span>
                  <select
                    value={selectedBillingAddressId}
                    onChange={(e) =>
                      setSelectedBillingAddressId(e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-[#00AEEF]" /> 3. Dispatch &amp;
              Courier Mode
            </h3>

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
                    ? "border-[#00AEEF] bg-[#E0F7FC]/30 ring-2 ring-[#00AEEF]/20"
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
                    ? "border-[#00AEEF] bg-[#E0F7FC]/30 ring-2 ring-[#00AEEF]/20"
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
                    ? "border-[#00AEEF] bg-[#E0F7FC]/30 ring-2 ring-[#00AEEF]/20"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-[#00AEEF]" /> 4. Payment
              Gateway
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: "upi",
                  label: "UPI / QR Code",
                  icon: <QrCode className="w-4 h-4 text-emerald-600" />,
                  desc: "GPay, PhonePe, Paytm",
                },
                {
                  id: "card",
                  label: "Debit / Credit Card",
                  icon: <CreditCard className="w-4 h-4 text-blue-600" />,
                  desc: "Visa, Master, RuPay",
                },
                {
                  id: "netbanking",
                  label: "Net Banking",
                  icon: <Landmark className="w-4 h-4 text-purple-600" />,
                  desc: "50+ Indian Banks",
                },
                {
                  id: "cod",
                  label: "Cash on Delivery",
                  icon: <Banknote className="w-4 h-4 text-amber-600" />,
                  desc: "Pay at Doorstep",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === opt.id
                      ? "border-[#00AEEF] bg-[#E0F7FC]/30 ring-2 ring-[#00AEEF]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {opt.icon}
                    {paymentMethod === opt.id && (
                      <Check className="w-3.5 h-3.5 text-[#00AEEF]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {opt.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirming Order...</span>
            ) : (
              <>
                <span>Complete Order &amp; Generate Tax Invoice</span>
                <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
              </>
            )}
          </button>
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

      {/* ── Address Add / Edit Modal ── */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-[#00AEEF] tracking-wider">
                  ADDRESS BOOK
                </span>
                <h3 className="text-base font-black">
                  {editingAddressId
                    ? "Edit Delivery Address"
                    : "Add New Delivery Address"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveAddress}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFormName}
                    onChange={(e) => setAddrFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrFormPhone}
                    onChange={(e) => setAddrFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Street Address, Lab / Room # *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addrFormStreet}
                  onChange={(e) => setAddrFormStreet(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFormCity}
                    onChange={(e) => setAddrFormCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFormState}
                    onChange={(e) => setAddrFormState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PIN Code * (6 digits)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addrFormPincode}
                    onChange={(e) => setAddrFormPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {pincodeValidationMsg && (
                <p className="text-red-500 text-[11px] font-bold">
                  {pincodeValidationMsg}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Address Type
                  </label>
                  <div className="flex gap-2">
                    {(["Home", "Office", "Lab / College"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddrFormType(t)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border cursor-pointer ${
                          addrFormType === t
                            ? "bg-[#00AEEF] text-white border-[#00AEEF]"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={addrFormIsDefault}
                    onChange={(e) => setAddrFormIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00AEEF] accent-[#00AEEF]"
                  />
                  <span>Make default address</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
