"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore, CartItem } from "@/context/StoreContext";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutAuthGate } from "@/components/checkout/CheckoutAuthGate";
import { MOCK_SAVED_ADDRESSES, Address } from "@/data/accountData";
import { createCustomerOrder } from "@/lib/apiServices";
import { TruckLoader } from "@/components/TruckLoader";
import {
  ShoppingBag,
  ShoppingCart,
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
  QrCode,
  Smartphone,
  Landmark,
  Banknote,
  Sparkles,
  Zap,
  Phone,
  Lock,
  KeyRound,
  Copy,
  Calendar,
  Package,
  Home,
  ChevronRight,
  Headphones,
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
  const [guestAllowed, setGuestAllowed] = useState(false);

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

  // Add/Edit Address Form State
  const initialAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrFormName, setAddrFormName] = useState(user?.name || initialAddr?.name || "");
  const [addrFormPhone, setAddrFormPhone] = useState(user?.phone || initialAddr?.phone || "");
  const [addrFormStreet, setAddrFormStreet] = useState(initialAddr?.street || "");
  const [addrFormCity, setAddrFormCity] = useState(initialAddr?.city || "Bengaluru");
  const [addrFormState, setAddrFormState] = useState(initialAddr?.state || "Karnataka");
  const [addrFormPincode, setAddrFormPincode] = useState(initialAddr?.pincode || "560103");
  const [addrFormType, setAddrFormType] = useState<
    "Home" | "Office" | "Lab / College"
  >("Office");
  const [addrFormIsDefault, setAddrFormIsDefault] = useState(false);
  const [pincodeValidationMsg, setPincodeValidationMsg] = useState<
    string | null
  >(null);

  const handleSelectSavedAddress = (id: string) => {
    setSelectedShippingAddressId(id);
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setAddrFormName(addr.name);
      setAddrFormPhone(addr.phone);
      setAddrFormStreet(addr.street);
      setAddrFormCity(addr.city);
      setAddrFormState(addr.state);
      setAddrFormPincode(addr.pincode);
    }
  };

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
  const [placedOrderTotal, setPlacedOrderTotal] = useState<number>(0);
  const [placedOrderAddress, setPlacedOrderAddress] = useState<Address | null>(
    null,
  );
  const [placedOrderItems, setPlacedOrderItems] = useState<CartItem[]>([]);
  const [placedOrderTime, setPlacedOrderTime] = useState<string>("");
  const [isOrderIdCopied, setIsOrderIdCopied] = useState(false);
  const handleCopyOrderId = () => {
    if (placedOrderNumber) {
      navigator.clipboard.writeText(placedOrderNumber);
      setIsOrderIdCopied(true);
      setTimeout(() => setIsOrderIdCopied(false), 2000);
    }
  };

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
  const deliveryCity = addrFormCity || selectedAddr?.city || "Bengaluru";
  const deliveryPincode = addrFormPincode || selectedAddr?.pincode || "560100";

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
    let selectedAddr = addresses.find(
      (a) => a.id === selectedShippingAddressId,
    );
    if (!selectedAddr) {
      selectedAddr = {
        id: "current-address",
        name: customerName || addrFormName,
        phone: customerMobile || addrFormPhone,
        street: addrFormStreet,
        city: addrFormCity,
        state: addrFormState,
        pincode: addrFormPincode,
        type: "Home",
        isDefault: true,
      };
    } else {
      selectedAddr = {
        ...selectedAddr,
        name: customerName || selectedAddr.name,
        phone: customerMobile || selectedAddr.phone,
        street: addrFormStreet || selectedAddr.street,
        city: addrFormCity || selectedAddr.city,
        state: addrFormState || selectedAddr.state,
        pincode: addrFormPincode || selectedAddr.pincode,
      };
    }

    if (
      !selectedAddr.street.trim() ||
      !selectedAddr.city.trim() ||
      selectedAddr.pincode.trim().length !== 6
    ) {
      setValidationError(
        "Please enter a complete delivery address with a valid 6-digit PIN code.",
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
    const submitStart = Date.now();

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

    // Ensure at least 1400ms so user can appreciate the animated truck confirmation
    const elapsed = Date.now() - submitStart;
    if (elapsed < 1400) {
      await new Promise((resolve) => setTimeout(resolve, 1400 - elapsed));
    }

    setPlacedOrderItems([...cart]);
    setPlacedOrderTotal(grandTotal);
    setPlacedOrderAddress(selectedAddr);
    const now = new Date();
    setPlacedOrderTime(
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
        " • " +
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    );
    clearCart();
    setPlacedOrderNumber(confirmedOrderNumber);
    setIsOrderPlacedDemo(true);
    setIsSubmitting(false);
  };

  // ── Order Confirmation Screen (Unified Single-Screen View matching Reference Layout)
  if (isOrderPlacedDemo) {
    const displayItems =
      placedOrderItems.length > 0
        ? placedOrderItems
        : [
            {
              product: {
                id: "demo-item",
                name: "Arduino UNO R3 Development Board",
                image:
                  "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=200&auto=format&fit=crop&q=80",
                price: placedOrderTotal || 241,
                mrp: 299,
              },
              quantity: 1,
            } as any,
          ];

    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6 animate-in fade-in duration-300">
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          {/* Top Header: Split Layout with Order Confirmed Message & Animated Truck */}
          <div className="p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-50/60 via-white to-blue-50/30 border-b border-slate-100 relative overflow-hidden">
            {/* Left Content */}
            <div className="flex items-start gap-3.5 sm:gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/90 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  ORDER CONFIRMED
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Thank you for your order!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  We've received your order and are getting it ready for shipment.
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 pt-0.5">
                  <span>Order Ref:</span>
                  <span className="font-mono font-bold text-[#2563EB] tracking-wider">
                    {placedOrderNumber || "PRG-2026-6516"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrderId}
                    title="Copy Order ID"
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center"
                  >
                    {isOrderIdCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Delivery Truck Graphic */}
            <div className="relative shrink-0 flex items-center justify-center">
              {/* Soft atmospheric cloud blobs behind truck */}
              <div className="absolute -top-3 -right-2 w-20 h-7 bg-sky-100/70 rounded-full blur-xs pointer-events-none" />
              <div className="absolute top-4 -left-4 w-16 h-5 bg-sky-100/50 rounded-full blur-xs pointer-events-none" />
              <TruckLoader
                bare
                message=""
                subtitle=""
                className="scale-90 sm:scale-100"
              />
            </div>
          </div>

          {/* Order Total Bar */}
          <div className="mx-4 sm:mx-6 mt-4 sm:mt-5 bg-gradient-to-r from-[#0A1128] via-[#0E1A3D] to-[#0A1128] text-white px-5 sm:px-6 py-3 rounded-xl flex items-center justify-between shadow-sm border border-slate-800/40">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-slate-300" />
              <span className="text-xs font-black text-slate-200 uppercase tracking-widest">
                ORDER TOTAL
              </span>
            </div>
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">
              ₹{(placedOrderTotal || 241).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Shipment Progress Card */}
          <div className="mx-4 sm:mx-6 mt-4 p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/60">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Shipment Progress</h3>
                  <p className="text-xs text-slate-500">Track your order from our warehouse to your doorstep.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:self-center pl-12 sm:pl-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/60">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
                    Estimated Delivery
                  </span>
                  <span className="text-xs font-black text-[#2563EB]">
                    2-4 Days
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper with progress track */}
            <div className="relative pt-1 pb-1">
              <div className="absolute left-8 right-8 top-4.5 h-0.5 bg-slate-200 -z-0" />
              <div
                className="absolute left-8 top-4.5 h-0.5 bg-emerald-500 -z-0 transition-all duration-500"
                style={{ width: "33%" }}
              />

              <div className="grid grid-cols-4 text-center relative z-10">
                {/* Step 1: Placed */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">Placed</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                    {placedOrderTime || "Oct 16, 2026 • 10:08 AM"}
                  </span>
                </div>

                {/* Step 2: Processing */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md ring-4 ring-blue-100">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">Processing</span>
                  <span className="text-[10px] font-bold text-[#2563EB] mt-0.5">In Progress</span>
                </div>

                {/* Step 3: Shipped */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-300 text-slate-400 flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 mt-2">Shipped</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Pending</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-300 text-slate-400 flex items-center justify-center">
                    <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 mt-2">Delivered</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Info Cards */}
          <div className="mx-4 sm:mx-6 mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Payment */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/60 mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment
                </span>
                <span className="font-extrabold text-slate-800 text-xs block truncate mt-0.5">
                  {paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : `${paymentMethod.toUpperCase()} (Paid)`}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5">
                  Completed
                </span>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100/60 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery
                </span>
                <span className="font-extrabold text-slate-800 text-xs block truncate mt-0.5">
                  Standard Surface (2-4 Days)
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5">
                  Free Delivery
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex items-start gap-3 shadow-2xs relative">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100/60 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 pr-5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery Address
                </span>
                <p className="font-bold text-slate-800 text-xs truncate mt-0.5">
                  {placedOrderAddress ? `${placedOrderAddress.name} (${placedOrderAddress.phone})` : "Customer Delivery Address (+91 98765 00000)"}
                </p>
                <p className="text-slate-500 text-[10px] truncate mt-0.5">
                  {placedOrderAddress
                    ? `${placedOrderAddress.street}, ${placedOrderAddress.city}, ${placedOrderAddress.state} - ${placedOrderAddress.pincode}`
                    : "Flat 402, Green Glen Tech Park, Outer Ring Road, Bengaluru, Karnataka - 560103"}
                </p>
              </div>
              <div className="absolute top-3 right-3 text-blue-500">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Items in your order preview */}
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Items in your order
              </h3>
              <Link
                href="/account/orders"
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-0.5"
              >
                <span>View order details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {displayItems.map((item: any, idx: number) => {
                const itemPrice = item.variant ? item.variant.price : item.product.price;
                return (
                  <div
                    key={item.product.id || idx}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={44}
                            height={44}
                            className="object-contain"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 truncate text-xs">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-xs sm:text-sm shrink-0">
                      ₹{(itemPrice * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mx-4 sm:mx-6 mt-5 pt-3 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/track-order"
                className="flex-1 sm:flex-none bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <Truck className="w-4 h-4" />
                <span>Track Shipment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/account/orders"
                className="flex-1 sm:flex-none bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>View Orders</span>
              </Link>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-slate-700 hover:text-[#2563EB] flex items-center gap-1 transition-colors self-center py-1"
            >
              <span>Continue Shopping</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Support Footer */}
          <div className="text-center py-3 text-xs text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50/50 mt-2">
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span>Need help with your order?</span>
            <Link
              href="/contact"
              className="font-bold text-[#2563EB] hover:underline flex items-center gap-0.5"
            >
              <span>Contact Support</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
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



  // ── Unauthenticated Gate: Show clean, professional Register / Login form
  if (!isLoggedIn && !guestAllowed) {
    return (
      <CheckoutAuthGate
        cart={cart}
        subtotal={subtotal}
        onContinueAsGuest={() => setGuestAllowed(true)}
      />
    );
  }

  // ── Full-Page Address Add / Edit Screen (Amazon-style Layout)
  if (showAddressModal) {
    return (
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6 animate-in fade-in duration-200">
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
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-8 animate-in fade-in duration-300 relative">
      {/* Order Processing Overlay with Truck Loader */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <TruckLoader
              message="Confirming Your Order..."
              subtitle="Securing inventory & booking express logistics slot. Please wait a moment..."
              className="border-none shadow-none p-2 sm:p-4"
            />
          </div>
        </div>
      )}

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

          {/* Quick Login bar for unregistered visitors */}
          {!isLoggedIn && (
            <div className="bg-slate-100 text-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
              <span>Have an existing Prayog account?</span>
              <Link
                href="/login?redirect=/checkout"
                className="text-[#2563EB] font-bold hover:underline"
              >
                Sign In to auto-fill →
              </Link>
            </div>
          )}

          {/* ── Section 1: Contact & Delivery Address (Single Unified Card) ── */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  1. Contact &amp; Delivery Address
                </h2>
              </div>
              {isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              ) : (
                customerMobile.length === 10 && (
                  <button
                    type="button"
                    onClick={handleSendCheckoutOtp}
                    className="text-[11px] text-[#2563EB] font-bold hover:underline cursor-pointer"
                  >
                    {otpSending ? "Sending OTP..." : "Verify via OTP →"}
                  </button>
                )
              )}
            </div>

            {/* Saved Addresses Quick Selector (if available) */}
            {addresses.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <div className="flex flex-wrap gap-2">
                  {addresses.map((a) => {
                    const isSel = selectedShippingAddressId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(a.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#0A1128] text-white border-[#0A1128] shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                        }`}
                      >
                        {a.type}: {a.street.slice(0, 18)}... ({a.pincode})
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShippingAddressId("");
                      setAddrFormStreet("");
                      setAddrFormPincode("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !selectedShippingAddressId
                        ? "bg-[#0A1128] text-white border-[#0A1128] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                    }`}
                  >
                    + New Address
                  </button>
                </div>
              </div>
            )}

            {/* Contact Details Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setAddrFormName(e.target.value);
                  }}
                  placeholder="e.g. Om Kumar"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0A1128] focus:ring-1 focus:ring-[#0A1128] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  {!isPhoneVerified && customerMobile.length === 10 && (
                    <button
                      type="button"
                      onClick={handleSendCheckoutOtp}
                      className="text-[11px] text-[#2563EB] font-bold hover:underline cursor-pointer"
                    >
                      Verify OTP
                    </button>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={customerMobile}
                  onChange={(e) => {
                    handleMobileChange(e.target.value);
                    setAddrFormPhone(e.target.value);
                  }}
                  placeholder="10-digit number"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0A1128] focus:ring-1 focus:ring-[#0A1128] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Email Address <span className="text-slate-400 font-normal">(for tracking &amp; GST invoice)</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0A1128] focus:ring-1 focus:ring-[#0A1128] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Inline Shipping Address Form */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Flat, House no., Building, Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addrFormStreet}
                  onChange={(e) => setAddrFormStreet(e.target.value)}
                  placeholder="e.g. #402, Prayog Robotics Lab, 2nd Cross"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0A1128] focus:ring-1 focus:ring-[#0A1128] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addrFormPincode}
                    onChange={(e) => setAddrFormPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6 digits"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0A1128] focus:ring-1 focus:ring-[#0A1128] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFormCity}
                    onChange={(e) => setAddrFormCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0A1128] focus:ring-1 focus:ring-[#0A1128] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addrFormState}
                    onChange={(e) => setAddrFormState(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0A1128] rounded-xl px-2 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Optional B2B GSTIN Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequireGSTInvoice(!requireGSTInvoice)}
                className="text-xs font-bold text-purple-700 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <span>{requireGSTInvoice ? "✓ B2B GST invoice added" : "+ Add GSTIN for Input Tax Credit (Optional)"}</span>
              </button>
              {requireGSTInvoice && (
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <input
                    type="text"
                    placeholder="Company / Institution Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                  />
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="15-digit GSTIN"
                    value={gstinNumber}
                    onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 uppercase"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Delivery & Payment Method (Single Unified Card) ── */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  2. Payment &amp; Delivery Method
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Safe
              </span>
            </div>

            {/* Payment Radio Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "cod", label: "Cash on Delivery", icon: <Banknote className="w-4 h-4 text-amber-600" />, desc: "Pay at Doorstep" },
                { id: "upi", label: "UPI / QR Code", icon: <QrCode className="w-4 h-4 text-emerald-600" />, desc: "GPay, PhonePe, Paytm" },
                { id: "card", label: "Cards", icon: <CreditCard className="w-4 h-4 text-[#2563EB]" />, desc: "Debit / Credit" },
                { id: "netbanking", label: "Net Banking", icon: <Landmark className="w-4 h-4 text-purple-600" />, desc: "50+ Banks" },
              ].map((opt) => {
                const isSel = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? "border-2 border-[#0A1128] bg-slate-50 shadow-xs ring-2 ring-[#0A1128]/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      {opt.icon}
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSel ? "bg-[#0A1128] border-[#0A1128]" : "border-slate-300"
                      }`}>
                        {isSel && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Delivery Speed Selector - Compact Row */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-500" />
                Shipping Speed:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryMethod("standard")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    selectedDeliveryMethod === "standard"
                      ? "bg-[#0A1128] text-white border-[#0A1128] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                  }`}
                >
                  Standard ({isFreeStandardShipping ? "FREE" : "₹99"})
                </button>
                {isRanchiEligible && (
                  <button
                    type="button"
                    onClick={() => setSelectedDeliveryMethod("ranchi_24h")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      selectedDeliveryMethod === "ranchi_24h"
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                    }`}
                  >
                    Ranchi 24h (₹49)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryMethod("faster_express")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    selectedDeliveryMethod === "faster_express"
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                  }`}
                >
                  Priority Air (₹149)
                </button>
              </div>
            </div>
          </div>

          {/* OTP Verification Modal Dialog */}
          {showOtpModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Verify Mobile OTP
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Enter the 6-digit verification passcode sent to{" "}
                  <strong className="text-slate-800">+91 {customerMobile}</strong>
                </p>

                {otpMessage && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl border border-emerald-200">
                    {otpMessage}
                  </div>
                )}

                {checkoutReceivedOtp && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-800 font-bold block">
                      DEMO / TEST OTP CODE:
                    </span>
                    <span className="text-sm font-black text-amber-950 tracking-widest font-mono">
                      {checkoutReceivedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCheckoutOtp(checkoutReceivedOtp)}
                      className="text-[10px] text-[#2563EB] font-bold block mx-auto mt-0.5 hover:underline cursor-pointer"
                    >
                      Auto-fill this code
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

          {/* Place Order CTA */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-14 bg-[#0A1128] hover:bg-[#12365D] active:scale-[0.99] text-white px-5 sm:px-6 rounded-full font-bold transition-all shadow-xl shadow-[#0A1128]/15 flex items-center justify-between cursor-pointer disabled:opacity-50 group border border-slate-800"
            >
              {isSubmitting ? (
                <div className="w-full text-center py-0.5 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-bold">Processing Order...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">
                      Total to Pay
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#FFC20E] tracking-tight leading-tight mt-0.5">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold tracking-wide">
                      Place Order
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </>
              )}
            </button>

            {/* Trust and Guarantee Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[11px] text-slate-500 font-semibold pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#0A1128]" />
                Official GST Invoice
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
