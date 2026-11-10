"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CreditCard,
  Banknote,
  QrCode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  RefreshCw,
  Store,
  User,
  Percent,
  X,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Download,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { STORES, StoreId } from "@/data/storeConfig";
import { ProfessionalBillModal } from "@/components/invoice/ProfessionalBillModal";

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export default function StorePOSPage() {
  const [staffStore, setStaffStore] = useState<string>(""); // Authoritative store from staff session
  const [storeCode, setStoreCode] = useState("PATNA");
  const [storeName, setStoreName] = useState("Patna Branch");
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Customer & Bill Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [notes, setNotes] = useState("");

  // Completed Invoice Modal State
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Store Products & Stock – uses the inventory API which enforces staff store isolation
  const loadStoreData = async (overrideStore?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/inventory");
      const data = await res.json();
      if (data.success) {
        const resolvedStore = overrideStore || data.store || "PATNA";
        setStoreCode(resolvedStore.toUpperCase());
        setInventoryList(data.data.items || []);
        const sMeta = STORES[((resolvedStore).toLowerCase() as StoreId)] || STORES.patna || STORES.ranchi;
        setStoreName(sMeta.name);
      }
    } catch {
      // Fallback to local catalog
      setInventoryList(PRODUCTS.map((p) => ({ ...p, localStock: p.stock || 25 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // First: load staff session to get the authoritative store assignment
    fetch("/api/staff/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user?.storeCode) {
          const assigned = d.user.storeCode.toUpperCase();
          setStaffStore(assigned);
          setStoreCode(assigned);
          const sMeta = STORES[(assigned.toLowerCase() as StoreId)] || STORES.ranchi;
          setStoreName(sMeta.name);
        }
      })
      .catch(() => {})
      .finally(() => loadStoreData());
  }, []);

  // Filter products by search and category
  const filteredProducts = inventoryList.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    const matchesCat =
      selectedCategory === "All" ||
      p.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const categories = ["All", "Controllers", "Sensors", "Motors", "Robotics Kits", "Electronic Components"];

  // Cart operations
  const addToCart = (product: Product, stockLimit: number = 999) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= stockLimit) {
          alert(`Maximum stock available in ${storeCode} store is ${stockLimit} units.`);
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.price }];
    });
  };

  const updateQuantity = (productId: string, delta: number, stockLimit: number = 999) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const newQty = i.quantity + delta;
            if (newQty > stockLimit) {
              alert(`Only ${stockLimit} units available in ${storeCode} store.`);
              return i;
            }
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setDiscountPercent(0);
    setNotes("");
  };

  // Calculations
  const rawSubtotal = cart.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const discountAmount = Math.round((rawSubtotal * Math.min(25, discountPercent)) / 100);
  const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const gstAmount = Math.round(discountedSubtotal * 0.18);
  const grandTotal = discountedSubtotal; // Inclusive retail pricing

  // Complete Order
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    // Always use backend-derived store (never trust client storeCode alone)
    const orderData = {
      storeId: storeCode.toLowerCase(),
      items: cart.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
      customerName: customerName.trim() || "Walk-in Guest",
      customerPhone: customerPhone.trim() || "+91 90000 00000",
      customerEmail: customerEmail.trim() || "counter@prayogindia.com",
      paymentMethod: paymentMode,
      discount: discountAmount,
      notes: notes.trim(),
    };

    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      // Backend returns `order` on success (not `data`)
      const serverOrder = data.order || data.data;
      const fallbackInvoiceNo = `INV-${storeCode}-${Date.now().toString().slice(-6)}`;
      const fallbackOrderId = `ORD-${storeCode}-${Date.now().toString().slice(-6)}`;

      const displayOrder = serverOrder
        ? {
            id: serverOrder.id || fallbackOrderId,
            invoiceNo: serverOrder.invoiceNo || fallbackInvoiceNo,
            orderNumber: serverOrder.orderNumber || serverOrder.id || fallbackOrderId,
            customerName: serverOrder.customerName,
            customerPhone: serverOrder.customerPhone,
            customerEmail: serverOrder.customerEmail,
            storeCode: serverOrder.storeCode || storeCode,
            storeName,
            paymentMethod: serverOrder.paymentMethod || paymentMode,
            totalAmount: serverOrder.totalAmount || grandTotal,
            rawSubtotal,
            discountAmount,
            gstAmount,
            grandTotal,
            createdAt: serverOrder.createdAt || new Date().toISOString(),
            cartItems: [...cart],
            items: serverOrder.items || cart,
          }
        : {
            id: fallbackOrderId,
            invoiceNo: fallbackInvoiceNo,
            orderNumber: fallbackInvoiceNo,
            customerName: customerName.trim() || "Walk-in Guest",
            customerPhone: customerPhone.trim() || "+91 90000 00000",
            storeCode,
            storeName,
            paymentMethod: paymentMode,
            totalAmount: grandTotal,
            rawSubtotal,
            discountAmount,
            gstAmount,
            grandTotal,
            createdAt: new Date().toISOString(),
            cartItems: [...cart],
          };

      setCompletedOrder(displayOrder);

      // Refresh inventory after deduction
      loadStoreData();
      clearCart();
    } catch {
      // Local fallback in case network hiccup
      const fallbackInvoiceNo = `INV-${storeCode}-${Date.now().toString().slice(-6)}`;
      const fallbackOrderId = `ORD-${storeCode}-${Date.now().toString().slice(-6)}`;
      const localInvoice = {
        id: fallbackOrderId,
        invoiceNo: fallbackInvoiceNo,
        orderNumber: fallbackInvoiceNo,
        storeName,
        storeCode,
        totalAmount: grandTotal,
        rawSubtotal,
        discountAmount,
        gstAmount,
        grandTotal,
        paymentMethod: paymentMode,
        createdAt: new Date().toISOString(),
        cartItems: [...cart],
        customerName: customerName.trim() || "Walk-in Guest",
        customerPhone: customerPhone.trim() || "+91 90000 00000",
      };
      setCompletedOrder(localInvoice);
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* ── Top Header ── */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-black">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Store POS Billing Terminal
              </h1>
              <span className="bg-[#2563EB] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {storeCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct counter sales, instant barcode/SKU lookup, and A4 GST invoice printing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadStoreData()}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Reload Stock"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Stock</span>
          </button>
        </div>
      </div>

      {/* ── Main Split View: Left Catalog + Right Billing Cart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Product Selector (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          {/* Search Bar & Categories */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Scan barcode, SKU, or search components (e.g. PRG-ARD-001)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-all font-mono"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === c
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const stock = p.localStock ?? p.quantity ?? 20;
              const isOutOfStock = stock <= 0;
              const inCartItem = cart.find((i) => i.product.id === p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p, stock)}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between select-none ${
                    isOutOfStock
                      ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                      : "border-slate-200 hover:border-[#2563EB] hover:shadow-xs bg-white cursor-pointer active:scale-95"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-mono text-[9px] font-bold text-slate-400">
                        {p.sku}
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? "bg-red-100 text-red-700"
                            : stock < 10
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isOutOfStock ? "0 Stock" : `${stock} in stock`}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-slate-900">
                      ₹{p.price?.toLocaleString("en-IN")}
                    </span>

                    {inCartItem ? (
                      <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center">
                        {inCartItem.quantity}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] hover:bg-[#2563EB] hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active POS Billing Register (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Current Register Bill
              </h2>
              <span className="text-[10px] text-slate-400">
                {cart.length} unique items ({cart.reduce((a, b) => a + b.quantity, 0)} units)
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Store className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">No items in bill. Click products to add.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ₹{item.unitPrice.toLocaleString("en-IN")} each
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold w-6 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1, (item.product as any).localStock || 999)}
                      className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-6 h-6 rounded text-red-500 hover:bg-red-50 flex items-center justify-center ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Details Form */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-[#2563EB]" /> Walk-in Customer Info
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
              <input
                type="tel"
                placeholder="10-digit Mobile"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Payment Method
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "UPI", label: "UPI QR", icon: QrCode },
                { id: "CASH", label: "Cash", icon: Banknote },
                { id: "CARD", label: "Card Swipe", icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMode(m.id as any)}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      active
                        ? "border-[#2563EB] bg-blue-50 text-[#2563EB] font-black shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manager Authorized Discount */}
          <div className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-600" /> Authorized Discount
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 5, 10, 15].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscountPercent(d)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    discountPercent === d
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>

          {/* Billing Totals */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono">₹{rawSubtotal.toLocaleString("en-IN")}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Authorized Discount ({discountPercent}%)</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>GST (18% In-Store Included)</span>
              <span className="font-mono">₹{gstAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-100">
              <span>Payable Amount</span>
              <span className="font-mono text-base text-[#2563EB]">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Complete & Print Button */}
          <button
            type="button"
            disabled={cart.length === 0 || submitting}
            onClick={handleCheckout}
            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
              cart.length === 0 || submitting
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#2563EB] hover:bg-blue-700 text-white shadow-blue-500/20"
            }`}
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            <span>{submitting ? "Processing Sale..." : "Generate Invoice & Complete Bill"}</span>
          </button>
        </div>
      </div>

      {/* ── 5. Professional Tax Invoice Modal (A4 Modern + Thermal) ── */}
      {completedOrder && (
        <ProfessionalBillModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          defaultFormat="modern"
        />
      )}
    </div>
  );
}

