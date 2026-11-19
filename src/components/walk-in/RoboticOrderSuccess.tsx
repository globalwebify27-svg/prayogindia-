"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, Store, Printer, RotateCcw, Banknote, QrCode } from "lucide-react";
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
    <div className="h-full w-full bg-[#E4ECFA] text-slate-800 flex flex-col justify-between p-3 sm:p-5 relative overflow-y-auto select-none">
      <div className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-between gap-2.5 sm:gap-3 py-1">
        {/* 1. Top Status & Kiosk Reset Row */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Order Dispatched</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/90 border border-slate-300 rounded-full px-3 py-1 text-xs shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">
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

        {/* 2. Animation & Confirmation Heading */}
        <div className="flex flex-col items-center text-center space-y-1.5 shrink-0">
          <div className="flex items-center justify-center gap-2">
            <OrderTruckButton
              key={truckKey}
              defaultText="Complete Order"
              successText="Order Placed"
              autoAnimate={true}
            />
            <button
              type="button"
              onClick={handleReplayTruck}
              title="Replay Animation"
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Thank You, {customerName}!
            </h1>
            <p className="text-slate-600 text-xs max-w-md mx-auto font-medium leading-relaxed">
              Your hardware items have been packaged and sent to the{" "}
              <strong className="text-slate-900 font-bold">
                {store.shortName}
              </strong>{" "}
              billing counter.
            </p>
          </div>
        </div>

        {/* 3. Holographic Receipt & Order Token Card */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-2.5 shrink-0">
          {/* Header with Token and Barcode */}
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                Order Session Token
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base sm:text-lg font-mono font-black text-slate-900 tracking-wide">
                  {sessionId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                  title="Copy Token"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Customer: <strong className="text-slate-700">{customerName}</strong> · {customerPhone}
              </span>
            </div>

            {/* Barcode representation */}
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="h-6 px-2 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center gap-[2px]">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="h-3.5 bg-slate-900"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ),
                )}
              </div>
              <span className="text-[8px] font-mono text-slate-400">
                SCANNABLE COUNTER BARCODE
              </span>
            </div>
          </div>

          {/* Details Grid (4 stats in 1 clean row) */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <div className="text-[9px] uppercase font-bold text-slate-400">
                Store
              </div>
              <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                {store.shortName}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <div className="text-[9px] uppercase font-bold text-slate-400">
                Products
              </div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">
                {itemCount} Items
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <div className="text-[9px] uppercase font-bold text-slate-400">
                Payment
              </div>
              <div className="font-bold text-blue-700 text-xs mt-0.5 flex items-center gap-1">
                {paymentMethod === "CASH" ? (
                  <>
                    <Banknote className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Cash</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>UPI QR</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <div className="text-[9px] uppercase font-bold text-slate-400">
                Total
              </div>
              <div className="font-black text-slate-900 text-xs sm:text-sm mt-0.5">
                ₹{total.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Items In Cart Preview */}
          {items.length > 0 && (
            <div className="space-y-1">
              <div className="text-[9px] font-bold uppercase text-slate-400">
                Items In Cart
              </div>
              <div className="max-h-16 overflow-y-auto space-y-1 pr-1 text-xs">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-700 text-[11px]"
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
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <div className="w-6 h-6 rounded-lg bg-amber-200/80 flex items-center justify-center shrink-0 mt-0.5">
              <Store className="w-3.5 h-3.5 text-amber-800" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-amber-950 text-xs">
                Proceed to Store Billing Counter
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Show this screen or give your name (
                <strong>{customerName}</strong>) or Token (
                <strong>{sessionId.slice(-8)}</strong>) to the staff to complete
                payment &amp; collect your hardware.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons Strip (Always In View) */}
        <div className="w-full flex items-center gap-3 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-[#00AEEF] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Shopping Session</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
