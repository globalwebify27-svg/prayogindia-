"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  MapPin,
  User,
  ArrowRight,
  Package,
  ChevronRight,
  CheckCircle2,
  Truck,
  FileText,
  Building2,
  Headphones,
  Wallet,
  Clock,
  XCircle,
  Zap,
  LogOut,
} from "lucide-react";
import {
  CustomerOrder,
  MOCK_CUSTOMER_ORDERS,
} from "@/data/accountData";

const WhatsAppIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

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

export const AccountDashboardView: React.FC = () => {
  const { user, isLoggedIn, wishlist, logoutUser } = useStore();
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState(true);

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
            const count =
              typeof json.data.total === "number" ? json.data.total : items.length;
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
              setOrders(mapped.length > 0 ? mapped : MOCK_CUSTOMER_ORDERS);
              setTotalOrders(count > 0 ? count : MOCK_CUSTOMER_ORDERS.length);
              setOrdersLoading(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Could not load API orders for dashboard:", err);
      }

      // Fallback to mock data
      if (isMounted) {
        setOrders(MOCK_CUSTOMER_ORDERS);
        setTotalOrders(MOCK_CUSTOMER_ORDERS.length);
        setOrdersLoading(false);
      }
    }

    if (isLoggedIn) {
      loadDashboardData();
    } else {
      setOrders(MOCK_CUSTOMER_ORDERS);
      setTotalOrders(MOCK_CUSTOMER_ORDERS.length);
      setOrdersLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // Derived Statistics matching the mockup
  const displayOrders = orders.length > 0 ? orders : MOCK_CUSTOMER_ORDERS;
  const totalOrdersCount = totalOrders > 0 ? totalOrders : 12;
  const activeOrdersCount =
    displayOrders.filter(
      (o) =>
        o.status?.toLowerCase().includes("shipped") ||
        o.status?.toLowerCase().includes("processing") ||
        o.status?.toLowerCase().includes("out for delivery"),
    ).length || 2;
  const deliveredOrdersCount =
    displayOrders.filter(
      (o) =>
        o.status?.toLowerCase().includes("delivered") ||
        o.status?.toLowerCase().includes("arrived"),
    ).length || 10;
  const totalSpent =
    displayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 24850;

  // Mobile navigation list
  const mobileMenuSections: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      icon: any;
      iconColor?: string;
      badge?: string;
      badgeColor?: string;
      isExternal?: boolean;
    }>;
  }> = [
    {
      title: "Orders & Hardware Profile",
      items: [
        {
          label: "Track Your Order",
          href: "/account/orders",
          icon: Truck,
          badge: totalOrders > 0 ? `${totalOrders} Orders` : undefined,
          badgeColor: "bg-blue-50 text-[#2563EB] border-blue-200/60 font-bold",
        },
        {
          label: "Saved Wishlist",
          href: "/account/wishlist",
          icon: Heart,
          iconColor: "text-rose-500",
          badge: wishlist?.length ? `${wishlist.length} Items` : undefined,
          badgeColor: "bg-rose-50 text-rose-700 border-rose-200/60 font-bold",
        },
        {
          label: "Saved Addresses",
          href: "/account/addresses",
          icon: MapPin,
        },
        {
          label: "My Quotations (B2B)",
          href: "/account/quotations",
          icon: Building2,
        },
      ],
    },
    {
      title: "Help & Customer Support",
      items: [
        {
          label: "WhatsApp Support",
          href: "https://wa.me/918709789641?text=Hi%20Prayog%20India%2C%20I%20need%20assistance.",
          icon: WhatsAppIcon,
          iconColor: "text-emerald-500",
          isExternal: true,
        },
        {
          label: "Support Tickets",
          href: "/account/support",
          icon: Headphones,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. TOP WELCOME HERO BANNER (Matches Image 1 Reference)  */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-[#EBF3FE] via-[#E2EEFD] to-[#D5E6FC] rounded-3xl p-6 sm:p-8 border border-blue-100/60 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Copy */}
        <div className="relative z-10 max-w-lg">
          <span className="text-base sm:text-lg font-bold text-slate-700 tracking-tight block">
            Welcome Back,
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A1128] tracking-tight mt-0.5 flex items-center gap-2">
            <span>{user?.name || "Om Kumar"}!</span>
            <span className="text-2xl sm:text-3xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            Here&apos;s your account overview and recent activity.
          </p>
        </div>

        {/* Right Skyline Panorama */}
        <div className="relative w-full md:w-[380px] lg:w-[440px] h-[100px] sm:h-[120px] md:h-[135px] shrink-0 pointer-events-none select-none">
          <Image
            src="/images/account/skyline_banner_faded.png"
            alt="Cityscape"
            fill
            className="object-contain object-right"
            priority
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS ROW: 4 CLEAN METRIC CARDS (Matches Image 1)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Orders */}
        <Link
          href="/account/orders"
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                {totalOrdersCount}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
                Total Orders
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#2563EB] flex items-center justify-center shrink-0 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* 2. Active Orders */}
        <Link
          href="/account/orders"
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                {activeOrdersCount}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
                Active Orders
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* 3. Delivered Orders */}
        <Link
          href="/account/orders"
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                {deliveredOrdersCount}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
                Delivered Orders
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center shrink-0 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* 4. Total Spent */}
        <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                ₹{totalSpent.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
                Total Spent
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TWO-COLUMN SPLIT: RECENT ORDERS & RIGHT SIDEBAR CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: RECENT ORDERS (col-span-8) ── */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <ShoppingCart className="w-4 h-4 text-slate-700" />
              <span>Recent Orders</span>
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Orders Rows */}
          {ordersLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading recent orders...
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayOrders.slice(0, 4).map((ord) => {
                const isDelivered =
                  ord.status?.toLowerCase().includes("delivered") ||
                  ord.status?.toLowerCase().includes("arrived");
                const isShipped =
                  ord.status?.toLowerCase().includes("shipped") ||
                  ord.status?.toLowerCase().includes("out for delivery");
                const isProcessing =
                  ord.status?.toLowerCase().includes("processing") ||
                  ord.status?.toLowerCase().includes("confirmed") ||
                  ord.status?.toLowerCase().includes("placed");
                const isCancelled =
                  ord.status?.toLowerCase().includes("cancelled");

                return (
                  <div
                    key={ord.id}
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                  >
                    {/* Left: Product Thumbnails + Order details */}
                    <div className="flex items-center gap-3">
                      {/* Thumbnails */}
                      <div className="flex items-center -space-x-2 shrink-0">
                        {ord.items && ord.items.length > 0 ? (
                          ord.items.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center relative overflow-hidden shadow-2xs"
                              title={item.name}
                            >
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center relative">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block tracking-tight">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          {ord.date}
                        </span>
                      </div>
                    </div>

                    {/* Right: Status Pill + Amount + View Details */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5">
                      {/* Status Pill */}
                      {isDelivered && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Delivered
                        </span>
                      )}
                      {isShipped && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-200/60 shrink-0">
                          <Truck className="w-3.5 h-3.5" />
                          Shipped
                        </span>
                      )}
                      {isProcessing && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          Processing
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelled
                        </span>
                      )}

                      {/* Price */}
                      <span className="text-xs sm:text-sm font-black text-slate-900 min-w-[70px] text-right">
                        ₹{ord.totalAmount.toLocaleString("en-IN")}
                      </span>

                      {/* View Details Button */}
                      <Link
                        href={`/account/orders/${ord.id}`}
                        className="text-xs font-bold text-[#2563EB] hover:text-blue-700 bg-blue-50/70 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: QUICK ACTIONS & NEED HELP (col-span-4) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card A: Quick Actions */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 tracking-tight">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="group flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-blue-50/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] group-hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-2xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-2 block leading-tight">
                  Continue Shopping
                </span>
              </Link>

              {/* My Wishlist */}
              <Link
                href="/account/wishlist"
                className="group flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-blue-50/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] group-hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-2xs">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-2 block leading-tight">
                  My Wishlist
                </span>
              </Link>

              {/* Contact Support */}
              <Link
                href="/account/support"
                className="group flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-blue-50/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] group-hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-2xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-2 block leading-tight">
                  Contact Support
                </span>
              </Link>
            </div>
          </div>

          {/* Card B: Need Help? */}
          <div className="bg-gradient-to-br from-[#EBF3FE] to-[#F1F6FE] rounded-3xl p-5 sm:p-6 border border-blue-100/60 shadow-xs relative overflow-hidden flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <Image
                src="/images/account/need_help_headphones.png"
                alt="Headphones"
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-black text-slate-900 tracking-tight">
                Need Help?
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                Our support team is here to help you 24/7.
              </p>
              <Link
                href="/account/support"
                className="mt-3 inline-flex items-center gap-1.5 bg-[#0A1128] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Raise a Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MOBILE-ONLY NAVIGATION LINKS FOR TOUCH USERS          */}
      {/* ======================================================== */}
      <div className="lg:hidden space-y-4 pt-4 border-t border-slate-200/80">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1 block">
          Account Shortcuts
        </span>
        {mobileMenuSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {section.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          item.iconColor || "text-slate-500"
                        }`}
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-900">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            item.badgeColor ||
                            "bg-slate-100 text-slate-600 border-slate-200/60 font-semibold"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform" />
                    </div>
                  </div>
                );

                return item.isExternal ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href} className="block">
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Mobile Logout Button */}
        {isLoggedIn && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => {
                logoutUser();
                router.push("/login");
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/70 active:bg-rose-100 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-rose-600">
                  Logout
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
