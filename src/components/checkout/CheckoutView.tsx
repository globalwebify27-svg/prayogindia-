"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore, CartItem } from "@/context/StoreContext";
import { useUIStore } from "@/store/useUIStore";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { AnimatedPriceCharacters } from "@/components/checkout/AnimatedPrice";
import { CheckoutAuthGate } from "@/components/checkout/CheckoutAuthGate";
import { MOCK_SAVED_ADDRESSES, Address } from "@/data/accountData";
import { createCustomerOrder } from "@/lib/apiServices";
import { TruckLoader } from "@/components/TruckLoader";
import { OrderCancellationModal } from "@/components/orders/OrderCancellationModal";
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
  ChevronDown,
  Headphones,
  Info,
  Clock,
  Phone,
  Building2,
  ExternalLink,
  Bookmark,
  Trash2,
  Heart,
  Zap,
  Minus,
  Plus,
  Edit3,
  Gift,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  CustomerType,
  calculateCustomerPrice,
  isCouponEligibleForCustomer,
} from "@/data/customerTypes";
import { INITIAL_PROMO_COUPONS, evaluatePromoCoupon } from "@/data/promoData";
import { calculateDeliveryRules } from "@/data/deliveryRules";
import { getProductStock } from "@/data/mockData";

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
  <img
    src="/images/payments/rupay.webp"
    alt="RuPay"
    className={`object-contain inline-block ${className}`}
    loading="lazy"
  />
);

const UpiBadgeLogo: React.FC<{ className?: string }> = ({ className = "h-3.5 w-auto" }) => (
  <img
    src="/images/payments/upi.webp"
    alt="UPI"
    className={`object-contain inline-block ${className}`}
    loading="lazy"
  />
);

const RazorpayBadgeLogo: React.FC<{ className?: string }> = ({ className = "h-3.5 w-auto" }) => (
  <img
    src="/images/payments/razorpay.webp"
    alt="Razorpay"
    className={`object-contain inline-block ${className}`}
    loading="lazy"
  />
);

