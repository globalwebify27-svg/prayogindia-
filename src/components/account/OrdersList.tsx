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
  Star,
} from "lucide-react";
import {
  ProfessionalBillModal,
  BillOrder,
} from "@/components/invoice/ProfessionalBillModal";
import { RateAndReviewModal } from "@/components/reviews/RateAndReviewModal";

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
  const rawMethod = (ord.paymentMethod || ord.paymentMode || "").toLowerCase();
  const isCod = rawMethod.includes("cod") || rawMethod.includes("cash on delivery") || rawMethod.includes("cash-on-delivery");
  const isPaid = ord.isPaid !== undefined ? ord.isPaid : (!isCod && ord.status !== "Order Placed");
  const paymentMode = isCod
    ? "Cash on Delivery (COD)"
    : (ord.paymentMethod || ord.paymentMode || "UPI / NetBanking");

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
    paymentMode,
    paymentMethod: paymentMode,
    isPaid,
    receivedAmount: isPaid ? ord.totalAmount : 0,
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
  const [reviewProduct, setReviewProduct] = useState<{
    id: string;
    name: string;
    image?: string;
    sku?: string;
    orderId?: string;
  } | null>(null);
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
              paymentMethod: o.paymentMethod,
              paymentMode: o.paymentMethod,
              paymentStatus: o.paymentStatus,
              isPaid: o.paymentStatus === "PAID" || o.isPaid,
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
                paymentMethod: o.paymentMethod,
                paymentMode: o.paymentMode || o.paymentMethod,
                paymentStatus: o.paymentStatus || (o.isPaid ? "PAID" : "PENDING"),
                isPaid: !!o.isPaid,
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
    <div className="space-y-4 text-slate-900 w-full max-w-full font-sans">
      {/* ── 1. Top Breadcrumb & Orders Count ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
          <span>›</span>
          <Link href="/account" className="hover:text-[#2563EB] transition-colors">My Account</Link>
          <span>›</span>
          <span className="text-slate-900 font-bold">My Orders</span>
        </div>
        <span className="text-xs text-slate-600 font-bold ml-auto sm:ml-0">
          {allUserOrders.length} {allUserOrders.length === 1 ? "Order Placed" : "Orders Placed"}
        </span>
      </div>

      {/* Invoice Mode Guidance Banner */}
      {isInvoiceAction && (
        <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-slate-700 animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>Download Invoices:</strong> Click <strong>Download Invoice</strong> next to any delivered or confirmed item below to view your official GST tax invoice.
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

      {/* ── 2. Prayog India Signature Search Bar (Rounded-2xl with #2563EB CTA) ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-1.5 flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search your orders here"
            className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPage(1)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search Orders</span>
        </button>
      </div>

      {/* ── 3. Main Prayog Orders List (Rounded-2xl Cards) ── */}
      {loading ? (
        <div className="p-14 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/90 shadow-2xs animate-pulse">
          Loading your orders...
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-4">
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
              : "Explore our robotics kits, development boards, and STEM electronics."}
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <span>Start Shopping</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {paginatedOrders.map((ord) => {
            const rawStatus = (ord.status || "").toLowerCase();
            const isDelivered = rawStatus.includes("delivered") || rawStatus.includes("arrived");
            const isShipped = rawStatus.includes("shipped") || rawStatus.includes("out for delivery");
            const isCancelled = rawStatus.includes("cancelled");
            const isPendingOrProcessing = !isDelivered && !isShipped && !isCancelled;

            const isCod =
              ord.paymentMethod?.toLowerCase().includes("cod") ||
              ord.paymentMethod?.toLowerCase().includes("cash on delivery");

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
                onClick={() => router.push(`/account/orders/${ord.id}`)}
                className="bg-white border border-slate-200/90 rounded-2xl hover:shadow-xs transition-all p-4 sm:p-5 cursor-pointer divide-y divide-slate-100"
              >
                {displayItems.map((item, idx) => {
                  const itemImg = getProductThumbnail(item);
                  const itemTotal =
                    item.price && item.quantity
                      ? item.price * item.quantity
                      : ord.totalAmount;

                  return (
                    <div key={idx} className="first:pt-0 pt-4">
                      {/* ── Mobile Layout (< md) ── */}
                      <div className="md:hidden space-y-3">
                        {/* 1. Product Thumbnail + Details & Price */}
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 shrink-0 relative bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center p-1">
                            <Image
                              src={itemImg}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-contain p-0.5"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="font-bold text-slate-900 text-xs hover:text-[#2563EB] line-clamp-2 block transition-colors leading-snug">
                              {item.name}
                            </span>

                            <div className="flex items-baseline gap-1.5 pt-0.5">
                              <span className="text-sm font-black text-slate-900">
                                ₹{itemTotal.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                ({isCod ? "Cash on Delivery" : (ord.paymentMethod || "Prepaid")})
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pt-0.5 flex-wrap">
                              <span>Qty: {item.quantity || 1}</span>
                              {item.sku && <span>• SKU: {item.sku}</span>}
                              <span>• #{ord.orderNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Full-Width Status Block & Action Buttons */}
                        <div className="pt-2.5 border-t border-slate-100 space-y-2">
                          {isDelivered && (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span className="font-bold text-xs text-slate-900">
                                  Delivered on {ord.date}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 pl-3.5">
                                Your item has been delivered
                              </p>
                            </div>
                          )}

                          {isShipped && (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                <span className="font-bold text-xs text-slate-900">
                                  Shipped on {ord.date}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 pl-3.5">
                                Your item is in transit with {ord.courierName || "Express Courier"}
                              </p>
                            </div>
                          )}

                          {isCancelled && (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                <span className="font-bold text-xs text-slate-900">
                                  Cancelled on {ord.date}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 pl-3.5">
                                Your order was cancelled as per your request
                              </p>
                            </div>
                          )}

                          {isPendingOrProcessing && (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                <span className="font-bold text-xs text-slate-900">
                                  Order Placed on {ord.date}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 pl-3.5">
                                Processing order at Prayog central warehouse
                              </p>
                            </div>
                          )}

                          {/* Mobile Action Buttons Bar */}
                          <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                            {isDelivered ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReviewProduct({
                                    id: item.id || item.sku || `item-${idx}`,
                                    name: item.name,
                                    image: itemImg,
                                    sku: item.sku,
                                    orderId: ord.id,
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 fill-[#FFC200] text-[#FFC200]" />
                                <span>Rate &amp; Review Product</span>
                              </button>
                            ) : isPendingOrProcessing || isShipped ? (
                              <span className="text-xs font-bold text-[#2563EB]">
                                Track Status
                              </span>
                            ) : null}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceOrder(ord);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ml-auto"
                              title="Download Invoice"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── Desktop Layout (hidden md:grid md:grid-cols-12) ── */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                        {/* Column 1 & 2: Product Thumbnail & Details */}
                        <div className="col-span-6 flex items-start gap-3.5 min-w-0">
                          <div className="w-20 h-20 shrink-0 relative bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center p-1.5">
                            <Image
                              src={itemImg}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-contain p-0.5"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="font-bold text-slate-900 text-sm hover:text-[#2563EB] line-clamp-2 block transition-colors leading-snug">
                              {item.name}
                            </span>

                            <div className="text-xs text-slate-500 font-medium space-y-0.5">
                              <div>
                                <span>Qty: {item.quantity || 1}</span>
                                {item.sku && (
                                  <span className="text-slate-400"> • SKU: {item.sku}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-0.5">
                                <span>Order #{ord.orderNumber}</span>
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
                                  className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                  title="Copy Order Number"
                                >
                                  {copiedOrderNum === ord.orderNumber ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Price Column */}
                        <div className="col-span-2 text-left">
                          <div className="font-extrabold text-base text-slate-900">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </div>
                          <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                            {isCod ? "Cash on Delivery" : (ord.paymentMethod || "Prepaid")}
                          </span>
                        </div>

                        {/* Column 4: Status & Actions */}
                        <div className="col-span-4 text-left space-y-1">
                          {isDelivered && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="font-bold text-sm text-slate-900">
                                  Delivered on {ord.date}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 pl-4.5">
                                Your item has been delivered
                              </p>
                              <div className="pl-4.5 pt-1 flex flex-wrap items-center gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReviewProduct({
                                      id: item.id || item.sku || `item-${idx}`,
                                      name: item.name,
                                      image: itemImg,
                                      sku: item.sku,
                                      orderId: ord.id,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer active:scale-95 transition-all"
                                >
                                  <Star className="w-3.5 h-3.5 fill-[#FFC200] text-[#FFC200]" />
                                  <span>Rate &amp; Review Product</span>
                                </button>
                              </div>
                            </>
                          )}

                          {isShipped && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="font-bold text-sm text-slate-900">
                                  Shipped on {ord.date}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 pl-4.5">
                                Your item is in transit with {ord.courierName || "Express Courier"}
                              </p>
                              <div className="pl-4.5 pt-1">
                                <span className="text-xs font-bold text-[#2563EB] hover:underline">
                                  Track Package
                                </span>
                              </div>
                            </>
                          )}

                          {isCancelled && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                                <span className="font-bold text-sm text-slate-900">
                                  Cancelled on {ord.date}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 pl-4.5">
                                Your order was cancelled as per your request.
                              </p>
                            </>
                          )}

                          {isPendingOrProcessing && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="font-bold text-sm text-slate-900">
                                  Order Placed on {ord.date}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 pl-4.5">
                                Processing order at Prayog central warehouse
                              </p>
                              <div className="pl-4.5 pt-1">
                                <span className="text-xs font-bold text-[#2563EB] hover:underline">
                                  Track Order Status
                                </span>
                              </div>
                            </>
                          )}

                          <div className="pl-4.5 pt-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceOrder(ord);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition-colors cursor-pointer"
                              title="Download Official GST Tax Invoice"
                            >
                              <Download className="w-3 h-3 text-slate-400" />
                              <span>Download Invoice</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* ── 5. Prayog Theme Bottom Pagination (Rounded-2xl) ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-2xs text-xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{(page - 1) * PAGE_SIZE + 1}</strong> – <strong className="text-slate-900">{Math.min(page * PAGE_SIZE, totalFiltered)}</strong> of <strong className="text-slate-900">{totalFiltered}</strong> orders
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-slate-700"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-slate-700"
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

      {/* Rate & Review Modal (Strictly for Delivered Products) */}
      {reviewProduct && (
        <RateAndReviewModal
          isOpen={!!reviewProduct}
          product={reviewProduct}
          onClose={() => setReviewProduct(null)}
        />
      )}
    </div>
  );
};
