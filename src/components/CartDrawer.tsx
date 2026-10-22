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
  CheckCircle2,
  Truck,
  Sparkles,
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

  const applyCouponCode = (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (code === "PRAYOG10") {
      setAppliedDiscount(Math.round(subtotal * 0.1));
      setAppliedCode("PRAYOG10");
      setCoupon("PRAYOG10");
    } else if (code === "MAKER500") {
      setAppliedDiscount(Math.min(subtotal, 500));
      setAppliedCode("MAKER500");
      setCoupon("MAKER500");
    } else {
      alert("Invalid code. Try PRAYOG10 for 10% demo discount.");
    }
  };

  const handleApplyCoupon = () => {
    applyCouponCode(coupon);
  };

  const FREE_SHIPPING_THRESHOLD = 999;
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed top-0 bottom-[calc(60px+env(safe-area-inset-bottom))] sm:bottom-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* ── Cart Header ── */}
          <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white to-sky-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0A233F] text-white flex items-center justify-center shadow-xs shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Your Cart
                  </h2>
                  <span className="bg-[#FFC20E] text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Prayog India Hardware Desk
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* ── Free Delivery Threshold Progress ── */}
          {items.length > 0 && (
            <div className="px-4 sm:px-5 py-2.5 bg-sky-50/70 border-b border-blue-100/80 shrink-0">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      You&apos;ve unlocked <strong>FREE Express Shipping</strong>!
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>
                      Add{" "}
                      <strong className="text-[#2563EB]">
                        ₹
                        {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString(
                          "en-IN",
                        )}
                      </strong>{" "}
                      more for <strong>FREE Delivery</strong>
                    </span>
                  </span>
                )}
                <span className="text-[10px] text-slate-500 font-mono font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-[#FFC20E] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Cart Items List & Empty State ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-3.5">
            {hasBatteryOrHazardous && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5 text-[11px] text-amber-800 font-medium shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  DGCA Surface freight rule active for battery/chemical items.
                </span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-10 px-2 space-y-5 animate-in fade-in duration-300">
                {/* Brand Themed Illustration Squircle */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-blue-500/15 rounded-3xl blur-xl" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 via-sky-50 to-[#D4E4F7]/60 border-2 border-blue-200/90 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-11 h-11 text-[#2563EB] stroke-[1.8]" />
                  </div>
                </div>

                {/* Main Copy */}
                <div className="space-y-1.5 max-w-xs mx-auto">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Your Cart is Empty
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    You haven&apos;t added any robotics kits, microcontrollers,
                    or STEM components to your basket yet.
                  </p>
                </div>

                {/* Popular Categories Shortcut */}
                <div className="pt-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Popular Hardware Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {[
                      { label: "Robotics Kits", href: "/categories" },
                      { label: "Arduino", href: "/products" },
                      { label: "Sensors & Modules", href: "/categories" },
                      { label: "Drones & RC", href: "/products" },
                      { label: "Top Deals", href: "/offers" },
                    ].map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-[#2563EB] transition-all cursor-pointer shadow-2xs"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Primary Catalog CTA */}
                <div className="pt-2">
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Browse Hardware Catalogue</span>
                    <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
                  </Link>
                </div>

                {/* Trust Highlights */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />{" "}
                    100% Genuine
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#2563EB]" /> Fast
                    Dispatch
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-slate-600" /> GST Invoice
                  </span>
                </div>
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
                    className="flex gap-3 p-3 sm:p-3.5 bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-blue-200 transition-all items-center shadow-2xs group"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-xl bg-white p-1.5 border border-slate-200 shrink-0 relative overflow-hidden flex items-center justify-center shadow-2xs">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900 truncate leading-snug">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="truncate">SKU: {sku}</span>
                        {item.variant && (
                          <span className="text-[#2563EB] font-bold shrink-0">
                            • {item.variant.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black text-slate-900 pt-0.5">
                        ₹{price.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs shrink-0">
                      <button
                        onClick={() => {
                          haptic.light();
                          onUpdateQuantity(
                            item.product.id,
                            -1,
                            item.variant?.id,
                          );
                        }}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black px-1.5 text-slate-900 min-w-[18px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          haptic.light();
                          onUpdateQuantity(item.product.id, 1, item.variant?.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Quick Actions (Wishlist & Remove) */}
                    <div className="flex flex-col gap-1 shrink-0 pl-1 border-l border-slate-200/80">
                      <button
                        onClick={() => {
                          haptic.light();
                          moveToWishlist(item.product, item.variant?.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Save to Wishlist"
                        aria-label="Save to Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          haptic.light();
                          onRemoveItem(item.product.id, item.variant?.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove from Cart"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Cart Footer & Checkout ── */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50/80 space-y-3 shrink-0">
              {/* Coupon Row */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8.5 pr-3 py-2 text-xs uppercase font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#0A233F] hover:bg-[#12365D] text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    Apply
                  </button>
                </div>

                {!appliedCode && (
                  <button
                    type="button"
                    onClick={() => applyCouponCode("PRAYOG10")}
                    className="text-[11px] text-slate-500 hover:text-[#2563EB] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Tag className="w-3 h-3 text-[#2563EB]" />
                    <span>
                      Click to apply <strong>PRAYOG10</strong> (10% OFF)
                    </span>
                  </button>
                )}

                {appliedCode && (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Coupon <strong>{appliedCode}</strong> applied (-₹
                        {appliedDiscount.toLocaleString("en-IN")})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCode(null);
                        setAppliedDiscount(0);
                        setCoupon("");
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Calculations Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-500 pt-1 border-t border-slate-200/70">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-extrabold text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Voucher</span>
                    <span>-₹{appliedDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Pan-India Shipping &amp; GST</span>
                  <span className="text-emerald-600 font-bold">
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? "FREE Included"
                      : "Standard Included"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-[#2563EB] text-base font-black">
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
                  className="border-2 border-slate-200 hover:border-slate-800 text-slate-800 hover:text-slate-950 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all block cursor-pointer"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => {
                    haptic.medium();
                    onClose();
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-blue-500/25 block flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFC20E]" />
                </Link>
              </div>

              {/* Trust Footer */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-1 font-semibold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine</span>
                </span>
                <span>•</span>
                <span>GST Input Credit</span>
                <span>•</span>
                <span>Instant Support</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
