'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product } from '@/data/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOpenB2BModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenB2BModal,
}) => {
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = Math.max(0, subtotal - appliedDiscount);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'PRAYOG10') {
      setAppliedDiscount(Math.round(subtotal * 0.1));
    } else {
      alert('Invalid code. Try PRAYOG10 for 10% demo discount.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100">
          
          {/* Cart Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1E56A0]" />
              <h2 className="text-lg font-extrabold text-[#0A1128]">Your Cart</h2>
              <span className="bg-[#1E56A0] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-sm font-semibold text-slate-600">Your cart is currently empty.</p>
                <p className="text-xs">Explore Arduino, Drones, IoT and STEM robotics kits to start adding items.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                  <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 shrink-0 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-slate-400">SKU: {item.product.sku}</p>
                    <div className="text-xs font-extrabold text-[#0A1128] mt-1">
                      ₹{item.product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-2">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button 
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Coupon & Summary Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white space-y-4">
              
              {/* Coupon Code Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. PRAYOG10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none uppercase font-semibold"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-slate-900 text-white text-xs font-bold px-4 rounded-xl hover:bg-[#1E56A0]"
                >
                  Apply
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Code</span>
                    <span>-₹{appliedDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>GST & Tax Invoice</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">FREE Pan-India</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#0A1128] pt-2 border-t border-slate-100">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => alert('Proceeding to Secure Checkout Portal with Razorpay / UPI.')}
                  className="w-full bg-[#0A1128] hover:bg-[#1E56A0] text-white py-3.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all border border-[#D4AF37]/30"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenB2BModal();
                  }}
                  className="w-full bg-blue-50 text-[#1E56A0] hover:bg-blue-100 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Request B2B Institutional Invoice Quote
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
