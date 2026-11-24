"use client";

import React from "react";
import { CartItem } from "@/context/StoreContext";
import { ShieldCheck, ArrowRight, Info } from "lucide-react";

interface CheckoutSummaryProps {
  cart: CartItem[];
  subtotal: number;
  mrpTotal: number;
  couponCode: string;
  couponDiscount: number;
  useRewardPoints: boolean;
  rewardDiscount: number;
  selectedShippingFee: number;
  onApplyCoupon?: (code: string) => void;
  onToggleRewardPoints?: (val: boolean) => void;
  rewardPointsAvailable?: number;
  activeStep?: "address" | "summary" | "payment";
  onProceed?: () => void;
  isSubmitting?: boolean;
}

export const CheckoutOrderSummary: React.FC<CheckoutSummaryProps> = ({
  cart,
  subtotal,
  mrpTotal,
  couponCode,
  couponDiscount,
  useRewardPoints,
  rewardDiscount,
  selectedShippingFee,
  activeStep = "summary",
  onProceed,
  isSubmitting = false,
}) => {
  const catalogueSavings = Math.max(0, mrpTotal - subtotal);
  const totalDiscounts =
    catalogueSavings + couponDiscount + (useRewardPoints ? rewardDiscount : 0);
  const grandTotal = Math.max(
    0,
    subtotal -
      couponDiscount -
      (useRewardPoints ? rewardDiscount : 0) +
      selectedShippingFee,
  );
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="bg-white text-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-4 shadow-xs">
      {/* Flipkart Header: PRICE DETAILS */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Price Details
        </h3>
      </div>

      {/* Calculations Breakdown */}
      <div className="space-y-3 text-xs text-slate-600 font-medium">
        <div className="flex justify-between items-center">
          <span>Selling Price ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
          <span className="text-slate-900 font-semibold">
            ₹{mrpTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {catalogueSavings > 0 && (
          <div className="flex justify-between items-center text-emerald-600 font-bold">
            <span>Catalogue Discount</span>
            <span>-₹{catalogueSavings.toLocaleString("en-IN")}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 font-bold">
            <span>Coupon ({couponCode})</span>
            <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        {useRewardPoints && rewardDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 font-bold">
            <span>Reward Points</span>
            <span>-₹{rewardDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600">
          <span>Delivery Charges</span>
          <span className={selectedShippingFee === 0 ? "text-emerald-600 font-bold" : "text-slate-900 font-bold"}>
            {selectedShippingFee === 0
              ? "FREE"
              : `₹${selectedShippingFee}`}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>GST (18% Tax Invoice)</span>
          <span className="text-emerald-600 font-bold">Included</span>
        </div>

        {/* Total Amount Divider */}
        <div className="flex justify-between items-center text-base sm:text-lg font-black text-slate-900 pt-3 border-t border-dashed border-slate-200">
          <span>Total Amount</span>
          <span className="text-slate-900 font-black tracking-tight">
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Green Savings Alert Banner (Flipkart Style) */}
      {totalDiscounts > 0 && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs font-bold text-emerald-800">
          <span>
            You&apos;ll save ₹{totalDiscounts.toLocaleString("en-IN")} on this order!
          </span>
        </div>
      )}

      {/* Action Footer (Continue / Place Order) - Only displayed inside desktop card, mobile is handled by sticky bottom bar */}
      {onProceed && (
        <div className="hidden lg:flex pt-2 border-t border-slate-100 items-center justify-between gap-3">
          <div>
            {mrpTotal > grandTotal && (
              <span className="text-xs text-slate-400 line-through block font-medium">
                ₹{mrpTotal.toLocaleString("en-IN")}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onProceed}
            disabled={isSubmitting}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : activeStep === "payment" ? (
              <span>Place Order</span>
            ) : (
              <span>Continue</span>
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Trust & Guarantee */}
      <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 border-t border-slate-100 pt-2.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Safe &amp; Secure Payments • 100% Genuine Robotics</span>
      </div>
    </div>
  );
};
