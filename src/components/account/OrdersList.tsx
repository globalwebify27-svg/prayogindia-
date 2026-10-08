"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";

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
  const [orders, setOrders] = useState<CustomerOrder[]>(MOCK_CUSTOMER_ORDERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.items && json.data.items.length > 0) {
            const mapped: CustomerOrder[] = json.data.items.map((o: any) => ({
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
                  quantity: item.quantity,
                  price: item.price,
                  image:
                    item.product?.images?.[0]?.imageUrl || "/placeholder.png",
                })) || [],
            }));
            setOrders(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not load customer orders from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-slate-900">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          My Order History
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track shipments, view invoices, and manage past orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">
            You have not placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const statusConfig = getStatusBadgeConfig(ord.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={ord.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 space-y-4 shadow-2xs transition-all"
              >
                {/* Top Order Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {ord.date}
                      </span>
                    </div>
                    {ord.shippingAddress && (
                      <p className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                        Ship to: {ord.shippingAddress}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.className}`}
                    >
                      <StatusIcon className="w-3 h-3 shrink-0" />
                      <span>{ord.status}</span>
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="space-y-2.5">
                  {ord.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 shrink-0">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <Link
                    href={`/account/orders/${ord.id}`}
                    className="bg-slate-50 hover:bg-[#E0F7FC] text-slate-700 hover:text-[#00AEEF] text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200/80"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00AEEF]" />
                    <span>View Details</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `/api/invoices/${ord.id}?format=html&print=true`,
                        "_blank",
                      )
                    }
                    className="text-xs font-semibold text-slate-500 hover:text-[#00AEEF] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Invoice (PDF)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
