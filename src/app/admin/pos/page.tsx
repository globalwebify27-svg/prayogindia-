'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Wallet
} from 'lucide-react';
import { PRODUCTS, Product } from '@/data/mockData';
import { QuickViewModal } from '@/components/Modals';
import {
  WalkInSession, SessionStatus,
  getAllSessions, saveSession, generateInvoiceNo,
  POS_BROADCAST_CHANNEL, STORES,
  getStoreSessionsPending
} from '@/data/storeConfig';
import { 
  CustomerType, 
  CustomerTypeCode, 
  CUSTOMER_TYPE_RULES, 
  calculateCustomerPrice, 
  calculateEarnedRewards, 
  getCustomerTypeCode 
} from '@/data/customerTypes';

interface POSCartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export type StoreId = 'RANCHI' | 'PATNA' | 'DELHI';

// ─── Live Walk-in Session Card (for manager POS live orders tab) ─────────────
function LiveSessionCard({
  session,
  accentColor,
  onAccept,
  onMarkPaid,
  onCancel,
}: {
  session: WalkInSession;
  accentColor: string;
  onAccept: () => void;
  onMarkPaid: () => void;
  onCancel: () => void;
}) {
  const statusColors: Record<SessionStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-300',
    PROCESSING: 'bg-violet-100 text-violet-800 border-violet-300',
    PAID: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    CANCELLED: 'bg-red-100 text-red-600 border-red-200',
  };
  const statusLabel: Record<SessionStatus, string> = {
    PENDING: '🔔 New Order',
    ACCEPTED: '✅ Accepted',
    PROCESSING: '💳 Processing Payment',
    PAID: '✓ Paid & Complete',
    CANCELLED: '✕ Cancelled',
  };

  const elapsed = Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000);
  const elapsedLabel = elapsed < 60 ? `${elapsed}s ago` : `${Math.floor(elapsed / 60)}m ago`;

  return (
    <div className={`bg-white rounded-3xl border-2 shadow-sm p-5 space-y-4 transition-all ${
      session.status === 'PENDING' ? 'border-amber-400 shadow-amber-50' :
      session.status === 'ACCEPTED' || session.status === 'PROCESSING' ? 'border-blue-300 shadow-blue-50' :
      session.status === 'PAID' ? 'border-emerald-300 opacity-60' :
      'border-slate-200 opacity-40'
    }`}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusColors[session.status]}`}>
              {statusLabel[session.status]}
            </span>
            <span className="text-[10px] font-mono text-slate-400">{elapsedLabel}</span>
          </div>
          <div className="text-sm font-black text-slate-900">{session.customerName}</div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{session.customerPhone}</span>
            {session.customerEmail && <span className="hidden sm:flex items-center gap-1"><Mail className="w-3 h-3" />{session.customerEmail}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-black text-slate-900">₹{session.total.toLocaleString()}</div>
          <div className={`text-[10px] font-bold flex items-center gap-1 justify-end ${
            session.paymentMethod === 'CASH' ? 'text-emerald-700' : 'text-violet-700'
          }`}>
            {session.paymentMethod === 'CASH' ? <Banknote className="w-3 h-3" /> : <QrCodeIcon className="w-3 h-3" />}
            {session.paymentMethod === 'CASH' ? 'Cash' : 'UPI QR'}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Items ({session.items.length})</div>
        {session.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-contain p-0.5" />
              </div>
              <span className="text-slate-700 font-semibold truncate">{item.name}</span>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="font-black text-slate-900">{item.quantity}× ₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-700">
          <span>Subtotal + GST (18%)</span>
          <span>₹{session.subtotal.toLocaleString()} + ₹{session.gstAmount.toLocaleString()}</span>
        </div>
      </div>

      {session.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 font-medium">
          📝 Note: {session.notes}
        </div>
      )}

      {/* Action Buttons */}
      {session.status === 'PENDING' && (
        <div className="flex gap-2">
          <button onClick={onAccept}
            className="flex-1 py-2.5 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
            style={{ background: accentColor }}>
            <CheckCircle className="w-4 h-4" /> Accept Order
          </button>
          <button onClick={onCancel}
            className="px-4 py-2.5 rounded-xl font-extrabold text-xs text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 active:scale-95 transition-all">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      {(session.status === 'ACCEPTED' || session.status === 'PROCESSING') && (
        <div className="flex gap-2">
          <button onClick={onMarkPaid}
            className="flex-1 py-2.5 rounded-xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
            <Wallet className="w-4 h-4" /> Mark as Paid & Invoice
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl font-extrabold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function WalkInPOSPage() {
  // ── Active Tab ────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'live' | 'manual'>('live');

  // ── Live Sessions State ───────────────────────────
  const [liveSessions, setLiveSessions] = useState<WalkInSession[]>([]);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Active Store for Live Orders ──────────────────
  const [liveStoreFilter, setLiveStoreFilter] = useState<'ranchi' | 'patna' | 'delhi' | 'all'>('all');

  // Load live sessions from localStorage
  const refreshSessions = useCallback(() => {
    const all = getAllSessions();
    setLiveSessions(all);
  }, []);

  // Also poll server API for cross-device sessions
  const pollServerSessions = useCallback(async () => {
    const storeIds = liveStoreFilter === 'all' ? ['ranchi', 'patna', 'delhi'] : [liveStoreFilter];
    for (const sid of storeIds) {
      try {
        const res = await fetch(`/api/pos/sessions?storeId=${sid}`);
        if (!res.ok) continue;
        const { sessions } = await res.json();
        if (Array.isArray(sessions)) {
          sessions.forEach((s: WalkInSession) => saveSession(s));
        }
      } catch { /* network failure, ignore */ }
    }
    refreshSessions();
  }, [liveStoreFilter, refreshSessions]);

  useEffect(() => {
    refreshSessions();

    // BroadcastChannel for real-time same-browser sync
    if (typeof window !== 'undefined') {
      broadcastRef.current = new BroadcastChannel(POS_BROADCAST_CHANNEL);
      broadcastRef.current.onmessage = (event) => {
        if (event.data?.type === 'NEW_SESSION' || event.data?.type === 'SESSION_UPDATED') {
          const session: WalkInSession = event.data.session;
          saveSession(session);
          refreshSessions();
          if (event.data?.type === 'NEW_SESSION') {
            setNewOrderAlert(true);
            setActiveTab('live');
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
    const updated: WalkInSession = { ...session, status: 'ACCEPTED', updatedAt: new Date().toISOString() };
    saveSession(updated);
    broadcastRef.current?.postMessage({ type: 'SESSION_UPDATED', session: updated });
    fetch('/api/pos/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: session.storeId, sessionId: session.id, updates: { status: 'ACCEPTED' } }),
    }).catch(() => {});
    refreshSessions();
  };

  const handleMarkPaid = (session: WalkInSession) => {
    const invoiceNo = generateInvoiceNo(session.storeId);
    const updated: WalkInSession = {
      ...session, status: 'PAID', invoiceNo,
      updatedAt: new Date().toISOString(),
    };
    saveSession(updated);
    broadcastRef.current?.postMessage({ type: 'SESSION_UPDATED', session: updated });
    fetch('/api/pos/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: session.storeId, sessionId: session.id, updates: { status: 'PAID', invoiceNo } }),
    }).catch(() => {});
    refreshSessions();
  };

  const handleCancelSession = (session: WalkInSession) => {
    const updated: WalkInSession = { ...session, status: 'CANCELLED', updatedAt: new Date().toISOString() };
    saveSession(updated);
    broadcastRef.current?.postMessage({ type: 'SESSION_UPDATED', session: updated });
    refreshSessions();
  };

  const filteredSessions = liveSessions.filter((s) =>
    liveStoreFilter === 'all' || s.storeId === liveStoreFilter
  );
  const pendingCount = filteredSessions.filter((s) => s.status === 'PENDING').length;

  // 6.1 Authorized Tablet Security Mode State
  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<StoreId>('RANCHI');
  const [deviceId, setDeviceId] = useState<string>('TAB-RNC-01');
  const [authError, setAuthError] = useState<string | null>(null);
  const [activationKey, setActivationKey] = useState<string>('');
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);

  // Store Selection State
  const [selectedStore, setSelectedStore] = useState<'ranchi' | 'patna' | 'delhi'>('ranchi');

  // 6.2 Customer Information & 2.2 Customer Types State
  const [customerType, setCustomerType] = useState<CustomerType>('Walk-in Customer');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isB2B, setIsB2B] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [communityOptIn, setCommunityOptIn] = useState(true);

  // Search & Cart State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [posCart, setPosCart] = useState<POSCartItem[]>([
    { product: PRODUCTS[0], quantity: 1, unitPrice: calculateCustomerPrice(PRODUCTS[0].price, 'Walk-in Customer', 1).unitPrice },
    { product: PRODUCTS[2], quantity: 1, unitPrice: calculateCustomerPrice(PRODUCTS[2].price, 'Walk-in Customer', 1).unitPrice },
  ]);

  // Recalculate cart prices when customerType changes
  useEffect(() => {
    setPosCart(prev =>
      prev.map(item => {
        const { unitPrice } = calculateCustomerPrice(item.product.price, customerType, item.quantity);
        return { ...item, unitPrice };
      })
    );
    if (customerType === 'B2B Customer') {
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
    orderSource: 'WALK-IN';
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
    const savedToken = localStorage.getItem('prayog_pos_device_token');
    const savedStore = localStorage.getItem('prayog_pos_store_id') as StoreId;
    const savedDeviceId = localStorage.getItem('prayog_pos_device_id');

    if (savedToken && savedToken.startsWith('PRG_POS_AUTH_')) {
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
      'PRG-RANCHI-POS-2026': { storeId: 'RANCHI', deviceId: 'TAB-RNC-01' },
      'PRG-PATNA-POS-2026': { storeId: 'PATNA', deviceId: 'TAB-PAT-01' },
      'PRG-DELHI-POS-2026': { storeId: 'DELHI', deviceId: 'TAB-DL-01' },
      'PRAYOG-DEMO-POS': { storeId: 'RANCHI', deviceId: 'TAB-DEMO-99' },
    };

    const trimmed = activationKey.trim().toUpperCase();
    const config = validKeys[trimmed];

    if (config) {
      const generatedToken = `PRG_POS_AUTH_${config.storeId}_${Date.now()}`;
      localStorage.setItem('prayog_pos_device_token', generatedToken);
      localStorage.setItem('prayog_pos_store_id', config.storeId);
      localStorage.setItem('prayog_pos_device_id', config.deviceId);

      setDeviceToken(generatedToken);
      setActiveStoreId(config.storeId);
      setSelectedStore(config.storeId.toLowerCase() as any);
      setDeviceId(config.deviceId);
      setIsDeviceAuthorized(true);
    } else {
      setAuthError('Invalid Terminal Activation Key. Contact Ranchi Central HQ or use Demo Key: PRAYOG-DEMO-POS');
    }
  };

  // Revoke device authorization
  const handleDeauthorizeDevice = () => {
    if (confirm('De-authorize this physical store tablet? POS will be locked until re-authenticated.')) {
      localStorage.removeItem('prayog_pos_device_token');
      localStorage.removeItem('prayog_pos_store_id');
      localStorage.removeItem('prayog_pos_device_id');
      setIsDeviceAuthorized(false);
      setDeviceToken(null);
    }
  };

  // Calculations
  const subtotal = posCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
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

  const totalPaid = (Number(cashAmount) || 0) + (Number(upiAmount) || 0) + (Number(cardAmount) || 0);
  const remainingBalance = grandTotal - totalPaid;

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        const { unitPrice: newPrice } = calculateCustomerPrice(product.price, customerType, newQty);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty, unitPrice: newPrice } : item
        );
      }
      const { unitPrice: initialPrice } = calculateCustomerPrice(product.price, customerType, 1);
      return [...prev, { product, quantity: 1, unitPrice: initialPrice }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const { unitPrice: newPrice } = calculateCustomerPrice(item.product.price, customerType, newQty);
            return { ...item, quantity: newQty, unitPrice: newPrice };
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCompleteSale = () => {
    if (remainingBalance > 0) {
      alert(`Cannot complete checkout. Remaining balance unpaid: ₹${remainingBalance.toLocaleString()}`);
      return;
    }

    const storeNames: Record<StoreId, string> = {
      RANCHI: 'Ranchi Main Hub (Central Stock)',
      PATNA: 'Patna Physical Branch',
      DELHI: 'Delhi Physical Branch',
    };

    const currentStoreId = selectedStore.toUpperCase() as StoreId;
    const ruleCode = getCustomerTypeCode(customerType);
    const typeRule = CUSTOMER_TYPE_RULES[ruleCode];
    const { coinsEarned } = calculateEarnedRewards(grandTotal, customerType);

    setCompletedTransaction({
      invoiceNo: `POS-${currentStoreId}-${Date.now().toString().slice(-6)}`,
      orderSource: 'WALK-IN',
      storeId: currentStoreId,
      deviceId: deviceId,
      customerType,
      invoiceTypeLabel: typeRule.invoice.label,
      rewardsEarned: coinsEarned,
      total: grandTotal,
      cash: Number(cashAmount) || 0,
      upi: Number(upiAmount) || 0,
      card: Number(cardAmount) || 0,
      date: new Date().toLocaleString('en-IN'),
      store: storeNames[currentStoreId] || 'Ranchi Main Hub',
      customerName: customerName || `${customerType}`,
      customerPhone: customerPhone || '9876543210',
      customerEmail: customerEmail || 'customer@prayogindia.in',
      isB2B: isB2B || customerType === 'B2B Customer',
      companyName,
      gstin,
      companyAddress,
      communityOptIn,
      items: [...posCart],
    });
  };

  const handleSendEmailInvoice = () => {
    const email = customerEmail || prompt('Enter customer email to dispatch Tax Invoice PDF:', 'customer@gmail.com');
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
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setIsB2B(false);
    setCompanyName('');
    setGstin('');
    setCompanyAddress('');
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
              Walk-in POS billing is locked to authorized store terminals. Unauthenticated public devices cannot access checkout.
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthorizeDevice} className="space-y-4 text-left">
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
              <div className="font-bold text-slate-800 uppercase text-[10px]">Registered Store Keys:</div>
              <div>• Ranchi Hub: <code className="text-[#00AEEF] font-bold">PRG-RANCHI-POS-2026</code></div>
              <div>• Patna Branch: <code className="text-[#00AEEF] font-bold">PRG-PATNA-POS-2026</code></div>
              <div>• Delhi Branch: <code className="text-[#00AEEF] font-bold">PRG-DELHI-POS-2026</code></div>
              <div>• Quick Demo: <code className="text-[#00AEEF] font-bold">PRAYOG-DEMO-POS</code></div>
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
          <h1 className="text-2xl font-black text-white mt-1">Walk-in POS & Live Order Management</h1>
          <p className="text-xs text-slate-400">Real-time customer kiosk orders · Split payment billing · Tax invoice generation</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Kiosk Quick Links */}
          <div className="flex items-center gap-1.5">
            {(['ranchi', 'patna', 'delhi'] as const).map((sid) => (
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
                  localStorage.setItem('prayog_pos_store_id', store.toUpperCase());
                }}
                className="bg-transparent text-xs font-extrabold text-white focus:outline-none pr-3 py-1 cursor-pointer"
              >
                <option value="ranchi" className="bg-slate-900 text-white">Ranchi Main Branch (Central Stock)</option>
                <option value="patna" className="bg-slate-900 text-white">Patna Branch Store</option>
                <option value="delhi" className="bg-slate-900 text-white">Delhi Branch Store</option>
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
          <span className="font-extrabold text-sm">🛎️ New customer order received from the kiosk!</span>
          <button onClick={() => { setActiveTab('live'); setNewOrderAlert(false); }}
            className="ml-auto text-xs font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl">
            View Order →
          </button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            activeTab === 'live' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell className={`w-4 h-4 ${pendingCount > 0 && activeTab !== 'live' ? 'text-amber-500' : ''}`} />
          Live Orders
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            activeTab === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tablet className="w-4 h-4" />
          Manual POS Billing
        </button>
      </div>

      {/* LIVE ORDERS TAB */}
      {activeTab === 'live' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Filter by Store:</span>
              {([
                { value: 'all', label: 'All Stores' },
                { value: 'ranchi', label: 'Ranchi' },
                { value: 'patna', label: 'Patna' },
                { value: 'delhi', label: 'Delhi' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLiveStoreFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                    liveStoreFilter === opt.value
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={pollServerSessions}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500">No customer orders yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                When a customer submits an order from the kiosk, it will appear here instantly.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                {(['ranchi', 'patna', 'delhi'] as const).map((sid) => (
                  <a key={sid} href={`/walk-in/${sid}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-extrabold text-[#00AEEF] bg-[#E0F7FC] px-3 py-2 rounded-xl hover:bg-[#00AEEF] hover:text-white transition-colors">
                    <Store className="w-3.5 h-3.5" />
                    Open {sid.charAt(0).toUpperCase() + sid.slice(1)} Kiosk
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSessions.map((session) => (
                <LiveSessionCard
                  key={session.id}
                  session={session}
                  accentColor="#00AEEF"
                  onAccept={() => handleAcceptSession(session)}
                  onMarkPaid={() => handleMarkPaid(session)}
                  onCancel={() => handleCancelSession(session)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MANUAL POS BILLING TAB */}
      {activeTab === 'manual' && (
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
            <h2 className="text-2xl font-black text-slate-900 mt-2">Walk-in Order Completed</h2>
            <p className="text-xs text-slate-500 font-medium">Store: {completedTransaction.store} • Terminal: {completedTransaction.deviceId}</p>
          </div>

          {emailSentAlert && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 text-left animate-in fade-in">
              <Check className="w-4 h-4 text-blue-600" />
              <span>Tax Invoice PDF emailed successfully to <strong>{completedTransaction.customerEmail}</strong></span>
            </div>
          )}

          {/* Thermal Receipt Print Area */}
          <div id="thermal-receipt-area" className="bg-slate-50 border border-slate-300 rounded-2xl p-5 text-left space-y-3 text-xs font-mono shadow-inner">
            
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <h3 className="font-black text-sm text-slate-900 uppercase">PRAYOG INDIA TECH LABS</h3>
              <p className="text-[10px] text-slate-500">{completedTransaction.store}</p>
              <p className="text-[10px] text-slate-500">GSTIN: 20AAGCP8845K1Z2 • TEL: +91 98765 43210</p>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px]">
              <span className="text-slate-500">Tax Invoice No:</span>
              <span className="font-bold text-slate-900">{completedTransaction.invoiceNo}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px]">
              <span className="text-slate-500">Order Source:</span>
              <span className="font-black text-emerald-700">{completedTransaction.orderSource} ({completedTransaction.storeId})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5 text-[11px]">
              <span className="text-slate-500">Date & Time:</span>
              <span className="text-slate-700">{completedTransaction.date}</span>
            </div>

            {/* Customer & B2B Details */}
            <div className="border-b border-slate-200 pb-2 space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="text-slate-800 font-bold">{completedTransaction.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Type:</span>
                <span className="font-extrabold text-[#00AEEF]">{completedTransaction.customerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Classification:</span>
                <span className="font-bold text-purple-700">{completedTransaction.invoiceTypeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="text-slate-700">{completedTransaction.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loyalty Rewards:</span>
                <span className="font-extrabold text-emerald-700">+{completedTransaction.rewardsEarned} Prayog Coins Earned</span>
              </div>
              {completedTransaction.isB2B && (
                <div className="pt-1 text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 space-y-0.5">
                  <div className="font-bold text-slate-900 uppercase">{completedTransaction.companyName}</div>
                  <div>GSTIN: <span className="font-bold">{completedTransaction.gstin}</span></div>
                  {completedTransaction.companyAddress && <div>Address: {completedTransaction.companyAddress}</div>}
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
                <div key={idx} className="flex justify-between text-slate-800 font-semibold text-[11px]">
                  <span className="truncate max-w-[210px]">{it.product.name}</span>
                  <span>{it.quantity} x ₹{it.unitPrice} = ₹{(it.quantity * it.unitPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Section 6.2 Split Payment Structured Breakdown */}
            <div className="pt-1 space-y-1 text-slate-700 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal (Net):</span>
                <span>₹{(completedTransaction.total / 1.18).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% Tax Included):</span>
                <span>₹{(completedTransaction.total - completedTransaction.total / 1.18).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-300">
                <span>Total Order Amount:</span>
                <span>₹{completedTransaction.total.toLocaleString()}</span>
              </div>

              {/* Multi-Mode Tree Breakdown */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 mt-2 space-y-1 text-slate-800 font-mono text-[11px]">
                <div className="font-bold text-slate-900">Payment Breakdown:</div>
                <div className="pl-1 text-slate-700">
                  <div>├── Cash Payment:   <strong className="text-emerald-700 font-bold">₹{completedTransaction.cash.toLocaleString()}</strong></div>
                  <div>├── UPI Payment:    <strong className="text-[#00AEEF] font-bold">₹{completedTransaction.upi.toLocaleString()}</strong></div>
                  <div>└── Card Payment:   <strong className="text-purple-700 font-bold">₹{completedTransaction.card.toLocaleString()}</strong></div>
                </div>
              </div>

              {completedTransaction.communityOptIn && (
                <div className="pt-2 text-[10px] text-center text-slate-500 italic">
                  ✓ Opted in for Prayog India Workshops, Internships & Drone Training Updates
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
              href={`https://wa.me/${completedTransaction.customerPhone ? `91${completedTransaction.customerPhone}` : '919876543210'}?text=${encodeURIComponent(`Hi ${completedTransaction.customerName}, thank you for purchasing hardware at Prayog India (${completedTransaction.store})!\n\nYour Tax Invoice: ${completedTransaction.invoiceNo}\nTotal Amount Paid: ₹${completedTransaction.total}\nPayment Breakdown: Cash: ₹${completedTransaction.cash}, UPI: ₹${completedTransaction.upi}, Card: ₹${completedTransaction.card}\n\nDownload PDF: https://prayogindia.in/invoices/${completedTransaction.invoiceNo}`)}`}
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
                {['All', 'Arduino & Microcontrollers', 'Drones & UAV Parts', 'IoT & Wireless Modules', 'Single Board Computers & Dev Boards', 'Robotics & DIY Kits', 'Sensors & Electronic Modules'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#00AEEF] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Quick-Click Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3 hover:border-[#00AEEF] hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div className="cursor-pointer" onClick={() => handleAddToCart(product)}>
                    <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-50 mb-2">
                      <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
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
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{product.sku}</span>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {product.inStock ? 'In Store' : 'Out of Stock'}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-[#00AEEF]">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setSelectedQuickViewProduct(product)}
                        title="Specs"
                        className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 hover:bg-[#00AEEF]/20 hover:text-[#00AEEF] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        title="Add to Bill"
                        className="w-6 h-6 rounded-lg bg-[#00AEEF]/10 text-[#00AEEF] group-hover:bg-[#00AEEF] group-hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Customer Info, POS Cart & Split Payment Engine (Span 5) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 6.2 Customer Details & 2.2 Customer Types Form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#00AEEF]" /> 1. Customer &amp; Tax Profile
                </h2>
                <span className="text-[10px] font-bold text-slate-400">Section 2.2</span>
              </div>

              {/* 2.2 Customer Type Selection Pills */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 block">
                  Select Customer Type:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                  {(['Walk-in Customer', 'B2B Customer', 'Registered Customer', 'B2C Customer', 'Guest Customer'] as CustomerType[]).map((t) => {
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
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t.replace(' Customer', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Pricing & Rewards Banner */}
              <div className="p-2.5 rounded-2xl bg-[#00AEEF]/5 border border-[#00AEEF]/20 flex items-center justify-between text-[10px]">
                <span className="font-bold text-[#00AEEF] flex items-center gap-1">
                  <BadgePercent className="w-3.5 h-3.5" />
                  {CUSTOMER_TYPE_RULES[getCustomerTypeCode(customerType)].pricing.ruleName}
                </span>
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  +{calculateEarnedRewards(grandTotal, customerType).coinsEarned} Coins
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
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
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
                  <ShoppingBag className="w-4 h-4 text-[#00AEEF]" /> 2. POS Cart ({posCart.length} items)
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
                    <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1 truncate">
                        <h4 className="font-extrabold text-slate-900 truncate">{item.product.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">₹{item.unitPrice} each</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-slate-800 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
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
                  <span className="text-[#00AEEF]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 6.2 Split Payment Engine with Tree Visualizer */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" /> 3. Split Payment Breakdown
                </h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  remainingBalance === 0 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : remainingBalance > 0 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {remainingBalance === 0 ? '✓ Balanced' : remainingBalance > 0 ? `Unpaid: ₹${remainingBalance}` : `Change: ₹${Math.abs(remainingBalance)}`}
                </span>
              </div>

              {/* 3 Split Inputs: Cash, UPI, Card */}
              <div className="grid grid-cols-3 gap-2">
                {/* Cash */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-emerald-600" /> Cash</span>
                    <button
                      onClick={() => setCashAmount(remainingBalance > 0 ? cashAmount + remainingBalance : grandTotal)}
                      className="text-[9px] text-[#00AEEF] hover:underline cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={cashAmount || ''}
                    placeholder="₹0"
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>

                {/* UPI */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1"><QrCode className="w-3 h-3 text-[#00AEEF]" /> UPI QR</span>
                    <button
                      onClick={() => setUpiAmount(remainingBalance > 0 ? upiAmount + remainingBalance : grandTotal)}
                      className="text-[9px] text-[#00AEEF] hover:underline cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={upiAmount || ''}
                    placeholder="₹0"
                    onChange={(e) => setUpiAmount(Number(e.target.value))}
                    className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>

                {/* Card */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-purple-600" /> Card</span>
                    <button
                      onClick={() => setCardAmount(remainingBalance > 0 ? cardAmount + remainingBalance : grandTotal)}
                      className="text-[9px] text-[#00AEEF] hover:underline cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={cardAmount || ''}
                    placeholder="₹0"
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Tree Split Visualizer Matching Section 6.2 */}
              <div className="bg-slate-900 text-slate-200 p-3 rounded-2xl font-mono text-[11px] space-y-0.5">
                <div className="text-white font-bold">Total Order Amount: ₹{grandTotal.toLocaleString()}</div>
                <div className="text-slate-400 pl-1">
                  <div>├── Cash Payment:   <span className="text-emerald-400 font-bold">₹{(Number(cashAmount) || 0).toLocaleString()}</span></div>
                  <div>├── UPI Payment:    <span className="text-[#00AEEF] font-bold">₹{(Number(upiAmount) || 0).toLocaleString()}</span></div>
                  <div>└── Card Payment:   <span className="text-purple-300 font-bold">₹{(Number(cardAmount) || 0).toLocaleString()}</span></div>
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

      {/* Quick Spec View Modal for in-store tablet browsing */}
      <QuickViewModal
        product={selectedQuickViewProduct}
        onClose={() => setSelectedQuickViewProduct(null)}
        onAddToCart={(prod) => {
          handleAddToCart(prod);
        }}
      />
    </div>
  );
}
