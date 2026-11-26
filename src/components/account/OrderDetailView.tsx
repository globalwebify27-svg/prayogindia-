"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { MOCK_CUSTOMER_ORDERS, CustomerOrder } from "@/data/accountData";
import { PRODUCTS } from "@/data/mockData";
import {
  Truck,
  CheckCircle2,
  ArrowLeft,
  FileText,
  RotateCcw,
  RefreshCw,
  XCircle,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  DollarSign,
  AlertCircle,
  Star,
  Loader2,
  Download,
  Printer,
} from "lucide-react";
import {
  ProfessionalBillModal,
  BillOrder,
} from "@/components/invoice/ProfessionalBillModal";
import { RateAndReviewModal } from "@/components/reviews/RateAndReviewModal";
import { OrderCancellationModal } from "@/components/orders/OrderCancellationModal";

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
    paymentMode:
      (ord.paymentMethod || "").toLowerCase().includes("cod") ||
      (ord.paymentMode || "").toLowerCase().includes("cod") ||
      (ord.paymentMethod || "").toLowerCase().includes("cash on delivery")
        ? "Cash on Delivery (COD)"
        : ord.paymentMethod || ord.paymentMode || "UPI / NetBanking",
    paymentMethod:
      (ord.paymentMethod || "").toLowerCase().includes("cod") ||
      (ord.paymentMode || "").toLowerCase().includes("cod") ||
      (ord.paymentMethod || "").toLowerCase().includes("cash on delivery")
        ? "Cash on Delivery (COD)"
        : ord.paymentMethod || ord.paymentMode || "UPI / NetBanking",
    isPaid:
      ord.isPaid !== undefined
        ? ord.isPaid
        : !((ord.paymentMethod || "").toLowerCase().includes("cod") || (ord.paymentMethod || "").toLowerCase().includes("cash on delivery")),
    receivedAmount:
      ord.isPaid || !((ord.paymentMethod || "").toLowerCase().includes("cod") || (ord.paymentMethod || "").toLowerCase().includes("cash on delivery"))
        ? ord.totalAmount
        : 0,
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

interface OrderDetailProps {
  orderId: string;
}

function formatOrderStatus(status: string): CustomerOrder["status"] {
  const norm = (status || "").toUpperCase().replace(/[\s-]/g, "_");
  if (norm.includes("DELIVER") || norm.includes("ARRIV")) return "Delivered";
  if (norm.includes("SHIP") || norm.includes("TRANSIT") || norm.includes("OUT_FOR_DELIVERY")) return "Shipped";
  if (norm.includes("CANCEL")) return "Order Placed";
  if (norm.includes("PROCESS") || norm.includes("PACK")) return "Processing";
  if (norm.includes("CONFIRM") || norm.includes("PAID")) return "Payment Confirmed";
  if (norm.includes("PLACE")) return "Order Placed";
  return "Order Placed";
}

