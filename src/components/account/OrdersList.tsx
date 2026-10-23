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
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
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
                  slug: item.product?.slug || item.productId,
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
  }, [router]);

  return (
    <div className="space-y-3.5 text-slate-900 w-full max-w-full overflow-hidden">
      {/* Clean Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
            My Order History
          </h1>
          <p className="text-xs text-slate-500">
            {orders.length} {orders.length === 1 ? "order placed" : "orders placed"}
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
        >
          Browse Products →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-white rounded-xl border border-slate-200 shadow-xs">
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
        <div className="space-y-2.5">
          {orders.map((ord) => {
            const firstItem = ord.items[0];
            const totalQty = ord.items.reduce(
              (acc, it) => acc + (it.quantity || 1),
              0,
            );
            const productHref = firstItem?.slug
              ? `/products/${firstItem.slug}`
              : firstItem?.id
                ? `/products/${firstItem.id}`
                : `/products`;

            return (
              <div
                key={ord.id}
                onClick={() => router.push(`/account/orders/${ord.id}`)}
                className="group bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-[#2563EB]/40 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 sm:gap-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                {/* Left: Product Thumbnail + Order & Item Info */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Thumbnail (Clicking opens product) */}
                  <Link
                    href={productHref}
                    onClick={(e) => e.stopPropagation()}
                    title={`View ${firstItem?.name || "product"} details`}
                    className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-50 border border-slate-200/80 p-1 shrink-0 overflow-hidden flex items-center justify-center hover:border-[#2563EB]/50 transition-colors cursor-pointer"
                  >
                    {firstItem?.image && firstItem.image !== "/placeholder.png" ? (
                      <Image
                        src={firstItem.image}
                        alt={firstItem.name || "Product"}
                        width={44}
                        height={44}
                        className="object-contain"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </Link>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    {/* Top: Order ID & Date */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-xs sm:text-[13px] text-slate-900 whitespace-nowrap group-hover:text-[#2563EB] transition-colors">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap">
                        • {ord.date}
                      </span>
                    </div>

                    {/* Bottom: Product Name (Clicking opens product) & Items Count */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Link
                        href={productHref}
                        onClick={(e) => e.stopPropagation()}
                        title={`View ${firstItem?.name || "product"} details`}
                        className="text-xs text-slate-600 hover:text-[#2563EB] hover:underline font-medium truncate max-w-[130px] sm:max-w-[260px] transition-colors cursor-pointer"
                      >
                        {firstItem?.name || "Order Item"}
                      </Link>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        ({totalQty} {totalQty === 1 ? "item" : "items"}
                        {ord.items.length > 1 && ` +${ord.items.length - 1}`})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Price + Invoice & Chevron */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-slate-900 block leading-tight">
                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `/api/invoices/${ord.id}?format=html&print=true`,
                        "_blank",
                      );
                    }}
                    title="Download / Print Invoice"
                    className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-slate-100 rounded-md border border-slate-200/80 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all p-0.5">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
