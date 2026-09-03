"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Tablet,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Printer,
  Share2,
  Mail,
  MapPin,
  User,
  Building2,
  Percent,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  LogOut,
  Smartphone,
  Check,
  FileText,
  BadgePercent,
  Gift,
  Eye,
  Info,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Store,
  ExternalLink,
  RefreshCw,
  QrCode as QrCodeIcon,
  Wallet,
  Calendar,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { QuickViewModal } from "@/components/Modals";
import {
  getProductStockForStore,
  deductStoreInventory,
} from "@/lib/inventoryEngine";
import {
  WalkInSession,
  SessionStatus,
  getAllSessions,
  saveSession,
  generateInvoiceNo,
  POS_BROADCAST_CHANNEL,
  STORES,
  getStoreSessionsPending,
} from "@/data/storeConfig";
import {
  CustomerType,
  CustomerTypeCode,
  CUSTOMER_TYPE_RULES,
  calculateCustomerPrice,
  calculateEarnedRewards,
  getCustomerTypeCode,
} from "@/data/customerTypes";

interface POSCartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export type StoreId = "RANCHI" | "PATNA" | "DELHI";

// ─── Live Walk-in Session Card (for manager POS live orders tab) ─────────────
function LiveSessionCard({
  session,
  accentColor,
  onAccept,
  onMarkPaid,
  onCancel,
  onPrint,
}: {
  session: WalkInSession;
  accentColor: string;
  onAccept: () => void;
  onMarkPaid: () => void;
  onCancel: () => void;
  onPrint: () => void;
}) {
  const statusTheme: Record<
    SessionStatus,
    { badge: string; border: string; bg: string }
  > = {
    PENDING: {
      badge:
        "bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-500/30",
      border: "border-amber-400/80 shadow-amber-500/5",
      bg: "bg-white",
    },
    ACCEPTED: {
      badge:
        "bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-500/30",
      border: "border-blue-400/80 shadow-blue-500/5",
      bg: "bg-white",
    },
    PROCESSING: {
      badge:
        "bg-purple-500/10 text-purple-600 border-purple-300 dark:border-purple-500/30",
      border: "border-purple-400/80 shadow-purple-500/5",
      bg: "bg-white",
    },
    PAID: {
      badge:
        "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-500/30",
      border: "border-emerald-400/80 shadow-emerald-500/5",
      bg: "bg-white",
    },
    CANCELLED: {
      badge: "bg-slate-500/10 text-slate-500 border-slate-200",
      border: "border-slate-200 opacity-60",
      bg: "bg-slate-50",
    },
  };

  const statusLabel: Record<SessionStatus, string> = {
    PENDING: "New Order",
    ACCEPTED: "Accepted",
    PROCESSING: "Processing",
    PAID: "Paid & Completed",
    CANCELLED: "Cancelled",
  };

  const elapsed = Math.floor(
    (Date.now() - new Date(session.createdAt).getTime()) / 1000,
  );
  const elapsedLabel =
    elapsed < 60
      ? `${elapsed}s ago`
      : elapsed < 3600
        ? `${Math.floor(elapsed / 60)}m ago`
        : `${Math.floor(elapsed / 3600)}h ago`;
  const formattedTime = new Date(session.createdAt).toLocaleTimeString(
    "en-IN",
    { hour: "2-digit", minute: "2-digit" },
  );
  const theme = statusTheme[session.status] || statusTheme.PENDING;

  return (
    <div
      className={`rounded-3xl border ${theme.border} ${theme.bg} shadow-md p-5 flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-lg`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pr-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}
            >
              {statusLabel[session.status]}
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-slate-400" />
              {formattedTime} · {elapsedLabel}
            </span>
          </div>
          <div className="text-base font-black text-slate-900 tracking-tight truncate">
            {session.customerName}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              {session.customerPhone}
            </span>
            {session.customerEmail && (
              <span
                className="text-slate-400 truncate text-[11px] max-w-[120px]"
                title={session.customerEmail}
              >
                {session.customerEmail}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">
            ₹{session.total.toLocaleString("en-IN")}
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 mt-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
            {session.paymentMethod === "CASH" ? (
              <Banknote className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : (
              <QrCodeIcon className="w-3 h-3 text-blue-600 shrink-0" />
            )}
            <span className="whitespace-nowrap">
              {session.paymentMethod === "CASH" ? "Cash Desk" : "UPI / QR"}
            </span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200/60">
          <span>Items ({session.items.length})</span>
          <span>Qty & Rate</span>
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {session.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <span className="text-slate-700 font-semibold truncate text-[11px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right shrink-0 font-mono text-[11px]">
                <span className="text-slate-500 font-medium">
                  {item.quantity}×
                </span>{" "}
                <span className="font-bold text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
          <div className="flex justify-between text-slate-500 font-medium text-[11px]">
            <span>Taxable Subtotal:</span>
            <span className="font-mono text-slate-700">
              ₹{session.subtotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium text-[11px]">
            <span>GST (18%):</span>
            <span className="font-mono text-slate-700">
              ₹{session.gstAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {session.notes && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 font-medium flex items-center gap-1.5">
          <span>📝</span>
          <span>{session.notes}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-1">
        {session.status === "PENDING" && (
          <div className="flex items-center gap-2">
            <button
              onClick={onAccept}
              className="flex-1 py-2.5 rounded-xl font-black text-xs text-white bg-[#00AEEF] hover:bg-[#0096D6] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#00AEEF]/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Accept Order
            </button>
            <button
              onClick={onCancel}
              title="Decline Order"
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
        {(session.status === "ACCEPTED" || session.status === "PROCESSING") && (
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkPaid}
              className="flex-1 py-2.5 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Wallet className="w-4 h-4" /> Mark as Paid & Invoice
            </button>
            <button
              onClick={onPrint}
              title="Print Order Slip"
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}
        {session.status === "PAID" && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl px-3.5 py-2 text-xs">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed &
              Billed
            </span>
            <button
              onClick={onPrint}
              className="text-[#00AEEF] font-black hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalkInPOSPage() {
  // ── Active Tab ────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"live" | "manual">("live");

  // ── Live Sessions State ───────────────────────────
  const [liveSessions, setLiveSessions] = useState<WalkInSession[]>([]);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Active Store for Live Orders ──────────────────
  const [liveStoreFilter, setLiveStoreFilter] = useState<
    "ranchi" | "patna" | "delhi" | "all"
  >("all");

  // Load live sessions from localStorage
  const refreshSessions = useCallback(() => {
    const all = getAllSessions();
    setLiveSessions(all);
  }, []);

  // Also poll server API for cross-device sessions
  const pollServerSessions = useCallback(async () => {
    const storeIds =
      liveStoreFilter === "all"
        ? ["ranchi", "patna", "delhi"]
        : [liveStoreFilter];
    for (const sid of storeIds) {
      try {
        const res = await fetch(`/api/pos/sessions?storeId=${sid}`);
        if (!res.ok) continue;
        const { sessions } = await res.json();
        if (Array.isArray(sessions)) {
          sessions.forEach((s: WalkInSession) => saveSession(s));
        }
      } catch {
        /* network failure, ignore */
      }
    }
    refreshSessions();
  }, [liveStoreFilter, refreshSessions]);

  useEffect(() => {
    refreshSessions();

    // BroadcastChannel for real-time same-browser sync
    if (typeof window !== "undefined") {
      broadcastRef.current = new BroadcastChannel(POS_BROADCAST_CHANNEL);
      broadcastRef.current.onmessage = (event) => {
        if (
          event.data?.type === "NEW_SESSION" ||
          event.data?.type === "SESSION_UPDATED"
        ) {
          const session: WalkInSession = event.data.session;
          saveSession(session);
          refreshSessions();
          if (event.data?.type === "NEW_SESSION") {
            setNewOrderAlert(true);
            setActiveTab("live");
            setTimeout(() => setNewOrderAlert(false), 5000);
          }
        }
      };
    }

    // Poll server every 20 seconds for cross-device sync
    pollServerSessions();
    pollRef.current = setInterval(pollServerSessions, 20000);

    return () => {
      broadcastRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refreshSessions, pollServerSessions]);

  const handleAcceptSession = (session: WalkInSession) => {
    const updated: WalkInSession = {
      ...session,
      status: "ACCEPTED",
      updatedAt: new Date().toISOString(),
    };
    saveSession(updated);
    broadcastRef.current?.postMessage({
      type: "SESSION_UPDATED",
      session: updated,
    });
    fetch("/api/pos/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: session.storeId,
        sessionId: session.id,
        updates: { status: "ACCEPTED" },
      }),
    }).catch(() => {});
    refreshSessions();
  };

  const handleMarkPaid = (session: WalkInSession) => {
    const invoiceNo = generateInvoiceNo(session.storeId);
    const updated: WalkInSession = {
      ...session,
      status: "PAID",
      invoiceNo,
      updatedAt: new Date().toISOString(),
    };
    saveSession(updated);
    broadcastRef.current?.postMessage({
      type: "SESSION_UPDATED",
      session: updated,
    });
    fetch("/api/pos/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: session.storeId,
        sessionId: session.id,
        updates: { status: "PAID", invoiceNo },
      }),
    }).catch(() => {});
    refreshSessions();
  };

  const handlePrintLiveSession = (session: WalkInSession) => {
    const storeNames: Record<string, string> = {
      ranchi: "Ranchi Main Hub (Central Stock)",
      patna: "Patna Physical Branch",
      delhi: "Delhi Physical Branch",
    };
    const storeIdUpper = session.storeId.toUpperCase() as StoreId;
    const invNo = session.invoiceNo || generateInvoiceNo(session.storeId);

    setCompletedTransaction({
      invoiceNo: invNo,
      orderSource: "WALK-IN",
      storeId: storeIdUpper,
      deviceId: `KIOSK-${storeIdUpper}-01`,
      customerType: "Walk-in Customer",
      invoiceTypeLabel: "Standard Retail Walk-in Invoice",
      rewardsEarned: Math.floor(session.total * 0.05),
      total: session.total,
      cash: session.paymentMethod === "CASH" ? session.total : 0,
      upi: session.paymentMethod === "UPI" ? session.total : 0,
      card: 0,
      date: new Date(session.createdAt || Date.now()).toLocaleString("en-IN"),
      store: storeNames[session.storeId] || `${storeIdUpper} Store Branch`,
      customerName: session.customerName || "Walk-in Customer",
      customerPhone: session.customerPhone || "9876543210",
      customerEmail: session.customerEmail || "customer@prayogindia.in",
      isB2B: false,
      companyName: "",
      gstin: "",
      companyAddress: "",
      communityOptIn: true,
      items: session.items.map((it) => ({
        product: {
          id: it.productId || `prod-${Date.now()}`,
          name: it.name,
          sku: it.sku || `SKU-${it.productId}`,
          price: it.price,
          category: "Mechatronics",
          image: it.image || "/images/products/arduino-uno.png",
        } as any,
        quantity: it.quantity,
        unitPrice: it.price,
      })),
    });
    setActiveTab("manual");
  };

  const handleCancelSession = (session: WalkInSession) => {
    const updated: WalkInSession = {
      ...session,
      status: "CANCELLED",
      updatedAt: new Date().toISOString(),
    };
    saveSession(updated);
    broadcastRef.current?.postMessage({
      type: "SESSION_UPDATED",
      session: updated,
    });
    refreshSessions();
  };

  const filteredSessions = liveSessions.filter(
    (s) => liveStoreFilter === "all" || s.storeId === liveStoreFilter,
  );
  const pendingCount = filteredSessions.filter(
    (s) => s.status === "PENDING",
  ).length;

  // 6.1 Authorized Tablet Security Mode State
  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<StoreId>("RANCHI");
  const [deviceId, setDeviceId] = useState<string>("TAB-RNC-01");
  const [authError, setAuthError] = useState<string | null>(null);
  const [activationKey, setActivationKey] = useState<string>("");
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState<Product | null>(null);

  // Store Selection State
  const [selectedStore, setSelectedStore] = useState<
    "ranchi" | "patna" | "delhi"
  >("ranchi");

  // 6.2 Customer Information & 2.2 Customer Types State
  const [customerType, setCustomerType] =
    useState<CustomerType>("Walk-in Customer");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isB2B, setIsB2B] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [communityOptIn, setCommunityOptIn] = useState(true);

  // Search & Cart State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [posCart, setPosCart] = useState<POSCartItem[]>([
    {
      product: PRODUCTS[0],
      quantity: 1,
      unitPrice: calculateCustomerPrice(
        PRODUCTS[0].price,
        "Walk-in Customer",
        1,
      ).unitPrice,
    },
    {
      product: PRODUCTS[2],
      quantity: 1,
      unitPrice: calculateCustomerPrice(
        PRODUCTS[2].price,
        "Walk-in Customer",
        1,
      ).unitPrice,
    },
  ]);

  // Recalculate cart prices when customerType changes
  useEffect(() => {
    setPosCart((prev) =>
      prev.map((item) => {
        const { unitPrice } = calculateCustomerPrice(
          item.product.price,
          customerType,
          item.quantity,
        );
        return { ...item, unitPrice };
      }),
    );
    if (customerType === "B2B Customer") {
      setIsB2B(true);
    } else if (!companyName && !gstin) {
      setIsB2B(false);
    }
  }, [customerType]);

  // 6.2 Split Payment State
  const [cashAmount, setCashAmount] = useState<number>(1000);
  const [upiAmount, setUpiAmount] = useState<number>(500);
  const [cardAmount, setCardAmount] = useState<number>(0);

  // Email invoice modal / confirmation
  const [emailSentAlert, setEmailSentAlert] = useState(false);

  // Success Receipt State with 6.1 Walk-in & 2.2 Customer Type Metadata Tags
  const [completedTransaction, setCompletedTransaction] = useState<{
    invoiceNo: string;
    orderSource: "WALK-IN";
    storeId: StoreId;
    deviceId: string;
    customerType: CustomerType;
    invoiceTypeLabel: string;
    rewardsEarned: number;
    total: number;
    cash: number;
    upi: number;
    card: number;
    date: string;
    store: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    isB2B: boolean;
    companyName: string;
    gstin: string;
    companyAddress: string;
    communityOptIn: boolean;
    items: POSCartItem[];
  } | null>(null);

  // Load authorized device credentials from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("prayog_pos_device_token");
    const savedStore = localStorage.getItem("prayog_pos_store_id") as StoreId;
    const savedDeviceId = localStorage.getItem("prayog_pos_device_id");

    if (savedToken && savedToken.startsWith("PRG_POS_AUTH_")) {
      setIsDeviceAuthorized(true);
      setDeviceToken(savedToken);
      if (savedStore) {
        setActiveStoreId(savedStore);
        setSelectedStore(savedStore.toLowerCase() as any);
      }
      if (savedDeviceId) setDeviceId(savedDeviceId);
    }
  }, []);

  // Handle Terminal Key Activation
  const handleAuthorizeDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const validKeys: Record<string, { storeId: StoreId; deviceId: string }> = {
      "PRG-RANCHI-POS-2026": { storeId: "RANCHI", deviceId: "TAB-RNC-01" },
      "PRG-PATNA-POS-2026": { storeId: "PATNA", deviceId: "TAB-PAT-01" },
      "PRG-DELHI-POS-2026": { storeId: "DELHI", deviceId: "TAB-DL-01" },
      "PRAYOG-DEMO-POS": { storeId: "RANCHI", deviceId: "TAB-DEMO-99" },
    };

    const trimmed = activationKey.trim().toUpperCase();
    const config = validKeys[trimmed];

    if (config) {
      const generatedToken = `PRG_POS_AUTH_${config.storeId}_${Date.now()}`;
      localStorage.setItem("prayog_pos_device_token", generatedToken);
      localStorage.setItem("prayog_pos_store_id", config.storeId);
      localStorage.setItem("prayog_pos_device_id", config.deviceId);

      setDeviceToken(generatedToken);
      setActiveStoreId(config.storeId);
      setSelectedStore(config.storeId.toLowerCase() as any);
      setDeviceId(config.deviceId);
      setIsDeviceAuthorized(true);
    } else {
      setAuthError(
        "Invalid Terminal Activation Key. Contact Ranchi Central HQ or use Demo Key: PRAYOG-DEMO-POS",
      );
    }
  };

  // Revoke device authorization
  const handleDeauthorizeDevice = () => {
    if (
      confirm(
        "De-authorize this physical store tablet? POS will be locked until re-authenticated.",
      )
    ) {
      localStorage.removeItem("prayog_pos_device_token");
      localStorage.removeItem("prayog_pos_store_id");
      localStorage.removeItem("prayog_pos_device_id");
      setIsDeviceAuthorized(false);
      setDeviceToken(null);
    }
  };

  // Calculations
  const subtotal = posCart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  // Set card amount to balance if defaults don't match
  useEffect(() => {
    const paidSoFar = (Number(cashAmount) || 0) + (Number(upiAmount) || 0);
    const diff = grandTotal - paidSoFar;
    if (diff > 0 && cardAmount === 0) {
      setCardAmount(diff);
    }
  }, [grandTotal]);

  const totalPaid =
    (Number(cashAmount) || 0) +
    (Number(upiAmount) || 0) +
    (Number(cardAmount) || 0);
  const remainingBalance = grandTotal - totalPaid;

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    const storeStock = getProductStockForStore(product.id, selectedStore);
    if (storeStock <= 0) {
      alert(
        `Cannot add "${product.name}" to cart: Out of stock at ${selectedStore.toUpperCase()} store (Available: 0). Central product catalogue is available but this branch has 0 inventory.`,
      );
      return;
    }

    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > storeStock) {
          alert(
            `Cannot exceed available store inventory! Maximum available at ${selectedStore.toUpperCase()}: ${storeStock} units.`,
          );
          return prev;
        }
        const { unitPrice: newPrice } = calculateCustomerPrice(
          product.price,
          customerType,
          newQty,
        );
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, unitPrice: newPrice }
            : item,
        );
      }
      const { unitPrice: initialPrice } = calculateCustomerPrice(
        product.price,
        customerType,
        1,
      );
      return [...prev, { product, quantity: 1, unitPrice: initialPrice }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const storeStock = getProductStockForStore(productId, selectedStore);

    setPosCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.product.id === productId) {
              const newQty = item.quantity + delta;
              if (newQty <= 0) return null;
              if (newQty > storeStock) {
                alert(
                  `Cannot exceed available store stock (${storeStock} units at ${selectedStore.toUpperCase()}).`,
                );
                return item;
              }
              const { unitPrice: newPrice } = calculateCustomerPrice(
                item.product.price,
                customerType,
                newQty,
              );
              return { ...item, quantity: newQty, unitPrice: newPrice };
            }
            return item;
          })
          .filter(Boolean) as POSCartItem[],
    );
  };

  const handleRemoveItem = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCompleteSale = () => {
    if (remainingBalance > 0) {
      alert(
        `Cannot complete checkout. Remaining balance unpaid: ₹${remainingBalance.toLocaleString()}`,
      );
      return;
    }

    const storeNames: Record<StoreId, string> = {
      RANCHI: "Ranchi Main Hub (Central Stock)",
      PATNA: "Patna Physical Branch",
      DELHI: "Delhi Physical Branch",
    };

    const currentStoreId = selectedStore.toUpperCase() as StoreId;
    const ruleCode = getCustomerTypeCode(customerType);
    const typeRule = CUSTOMER_TYPE_RULES[ruleCode];
    const { coinsEarned } = calculateEarnedRewards(grandTotal, customerType);

    // Deduct stock specifically from the active physical store branch
    posCart.forEach((item) => {
      deductStoreInventory({
        productId: item.product.id,
        quantity: item.quantity,
        orderSource: "WALK_IN",
        storeId: selectedStore,
      });
    });

    setCompletedTransaction({
      invoiceNo: `POS-${currentStoreId}-${Date.now().toString().slice(-6)}`,
      orderSource: "WALK-IN",
      storeId: currentStoreId,
      deviceId: deviceId,
      customerType,
      invoiceTypeLabel: typeRule.invoice.label,
      rewardsEarned: coinsEarned,
      total: grandTotal,
      cash: Number(cashAmount) || 0,
      upi: Number(upiAmount) || 0,
      card: Number(cardAmount) || 0,
      date: new Date().toLocaleString("en-IN"),
      store: storeNames[currentStoreId] || "Ranchi Main Hub",
      customerName: customerName || `${customerType}`,
      customerPhone: customerPhone || "9876543210",
      customerEmail: customerEmail || "customer@prayogindia.in",
      isB2B: isB2B || customerType === "B2B Customer",
      companyName,
      gstin,
      companyAddress,
      communityOptIn,
      items: [...posCart],
    });
  };

  const handleSendEmailInvoice = () => {
    const email =
      customerEmail ||
      prompt(
        "Enter customer email to dispatch Tax Invoice PDF:",
        "customer@gmail.com",
      );
    if (email) {
      setEmailSentAlert(true);
      setTimeout(() => setEmailSentAlert(false), 4000);
    }
  };

  const handleResetPOS = () => {
    setCompletedTransaction(null);
    setPosCart([]);
    setCashAmount(0);
    setUpiAmount(0);
    setCardAmount(0);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setIsB2B(false);
    setCompanyName("");
    setGstin("");
    setCompanyAddress("");
  };

  // -------------------------------------------------------------
  // 6.1 UNAUTHENTICATED DEVICE GATEWAY SCREEN
  // -------------------------------------------------------------
  if (!isDeviceAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200 shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-200">
              6.1 RESTRICTED IN-STORE TERMINAL
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              Physical Store Tablet Activation Required
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Walk-in POS billing is locked to authorized store terminals.
              Unauthenticated public devices cannot access checkout.
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={handleAuthorizeDevice}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Store Terminal Activation Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="Enter Store Key (e.g. PRG-RANCHI-POS-2026)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] uppercase"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-[11px] text-slate-600 space-y-1 font-mono">
              <div className="font-bold text-slate-800 uppercase text-[10px]">
                Registered Store Keys:
              </div>
              <div>
                • Ranchi Hub:{" "}
                <code className="text-[#00AEEF] font-bold">
                  PRG-RANCHI-POS-2026
                </code>
              </div>
              <div>
                • Patna Branch:{" "}
                <code className="text-[#00AEEF] font-bold">
                  PRG-PATNA-POS-2026
                </code>
              </div>
              <div>
                • Delhi Branch:{" "}
                <code className="text-[#00AEEF] font-bold">
                  PRG-DELHI-POS-2026
                </code>
              </div>
              <div>
                • Quick Demo:{" "}
                <code className="text-[#00AEEF] font-bold">
                  PRAYOG-DEMO-POS
                </code>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00AEEF]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate & Bind Tablet Device</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6.1 & 6.2 AUTHORIZED POS TERMINAL DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Store Security Info Bar */}
      <div className="bg-[#0F172A] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> AUTHORIZED POS TABLET
            </span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700">
              DEVICE: {deviceId}
            </span>
            <span className="bg-[#00AEEF]/20 text-[#00AEEF] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#00AEEF]/30">
              SRC: WALK-IN
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Walk-in POS & Live Order Management
          </h1>
          <p className="text-xs text-slate-400">
            Real-time customer kiosk orders · Split payment billing · Tax
            invoice generation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Kiosk Quick Links */}
          <div className="flex items-center gap-1.5">
            {(["ranchi", "patna", "delhi"] as const).map((sid) => (
              <a
                key={sid}
                href={`/walk-in/${sid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-[#00AEEF] text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-colors"
              >
                <Store className="w-3 h-3" />
                {sid.charAt(0).toUpperCase() + sid.slice(1)}
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            ))}
          </div>

          {/* Store Location Selector & De-authorize Trigger */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 p-1.5 rounded-2xl">
              <MapPin className="w-4 h-4 text-[#FFC20E] ml-2 shrink-0" />
              <select
                value={selectedStore}
                onChange={(e) => {
                  const store = e.target.value as any;
                  setSelectedStore(store);
                  setActiveStoreId(store.toUpperCase());
                  localStorage.setItem(
                    "prayog_pos_store_id",
                    store.toUpperCase(),
                  );
                }}
                className="bg-transparent text-xs font-extrabold text-white focus:outline-none pr-3 py-1 cursor-pointer"
              >
                <option value="ranchi" className="bg-slate-900 text-white">
                  Ranchi Main Branch (Central Stock)
                </option>
                <option value="patna" className="bg-slate-900 text-white">
                  Patna Branch Store
                </option>
                <option value="delhi" className="bg-slate-900 text-white">
                  Delhi Branch Store
                </option>
              </select>
            </div>

            <button
              onClick={handleDeauthorizeDevice}
              title="Lock & De-authorize Tablet"
              className="p-2.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-2xl border border-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="bg-amber-400 text-slate-900 px-5 py-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <Bell className="w-5 h-5 shrink-0 animate-bounce" />
          <span className="font-extrabold text-sm">
            🛎️ New customer order received from the kiosk!
          </span>
          <button
            onClick={() => {
              setActiveTab("live");
              setNewOrderAlert(false);
            }}
            className="ml-auto text-xs font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl"
          >
            View Order →
          </button>
        </div>
      )}

      {/* Tab Switcher & Quick Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeTab === "live"
                ? "bg-[#00AEEF] text-slate-950 shadow-md shadow-[#00AEEF]/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell
              className={`w-4 h-4 ${pendingCount > 0 && activeTab !== "live" ? "text-amber-500" : ""}`}
            />
            <span>Live Orders</span>
            {pendingCount > 0 && (
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "live"
                    ? "bg-slate-950 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-[#00AEEF] text-slate-950 shadow-md shadow-[#00AEEF]/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Manual POS Billing</span>
          </button>
        </div>

        {activeTab === "live" && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(
                [
                  { value: "all", label: "All Stores" },
                  { value: "ranchi", label: "Ranchi" },
                  { value: "patna", label: "Patna" },
                  { value: "delhi", label: "Delhi" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLiveStoreFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    liveStoreFilter === opt.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={pollServerSessions}
              className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        )}
      </div>

      {/* LIVE ORDERS TAB */}
      {activeTab === "live" &&
        (() => {
          // Sort newest first by date
          const sortedSessions = [...filteredSessions].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          // Group sessions by date
          const groupedByDate: Record<string, WalkInSession[]> = {};
          sortedSessions.forEach((s) => {
            const dateObj = new Date(s.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey = dateObj.toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            if (dateObj.toDateString() === today.toDateString()) {
              dateKey = "Today";
            } else if (dateObj.toDateString() === yesterday.toDateString()) {
              dateKey = "Yesterday";
            }

            if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
            groupedByDate[dateKey].push(s);
          });

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              {sortedSessions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">
                    No customer orders yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    When a customer submits an order from the kiosk, it will
                    appear here instantly.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                    {(["ranchi", "patna", "delhi"] as const).map((sid) => (
                      <a
                        key={sid}
                        href={`/walk-in/${sid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-extrabold text-[#00AEEF] bg-[#E0F7FC] px-3 py-2 rounded-xl hover:bg-[#00AEEF] hover:text-white transition-colors"
                      >
                        <Store className="w-3.5 h-3.5" />
                        Open {sid.charAt(0).toUpperCase() + sid.slice(1)} Kiosk
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                Object.entries(groupedByDate).map(
                  ([dateLabel, sessionsInGroup]) => (
                    <div key={dateLabel} className="space-y-3">
                      {/* Date Section Header */}
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex items-center gap-1.5 bg-slate-200/80 px-3 py-1 rounded-full text-xs font-black text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-[#00AEEF]" />
                          <span>{dateLabel}</span>
                        </div>
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-[11px] font-bold text-slate-400">
                          {sessionsInGroup.length} order
                          {sessionsInGroup.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Orders Grid for this date */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sessionsInGroup.map((session) => (
                          <LiveSessionCard
                            key={session.id}
                            session={session}
                            accentColor="#00AEEF"
                            onAccept={() => handleAcceptSession(session)}
                            onMarkPaid={() => handleMarkPaid(session)}
                            onCancel={() => handleCancelSession(session)}
                            onPrint={() => handlePrintLiveSession(session)}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          );
        })()}

      {/* MANUAL POS BILLING TAB */}
      {activeTab === "manual" && (
        <div className="animate-in fade-in duration-200">
          {/* If Transaction Completed -> Show Thermal Invoice Receipt Modal */}
          {completedTransaction ? (
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl space-y-6 text-slate-900 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    SALE RECORDED • INVENTORY DEDUCTED
                  </span>
                  <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-slate-200">
                    SOURCE: {completedTransaction.orderSource}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Walk-in Order Completed
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Store: {completedTransaction.store} • Terminal:{" "}
                  {completedTransaction.deviceId}
                </p>
              </div>

              {emailSentAlert && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 text-left animate-in fade-in">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>
                    Tax Invoice PDF emailed successfully to{" "}
                    <strong>{completedTransaction.customerEmail}</strong>
                  </span>
                </div>
              )}

              {/* Thermal Receipt Print Area */}
              <div
                id="thermal-receipt-area"
                className="bg-slate-50 border border-slate-300 rounded-2xl p-5 text-left space-y-3 text-xs font-mono shadow-inner"
              >
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <h3 className="font-black text-sm text-slate-900 uppercase">
                    PRAYOG INDIA TECH LABS
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {completedTransaction.store}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    GSTIN: 20AAGCP8845K1Z2 • TEL: +91 98765 43210
                  </p>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px]">
                  <span className="text-slate-500">Tax Invoice No:</span>
                  <span className="font-bold text-slate-900">
                    {completedTransaction.invoiceNo}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px]">
                  <span className="text-slate-500">Order Source:</span>
                  <span className="font-black text-emerald-700">
                    {completedTransaction.orderSource} (
                    {completedTransaction.storeId})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px]">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="text-slate-700">
                    {completedTransaction.date}
                  </span>
                </div>

                {/* Customer & B2B Details */}
                <div className="border-b border-slate-200 pb-2 space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="text-slate-800 font-bold">
                      {completedTransaction.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Type:</span>
                    <span className="font-extrabold text-[#00AEEF]">
                      {completedTransaction.customerType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Invoice Classification:
                    </span>
                    <span className="font-bold text-purple-700">
                      {completedTransaction.invoiceTypeLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="text-slate-700">
                      {completedTransaction.customerPhone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loyalty Rewards:</span>
                    <span className="font-extrabold text-emerald-700">
                      +{completedTransaction.rewardsEarned} Prayog Coins Earned
                    </span>
                  </div>
                  {completedTransaction.isB2B && (
                    <div className="pt-1 text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 space-y-0.5">
                      <div className="font-bold text-slate-900 uppercase">
                        {completedTransaction.companyName}
                      </div>
                      <div>
                        GSTIN:{" "}
                        <span className="font-bold">
                          {completedTransaction.gstin}
                        </span>
                      </div>
                      {completedTransaction.companyAddress && (
                        <div>
                          Address: {completedTransaction.companyAddress}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Itemized breakdown */}
                <div className="py-2 space-y-1.5 border-b border-dashed border-slate-300">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                    <span>Item Description</span>
                    <span>Qty x Rate = Amount</span>
                  </div>
                  {completedTransaction.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-slate-800 font-semibold text-[11px]"
                    >
                      <span className="truncate max-w-[210px]">
                        {it.product.name}
                      </span>
                      <span>
                        {it.quantity} x ₹{it.unitPrice} = ₹
                        {(it.quantity * it.unitPrice).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Section 6.2 Split Payment Structured Breakdown */}
                <div className="pt-1 space-y-1 text-slate-700 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal (Net):</span>
                    <span>
                      ₹{(completedTransaction.total / 1.18).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% Tax Included):</span>
                    <span>
                      ₹
                      {(
                        completedTransaction.total -
                        completedTransaction.total / 1.18
                      ).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-300">
                    <span>Total Order Amount:</span>
                    <span>₹{completedTransaction.total.toLocaleString()}</span>
                  </div>

                  {/* Multi-Mode Tree Breakdown */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 mt-2 space-y-1 text-slate-800 font-mono text-[11px]">
                    <div className="font-bold text-slate-900">
                      Payment Breakdown:
                    </div>
                    <div className="pl-1 text-slate-700">
                      <div>
                        ├── Cash Payment:{" "}
                        <strong className="text-emerald-700 font-bold">
                          ₹{completedTransaction.cash.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        ├── UPI Payment:{" "}
                        <strong className="text-[#00AEEF] font-bold">
                          ₹{completedTransaction.upi.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        └── Card Payment:{" "}
                        <strong className="text-purple-700 font-bold">
                          ₹{completedTransaction.card.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {completedTransaction.communityOptIn && (
                    <div className="pt-2 text-[10px] text-center text-slate-500 italic">
                      ✓ Opted in for Prayog India Workshops, Internships & Drone
                      Training Updates
                    </div>
                  )}
                </div>
              </div>

              {/* Instant Invoice Actions Bar (§6.2) */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-3 rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4 text-[#00AEEF]" />
                  <span>Thermal Print Invoice</span>
                </button>

                <a
                  href={`https://wa.me/${completedTransaction.customerPhone ? `91${completedTransaction.customerPhone}` : "919876543210"}?text=${encodeURIComponent(`Hi ${completedTransaction.customerName}, thank you for purchasing hardware at Prayog India (${completedTransaction.store})!\n\nYour Tax Invoice: ${completedTransaction.invoiceNo}\nTotal Amount Paid: ₹${completedTransaction.total}\nPayment Breakdown: Cash: ₹${completedTransaction.cash}, UPI: ₹${completedTransaction.upi}, Card: ₹${completedTransaction.card}\n\nDownload PDF: https://prayogindia.in/invoices/${completedTransaction.invoiceNo}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold px-4 py-3 rounded-xl flex items-center gap-2 shadow-md active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send PDF via WhatsApp</span>
                </a>

                <button
                  onClick={handleSendEmailInvoice}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-4 py-3 rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Invoice</span>
                </button>

                <button
                  onClick={handleResetPOS}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-extrabold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New POS Transaction</span>
                </button>
              </div>
            </div>
          ) : (
            /* POS Split Screen: Left Catalogue + Right Cart & Split Payment */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Catalogue Grid (Span 7) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Search & Category Filter */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Fast Scan SKU or Search (e.g. PRG-ARD-001, Raspberry Pi, Pixhawk)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00AEEF]"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {[
                      "All",
                      "Arduino & Microcontrollers",
                      "Drones & UAV Parts",
                      "IoT & Wireless Modules",
                      "Single Board Computers & Dev Boards",
                      "Robotics & DIY Kits",
                      "Sensors & Electronic Modules",
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-[#00AEEF] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Quick-Click Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const storeStock = getProductStockForStore(
                      product.id,
                      selectedStore,
                    );
                    const isStoreAvailable = storeStock > 0;

                    return (
                      <div
                        key={product.id}
                        className={`bg-white border rounded-2xl p-3 hover:shadow-md transition-all flex flex-col justify-between group relative ${
                          isStoreAvailable
                            ? "border-slate-200 hover:border-[#00AEEF]"
                            : "border-red-200 bg-slate-50/60 opacity-75"
                        }`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => handleAddToCart(product)}
                        >
                          <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-50 mb-2">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-1"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuickViewProduct(product);
                              }}
                              title="View Full Technical Specifications"
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 hover:bg-white text-slate-600 hover:text-[#00AEEF] rounded-full flex items-center justify-center shadow-xs transition-colors z-10 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                              {product.sku}
                            </span>
                            <span
                              className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                isStoreAvailable
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {isStoreAvailable
                                ? `${selectedStore.toUpperCase()}: ${storeStock} in stock`
                                : `${selectedStore.toUpperCase()}: OUT OF STOCK`}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-[#00AEEF]">
                            {product.name}
                          </h3>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">
                            ₹{product.price.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setSelectedQuickViewProduct(product)
                              }
                              title="Specs"
                              className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 hover:bg-[#00AEEF]/20 hover:text-[#00AEEF] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={!isStoreAvailable}
                              title={
                                isStoreAvailable
                                  ? "Add to Bill"
                                  : "Out of Stock at this store"
                              }
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                                isStoreAvailable
                                  ? "bg-[#00AEEF]/10 text-[#00AEEF] group-hover:bg-[#00AEEF] group-hover:text-white cursor-pointer"
                                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Customer Info, POS Cart & Split Payment Engine (Span 5) */}
              <div className="lg:col-span-5 space-y-4">
                {/* 6.2 Customer Details & 2.2 Customer Types Form */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#00AEEF]" /> 1. Customer
                      &amp; Tax Profile
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400">
                      Section 2.2
                    </span>
                  </div>

                  {/* 2.2 Customer Type Selection Pills */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Select Customer Type:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                      {(
                        [
                          "Walk-in Customer",
                          "B2B Customer",
                          "Registered Customer",
                          "B2C Customer",
                          "Guest Customer",
                        ] as CustomerType[]
                      ).map((t) => {
                        const ruleCode = getCustomerTypeCode(t);
                        const rule = CUSTOMER_TYPE_RULES[ruleCode];
                        const isSelected = customerType === t;

                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setCustomerType(t)}
                            className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer truncate ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {t.replace(" Customer", "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Pricing & Rewards Banner */}
                  <div className="p-2.5 rounded-2xl bg-[#00AEEF]/5 border border-[#00AEEF]/20 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#00AEEF] flex items-center gap-1">
                      <BadgePercent className="w-3.5 h-3.5" />
                      {
                        CUSTOMER_TYPE_RULES[getCustomerTypeCode(customerType)]
                          .pricing.ruleName
                      }
                    </span>
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />+
                      {
                        calculateEarnedRewards(grandTotal, customerType)
                          .coinsEarned
                      }{" "}
                      Coins
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile (10 Digits)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email for E-Invoice (e.g. buyer@gmail.com)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isB2B}
                        onChange={(e) => setIsB2B(e.target.checked)}
                        className="accent-[#00AEEF] rounded w-3.5 h-3.5"
                      />
                      <span>B2B Tax Invoice</span>
                    </label>

                    {/* 6.2 Community Opt-in Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-emerald-700">
                      <input
                        type="checkbox"
                        checked={communityOptIn}
                        onChange={(e) => setCommunityOptIn(e.target.checked)}
                        className="accent-emerald-600 rounded w-3.5 h-3.5"
                      />
                      <span>PRAYOG Community Opt-In</span>
                    </label>
                  </div>

                  {isB2B && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Company / Institution Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
                        />
                        <input
                          type="text"
                          placeholder="GSTIN (e.g. 20AAGCP8845K1Z2)"
                          value={gstin}
                          onChange={(e) =>
                            setGstin(e.target.value.toUpperCase())
                          }
                          className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 uppercase"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Institutional Registered Address"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* POS Cart Items */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-[#00AEEF]" /> 2. POS
                      Cart ({posCart.length} items)
                    </h2>
                    {posCart.length > 0 && (
                      <button
                        onClick={() => setPosCart([])}
                        className="text-[10px] font-extrabold text-red-500 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {posCart.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      Scan items or click products on the left to add to bill.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-100">
                      {posCart.map((item) => (
                        <div
                          key={item.product.id}
                          className="pt-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex-1 truncate">
                            <h4 className="font-extrabold text-slate-900 truncate">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ₹{item.unitPrice} each
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.product.id, -1)
                              }
                              className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-extrabold text-slate-800 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.product.id, 1)
                              }
                              className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="text-slate-400 hover:text-red-500 p-1 ml-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-black text-slate-900 w-16 text-right">
                            ₹{(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Totals Summary */}
                  <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal (Net):</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>GST (18% Tax):</span>
                      <span>₹{gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                      <span>Total Order Amount:</span>
                      <span className="text-[#00AEEF]">
                        ₹{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6.2 Split Payment Engine with Tree Visualizer */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-600" /> 3. Split
                      Payment Breakdown
                    </h2>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        remainingBalance === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : remainingBalance > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {remainingBalance === 0
                        ? "✓ Balanced"
                        : remainingBalance > 0
                          ? `Unpaid: ₹${remainingBalance}`
                          : `Change: ₹${Math.abs(remainingBalance)}`}
                    </span>
                  </div>

                  {/* 3 Split Inputs: Cash, UPI, Card */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Cash */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Banknote className="w-3 h-3 text-emerald-600" /> Cash
                        </span>
                        <button
                          onClick={() =>
                            setCashAmount(
                              remainingBalance > 0
                                ? cashAmount + remainingBalance
                                : grandTotal,
                            )
                          }
                          className="text-[9px] text-[#00AEEF] hover:underline cursor-pointer"
                        >
                          Fill
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={cashAmount || ""}
                        placeholder="₹0"
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                        className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>

                    {/* UPI */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-[#00AEEF]" /> UPI QR
                        </span>
                        <button
                          onClick={() =>
                            setUpiAmount(
                              remainingBalance > 0
                                ? upiAmount + remainingBalance
                                : grandTotal,
                            )
                          }
                          className="text-[9px] text-[#00AEEF] hover:underline cursor-pointer"
                        >
                          Fill
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={upiAmount || ""}
                        placeholder="₹0"
                        onChange={(e) => setUpiAmount(Number(e.target.value))}
                        className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>

                    {/* Card */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-purple-600" />{" "}
                          Card
                        </span>
                        <button
                          onClick={() =>
                            setCardAmount(
                              remainingBalance > 0
                                ? cardAmount + remainingBalance
                                : grandTotal,
                            )
                          }
                          className="text-[9px] text-[#00AEEF] hover:underline cursor-pointer"
                        >
                          Fill
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={cardAmount || ""}
                        placeholder="₹0"
                        onChange={(e) => setCardAmount(Number(e.target.value))}
                        className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Tree Split Visualizer Matching Section 6.2 */}
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-2xl font-mono text-[11px] space-y-0.5">
                    <div className="text-white font-bold">
                      Total Order Amount: ₹{grandTotal.toLocaleString()}
                    </div>
                    <div className="text-slate-400 pl-1">
                      <div>
                        ├── Cash Payment:{" "}
                        <span className="text-emerald-400 font-bold">
                          ₹{(Number(cashAmount) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        ├── UPI Payment:{" "}
                        <span className="text-[#00AEEF] font-bold">
                          ₹{(Number(upiAmount) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        └── Card Payment:{" "}
                        <span className="text-purple-300 font-bold">
                          ₹{(Number(cardAmount) || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Walk-in Order CTA */}
                  <button
                    disabled={posCart.length === 0 || remainingBalance > 0}
                    onClick={handleCompleteSale}
                    className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00AEEF]/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#FFC20E]" />
                    <span>Complete Walk-in Sale & Generate Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Print-specific CSS: Print only the receipt, hide all dashboard UI */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-area,
          #thermal-receipt-area * {
            visibility: visible !important;
          }
          #thermal-receipt-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 400px !important;
            margin: 0 auto !important;
            padding: 16px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
