"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { CustomerOrder, getOrderTimestamp } from "@/data/accountData";
import { PRODUCTS } from "@/data/mockData";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Package,
  ChevronRight,
  ChevronLeft,
  Download,
  Copy,
  Check,
  Search,
  X,
} from "lucide-react";
import {
  ProfessionalBillModal,
  BillOrder,
} from "@/components/invoice/ProfessionalBillModal";

export type OrderTab =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const TABS: Array<{ key: OrderTab; label: string }> = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function customerOrderToBillOrder(ord: CustomerOrder, user?: any): BillOrder {
  const subtotal = ord.subtotal || Math.round(ord.totalAmount / 1.18);
  const tax = ord.gstAmount || Math.round(ord.totalAmount - subtotal);
  return {
    id: ord.id,
    orderNumber: ord.orderNumber,
    invoiceNo: `INV-2024-${ord.orderNumber.replace(/[^0-9]/g, "").slice(-4) || "8841"}`,
    billNo: ord.orderNumber,
    date: ord.date || new Date().toLocaleDateString("en-IN"),
    createdAt: ord.date,
    customerName: user?.name || "Prayog Customer",
    customerPhone: user?.phone || "+91 87097 89641",
    customerEmail: user?.email || "customer@prayogindia.com",
    shippingAddress: ord.shippingAddress,
    customerGstin: user?.gstin || "20AAECP1234F1Z5",
    paymentMode: "UPI / NetBanking",
    items: (ord.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      rate: item.price,
      unitPrice: item.price,
      total: item.price * item.quantity,
    })),
    subtotal,
    tax,
    total: ord.totalAmount,
    totalAmount: ord.totalAmount,
    discount: ord.discountAmount || 0,
    storeCode: "RANCHI",
    storeName: "Prayog India Ranchi Hub",
    status: ord.status,
  };
}

function formatStatus(status: string): CustomerOrder["status"] {
  switch (status) {
    case "ORDER_PLACED":
      return "Order Placed";
    case "PAYMENT_CONFIRMED":
      return "Payment Confirmed";
    case "PROCESSING":
      return "Processing";
    case "PACKED":
      return "Packed";
    case "SHIPPED":
      return "Shipped";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled" as any;
    default:
      return "Payment Confirmed";
  }
}

function matchesTab(statusStr: string, tab: OrderTab): boolean {
  if (tab === "all") return true;
  const s = (statusStr || "").toLowerCase();
  switch (tab) {
    case "pending":
      return (
        s.includes("placed") ||
        s.includes("confirmed") ||
        s.includes("pending") ||
        s === "order_placed" ||
        s === "payment_confirmed"
      );
    case "processing":
      return s.includes("processing") || s.includes("packed");
    case "shipped":
      return s.includes("shipped") || s.includes("out for delivery");
    case "delivered":
      return s.includes("delivered") || s.includes("arrived");
    case "cancelled":
      return s.includes("cancelled");
    default:
      return true;
  }
}

function getStatusBadgeConfig(status: string) {
  const s = status?.toLowerCase() || "";
  if (s.includes("delivered") || s.includes("arrived")) {
    return {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      icon: CheckCircle2,
      label: "Delivered",
    };
  }
  if (s.includes("shipped") || s.includes("out for delivery")) {
    return {
      className: "bg-sky-50 text-sky-700 border-sky-200/80",
      icon: Truck,
      label: "Shipped",
    };
  }
  if (s.includes("cancelled")) {
    return {
      className: "bg-rose-50 text-rose-700 border-rose-200/80",
      icon: XCircle,
      label: "Cancelled",
    };
  }
  return {
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
    icon: Clock,
    label: "Processing",
  };
}

function getProductThumbnail(item: { id?: string; name?: string; image?: string; sku?: string }) {
  if (item.image && item.image !== "/placeholder.png" && !item.image.includes("placeholder")) {
    return item.image;
  }
  if (item.name) {
    const query = item.name.toLowerCase().trim();
    const matched = PRODUCTS.find(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        query.includes(p.name.toLowerCase()) ||
        (item.sku && p.sku && p.sku.toLowerCase() === item.sku.toLowerCase()) ||
        (item.id && p.id === item.id)
    );
    if (matched && matched.image) {
      return matched.image;
    }
  }
  const n = (item.name || "").toLowerCase();
  if (n.includes("uno") || n.includes("arduino")) return "/images/products/arduino-uno-r3.png";
  if (n.includes("pi") || n.includes("raspberry")) return "/images/products/raspberry-pi-5.png";
  if (n.includes("sensor") || n.includes("ultrasonic")) return "/images/products/ultrasonic-sensor-hcsr04.png";
  if (n.includes("motor") || n.includes("driver")) return "/images/products/l298n-motor-driver.jpg";
  if (n.includes("chassis") || n.includes("robot")) return "/images/products/4wd-robot-chassis-kit.jpg";
  if (n.includes("esp32")) return "/images/products/esp32-devkit-v1.png";

  return "/images/products/arduino-uno-r3.png";
}

