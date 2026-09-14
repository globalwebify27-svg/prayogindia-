"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Heart,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useStore, CartItem } from "@/context/StoreContext";
import { haptic } from "@/utils/haptics";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (
    productId: string,
    delta: number,
    variantId?: string,
  ) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
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
  const { moveToWishlist } = useStore();
  const [coupon, setCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const total = Math.max(0, subtotal - appliedDiscount);

  const hasBatteryOrHazardous = items.some((item) => {
    const tag = item.product.shippingTag;
    const name = item.product.name.toLowerCase();
    return (
      tag === "Battery Item" ||
      tag === "Hazardous" ||
      name.includes("battery") ||
      name.includes("lipo")
    );
  });

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "PRAYOG10") {
      setAppliedDiscount(Math.round(subtotal * 0.1));
      setAppliedCode("PRAYOG10");
    } else if (code === "MAKER500") {
      setAppliedDiscount(Math.min(subtotal, 500));
      setAppliedCode("MAKER500");
    } else {
      alert("Invalid code. Try PRAYOG10 for 10% demo discount.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-300">
          {/* Cart Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#00AEEF]" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Your Cart
              </h2>
              <span className="bg-[#00AEEF] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {hasBatteryOrHazardous && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Surface cargo dispatch rule active (LiPo battery).</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">
                  Your cart is currently empty.
                </p>
                <p className="text-xs">
                  Explore Arduino, Drones, IoT, and STEM robotics kits to start
                  adding items.
                </p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-block mt-2 bg-[#00AEEF] text-white text-xs font-extrabold px-5 py-2.5 rounded-full"
                >
                  Browse Hardware Catalogue
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const price = item.variant
                  ? item.variant.price
                  : item.product.price;
                const sku = item.variant ? item.variant.sku : item.product.sku;

                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || "std"}`}
                    className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 items-center"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 shrink-0 relative overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{sku}</span>
                        {item.variant && (
                          <span className="text-[#00AEEF] font-bold">
                            ({item.variant.name})
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        ₹{price.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            -1,
                            item.variant?.id,
                          )
                        }
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black px-1.5 text-slate-900 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, 1, item.variant?.id)
                        }
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() =>
                          onRemoveItem(item.product.id, item.variant?.id)
                        }
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 space-y-3">
              {/* Coupon Row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs uppercase font-mono font-bold focus:outline-none focus:border-[#00AEEF]"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-[#00AEEF] transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {appliedCode && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Coupon {appliedCode} applied (-₹
                  {appliedDiscount})
                </p>
              )}

              {/* Calculations */}
              <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{appliedDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>GST &amp; Express Shipping</span>
                  <span className="text-emerald-600 font-bold">Included</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-[#00AEEF]">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={() => {
                    haptic.light();
                    onClose();
                  }}
                  className="border border-slate-300 hover:border-slate-400 text-slate-800 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-colors block"
                >
                  Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => {
                    haptic.medium();
                    onClose();
                  }}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-[#00AEEF]/25 block flex items-center justify-center gap-1"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pan-India Dispatch · 100% Genuine</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
