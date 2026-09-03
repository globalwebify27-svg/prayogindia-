"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ChevronRight,
  X,
  CheckCircle2,
  Banknote,
  QrCode,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Store,
  Package,
  ScanBarcode,
  Sparkles,
  Clock,
  MapPin,
  MessageSquare,
  ChevronDown,
  Tag,
  Zap,
  Lock,
  KeyRound,
  AlertCircle,
  Tablet,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import {
  STORES,
  StoreId,
  WalkInSession,
  WalkInCartItem,
  PaymentMethod,
  saveSession,
  generateSessionId,
  generateInvoiceNo,
  POS_BROADCAST_CHANNEL,
} from "@/data/storeConfig";
import { PRODUCTS, Product } from "@/data/mockData";
import { QuickViewModal } from "@/components/products/QuickViewModal";

// ─────────────────────────────────────────────────────
// Cart item in kiosk state
// ─────────────────────────────────────────────────────
interface KioskCartItem {
  product: Product;
  quantity: number;
}

type KioskView = "browse" | "cart" | "checkout" | "success";

const CATEGORIES = [
  "All",
  "Arduino & Microcontrollers",
  "Drones & UAV Parts",
  "IoT & Wireless Modules",
  "Single Board Computers & Dev Boards",
  "Robotics & DIY Kits",
  "Sensors & Electronic Modules",
];

