"use client";

import React from "react";
import Image from "next/image";
import { ShoppingBag, CheckCircle, X, ArrowRight } from "lucide-react";
import { Product, ProductVariant } from "@/data/mockData";

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
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[290px] sm:max-w-[320px] w-full animate-cart-toast pointer-events-auto"
    >
      <div className="bg-[#0A111F]/95 text-white rounded-2xl p-3 shadow-2xl border border-slate-700/80 backdrop-blur-xl flex flex-col gap-2.5">
        {/* Top bar with success badge and close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span>Added to Cart</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-0.5 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product details row */}
        <div className="flex items-center gap-2.5 bg-slate-900/90 rounded-xl p-2 border border-slate-800">
          <div className="relative w-9 h-9 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-700 p-0.5">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-bold text-white truncate leading-tight">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5 font-medium">
              <span className="font-mono text-slate-400">Qty: {quantity}</span>
              <span className="font-black text-[#00AEEF]">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button to open Cart */}
        <div>
          <button
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 hover:text-white py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#00AEEF]/20 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>View Cart &amp; Checkout</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
