"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { useWishlistStore, CartItem } from "@/store";
import { useUIStore } from "@/store/useUIStore";
import { getProductStock } from "@/data/mockData";
import { haptic } from "@/utils/haptics";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

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
  onOpenB2BModal?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  useBodyScrollLock(isOpen);
  const moveToWishlist = useWishlistStore((s) => s.moveToWishlist);

  if (!isOpen) return null;

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const total = subtotal;

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

  const FREE_SHIPPING_THRESHOLD = 999;
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans overscroll-contain">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 touch-none"
      />

      <div className="fixed top-0 bottom-[calc(60px+env(safe-area-inset-bottom))] sm:bottom-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* ── Cart Header ── */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Your Cart
                </h2>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4" />
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
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3 sm:space-y-3.5">
            {hasBatteryOrHazardous && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5 text-[11px] text-amber-800 font-medium shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  DGCA Surface freight rule active for battery/chemical items.
                </span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-6 sm:py-8 px-2 space-y-3.5 animate-in fade-in duration-300">
                {/* 3D Robot Empty Cart Illustration */}
                <div className="relative w-32 h-28 sm:w-36 sm:h-32 mx-auto">
                  <Image
                    src="/images/empty-cart-robot.png"
                    alt="Your Cart is Empty"
                    fill
                    className="object-contain mix-blend-multiply"
                    priority
                  />
                </div>

                {/* Main Copy */}
                <div className="max-w-xs mx-auto">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Your Cart is Empty
                  </h3>
                </div>

                {/* Popular Categories Shortcut */}
                <div className="pt-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Popular Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-xs mx-auto">
                    {[
                      { label: "Robotics Kits", href: "/categories" },
                      { label: "Arduino", href: "/products" },
                      { label: "Sensors", href: "/categories" },
                      { label: "Drones & RC", href: "/products" },
                      { label: "Top Deals", href: "/offers" },
                    ].map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={onClose}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/80 text-[11px] font-medium text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Primary Catalog CTA */}
                <div className="pt-1.5">
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Browse Catalogue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const price = item.variant
                  ? item.variant.price
                  : item.product.price;
                const mrp = item.variant ? item.variant.mrp : item.product.mrp;
                const sku = item.variant ? item.variant.sku : item.product.sku;
                const maxStock = getProductStock(item.product, item.variant);
                const isAtMaxStock = item.quantity >= maxStock;
                const isInStock =
                  (item.variant
                    ? item.variant.inStock
                    : item.product.inStock) && maxStock > 0;

                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || "std"}`}
                    className="p-3 sm:p-3.5 bg-white hover:bg-slate-50/50 rounded-2xl border border-slate-200/90 hover:border-blue-200 transition-all shadow-2xs flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.product.slug || item.product.id}`}
                        onClick={onClose}
                        className="shrink-0"
                      >
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 p-1 border border-slate-200/80 overflow-hidden flex items-center justify-center shadow-2xs group-hover:border-blue-200 transition-colors">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-400">
                            {sku}
                          </span>
                          {!isInStock && (
                            <span className="text-[9px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                              Out of Stock
                            </span>
                          )}
                          {item.variant && (
                            <span className="text-[10px] text-[#2563EB] font-bold">
                              • {item.variant.name}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/products/${item.product.slug || item.product.id}`}
                          onClick={onClose}
                        >
                          <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 hover:text-[#2563EB] transition-colors leading-snug">
                            {item.product.name}
                          </h4>
                        </Link>

                        {/* Price with strikethrough MRP */}
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                          {mrp > price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Stock status indicator */}
                        {isAtMaxStock ? (
                          <div className="text-[10px] font-bold text-amber-600">
                            Max available stock reached ({maxStock} in stock)
                          </div>
                        ) : maxStock <= 5 && maxStock > 0 ? (
                          <div className="text-[10px] font-bold text-rose-500">
                            Only {maxStock} left in stock
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Stepper & Actions (Stacked vertically on right, matching Cart page) */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => {
                            haptic.light();
                            onUpdateQuantity(
                              item.product.id,
                              -1,
                              item.variant?.id,
                            );
                          }}
                          className="w-6 h-6 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 text-slate-900 min-w-[18px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            haptic.light();
                            if (isAtMaxStock) {
                              useUIStore.getState().showToast({
                                title: `Only ${maxStock} units available in stock`,
                                type: "error",
                                duration: 2500,
                              });
                              return;
                            }
                            onUpdateQuantity(
                              item.product.id,
                              1,
                              item.variant?.id,
                            );
                          }}
                          disabled={isAtMaxStock}
                          className={`w-6 h-6 flex items-center justify-center transition-colors ${
                            isAtMaxStock
                              ? "text-slate-300 cursor-not-allowed bg-slate-50"
                              : "text-slate-600 hover:bg-slate-100 cursor-pointer"
                          }`}
                          aria-label="Increase quantity"
                          title={
                            isAtMaxStock
                              ? `Only ${maxStock} units available in stock`
                              : "Increase quantity"
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Quick Actions (Wishlist & Remove side-by-side) */}
                      <div className="flex items-center gap-1">
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
                  </div>
                );
              })
            )}
          </div>

          {/* ── Cart Footer & Checkout ── */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50/80 space-y-3 shrink-0">
              {/* Calculations Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-extrabold text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
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
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Button: Proceed to Buy */}
              <div className="pt-1">
                <Link
                  href="/checkout"
                  onClick={() => {
                    haptic.medium();
                    onClose();
                  }}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white py-3.5 px-4 rounded-xl font-bold text-sm text-center transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span>
                    Proceed to Buy ({totalItemCount}{" "}
                    {totalItemCount === 1 ? "item" : "items"})
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