const normalizeAddressKey = (a: Partial<Address>): string => {
  const street = (a.street || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const pincode = (a.pincode || "").replace(/\D/g, "");
  const name = (a.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${name}-${street}-${pincode}`;
};

export const deduplicateAddresses = (addrs: Address[]): Address[] => {
  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();
  const unique: Address[] = [];

  for (const a of addrs) {
    if (!a || !a.street || !a.street.trim()) continue;
    const key = normalizeAddressKey(a);
    if (!seenKeys.has(key) && (!a.id || !seenIds.has(a.id))) {
      seenKeys.add(key);
      if (a.id) seenIds.add(a.id);
      unique.push(a);
    }
  }
  return unique;
};

export const CheckoutView: React.FC = () => {
  const {
    cart,
    user,
    isLoggedIn,
    loginUser,
    updateUser,
    clearCart,
    redeemRewardPoints,
    updateQuantity,
    removeFromCart,
    moveToWishlist,
  } = useStore();

  // ── Customer Profile Information (Only Mobile number auto-populates; Name is left blank for customer to enter)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(
    user?.email &&
      !user.email.includes("@prayogindia.com") &&
      !user.email.includes("@otp.") &&
      !user.email.startsWith("user.")
      ? user.email
      : "",
  );
  const [customerMobile, setCustomerMobile] = useState(
    user?.phone?.replace(/\D/g, "").slice(-10) || "",
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
  const [singleCheckoutItemId, setSingleCheckoutItemId] = useState<string | null>(null);

  // Active items being checked out (either single item via 'Buy this now' or entire cart)
  const activeCheckoutItems = React.useMemo(() => {
    if (!singleCheckoutItemId) return cart;
    const match = cart.filter(
      (item) =>
        `${item.product.id}-${item.variant?.id || "def"}` === singleCheckoutItemId ||
        item.product.id === singleCheckoutItemId,
    );
    return match.length > 0 ? match : cart;
  }, [cart, singleCheckoutItemId]);

  // Sync with logged in user state (Only mobile number is auto-filled)
  React.useEffect(() => {
    if (user) {
      // Name is not auto-filled so customer can enter their name
      setCustomerName("");
      setAddrFormName("");
      if (
        user.email &&
        !user.email.includes("@prayogindia.com") &&
        !user.email.includes("@otp.") &&
        !user.email.startsWith("user.")
      ) {
        setCustomerEmail(user.email);
      } else {
        setCustomerEmail("");
      }
      if (user.phone) {
        const cleanP = user.phone.replace(/\D/g, "").slice(-10);
        setCustomerMobile(cleanP);
        setAddrFormPhone(cleanP);
      }
      setIsPhoneVerified(true);
    }
  }, [user]);

  // Proactively sanitize cart items so quantity cannot exceed available stock
  React.useEffect(() => {
    let hasExcess = false;
    cart.forEach((item) => {
      const maxStock = getProductStock(item.product, item.variant);
      if (maxStock > 0 && item.quantity > maxStock) {
        hasExcess = true;
        updateQuantity(item.product.id, maxStock - item.quantity, item.variant?.id);
      }
    });
    if (hasExcess) {
      useUIStore.getState().showToast({
        title: "Cart quantities adjusted to available warehouse stock.",
        type: "info",
        duration: 3000,
      });
    }
  }, [cart, updateQuantity]);

  // Auto-load and initialize saved addresses so customer never has to re-enter
  React.useEffect(() => {
    const loadSavedAddresses = async () => {
      // If NOT logged in (Guest User), guest shoppers must start fresh without auto-filling someone else's saved addresses
      if (!isLoggedIn) {
        setAddresses([]);
        setSelectedShippingAddressId("");
        setCheckoutStep("address");
        setIsEditingAddress(true);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerMobile("");
        setAddrFormStreet("");
        setAddrFormCity("");
        setAddrFormState("Jharkhand");
        setAddrFormPincode("");
        setAddrFormName("");
        setAddrFormPhone("");
        return;
      }

      let loaded: Address[] = [];

      // 1. Check persistent localStorage cache (clean out any legacy demo/mock addresses)
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("prayog_saved_addresses");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const cleaned = parsed.filter(
                (a: any) =>
                  !a.street?.includes("Green Glen Tech Park") &&
                  a.id !== "addr_1" &&
                  !a.pincode?.includes("560103"),
              );
              loaded = cleaned;
              localStorage.setItem("prayog_saved_addresses", JSON.stringify(cleaned));
            }
          }
        } catch {}
      }

      // 2. If logged in, fetch user's saved addresses from server
      try {
        const res = await fetch("/api/users/me/addresses");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            const cleanedServer = data.data.filter(
              (a: any) =>
                !a.street?.includes("Green Glen Tech Park") &&
                a.id !== "addr_1" &&
                !a.pincode?.includes("560103"),
            );
            if (cleanedServer.length > 0) {
              loaded = cleanedServer;
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem("prayog_saved_addresses", JSON.stringify(cleanedServer));
                } catch {}
              }
            }
          }
        }
      } catch {}

      const deduped = deduplicateAddresses(loaded);
      if (deduped.length > 0) {
        setAddresses(deduped);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("prayog_saved_addresses", JSON.stringify(deduped));
          } catch {}
        }
        const defaultAddr = deduped.find((a) => a.isDefault) || deduped[0];
        if (defaultAddr) {
          setSelectedShippingAddressId(defaultAddr.id);
          setAddrFormStreet(defaultAddr.street);
          setAddrFormCity(defaultAddr.city);
          setAddrFormState(defaultAddr.state);
          setAddrFormPincode(defaultAddr.pincode);
          setAddrFormName(defaultAddr.name);
          setAddrFormPhone(defaultAddr.phone);
          if (defaultAddr.type) setAddrFormType(defaultAddr.type as any);

          if (defaultAddr.name) {
            setCustomerName(defaultAddr.name);
          }
          if (defaultAddr.phone) {
            setCustomerMobile(defaultAddr.phone.replace(/\D/g, "").slice(-10));
          }
        }
        setCheckoutStep("summary");
      } else {
        setAddresses([]);
        setSelectedShippingAddressId("");
        setCheckoutStep("address");
        setIsEditingAddress(true);
        setCustomerName("");
        setAddrFormName("");
        setAddrFormStreet("");
        setAddrFormCity("");
        setAddrFormState("");
        setAddrFormPincode("");
      }
    };

    loadSavedAddresses();
  }, [isLoggedIn]);

  // When customer edits mobile number in delivery form, update state freely
  const handleMobileChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setCustomerMobile(clean);
    setAddrFormPhone(clean);
    setIsPhoneVerified(true);
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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] =
    useState<string>("");
  const [selectedBillingAddressId, setSelectedBillingAddressId] =
    useState<string>("");

  // Add/Edit Address Form State (Empty defaults - no auto-fill for name)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrFormName, setAddrFormName] = useState("");
  const [addrFormPhone, setAddrFormPhone] = useState(user?.phone?.replace(/\D/g, "").slice(-10) || "");
  const [addrFormStreet, setAddrFormStreet] = useState("");
  const [addrFormCity, setAddrFormCity] = useState("");
  const [addrFormState, setAddrFormState] = useState("");
  const [addrFormPincode, setAddrFormPincode] = useState("");
  const [addrFormType, setAddrFormType] = useState<
    "Home" | "Office" | "Lab / College"
  >("Home");
  const [addrFormIsDefault, setAddrFormIsDefault] = useState(false);
  const [pincodeValidationMsg, setPincodeValidationMsg] = useState<
    string | null
  >(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [showInstructionsInput, setShowInstructionsInput] = useState(false);
  const [paymentBank, setPaymentBank] = useState("Choose an Option");
  const [paymentCouponInput, setPaymentCouponInput] = useState("");

  const handleSelectSavedAddress = (id: string) => {
    setSelectedShippingAddressId(id);
    setIsEditingAddress(false);
    setIsAddingNewAddress(false);
    setEditingAddressId(null);
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setAddrFormName(addr.name);
      setAddrFormPhone(addr.phone);
      setAddrFormStreet(addr.street);
      setAddrFormCity(addr.city);
      setAddrFormState(addr.state);
      setAddrFormPincode(addr.pincode);
      if (addr.type) setAddrFormType(addr.type as any);
      if (addr.name) setCustomerName(addr.name);
      if (addr.phone) setCustomerMobile(addr.phone.replace(/\D/g, "").slice(-10));
    }
    setCheckoutStep("summary");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStartEditAddress = (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setSelectedShippingAddressId(addr.id);
      setEditingAddressId(addr.id);
      setAddrFormName(addr.name);
      setAddrFormPhone(addr.phone);
      setAddrFormStreet(addr.street);
      setAddrFormCity(addr.city);
      setAddrFormState(addr.state);
      setAddrFormPincode(addr.pincode);
      if (addr.type) setAddrFormType(addr.type as any);
      if (addr.name) setCustomerName(addr.name);
      if (addr.phone) setCustomerMobile(addr.phone.replace(/\D/g, "").slice(-10));
    }
    setIsEditingAddress(true);
    setIsAddingNewAddress(false);
  };

  const handleStartAddNewAddress = () => {
    setSelectedShippingAddressId("");
    setEditingAddressId(null);
    setIsEditingAddress(false);
    setIsAddingNewAddress(true);
    setAddrFormStreet("");
    setAddrFormCity("");
    setAddrFormState("");
    setAddrFormPincode("");
    setAddrFormType("Home");
    setAddrFormName("");
    setCustomerName("");
    if (user?.phone) {
      const cleanPhone = user.phone.replace(/\D/g, "").slice(-10);
      setAddrFormPhone(cleanPhone);
      setCustomerMobile(cleanPhone);
    }
  };

  const handleCancelAddressEdit = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    setIsEditingAddress(false);
    setIsAddingNewAddress(false);
    setEditingAddressId(null);
    if (selectedShippingAddressId) {
      const addr = addresses.find((a) => a.id === selectedShippingAddressId);
      if (addr) {
        setAddrFormName(addr.name);
        setAddrFormPhone(addr.phone);
        setAddrFormStreet(addr.street);
        setAddrFormCity(addr.city);
        setAddrFormState(addr.state);
        setAddrFormPincode(addr.pincode);
        if (addr.type) setAddrFormType(addr.type as any);
      }
    }
    if (addresses.length > 0 || addrFormStreet) {
      setCheckoutStep("summary");
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

  // ── Professional Payment Sub-States
  const [upiSubMode, setUpiSubMode] = useState<"id" | "qr">("id");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);

  // ── Streamlined Checkout Flow: Defaults directly to Order Summary (Step 2)
  const [checkoutStep, setCheckoutStep] = useState<"address" | "summary" | "payment">("summary");
  const [showMobileOrderDetails, setShowMobileOrderDetails] = useState(false);

  const getFormattedDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const validateAddressData = (): boolean => {
    setValidationError(null);
    if (!customerName.trim() || customerName.trim().length < 2) {
      setValidationError("Please enter a valid Full Name.");
      setCheckoutStep("address");
      setIsEditingAddress(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    if (
      !customerMobile.trim() ||
      customerMobile.replace(/\D/g, "").length < 10
    ) {
      setValidationError("Please enter a valid 10-digit Mobile Phone Number.");
      setCheckoutStep("address");
      setIsEditingAddress(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    const currentStreet = addrFormStreet || "";
    const currentCity = addrFormCity || "";
    const currentPincode = addrFormPincode || "";

    if (
      !currentStreet.trim() ||
      !currentCity.trim() ||
      currentPincode.trim().length !== 6
    ) {
      setValidationError(
        "Please enter a complete delivery address with a valid 6-digit PIN code."
      );
      setCheckoutStep("address");
      setIsEditingAddress(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    return true;
  };

  const handleSaveAddressForm = (): boolean => {
    if (!validateAddressData()) return false;

    // Immediately reset scroll to top to prevent browser scroll clamping down to the footer
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    const targetId = editingAddressId || selectedShippingAddressId || `addr-${Date.now()}`;
    const newAddress: Address = {
      id: targetId,
      name: (customerName || addrFormName || "Customer").trim(),
      phone: (customerMobile || addrFormPhone || "").trim(),
      street: addrFormStreet.trim(),
      city: addrFormCity.trim(),
      state: addrFormState.trim(),
      pincode: addrFormPincode.trim(),
      type: (addrFormType as "Home" | "Office" | "Lab / College") || "Home",
      isDefault: true,
    };

    setAddresses((prev) => {
      const existingIdx = prev.findIndex((a) => a.id === targetId);
      let updated: Address[];
      if (existingIdx >= 0) {
        updated = prev.map((a, idx) =>
          idx === existingIdx
            ? { ...newAddress, id: a.id }
            : { ...a, isDefault: false },
        );
      } else {
        updated = [newAddress, ...prev.map((a) => ({ ...a, isDefault: false }))];
      }
      const deduped = deduplicateAddresses(updated);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("prayog_saved_addresses", JSON.stringify(deduped));
        } catch {}
      }
      return deduped;
    });

    setSelectedShippingAddressId(newAddress.id);
    setIsEditingAddress(false);
    setIsAddingNewAddress(false);
    setEditingAddressId(null);

    // Persist to user API if logged in
    if (isLoggedIn) {
      fetch("/api/users/me/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAddress.name,
          phone: newAddress.phone,
          street: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          type: newAddress.type,
          isDefault: true,
        }),
      }).catch(() => {});
    }
    return true;
  };

  const handleSaveAndDeliver = () => {
    const saved = handleSaveAddressForm();
    if (!saved) return;
    setCheckoutStep("summary");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProceedToSummary = () => {
    // If the address form is actively open (editing or adding or empty), save it first
    if (isEditingAddress || isAddingNewAddress || addresses.length === 0) {
      const saved = handleSaveAddressForm();
      if (!saved) return;
    }

    // Ensure we have a valid selected address
    const currentAddr = addresses.find((a) => a.id === selectedShippingAddressId) || addresses[0];
    if (!currentAddr && !addrFormStreet) {
      if (!validateAddressData()) return;
      handleSaveAddressForm();
    }

    setIsEditingAddress(false);
    setIsAddingNewAddress(false);
    setEditingAddressId(null);
    setCheckoutStep("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedToPayment = () => {
    if (validateAddressData()) {
      setCheckoutStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProceedFromRightColumn = () => {
    if (checkoutStep === "address") {
      handleProceedToSummary();
    } else if (checkoutStep === "summary") {
      handleProceedToPayment();
    } else {
      handlePlaceOrder();
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlacedDemo, setIsOrderPlacedDemo] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelledOrderInfo, setCancelledOrderInfo] = useState<{
    referenceId: string;
    refundStatus: string;
  } | null>(null);
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
  const [guestRegisterPassword, setGuestRegisterPassword] = useState("");
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [guestRegisterLoading, setGuestRegisterLoading] = useState(false);
  const [guestRegisterSuccess, setGuestRegisterSuccess] = useState(false);
  const [guestRegisterError, setGuestRegisterError] = useState<string | null>(null);

  const handleGuestAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestRegisterPassword || guestRegisterPassword.length < 6) {
      setGuestRegisterError("Please enter a password with at least 6 characters.");
      return;
    }
    setGuestRegisterLoading(true);
    setGuestRegisterError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName || "Prayog Member",
          email: customerEmail,
          phone: customerMobile,
          password: guestRegisterPassword,
          confirmPassword: guestRegisterPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGuestRegisterSuccess(true);
        // Log in user locally if returned
        if (data.user) {
          loginUser(data.user);
        }
      } else {
        setGuestRegisterError(data.message || "Failed to create account. Please try again.");
      }
    } catch {
      setGuestRegisterError("Network connection error. Please try again later.");
    } finally {
      setGuestRegisterLoading(false);
    }
  };
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
  const subtotal = activeCheckoutItems.reduce((sum, item) => {
    const rawPrice = item.variant ? item.variant.price : item.product.price;
    const unitPrice =
      activeCustomerType === "B2B Customer"
        ? calculateCustomerPrice(rawPrice, activeCustomerType, item.quantity).unitPrice
        : rawPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const mrpTotal = activeCheckoutItems.reduce((sum, item) => {
    const rawPrice = item.variant ? item.variant.price : item.product.price;
    const rawMrp = item.variant ? item.variant.mrp : item.product.mrp;
    const mrp = rawMrp && rawMrp > 0 ? rawMrp : rawPrice;
    return sum + mrp * item.quantity;
  }, 0);

  const rewardPointsAvailable = (isLoggedIn && user && typeof user.rewardPoints === "number") ? user.rewardPoints : 0;
  const rewardDiscount = Math.round(rewardPointsAvailable * 0.5);

  // ── DGCA Shipping Restriction Check
  const hasRestrictedBatteryItem = activeCheckoutItems.some(
    (item) =>
      (item.product.shippingTag as string) === "Battery Item" ||
      (item.product.shippingTag as string) === "Battery Product" ||
      item.product.shippingTag === "Hazardous" ||
      item.product.airFreightAllowed === false ||
      item.product.name.toLowerCase().includes("battery") ||
      item.product.name.toLowerCase().includes("lipo"),
  );

  // ── Admin-Configured Freight & Shipping Rules per Product
  const isAirAllowedOnCart = !hasRestrictedBatteryItem && activeCheckoutItems.every((it) => it.product.airFreightAllowed !== false);
  const isSurfaceAllowedOnCart = activeCheckoutItems.every((it) => it.product.surfaceFreightAllowed !== false);
  const isLocalPickupAllowedOnCart = activeCheckoutItems.some((it) => it.product.localPickupAllowed !== false);

  // Check free shipping threshold (₹2,000)
  const isFreeStandardShipping = subtotal >= 2000;

  // Air delivery amount configured by admin on product (or default ₹149)
  const adminAirCharge = activeCheckoutItems.reduce((max, it) => {
    const custom = it.product.airFreightCharge ?? 
      (it.product as any).specs?._shipping?.airFreightCharge ?? 
      (it.product as any).specs?._shipping?.shippingCharge ?? 
      it.product.shippingCharge;
    return typeof custom === "number" && !isNaN(custom) ? Math.max(max, custom) : max;
  }, 149);

  // Surface delivery amount configured by admin on product (or default ₹99)
  const adminSurfaceCharge = activeCheckoutItems.reduce((max, it) => {
    const custom = it.product.surfaceFreightCharge ?? 
      (it.product as any).specs?._shipping?.surfaceFreightCharge ?? 
      (it.product as any).specs?._shipping?.shippingCost;
    return typeof custom === "number" && !isNaN(custom) ? Math.max(max, custom) : max;
  }, 99);
  const effectiveSurfaceFee = isFreeStandardShipping ? 0 : adminSurfaceCharge;

  // Local Store Pickup amount configured by admin on product (default 0 / Free)
  const adminPickupCharge = activeCheckoutItems.reduce((max, it) => {
    const custom = it.product.pickupCharge ?? 
      (it.product as any).specs?._shipping?.pickupCharge;
    return typeof custom === "number" && !isNaN(custom) ? Math.max(max, custom) : max;
  }, 0);

  // ── Section 24 Delivery Calculation Engine
  const selectedAddr = addresses.find(
    (a) => a.id === selectedShippingAddressId,
  );
  const deliveryCity = addrFormCity || selectedAddr?.city || "Bengaluru";
  const deliveryPincode = addrFormPincode || selectedAddr?.pincode || "560100";
  const isRanchiEligible =
    deliveryCity.trim().toLowerCase() === "ranchi" ||
    deliveryPincode.trim().startsWith("834");
  const effectiveRanchiFee = isFreeStandardShipping ? 0 : 49;

  // Resolved shipping fee based on user selection & admin configuration
  const shippingFee =
    selectedDeliveryMethod === "faster_express" && isAirAllowedOnCart
      ? adminAirCharge
      : selectedDeliveryMethod === "store_pickup" && isLocalPickupAllowedOnCart
      ? adminPickupCharge
      : selectedDeliveryMethod === "ranchi_24h" && isRanchiEligible
      ? effectiveRanchiFee
      : effectiveSurfaceFee;

  const grandTotal = Math.max(
    0,
    subtotal -
      couponDiscount -
      (useRewardPoints ? rewardDiscount : 0) +
      shippingFee,
  );

  // Sync selected delivery method if the currently selected mode is not allowed on this product
  React.useEffect(() => {
    if (selectedDeliveryMethod === "faster_express" && !isAirAllowedOnCart) {
      if (isSurfaceAllowedOnCart) {
        setSelectedDeliveryMethod("standard");
      } else if (isLocalPickupAllowedOnCart) {
        setSelectedDeliveryMethod("store_pickup");
      }
    } else if (selectedDeliveryMethod === "standard" && !isSurfaceAllowedOnCart) {
      if (isAirAllowedOnCart) {
        setSelectedDeliveryMethod("faster_express");
      } else if (isLocalPickupAllowedOnCart) {
        setSelectedDeliveryMethod("store_pickup");
      }
    } else if (selectedDeliveryMethod === "store_pickup" && !isLocalPickupAllowedOnCart) {
      if (isSurfaceAllowedOnCart) {
        setSelectedDeliveryMethod("standard");
      } else if (isAirAllowedOnCart) {
        setSelectedDeliveryMethod("faster_express");
      }
    }
  }, [isAirAllowedOnCart, isSurfaceAllowedOnCart, isLocalPickupAllowedOnCart, selectedDeliveryMethod]);

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
          cartItems: activeCheckoutItems.map((item) => ({
            category: item.product.category,
            sku: item.variant?.sku || item.product.sku,
            price: item.variant?.price ?? item.product.price,
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
          activeCheckoutItems.map((item) => ({
            category: item.product.category,
            sku: item.variant?.sku || item.product.sku,
            price: item.variant?.price ?? item.product.price,
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

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
    setPaymentCouponInput("");
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
      setAddresses((prev) => {
        const updated = prev.map((a) => {
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
        });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("prayog_saved_addresses", JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
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
        const updated = [...next, newAddr];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("prayog_saved_addresses", JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
      setSelectedShippingAddressId(newAddr.id);
    }
    setShowAddressModal(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

    // Persist to localStorage so customer never has to re-enter address in future
    if (typeof window !== "undefined" && selectedAddr.street && selectedAddr.pincode) {
      try {
        const stored = localStorage.getItem("prayog_saved_addresses");
        const list: Address[] = stored ? JSON.parse(stored) : [];
        const exists = list.some(
          (a) =>
            a.id === selectedAddr?.id ||
            (a.street.toLowerCase() === selectedAddr?.street.toLowerCase() &&
              a.pincode === selectedAddr?.pincode),
        );
        if (!exists) {
          localStorage.setItem(
            "prayog_saved_addresses",
            JSON.stringify([selectedAddr, ...list.map((a) => ({ ...a, isDefault: false }))]),
          );
        }
      } catch {}
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
      
      let orderItems = activeCheckoutItems;
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
      } else {
        setIsSubmitting(false);
        setValidationError(
          res?.message ||
            "Order placement could not be completed on the server. Please check your connection and try again.",
        );
        return;
      }
    } catch (e: any) {
      console.warn("Order placement fallback:", e);
      setIsSubmitting(false);
      setValidationError(
        e?.message ||
          "An unexpected network error occurred while placing your order. Please try again.",
      );
      return;
    }

    if (!confirmedOrderNumber) {
      setIsSubmitting(false);
      setValidationError("Failed to receive verified order confirmation from server.");
      return;
    }

    // Immediately update customer profile with real name entered in order form
    const realCustomerName = (customerName || selectedAddr.name || "").trim();
    if (realCustomerName && !realCustomerName.startsWith("Customer ")) {
      updateUser({
        name: realCustomerName,
        phone: customerMobile || selectedAddr.phone,
      });

      // Persist permanently to backend
      fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: realCustomerName,
          phone: customerMobile || selectedAddr.phone,
        }),
      }).catch(() => {});
    }

    // Cache order in browser storage so Admin Operations & Customer Orders reflect it instantly
    try {
      const orderEntry = {
        id: `ord-${confirmedOrderNumber}`,
        orderNumber: confirmedOrderNumber,
        userId: user?.id || (user as any)?._id || undefined,
        user_id: user?.id || (user as any)?._id || undefined,
        customerEmail:
          customerEmail ||
          (user?.email &&
          !user.email.includes("@prayogindia.com") &&
          !user.email.includes("@otp.") &&
          !user.email.startsWith("user.")
            ? user.email
            : ""),
        customerMobile: customerMobile || selectedAddr.phone,
        customerPhone: customerMobile || selectedAddr.phone,
        user: {
          id: user?.id,
          name: customerName || selectedAddr.name || "Customer",
          email:
            customerEmail ||
            (user?.email &&
            !user.email.includes("@prayogindia.com") &&
            !user.email.includes("@otp.") &&
            !user.email.startsWith("user.")
              ? user.email
              : ""),
          phone: customerMobile || selectedAddr.phone || "",
        },
        totalAmount: grandTotal,
        subtotal: subtotal,
        shippingAddress: `${selectedAddr.name}, ${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`,
        status: "ORDER_PLACED",
        orderSource: "WEBSITE",
        channelName: "Prayog Website Store",
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : (paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Credit / Debit Card" : "Net Banking"),
        paymentMode: paymentMethod === "cod" ? "Cash on Delivery (COD)" : (paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Credit / Debit Card" : "Net Banking"),
        paymentStatus: paymentMethod === "cod" ? "PENDING" : "PAID",
        isPaid: paymentMethod !== "cod",
        receivedAmount: paymentMethod === "cod" ? 0 : grandTotal,
        items: (activeCheckoutItems || []).map((i) => ({
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

    setPlacedOrderItems([...activeCheckoutItems]);
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
    if (singleCheckoutItemId) {
      activeCheckoutItems.forEach((it) =>
        removeFromCart(it.product.id, it.variant?.id),
      );
    } else {
      clearCart();
    }
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
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              cancelledOrderInfo
                ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
            }`}>
              {cancelledOrderInfo ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Order Cancelled</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Order Confirmed</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {cancelledOrderInfo ? "Order Cancelled Successfully" : "Thank you for your order!"}
            </h1>

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

        {/* Cancellation Details Alert (when cancelled) */}
        {cancelledOrderInfo && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 text-xs text-rose-950 space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <h3 className="font-bold text-sm text-rose-900">Your cancellation has been processed</h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-normal">
              {paymentMethod === "cod"
                ? "This Cash on Delivery order was cancelled. No payment was collected."
                : "If payment was deducted, your refund has been initiated to the original payment method and will reflect in 3–5 business days."}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
              <span>Cancellation Ref: <strong className="text-slate-800">{cancelledOrderInfo.referenceId}</strong></span>
              <span>Refund Status: <strong className="text-emerald-700">{cancelledOrderInfo.refundStatus}</strong></span>
            </div>
          </div>
        )}

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
                            className="object-contain mix-blend-multiply"
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
                {selectedDeliveryMethod === "store_pickup" ? "Pickup Location" : "Delivery Address"}
              </span>
              {selectedDeliveryMethod === "store_pickup" ? (
                <>
                  <p className="font-bold text-slate-900">
                    Prayog India Experience Center &amp; Main Hub
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    1st Floor, City Centre Mall, Club Road, Ranchi, Jharkhand - 834001
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Customer: {customerName || placedOrderAddress?.name || "Om Kumar"} ({customerMobile || placedOrderAddress?.phone || "+91 87097 89641"})
                  </p>
                </>
              ) : (
                <>
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
                </>
              )}
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

        {/* Optional Guest-to-Registered Account Creation Card */}
        {!isLoggedIn && !cancelledOrderInfo && (
          <div className="mt-4 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/60 border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Activate Your Account &amp; Claim Prayog Coins</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    +100 Free Coins
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  Save your delivery address, track this order in 1 click, and unlock {Math.floor(placedOrderTotal / 100)} Prayog Coins earned on this purchase.
                </p>
              </div>
            </div>

            {guestRegisterSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Account activated! Welcome to Prayog India. Your order and loyalty coins are now linked.</span>
              </div>
            ) : (
              <form onSubmit={handleGuestAccountCreation} className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGuestPassword ? "text" : "password"}
                      value={guestRegisterPassword}
                      onChange={(e) => setGuestRegisterPassword(e.target.value)}
                      placeholder="Create a secure password (min. 6 chars)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#2563EB] text-slate-900 placeholder:text-slate-400 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGuestPassword(!showGuestPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showGuestPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={guestRegisterLoading || !guestRegisterPassword}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                  >
                    {guestRegisterLoading ? (
                      <span>Creating...</span>
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                {guestRegisterError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{guestRegisterError}</p>
                )}
              </form>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {!cancelledOrderInfo && (
            <Link
              href="/track-order"
              className="w-full sm:w-auto min-w-44 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Track Shipment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
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
          {!cancelledOrderInfo && (
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full sm:w-auto text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Cancellation Modal */}
        {isCancelModalOpen && (
          <OrderCancellationModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            order={{
              id: placedOrderNumber || "PRG-2026-6516",
              orderNumber: placedOrderNumber || "PRG-2026-6516",
              status: "Processing",
              totalAmount: placedOrderTotal || 241,
              paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid",
              items: displayItems.map((it: any) => ({
                id: it.product?.id,
                name: it.product?.name,
                price: it.product?.price || it.price,
                quantity: it.quantity,
                sku: it.product?.sku,
                image: it.product?.image,
              })),
            }}
            onSuccess={(res) => {
              setCancelledOrderInfo({
                referenceId: res.cancellationReferenceId,
                refundStatus: res.refundStatus,
              });
              setIsCancelModalOpen(false);
            }}
          />
        )}

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
        <div className="relative w-48 h-36 mx-auto -mb-1">
          <Image
            src="/images/empty-cart-robot.png"
            alt="Your Cart is Empty"
            fill
            className="object-contain mix-blend-multiply"
            priority
          />
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



  // ── Mandatory Authentication Gate: Guest checkout is strictly gated behind verified mobile login
  if (!isLoggedIn) {
    return (
      <CheckoutAuthGate
        cart={cart}
        subtotal={subtotal}
        onContinueAsGuest={() => {}}
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
    <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-5 space-y-3 sm:space-y-4 animate-in fade-in duration-300 relative pb-28 lg:pb-6">
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
      <div className="pb-1.5 border-b border-slate-100 mb-4">
        <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
          Checkout
        </h1>
      </div>

      {/* 2-Column Checkout Grid: Left Column (~65-70%, Span 8) & Right Column (~30-35%, Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start pb-20 lg:pb-8">
        {/* Left Column (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-900 text-xs animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-950">Validation Error</h4>
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

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: DELIVERY ADDRESS (When editing / selecting address) */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {checkoutStep === "address" && (
            <div className="-mx-3.5 sm:mx-0 bg-white border-0 sm:border border-slate-200/90 rounded-none sm:rounded-2xl p-3.5 sm:p-5 shadow-none sm:shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span className="text-xs font-bold text-slate-800 tracking-tight">Delivery Address</span>
                </div>
                {(addresses.length > 0 || addrFormStreet) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAddress(false);
                      setIsAddingNewAddress(false);
                      setCheckoutStep("summary");
                    }}
                    className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Back to Order Summary &rarr;
                  </button>
                )}
              </div>

              {/* Saved Addresses Quick Selector (if customer has saved addresses) */}
              {addresses.length > 0 && (
                <div className="space-y-2 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Saved Addresses ({addresses.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {addresses.map((a) => {
                      const isSel = selectedShippingAddressId === a.id;
                      return (
                        <div
                          key={a.id}
                          onClick={() => handleSelectSavedAddress(a.id)}
                          className={`p-3 rounded-lg border text-xs transition-all cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                            isSel
                              ? "bg-blue-50/60 text-slate-900 border-[#2563EB] ring-1 ring-[#2563EB]"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide ${
                                  isSel
                                    ? "bg-[#2563EB] text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {a.type || "Home"}
                              </span>
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {a.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditAddress(a.id);
                                }}
                                className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                                title="Edit this address"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              {isSel && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {a.street}, {a.city}, {a.state} - {a.pincode}
                          </p>
                          <div className="text-[10.5px] text-slate-400">
                            Phone: <strong className="font-medium text-slate-700">{a.phone}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions when not actively editing/adding */}
                  {!isEditingAddress && !isAddingNewAddress && (
                    <div className="pt-2 flex items-center justify-start border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleStartAddNewAddress}
                        className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 py-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Address</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Form Fields: shown when user clicks Edit, Add New, or when no saved addresses exist */}
              {(isEditingAddress || isAddingNewAddress || addresses.length === 0) && (
                <div className="space-y-3.5 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {isEditingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
                    </span>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={handleCancelAddressEdit}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Contact Details: Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
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
                        placeholder="Enter your full name"
                        className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-slate-500 pointer-events-none border-r border-slate-200 pr-2">
                          +91
                        </span>
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
                          className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl pl-13 pr-3 py-2 sm:pl-14 sm:pr-3.5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Email Address
                      </label>
                      <span className="text-[10.5px] text-slate-400">
                        Invoice &amp; tracking updates
                      </span>
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Flat, House no., Building, Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addrFormStreet}
                      onChange={(e) => setAddrFormStreet(e.target.value)}
                      placeholder="House / Flat no., Building, Street, Area"
                      className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                    />
                  </div>

                  {/* PIN Code, City, State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addrFormPincode}
                        onChange={(e) => setAddrFormPincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit PIN"
                        className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addrFormCity}
                        onChange={(e) => setAddrFormCity(e.target.value)}
                        placeholder="City"
                        className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={addrFormState}
                        onChange={(e) => setAddrFormState(e.target.value)}
                        className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address Type Tag */}
                  <div className="space-y-1 pt-0.5">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Address Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Home", "Office", "Lab / College"] as const).map((type) => {
                        const isSel = addrFormType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAddrFormType(type)}
                            className={`py-1.5 px-1 text-center justify-center text-xs font-bold rounded-lg border transition-all cursor-pointer truncate ${
                              isSel
                                ? "bg-blue-50 text-[#2563EB] border-blue-200 shadow-2xs font-bold"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {type === "Home" ? "Home" : type === "Office" ? "Office" : "College"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Delivery Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Landmark, building entry notes"
                      className="w-full bg-slate-50/60 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 rounded-lg sm:rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                    />
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={handleCancelAddressEdit}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveAndDeliver}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white/90 shrink-0" />
                      <span>Save &amp; Deliver Here</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: ORDER SUMMARY (Clean, Uncluttered, Modern Professional Layout) */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {checkoutStep === "summary" && (
            <div className="-mx-3.5 sm:mx-0 bg-white border-0 sm:border border-slate-200/90 rounded-none sm:rounded-2xl shadow-none sm:shadow-xs overflow-hidden divide-y divide-slate-100">
              {/* Section 1: Deliver to (Compact) */}
              <div className="p-3 sm:p-4 bg-white">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {selectedDeliveryMethod === "store_pickup" ? "Store Pickup" : "Deliver To"}
                    </span>
                    {addrFormType && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                        {addrFormType}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep("address");
                      setIsEditingAddress(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {customerName || addrFormName || "Customer"}
                  <span className="text-slate-400 font-normal ml-2">
                    {customerMobile || addrFormPhone}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5 line-clamp-2">
                  {selectedDeliveryMethod === "store_pickup"
                    ? "Prayog India Experience Center, 1st Floor, City Centre, Club Road, Ranchi - 834001"
                    : `${addrFormStreet}, ${addrFormCity}, ${addrFormState} - ${addrFormPincode}`}
                </p>
              </div>

              {/* Section 2: Order Items (Sleek, Compact, Zero Clutter) */}
              <div className="divide-y divide-slate-100 bg-white">
                {singleCheckoutItemId && cart.length > 1 && (
                  <div className="bg-blue-50/90 p-2.5 sm:px-4 flex items-center justify-between text-xs text-blue-900">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <Zap className="w-3.5 h-3.5 text-[#2563EB] shrink-0 fill-[#2563EB]" />
                      <span className="truncate text-[11px]">
                        Buying <strong>{activeCheckoutItems[0]?.product.name}</strong> only.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSingleCheckoutItemId(null)}
                      className="text-[#2563EB] hover:underline font-bold text-[11px] shrink-0 ml-2 cursor-pointer"
                    >
                      Buy All ({cart.length})
                    </button>
                  </div>
                )}
                {activeCheckoutItems.map((item) => {
                  const rawPrice = item.variant ? item.variant.price : item.product.price;
                  const unitPrice =
                    activeCustomerType === "B2B Customer"
                      ? calculateCustomerPrice(
                          rawPrice,
                          activeCustomerType,
                          item.quantity,
                        ).unitPrice
                      : rawPrice;
                  const rawMrp = item.variant ? item.variant.mrp : item.product.mrp;
                  const mrp = rawMrp && rawMrp > 0 ? rawMrp : rawPrice;
                  const discountPercent = mrp > unitPrice ? Math.round(((mrp - unitPrice) / mrp) * 100) : 0;
                  const itemTotal = unitPrice * item.quantity;
                  const itemMrpTotal = mrp * item.quantity;
                  const maxStock = getProductStock(item.product, item.variant);
                  const isAtMaxStock = item.quantity >= maxStock;

                  const deliveryDateText =
                    selectedDeliveryMethod === "store_pickup"
                      ? "Ready in 2 Hours"
                      : selectedDeliveryMethod === "faster_express" || selectedDeliveryMethod === "ranchi_24h"
                      ? getFormattedDate(1)
                      : getFormattedDate(3);

                  return (
                    <div key={`${item.product.id}-${item.variant?.id}`} className="p-3 sm:p-4 flex gap-3 items-center">
                      {/* Product Thumbnail */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-slate-200/80 bg-white p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>

                      {/* Info & Pricing */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-xs font-semibold text-slate-900 leading-snug line-clamp-1 hover:text-[#2563EB] transition-colors block"
                        >
                          {item.product.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.variant ? item.variant.name : item.product.category}
                          {item.product.sku ? ` · ${item.product.sku}` : ""}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </span>
                            {mrp > unitPrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{itemMrpTotal.toLocaleString("en-IN")}
                              </span>
                            )}
                            {discountPercent > 0 && (
                              <span className="text-[10px] font-bold text-emerald-600">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Stepper + Remove link */}
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-md py-0.5 px-1 select-none">
                              <button
                                type="button"
                                disabled={item.quantity <= 1}
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateQuantity(item.product.id, -1, item.variant?.id);
                                  }
                                }}
                                className={`w-4 h-4 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 ${
                                  item.quantity <= 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                                }`}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
                              </button>
                              <span className="text-[11px] font-bold text-slate-800 min-w-[16px] text-center leading-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={isAtMaxStock}
                                onClick={() => updateQuantity(item.product.id, 1, item.variant?.id)}
                                className={`w-4 h-4 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 ${
                                  isAtMaxStock ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                                }`}
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                              className="text-[10.5px] text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 font-medium pt-0.5">
                          Delivery: <strong className="text-slate-700 font-semibold">{deliveryDateText}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section 3: Shipping & Delivery Option */}
              <div className="p-3 sm:p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Shipping Option</span>
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    {activeCheckoutItems.length} {activeCheckoutItems.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Priority Air */}
                  {isAirAllowedOnCart && (
                    <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80 hover:border-blue-300 transition-colors cursor-pointer select-none">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="radio"
                          name="deliveryMethodRadio"
                          checked={selectedDeliveryMethod === "faster_express"}
                          onChange={() => setSelectedDeliveryMethod("faster_express")}
                          className="w-3.5 h-3.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-slate-900 truncate flex items-center gap-1">
                            <span className="font-extrabold text-[#2563EB] text-[10px] italic">AIR EXPRESS</span>
                            <span>· Delivery by {getFormattedDate(1)}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">Fastest air cargo dispatch</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 shrink-0 text-right">₹{adminAirCharge}</span>
                    </label>
                  )}

                  {/* Standard Ground */}
                  {isSurfaceAllowedOnCart && (
                    <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80 hover:border-blue-300 transition-colors cursor-pointer select-none">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="radio"
                          name="deliveryMethodRadio"
                          checked={selectedDeliveryMethod === "standard"}
                          onChange={() => setSelectedDeliveryMethod("standard")}
                          className="w-3.5 h-3.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-slate-900 truncate">
                            Standard Ground (2–4 Days)
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            Delivery by {getFormattedDate(3)}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold shrink-0 text-right ${isFreeStandardShipping ? "text-emerald-600" : "text-slate-900"}`}>
                        {isFreeStandardShipping ? "FREE" : `₹${adminSurfaceCharge}`}
                      </span>
                    </label>
                  )}

                  {/* Store Pickup */}
                  {isLocalPickupAllowedOnCart && (
                    <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80 hover:border-blue-300 transition-colors cursor-pointer select-none">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="radio"
                          name="deliveryMethodRadio"
                          checked={selectedDeliveryMethod === "store_pickup"}
                          onChange={() => setSelectedDeliveryMethod("store_pickup")}
                          className="w-3.5 h-3.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-slate-900 truncate flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-purple-600" />
                            <span>Store Pickup: Ready in 2 Hours</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">Prayog Experience Center, Ranchi</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 shrink-0 text-right">FREE</span>
                    </label>
                  )}

                  {/* Ranchi 24h Express */}
                  {isRanchiEligible && (
                    <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80 hover:border-blue-300 transition-colors cursor-pointer select-none">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="radio"
                          name="deliveryMethodRadio"
                          checked={selectedDeliveryMethod === "ranchi_24h"}
                          onChange={() => setSelectedDeliveryMethod("ranchi_24h")}
                          className="w-3.5 h-3.5 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-slate-900 truncate">
                            Ranchi Local Express (within 24h)
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">Same-day dispatch for Ranchi PINs</div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold shrink-0 text-right ${effectiveRanchiFee === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                        {effectiveRanchiFee === 0 ? "FREE" : `₹${effectiveRanchiFee}`}
                      </span>
                    </label>
                  )}

                  {/* Battery Restriction Notice */}
                  {hasRestrictedBatteryItem && (
                    <div className="text-[10.5px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Battery components ship via DGCA Surface Logistics only.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Coins & Promo */}
              <div className="p-3 sm:p-4 bg-white space-y-2.5">
                {rewardPointsAvailable > 0 && (
                  <label
                    onClick={() => setUseRewardPoints(!useRewardPoints)}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                      useRewardPoints
                        ? "bg-blue-50/70 border-blue-200 text-[#2563EB]"
                        : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={useRewardPoints}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold truncate">
                        Redeem {rewardPointsAvailable} Coins (Save ₹{rewardDiscount})
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                      -₹{rewardDiscount}
                    </span>
                  </label>
                )}

                {!isLoggedIn && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-800">
                    <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Guest Loyalty Perk: You will earn {Math.floor(subtotal / 100)} Prayog Coins on this purchase (held in escrow and unlocked when you create an account upon checkout).
                    </span>
                  </div>
                )}

                {/* Promo Code Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (paymentCouponInput.trim()) {
                      handleApplyCoupon(paymentCouponInput.trim());
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={paymentCouponInput}
                      onChange={(e) => setPaymentCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon / Voucher code"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                    />
                    {appliedCoupon && couponCode && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-xs font-bold cursor-pointer"
                        title="Remove Coupon"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && couponCode && (
                  <div className="text-[10.5px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Coupon &ldquo;{couponCode}&rdquo; applied!
                  </div>
                )}
                {couponError && (
                  <div className="text-[10.5px] font-semibold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {couponError}
                  </div>
                )}
              </div>

              {/* Section 5: GST Invoice Toggle */}
              <div className="p-3 sm:p-4 bg-white space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requireGSTInvoice}
                    onChange={(e) => setRequireGSTInvoice(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">
                    Need GST Invoice for Business / Input Tax Credit
                  </span>
                </label>

                {requireGSTInvoice && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                    />
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="15-digit GSTIN"
                      value={gstinNumber}
                      onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-slate-900 outline-none focus:border-[#2563EB]"
                    />
                  </div>
                )}
              </div>

              {/* Section 6: Legal Footer */}
              <div className="p-3 sm:px-4 bg-slate-50/70 text-[10.5px] text-slate-400">
                By continuing, you agree to Prayog India&apos;s{" "}
                <Link href="/terms" className="text-[#2563EB] hover:underline">
                  Terms
                </Link>{" "}
                &amp;{" "}
                <Link href="/privacy" className="text-[#2563EB] hover:underline">
                  Privacy Policy
                </Link>.
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* STEP 3: PAYMENT METHOD */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {checkoutStep === "payment" && (
            <div className="space-y-3.5">
              {/* Total Payable Amount Header Card */}
              <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-4.5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Payable Amount
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      ({activeCheckoutItems.reduce((a, b) => a + b.quantity, 0)} {activeCheckoutItems.reduce((a, b) => a + b.quantity, 0) === 1 ? "item" : "items"})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Secure Payment</span>
                </div>
              </div>

              {/* Professional Payment Methods Container */}
              <div className="border border-slate-200/90 rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-xs divide-y divide-slate-100">
                {/* Method 1: UPI */}
                <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === "upi" ? "bg-blue-50/20" : "bg-white"}`}>
                  <label
                    onClick={() => setPaymentMethod("upi")}
                    className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="radio"
                        name="paymentMethodRadio"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                        className="mt-1 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            UPI (Google Pay, PhonePe, Paytm, BHIM)
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Fastest • 0 Fee
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Pay instantly via mobile UPI app or dynamic scan QR
                        </p>
                      </div>
                    </div>
                    <div className="h-5 px-1.5 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs shrink-0" title="UPI">
                      <UpiBadgeLogo className="h-3 w-auto" />
                    </div>
                  </label>

                  {/* UPI Sub-Options when Active */}
                  {paymentMethod === "upi" && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 ml-6 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setUpiSubMode("id")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            upiSubMode === "id"
                              ? "bg-[#0B0F6B] text-white border-[#0B0F6B]"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          Enter UPI ID / VPA
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMode("qr")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            upiSubMode === "qr"
                              ? "bg-[#0B0F6B] text-white border-[#0B0F6B]"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Scan QR Code</span>
                        </button>
                      </div>

                      {upiSubMode === "id" ? (
                        <div className="space-y-2 max-w-md">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={upiIdInput}
                              onChange={(e) => {
                                setUpiIdInput(e.target.value);
                                setIsUpiVerified(false);
                              }}
                              placeholder="e.g. 8709789641@paytm or name@okhdfcbank"
                              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#2563EB]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (upiIdInput.includes("@")) {
                                  setIsUpiVerified(true);
                                }
                              }}
                              disabled={!upiIdInput.includes("@")}
                              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Verify
                            </button>
                          </div>
                          {isUpiVerified && (
                            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified: {customerName || "Om Kumar"} (State Bank of India)</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px] text-slate-400">
                            <span>Popular:</span>
                            {["@okhdfcbank", "@okaxis", "@paytm", "@ybl"].map((suffix) => (
                              <button
                                key={suffix}
                                type="button"
                                onClick={() => {
                                  const prefix = upiIdInput.split("@")[0] || (customerMobile || "8709789641");
                                  setUpiIdInput(`${prefix}${suffix}`);
                                  setIsUpiVerified(true);
                                }}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-[#2563EB] cursor-pointer"
                              >
                                {suffix}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 max-w-sm flex items-center gap-4">
                          <div className="w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-2 text-center shrink-0">
                            <QrCode className="w-14 h-14 text-slate-800" />
                            <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase">Prayog UPI</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-slate-900 leading-snug">
                              Scan with any UPI App
                            </p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Open Google Pay, PhonePe, or Paytm and point your camera at this code.
                            </p>
                            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              QR valid for 09:59 mins
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Method 2: Credit / Debit / ATM Card */}
                <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === "card" ? "bg-blue-50/20" : "bg-white"}`}>
                  <label
                    onClick={() => setPaymentMethod("card")}
                    className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="radio"
                        name="paymentMethodRadio"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="mt-1 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Credit or Debit Card
                        </span>
                        <p className="text-[11px] text-slate-500">
                          All major Indian cards supported (Visa, MasterCard, RuPay)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="h-5 px-1.5 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs" title="Visa">
                        <VisaCardLogo className="h-2.5 w-auto" />
                      </div>
                      <div className="h-5 px-1.5 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs" title="Mastercard">
                        <MastercardCardLogo className="h-3 w-auto" />
                      </div>
                      <div className="h-5 px-1.5 bg-white border border-slate-200/90 rounded flex items-center justify-center shadow-2xs" title="RuPay">
                        <RuPayCardLogo className="h-2.5 w-auto" />
                      </div>
                    </div>
                  </label>

                  {/* Card Inputs when Active */}
                  {paymentMethod === "card" && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 ml-6 space-y-3 max-w-md animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 block">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                              const formatted = v.match(/.{1,4}/g)?.join(" ") || v;
                              setCardNumber(formatted);
                            }}
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-[#2563EB]"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 block">
                            Valid Thru (MM/YY)
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (v.length >= 3) {
                                v = `${v.slice(0, 2)}/${v.slice(2)}`;
                              }
                              setCardExpiry(v);
                            }}
                            placeholder="MM / YY"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-[#2563EB]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 block">
                            CVV / CVC
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              placeholder="3 or 4 digits"
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-[#2563EB]"
                            />
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 block">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name printed on card"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Secured via 256-Bit Bank-grade encryption per RBI guidelines.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Method 3: Net Banking */}
                <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === "netbanking" ? "bg-blue-50/20" : "bg-white"}`}>
                  <label
                    onClick={() => setPaymentMethod("netbanking")}
                    className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="radio"
                        name="paymentMethodRadio"
                        checked={paymentMethod === "netbanking"}
                        onChange={() => setPaymentMethod("netbanking")}
                        className="mt-1 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Net Banking
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Transfer directly from 50+ supported Indian banking accounts
                        </p>
                      </div>
                    </div>
                    <Landmark className="w-4 h-4 text-slate-400 shrink-0" />
                  </label>

                  {/* Net Banking Options when Active */}
                  {paymentMethod === "netbanking" && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 ml-6 space-y-3 max-w-md animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {["State Bank of India (SBI)", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank"].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setPaymentBank(bank)}
                            className={`p-2 rounded-lg text-left border text-[11px] font-bold transition-all cursor-pointer ${
                              paymentBank === bank
                                ? "bg-blue-50 border-[#2563EB] text-[#2563EB]"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span className="truncate block">{bank.split(" (")[0]}</span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-1">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Or choose another bank:
                        </label>
                        <select
                          value={paymentBank}
                          onChange={(e) => setPaymentBank(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#2563EB] font-medium transition-colors cursor-pointer"
                        >
                          {POPULAR_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Method 4: Cash on Delivery / Pay on Delivery */}
                <div className={`p-4 sm:p-5 transition-colors ${paymentMethod === "cod" ? "bg-blue-50/20" : "bg-white"}`}>
                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="radio"
                        name="paymentMethodRadio"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-1 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Cash on Delivery (Pay on Delivery)
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Pay at doorstep with cash or dynamic UPI QR upon delivery
                        </p>
                      </div>
                    </div>
                    <Banknote className="w-4 h-4 text-slate-400 shrink-0" />
                  </label>

                  {/* COD Guidance when Active */}
                  {paymentMethod === "cod" && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 ml-6 space-y-2 max-w-md animate-in fade-in duration-150 text-xs text-slate-600">
                      <p className="leading-relaxed">
                        Pay in cash or ask the delivery partner for their dynamic UPI QR code when your package arrives.
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Eligible for PIN {addrFormPincode || "834001"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to Order Summary */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep("summary");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Order Summary</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Price Details (Span 4) */}
        <div
          className={`lg:col-span-4 static lg:sticky lg:top-24 space-y-4 ${
            checkoutStep === "address" ? "hidden lg:block" : "block"
          }`}
        >
          <CheckoutOrderSummary
            cart={activeCheckoutItems}
            subtotal={subtotal}
            mrpTotal={mrpTotal}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            useRewardPoints={useRewardPoints}
            rewardDiscount={rewardDiscount}
            selectedShippingFee={shippingFee}
            activeStep={checkoutStep}
            onProceed={handleProceedFromRightColumn}
            isSubmitting={isSubmitting}
          />
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

      {/* Mobile Fixed Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
        <div key={`mobile-price-${mrpTotal}-${grandTotal}`}>
          {mrpTotal > grandTotal && (
            <div className="relative inline-flex items-center leading-none">
              <span className="text-[11px] text-slate-400 font-medium relative inline-block select-none">
                ₹{mrpTotal.toLocaleString("en-IN")}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[52%] h-[1.5px] bg-slate-400 rounded-full animate-price-strike pointer-events-none"
                />
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-slate-900 tabular-nums">
              <AnimatedPriceCharacters amount={grandTotal} startDelay={160} staggerMs={28} />
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleProceedFromRightColumn}
          disabled={isSubmitting}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Processing...</span>
          ) : checkoutStep === "payment" ? (
            <span>Place Order</span>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
