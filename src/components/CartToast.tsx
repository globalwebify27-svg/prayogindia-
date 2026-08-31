'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingBag, CheckCircle, X, ArrowRight } from 'lucide-react';
import { Product, ProductVariant } from '@/data/mockData';

export interface CartToastNotification {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CartToastProps {
  notification: CartToastNotification | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const CartToast: React.FC<CartToastProps> = ({
  notification,
  onClose,
  onOpenCart,
}) => {
  if (!notification) return null;

  const { product, variant, quantity } = notification;
  const displayPrice = variant ? variant.price : product.price;

  return (
    <aside
      aria-label="Item added to cart notification"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
    >
      <div className="bg-[#0F172A] text-white rounded-3xl p-4 shadow-2xl border border-slate-700/80 backdrop-blur-md flex flex-col gap-3">
        {/* Top bar with success badge and close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>Added to Cart</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product details row */}
        <div className="flex items-center gap-3 bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/50">
          <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-600">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-1"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white line-clamp-1">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-0.5">
              {variant && (
                <span className="font-semibold text-sky-400">{variant.name}</span>
              )}
              <span className="font-mono text-slate-400">Qty: {quantity}</span>
              <span className="font-extrabold text-[#00AEEF]">₹{displayPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* CTA Button to open Cart */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="flex-1 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#00AEEF]/25 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>View Cart &amp; Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
