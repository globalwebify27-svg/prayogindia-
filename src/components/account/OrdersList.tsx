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
  ArrowRight,
  Loader2,
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
              items: o.items?.map((item: any) => ({
                id: item.productId,
                name: item.productName,
                sku: item.productSku,
                quantity: item.quantity,
                price: item.price,
                image: item.product?.images?.[0]?.imageUrl || "/placeholder.png",
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
        <p className="text-xs text-slate-500">
          Track current hardware shipments, view GST tax invoices, and reorder
          STEM supplies.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-bold">
            You have not placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs"
            >
              {/* Top Order Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      • {ord.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold truncate max-w-md">
                    Ship to: {ord.shippingAddress}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-black px-3 py-1 rounded-full border border-[#00AEEF]/20 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> {ord.status}
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    ₹{ord.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="space-y-3">
                {ord.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shrink-0">
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
                        <span className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.sku} | Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                <Link
                  href={`/account/orders/${ord.id}`}
                  className="bg-white border border-slate-200 hover:border-[#00AEEF] text-slate-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4 text-[#00AEEF]" />
                  <span>View Details & Timeline</span>
                </Link>

                <button
                  onClick={() =>
                    window.open(
                      `/api/invoices/${ord.id}?format=html&print=true`,
                      "_blank",
                    )
                  }
                  className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> Download Tax Invoice
                  (PDF)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
