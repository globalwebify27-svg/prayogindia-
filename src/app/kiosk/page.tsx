'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  ArrowRight
} from 'lucide-react';

export default function KioskCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState<{ store: string; storeName: string }>({ store: '', storeName: '' });
  const [loading, setLoading] = useState(true);

  // Checkout modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'CARD' | 'CASH'>('UPI_QR');
  const [orderComplete, setOrderComplete] = useState<any | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kiosk/products?category=${activeCategory}&q=${search}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
        setStoreInfo({ store: data.store, storeName: data.storeName });
        
        // Extract distinct categories
        const cats = Array.from(new Set((data.data || []).map((p: any) => p.category))) as string[];
        setCategories(cats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, search]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalAmount = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const totalCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || cart.length === 0) return;

    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/kiosk/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          paymentMethod,
          items: cart,
          totalAmount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderComplete(data.order);
        setCart([]);
      }
    } catch (err) {
      console.error('Order placement failed:', err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const resetKiosk = () => {
    setOrderComplete(null);
    setCheckoutOpen(false);
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Touch to search hardware, sensors, robotics..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] shadow-lg"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-4" />
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="w-full md:w-auto bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#00AEEF]/20 cursor-pointer transition-all active:scale-95"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Kiosk Basket ({totalCount})</span>
          <span className="bg-slate-950 text-white text-xs px-2 py-0.5 rounded-full font-mono">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </button>
      </div>

      {/* Categories horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-white text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          All Store Products
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#00AEEF] text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold">Fetching {storeInfo.store} Store Inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
            No products match search criteria in this store branch.
          </div>
        ) : (
          products.map(prod => (
            <div
              key={prod.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
            >
              <div className="space-y-3">
                <div className="aspect-square bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center p-4">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Sparkles className="w-10 h-10 text-slate-700" />
                  )}
                  <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-[#00AEEF] text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-800 font-mono">
                    {storeInfo.store}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {prod.category}
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                    {prod.name}
                  </h3>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-white font-mono">
                    ₹{prod.price?.toLocaleString('en-IN')}
                  </div>
                  {prod.mrp && (
                    <div className="text-[10px] text-slate-500 line-through font-mono">
                      ₹{prod.mrp?.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#00AEEF]/20 cursor-pointer active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Drawer / Slide-Over */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between h-full shadow-2xl animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#00AEEF]" />
                  <h2 className="text-base font-black text-white">Store Walk-in Basket</h2>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="divide-y divide-slate-800 max-h-[60vh] overflow-y-auto mt-2 pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Your kiosk basket is currently empty.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ₹{item.price} × {item.quantity} = <span className="text-white font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-white px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
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
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Payable:</span>
                <span className="text-xl font-black text-white font-mono">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/20 cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {orderComplete ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-white">Order Confirmed!</h2>
                <p className="text-xs text-slate-300">
                  Walk-in receipt <span className="font-mono font-bold text-white">{orderComplete.orderNumber}</span> generated for {orderComplete.storeCode} store pickup.
                </p>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-left space-y-1">
                  <div className="text-slate-400">Total Amount: <span className="text-white font-bold">₹{orderComplete.totalAmount}</span></div>
                  <div className="text-slate-400">Payment: <span className="text-emerald-400 font-bold">{orderComplete.paymentMethod} (SUCCESS)</span></div>
                  <div className="text-slate-400">Terminal: <span className="text-[#00AEEF]">@{orderComplete.kioskUser}</span></div>
                </div>

                <button
                  onClick={resetKiosk}
                  className="w-full bg-[#00AEEF] text-slate-950 font-black py-3.5 rounded-2xl text-xs cursor-pointer shadow-lg shadow-[#00AEEF]/20"
                >
                  Start New Customer Session
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-white">Walk-in Customer Checkout</h2>
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Customer Name (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mobile Number (For Receipt SMS) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI_QR')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'UPI_QR'
                            ? 'bg-blue-950/80 border-[#00AEEF] text-[#00AEEF]'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <QrCode className="w-5 h-5" />
                        <span>UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'CARD'
                            ? 'bg-blue-950/80 border-[#00AEEF] text-[#00AEEF]'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>Card / POS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'CASH'
                            ? 'bg-blue-950/80 border-[#00AEEF] text-[#00AEEF]'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Banknote className="w-5 h-5" />
                        <span>Cash Desk</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Grand Total ({totalCount} items):</span>
                    <span className="text-sm font-bold text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#00AEEF]/20"
                  >
                    {submittingOrder ? 'Generating Bill...' : `Confirm & Pay ₹${totalAmount}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