const PAGE_SIZE = 10;

export const OrdersList: React.FC = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useStore();

  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [allUserOrders, setAllUserOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);
  const [isInvoiceAction, setIsInvoiceAction] = useState(false);
  const [copiedOrderNum, setCopiedOrderNum] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "invoice") {
        setIsInvoiceAction(true);
      }
    }
  }, []);

  // Fetch orders strictly for the authenticated user
  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setLoading(true);
      let mapped: CustomerOrder[] = [];

      try {
        // 1. Fetch from server API (isolated by session user ID)
        const res = await fetch("/api/orders?limit=100");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.items && json.data.items.length > 0) {
            mapped = json.data.items.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              createdAt: o.createdAt,
              date: new Date(o.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              totalAmount: o.totalAmount,
              subtotal: o.subtotal,
              gstAmount: o.gstAmount,
              discountAmount: o.discountAmount,
              status: formatStatus(o.status),
              itemsCount: o.items?.length || 1,
              shippingAddress: o.shippingAddress,
              trackingNumber: o.shipment?.trackingNumber,
              courierName: o.shipment?.courierName,
              items:
                o.items?.map((item: any) => ({
                  id: item.productId,
                  name: item.productName || "Hardware Component",
                  sku: item.productSku || "PRG-SKU",
                  slug: item.product?.slug || item.productId,
                  quantity: item.quantity || 1,
                  price: item.price || 0,
                  image:
                    item.product?.images?.[0]?.imageUrl ||
                    item.product?.image ||
                    getProductThumbnail({ name: item.productName, sku: item.productSku }),
                })) || [],
            }));
          }
        }
      } catch (err) {
        console.warn("Could not load customer orders from API:", err);
      }

      // 2. Merge locally placed orders from browser cache ONLY for this logged-in user
      try {
        const stored =
          typeof window !== "undefined"
            ? localStorage.getItem("prayog_placed_orders")
            : null;
        if (stored && user) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const currentEmail = (user.email || "").toLowerCase().trim();
            const currentUserId = user.id ? String(user.id) : "";

            const existingOrderNums = new Set(mapped.map((o) => o.orderNumber));
            const userOnlyParsed = parsed.filter((o: any) => {
              if (existingOrderNums.has(o.orderNumber)) return false;
              const orderUserId = o.userId || o.user_id || o.user?.id;
              const orderUserEmail = (
                o.customerEmail ||
                o.user?.email ||
                ""
              )
                .toLowerCase()
                .trim();

              // Match by user ID
              if (currentUserId && orderUserId && String(orderUserId) === currentUserId) {
                return true;
              }
              // Match by email
              if (currentEmail && orderUserEmail && orderUserEmail === currentEmail) {
                return true;
              }
              return false;
            });

            const localOrders: CustomerOrder[] = userOnlyParsed.map((o: any) => {
              const rawItems = o.items || [];
              const resolvedItems =
                rawItems.length > 0
                  ? rawItems.map((item: any, idx: number) => {
                      const itemName =
                        item.name || item.productName || "Arduino UNO R3 Official Rev3 Board";
                      const matchedProd = PRODUCTS.find(
                        (p) =>
                          p.name.toLowerCase() === itemName.toLowerCase() ||
                          p.id === (item.id || item.productId)
                      );
                      return {
                        id: item.id || item.productId || matchedProd?.id || `item-${idx + 1}`,
                        name: itemName,
                        sku: item.sku || item.productSku || matchedProd?.sku || "PRG-ARD-001",
                        slug: item.slug || matchedProd?.slug || "arduino-uno-r3-official-rev3-board",
                        quantity: item.quantity || 1,
                        price: item.price || matchedProd?.price || (o.totalAmount || 1200),
                        image:
                          item.image ||
                          matchedProd?.image ||
                          getProductThumbnail({ name: itemName, sku: item.sku }),
                      };
                    })
                  : [
                      {
                        id: "item-default",
                        name: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
                        sku: "PRG-ARD-001",
                        slug: "arduino-uno-r3-official-rev3-board",
                        quantity: 1,
                        price: o.totalAmount || 1200,
                        image: "/images/products/arduino-uno-r3.png",
                      },
                    ];

              return {
                id: o.id || o.orderNumber,
                orderNumber: o.orderNumber,
                createdAt: o.createdAt || getOrderTimestamp(o),
                date: o.createdAt
                  ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Today",
                totalAmount: o.totalAmount || 0,
                subtotal: o.subtotal || o.totalAmount || 0,
                status: formatStatus(o.status || "ORDER_PLACED"),
                itemsCount: resolvedItems.length,
                shippingAddress: o.shippingAddress || "",
                items: resolvedItems,
              };
            });

            mapped = [...mapped, ...localOrders];
          }
        }
      } catch (cacheErr) {
        console.warn("Failed to load local orders cache:", cacheErr);
      }

      // Chronological sort: strictly latest order at the top, then second latest, etc.
      mapped.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

      if (isMounted) {
        setAllUserOrders(mapped);
        setLoading(false);
      }
    }

    if (isLoggedIn) {
      loadOrders();
    } else {
      setAllUserOrders([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [router, isLoggedIn, user?.id, user?.email]);

  // Compute live tab counts strictly for the logged-in user's orders
  const statusCounts = useMemo(() => {
    return {
      all: allUserOrders.length,
      pending: allUserOrders.filter((o) => matchesTab(o.status, "pending")).length,
      processing: allUserOrders.filter((o) => matchesTab(o.status, "processing")).length,
      shipped: allUserOrders.filter((o) => matchesTab(o.status, "shipped")).length,
      delivered: allUserOrders.filter((o) => matchesTab(o.status, "delivered")).length,
      cancelled: allUserOrders.filter((o) => matchesTab(o.status, "cancelled")).length,
    };
  }, [allUserOrders]);

  // Filter orders by active tab and search query
  const filteredOrders = useMemo(() => {
    let result = allUserOrders;

    // Filter by Tab
    if (activeTab !== "all") {
      result = result.filter((o) => matchesTab(o.status, activeTab));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        if (o.orderNumber.toLowerCase().includes(q)) return true;
        if (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) return true;
        if (
          o.items &&
          o.items.some(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              (i.sku && i.sku.toLowerCase().includes(q))
          )
        ) {
          return true;
        }
        return false;
      });
    }

    return result;
  }, [allUserOrders, activeTab, searchQuery]);

  // Pagination calculation
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  return (
    <div className="space-y-4 text-slate-900 w-full max-w-full">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between gap-2 pb-1 px-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {allUserOrders.length}{" "}
            {allUserOrders.length === 1 ? "order placed" : "orders placed"}
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-[#2563EB] hover:underline shrink-0"
        >
          Browse Products →
        </Link>
      </div>

      {/* Invoice Mode Guidance Banner */}
      {isInvoiceAction && (
        <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-slate-700 animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#2563EB] shrink-0" />
            <span>
              <strong>Download Invoices:</strong> Tap <strong>Download Invoice</strong> on any order below to view and download your official GST tax invoice.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsInvoiceAction(false)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Bar & Order Tabs Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Order ID, product name, or tracking number..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TABS.map((tab) => {
            const count = statusCounts[tab.key] ?? 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#0A1128] text-white shadow-2xs"
                    : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Order Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-2xs animate-pulse">
          Loading your orders...
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs px-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">
            {searchQuery
              ? "No orders found matching your search"
              : activeTab !== "all"
              ? `No ${TABS.find((t) => t.key === activeTab)?.label} orders found`
              : "No orders placed yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search query or clear the filter to view all orders."
              : activeTab !== "all"
              ? "You do not have any orders currently under this status filter."
              : "Explore our robotics kits, development boards, and components."}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span>Clear Search</span>
            </button>
          ) : activeTab !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span>View All Orders</span>
            </button>
          ) : (
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A1128] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Start Shopping</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((ord) => {
            const badgeConfig = getStatusBadgeConfig(ord.status);
            const BadgeIcon = badgeConfig.icon;
            const isDelivered =
              ord.status?.toLowerCase().includes("delivered") ||
              ord.status?.toLowerCase().includes("arrived");
            const isShipped =
              ord.status?.toLowerCase().includes("shipped") ||
              ord.status?.toLowerCase().includes("out for delivery");

            const displayItems =
              ord.items && ord.items.length > 0
                ? ord.items
                : [
                    {
                      id: "item-default",
                      name: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
                      sku: "PRG-ARD-001",
                      slug: "arduino-uno-r3-official-rev3-board",
                      quantity: ord.itemsCount || 1,
                      price: ord.totalAmount,
                      image: "/images/products/arduino-uno-r3.png",
                    },
                  ];

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
              >
                {/* ── 1. Order Card Header Bar ── */}
                <div className="bg-slate-50/80 px-4 sm:px-6 py-3.5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Left Metadata Columns */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Order Placed
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {ord.date}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Amount
                      </span>
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        ₹{ord.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Order Number
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          #{ord.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                              navigator.clipboard.writeText(ord.orderNumber);
                              setCopiedOrderNum(ord.orderNumber);
                              setTimeout(() => setCopiedOrderNum(null), 1500);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title="Copy Order Number"
                        >
                          {copiedOrderNum === ord.orderNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Actions: Download Invoice & View Details */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceOrder(ord);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 hover:text-[#2563EB] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      title="Download Official GST Tax Invoice"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Download Invoice</span>
                    </button>

                    <Link
                      href={`/account/orders/${ord.id}`}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-all"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* ── 2. Order Body: Status + Product Items ── */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeConfig.className}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badgeConfig.label}</span>
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        {isDelivered
                          ? `Package delivered on ${ord.date}`
                          : isShipped
                          ? `In transit with ${ord.courierName || "Express Courier"}`
                          : "Processing order at Prayog central warehouse"}
                      </span>
                    </div>

                    <Link
                      href={`/account/orders/${ord.id}`}
                      className="sm:hidden text-xs font-bold text-[#2563EB] inline-flex items-center gap-0.5 hover:underline"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* ── List of Products in this Order ── */}
                  <div className="divide-y divide-slate-100">
                    {displayItems.map((item, idx) => {
                      const itemImg = getProductThumbnail(item);
                      return (
                        <div
                          key={idx}
                          className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Product Image + Details */}
                          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-200/80 p-1.5 shrink-0 relative overflow-hidden flex items-center justify-center">
                              <Image
                                src={itemImg}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-contain p-1"
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <Link
                                href={
                                  item.slug
                                    ? `/products/${item.slug}`
                                    : `/account/orders/${ord.id}`
                                }
                                className="font-bold text-slate-900 text-xs sm:text-sm hover:text-[#2563EB] line-clamp-2 transition-colors block"
                              >
                                {item.name}
                              </Link>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                                <span>
                                  Qty:{" "}
                                  <strong className="text-slate-800">
                                    {item.quantity}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Price:{" "}
                                  <strong className="text-slate-800">
                                    ₹
                                    {(
                                      item.price ||
                                      Math.round(
                                        ord.totalAmount /
                                          (displayItems.length || 1)
                                      )
                                    ).toLocaleString("en-IN")}
                                  </strong>
                                </span>
                                {item.sku && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-[11px] text-slate-400">
                                      SKU: {item.sku}
                                    </span>
                                  </>
                                )}
                              </div>

                              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Genuine Prayog Hardware (100% Tested)</span>
                              </p>
                            </div>
                          </div>

                          {/* Item Action Buttons */}
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-center">
                            <Link
                              href={
                                item.slug
                                  ? `/products/${item.slug}`
                                  : "/products"
                              }
                              className="w-full sm:w-auto text-center px-4 py-2 bg-[#0A1128] hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                            >
                              Buy Again
                            </Link>
                            <Link
                              href={`/account/orders/${ord.id}`}
                              className="w-full sm:w-auto text-center px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              Track Package
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── 3. Pagination Controls ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-2xs text-xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{(page - 1) * PAGE_SIZE + 1}</strong> – <strong className="text-slate-900">{Math.min(page * PAGE_SIZE, totalFiltered)}</strong> of <strong className="text-slate-900">{totalFiltered}</strong> orders
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-slate-700"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-1 font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-slate-700"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bill & Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <ProfessionalBillModal
          order={customerOrderToBillOrder(selectedInvoiceOrder, user)}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
