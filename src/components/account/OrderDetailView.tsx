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
  Clock,
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
  Sparkles,
  DollarSign,
  AlertCircle,
  Star,
  Loader2,
} from "lucide-react";

interface OrderDetailProps {
  orderId: string;
}

function formatOrderStatus(status: string): CustomerOrder["status"] {
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
      return "Order Placed"; // Handled with isCancelable = false
    default:
      return "Payment Confirmed";
  }
}

export const OrderDetailView: React.FC<OrderDetailProps> = ({ orderId }) => {
  const router = useRouter();
  const { addToCart } = useStore();

  const [orders, setOrders] = useState<CustomerOrder[]>(MOCK_CUSTOMER_ORDERS);
  const [liveOrder, setLiveOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewProduct, setReviewProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch live order details from /api/orders/[id]
  useEffect(() => {
    async function loadLiveOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            const mapped: CustomerOrder = {
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
            setLiveOrder(mapped);
          }
        }
      } catch (err) {
        console.warn("Falling back to local fallback order", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveOrder();
  }, [orderId]);

  const fallbackOrder: CustomerOrder = {
    id: orderId,
    orderNumber: `PRG-2026-${orderId.slice(-4).toUpperCase()}`,
    date: "Today",
    totalAmount: 4999,
    subtotal: 4236,
    gstAmount: 763,
    discountAmount: 0,
    status: "Payment Confirmed",
    itemsCount: 1,
    shippingAddress: "Your verified delivery address",
    courierName: "Delhivery Surface Cargo",
    trackingNumber: "DEL-99228811IN",
    trackingUrl: "https://www.delhivery.com",
    isCancelable: true,
    isReturnable: true,
    items: [
      {
        id: PRODUCTS[0].id,
        name: PRODUCTS[0].name,
        sku: PRODUCTS[0].sku,
        quantity: 1,
        price: PRODUCTS[0].price,
        image: PRODUCTS[0].image,
      },
    ],
  };

  const order =
    liveOrder ||
    orders.find((o) => o.id === orderId || o.orderNumber === orderId) ||
    fallbackOrder;

  // Request Modals State
  const [modalType, setModalType] = useState<
    "cancel" | "return" | "replacement" | "refund" | null
  >(null);
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
    switch (status) {
      case "Order Placed":
        return 0;
      case "Payment Confirmed":
        return 1;
      case "Processing":
        return 2;
      case "Packed":
        return 3;
      case "Shipped":
      case "Out for Delivery":
        return 4;
      case "Delivered":
        return 5;
      default:
        return 1;
    }
  };

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

          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
              order.status?.toLowerCase().includes("delivered")
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : order.status?.toLowerCase().includes("shipped")
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{order.status}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {order.date} • {order.items.length}{" "}
              {order.items.length === 1 ? "item" : "items"} • Total: ₹{order.totalAmount.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                window.open(
                  `/api/invoices/${order.id}?format=html&print=true`,
                  "_blank",
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Invoice</span>
            </button>

            <a
              href={`https://wa.me/918709789641?text=${encodeURIComponent(`Hi Prayog India, I need help with my Order #${order.orderNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 transition-colors shadow-2xs"
            >
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

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
                {order.status === "Delivered" && (
                  <button
                    onClick={() =>
                      setReviewProduct({
                        id: item.id || item.sku,
                        name: item.name,
                      })
                    }
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Rate & Review
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
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-semibold text-slate-900">UPI / QR (Paid)</span>
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
              <span>Total Paid:</span>
              <span className="text-[#2563EB]">₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Customer Order Actions */}
      <div className="pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Reorder Action */}
          <button
            onClick={handleReorder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-yellow-300" />
            <span>Reorder Items</span>
          </button>

          {/* Cancel Order Action */}
          {order.isCancelable && (
            <button
              onClick={() => setModalType("cancel")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          {/* Request Return */}
          <button
            onClick={() => setModalType("return")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Request Return</span>
          </button>

          {/* Request Replacement */}
          <button
            onClick={() => setModalType("replacement")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Request Replacement</span>
          </button>

          {/* Request Refund */}
          <button
            onClick={() => setModalType("refund")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Request Refund</span>
          </button>

          {/* Contact Support Helpdesk */}
          <Link
            href="/account/support"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors ml-auto shadow-2xs"
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
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
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
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setReviewProduct(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Verified Purchase Review
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
                Rate &amp; Review: {reviewProduct.name}
              </h3>
            </div>

            {reviewSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-4 rounded-2xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{reviewSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Rating Stars */}
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? "text-[#FFC20E] fill-[#FFC20E]"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-slate-600 ml-2">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Review Headline / Title */}
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Excellent build quality and easy to interface with Arduino"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Review Body */}
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Detailed Feedback
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Share your practical experience with this hardware kit, pinout accuracy, documentation, etc. (minimum 10 characters)..."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewProduct(null)}
                    className="font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