export const OrderDetailView: React.FC<OrderDetailProps> = ({ orderId }) => {
  const router = useRouter();
  const { addToCart, user, isLoggedIn } = useStore();

  const [liveOrder, setLiveOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewProduct, setReviewProduct] = useState<{
    id: string;
    name: string;
    image?: string;
    sku?: string;
    orderId?: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch live order details with strict authorization check
  useEffect(() => {
    let isMounted = true;

    async function loadLiveOrder() {
      let resolved: CustomerOrder | null = null;

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            resolved = {
              id: d.id,
              orderNumber: d.orderNumber,
              date: new Date(d.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              totalAmount: d.totalAmount,
              subtotal: d.subtotal,
              gstAmount: d.gstAmount,
              discountAmount: d.discountAmount,
              status: formatOrderStatus(d.status),
              itemsCount: d.items?.length || 1,
              shippingAddress: d.shippingAddress,
              paymentMethod: d.paymentMethod,
              paymentMode: d.paymentMethod,
              paymentStatus: d.paymentStatus,
              isPaid: d.paymentStatus === "PAID" || d.isPaid,
              courierName: d.shipment?.courierName || "Delhivery Surface Cargo",
              courierCode: d.shipment?.courierCode || "DELHIVERY",
              trackingNumber: d.shipment?.trackingNumber || "DEL-99228811IN",
              trackingUrl:
                d.shipment?.trackingUrl || "https://www.delhivery.com",
              labelUrl: d.shipment?.labelUrl,
              estimatedDelivery: d.shipment?.estimatedDelivery,
              trackingEvents: d.shipment?.trackingEvents || [],
              isCancelable:
                d.status === "ORDER_PLACED" || d.status === "PAYMENT_FAILED",
              isReturnable: d.status === "DELIVERED",
              items:
                d.items?.map((item: any) => ({
                  id: item.productId,
                  name: item.productName,
                  sku: item.productSku,
                  slug: item.product?.slug || item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  image:
                    item.product?.images?.[0]?.imageUrl || "/placeholder.png",
                })) || [],
            };
          }
        }
      } catch (err) {
        console.warn("Could not load order details from API:", err);
      }

      // Check local storage orders cache ONLY if order belongs to currently logged-in user
      if (!resolved && user) {
        try {
          const stored =
            typeof window !== "undefined"
              ? localStorage.getItem("prayog_placed_orders")
              : null;
          if (stored) {
            const parsed = JSON.parse(stored);
            const currentEmail = (user.email || "").toLowerCase().trim();
            const currentUserId = user.id ? String(user.id) : "";

            const found = parsed.find((o: any) => {
              if (o.id !== orderId && o.orderNumber !== orderId) return false;
              const orderUserId = o.userId || o.user_id || o.user?.id;
              const orderUserEmail = (
                o.customerEmail ||
                o.user?.email ||
                ""
              )
                .toLowerCase()
                .trim();

              if (currentUserId && orderUserId && String(orderUserId) === currentUserId) {
                return true;
              }
              if (currentEmail && orderUserEmail && orderUserEmail === currentEmail) {
                return true;
              }
              return false;
            });

            if (found) {
              resolved = {
                id: found.id || found.orderNumber,
                orderNumber: found.orderNumber,
                date: found.createdAt
                  ? new Date(found.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Today",
                totalAmount: found.totalAmount,
                subtotal: found.subtotal || found.totalAmount,
                status: formatOrderStatus(found.status || "ORDER_PLACED"),
                itemsCount: found.items?.length || 1,
                shippingAddress: found.shippingAddress || "Delivery Address",
                courierName: "Delhivery Surface Cargo",
                trackingNumber: "DEL-99228811IN",
                trackingUrl: "https://www.delhivery.com",
                isCancelable: true,
                isReturnable: false,
                items: (found.items || []).map((i: any) => ({
                  id: i.id || "item-1",
                  name: i.name || "Hardware Component",
                  sku: i.sku || "PRG-SKU",
                  slug: i.slug || "hardware",
                  quantity: i.quantity || 1,
                  price: i.price || 0,
                  image: i.image || "/placeholder.png",
                })),
              };
            }
          }
        } catch {}
      }

      if (isMounted) {
        setLiveOrder(resolved);
        setLoading(false);
      }
    }

    loadLiveOrder();

    const handleSync = () => {
      loadLiveOrder();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleSync);
      window.addEventListener("prayog_orders_updated", handleSync);
      window.addEventListener("focus", handleSync);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleSync);
        window.removeEventListener("prayog_orders_updated", handleSync);
        window.removeEventListener("focus", handleSync);
      }
    };
  }, [orderId, user?.id, user?.email, router]);

  const order = liveOrder;

  // Request Modals State
  const [modalType, setModalType] = useState<
    "cancel" | "return" | "replacement" | "refund" | null
  >(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [requestSubmittedMessage, setRequestSubmittedMessage] = useState<
    string | null
  >(null);

  // Section 21 Exact Order Timeline Flow:
  // Order Placed -> Payment Confirmed -> Processing -> Packed -> Shipped. Out for Delivery -> Delivered
  const timelineSteps: Array<{ key: string; label: string; sub: string }> = [
    { key: "placed", label: "Order Placed", sub: "Order recorded" },
    { key: "payment", label: "Payment Confirmed", sub: "UPI/Card Verified" },
    { key: "processing", label: "Processing", sub: "Warehouse QA" },
    { key: "packed", label: "Packed", sub: "Tamper-proof Box" },
    {
      key: "shipped_out",
      label: "Shipped · Out for Delivery",
      sub: "Surface/Air Courier",
    },
    { key: "delivered", label: "Delivered", sub: "Doorstep Handover" },
  ];

  const getStepIndex = (status: CustomerOrder["status"]) => {
    const s = (status || "").toLowerCase();
    if (s.includes("deliver") || s.includes("arriv")) return 5;
    if (s.includes("out for delivery") || s.includes("shipped") || s.includes("transit")) return 4;
    if (s.includes("pack")) return 3;
    if (s.includes("process")) return 2;
    if (s.includes("confirm") || s.includes("paid")) return 1;
    return 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-3">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-2xs space-y-4 max-w-lg mx-auto my-8">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          This order does not exist or you do not have permission to view details for this order.
        </p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0A1128] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(order.status);

  // Reorder Handler
  const handleReorder = () => {
    order.items.forEach((item) => {
      const matchProduct =
        PRODUCTS.find((p) => p.sku === item.sku || p.id === item.id) ||
        PRODUCTS[0];
      addToCart(matchProduct, undefined, item.quantity);
    });
    router.push("/cart");
  };

  const handleCancelOrderSubmit = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: requestReason }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestSubmittedMessage(
          data.message ||
            `Order #${order.orderNumber} cancellation has been processed successfully.`,
        );
        if (liveOrder) {
          setLiveOrder({ ...liveOrder, isCancelable: false });
        }
      } else {
        setRequestSubmittedMessage(data.message || "Failed to cancel order.");
      }
    } catch {
      setRequestSubmittedMessage(
        "Network error while processing cancellation.",
      );
    } finally {
      setIsCancelling(false);
      setModalType(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: reviewProduct.id,
          rating: reviewRating,
          title: reviewTitle,
          body: reviewBody,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(data.message || "Review submitted successfully!");
        setTimeout(() => {
          setReviewSuccess(null);
          setReviewProduct(null);
          setReviewTitle("");
          setReviewBody("");
        }, 2000);
      } else {
        setReviewError(data.message || "Failed to submit review.");
      }
    } catch {
      setReviewError("Network error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRequestSubmit = () => {
    setRequestSubmittedMessage(
      `Your ${modalType?.toUpperCase()} request for Order #${order.orderNumber} has been logged with ticket reference. Our support team will respond within 4 business hours.`,
    );
    setModalType(null);
    setRequestReason("");
  };

  const rawStatus = (order.status || "").toLowerCase();
  const isCancelled = rawStatus.includes("cancel");
  const isCancellable =
    !isCancelled &&
    !rawStatus.includes("deliver") &&
    !rawStatus.includes("ship") &&
    !rawStatus.includes("out for delivery") &&
    !rawStatus.includes("return");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 lg:p-7 shadow-2xs space-y-6 text-slate-900 animate-in fade-in duration-300">
      {/* 1. Header with Back link, Order ID, Status, and Actions */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {order.date} • {order.items.length}{" "}
              {order.items.length === 1 ? "item" : "items"} • Total: ₹{order.totalAmount.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/90 text-[#2563EB] text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="View and download GST Tax Invoice"
            >
              <Download className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Download Invoice</span>
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `/api/invoices/${order.id}?format=html&print=true`,
                  "_blank",
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Print Tax Invoice / Save as PDF in new tab"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <a
              href={`https://wa.me/918709789641?text=${encodeURIComponent(`Hi Prayog India, I need help with my Order #${order.orderNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 transition-colors shadow-2xs"
            >
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Cancellation Notice Banner */}
      {rawStatus.includes("cancel") && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 sm:p-5 text-xs text-rose-950 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <h3 className="font-bold text-sm text-rose-900">This Order Has Been Cancelled</h3>
          </div>
          <p className="text-slate-600 leading-relaxed font-normal">
            {(order.paymentMethod || order.paymentMode || "").toLowerCase().includes("cod")
              ? "This Cash on Delivery order was cancelled. No payment was collected."
              : "If you were charged, a refund has been initiated to your original payment method. The refund will reflect in your account within 3–5 business days."}
          </p>
          {((order as any).cancellationReferenceId || (order as any).cancellation?.cancellationReferenceId) && (
            <div className="pt-1 text-[11px] font-mono text-slate-500">
              Cancellation Ref: <strong className="text-slate-800">{(order as any).cancellationReferenceId || (order as any).cancellation?.cancellationReferenceId}</strong>
            </div>
          )}
        </div>
      )}

      {requestSubmittedMessage && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{requestSubmittedMessage}</span>
        </div>
      )}

      {/* 2. Order Progression Timeline (Vertical Stepper: Zero Overlap, Clean & Spacious) */}
      <div className="py-2 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Order Status & Tracking
          </h3>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{order.status}</span>
          </span>
        </div>

        <div className="relative pl-6 space-y-4 py-1.5 before:absolute before:left-2 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.key}
                className="relative flex items-start justify-between gap-3"
              >
                {/* Step Circle / Dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-[#2563EB] text-white ring-4 ring-blue-100"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-white border-2 border-slate-300 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : isCurrent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      isCurrent
                        ? "text-[#2563EB] font-bold"
                        : isCompleted
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.sub}</p>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    Current Status
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Delivery Executive notice and split action bar (Cancel | Chat with us) */}
        {!isCancelled && (
          <div className="mt-4 pt-3.5 border-t border-slate-200/80 -mx-4 sm:-mx-6 lg:-mx-7 font-sans">
            <p className="px-4 sm:px-6 lg:px-7 pb-3 text-xs sm:text-sm text-slate-600 font-medium tracking-tight">
              Delivery partner information will be shared after your order is dispatched for delivery.
            </p>
            <div
              className={`border-t border-slate-200 grid ${
                isCancellable ? "grid-cols-2 divide-x divide-slate-200" : "grid-cols-1"
              } text-center`}
            >
              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="py-3.5 px-3 text-center text-xs sm:text-sm font-bold text-slate-800 hover:text-rose-600 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5 tracking-tight font-sans"
                >
                  <span>Cancel</span>
                </button>
              )}
              <a
                href="https://wa.me/918709789641?text=Hi%20Prayog%20India,%20I%20need%20help%20with%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-3 text-center text-xs sm:text-sm font-bold text-slate-800 hover:text-[#2563EB] hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-2 tracking-tight font-sans"
              >
                <MessageSquare className="w-4 h-4 text-slate-700" />
                <span>Chat with us</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. Ordered Products (Clean List, Direct Product Links) */}
      <div className="py-2 border-b border-slate-100 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Ordered Products ({order.items.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
            >
              <Link
                href={`/products/${item.slug || item.id || item.sku}`}
                className="flex items-center gap-3 min-w-0 group/it cursor-pointer"
              >
                <div className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 p-1 shrink-0 overflow-hidden flex items-center justify-center group-hover/it:border-[#2563EB]/40 transition-colors">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover/it:text-[#2563EB] truncate transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Qty: {item.quantity} • ₹{item.price.toLocaleString("en-IN")} each
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
                {(order.status?.toLowerCase().includes("delivered") || order.status?.toLowerCase().includes("arrived")) && (
                  <button
                    onClick={() =>
                      setReviewProduct({
                        id: item.id || item.sku,
                        name: item.name,
                        image: item.image,
                        sku: item.sku,
                        orderId: order.id,
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer transition-colors"
                  >
                    <Star className="w-3 h-3 fill-[#FFC200] text-[#FFC200]" />
                    <span>Rate & Review</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Delivery & Payment Details (Clean 2-Column Overview) */}
      <div className="py-2 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
        {/* Shipping & Delivery */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
            Delivery Information
          </h4>
          <p className="text-slate-800 leading-relaxed font-medium">
            {order.shippingAddress}
          </p>
          <div className="pt-1 text-[11px] text-slate-600 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.courierName || "Delhivery Surface Cargo"}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex items-center gap-2 pl-5">
                <span className="font-mono text-slate-500">AWB: {order.trackingNumber}</span>
                <a
                  href={order.trackingUrl || "https://www.delhivery.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[#2563EB] hover:underline font-semibold"
                >
                  <span>Track</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
            Payment Summary
          </h4>
          <div className="space-y-1 text-slate-600 font-medium">
            <div className="flex justify-between items-center">
              <span>Payment Mode:</span>
              <span className="font-semibold text-slate-900">
                {(order.paymentMethod || order.paymentMode || "").toLowerCase().includes("cod") || (order.paymentMethod || order.paymentMode || "").toLowerCase().includes("cash on delivery") ? (
                  <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    Cash on Delivery (Pending)
                  </span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    {order.paymentMethod || "UPI / Online"} (Paid)
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{(order.subtotal || Math.round(order.totalAmount * 0.82)).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Shipping:</span>
              <span>FREE Express</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-sm pt-1.5 border-t border-slate-100">
              <span>{(order.paymentMethod || order.paymentMode || "").toLowerCase().includes("cod") || (order.paymentMethod || order.paymentMode || "").toLowerCase().includes("cash on delivery") ? "Total Payable (Due on Delivery):" : "Total Paid:"}</span>
              <span className="text-[#2563EB]">₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Official GST Tax Invoice Card */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Tax Invoice (GST)</p>
                  <p className="text-[10px] text-slate-500">Includes 18% ITC breakdown</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Customer Order Actions */}
      <div className="pt-2">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Contact Support Helpdesk */}
          <Link
            href="/account/support"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#FFC20E]" />
            <span>Support Helpdesk</span>
          </Link>
        </div>
      </div>

      {/* Action Request Modal (Cancel, Return, Replacement, Refund) */}
      {modalType && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setModalType(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
              {modalType === "cancel"
                ? "Cancel Hardware Order"
                : `Request ${modalType.toUpperCase()}`}
            </h3>

            {modalType === "cancel" ? (
              <p className="text-slate-600 leading-relaxed font-semibold">
                Are you sure you want to cancel Order{" "}
                <strong>#{order.orderNumber}</strong>? Your refund will be
                credited back to your original payment method.
              </p>
            ) : (
              <div className="space-y-2">
                <label className="font-extrabold text-slate-700 block">
                  Reason for {modalType}
                </label>
                <textarea
                  required
                  rows={3}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder={`Describe reason for ${modalType} (e.g. damaged in transit, defective sensor, incorrect kit component)...`}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-[#2563EB] font-semibold text-slate-900"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={
                  modalType === "cancel"
                    ? handleCancelOrderSubmit
                    : handleRequestSubmit
                }
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Review Submission Modal */}
      {reviewProduct && (
        <RateAndReviewModal
          isOpen={!!reviewProduct}
          product={reviewProduct}
          onClose={() => setReviewProduct(null)}
          onSuccess={() => {
            setReviewSuccess("Review submitted successfully!");
            setTimeout(() => setReviewSuccess(null), 3000);
          }}
        />
      )}
      {/* 8. Professional Bill & Tax Invoice Modal */}
      {showInvoiceModal && (
        <ProfessionalBillModal
          order={customerOrderToBillOrder(order, user)}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {/* 9. Production-Grade Order Cancellation Modal */}
      {isCancelModalOpen && (
        <OrderCancellationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          order={order}
          onSuccess={(res) => {
            if (liveOrder) {
              setLiveOrder({
                ...liveOrder,
                status: "Cancelled",
                isCancelable: false,
                cancellationReferenceId: res.cancellationReferenceId,
              } as any);
            }
            setIsCancelModalOpen(false);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("prayog_orders_updated"));
            }
          }}
        />
      )}
    </div>
  );
};
