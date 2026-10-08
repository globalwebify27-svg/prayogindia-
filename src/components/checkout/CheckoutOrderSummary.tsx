"use client";

import React from "react";
import Image from "next/image";
import { CartItem } from "@/context/StoreContext";
import { Tag, ShieldCheck, Truck, Award } from "lucide-react";

interface CheckoutSummaryProps {
  cart: CartItem[];
  subtotal: number;
  mrpTotal: number;
  couponCode: string;
  couponDiscount: number;
  useRewardPoints: boolean;
  rewardDiscount: number;
  selectedShippingFee: number;
  onApplyCoupon: (code: string) => void;
  onToggleRewardPoints: (val: boolean) => void;
  rewardPointsAvailable: number;
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
  onApplyCoupon,
  onToggleRewardPoints,
  rewardPointsAvailable,
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

  return (
    <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 sticky top-28">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-base font-extrabold tracking-tight text-slate-900">
          Order Summary
        </h3>
        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
          {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Product Mini List */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
        {cart.map((item) => {
          const price = item.variant ? item.variant.price : item.product.price;
          return (
            <div
              key={`${item.product.id}-${item.variant?.id}`}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Qty: {item.quantity}{" "}
                    {item.variant ? `(${item.variant.name})` : ""}
                  </span>
                </div>
              </div>
              <span className="font-extrabold text-slate-900 shrink-0">
                ₹{(price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reward Points Toggle */}
      {rewardPointsAvailable > 0 && (
        <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">
                Use Reward Points
              </span>
              <span className="text-[10px] text-slate-500">
                {rewardPointsAvailable} pts available (Save ₹{rewardDiscount})
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={useRewardPoints}
            onChange={(e) => onToggleRewardPoints(e.target.checked)}
            className="rounded border-amber-300 accent-[#00AEEF] w-4 h-4 cursor-pointer"
          />
        </div>
      )}

      {/* Calculations Breakdown */}
      <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
        <div className="flex justify-between">
          <span>Product Catalogue MRP</span>
          <span className="line-through text-slate-400 font-semibold">
            ₹{mrpTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {catalogueSavings > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Catalogue Discount</span>
            <span>-₹{catalogueSavings.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex justify-between font-semibold text-slate-800">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-[#00AEEF] font-bold">
            <span>Coupon Discount ({couponCode})</span>
            <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        {useRewardPoints && rewardDiscount > 0 && (
          <div className="flex justify-between text-amber-600 font-bold">
            <span>Reward Points Discount</span>
            <span>-₹{rewardDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-500">
          <span>GST (18% Tax Invoice)</span>
          <span className="text-emerald-600 font-bold">Included</span>
        </div>

        <div className="flex justify-between text-slate-500">
          <span>Shipping &amp; Freight</span>
          <span className="text-emerald-600 font-bold">
            {selectedShippingFee === 0
              ? "FREE Express"
              : `₹${selectedShippingFee}`}
          </span>
        </div>

        <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
          <span>Grand Total Payable</span>
          <span className="text-[#00AEEF]">₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Official GST Tax Invoice &amp; 100% Genuine Guarantee</span>
      </div>
    </div>
  );
};
