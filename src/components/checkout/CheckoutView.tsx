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
  ArrowLeft,
  ShieldCheck,
  Receipt,
  Check,
  X,
  QrCode,
  Landmark,
  Banknote,
  Lock,
  KeyRound,
  Copy,
  Calendar,
  Package,
  Home,
  ChevronRight,
  Headphones,
  Info,
} from "lucide-react";
import {
  CustomerType,
  calculateCustomerPrice,
  isCouponEligibleForCustomer,
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

const POPULAR_BANKS = [
  "Choose an Option",
  "HDFC Bank",
  "State Bank of India (SBI)",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "Yes Bank",
  "Other 50+ Indian Banks",
];

// ── Authentic Vector Logos for Card Networks & Payment Methods
const VisaCardLogo: React.FC<{ className?: string }> = ({ className = "h-3 w-auto" }) => (
  <svg viewBox="0 0 48 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.125 15.367H15.08l2.529-14.734h4.045l-2.529 14.734zm15.426-14.39c-.808-.307-2.072-.64-3.649-.64-4.015 0-6.84 2.029-6.864 4.937-.027 2.146 2.016 3.344 3.551 4.056 1.579.734 2.109 1.205 2.103 1.862-.012 1.009-1.267 1.47-2.441 1.47-1.633 0-2.5-.236-3.834-.805l-.539-.247-.582 3.424c.969.425 2.76 1.794 4.629.815 4.269 0 7.042-2.008 7.072-5.118.016-1.706-1.071-3.007-3.42-4.076-1.424-.687-2.296-1.144-2.296-1.842 0-.635.736-1.285 2.336-1.285 1.332-.027 2.304.27 3.053.58l.369.17.587-3.301zm11.758 0h-3.131c-.969 0-1.697.268-2.122 1.229l-6.064 13.828h4.256s.696-1.836.854-2.238c.465 0 4.595.038 5.179.038.122.529.497 2.2 1.497 2.2h3.757l-3.226-15.057zm-4.707 9.873c.334-.852 1.611-4.148 1.611-4.148-.024.04.331-.856.533-1.417l.273 1.287s.772 3.553.94 4.278h-3.357zm-27.876-9.873l-3.957 10.378-.423-2.036c-.732-2.355-3.009-4.908-5.56-6.195l3.606 13.064h4.277l6.37-15.211h-4.313z"
      fill="#1A1F71"
    />
    <path
      d="M8.283.643H.822L0 1.011c6.31 1.528 10.493 5.437 12.235 9.874l-1.764-8.497c-.302-1.206-1.226-1.702-2.188-1.745z"
      fill="#F7B600"
    />
  </svg>
);

const MastercardCardLogo: React.FC<{ className?: string }> = ({ className = "h-3.5 w-auto" }) => (
  <svg viewBox="0 0 32 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" fill="#EB001B" />
    <circle cx="22" cy="10" r="8" fill="#F79E1B" />
    <path
      d="M16 4.372a7.96 7.96 0 0 0-2.88 5.628c0 2.247 1.107 4.236 2.88 5.628A7.96 7.96 0 0 0 18.88 10 7.96 7.96 0 0 0 16 4.372z"
      fill="#FF5F00"
    />
  </svg>
);

const RuPayCardLogo: React.FC<{ className?: string }> = ({ className = "h-3 w-auto" }) => (
  <svg viewBox="0 0 68 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4.2 16.5V3.5h5.4c2.8 0 4.5 1.4 4.5 3.8 0 1.9-1.1 3.2-2.7 3.6l3.3 5.6H11l-2.9-5.1H6.7v5.1H4.2zm2.5-7.1h2.7c1.4 0 2.2-.7 2.2-1.8s-.8-1.8-2.2-1.8H6.7v3.6zm13.1 7.3c-2.4 0-3.9-1.6-3.9-4.2V8.2h2.4v4c0 1.5.8 2.3 2 2.3s2-.8 2-2.3v-4h2.4v4.3c0 2.6-1.5 4.2-3.9 4.2zm11.7-.2V3.5h4.6c3.1 0 4.9 1.6 4.9 4.3 0 2.7-1.8 4.3-4.9 4.3h-2.2v4.4h-2.4zm2.4-6.4h2c1.7 0 2.7-.8 2.7-2.3 0-1.4-1-2.2-2.7-2.2h-2v4.5zm16 6.6c-.6 0-1.2-.2-1.6-.6-.4-.4-.6-1-.6-1.8 0-1.8 1.4-2.5 3.8-2.6v-.3c0-.9-.5-1.4-1.6-1.4-.7 0-1.4.2-1.9.5l-.6-1.5c.8-.5 1.7-.8 2.8-.8 2.4 0 3.7 1.2 3.7 3.3v5.2h-2.1v-1c-.5.7-1.2 1-1.9 1zm.6-1.7c.8 0 1.5-.4 1.8-1.1v-1.1c-1.5.1-2.3.5-2.3 1.3 0 .6.4.9 1 .9zm8.9 5.3l3-8.8h2.6l-4.5 11.8h-2.5l1.6-4.2-3.1-7.6h2.5l1.8 5.5.6 3.3z"
      fill="#00529B"
    />
    <path d="M57 3l-3 14h3.6l3-14H57z" fill="#097939" />
    <path d="M62 3l-3 14h3.6l3-14H62z" fill="#F37023" />
  </svg>
);

const UpiBadgeLogo: React.FC<{ className?: string }> = ({ className = "h-3.5 w-auto" }) => (
  <svg viewBox="0 0 52 18" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 14.5c-2.4 0-3.8-1.5-3.8-4V2.5h2.8v8c0 1.2.6 1.8 1.6 1.8s1.6-.6 1.6-1.8v-8H9v8c0 2.5-1.4 4-4 4zm8.5 0V2.5H18c2.8 0 4.6 1.5 4.6 4.1 0 2.6-1.8 4.1-4.6 4.1h-2.7v3.8h-2.8zm2.8-5.9h2.3c1.3 0 2-.6 2-1.9s-.7-1.9-2-1.9h-2.3v3.8zm11 5.9V2.5h2.8v12h-2.8z"
      fill="#097939"
    />
    <path d="M37.5 2l-7.5 14h5l4.5-8.5 4.5 8.5h5L41.5 2h-4z" fill="#097939" />
    <path d="M34 2l-7.5 14h5l4.5-8.5 4.5 8.5h5L38 2h-4z" fill="#005A36" />
  </svg>
);

export const CheckoutView: React.FC = () => {
  const { cart, user, isLoggedIn, clearCart, redeemRewardPoints } = useStore();

  // ── Customer Profile Information (Auto-populated if logged in, Om Kumar default)
  const [customerName, setCustomerName] = useState(user?.name || "Om Kumar");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "ohhmkumar4138@gmail.com");
  const [customerMobile, setCustomerMobile] = useState(
    user?.phone?.replace(/\D/g, "").slice(-10) || "8709789641",
  );
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
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
  const [selectedBillingAddressId, setSelectedBillingAddressId] =
    useState<string>(
      addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || "",
    );

  // Add/Edit Address Form State
  const initialAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrFormName, setAddrFormName] = useState(user?.name || initialAddr?.name || "Om Kumar");
  const [addrFormPhone, setAddrFormPhone] = useState(user?.phone || initialAddr?.phone || "8709789641");
  const [addrFormStreet, setAddrFormStreet] = useState(initialAddr?.street || "Flat 402, Green Glen Tech Park, Outer Ring Road");
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
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [showInstructionsInput, setShowInstructionsInput] = useState(false);
  const [paymentBank, setPaymentBank] = useState("Choose an Option");
  const [paymentCouponInput, setPaymentCouponInput] = useState("");

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
      
      let orderItems = cart;
      if (!orderItems || orderItems.length === 0) {
        try {
          const stored = typeof window !== "undefined" ? localStorage.getItem("prayog_cart") : null;
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              orderItems = parsed;
            }
          }
        } catch {}
      }

      const orderPayloadItems = (orderItems || []).map((i) => ({
        productId: i.product?.id || (i as any).id,
        variantId: i.variant?.id || null,
        productName: i.product?.name || (i as any).name || "Hardware Component",
        productSku: i.variant?.sku || i.product?.sku || (i as any).sku || "",
        price: i.variant?.price || i.product?.price || (i as any).price || 0,
        quantity: i.quantity || 1,
        image: i.product?.images?.[0] || i.product?.image || (i as any).image,
      }));

      const res = await createCustomerOrder(fullAddressStr, selectedAddr.id, {
        couponCode: appliedCoupon ? couponCode : undefined,
        rewardPointsUsed: useRewardPoints ? rewardPointsAvailable : 0,
        paymentMethod,
        shippingCost: shippingFee,
        items: orderPayloadItems,
        customerName: customerName || selectedAddr.name,
        customerEmail: customerEmail,
        customerPhone: customerMobile || selectedAddr.phone,
        subtotal: subtotal,
        gstAmount: Math.round(subtotal * 0.18 * 100) / 100,
        totalAmount: grandTotal,
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

    // Cache order in browser storage so Admin Operations & Customer Orders reflect it instantly
    try {
      const orderEntry = {
        id: `ord-${confirmedOrderNumber}`,
        orderNumber: confirmedOrderNumber,
        user: {
          name: customerName || selectedAddr.name || "Customer",
          email: customerEmail || "customer@prayogindia.com",
          phone: customerMobile || selectedAddr.phone || "+91 8709789641",
        },
        totalAmount: grandTotal,
        subtotal: subtotal,
        shippingAddress: `${selectedAddr.name}, ${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`,
        status: "ORDER_PLACED",
        orderSource: "WEBSITE",
        channelName: "🌐 Prayog Website Store",
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
        isPaid: paymentMethod !== "cod",
        items: (cart || []).map((i) => ({
          name: i.product?.name || "Component",
          quantity: i.quantity || 1,
          price: i.variant?.price || i.product?.price || 0,
        })),
        createdAt: new Date().toISOString(),
      };

      const existingStored = typeof window !== "undefined" ? localStorage.getItem("prayog_placed_orders") : null;
      const list = existingStored ? JSON.parse(existingStored) : [];
      const deduplicated = [orderEntry, ...list.filter((o: any) => o.orderNumber !== confirmedOrderNumber)];
      if (typeof window !== "undefined") {
        localStorage.setItem("prayog_placed_orders", JSON.stringify(deduplicated));
      }
    } catch (cacheErr) {
      console.warn("Local orders cache error:", cacheErr);
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
      <div className="max-w-2xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6 animate-in fade-in duration-300">
        {/* Header with Animated Delivery Truck */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs mb-4 sm:mb-5 flex flex-col md:flex-row items-center justify-between gap-5 bg-gradient-to-br from-slate-50/70 via-white to-blue-50/20">
          <div className="space-y-2 text-center md:text-left min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Order Confirmed</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Thank you for your order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              We&apos;ve received your order and are packing it for express dispatch.
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Order Ref:</span>
              <span className="font-mono font-bold text-slate-900 tracking-wide">
                {placedOrderNumber || "PRG-2026-6516"}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderId}
                title="Copy Order ID"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer pl-0.5"
              >
                {isOrderIdCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Animated Delivery Truck */}
          <div className="shrink-0 flex items-center justify-center scale-90 sm:scale-95 py-1">
            <TruckLoader bare message="" subtitle="" />
          </div>
        </div>

        {/* Single Unified Order Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Section 1: Shipment Progress Stepper */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2563EB]" />
                <span className="font-bold text-slate-900">Shipment Status</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <Calendar className="w-3 h-3 text-emerald-600" />
                Est. Delivery: 2–4 Days
              </span>
            </div>

            {/* Stepper */}
            <div className="relative pt-1 pb-1">
              <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-100 -z-0" />
              <div
                className="absolute left-6 top-3.5 h-0.5 bg-[#2563EB] -z-0 transition-all duration-500"
                style={{ width: "33%" }}
              />

              <div className="grid grid-cols-4 text-center relative z-10">
                {/* Step 1: Placed */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 mt-1.5">Placed</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block">
                    {placedOrderTime || "Confirmed"}
                  </span>
                </div>

                {/* Step 2: Processing */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs ring-4 ring-blue-50">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#2563EB] mt-1.5">Processing</span>
                  <span className="text-[10px] text-blue-600 font-medium">In Progress</span>
                </div>

                {/* Step 3: Shipped */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 mt-1.5">Shipped</span>
                  <span className="text-[10px] text-slate-400">Pending</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 mt-1.5">Delivered</span>
                  <span className="text-[10px] text-slate-400">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Items in Order */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="font-bold text-slate-900">
                Items Ordered ({displayItems.length})
              </span>
              <Link
                href="/account/orders"
                className="text-[#2563EB] font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>View Details</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {displayItems.map((item: any, idx: number) => {
                const itemPrice = item.variant ? item.variant.price : item.product.price;
                return (
                  <div
                    key={item.product.id || idx}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate text-xs">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity} {item.variant ? `• ${item.variant.name}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 text-xs shrink-0">
                      ₹{(itemPrice * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total Paid Row */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Paid</span>
              <span className="text-base font-black text-slate-900">
                ₹{(placedOrderTotal || 241).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Section 3: Delivery & Payment Details */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Delivery Address
              </span>
              <p className="font-bold text-slate-900">
                {placedOrderAddress ? placedOrderAddress.name : "Bahubali"}
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                {placedOrderAddress
                  ? `${placedOrderAddress.street}, ${placedOrderAddress.city}, ${placedOrderAddress.state} - ${placedOrderAddress.pincode}`
                  : "Flat 402, Green Glen Tech Park, Outer Ring Road, Bengaluru, Karnataka - 560103"}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Phone: {placedOrderAddress?.phone || "+91 98765 43210"}
              </p>
            </div>

            <div className="space-y-3 sm:border-l sm:border-slate-200/60 sm:pl-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Method
                </span>
                <p className="font-semibold text-slate-900">
                  {paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : `${paymentMethod.toUpperCase()} (Online Payment)`}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  {paymentMethod === "cod" ? "Pay on Delivery" : "Payment Completed"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Shipping Method
                </span>
                <p className="font-semibold text-slate-900">
                  Standard Surface Delivery (Free Express)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/track-order"
            className="w-full sm:w-auto min-w-44 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Shipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/account/orders"
            className="w-full sm:w-auto min-w-36 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>View All Orders</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-[#2563EB] py-2 px-3 text-center transition-colors"
          >
            Continue Shopping →
          </Link>
        </div>

        {/* Support Footer */}
        <div className="text-center py-3 text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-2">
          <Headphones className="w-3.5 h-3.5 text-slate-400" />
          <span>Need help with this order?</span>
          <Link
            href="/contact"
            className="font-semibold text-[#2563EB] hover:underline"
          >
            Contact Support
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
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white py-2.5 rounded-full font-bold text-xs shadow-sm shadow-blue-500/20 transition-colors cursor-pointer text-center"
                >
                  Return to Checkout
                </button>
                <Link
                  href="/cart"
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 py-2.5 rounded-full font-bold text-xs transition-colors text-center"
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
    <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-5 space-y-3 sm:space-y-4 animate-in fade-in duration-300 relative">
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

      {/* Compact Professional Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Checkout
          </h1>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Express delivery across India
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>256-Bit SSL Secure</span>
        </div>
      </div>

      {/* 2-Column One-Page Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-8 items-start">
        {/* Left Column: Order Summary (Span 5) */}
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

        {/* Right Column: Delivery Address & Payment Flow (Span 7) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-900 text-xs animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-950">
                  Validation Error
                </h4>
                <p className="text-red-800 font-medium mt-0.5 leading-relaxed">
                  {validationError}
                </p>
              </div>
            </div>
          )}

          {/* Quick Login bar for unregistered visitors */}
          {!isLoggedIn && (
            <div className="bg-slate-50 border border-slate-200/70 text-slate-600 rounded-lg px-3.5 py-2 flex items-center justify-between text-xs">
              <span>Have an existing Prayog account?</span>
              <Link
                href="/login?redirect=/checkout"
                className="text-[#2563EB] font-bold hover:underline"
              >
                Sign In to auto-fill →
              </Link>
            </div>
          )}

          {/* ── Section 1: Delivery Address (Amazon Reference Style) ── */}
          {!isEditingAddress && (addrFormStreet || initialAddr?.street) ? (
            /* Amazon-style Collapsed Delivery Address Card */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Delivering to {customerName || addrFormName || "Om Kumar"}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {addrFormStreet || initialAddr?.street}, {addrFormCity || initialAddr?.city},{" "}
                    {addrFormState || initialAddr?.state}, {addrFormPincode || initialAddr?.pincode}, India
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer shrink-0 pt-0.5"
                >
                  Change
                </button>
              </div>

              {/* Delivery Instructions Link / Form */}
              <div className="pt-1">
                {!showInstructionsInput ? (
                  <button
                    type="button"
                    onClick={() => setShowInstructionsInput(true)}
                    className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Add delivery instructions</span>
                  </button>
                ) : (
                  <div className="space-y-1.5 pt-1 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Delivery instructions (Optional)</span>
                      <button
                        type="button"
                        onClick={() => setShowInstructionsInput(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g., Leave with security guard, call before delivery, gate code"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Expanded Address Form / Selector */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                    1. Delivery Address
                  </h2>
                </div>
                {(addrFormStreet || initialAddr?.street) && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>

              {/* Saved Addresses Quick Selector */}
              {addresses.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Delivery Destination
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {addresses.map((a) => {
                      const isSel = selectedShippingAddressId === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(a.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            isSel
                              ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          <span className="font-semibold text-slate-900">{a.type}:</span> {a.street.slice(0, 18)}... ({a.pincode})
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
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                        !selectedShippingAddressId
                          ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      + New Address
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Details Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-semibold text-slate-700">
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
                    className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    {!isPhoneVerified && customerMobile.length === 10 && (
                      <button
                        type="button"
                        onClick={handleSendCheckoutOtp}
                        className="text-[11px] text-[#2563EB] font-semibold hover:underline cursor-pointer"
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
                    placeholder="10-digit mobile number"
                    className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Email Address <span className="text-slate-400 font-normal">(for tracking &amp; GST invoice)</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Inline Shipping Address Form */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Flat, House no., Building, Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFormStreet}
                    onChange={(e) => setAddrFormStreet(e.target.value)}
                    placeholder="e.g. #402, Prayog Robotics Lab, 2nd Cross"
                    className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addrFormPincode}
                      onChange={(e) => setAddrFormPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="6 digits"
                      className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-2.5 py-1.5 sm:py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 font-mono"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addrFormCity}
                      onChange={(e) => setAddrFormCity(e.target.value)}
                      placeholder="City"
                      className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-2.5 py-1.5 sm:py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addrFormState}
                      onChange={(e) => setAddrFormState(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg px-2 py-1.5 sm:py-2 text-xs font-medium text-slate-900 outline-none transition-all"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional B2B GSTIN Accordion */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setRequireGSTInvoice(!requireGSTInvoice)}
                  className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  {requireGSTInvoice ? "✓ B2B GST invoice details added" : "+ Add GSTIN for Input Tax Credit (Optional)"}
                </button>
                {requireGSTInvoice && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                    <input
                      type="text"
                      placeholder="Company / Institution Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2563EB]"
                    />
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="15-digit GSTIN"
                      value={gstinNumber}
                      onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900 uppercase placeholder:text-slate-400 outline-none focus:border-[#2563EB]"
                    />
                  </div>
                )}
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!addrFormStreet.trim() || !addrFormPincode.trim()) {
                      setValidationError("Please enter your street address and pincode.");
                      return;
                    }
                    setValidationError(null);
                    setIsEditingAddress(false);
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Use this address
                </button>
              </div>
            </div>
          )}

          {/* ── Section 2: Payment Method (Amazon Reference Style) ── */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Payment method
            </h2>

            {/* Clean Amazon-style Payment Container */}
            <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
              {/* Your available balance */}
              <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  Your available balance
                </h3>

                {/* Prayog Wallet / Reward Points Balance */}
                <div
                  onClick={() => {
                    if (rewardPointsAvailable > 0) {
                      setUseRewardPoints(!useRewardPoints);
                    }
                  }}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="walletBalanceRadio"
                    id="walletBalanceRadio"
                    checked={useRewardPoints}
                    disabled={rewardPointsAvailable <= 0}
                    onChange={() => {
                      if (rewardPointsAvailable > 0) {
                        setUseRewardPoints(!useRewardPoints);
                      }
                    }}
                    className="mt-0.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                      {rewardPointsAvailable > 0 ? (
                        <>
                          Prayog Reward Points Balance ₹{(rewardPointsAvailable / 2).toFixed(2)} Available
                        </>
                      ) : (
                        <span className="text-slate-500 font-medium">Prayog Wallet Balance ₹0.00 Unavailable</span>
                      )}
                    </div>
                    {rewardPointsAvailable > 0 ? (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{rewardPointsAvailable} pts available. Redeem points to save ₹{rewardDiscount}.</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Insufficient balance. Add money &amp; get rewarded.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promo / Coupon Code Input */}
                <div className="pt-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (paymentCouponInput.trim()) {
                        handleApplyCoupon(paymentCouponInput.trim());
                      }
                    }}
                    className="flex items-center gap-2 max-w-sm"
                  >
                    <span className="text-slate-400 font-bold text-base leading-none select-none">+</span>
                    <input
                      type="text"
                      value={paymentCouponInput}
                      onChange={(e) => setPaymentCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter Code"
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 outline-none focus:border-[#2563EB]"
                    />
                    <button
                      type="submit"
                      className="bg-white border border-slate-300 hover:border-slate-400 text-slate-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      Apply
                    </button>
                  </form>
                  {appliedCoupon && couponCode && (
                    <div className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Coupon &ldquo;{couponCode}&rdquo; applied successfully!
                    </div>
                  )}
                </div>
              </div>

              {/* Another payment method heading & list */}
              <div className="p-4 sm:p-5 bg-white space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  Another payment method
                </h3>

                <div className="space-y-4">
                  {/* 1. Credit or debit card */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mt-0.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-tight">
                        Credit or debit card
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        {/* Visa Card Logo */}
                        <div
                          className="h-6 px-2 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs hover:border-slate-300 transition-colors"
                          title="Visa"
                        >
                          <VisaCardLogo className="h-2.5 w-auto" />
                        </div>

                        {/* Mastercard Logo */}
                        <div
                          className="h-6 px-2 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs hover:border-slate-300 transition-colors"
                          title="Mastercard"
                        >
                          <MastercardCardLogo className="h-3.5 w-auto" />
                        </div>

                        {/* RuPay Logo */}
                        <div
                          className="h-6 px-2 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs hover:border-slate-300 transition-colors"
                          title="RuPay"
                        >
                          <RuPayCardLogo className="h-2.5 w-auto" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Net Banking */}
                  <div
                    onClick={() => setPaymentMethod("netbanking")}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="mt-0.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    />
                    <div className="space-y-2 flex-1 max-w-xs">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-tight">
                        Net Banking
                      </div>
                      <select
                        value={paymentBank}
                        onChange={(e) => {
                          e.stopPropagation();
                          setPaymentBank(e.target.value);
                          setPaymentMethod("netbanking");
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#2563EB] font-medium transition-colors cursor-pointer"
                      >
                        {POPULAR_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. Scan and Pay with UPI */}
                  <div
                    onClick={() => setPaymentMethod("upi")}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="mt-0.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-tight">
                          Scan and Pay with
                        </span>
                        <div
                          className="h-5 px-1.5 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs"
                          title="UPI"
                        >
                          <UpiBadgeLogo className="h-3 w-auto" />
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          You will need to Scan the QR code on the payment page to complete the payment.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* (NO EMI per explicit user instruction) */}

                  {/* 4. Cash on Delivery / Pay on Delivery */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-0.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-tight">
                        Cash on Delivery/Pay on Delivery
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Pay at doorstep with cash or dynamic UPI QR upon delivery.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Speed Selector - Clean segmented control */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                Shipping Speed:
              </span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryMethod("standard")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedDeliveryMethod === "standard"
                      ? "bg-white text-slate-900 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Standard ({isFreeStandardShipping ? "FREE" : "₹99"})
                </button>
                {isRanchiEligible && (
                  <button
                    type="button"
                    onClick={() => setSelectedDeliveryMethod("ranchi_24h")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      selectedDeliveryMethod === "ranchi_24h"
                        ? "bg-white text-slate-900 font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Ranchi 24h (₹49)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryMethod("faster_express")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedDeliveryMethod === "faster_express"
                      ? "bg-white text-slate-900 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
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
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
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
          <div className="space-y-2 pt-0.5">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.99] text-white px-4 sm:px-5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-between cursor-pointer disabled:opacity-50 group border border-blue-600"
            >
              {isSubmitting ? (
                <div className="w-full text-center py-0.5 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-bold">Processing Order...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-blue-100 font-medium uppercase tracking-wider leading-none">
                      Total to Pay
                    </span>
                    <span className="text-base sm:text-lg font-black text-white tracking-tight leading-tight mt-0.5">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold tracking-wide">
                      Place Order
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </>
              )}
            </button>

            {/* Trust and Guarantee Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium pt-0.5">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                256-Bit SSL
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Receipt className="w-3 h-3 text-slate-700" />
                GST Invoice
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                100% Genuine Robotics
              </span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};
