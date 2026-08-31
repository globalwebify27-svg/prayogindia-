'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/context/StoreContext';
import { Tag, ShieldCheck, Truck, Award } from 'lucide-react';

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
  const totalDiscounts = catalogueSavings + couponDiscount + (useRewardPoints ? rewardDiscount : 0);
  const grandTotal = Math.max(0, subtotal - couponDiscount - (useRewardPoints ? rewardDiscount : 0) + selectedShippingFee);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
      
      <h3 className="text-lg font-black tracking-tight text-white border-b border-slate-800 pb-3 flex items-center justify-between">
        <span>Order Summary</span>
        <span className="text-xs text-slate-400 font-bold">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
      </h3>

      {/* Product Mini List */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {cart.map((item) => {
          const price = item.variant ? item.variant.price : item.product.price;
          return (
            <div key={`${item.product.id}-${item.variant?.id}`} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-white p-1 shrink-0 overflow-hidden">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-contain" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate">{item.product.name}</h4>
                  <span className="text-[10px] text-slate-400">Qty: {item.quantity} {item.variant ? `(${item.variant.name})` : ''}</span>
                </div>
              </div>
              <span className="font-extrabold text-white shrink-0">₹{(price * item.quantity).toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      {/* Reward Points Toggle */}
      {rewardPointsAvailable > 0 && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FFC20E]" />
            <div>
              <span className="font-bold text-white block">Use Reward Points</span>
              <span className="text-[10px] text-slate-400">{rewardPointsAvailable} pts (₹{rewardDiscount} OFF)</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={useRewardPoints}
            onChange={(e) => onToggleRewardPoints(e.target.checked)}
            className="rounded border-slate-700 accent-[#00AEEF] w-4 h-4 cursor-pointer"
          />
        </div>
      )}

      {/* Calculations Breakdown */}
      <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800 font-medium">
        <div className="flex justify-between">
          <span>Product Catalogue MRP</span>
          <span className="line-through text-slate-500 font-bold">₹{mrpTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-emerald-400 font-bold">
          <span>Catalogue Discount</span>
          <span>-₹{catalogueSavings.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-white">₹{subtotal.toLocaleString()}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-[#FFC20E] font-bold">
            <span>Coupon Discount ({couponCode})</span>
            <span>-₹{couponDiscount.toLocaleString()}</span>
          </div>
        )}

        {useRewardPoints && rewardDiscount > 0 && (
          <div className="flex justify-between text-[#FFC20E] font-bold">
            <span>Reward Points Discount</span>
            <span>-₹{rewardDiscount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-400">
          <span>GST (18% Tax Invoice)</span>
          <span className="text-emerald-400 font-bold">Included</span>
        </div>

        <div className="flex justify-between text-slate-400">
          <span>Shipping & Freight</span>
          <span className="text-emerald-400 font-bold">
            {selectedShippingFee === 0 ? 'FREE Express' : `₹${selectedShippingFee}`}
          </span>
        </div>

        <div className="flex justify-between text-base font-black text-white pt-3 border-t border-slate-800">
          <span>Grand Total Payable</span>
          <span className="text-[#FFC20E]">₹{grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 border-t border-slate-800/60 pt-3">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Official GST Tax Invoice & Pan-India Dispatch Warranty</span>
      </div>

    </div>
  );
};
