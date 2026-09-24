"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, Store, Printer, RotateCcw } from "lucide-react";
import { WalkInSession, StoreConfig } from "@/data/storeConfig";
import { OrderTruckButton } from "./OrderTruckButton";

interface Props {
  session: WalkInSession | null;
  store: StoreConfig;
  onReset: () => void;
}

export function RoboticOrderSuccess({ session, store, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [truckKey, setTruckKey] = useState(0); // To allow replaying the truck animation
  const [autoResetTimer, setAutoResetTimer] = useState(90);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const sessionId =
    session?.id || `WI-${store.id.slice(0, 3).toUpperCase()}-ORDER`;
  const customerName = session?.customerName || "Customer";
  const customerPhone = session?.customerPhone || "In-Store Walk-in";
  const items = session?.items || [];
  const itemCount = items.length;
  const total = session?.total ?? 0;
  const paymentMethod = session?.paymentMethod || "CASH";

  // Auto-reset countdown for in-store tablet kiosk
  useEffect(() => {
    if (isTimerPaused) return;
    const timer = setInterval(() => {
      setAutoResetTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerPaused, onReset]);

  const handleCopyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReplayTruck = () => {
    setTruckKey((prev) => prev + 1);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-full bg-[#E4ECFA] text-slate-800 flex flex-col py-8 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
      {/* Top Kiosk Bar */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ORDER DISPATCHED</span>
        </div>

        <div className="flex items-center gap-2 bg-white/80 border border-slate-300 rounded-full px-3 py-1 text-xs">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Kiosk Reset:
          </span>
          <span className="font-mono font-bold text-slate-800">
            {autoResetTimer}s
          </span>
          <button
            type="button"
            onClick={() => setIsTimerPaused(!isTimerPaused)}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer ml-1"
          >
            {isTimerPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full flex flex-col items-center space-y-6">
        {/* ── Aaron Iker Delivery Truck Animation ── */}
        <div className="flex flex-col items-center justify-center py-6 w-full">
          <OrderTruckButton
            key={truckKey}
            defaultText="Complete Order"
            successText="Order Placed"
            autoAnimate={true}
          />

          <button
            type="button"
            onClick={handleReplayTruck}
            className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Replay Animation</span>
          </button>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Thank You, {customerName}!
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto font-medium">
            Your hardware items have been packaged and sent to the{" "}
            <strong className="text-slate-900 font-bold">
              {store.shortName}
            </strong>{" "}
            billing counter.
          </p>
        </div>

        {/* ── Holographic Receipt & Order Token Card ── */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          {/* Header with Token and Barcode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Order Session Token
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-mono font-black text-slate-900 tracking-wide">
                  {sessionId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                  title="Copy Token"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-xs text-slate-500">
                Customer: <strong>{customerName}</strong> · {customerPhone}
              </span>
            </div>

            {/* Barcode representation */}
            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
              <div className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-[2px]">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="h-5 bg-slate-900"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ),
                )}
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                SCANNABLE COUNTER BARCODE
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Store
              </div>
              <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                {store.shortName}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Products
              </div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">
                {itemCount} Items
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Payment
              </div>
              <div className="font-bold text-blue-600 text-xs mt-0.5">
                {paymentMethod === "CASH" ? "💵 Cash" : "📱 UPI QR"}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Total
              </div>
              <div className="font-black text-slate-900 text-sm mt-0.5">
                ₹{total.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Items Preview */}
          {items.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Items In Cart
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 text-xs">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-700"
                  >
                    <span className="truncate max-w-[280px] font-medium">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0 ml-2">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Guide */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0 mt-0.5">
              <Store className="w-4 h-4 text-amber-800" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-amber-950">
                Proceed to Store Billing Counter
              </div>
              <p className="text-[11.5px] leading-relaxed text-amber-800">
                Show this screen or give your name (
                <strong>{customerName}</strong>) or Token (
                <strong>{sessionId.slice(-8)}</strong>) to the staff to complete
                payment &amp; collect your hardware.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3 pb-8">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Shopping Session</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
