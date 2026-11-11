"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_CUSTOMER_ORDERS, CustomerOrder } from "@/data/accountData";
import {
  ShoppingBag,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Package,
  ChevronRight,
  MapPin,
  Download,
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
  if (s.includes("delivered")) {
    return {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      icon: CheckCircle2,
    };
  }
  if (s.includes("shipped") || s.includes("out for delivery")) {
    return {
      className: "bg-sky-50 text-[#0086B8] border-sky-200/70",
      icon: Truck,
    };
  }
  if (s.includes("cancelled")) {
    return {
      className: "bg-rose-50 text-rose-700 border-rose-200/70",
      icon: XCircle,
    };
  }
  return {
    className: "bg-amber-50 text-amber-700 border-amber-200/70",
    icon: Clock,
  };
}

export const OrdersList: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);
  const [isInvoiceAction, setIsInvoiceAction] = useState(false);

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
                  name: item.productName,
                  sku: item.productSku,
                  slug: item.product?.slug || item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  image:
                    item.product?.images?.[0]?.imageUrl || "/placeholder.png",
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
              .map((o: any) => ({
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
                itemsCount: o.items?.length || 1,
                shippingAddress: o.shippingAddress || "",
                items:
                  o.items?.map((item: any) => ({
                    id: item.id || item.productId || "item-1",
                    name: item.name || item.productName || "Hardware Component",
                    sku: item.sku || item.productSku || "PRG-SKU",
                    slug: item.slug || item.productId || "hardware",
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    image: item.image || "/placeholder.png",
                  })) || [],
              }));
            mapped = [...localOrders, ...mapped];
          }
        }
      } catch (cacheErr) {
        console.warn("Failed to load local orders cache:", cacheErr);
      }

      const finalOrders = mapped.length > 0 ? mapped : MOCK_CUSTOMER_ORDERS;
      setOrders(finalOrders);
      setLoading(false);
    }
    loadOrders();
  }, [router]);

  return (
    <div className="space-y-3.5 text-slate-900 w-full max-w-full">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between gap-2 pb-1.5 px-0.5">
        <div>
          <h1 className="hidden lg:block text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
            My Orders
          </h1>
          <p className="text-xs text-slate-500 font-medium">
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
        <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-slate-700 animate-in fade-in">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>Download Invoices:</strong> Tap <strong>Invoice</strong> on any order below or click into the order to download your official GST invoice.
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
        <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 animate-pulse">
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">
            You have not placed any orders yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
          >
            <span>Start Shopping</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {orders.map((ord) => {
            const isDelivered =
              ord.status?.toLowerCase().includes("delivered") ||
              ord.status?.toLowerCase().includes("arrived");
            const isShipped =
              ord.status?.toLowerCase().includes("shipped") ||
              ord.status?.toLowerCase().includes("out for delivery");

            return (
              <div
                key={ord.id}
                onClick={() => router.push(`/account/orders/${ord.id}`)}
                className="p-3 sm:p-4 hover:bg-slate-50/70 transition-colors block group cursor-pointer"
              >
                {/* Top Row: Status Icon + Status Text + Amount/Date + Arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Status Circular Icon matching Image 1 green badge */}
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-600"
                          : isShipped
                          ? "bg-sky-100 text-[#0086B8]"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {isDelivered ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isShipped ? (
                        <Truck className="w-3.5 h-3.5" />
                      ) : (
                        <Package className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                        {isDelivered ? "Order arrived" : ord.status}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        ₹{ord.totalAmount.toLocaleString("en-IN")} • {ord.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceOrder(ord);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 hover:border-blue-300 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                      title="Download GST Tax Invoice"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Invoice</span>
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>

                {/* Bottom Row: Product Thumbnails */}
                {ord.items && ord.items.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 sm:pt-2.5 pl-8.5">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 relative overflow-hidden"
                        title={item.name}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                    ))}
                  </div>
                )}
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
