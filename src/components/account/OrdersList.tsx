"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerOrder } from "@/data/accountData";
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
  Download,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import {
  ProfessionalBillModal,
  BillOrder,
} from "@/components/invoice/ProfessionalBillModal";

function customerOrderToBillOrder(ord: CustomerOrder): BillOrder {
  const subtotal = ord.subtotal || Math.round(ord.totalAmount / 1.18);
  const tax = ord.gstAmount || Math.round(ord.totalAmount - subtotal);
  return {
    id: ord.id,
    orderNumber: ord.orderNumber,
    invoiceNo: `INV-2024-${ord.orderNumber.replace(/[^0-9]/g, "").slice(-4) || "8841"}`,
    billNo: ord.orderNumber,
    date: ord.date || new Date().toLocaleDateString("en-IN"),
    createdAt: ord.date,
    customerName: "Tux (Prayog Customer)",
    customerPhone: "+91 87097 89641",
    customerEmail: "tuxgaming003@gmail.com",
    shippingAddress: ord.shippingAddress,
    customerGstin: "20AAECP1234F1Z5",
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

export const OrdersList: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
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

  useEffect(() => {
    async function loadOrders() {
      let mapped: CustomerOrder[] = [];
      try {
        const res = await fetch("/api/orders");
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

      // Merge locally placed orders from browser cache (live demo fallback)
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("prayog_placed_orders") : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingOrderNums = new Set(mapped.map((o) => o.orderNumber));
            const localOrders: CustomerOrder[] = parsed
              .filter((o: any) => !existingOrderNums.has(o.orderNumber))
              .map((o: any) => {
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
            mapped = [...localOrders, ...mapped];
          }
        }
      } catch (cacheErr) {
        console.warn("Failed to load local orders cache:", cacheErr);
      }

      const finalOrders = mapped;
      setOrders(finalOrders);
      setLoading(false);
    }
    loadOrders();
  }, [router]);

  return (
    <div className="space-y-4 text-slate-900 w-full max-w-full">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between gap-2 pb-1 px-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {orders.length} {orders.length === 1 ? "order placed" : "orders placed"}
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

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-2xs animate-pulse">
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No orders placed yet</h3>
          <p className="text-xs text-slate-500">
            Explore our robotics kits, development boards, and components.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A1128] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <span>Start Shopping</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
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
        </div>
      )}

      {/* Bill & Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <ProfessionalBillModal
          order={customerOrderToBillOrder(selectedInvoiceOrder)}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
