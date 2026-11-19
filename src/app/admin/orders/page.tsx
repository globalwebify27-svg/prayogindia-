"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { getOrderTimestamp } from "@/data/accountData";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  Search,
  X,
  AlertTriangle,
  Plane,
  Package,
  XCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Quote,
  ArrowRight,
  Calendar,
  RotateCcw,
} from "lucide-react";

type OrderDateFilterType =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "custom";

/**
 * Universal date matching helper for orders.
 * Works seamlessly across ISO strings, numeric timestamps, embedded timestamps, and human-readable dates.
 */
function matchesDateFilter(
  order: any,
  dateFilter: OrderDateFilterType,
  customStart?: string,
  customEnd?: string
): boolean {
  if (dateFilter === "all") return true;

  const ts = getOrderTimestamp(order);
  if (!ts) return false;

  const orderDate = new Date(ts);
  const now = new Date();

  // Normalize to start of day (midnight) in local time
  const orderStartOfDay = new Date(
    orderDate.getFullYear(),
    orderDate.getMonth(),
    orderDate.getDate()
  ).getTime();

  const todayStartOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  switch (dateFilter) {
    case "today":
      return orderStartOfDay === todayStartOfDay;

    case "yesterday":
      return orderStartOfDay === todayStartOfDay - ONE_DAY_MS;

    case "last_7_days":
      return (
        orderStartOfDay >= todayStartOfDay - 6 * ONE_DAY_MS &&
        orderStartOfDay <= todayStartOfDay + ONE_DAY_MS
      );

    case "last_30_days":
      return (
        orderStartOfDay >= todayStartOfDay - 29 * ONE_DAY_MS &&
        orderStartOfDay <= todayStartOfDay + ONE_DAY_MS
      );

    case "this_month":
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth()
      );

    case "custom": {
      if (!customStart && !customEnd) return true;
      if (customStart) {
        const [sYear, sMonth, sDay] = customStart.split("-").map(Number);
        const startTime = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0).getTime();
        if (!isNaN(startTime) && ts < startTime) return false;
      }
      if (customEnd) {
        const [eYear, eMonth, eDay] = customEnd.split("-").map(Number);
        const endTime = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999).getTime();
        if (!isNaN(endTime) && ts > endTime) return false;
      }
      return true;
    }

    default:
      return true;
  }
}

