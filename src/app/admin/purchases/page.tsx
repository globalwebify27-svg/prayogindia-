"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Plus,
  Search,
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
  Package,
  BarChart3,
  History,
  X,
  Boxes,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  Eye,
  Phone,
  Mail,
  User,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  Clock,
  Filter,
  Save,
  PackageCheck,
  Receipt,
  BadgeDollarSign,
  Pencil,
  Trash2,
  Download,
  ChevronDown,
  ArrowLeft,
  Plus as PlusIcon,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  status: string;
  totalPurchases: number;
  outstandingAmount: number;
  _count?: { purchaseOrders: number };
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  product?: any;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  storeId: string;
  supplierId: string;
  status: string;
  orderDate: string;
  expectedDelivery?: string;
  invoiceNumber?: string;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: string;
  store?: { id: string; code: string; name: string };
  supplier?: { id: string; name: string; phone: string };
  items?: PurchaseOrderItem[];
  receipts?: any[];
  payments?: any[];
  _count?: { receipts: number; payments: number };
}

// ─────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────
const PO_STATUS: Record<string, { label: string; color: string; dot: string }> =
  {
    DRAFT: {
      label: "Draft",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
    PENDING: {
      label: "Pending",
      color: "bg-amber-100 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    ORDERED: {
      label: "Ordered",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      dot: "bg-blue-500",
    },
    PARTIALLY_RECEIVED: {
      label: "Partial",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      dot: "bg-purple-500",
    },
    RECEIVED: {
      label: "Received",
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-400",
    },
  };

const PAY_STATUS: Record<string, { label: string; color: string }> = {
  UNPAID: { label: "Unpaid", color: "bg-red-50 text-red-700 border-red-200" },
  PARTIALLY_PAID: {
    label: "Partial",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Paid",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const PAYMENT_METHODS = [
  "BANK_TRANSFER",
  "NEFT",
  "RTGS",
  "UPI",
  "CHEQUE",
  "CASH",
];

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<
    "orders" | "suppliers" | "receive" | "payments"
  >("orders");

  // ── Orders state ──
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);

  // ── Suppliers state ──
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // ── Products (for PO creation) ──
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  // ── Create PO form state ──
  const [poStoreId, setPoStoreId] = useState("");
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poExpectedDelivery, setPoExpectedDelivery] = useState("");
  const [poInvoice, setPoInvoice] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [poItems, setPoItems] = useState<
    Array<{
      productId: string;
      qty: number;
      unitPrice: number;
      taxRate: number;
      discountAmount: number;
    }>
  >([{ productId: "", qty: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 }]);
  const [poSubmitting, setPoSubmitting] = useState(false);
  const [poError, setPoError] = useState("");

  // ── Receive stock state ──
  const [receiveItems, setReceiveItems] = useState<Record<string, number>>({});
  const [receiveNotes, setReceiveNotes] = useState("");
  const [receiving, setReceiving] = useState(false);
  const [receiveMsg, setReceiveMsg] = useState("");

  // ── Payment state ──
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("BANK_TRANSFER");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payMsg, setPayMsg] = useState("");

  // ── Supplier form state ──
  const [sName, setSName] = useState("");
  const [sContact, setSContact] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sAddress, setSAddress] = useState("");
  const [sCity, setSCity] = useState("");
  const [sState, setSState] = useState("");
  const [sGstin, setSGstin] = useState("");
  const [sBankName, setSBankName] = useState("");
  const [sBankAccount, setSBankAccount] = useState("");
  const [sBankIfsc, setSBankIfsc] = useState("");
  const [sNotes, setSNotes] = useState("");
  const [sSubmitting, setSSubmitting] = useState(false);
  const [sError, setSError] = useState("");

  // ─── Fetch helpers ───
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderStatusFilter !== "all") params.set("status", orderStatusFilter);
      if (orderSearch) params.set("search", orderSearch);
      const res = await fetch(`/api/admin/purchases?${params}`);
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderStatusFilter, orderSearch]);

  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try {
      const params = new URLSearchParams();
      if (supplierSearch) params.set("search", supplierSearch);
      const res = await fetch(`/api/admin/suppliers?${params}`);
      const data = await res.json();
      if (data.success) setSuppliers(data.data || []);
    } catch {
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  }, [supplierSearch]);

  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stores");
      const data = await res.json();
      if (data.success) setStores(data.data || []);
    } catch {}
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=200");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch {}
  }, []);

  const fetchOrderDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/purchases/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setShowOrderDetail(true);
        // Pre-fill receive items with max receivable
        const initial: Record<string, number> = {};
        data.data.items?.forEach((item: PurchaseOrderItem) => {
          initial[item.id] = item.pendingQty;
        });
        setReceiveItems(initial);
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    if (activeTab === "suppliers") fetchSuppliers();
  }, [activeTab, fetchSuppliers]);
  useEffect(() => {
    fetchStores();
    fetchProducts();
    fetchSuppliers();
  }, []);

  // ─── Computed metrics ───
  const totalOrdersValue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(
    (o) => !["RECEIVED", "CANCELLED"].includes(o.status),
  ).length;
  const totalOutstanding = orders.reduce((s, o) => s + o.amountDue, 0);
  const receivedThisMonth = orders.filter((o) => {
    if (o.status !== "RECEIVED") return false;
    return new Date(o.orderDate).getMonth() === new Date().getMonth();
  }).length;

  // ─── Create PO ───
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoError("");
    setPoSubmitting(true);
    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: poStoreId,
          supplierId: poSupplierId,
          expectedDelivery: poExpectedDelivery || undefined,
          invoiceNumber: poInvoice || undefined,
          notes: poNotes || undefined,
          items: poItems
            .filter((i) => i.productId && i.qty > 0 && i.unitPrice > 0)
            .map((i) => ({
              productId: i.productId,
              qty: i.qty,
              unitPrice: i.unitPrice,
              taxRate: i.taxRate,
              discountAmount: i.discountAmount,
            })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreatePO(false);
        resetPoForm();
        await fetchOrders();
      } else {
        setPoError(data.message || "Failed to create purchase order");
      }
    } catch {
      setPoError("Network error");
    } finally {
      setPoSubmitting(false);
    }
  };

  const resetPoForm = () => {
    setPoStoreId("");
    setPoSupplierId("");
    setPoExpectedDelivery("");
    setPoInvoice("");
    setPoNotes("");
    setPoItems([
      { productId: "", qty: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
    ]);
    setPoError("");
  };

  // ─── Update PO status ───
  const updatePoStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/purchases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        if (selectedOrder?.id === id) await fetchOrderDetail(id);
      }
    } catch {}
  };

  // ─── Receive stock ───
  const handleReceive = async () => {
    if (!selectedOrder) return;
    setReceiving(true);
    setReceiveMsg("");
    try {
      const items = Object.entries(receiveItems)
        .filter(([, qty]) => qty > 0)
        .map(([purchaseOrderItemId, receivedQty]) => ({
          purchaseOrderItemId,
          receivedQty,
        }));

      if (!items.length) {
        setReceiveMsg("Enter quantities to receive");
        setReceiving(false);
        return;
      }

      const res = await fetch(
        `/api/admin/purchases/${selectedOrder.id}/receive`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, notes: receiveNotes }),
        },
      );
      const data = await res.json();
      setReceiveMsg(
        data.message || (data.success ? "Stock received!" : "Failed"),
      );
      if (data.success) {
        await fetchOrders();
        await fetchOrderDetail(selectedOrder.id);
      }
    } catch {
      setReceiveMsg("Network error");
    } finally {
      setReceiving(false);
    }
  };

  // ─── Record payment ───
  const handlePayment = async () => {
    if (!selectedOrder) return;
    setPaySubmitting(true);
    setPayMsg("");
    try {
      const res = await fetch(
        `/api/admin/purchases/${selectedOrder.id}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(payAmount),
            paymentMethod: payMethod,
            referenceNumber: payRef,
            notes: payNotes,
          }),
        },
      );
      const data = await res.json();
      setPayMsg(
        data.message || (data.success ? "Payment recorded!" : "Failed"),
      );
      if (data.success) {
        setPayAmount("");
        setPayRef("");
        setPayNotes("");
        await fetchOrders();
        await fetchOrderDetail(selectedOrder.id);
      }
    } catch {
      setPayMsg("Network error");
    } finally {
      setPaySubmitting(false);
    }
  };

  // ─── Supplier CRUD ───
  const openNewSupplier = () => {
    setEditingSupplier(null);
    setSName("");
    setSContact("");
    setSPhone("");
    setSEmail("");
    setSAddress("");
    setSCity("");
    setSState("");
    setSGstin("");
    setSBankName("");
    setSBankAccount("");
    setSBankIfsc("");
    setSNotes("");
    setSError("");
    setShowSupplierModal(true);
  };

  const openEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSName(s.name);
    setSContact(s.contactPerson || "");
    setSPhone(s.phone);
    setSEmail(s.email || "");
    setSAddress(s.address || "");
    setSCity(s.city || "");
    setSState(s.state || "");
    setSGstin(s.gstin || "");
    setSBankName("");
    setSBankAccount("");
    setSBankIfsc("");
    setSNotes("");
    setSError("");
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSError("");
    setSSubmitting(true);
    try {
      const payload = {
        id: editingSupplier?.id,
        name: sName,
        contactPerson: sContact,
        phone: sPhone,
        email: sEmail,
        address: sAddress,
        city: sCity,
        state: sState,
        gstin: sGstin,
        bankName: sBankName,
        bankAccount: sBankAccount,
        bankIfsc: sBankIfsc,
        notes: sNotes,
      };
      const res = await fetch("/api/admin/suppliers", {
        method: editingSupplier ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowSupplierModal(false);
        await fetchSuppliers();
      } else {
        setSError(data.message || "Failed");
      }
    } catch {
      setSError("Network error");
    } finally {
      setSSubmitting(false);
    }
  };

  const handleDeactivateSupplier = async (id: string) => {
    if (!confirm("Deactivate this supplier?")) return;
    try {
      await fetch("/api/admin/suppliers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchSuppliers();
    } catch {}
  };

  // ─── PO line items helpers ───
  const addPoItem = () =>
    setPoItems((prev) => [
      ...prev,
      { productId: "", qty: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
    ]);
  const removePoItem = (i: number) =>
    setPoItems((prev) => prev.filter((_, idx) => idx !== i));
  const updatePoItem = (i: number, field: string, value: any) =>
    setPoItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );

  const poLineTotal = (item: (typeof poItems)[0]) => {
    const base = item.qty * item.unitPrice;
    const tax = base * (item.taxRate / 100);
    return base + tax - item.discountAmount;
  };

  const poGrandTotal = poItems.reduce((s, i) => s + poLineTotal(i), 0);

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-0.5 rounded-full border border-[#00AEEF]/20 inline-block mb-2">
            Procurement Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Purchases & Procurement
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage suppliers, create purchase orders, receive stock, and track
            payments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreatePO(true)}
            className="flex items-center gap-1.5 bg-[#0B132B] hover:bg-[#1a2544] text-white px-4 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-[#00AEEF]" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total PO Value",
            value: `₹${(totalOrdersValue / 1000).toFixed(1)}K`,
            sub: `${orders.length} purchase orders`,
            color: "bg-slate-50 border-slate-200",
            valColor: "text-slate-900",
          },
          {
            label: "Active Orders",
            value: pendingOrdersCount,
            sub: "Pending receipt",
            color: "bg-blue-50 border-blue-200",
            valColor: "text-blue-800",
          },
          {
            label: "Outstanding",
            value: `₹${(totalOutstanding / 1000).toFixed(1)}K`,
            sub: "Supplier dues",
            color: "bg-amber-50 border-amber-200",
            valColor: "text-amber-800",
          },
          {
            label: "Received This Month",
            value: receivedThisMonth,
            sub: "Completed POs",
            color: "bg-emerald-50 border-emerald-200",
            valColor: "text-emerald-800",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 ${card.color}`}
          >
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
              {card.label}
            </span>
            <span className={`text-2xl font-black mt-1 block ${card.valColor}`}>
              {card.value}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {card.sub}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
        {(
          [
            { key: "orders", label: "Purchase Orders", icon: FileText },
            { key: "receive", label: "Receive Stock", icon: PackageCheck },
            { key: "suppliers", label: "Suppliers", icon: Building2 },
            { key: "payments", label: "Payments", icon: CreditCard },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === key
                ? "bg-white text-[#0B132B] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1: PURCHASE ORDERS
      ══════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search PO#, supplier..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#00AEEF] w-60"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "all",
                "DRAFT",
                "PENDING",
                "ORDERED",
                "PARTIALLY_RECEIVED",
                "RECEIVED",
                "CANCELLED",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                    orderStatusFilter === s
                      ? "bg-[#0B132B] text-white border-[#0B132B]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s === "all" ? "All" : PO_STATUS[s]?.label || s}
                </button>
              ))}
            </div>
            <button
              onClick={fetchOrders}
              className="ml-auto px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">PO # / Store</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Items</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {ordersLoading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin text-[#00AEEF]" />
                          <span className="text-xs">
                            Loading purchase orders...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <FileText className="w-8 h-8 opacity-30" />
                          <p className="font-bold text-xs">
                            No purchase orders found
                          </p>
                          <button
                            onClick={() => setShowCreatePO(true)}
                            className="text-[#00AEEF] font-bold text-xs hover:underline cursor-pointer"
                          >
                            + Create your first PO
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const st = PO_STATUS[order.status] || PO_STATUS.DRAFT;
                      const py =
                        PAY_STATUS[order.paymentStatus] || PAY_STATUS.UNPAID;
                      const totalItems = order.items?.length || 0;
                      const totalQty =
                        order.items?.reduce((s, i) => s + i.orderedQty, 0) || 0;
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="p-4">
                            <span className="font-mono font-black text-slate-900 block">
                              {order.poNumber}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {order.store?.name || order.storeId}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">
                              {order.supplier?.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {order.supplier?.phone}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-700">
                              {totalItems} SKUs
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {totalQty} units
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-black text-slate-900">
                            ₹{order.totalAmount.toLocaleString()}
                            {order.amountDue > 0 && (
                              <span className="text-[10px] text-red-600 block">
                                ₹{order.amountDue.toLocaleString()} due
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${st.color}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                              />
                              {st.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${py.color}`}
                            >
                              {py.label}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Date(order.orderDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => fetchOrderDetail(order.id)}
                              className="px-3 py-1.5 bg-[#0B132B] hover:bg-[#00AEEF] text-white rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2: RECEIVE STOCK
      ══════════════════════════════════════════════ */}
      {activeTab === "receive" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-900">
                Select a Purchase Order to receive stock
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Click "View" on any active PO from the Purchase Orders tab, then
                switch here to process received items.
              </p>
            </div>
          </div>

          {/* Active POs that can receive */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                Active Orders Awaiting Stock
              </h3>
              <p className="text-xs text-slate-500">
                Orders that are ordered or partially received
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">PO #</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Store</th>
                    <th className="p-4">Items Pending</th>
                    <th className="p-4">Expected Delivery</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.filter((o) =>
                    ["ORDERED", "PARTIALLY_RECEIVED", "PENDING"].includes(
                      o.status,
                    ),
                  ).length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-xs text-slate-400 font-bold"
                      >
                        No orders awaiting stock receipt
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter((o) =>
                        ["ORDERED", "PARTIALLY_RECEIVED", "PENDING"].includes(
                          o.status,
                        ),
                      )
                      .map((order) => {
                        const pendingItems =
                          order.items?.filter((i) => i.pendingQty > 0) || [];
                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-slate-50/80 font-medium text-slate-700"
                          >
                            <td className="p-4 font-mono font-black text-slate-900">
                              {order.poNumber}
                            </td>
                            <td className="p-4 font-bold">
                              {order.supplier?.name}
                            </td>
                            <td className="p-4">{order.store?.code}</td>
                            <td className="p-4">
                              <span className="font-bold text-purple-700">
                                {pendingItems.length} SKUs
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {pendingItems.reduce(
                                  (s, i) => s + i.pendingQty,
                                  0,
                                )}{" "}
                                units pending
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">
                              {order.expectedDelivery
                                ? new Date(
                                    order.expectedDelivery,
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                  })
                                : "—"}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={async () => {
                                  await fetchOrderDetail(order.id);
                                  setActiveTab("receive");
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                Receive
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3: SUPPLIERS
      ══════════════════════════════════════════════ */}
      {activeTab === "suppliers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Search suppliers..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#00AEEF] w-60"
              />
            </div>
            <button
              onClick={openNewSupplier}
              className="flex items-center gap-1.5 bg-[#0B132B] hover:bg-[#1a2544] text-white px-4 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#00AEEF]" />
              Add Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {suppliersLoading ? (
              <div className="col-span-3 py-16 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-[#00AEEF] mx-auto mb-2" />
                <p className="text-xs">Loading suppliers...</p>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-slate-400">
                <Building2 className="w-8 h-8 opacity-30 mx-auto mb-3" />
                <p className="text-xs font-bold">No suppliers added yet</p>
                <button
                  onClick={openNewSupplier}
                  className="text-[#00AEEF] text-xs font-bold hover:underline mt-1 cursor-pointer"
                >
                  + Add your first supplier
                </button>
              </div>
            ) : (
              suppliers.map((sup) => (
                <div
                  key={sup.id}
                  className={`bg-white rounded-3xl border p-5 shadow-2xs space-y-3 ${sup.status === "Inactive" ? "opacity-60" : "border-slate-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-black text-slate-900 text-sm">
                        {sup.name}
                      </div>
                      {sup.contactPerson && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          {sup.contactPerson}
                        </div>
                      )}
                      {sup.status === "Inactive" && (
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditSupplier(sup)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivateSupplier(sup.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {sup.phone}
                    </div>
                    {sup.email && (
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {sup.email}
                      </div>
                    )}
                    {sup.gstin && (
                      <div className="flex items-center gap-2 text-slate-600 font-medium font-mono text-[10px]">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        GSTIN: {sup.gstin}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                      <div className="text-[10px] font-black uppercase text-emerald-600">
                        Total Purchases
                      </div>
                      <div className="font-black text-emerald-900 text-sm">
                        ₹{sup.totalPurchases.toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${sup.outstandingAmount > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div
                        className={`text-[10px] font-black uppercase ${sup.outstandingAmount > 0 ? "text-red-600" : "text-slate-500"}`}
                      >
                        Outstanding
                      </div>
                      <div
                        className={`font-black text-sm ${sup.outstandingAmount > 0 ? "text-red-800" : "text-slate-900"}`}
                      >
                        ₹{sup.outstandingAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {sup._count && (
                    <div className="text-[10px] text-slate-500 font-medium">
                      {sup._count.purchaseOrders} purchase order
                      {sup._count.purchaseOrders !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 4: PAYMENTS
      ══════════════════════════════════════════════ */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-blue-900">
                Record supplier payments
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Open a Purchase Order detail to record a payment against it.
              </p>
            </div>
          </div>

          {/* Orders with outstanding dues */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Outstanding Supplier Payments
                </h3>
                <p className="text-xs text-slate-500">
                  Purchase orders with unpaid or partially-paid amounts
                </p>
              </div>
              <span className="text-xs font-black text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                Total Due: ₹{totalOutstanding.toLocaleString()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">PO #</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-right">Paid</th>
                    <th className="p-4 text-right">Due</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {orders.filter(
                    (o) =>
                      o.paymentStatus !== "PAID" && o.status !== "CANCELLED",
                  ).length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-xs text-emerald-600 font-bold"
                      >
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                        All supplier payments are settled!
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter(
                        (o) =>
                          o.paymentStatus !== "PAID" &&
                          o.status !== "CANCELLED",
                      )
                      .map((order) => {
                        const py =
                          PAY_STATUS[order.paymentStatus] || PAY_STATUS.UNPAID;
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/80">
                            <td className="p-4 font-mono font-black text-slate-900">
                              {order.poNumber}
                            </td>
                            <td className="p-4 font-bold">
                              {order.supplier?.name}
                            </td>
                            <td className="p-4 text-right font-mono font-black">
                              ₹{order.totalAmount.toLocaleString()}
                            </td>
                            <td className="p-4 text-right text-emerald-700 font-mono font-bold">
                              ₹{order.amountPaid.toLocaleString()}
                            </td>
                            <td className="p-4 text-right text-red-700 font-mono font-black">
                              ₹{order.amountDue.toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${py.color}`}
                              >
                                {py.label}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => fetchOrderDetail(order.id)}
                                className="px-3 py-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Pay
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ORDER DETAIL SIDE PANEL (Modal)
      ══════════════════════════════════════════════ */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-stretch">
          <div
            onClick={() => setShowOrderDetail(false)}
            className="flex-1 bg-slate-950/50 backdrop-blur-xs animate-in fade-in"
          />
          <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300 overflow-y-auto">
            {/* Detail Header */}
            <div className="p-6 bg-gradient-to-r from-[#0B132B] to-[#1a2544] flex items-start justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] block mb-1">
                  Purchase Order
                </span>
                <h2 className="text-xl font-black text-white">
                  {selectedOrder.poNumber}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedOrder.store?.name} · {selectedOrder.supplier?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Status update for DRAFT/PENDING */}
                {["DRAFT", "PENDING"].includes(selectedOrder.status) && (
                  <button
                    onClick={() =>
                      updatePoStatus(
                        selectedOrder.id,
                        selectedOrder.status === "DRAFT"
                          ? "ORDERED"
                          : "ORDERED",
                      )
                    }
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer"
                  >
                    {selectedOrder.status === "DRAFT"
                      ? "Mark Ordered"
                      : "Mark Ordered"}
                  </button>
                )}
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              {/* Status row */}
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black border ${PO_STATUS[selectedOrder.status]?.color}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${PO_STATUS[selectedOrder.status]?.dot}`}
                  />
                  {PO_STATUS[selectedOrder.status]?.label}
                </span>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black border ${PAY_STATUS[selectedOrder.paymentStatus]?.color}`}
                >
                  {PAY_STATUS[selectedOrder.paymentStatus]?.label}
                </span>
                {selectedOrder.expectedDelivery && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5" />
                    Expected:{" "}
                    {new Date(
                      selectedOrder.expectedDelivery,
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Financials */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Total",
                    value: `₹${selectedOrder.totalAmount.toLocaleString()}`,
                    color: "bg-slate-50 border-slate-200 text-slate-900",
                  },
                  {
                    label: "Paid",
                    value: `₹${selectedOrder.amountPaid.toLocaleString()}`,
                    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
                  },
                  {
                    label: "Outstanding",
                    value: `₹${selectedOrder.amountDue.toLocaleString()}`,
                    color: "bg-red-50 border-red-200 text-red-800",
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className={`rounded-2xl border p-3 ${f.color}`}
                  >
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      {f.label}
                    </span>
                    <span className="font-black text-lg block mt-0.5">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-xs font-black uppercase text-slate-500 mb-3">
                  Order Items
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-center">Ordered</th>
                        <th className="p-3 text-center">Received</th>
                        <th className="p-3 text-center">Pending</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-white">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">
                              {item.productName}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {item.productSku}
                            </div>
                          </td>
                          <td className="p-3 text-center font-black">
                            {item.orderedQty}
                          </td>
                          <td className="p-3 text-center text-emerald-700 font-black">
                            {item.receivedQty}
                          </td>
                          <td className="p-3 text-center">
                            {item.pendingQty > 0 ? (
                              <span className="font-black text-amber-700">
                                {item.pendingQty}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-black">
                                ✓
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono">
                            ₹{item.unitPrice.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-black">
                            ₹{item.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Receive Stock Section */}
              {["ORDERED", "PARTIALLY_RECEIVED", "PENDING"].includes(
                selectedOrder.status,
              ) && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase text-emerald-800 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4" />
                    Receive Stock
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items
                      ?.filter((i) => i.pendingQty > 0)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-white border border-emerald-200 rounded-xl p-2.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate">
                              {item.productName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Pending: {item.pendingQty} units
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                              Receive:
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={item.pendingQty}
                              value={receiveItems[item.id] ?? item.pendingQty}
                              onChange={(e) =>
                                setReceiveItems((prev) => ({
                                  ...prev,
                                  [item.id]: parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-20 border border-emerald-300 rounded-lg px-2 py-1 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-500 text-center"
                            />
                            <span className="text-[10px] text-slate-400">
                              / {item.pendingQty}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <input
                    type="text"
                    value={receiveNotes}
                    onChange={(e) => setReceiveNotes(e.target.value)}
                    placeholder="Receiving notes (optional)..."
                    className="w-full border border-emerald-300 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                  />
                  {receiveMsg && (
                    <p
                      className={`text-xs font-bold ${receiveMsg.includes("Inventory") || receiveMsg.includes("received") ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {receiveMsg}
                    </p>
                  )}
                  <button
                    onClick={handleReceive}
                    disabled={receiving}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <PackageCheck className="w-4 h-4" />
                    {receiving
                      ? "Processing..."
                      : "Confirm Receipt & Update Inventory"}
                  </button>
                </div>
              )}

              {/* Payment Section */}
              {selectedOrder.amountDue > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase text-blue-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Record Supplier Payment
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        max={selectedOrder.amountDue}
                        placeholder={`Max: ₹${selectedOrder.amountDue.toFixed(0)}`}
                        className="w-full border border-blue-300 rounded-xl px-3 py-2 text-xs font-black focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                        Method
                      </label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="w-full border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold bg-white focus:outline-none cursor-pointer"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                        Reference #
                      </label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        placeholder="Bank ref / cheque #"
                        className="w-full border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={payNotes}
                        onChange={(e) => setPayNotes(e.target.value)}
                        placeholder="Optional notes"
                        className="w-full border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                  {payMsg && (
                    <p
                      className={`text-xs font-bold ${payMsg.includes("recorded") || payMsg.includes("PAID") ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {payMsg}
                    </p>
                  )}
                  <button
                    onClick={handlePayment}
                    disabled={paySubmitting || !payAmount}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    {paySubmitting ? "Recording..." : "Record Payment"}
                  </button>
                </div>
              )}

              {/* Receipt History */}
              {selectedOrder.receipts && selectedOrder.receipts.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 mb-2">
                    Goods Receipt History
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.receipts.map((r: any) => (
                      <div
                        key={r.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                      >
                        <div className="flex justify-between font-bold">
                          <span className="font-mono text-slate-700">
                            {r.receiptNumber}
                          </span>
                          <span className="text-slate-500">
                            {new Date(r.receivedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {r.items?.map((ri: any) => (
                          <div key={ri.id} className="text-slate-600 mt-1">
                            +{ri.receivedQty} ×{" "}
                            {ri.purchaseOrderItem?.product?.name ||
                              ri.purchaseOrderItem?.productName}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment History */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 mb-2">
                    Payment History
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.payments.map((p: any) => (
                      <div
                        key={p.id}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-black text-emerald-900">
                            ₹{p.amount.toLocaleString()}
                          </div>
                          <div className="text-emerald-700 font-medium">
                            {p.paymentMethod.replace("_", " ")}
                            {p.referenceNumber ? ` — ${p.referenceNumber}` : ""}
                          </div>
                        </div>
                        <div className="text-emerald-600 font-medium">
                          {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancel / Close buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                {["DRAFT", "PENDING"].includes(selectedOrder.status) && (
                  <button
                    onClick={async () => {
                      if (confirm("Cancel this purchase order?")) {
                        await updatePoStatus(selectedOrder.id, "CANCELLED");
                        setShowOrderDetail(false);
                      }
                    }}
                    className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black cursor-pointer"
                  >
                    Cancel PO
                  </button>
                )}
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CREATE PURCHASE ORDER MODAL
      ══════════════════════════════════════════════ */}
      {showCreatePO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowCreatePO(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#0B132B] to-[#1a2544] rounded-t-3xl flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] block">
                  New Purchase Order
                </span>
                <h2 className="text-lg font-black text-white">
                  Create Purchase Order
                </h2>
              </div>
              <button
                onClick={() => setShowCreatePO(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePO}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {/* Store & Supplier */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Store *
                  </label>
                  <select
                    required
                    value={poStoreId}
                    onChange={(e) => setPoStoreId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
                  >
                    <option value="">Select store...</option>
                    {stores.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Supplier *
                  </label>
                  <select
                    required
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
                  >
                    <option value="">Select supplier...</option>
                    {suppliers
                      .filter((s) => s.status === "Active")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={poExpectedDelivery}
                    onChange={(e) => setPoExpectedDelivery(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Supplier Invoice #
                  </label>
                  <input
                    type="text"
                    value={poInvoice}
                    onChange={(e) => setPoInvoice(e.target.value)}
                    placeholder="INV-XXXX"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold font-mono focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Line Items *
                  </label>
                  <button
                    type="button"
                    onClick={addPoItem}
                    className="flex items-center gap-1 text-[11px] font-black text-[#00AEEF] hover:text-[#0096D6] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {poItems.map((item, idx) => {
                    const selectedProduct = products.find(
                      (p: any) => p.id === item.productId,
                    );
                    const lineTotal = poLineTotal(item);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <select
                            required
                            value={item.productId}
                            onChange={(e) => {
                              const p = products.find(
                                (p: any) => p.id === e.target.value,
                              );
                              updatePoItem(idx, "productId", e.target.value);
                              if (p)
                                updatePoItem(idx, "unitPrice", p.price * 0.6); // ~60% of selling = suggested purchase price
                            }}
                            className="flex-1 border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF] bg-white cursor-pointer"
                          >
                            <option value="">Select product...</option>
                            {products.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                          {poItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePoItem(idx)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                              Qty
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) =>
                                updatePoItem(
                                  idx,
                                  "qty",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-full border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-black focus:outline-none text-center"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                              Unit Price (₹)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) =>
                                updatePoItem(
                                  idx,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-black focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                              GST %
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={28}
                              value={item.taxRate}
                              onChange={(e) =>
                                updatePoItem(
                                  idx,
                                  "taxRate",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-black focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                              Line Total
                            </label>
                            <div className="border border-emerald-300 bg-emerald-50 rounded-xl px-2 py-1.5 text-xs font-black text-emerald-800 text-center">
                              ₹{lineTotal.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00AEEF] resize-none"
                />
              </div>

              {/* Grand Total Preview */}
              <div className="bg-[#0B132B] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Purchase Order Total
                  </span>
                  <div className="text-xl font-black text-white">
                    ₹{poGrandTotal.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">
                    {poItems.filter((i) => i.productId).length} products
                  </span>
                  <div className="text-xs text-[#00AEEF] font-bold">
                    {poItems.reduce((s, i) => s + i.qty, 0)} units
                  </div>
                </div>
              </div>

              {poError && (
                <p className="text-xs text-red-600 font-bold">{poError}</p>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePO(false);
                    resetPoForm();
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={poSubmitting}
                  className="px-6 py-2.5 bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-60 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {poSubmitting ? "Creating..." : "Create Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          SUPPLIER CREATE / EDIT MODAL
      ══════════════════════════════════════════════ */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowSupplierModal(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-10 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-gradient-to-r from-[#0B132B] to-[#1a2544] rounded-t-3xl flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] block">
                  {editingSupplier ? "Edit Supplier" : "New Supplier"}
                </span>
                <h2 className="text-lg font-black text-white">
                  {editingSupplier ? editingSupplier.name : "Add Supplier"}
                </h2>
              </div>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveSupplier}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    placeholder="e.g. Arduino Tech Global Ltd."
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={sContact}
                    onChange={(e) => setSContact(e.target.value)}
                    placeholder="Name"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Phone *
                  </label>
                  <input
                    required
                    type="tel"
                    value={sPhone}
                    onChange={(e) => setSPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={sEmail}
                    onChange={(e) => setSEmail(e.target.value)}
                    placeholder="supplier@company.com"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={sAddress}
                    onChange={(e) => setSAddress(e.target.value)}
                    placeholder="Street address"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={sCity}
                    onChange={(e) => setSCity(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={sState}
                    onChange={(e) => setSState(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={sGstin}
                    onChange={(e) => setSGstin(e.target.value)}
                    placeholder="27AABCU9603R1ZM"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Banking Details (for payment records)
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={sBankName}
                    onChange={(e) => setSBankName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    Account #
                  </label>
                  <input
                    type="text"
                    value={sBankAccount}
                    onChange={(e) => setSBankAccount(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={sBankIfsc}
                    onChange={(e) => setSBankIfsc(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
              </div>

              {sError && (
                <p className="text-xs text-red-600 font-bold">{sError}</p>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sSubmitting}
                  className="px-6 py-2.5 bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-60 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {sSubmitting
                    ? "Saving..."
                    : editingSupplier
                      ? "Update Supplier"
                      : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