// ─────────────────────────────────────────────────────
// Kiosk Header
// ─────────────────────────────────────────────────────
function KioskHeader({
  store,
  cartCount,
  cartTotal,
  view,
  onCartClick,
  onBack,
  onLock,
}: {
  store: (typeof STORES)[StoreId];
  cartCount: number;
  cartTotal: number;
  view: KioskView;
  onCartClick: () => void;
  onBack: () => void;
  onLock?: () => void;
}) {
  const storeData = store;
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {(view === "cart" || view === "checkout") && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow shrink-0"
          style={{ background: storeData.accentColor }}
        >
          P
        </div>
        <div className="min-w-0">
          <div className="font-black text-slate-900 text-sm truncate">
            {storeData.shortName}
          </div>
          <div className="text-[10px] text-slate-400 font-medium truncate hidden sm:block">
            {storeData.city}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {view === "browse" && (
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            style={{
              background: cartCount > 0 ? storeData.accentColor : "#64748B",
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">
                  ₹{cartTotal.toLocaleString()}
                </span>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              </>
            )}
          </button>
        )}

        {view === "browse" && (
          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hidden sm:flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Staff Online
          </div>
        )}

        {onLock && (
          <button
            onClick={onLock}
            title="Lock Kiosk Device (Manager Login Required)"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────────────
function ProductCard({
  product,
  quantity,
  accentColor,
  onAdd,
  onRemove,
  onBuyNow,
  onOpenDetail,
}: {
  product: Product;
  quantity: number;
  accentColor: string;
  onAdd: () => void;
  onRemove: () => void;
  onBuyNow: () => void;
  onOpenDetail: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Product Image Area - Clickable to View Multiple Images & 360 View */}
      <div
        onClick={onOpenDetail}
        className="relative h-36 sm:h-44 bg-slate-50 overflow-hidden cursor-pointer"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full border border-red-200">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-slate-900/80 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
            {product.sku}
          </span>
        </div>
        {product.discount && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              {product.discount}
            </span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
          <span>Photos & 360°</span>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3
          onClick={onOpenDetail}
          className="text-xs font-extrabold text-slate-900 leading-tight line-clamp-2 cursor-pointer hover:text-[#00AEEF] transition-colors"
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sm font-black text-slate-900">
            ₹{product.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 line-through">
            ₹{product.mrp.toLocaleString()}
          </span>
        </div>

        {product.inStock ? (
          quantity === 0 ? (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={onAdd}
                className="py-2.5 px-1 rounded-xl font-extrabold text-[11px] text-white transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-1 cursor-pointer"
                style={{ background: accentColor }}
              >
                <Plus className="w-3 h-3 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </button>
              <button
                onClick={onBuyNow}
                className="py-2.5 px-1 rounded-xl font-extrabold text-[11px] bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center text-center cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <div className="flex items-center justify-between bg-slate-100 rounded-xl px-1 py-0.5">
                <button
                  onClick={onRemove}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-90 cursor-pointer"
                >
                  <Minus className="w-3 h-3 text-slate-700" />
                </button>
                <span className="font-black text-slate-900 text-xs w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={onAdd}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-colors active:scale-90 cursor-pointer"
                  style={{ background: accentColor }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={onBuyNow}
                className="py-2 px-1 rounded-xl font-extrabold text-[11px] bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center text-center cursor-pointer"
              >
                <span>Checkout</span>
              </button>
            </div>
          )
        ) : (
          <div className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-slate-100 text-center">
            Unavailable
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Kiosk Page
// ─────────────────────────────────────────────────────
export default function StoreKioskPage() {
  const params = useParams();
  const storeId = (params?.storeId as StoreId) || "ranchi";
  const store = STORES[storeId] || STORES.ranchi;

  // ── Kiosk Device Unlock / Manager Authentication State ──
  const [isDeviceUnlocked, setIsDeviceUnlocked] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [kioskUsername, setKioskUsername] = useState<string>(
    `${storeId}_kiosk`,
  );
  const [kioskPassword, setKioskPassword] = useState<string>("kiosk123");
  const [loginError, setLoginError] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const [view, setView] = useState<KioskView>("browse");
  const [cart, setCart] = useState<KioskCartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedSession, setCompletedSession] =
    useState<WalkInSession | null>(null);
  const [showProductDetail, setShowProductDetail] = useState<Product | null>(
    null,
  );

  const broadcastRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Check if tablet was previously unlocked by the Store Manager
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem(
        `prayog_kiosk_unlocked_${storeId}`,
      );
      if (savedAuth === "true") {
        setIsDeviceUnlocked(true);
      }
      setCheckingAuth(false);
      broadcastRef.current = new BroadcastChannel(POS_BROADCAST_CHANNEL);
    }
    return () => broadcastRef.current?.close();
  }, [storeId]);

  // Handle Store Manager / Kiosk Staff device login
  const handleUnlockKiosk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/staff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: kioskUsername,
          password: kioskPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(
          data.message ||
            "Invalid manager-assigned credentials for this kiosk.",
        );
        setLoginLoading(false);
        return;
      }

      // Save unlocked state for this kiosk tablet
      if (typeof window !== "undefined") {
        localStorage.setItem(`prayog_kiosk_unlocked_${storeId}`, "true");
      }
      setIsDeviceUnlocked(true);
      setLoginLoading(false);
    } catch {
      setLoginError("Authentication failed. Please check network connection.");
      setLoginLoading(false);
    }
  };

  const handleLockKiosk = () => {
    if (
      confirm("Lock this kiosk tablet? Store manager will need to login again.")
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(`prayog_kiosk_unlocked_${storeId}`);
      }
      setIsDeviceUnlocked(false);
    }
  };

  // Derived values
  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  const getQty = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx < 0) return prev;
      const newQty = prev[idx].quantity - 1;
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: newQty };
      return updated;
    });
  }, []);

  const deleteFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) return;
    setSubmitting(true);

    const sessionItems: WalkInCartItem[] = cart.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      sku: i.product.sku,
      image: i.product.image,
      price: i.product.price,
      mrp: i.product.mrp,
      quantity: i.quantity,
    }));

    const session: WalkInSession = {
      id: generateSessionId(storeId),
      storeId,
      status: "PENDING",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      paymentMethod,
      items: sessionItems,
      subtotal,
      gstAmount,
      total: grandTotal,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage for same-device sync
    saveSession(session);

    // Broadcast to manager POS (same-browser tabs)
    broadcastRef.current?.postMessage({ type: "NEW_SESSION", session });

    // Also push to server API for cross-device sync
    try {
      await fetch("/api/pos/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, session }),
      });
    } catch {
      // Network failure is non-fatal — localStorage sync is primary
    }

    setCompletedSession(session);
    setSubmitting(false);
    setView("success");
  };

  // ── RENDER HELPERS ────────────────────────────────

  const renderBrowseView = () => (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search + Category */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 space-y-3 sticky top-[57px] z-20">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or scan SKU..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={
                selectedCategory === cat
                  ? { background: store.accentColor }
                  : undefined
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 py-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-bold text-sm">No products found</p>
              <p className="text-xs mt-1">Try a different search or category</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-500">
                  {filteredProducts.length} products
                </p>
                {cartCount > 0 && (
                  <button
                    onClick={() => setView("cart")}
                    className="flex items-center gap-2 text-xs font-extrabold px-3 py-1.5 rounded-xl text-white shadow-sm active:scale-95 transition-all"
                    style={{ background: store.accentColor }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {cartCount} items · ₹{subtotal.toLocaleString()}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantity={getQty(p.id)}
                    accentColor={store.accentColor}
                    onAdd={() => addToCart(p)}
                    onRemove={() => removeFromCart(p)}
                    onBuyNow={() => {
                      addToCart(p);
                      setView("cart");
                    }}
                    onOpenDetail={() => setShowProductDetail(p)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky Cart Bar */}
      {cartCount > 0 && (
        <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => setView("cart")}
            className="w-full py-4 rounded-2xl font-extrabold text-sm text-white flex items-center justify-between px-5 active:scale-[0.99] transition-all shadow-lg"
            style={{ background: store.accentColor }}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              View Cart ({cartCount} items)
            </span>
            <span>₹{subtotal.toLocaleString()} →</span>
          </button>
        </div>
      )}
    </div>
  );

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "PRAYOG10") {
      setCouponDiscount(Math.round(subtotal * 0.1));
      setAppliedCoupon("PRAYOG10");
    } else if (code === "STORE50") {
      setCouponDiscount(Math.min(subtotal, 50));
      setAppliedCoupon("STORE50");
    } else {
      alert("Invalid coupon code. Try PRAYOG10 for 10% discount.");
    }
  };

  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const renderCartView = () => (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setView("browse")}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-300 z-10">
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#00AEEF]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Your Cart
            </h2>
            <span className="bg-[#00AEEF] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={() => setView("browse")}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-3">
              <ShoppingCart className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">
                Your cart is currently empty
              </p>
              <button
                onClick={() => setView("browse")}
                className="mt-2 bg-[#00AEEF] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md hover:bg-[#0096D6] transition-all cursor-pointer"
              >
                Browse Store Products
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-50 p-1 border border-slate-200/80 shrink-0 relative overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {item.product.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.product.sku}
                  </div>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    ₹
                    {(item.product.price * item.quantity).toLocaleString(
                      "en-IN",
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer active:scale-90"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black px-1.5 text-slate-900 min-w-[18px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(item.product)}
                    className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer active:scale-90"
                    aria-label="Increase"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => deleteFromCart(item.product.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
            {/* Coupon Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="COUPON  CODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs uppercase font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#00AEEF]"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-[#00AEEF] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Coupon {appliedCoupon}{" "}
                applied (-₹{couponDiscount.toLocaleString("en-IN")})
              </p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-extrabold text-slate-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">
                  GST &amp; Express Shipping
                </span>
                <span className="text-emerald-600 font-bold">Included</span>
              </div>
              <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-[#00AEEF]">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setView("browse")}
                className="border border-slate-300 hover:border-slate-400 text-slate-800 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-colors cursor-pointer"
              >
                Full Cart
              </button>
              <button
                onClick={() => setView("checkout")}
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pan-India Dispatch · 100% Genuine</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCheckoutView = () => (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Top Header Card */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Your Details &amp; Payment
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Quick walk-in billing details for counter fulfillment
            </p>
          </div>
          <button
            onClick={() => setView("cart")}
            className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Cart</span>
          </button>
        </div>

        {/* Customer Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-[#00AEEF]" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Customer Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Om Kumar"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit number"
                maxLength={10}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email Address{" "}
                <span className="text-slate-400 font-normal">(for e-bill)</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Notes / Requirements{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Pack with 9V battery connector"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Banknote className="w-4 h-4 text-[#00AEEF]" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Payment Method
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: "CASH",
                  label: "Pay with Cash",
                  sub: "Pay at store counter",
                  icon: Banknote,
                  color: "#059669",
                },
                {
                  value: "UPI",
                  label: "Pay via UPI",
                  sub: "Scan QR at counter",
                  icon: QrCode,
                  color: "#7C3AED",
                },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const isSelected = paymentMethod === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 text-left cursor-pointer active:scale-95 ${
                    isSelected
                      ? "border-current bg-emerald-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                  style={
                    isSelected
                      ? { borderColor: opt.color, background: `${opt.color}0D` }
                      : undefined
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isSelected ? opt.color : "#E2E8F0" }}
                  >
                    <Icon
                      className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-600"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900">
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {opt.sub}
                    </div>
                    {isSelected && (
                      <div
                        className="text-[9px] font-black uppercase tracking-wider mt-0.5"
                        style={{ color: opt.color }}
                      >
                        Selected ✓
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Price Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700 pb-1.5 border-b border-slate-100">
            <span>Order Summary</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {cartCount} items
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between items-center text-slate-600"
              >
                <span className="truncate max-w-[280px] font-medium">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-bold text-slate-900 shrink-0 ml-2">
                  ₹
                  {(item.product.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>In-Store GST &amp; Local Dispatch</span>
              <span className="text-emerald-600 font-bold">Included</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-100">
              <span>Payable Amount</span>
              <span className="text-[#00AEEF] text-base">
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Validation Error Message */}
        {(!customerName.trim() || !customerPhone.trim()) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Please enter Customer Name and 10-digit Mobile Number to place the
              order.
            </span>
          </div>
        )}

        {/* Submission Button */}
        <div className="pt-1 pb-4">
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={
              submitting || !customerName.trim() || !customerPhone.trim()
            }
            className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-md shadow-[#00AEEF]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: store.accentColor || "#00AEEF" }}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending Order to Counter...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Place Walk-in Order</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessView = () => (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-12 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 shadow-xl"
        style={{
          background: `${store.accentColor}15`,
          borderColor: `${store.accentColor}40`,
        }}
      >
        <CheckCircle2
          className="w-10 h-10"
          style={{ color: store.accentColor }}
        />
      </div>

      <div
        className="inline-flex items-center gap-2 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full mb-4"
        style={{ background: store.accentColor }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Order Sent to Counter!
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
        Thank You,
        <br />
        <span style={{ color: store.accentColor }}>
          {completedSession?.customerName}!
        </span>
      </h1>
      <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto mb-8">
        Your order has been sent to the store staff. Please proceed to the
        counter — they will assist you with payment.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full max-w-sm text-left space-y-3 mb-6">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
          Order Details
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Session ID</span>
          <span className="font-mono font-bold text-slate-700 text-[10px]">
            {completedSession?.id}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Store</span>
          <span className="font-bold text-slate-800">{store.shortName}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Items</span>
          <span className="font-bold text-slate-800">
            {completedSession?.items.length} product(s)
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Total Amount</span>
          <span className="font-black text-slate-900">
            ₹{completedSession?.total.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Payment</span>
          <span className="font-bold" style={{ color: store.accentColor }}>
            {completedSession?.paymentMethod === "CASH"
              ? "💵 Cash at Counter"
              : "📱 UPI QR at Counter"}
          </span>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full max-w-sm text-xs text-amber-800 font-bold flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center shrink-0">
          <Store className="w-4 h-4 text-amber-700" />
        </div>
        Please walk to the billing counter. Show this screen or give your name
        to the staff.
      </div>

      <button
        onClick={() => {
          setCart([]);
          setCustomerName("");
          setCustomerPhone("");
          setCustomerEmail("");
          setNotes("");
          setCompletedSession(null);
          setView("browse");
        }}
        className="text-xs font-extrabold px-6 py-3 rounded-xl text-white shadow-md active:scale-95 transition-all"
        style={{ background: store.accentColor }}
      >
        Start New Shopping Session
      </button>
    </div>
  );

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">
            Verifying Device Status...
          </span>
        </div>
      </div>
    );
  }

  // ── 1. KIOSK LOCKED: Store Manager Setup & Login Form ──
  if (!isDeviceUnlocked) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Glow */}
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: store.accentColor }}
        />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#00AEEF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-900/95 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10"
                style={{ background: store.accentColor }}
              >
                <Tablet className="w-7 h-7" />
              </div>

              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white inline-block mb-1"
                  style={{ background: store.accentColor }}
                >
                  {store.shortName} · In-Store Kiosk
                </span>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Device Authentication Required
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Enter the store manager-assigned kiosk credentials to unlock
                  this tablet for customer shopping.
                </p>
              </div>
            </div>

            {/* Error banner */}
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Manager Login Form */}
            <form onSubmit={handleUnlockKiosk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Kiosk Device Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={kioskUsername}
                    onChange={(e) => setKioskUsername(e.target.value)}
                    placeholder={`e.g. ${storeId}_kiosk`}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] transition-all font-mono"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Device Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={kioskPassword}
                    onChange={(e) => setKioskPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
                style={{ background: store.accentColor }}
              >
                {loginLoading ? (
                  <span>Unlocking Terminal...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Kiosk for Customers</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
              Assigned Store:{" "}
              <span className="font-bold text-slate-300">{store.city}</span> ·
              Managed by Branch Store Manager
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. KIOSK UNLOCKED: Customer Shopping Screen ──
  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col"
      style={{ "--accent": store.accentColor } as React.CSSProperties}
    >
      <KioskHeader
        store={store}
        cartCount={cartCount}
        cartTotal={subtotal}
        view={view}
        onCartClick={() => setView("cart")}
        onBack={() => setView(view === "checkout" ? "cart" : "browse")}
        onLock={handleLockKiosk}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {renderBrowseView()}
        {view === "cart" && renderCartView()}
        {view === "checkout" && (
          <div className="absolute inset-0 bg-slate-100 z-20 flex flex-col">
            {renderCheckoutView()}
          </div>
        )}
        {view === "success" && (
          <div className="absolute inset-0 bg-slate-100 z-20 flex flex-col">
            {renderSuccessView()}
          </div>
        )}
      </main>

      {/* ── Full Multiple Images, Video & 360° View Modal ── */}
      {showProductDetail && (
        <QuickViewModal
          product={showProductDetail}
          onClose={() => setShowProductDetail(null)}
          onAddToCart={(prod) => {
            addToCart(prod);
          }}
        />
      )}
    </div>
  );
}
