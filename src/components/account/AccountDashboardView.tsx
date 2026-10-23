"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  Heart,
  Award,
  MapPin,
  User,
  ArrowRight,
  Package,
} from "lucide-react";
import {
  CustomerOrder,
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

            if (isMounted) {
              setOrders(mapped);
              setTotalOrders(count);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load orders for account dashboard:", err);
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
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-7 lg:p-8 shadow-2xs space-y-5 sm:space-y-8 text-slate-900">
      {/* ── Welcome User Banner Header ── */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50/20 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-sm shadow-[#0A1128]/20">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span>
                {user?.name
                  ? user.name
                      .trim()
                      .split(/\s+/)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "OK"}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              Hello, {user?.name || "Valued Customer"}
            </h1>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        <Link
          href="/account/profile"
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold self-start sm:self-auto shadow-2xs hover:shadow-xs transition-all active:scale-95 inline-flex items-center gap-1.5"
        >
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* ── 4 Summary Cards Grid (2x2 on Mobile, 4 Cols on Desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Orders */}
        <Link
          href="/account/orders"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#0A1128] transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2563EB] group-hover:scale-105 transition-transform shadow-2xs">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 sm:block hidden" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {ordersLoading ? "..." : totalOrders}
            </span>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5 leading-tight">
              Total Orders Placed
            </h4>
          </div>
        </Link>

        {/* Card 2: Wishlist */}
        <Link
          href="/wishlist"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#0A1128] transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform shadow-2xs">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-50" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 sm:block hidden" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {wishlist?.length || 0}
            </span>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5 leading-tight">
              Wishlist Products
            </h4>
          </div>
        </Link>

        {/* Card 3: Reward Points */}
        <Link
          href="/account/rewards"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#0A1128] transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shadow-2xs">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 sm:block hidden" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {user?.rewardPoints ?? 1250}
            </span>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5 leading-tight">
              Available Reward PTS
            </h4>
          </div>
        </Link>

        {/* Card 4: Addresses */}
        <Link
          href="/account/addresses"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#0A1128] transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2563EB] group-hover:scale-105 transition-transform shadow-2xs">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 sm:block hidden" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
              {savedAddressesCount}
            </span>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5 leading-tight">
              Saved Addresses
            </h4>
          </div>
        </Link>
      </div>

      {/* ── Recent Orders Preview ── */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#0A1128]" />
            Recent Hardware Orders
          </h3>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {ordersLoading ? (
            <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
              Loading recent orders...
            </div>
          ) : orders.length > 0 ? (
            orders.slice(0, 3).map((ord) => (
              <Link
                key={ord.id}
                href="/account/orders"
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs block cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900 block truncate group-hover:text-[#2563EB] transition-colors">
                      {ord.orderNumber}
                    </span>
                    <span className="text-slate-400 text-[10px]">•</span>
                    <span className="text-[11px] font-bold text-slate-700">
                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                    {ord.date} {ord.items && ord.items.length > 0 ? `• ${ord.items[0].name}${ord.items.length > 1 ? ` (+${ord.items.length - 1} more)` : ""}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold px-2.5 py-1 rounded-full border text-[11px] ${getStatusBadgeClass(ord.status)}`}>
                    {ord.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center bg-slate-50/60 border border-slate-200/60 rounded-2xl space-y-2">
              <p className="text-xs text-slate-500">No orders placed yet.</p>
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
    </div>
  );
};
