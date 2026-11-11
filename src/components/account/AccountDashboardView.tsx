"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  Heart,
  Award,
  MapPin,
  User,
  ArrowRight,
  Package,
  ChevronRight,
  Check,
  Truck,
} from "lucide-react";
import {
  CustomerOrder,
  MOCK_CUSTOMER_ORDERS,
  MOCK_SAVED_ADDRESSES,
} from "@/data/accountData";

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
    default:
      return (status?.replace(/_/g, " ") as any) || "Order Placed";
  }
}

function getStatusBadgeClass(status: string) {
  const s = status?.toLowerCase() || "";
  if (s.includes("delivered")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
  }
  if (s.includes("shipped") || s.includes("out for delivery")) {
    return "bg-sky-50 text-sky-700 border-sky-200/80";
  }
  if (s.includes("cancelled")) {
    return "bg-rose-50 text-rose-700 border-rose-200/80";
  }
  return "bg-amber-50 text-amber-700 border-amber-200/80";
}

export const AccountDashboardView: React.FC = () => {
  const { user, isLoggedIn, wishlist } = useStore();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [savedAddressesCount, setSavedAddressesCount] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      // 1. Fetch Orders from API
      try {
        const res = await fetch("/api/orders?limit=5");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const items = json.data.items || [];
            const count = typeof json.data.total === "number" ? json.data.total : items.length;
            const mapped: CustomerOrder[] = items.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              date: new Date(o.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              totalAmount: o.totalAmount,
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

            // Also check localStorage for locally placed orders
            let localOrders: CustomerOrder[] = [];
            try {
              const localRaw = localStorage.getItem("prayog_orders_cache");
              if (localRaw) {
                const parsed = JSON.parse(localRaw);
                if (Array.isArray(parsed)) localOrders = parsed;
              }
            } catch {}

            const combined = [...localOrders, ...mapped];

            if (isMounted) {
              setOrders(combined.length > 0 ? combined : MOCK_CUSTOMER_ORDERS);
              setTotalOrders(combined.length > 0 ? combined.length : MOCK_CUSTOMER_ORDERS.length);
            }
          } else {
            if (isMounted) {
              setOrders(MOCK_CUSTOMER_ORDERS);
              setTotalOrders(MOCK_CUSTOMER_ORDERS.length);
            }
          }
        } else {
          if (isMounted) {
            setOrders(MOCK_CUSTOMER_ORDERS);
            setTotalOrders(MOCK_CUSTOMER_ORDERS.length);
          }
        }
      } catch (err) {
        console.warn("Could not load orders for account dashboard:", err);
        if (isMounted) {
          setOrders(MOCK_CUSTOMER_ORDERS);
          setTotalOrders(MOCK_CUSTOMER_ORDERS.length);
        }
      } finally {
        if (isMounted) setOrdersLoading(false);
      }

      // 2. Fetch Saved Addresses Count
      try {
        const addrRes = await fetch("/api/users/me/addresses");
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          if (addrData.success && Array.isArray(addrData.data)) {
            if (isMounted) {
              setSavedAddressesCount(addrData.data.length);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load addresses for dashboard:", err);
      }
    }

    if (isLoggedIn) {
      loadDashboardData();
    } else {
      setOrdersLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 sm:py-20 text-center space-y-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0A1128] flex items-center justify-center mx-auto border border-blue-200/60">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In Required</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Please sign in to access your Prayog customer account, order history,
          addresses, and reward points.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors shadow-sm shadow-blue-500/20"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 text-slate-900 w-full max-w-full">
      {/* ── Mobile-Only User Overview Card ── */}
      <div className="lg:hidden bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#0A1128] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {user?.name
                ? user.name
                    .trim()
                    .split(/\s+/)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "T"}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                Hello, {user?.name || "Customer"}
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || "+91 87097 89641"}
              </p>
            </div>
          </div>
          <Link
            href="/account/profile"
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs shrink-0 transition-colors"
          >
            Edit
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-4 divide-x divide-slate-100 text-center">
          <Link href="/account/orders" className="px-1">
            <span className="text-sm font-extrabold text-slate-900 block">
              {ordersLoading ? "..." : totalOrders}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block truncate">
              Orders
            </span>
          </Link>
          <Link href="/account/wishlist" className="px-1">
            <span className="text-sm font-extrabold text-slate-900 block">
              {wishlist?.length || 0}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block truncate">
              Wishlist
            </span>
          </Link>
          <Link href="/account/rewards" className="px-1">
            <span className="text-sm font-extrabold text-amber-600 block">
              {user?.rewardPoints ?? 1250}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block truncate">
              Points
            </span>
          </Link>
          <Link href="/account/addresses" className="px-1">
            <span className="text-sm font-extrabold text-slate-900 block">
              {savedAddressesCount}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block truncate">
              Address
            </span>
          </Link>
        </div>
      </div>

      {/* ── Unified Orders Section (Zero Cluttered Multi-Cards) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 animate-pulse">
            Loading recent orders...
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {orders.map((ord) => {
              const isDelivered =
                ord.status?.toLowerCase().includes("delivered") ||
                ord.status?.toLowerCase().includes("arrived");
              const isShipped =
                ord.status?.toLowerCase().includes("shipped") ||
                ord.status?.toLowerCase().includes("out for delivery");

              return (
                <Link
                  key={ord.id}
                  href={`/account/orders/${ord.id}`}
                  className="p-3 sm:p-4 hover:bg-slate-50/70 transition-colors block group cursor-pointer"
                >
                  {/* Top Row: Status Icon + Status Text + Amount/Date + Arrow */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Circular Status Icon */}
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
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
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

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  {/* Product Thumbnails: compact, clean row */}
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
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200/80 rounded-2xl space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">
              No orders placed yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
            >
              <span>Browse Products & Start Building</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