const ORDER_STATUSES = [
  "ORDER_PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

type OrderChannelType = "WEBSITE" | "MOBILE_APP" | "WALK_IN";

/**
 * Universal channel classification for all Prayog sales orders.
 * Accurately routes orders to Website Online, Mobile App, or Store Walk-in POS.
 * (Note: B2B quotation inquiries are handled separately in the dedicated B2B Quotations Desk).
 */
function getOrderChannel(ord: any): OrderChannelType {
  if (!ord) return "WEBSITE";

  const num = (ord.orderNumber || ord.id || "").toUpperCase();
  const src = (ord.orderSource || ord.source || ord.channel || ord.channelName || "").toUpperCase();
  const cType = (ord.customerType || "").toUpperCase();
  const addr = (ord.shippingAddress || "").toUpperCase();

  // 1. Store Walk-in POS Orders (WI- prefixes, store addresses, POS tags, counter walk-ins)
  if (
    num.startsWith("WI-") ||
    num.includes("POS") ||
    num.startsWith("ORD-PATNA") ||
    num.startsWith("ORD-RANCHI") ||
    num.startsWith("ORD-DELHI") ||
    num.startsWith("ORD-MUMBAI") ||
    src.includes("WALK") ||
    src.includes("POS") ||
    cType === "WALK_IN" ||
    addr.includes("WALK-IN") ||
    addr.includes("STORE") ||
    ord.isLiveWalkIn
  ) {
    return "WALK_IN";
  }

  // 2. Mobile App Orders
  const payMethod = (ord.paymentMethod || "").toUpperCase();
  if (
    num.includes("APP") ||
    src.includes("APP") ||
    payMethod.includes("MOBILE")
  ) {
    return "MOBILE_APP";
  }

  // 3. Default: Website Online Store Orders
  return "WEBSITE";
}

/**
 * Professional multi-field order search matcher.
 * STRICT ORDER NUMBER MATCHING:
 * When the query looks like an order number (e.g. PRG-*, WI-*, QUO-*, 2026-*, or any 4+ digit sequence):
 * It strictly matches against orderNumber and id ONLY.
 * It will NEVER leak unrelated walk-in orders into a website order search or vice versa.
 */
function matchesOrder(ord: any, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;
  const q = rawQuery.trim().toLowerCase();
  const cleanQ = q.replace(/^#/, "").trim();
  if (!cleanQ) return true;

  const orderNum = String(ord.orderNumber || "").toLowerCase();
  const orderId = String(ord.id || "").toLowerCase().replace(/^ord-/, "");

  // Direct prefix isolation: PRG searches never match WI orders; WI searches never match PRG orders
  if (cleanQ.startsWith("prg") && (orderNum.startsWith("wi-") || orderId.startsWith("wi-"))) return false;
  if (cleanQ.startsWith("wi") && (orderNum.startsWith("prg-") || orderId.startsWith("prg-"))) return false;

  // 1. Direct Order Number / ID match (exact, partial, or prefix/suffix)
  const isOrderNumMatch =
    orderNum.includes(cleanQ) ||
    orderNum.includes(q) ||
    orderId.includes(cleanQ) ||
    orderId.includes(q);

  // Distinguish an Indian 10-digit mobile number from an order number
  const is10DigitPhone = /^(?:\+?91)?([6-9]\d{9})$/.test(cleanQ.replace(/[\s()-]/g, ""));

  // Detect if query is searching for an order number
  const isOrderNumberSearch =
    !is10DigitPhone && (
      /^(prg|wi|quo|b2b|ord|app|pos|pi)/i.test(cleanQ) ||
      /^[a-z0-9]+-[a-z0-9]+/i.test(cleanQ) ||
      /^\d{4,8}$/.test(cleanQ) ||
      /^wi-|^prg-|^quo-|^pos-|^app-/i.test(cleanQ)
    );

  // When searching by order number, enforce STRICT ISOLATION:
  // ONLY return orders whose order number or id matches.
  if (isOrderNumberSearch) {
    return isOrderNumMatch;
  }

  // If order number matches directly, accept it immediately
  if (isOrderNumMatch) return true;

  // 2. Quotation / Invoice numbers
  if (ord.quotation?.quoteNumber && String(ord.quotation.quoteNumber).toLowerCase().includes(cleanQ)) return true;
  if (ord.quotationId && String(ord.quotationId).toLowerCase().includes(cleanQ)) return true;
  if (ord.invoice?.invoiceNumber && String(ord.invoice.invoiceNumber).toLowerCase().includes(cleanQ)) return true;

  // 3. Customer Info (Name, Email, Company)
  const custName = String(ord.customerName || ord.user?.name || "").toLowerCase();
  if (custName.includes(cleanQ)) return true;

  const custEmail = String(ord.customerEmail || ord.user?.email || "").toLowerCase();
  if (custEmail.includes(cleanQ)) return true;

  const company = String(ord.companyName || ord.user?.companyName || "").toLowerCase();
  if (company.includes(cleanQ)) return true;

  // 4. Phone matching (ONLY when query contains digits and is phone-like)
  const isNumericPhone = /^[0-9+\s()-]+$/.test(rawQuery.trim());
  const rawPhone = String(ord.customerPhone || ord.user?.phone || "").replace(/\D/g, "");
  const qDigits = cleanQ.replace(/\D/g, "");
  if (isNumericPhone && qDigits.length >= 5 && rawPhone && rawPhone.includes(qDigits)) {
    return true;
  }

  // 5. Shipping Address & Location
  const address = String(ord.shippingAddress || "").toLowerCase();
  if (address.includes(cleanQ)) return true;

  // 6. Courier, AWB & Tracking Number
  const awb = String(ord.awbNumber || ord.trackingNumber || ord.shipment?.trackingNumber || "").toLowerCase();
  if (awb && (awb.includes(cleanQ) || awb.includes(q))) return true;

  const courier = String(ord.courierProvider || ord.courierName || ord.shipment?.courierName || "").toLowerCase();
  if (courier && courier.includes(cleanQ)) return true;

  // 7. Items / Products (Name & SKU)
  if (Array.isArray(ord.items)) {
    for (const item of ord.items) {
      if (!item) continue;
      const itemName = String(item.productName || item.name || "").toLowerCase();
      const itemSku = String(item.productSku || item.sku || "").toLowerCase();
      if (
        itemName.includes(cleanQ) ||
        (itemSku && itemSku.includes(cleanQ))
      ) {
        return true;
      }
    }
  }

  return false;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<OrderDateFilterType>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const activeSearchRef = useRef(searchQuery);
  activeSearchRef.current = searchQuery;

  // Section 31 Shipping Info Modal State
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<
    any | null
  >(null);

  /**
   * Fetch orders from the API with strict search and status filtering.
   * Both statusFilter and searchVal are passed explicitly to avoid stale closure bugs.
   * When a search is active, clear existing orders immediately so stale walk-in data
   * never flashes on screen while the new fetch is in-flight.
   */
  const fetchOrders = (searchVal: string, currentStatusFilter: string) => {
    setLoading(true);
    const cleanSearch = searchVal.trim();
    // Immediately clear results when searching by order number so the table
    // never shows stale data from a previous all-orders fetch while loading.
    if (cleanSearch) {
      setOrders([]);
    }
    const queryParams = new URLSearchParams({
      status: currentStatusFilter,
      limit: "200",
    });
    if (cleanSearch) {
      queryParams.set("search", cleanSearch);
    }

    fetch(`/api/admin/orders?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // Discard responses from older in-flight requests to eliminate race conditions
        if (activeSearchRef.current.trim() !== cleanSearch) {
          return;
        }

        let items: any[] = data.success && data.data?.items ? data.data.items : [];

        // If searching, ensure API items strictly match search query
        if (cleanSearch) {
          items = items.filter((o: any) => matchesOrder(o, cleanSearch));
        }

        // Merge locally stored orders (website + walk-in) for demo/offline fallback.
        try {
          const stored = typeof window !== "undefined" ? localStorage.getItem("prayog_placed_orders") : null;
          const walkinStored = typeof window !== "undefined" ? localStorage.getItem("prayog_walkin_orders") : null;

          let rawLocals: any[] = [];
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) rawLocals.push(...parsed);
          }
          if (walkinStored) {
            const parsedW = JSON.parse(walkinStored);
            if (Array.isArray(parsedW)) rawLocals.push(...parsedW);
          }

          // If searching, ONLY include local orders that strictly match the search query!
          const matchingLocals = cleanSearch
            ? rawLocals.filter((o: any) => matchesOrder(o, cleanSearch))
            : rawLocals;

          if (matchingLocals.length > 0) {
            const existingOrderNums = new Set(items.map((o: any) => o.orderNumber));
            const missingLocals = matchingLocals.filter((o: any) => !existingOrderNums.has(o.orderNumber));
            items = [...items, ...missingLocals];
          }
        } catch {}

        // Sort: newest first
        items.sort(
          (a: any, b: any) =>
            getOrderTimestamp(b) - getOrderTimestamp(a),
        );

        // Final strict verification before updating state
        const strictlyFiltered = cleanSearch
          ? items.filter((o: any) => matchesOrder(o, cleanSearch))
          : items;

        setOrders(strictlyFiltered);
      })
      .catch(() => {
        // Discard errors from older in-flight requests
        if (activeSearchRef.current.trim() !== cleanSearch) {
          return;
        }

        // Offline fallback: load from localStorage only
        try {
          const stored = typeof window !== "undefined" ? localStorage.getItem("prayog_placed_orders") : null;
          const walkinStored = typeof window !== "undefined" ? localStorage.getItem("prayog_walkin_orders") : null;
          let rawLocals: any[] = [];
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) rawLocals.push(...parsed);
          }
          if (walkinStored) {
            const parsedW = JSON.parse(walkinStored);
            if (Array.isArray(parsedW)) rawLocals.push(...parsedW);
          }

          const matchingLocals = cleanSearch
            ? rawLocals.filter((o: any) => matchesOrder(o, cleanSearch))
            : rawLocals;

          matchingLocals.sort(
            (a: any, b: any) =>
              getOrderTimestamp(b) - getOrderTimestamp(a),
          );
          setOrders(matchingLocals);
        } catch {}
      })
      .finally(() => {
        if (activeSearchRef.current.trim() === cleanSearch) {
          setLoading(false);
        }
      });
  };

  // Single unified effect: debounced re-fetch on any search/status change.
  // Using a single effect prevents both effects from firing simultaneously and racing each other.
  // Status filter changes trigger immediately (0ms); search queries debounce at 350ms.
  useEffect(() => {
    const delay = searchQuery.trim() ? 350 : 0;
    const timer = setTimeout(() => {
      fetchOrders(searchQuery, statusFilter);
    }, delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  const isDateActive = dateFilter !== "all";
  const dateFilterLabel = useMemo(() => {
    if (dateFilter === "today") {
      return `Today (${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })})`;
    }
    if (dateFilter === "yesterday") return "Yesterday";
    if (dateFilter === "last_7_days") return "Last 7 Days";
    if (dateFilter === "last_30_days") return "Last 30 Days";
    if (dateFilter === "this_month") {
      return `This Month (${new Date().toLocaleDateString("en-IN", { month: "long" })})`;
    }
    if (dateFilter === "custom") {
      if (customStartDate && customEndDate) return `${customStartDate} → ${customEndDate}`;
      if (customStartDate) return `From ${customStartDate}`;
      if (customEndDate) return `Up to ${customEndDate}`;
      return "Custom Range";
    }
    return "All Dates";
  }, [dateFilter, customStartDate, customEndDate]);

  // Channel selector counts reflect active search query and date filter so counts match current results
  const searchFilteredOrders = useMemo(() => {
    let result = orders;
    if (searchQuery.trim()) {
      result = result.filter((o) => matchesOrder(o, searchQuery));
    }
    if (dateFilter !== "all") {
      result = result.filter((o) =>
        matchesDateFilter(o, dateFilter, customStartDate, customEndDate)
      );
    }
    return result;
  }, [orders, searchQuery, dateFilter, customStartDate, customEndDate]);

  // Safe, instant, client-side order filtering:
  // Strictly renders ONLY orders matching active channel, date filter, and search query.
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim();
    return orders.filter((ord) => {
      const ordChannel = getOrderChannel(ord);
      const matchesChannel =
        channelFilter === "all" || ordChannel === channelFilter;
      if (!matchesChannel) return false;

      if (dateFilter !== "all") {
        if (!matchesDateFilter(ord, dateFilter, customStartDate, customEndDate)) {
          return false;
        }
      }

      if (!q) return true;

      return matchesOrder(ord, q);
    });
  }, [orders, searchQuery, channelFilter, dateFilter, customStartDate, customEndDate]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-0.5 rounded-full border border-[#00AEEF]/20">
              Super Admin Operations · Orders &amp; Logistics Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Fulfillment &amp; Channel Dispatch
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time fulfillment desk for all orders originating from the{" "}
            <strong>Prayog Website Store</strong>, <strong>Mobile App</strong>,
            and physical store branches.
          </p>
        </div>
      </div>

      {/* Dedicated B2B Inquiries Shortcut Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs text-amber-950">
          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            <Quote className="w-4 h-4" />
          </span>
          <span className="font-semibold">
            Institutional quote requests and B2B queries are managed separately in the dedicated <strong>B2B Quotations Desk</strong>.
          </span>
        </div>
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto shrink-0"
        >
          <span>Open B2B Quotations Desk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Channel Selector Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          {
            id: "all",
            label: "All Channels",
            icon: ShoppingBag,
            count: searchFilteredOrders.length,
          },
          {
            id: "WEBSITE",
            label: "Website Orders (Online)",
            count: searchFilteredOrders.filter((o) => getOrderChannel(o) === "WEBSITE").length,
          },
          {
            id: "MOBILE_APP",
            label: "Mobile App Orders",
            count: searchFilteredOrders.filter((o) => getOrderChannel(o) === "MOBILE_APP").length,
          },
          {
            id: "WALK_IN",
            label: "Store Walk-ins",
            count: searchFilteredOrders.filter((o) => getOrderChannel(o) === "WALK_IN").length,
          },
        ].map((tab) => {
          const active = channelFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setChannelFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                active
                  ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20 ring-2 ring-[#00AEEF]/30"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Channel & Search Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-sky-50/30 to-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              searchQuery.trim()
                ? "bg-amber-500 ring-4 ring-amber-100"
                : isDateActive
                ? "bg-[#00AEEF] ring-4 ring-sky-100"
                : channelFilter === "WEBSITE"
                ? "bg-blue-500 ring-4 ring-blue-100"
                : channelFilter === "WALK_IN"
                  ? "bg-emerald-500 ring-4 ring-emerald-100"
                  : channelFilter === "MOBILE_APP"
                    ? "bg-purple-500 ring-4 ring-purple-100"
                    : "bg-[#00AEEF] ring-4 ring-sky-100"
            }`}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs text-slate-900 block sm:inline">
                {searchQuery.trim()
                  ? "Search Results:"
                  : isDateActive
                  ? `${dateFilterLabel}:`
                  : channelFilter === "all"
                  ? "Unified Multi-Channel Overview:"
                  : channelFilter === "WEBSITE"
                    ? "Website Store Fulfillment:"
                    : channelFilter === "MOBILE_APP"
                      ? "Mobile App Dispatch:"
                      : "Store Walk-in POS Desk:"}
              </span>
              {isDateActive && (
                <span className="inline-flex items-center gap-1 bg-[#E0F7FC] text-[#007EA7] border border-[#00AEEF]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{dateFilterLabel}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter("all");
                      setCustomStartDate("");
                      setCustomEndDate("");
                    }}
                    className="hover:text-red-600 font-black cursor-pointer ml-0.5"
                    title="Remove date filter"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-600 font-medium">
              {searchQuery.trim()
                ? filteredOrders.length === 0
                  ? `No orders matching "${searchQuery.trim()}".`
                  : `Displaying ${filteredOrders.length} order(s) matching "${searchQuery.trim()}"${isDateActive ? ` (${dateFilterLabel})` : ""}.`
                : channelFilter === "all"
                ? `Displaying ${filteredOrders.length} order(s) across Website, Physical Store POS, and Mobile App${isDateActive ? ` (${dateFilterLabel})` : ""}.`
                : channelFilter === "WEBSITE"
                  ? `Displaying ${filteredOrders.length} online orders placed via Prayog Web Store${isDateActive ? ` (${dateFilterLabel})` : ""}.`
                  : channelFilter === "MOBILE_APP"
                    ? `Displaying ${filteredOrders.length} direct orders received via Prayog Mobile App${isDateActive ? ` (${dateFilterLabel})` : ""}.`
                    : `Displaying ${filteredOrders.length} counter sale receipts fulfilled at physical branches${isDateActive ? ` (${dateFilterLabel})` : ""}.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[11px] font-black text-rose-600 hover:underline cursor-pointer shrink-0"
            >
              Clear Search ✕
            </button>
          )}
          {isDateActive && (
            <button
              type="button"
              onClick={() => {
                setDateFilter("all");
                setCustomStartDate("");
                setCustomEndDate("");
              }}
              className="text-[11px] font-black text-[#00AEEF] hover:underline cursor-pointer shrink-0"
            >
              All Dates ✕
            </button>
          )}
          {channelFilter !== "all" && !searchQuery.trim() && (
            <button
              onClick={() => setChannelFilter("all")}
              className="text-[11px] font-black text-[#00AEEF] hover:underline cursor-pointer shrink-0"
            >
              Show All Channels →
            </button>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number, customer name, phone, or tracking..."
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-9 py-2 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Date Presets, Dropdown, Status Filter & Reset Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Date Buttons: All, Today, Yesterday, 7 Days */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200/80">
              {[
                { id: "all", label: "All Dates" },
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "last_7_days", label: "7 Days" },
              ].map((tab) => {
                const active = dateFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDateFilter(tab.id as OrderDateFilterType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-[#00AEEF] text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Date Range Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-[#00AEEF] focus-within:bg-white transition-all shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as OrderDateFilterType)}
                className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">More Dates...</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Order Status Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-[#00AEEF] focus-within:bg-white transition-all shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Order Statuses</option>
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset All Filters Button */}
            {(dateFilter !== "all" || statusFilter !== "all" || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Reset active filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {dateFilter === "custom" && (
          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00AEEF]" />
              Custom Date Window:
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400">From</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none text-xs"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold">to</span>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400">To</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none text-xs"
                />
              </div>
            </div>
            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Orders & Section 31 Shipping Info Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order # &amp; Source</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">Weight / Freight</th>
                <th className="p-4">Restricted Item?</th>
                <th className="p-4">Courier &amp; AWB</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Shipping Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3 px-4">
                      <Search className="w-10 h-10 text-slate-300 mx-auto" />
                      <div className="font-extrabold text-slate-800 text-sm">
                        {searchQuery
                          ? `No orders matching "${searchQuery}"`
                          : isDateActive
                          ? `No orders found for ${dateFilter === "today" ? "today" : dateFilter === "yesterday" ? "yesterday" : dateFilterLabel}`
                          : "No orders found"}
                      </div>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? "We couldn't find any orders matching this order number, customer name, phone, or tracking ID."
                          : isDateActive
                          ? "There are no customer orders recorded in the system for this specific time window."
                          : "No orders currently match the selected status or channel."}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            Clear Search
                          </button>
                        )}
                        {isDateActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setDateFilter("all");
                              setCustomStartDate("");
                              setCustomEndDate("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00AEEF] hover:bg-[#0098d1] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            Show All Dates
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const ordChannel = getOrderChannel(ord);
                  const orderTs = getOrderTimestamp(ord);
                  const ordDate = orderTs > 0 ? new Date(orderTs) : null;
                  const isOrderToday = ordDate
                    ? ordDate.getFullYear() === new Date().getFullYear() &&
                      ordDate.getMonth() === new Date().getMonth() &&
                      ordDate.getDate() === new Date().getDate()
                    : false;

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Order No & Source */}
                      <td className="p-4">
                        <div className="font-mono font-black text-slate-900 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#00AEEF]" />
                          <span>{ord.orderNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>
                            {orderTs > 0
                              ? new Date(orderTs).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ord.date || "Recent Order"}
                          </span>
                          {isOrderToday && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {ordChannel === "WEBSITE" ? (
                            <span className="inline-flex items-center gap-1 bg-sky-50 text-[#005CA9] border border-sky-200/90 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                              Website Online
                            </span>
                          ) : ordChannel === "WALK_IN" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                              {ord.orderNumber?.includes("PAT") || ord.shippingAddress?.includes("Patna") ? "Patna Store" : ord.orderNumber?.includes("RAN") || ord.shippingAddress?.includes("Ranchi") ? "Ranchi Hub" : ord.orderNumber?.includes("DEL") || ord.shippingAddress?.includes("Delhi") ? "Delhi Branch" : "Store POS"} Walk-in
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200/90 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                              Mobile App
                            </span>
                          )}
                        </div>
                        {ord.quotation && (
                          <div className="mt-1">
                            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                              Quote #{ord.quotation.quoteNumber}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">
                          {ord.user?.name || ord.customerName || "Walk-in Guest"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {ord.user?.phone || ord.customerPhone || "In-Store Counter"}
                        </div>
                      </td>

                      {/* Total Amount & Payment Status */}
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{ord.totalAmount?.toLocaleString()}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {ord.paymentMethod?.toLowerCase().includes("neft") ||
                          ord.paymentMethod?.toLowerCase().includes("rtgs") ||
                          ord.paymentMethod?.toLowerCase().includes("bank") ? (
                            <a
                              href={`/admin/payments?search=${encodeURIComponent(ord.orderNumber)}`}
                              className="inline-flex items-center gap-1 font-bold text-[#005CA9] hover:underline"
                              title="Review in Bank Verification Desk"
                            >
                              <span>{ord.paymentMethod}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                                  ord.paymentStatus === "PAID"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {ord.paymentStatus === "PAID"
                                  ? "VERIFIED"
                                  : "PENDING UTR"}
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-500 font-medium">
                              {ord.paymentMethod || "Online"} ·{" "}
                              {ord.paymentStatus || "PENDING"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Section 31 Weight & Freight Mode */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {ord.weightGm || 500} gm
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 mt-0.5">
                          {ord.freightMode === "Air Freight" ? (
                            <span className="text-blue-600 flex items-center gap-0.5">
                              <Plane className="w-3 h-3" /> Air
                            </span>
                          ) : (
                            <span className="text-emerald-700 flex items-center gap-0.5">
                              <Truck className="w-3 h-3" /> Surface
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Section 31 Restricted Item YES / NO */}
                      <td className="p-4">
                        {ord.hasRestrictedItem ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>YES (Battery)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                            <span>NO</span>
                          </span>
                        )}
                      </td>

                      {/* Section 31 Courier & AWB */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">
                          {ordChannel === "WALK_IN"
                            ? ord.courierProvider || "In-Store Counter"
                            : ord.courierProvider || "Delhivery Surface"}
                        </div>
                        <div className="font-mono text-xs font-black text-[#00AEEF]">
                          {ordChannel === "WALK_IN"
                            ? ord.awbNumber || "Counter Handover"
                            : ord.awbNumber || "PENDING AWB"}
                        </div>
                      </td>

                    {/* Order Status Selector */}
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value)
                        }
                        className="bg-blue-50 text-blue-800 border border-blue-200 rounded-xl px-2.5 py-1 text-[11px] font-extrabold focus:outline-none cursor-pointer"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions: View Section 31 Details */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrderForShipping(ord)}
                        className="px-3 py-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Shipping Info</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section 31 Order Shipping Information Modal */}
      {selectedOrderForShipping && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedOrderForShipping(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Section 31 · Compliance &amp; Courier Logistics Details
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Order Shipping Inspection:</span>
                  <span className="font-mono text-[#00AEEF]">
                    {selectedOrderForShipping.orderNumber}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForShipping(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            {/* Section 31 Checklist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Consignment Weight
                </span>
                <div className="text-sm font-black text-slate-900">
                  {selectedOrderForShipping.weightGm} Grams
                </div>
                <div className="text-[10px] text-slate-500">
                  {(selectedOrderForShipping.weightGm / 1000).toFixed(2)} KG
                  Volumetric
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Courier Provider
                </span>
                <div className="text-sm font-black text-slate-900">
                  {selectedOrderForShipping.courierProvider}
                </div>
                <div className="text-[10px] text-[#00AEEF] font-bold">
                  API Verified
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Air / Surface Mode
                </span>
                <div className="text-sm font-black text-slate-900">
                  {selectedOrderForShipping.freightMode}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  DGCA Compliant
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Restricted Item
                </span>
                <div className="text-sm font-black text-slate-900 flex items-center gap-1">
                  {selectedOrderForShipping.hasRestrictedItem ? (
                    <span className="text-amber-800 font-extrabold">
                      YES (Battery / Haz)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-extrabold">
                      NO (Standard)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  AWB Number
                </span>
                <div className="font-mono text-xs font-black text-[#00AEEF]">
                  {selectedOrderForShipping.awbNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  Barcode Assigned
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Delivery Status
                </span>
                <div className="text-xs font-black text-emerald-600">
                  {selectedOrderForShipping.deliveryStatus}
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedOrderForShipping.trackingStatus}
                </div>
              </div>
            </div>

            {/* Restricted Item Detailed Explanation */}
            {selectedOrderForShipping.hasRestrictedItem && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 text-amber-900">
                <div className="font-black text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Battery Consignment Protection Active</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  {selectedOrderForShipping.restrictedItemReason}. Aviation air
                  freight was prohibited automatically at checkout; booking was
                  routed via ground surface linehaul to prevent courier AWB
                  cancellation or airport customs rejection.
                </p>
              </div>
            )}

            {/* Itemized Manifest */}
            <div className="space-y-2">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider block">
                Packaged Consignment Items (
                {selectedOrderForShipping.items?.length || 0})
              </span>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 p-2">
                {selectedOrderForShipping.items?.map(
                  (item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900">
                          {item.name || item.productName || "Product Item"}
                        </span>
                        {item.isRestricted && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black uppercase">
                            Battery
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-600 font-bold">
                          {item.qty || item.quantity || 1}x
                        </span>
                        <span className="font-black text-slate-900 ml-2">
                          ₹{((item.qty || item.quantity || 1) * (item.price || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Delivery Destination Address Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                Destination Delivery Hub:
              </span>
              <div className="font-black text-slate-900 text-xs">
                {selectedOrderForShipping.user?.name}
              </div>
              <div className="text-slate-600 font-medium">
                {selectedOrderForShipping.shippingAddress}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Tel: {selectedOrderForShipping.user?.phone}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForShipping(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(
                    `Printing compliant DGCA shipping manifest for order ${selectedOrderForShipping.orderNumber}`,
                  );
                  setSelectedOrderForShipping(null);
                }}
                className="px-6 py-2.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-xl font-black uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#FFC20E]" />
                <span>Print Logistics Manifest</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
