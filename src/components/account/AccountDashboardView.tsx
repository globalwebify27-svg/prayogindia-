"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  FileText,
  CreditCard,
  Building2,
  HelpCircle,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Building,
  Wrench,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import {
  CustomerOrder,
  MOCK_CUSTOMER_ORDERS,
  MOCK_SAVED_ADDRESSES,
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

      // 2. Fetch Addresses count
      try {
        const addrRes = await fetch("/api/users/me/addresses");
        if (addrRes.ok) {
          const addrJson = await addrRes.json();
          if (addrJson.success && Array.isArray(addrJson.data) && isMounted) {
            setSavedAddressesCount(addrJson.data.length || 1);
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

  // Mobile Menu List Sections for Easy, Intuitive Flow
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
          label: "Reward Program",
          href: "/account/rewards",
          icon: Award,
          iconColor: "text-amber-500",
          badge: `${user?.rewardPoints ?? 1250} Pts`,
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200/60 font-bold",
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
          label: "Payment Methods & Net-30",
          href: "/account/payments",
          icon: CreditCard,
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
          iconColor: "text-[#25D366]",
          badge: "+91 87097 89641",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60 font-bold",
          isExternal: true,
        },
        {
          label: "Raise a Concern",
          href: "/account/support",
          icon: ShieldAlert,
        },
        {
          label: "FAQ",
          href: "/contact",
          icon: HelpCircle,
        },
        {
          label: "Refund policy",
          href: "/returns",
          icon: RotateCcw,
        },
        {
          label: "Shipping",
          href: "/shipping",
          icon: Package,
        },
      ],
    },
    {
      title: "Company & Policies",
      items: [
        {
          label: "Privacy policy",
          href: "/privacy",
          icon: ShieldCheck,
        },
        {
          label: "Terms of service",
          href: "/terms",
          icon: FileText,
        },
        {
          label: "Warranty & Lab Services",
          href: "/warranty",
          icon: Wrench,
        },
        {
          label: "About Us",
          href: "/about",
          icon: Building,
        },
      ],
    },
  ];

  return (
    <div className="w-full max-w-full text-slate-900">
      {/* ======================================================== */}
      {/* ── MOBILE VIEW: Robocraze-Style List Menu (Images 1 & 2) ── */}
      {/* ======================================================== */}
      <div className="lg:hidden space-y-4 pb-6">
        {/* User Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Circular Avatar */}
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                {isLoggedIn && user?.name ? (
                  user.name
                    .trim()
                    .split(/\s+/)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>

              {/* User Name & Details */}
              <div className="min-w-0">
                <h1 className="text-sm font-extrabold text-slate-900 truncate">
                  {isLoggedIn ? user?.name || "Tux" : "New User"}
                </h1>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isLoggedIn
                    ? user?.email || user?.phone || "+91 87097 89641"
                    : "Welcome to Prayog India"}
                </p>
              </div>
            </div>

            {/* Action Button: Edit Profile or Sign In */}
            {isLoggedIn ? (
              <Link
                href="/account/profile"
                className="bg-[#0A1128] hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Edit
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#0A1128] hover:bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Quick-Action Touch Navigation Tiles (If logged in) */}
          {isLoggedIn && (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-2 text-center">
              <Link
                href="/account/orders"
                className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/60 active:scale-95 transition-all block"
              >
                <span className="text-sm font-black text-slate-900 block">
                  {ordersLoading ? "..." : totalOrders}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block truncate mt-0.5">
                  Orders
                </span>
              </Link>
              <Link
                href="/account/wishlist"
                className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/60 active:scale-95 transition-all block"
              >
                <span className="text-sm font-black text-slate-900 block">
                  {wishlist?.length || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block truncate mt-0.5">
                  Wishlist
                </span>
              </Link>
              <Link
                href="/account/rewards"
                className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/60 active:scale-95 transition-all block"
              >
                <span className="text-sm font-black text-amber-600 block">
                  {user?.rewardPoints ?? 1250}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block truncate mt-0.5">
                  Points
                </span>
              </Link>
              <Link
                href="/account/addresses"
                className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/60 active:scale-95 transition-all block"
              >
                <span className="text-sm font-black text-slate-900 block">
                  {savedAddressesCount}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block truncate mt-0.5">
                  Addresses
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Sectioned Clean White List Menus for Seamless Flow */}
        {mobileMenuSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              {section.title}
            </span>
            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {section.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 active:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          item.iconColor || "text-slate-700"
                        }`}
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-slate-900 truncate">
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
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
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

        {/* Logout Row Card (if logged in) */}
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
              <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Footer Branding (Matching Image 2 Reference) */}
        <div className="py-6 text-center space-y-1 select-none">
          <p className="text-xs font-bold text-slate-400 tracking-wider">
            Prayog India
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            v2.0 • The World of Robotics
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ── DESKTOP VIEW: Blinkit-Style Orders Dashboard ── */}
      {/* ======================================================== */}
      <div className="hidden lg:block space-y-4">
        {/* Desktop Header */}
        <div className="flex items-center justify-between px-0.5 pb-1">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500">
              Track active hardware dispatches and view order history.
            </p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
          >
            <span>View all orders ({totalOrders})</span>
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
                  className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors block group cursor-pointer"
                >
                  {/* Top Row: Status Icon + Status Text + Amount/Date + Arrow */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
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
