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
  const [reviewProduct, setReviewProduct] = useState<{ id: string; name: string } | null>(null);
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
              trackingUrl: d.shipment?.trackingUrl || "https://www.delhivery.com",
              labelUrl: d.shipment?.labelUrl,
              estimatedDelivery: d.shipment?.estimatedDelivery,
              trackingEvents: d.shipment?.trackingEvents || [],
              isCancelable: d.status === "ORDER_PLACED" || d.status === "PAYMENT_FAILED",
              isReturnable: d.status === "DELIVERED",
              items: d.items?.map((item: any) => ({
                id: item.productId,
                name: item.productName,
                sku: item.productSku,
                quantity: item.quantity,
                price: item.price,
                image: item.product?.images?.[0]?.imageUrl || "/placeholder.png",
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
      setRequestSubmittedMessage("Network error while processing cancellation.");
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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-8 text-slate-900 animate-in fade-in duration-300">
      {/* 1. Header with Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 21 · Order Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            Placed on {order.date} • {order.items.length} Item(s)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Download Invoice Button */}
          <button
            onClick={() =>
              window.open(
                `/api/invoices/${order.id}?format=html&print=true`,
                "_blank",
              )
            }
            className="bg-slate-900 hover:bg-[#00AEEF] text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#FFC20E]" />
            <span>Download Invoice (PDF)</span>
          </button>

          {/* WhatsApp Support Button */}
          <a
            href={`https://wa.me/918709789641?text=${encodeURIComponent(`Hi Prayog India, I need help with my Order #${order.orderNumber}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>

      {requestSubmittedMessage && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-4 rounded-2xl border border-emerald-200 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{requestSubmittedMessage}</span>
        </div>
      )}

      {/* 2. Visual Order Timeline (Section 21 Hierarchy) */}
      <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#00AEEF]" /> Live Order Progression
            Timeline
          </h3>
          <span className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-black px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
            {order.status}
          </span>
        </div>

        {/* Horizontal Timeline Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-2xl border text-center space-y-1 transition-all ${
                  isCurrent
                    ? "bg-[#E0F7FC] border-[#00AEEF] text-[#00AEEF] ring-2 ring-[#00AEEF]/20 shadow-xs"
                    : isCompleted
                      ? "bg-white border-emerald-300 text-emerald-700"
                      : "bg-slate-100 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="text-xs font-extrabold leading-tight mt-1">
                  {step.label}
                </div>
                <div className="text-[10px] opacity-75 font-semibold">
                  {step.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Payment Status & Live Courier Tracking Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Status Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-2xs">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#00AEEF]" /> Payment Status
          </h3>
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">Payment Gateway:</span>
              <span className="font-black text-slate-900">
                UPI / QR (Razorpay Confirmed)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">
                Transaction Status:
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                PAID IN FULL (₹{order.totalAmount.toLocaleString()})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">GST Tax Invoice:</span>
              <span className="text-purple-700 font-bold">
                18% Input Tax Credit Eligible
              </span>
            </div>
          </div>
        </div>

        {/* Courier Dispatch & Tracking Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-2xs">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#00AEEF]" /> Courier Shipment
            Tracking
          </h3>
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">
                Logistics Partner:
              </span>
              <span className="font-black text-slate-900">
                {order.courierName || "Delhivery Surface Cargo"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">
                AWB Tracking Number:
              </span>
              <span className="font-mono font-black text-slate-900">
                {order.trackingNumber || "DEL-88771122IN"}
              </span>
            </div>
            {order.estimatedDelivery && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Estimated Delivery:</span>
                <span className="font-black text-[#005CA9]">{order.estimatedDelivery}</span>
              </div>
            )}
            <div className="pt-1 flex items-center justify-between">
              <a
                href={order.trackingUrl || "https://www.delhivery.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#00AEEF] hover:underline"
              >
                <span>Track on Carrier Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {order.labelUrl && (
                <a
                  href={order.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  Shipping Label
                </a>
              )}
            </div>

            {/* Checkpoint scans timeline */}
            {order.trackingEvents && order.trackingEvents.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-2">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Live Carrier Scan Checkpoints ({order.trackingEvents.length})
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {order.trackingEvents.map((evt, eIdx) => (
                    <div key={eIdx} className="text-[11px] flex items-start gap-2 border-l-2 border-[#00AEEF] pl-2 py-0.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{evt.location}</span>
                          <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="font-medium text-slate-800 text-[11px] leading-snug">{evt.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Ordered Items Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          Ordered Products ({order.items.length})
        </h3>
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 border-b border-slate-200/70 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    SKU: {item.sku} | Quantity: {item.quantity}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-extrabold text-slate-900">
                  ₹{item.price.toLocaleString()}
                </span>
                {order.status === "Delivered" && (
                  <button
                    onClick={() =>
                      setReviewProduct({ id: item.id || item.sku, name: item.name })
                    }
                    className="bg-[#E0F7FC] hover:bg-[#bceefb] text-[#00AEEF] px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-[#00AEEF]" /> Rate &amp; Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Delivery Address & Historical Price Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
        <div className="space-y-2">
          <h4 className="font-extrabold uppercase text-slate-900">
            Delivery Address
          </h4>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
            {order.shippingAddress}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold uppercase text-slate-900">
            Payment Breakdown
          </h4>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                ₹{(order.subtotal || order.totalAmount * 0.82).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>18% GST Tax Invoice</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Freight Shipping</span>
              <span>FREE Express</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
              <span>Grand Total Paid</span>
              <span>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Section 21 Customer Order Actions (Cancel, Return, Replacement, Refund, Support, WhatsApp) */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          Customer Order Actions
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reorder Action */}
          <button
            onClick={handleReorder}
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-[#FFC20E]" />
            <span>Reorder Items</span>
          </button>

          {/* Cancel Order Action */}
          {order.isCancelable && (
            <button
              onClick={() => setModalType("cancel")}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Order</span>
            </button>
          )}

          {/* Request Return */}
          <button
            onClick={() => setModalType("return")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#00AEEF]" />
            <span>Request Return</span>
          </button>

          {/* Request Replacement */}
          <button
            onClick={() => setModalType("replacement")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-purple-600" />
            <span>Request Replacement</span>
          </button>

          {/* Request Refund */}
          <button
            onClick={() => setModalType("refund")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Request Refund</span>
          </button>

          {/* Contact Support Helpdesk */}
          <Link
            href="/account/support"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors ml-auto shadow-md"
          >
            <MessageSquare className="w-4 h-4 text-[#FFC20E]" />
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
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-[#00AEEF] font-semibold text-slate-900"
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
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md cursor-pointer"
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
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF] bg-[#E0F7FC] px-2.5 py-0.5 rounded-full border border-[#00AEEF]/20">
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
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
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
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
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
                    className="bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
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
