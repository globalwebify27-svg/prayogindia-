"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Sparkles,
  X,
  Phone,
  User,
  ArrowRight,
  Printer,
  Share2,
  Download,
  Mail,
  Send,
  FileText,
  Check,
  Zap,
  RotateCw,
  RotateCcw,
  Eye,
  Scan,
} from "lucide-react";

export default function KioskCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState<{
    store: string;
    storeName: string;
  }>({ store: "", storeName: "" });
  const [loading, setLoading] = useState(true);

  // 360 View Modal state
  const [view360Product, setView360Product] = useState<any | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [requireB2B, setRequireB2B] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "SPLIT_PAYMENT"
  >("CASH");
  const [splitAmounts, setSplitAmounts] = useState<{
    cash: string;
    upi: string;
    card: string;
    bankTransfer: string;
  }>({
    cash: "",
    upi: "",
    card: "",
    bankTransfer: "",
  });

  const [orderComplete, setOrderComplete] = useState<any | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/kiosk/products?category=${activeCategory}&q=${search}`,
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
        setStoreInfo({ store: data.store, storeName: data.storeName });

        // Extract distinct categories
        const cats = Array.from(
          new Set((data.data || []).map((p: any) => p.category)),
        ) as string[];
        setCategories(cats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, search]);

  // Auto rotation timer for 360 view
  useEffect(() => {
    if (!view360Product || !autoRotate) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [view360Product, autoRotate]);

  const open360Viewer = (product: any) => {
    setView360Product(product);
    setRotationAngle(0);
    setAutoRotate(true);
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleBuyNow = (product: any) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCheckoutOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const totalAmount = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const totalCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  const currentSplitSum =
    (parseFloat(splitAmounts.cash) || 0) +
    (parseFloat(splitAmounts.upi) || 0) +
    (parseFloat(splitAmounts.card) || 0) +
    (parseFloat(splitAmounts.bankTransfer) || 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || !customerName || cart.length === 0) return;

    if (
      requireB2B &&
      (!companyName.trim() || !gstin.trim() || !companyAddress.trim())
    ) {
      alert(
        "Please fill all required B2B Invoice fields (Company Name, GST Number, Company Address).",
      );
      return;
    }

    if (paymentMethod === "SPLIT_PAYMENT") {
      if (Math.abs(currentSplitSum - totalAmount) > 0.01) {
        alert(
          `Split breakdown (₹${currentSplitSum}) must exactly equal the total payable amount (₹${totalAmount}). Difference: ₹${Math.abs(totalAmount - currentSplitSum)}`,
        );
        return;
      }
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/kiosk/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          paymentMethod,
          paymentSplit: paymentMethod === "SPLIT_PAYMENT" ? splitAmounts : null,
          items: cart,
          totalAmount,
          isB2B: requireB2B,
          b2bDetails: requireB2B
            ? {
                companyName,
                gstin,
                companyAddress,
                contactPerson: contactPerson || customerName,
                email,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderComplete(data.order);
        setCart([]);
      } else {
        alert(data.message || "Order failed");
      }
    } catch (err) {
      console.error("Order placement failed:", err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const resetKiosk = () => {
    setOrderComplete(null);
    setCheckoutOpen(false);
    setCustomerName("");
    setCustomerPhone("");
    setRequireB2B(false);
    setCompanyName("");
    setGstin("");
    setCompanyAddress("");
    setContactPerson("");
    setEmail("");
    setPaymentMethod("CASH");
    setSplitAmounts({ cash: "", upi: "", card: "", bankTransfer: "" });
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Cart Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Arduino, Raspberry Pi, Sensors, Robotics Kits..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-[#00AEEF]/20 cursor-pointer transition-all active:scale-95 text-xs sm:text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Basket ({totalCount})</span>
          <span className="bg-slate-950 text-white text-xs px-2 py-0.5 rounded-full font-mono font-bold">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </button>
      </div>

      {/* Categories Horizontal Scroll Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === "all"
              ? "bg-[#00AEEF] text-slate-950 shadow-sm font-black"
              : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          All Store Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-[#00AEEF] text-slate-950 shadow-sm font-black"
                : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Fetching Store Inventory...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
            <p className="text-sm font-bold text-slate-700">
              No products match your search in this store branch.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try searching by SKU, component name, or selecting a different
              category.
            </p>
          </div>
        ) : (
          products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-slate-200 hover:border-[#00AEEF] rounded-3xl p-4 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-lg group"
            >
              <div className="space-y-3">
                {/* Large Product Image Container with 360 View Interactive Button */}
                <div
                  onClick={() => open360Viewer(prod)}
                  className="w-full aspect-[4/3] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden relative flex items-center justify-center p-3 cursor-pointer group/img"
                  title="Click for 360° Interactive View"
                >
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <Sparkles className="w-10 h-10 text-slate-300" />
                  )}

                  {/* 360 View Floating Interactive Badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      open360Viewer(prod);
                    }}
                    className="absolute top-2.5 right-2.5 bg-white/95 hover:bg-[#00AEEF] text-slate-800 hover:text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black border border-slate-200 shadow-sm flex items-center gap-1 transition-all group-hover/img:scale-105"
                  >
                    <RotateCw className="w-3 h-3 text-[#00AEEF] group-hover/img:rotate-180 transition-transform duration-500" />
                    <span>360° View</span>
                  </button>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {prod.category}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1 leading-snug group-hover:text-[#00AEEF] transition-colors">
                    {prod.name}
                  </h3>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between">
                  <div className="text-base font-black text-slate-900 font-mono">
                    ₹{prod.price?.toLocaleString("en-IN")}
                  </div>
                  {prod.mrp && prod.mrp > prod.price && (
                    <div className="text-[11px] text-slate-400 line-through font-mono">
                      ₹{prod.mrp?.toLocaleString("en-IN")}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToCart(prod)}
                    className="bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-700 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all border border-slate-200 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>

                  <button
                    onClick={() => handleBuyNow(prod)}
                    className="bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 text-xs font-black py-2.5 rounded-xl flex items-center justify-center transition-all shadow-sm shadow-[#00AEEF]/20 cursor-pointer active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Drawer / Slide-Over */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border-l border-slate-200 p-6 flex flex-col justify-between h-full shadow-2xl animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#00AEEF]" />
                  <h2 className="text-base font-black text-slate-900">
                    Store Walk-in Basket
                  </h2>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto mt-2 pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Your kiosk basket is currently empty.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          ₹{item.price} × {item.quantity} ={" "}
                          <span className="text-slate-900 font-bold">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-slate-900 px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Summary */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">
                  Total Payable:
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#00AEEF]/20 cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {orderComplete ? (
              <div className="text-center space-y-5 py-4 max-h-[85vh] overflow-y-auto pr-1">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 animate-pulse">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Order Sent to Store Counter!
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Order Reference:{" "}
                    <span className="font-mono font-bold text-[#00AEEF]">
                      {orderComplete.orderNumber}
                    </span>
                  </p>
                </div>

                {/* Token / Counter Collection Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs font-mono text-left space-y-3">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Store Branch:</span>
                    <span className="font-bold text-slate-900">
                      {orderComplete.store || orderComplete.storeCode} Hub
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold text-slate-900">
                      {orderComplete.customerName}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="text-emerald-700 font-bold">
                      {orderComplete.paymentMethod}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-sm">
                    <span className="font-bold text-slate-700">
                      Total Payable:
                    </span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      ₹{orderComplete.totalAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Staff Instruction Note */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 text-center space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00AEEF]" /> Please
                    Proceed to the Billing Counter
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Our Store Manager will print or WhatsApp your official Tax
                    Invoice & hand over your items.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetKiosk}
                    className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black py-3.5 rounded-2xl text-xs cursor-pointer shadow-md shadow-[#00AEEF]/20"
                  >
                    Finish & Start Next Customer
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900">
                    Walk-in Customer Checkout
                  </h2>
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handlePlaceOrder}
                  className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* B2B Tax Invoice Radio Choice */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Do you require a B2B Invoice?
                    </label>
                    <div className="flex items-center gap-6 text-xs text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="b2bChoice"
                          checked={requireB2B === true}
                          onChange={() => setRequireB2B(true)}
                          className="text-[#00AEEF] focus:ring-[#00AEEF]"
                        />
                        <span className="font-bold text-slate-900">YES</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="b2bChoice"
                          checked={requireB2B === false}
                          onChange={() => setRequireB2B(false)}
                          className="text-[#00AEEF] focus:ring-[#00AEEF]"
                        />
                        <span>NO</span>
                      </label>
                    </div>
                  </div>

                  {/* Dynamic B2B Fields */}
                  {requireB2B && (
                    <div className="bg-blue-50/50 border border-blue-200 p-3.5 rounded-2xl space-y-3 animate-fade-in">
                      <div className="text-[11px] font-black uppercase tracking-wider text-[#00AEEF]">
                        B2B Tax Invoice Details
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Robotech Labs Pvt Ltd"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          GST Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={gstin}
                          onChange={(e) =>
                            setGstin(e.target.value.toUpperCase())
                          }
                          placeholder="22AAAAA0000A1Z5"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase font-mono placeholder-slate-400 focus:outline-none focus:border-[#00AEEF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Company Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Office / Factory address with pincode"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                            placeholder="Manager name"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Email (For GST PDF)
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="accounts@company.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00AEEF]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CASH")}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === "CASH"
                            ? "bg-[#E0F7FC] border-[#00AEEF] text-slate-950 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <Banknote className="w-5 h-5 text-emerald-600" />
                        <span>CASH</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("UPI")}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === "UPI"
                            ? "bg-[#E0F7FC] border-[#00AEEF] text-slate-950 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <QrCode className="w-5 h-5 text-blue-600" />
                        <span>UPI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CARD")}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === "CARD"
                            ? "bg-[#E0F7FC] border-[#00AEEF] text-slate-950 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <span>CARD</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("BANK_TRANSFER")}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === "BANK_TRANSFER"
                            ? "bg-[#E0F7FC] border-[#00AEEF] text-slate-950 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <Banknote className="w-5 h-5 text-indigo-600" />
                        <span>BANK TRANSFER</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("SPLIT_PAYMENT")}
                        className={`col-span-2 sm:col-span-1 p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === "SPLIT_PAYMENT"
                            ? "bg-amber-50 border-amber-400 text-amber-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <span>SPLIT PAYMENT</span>
                      </button>
                    </div>
                  </div>

                  {/* Split Payment Dynamic Breakdown Inputs */}
                  {paymentMethod === "SPLIT_PAYMENT" && (
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900 uppercase tracking-wider">
                          Split Payment Breakdown
                        </span>
                        <span className="font-mono text-slate-600">
                          Target:{" "}
                          <span className="text-slate-900 font-bold">
                            ₹{totalAmount.toLocaleString("en-IN")}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">
                            Cash Amount (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={splitAmounts.cash}
                            onChange={(e) =>
                              setSplitAmounts({
                                ...splitAmounts,
                                cash: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">
                            UPI Amount (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={splitAmounts.upi}
                            onChange={(e) =>
                              setSplitAmounts({
                                ...splitAmounts,
                                upi: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">
                            Card Amount (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={splitAmounts.card}
                            onChange={(e) =>
                              setSplitAmounts({
                                ...splitAmounts,
                                card: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">
                            Bank Transfer (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={splitAmounts.bankTransfer}
                            onChange={(e) =>
                              setSplitAmounts({
                                ...splitAmounts,
                                bankTransfer: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Split Status Indicator */}
                      <div className="pt-2 border-t border-amber-200/80 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-600">Allocated Sum:</span>
                        <span
                          className={
                            Math.abs(currentSplitSum - totalAmount) < 0.01
                              ? "text-emerald-600 font-bold"
                              : "text-amber-700 font-bold"
                          }
                        >
                          ₹{currentSplitSum} / ₹{totalAmount}
                          {Math.abs(currentSplitSum - totalAmount) >= 0.01 && (
                            <span className="text-[10px] ml-1 text-red-600">
                              (
                              {currentSplitSum > totalAmount
                                ? `+₹${currentSplitSum - totalAmount} over`
                                : `-₹${totalAmount - currentSplitSum} remaining`}
                              )
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-600">
                      Grand Total ({totalCount} items):
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      submittingOrder ||
                      (paymentMethod === "SPLIT_PAYMENT" &&
                        Math.abs(currentSplitSum - totalAmount) >= 0.01)
                    }
                    className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-[#00AEEF]/20"
                  >
                    {submittingOrder
                      ? "Generating Order..."
                      : `Confirm & Pay ₹${totalAmount}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 360° Interactive Product Inspection Viewer Modal */}
      {view360Product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#E0F7FC] text-[#00AEEF] rounded-xl">
                  <RotateCw
                    className="w-5 h-5 animate-spin"
                    style={{ animationDuration: "6s" }}
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 line-clamp-1">
                    {view360Product.name}
                  </h3>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Interactive 360° Inspection Stage •{" "}
                    {view360Product.category}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setView360Product(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 360 Turntable Stage with 3D Perspective */}
            <div
              className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing p-6"
              style={{ perspective: "1000px" }}
            >
              {/* Product 3D Rotating Model/Image */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `rotateY(${rotationAngle}deg) scale(1.15)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {view360Product.image ? (
                  <img
                    src={view360Product.image}
                    alt={view360Product.name}
                    className="max-h-[85%] max-w-[85%] object-contain drop-shadow-2xl pointer-events-none"
                  />
                ) : (
                  <Sparkles className="w-16 h-16 text-slate-300" />
                )}
              </div>

              {/* 360 Rotation Angle HUD Badge */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] animate-ping" />
                Angle: {rotationAngle}°
              </div>

              {/* Auto Spin Toggle HUD */}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer shadow-xs ${
                  autoRotate
                    ? "bg-[#00AEEF] text-slate-950 border-[#00AEEF]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {autoRotate ? "Auto-Spin: ON" : "Auto-Spin: OFF"}
              </button>
            </div>

            {/* Interactive Degree Slider & Step Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setAutoRotate(false);
                    setRotationAngle((prev) => (prev - 45 + 360) % 360);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-1"
                  title="Rotate -45°"
                >
                  <RotateCcw className="w-4 h-4" /> -45°
                </button>

                <input
                  type="range"
                  min="0"
                  max="359"
                  value={rotationAngle}
                  onChange={(e) => {
                    setAutoRotate(false);
                    setRotationAngle(Number(e.target.value));
                  }}
                  className="flex-1 accent-[#00AEEF] cursor-pointer"
                />

                <button
                  onClick={() => {
                    setAutoRotate(false);
                    setRotationAngle((prev) => (prev + 45) % 360);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-1"
                  title="Rotate +45°"
                >
                  +45° <RotateCw className="w-4 h-4" />
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400">
                Drag the slider or use 45° step buttons to inspect component
                pins, sockets, & PCB traces.
              </p>
            </div>

            {/* Price & Immediate Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  ₹{view360Product.price?.toLocaleString("en-IN")}
                </div>
                {view360Product.mrp &&
                  view360Product.mrp > view360Product.price && (
                    <div className="text-xs text-slate-400 line-through font-mono">
                      ₹{view360Product.mrp?.toLocaleString("en-IN")}
                    </div>
                  )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    addToCart(view360Product);
                    setView360Product(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer transition-all active:scale-95"
                >
                  + Add to Basket
                </button>

                <button
                  onClick={() => {
                    setView360Product(null);
                    handleBuyNow(view360Product);
                  }}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl shadow-md shadow-[#00AEEF]/20 cursor-pointer transition-all active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
