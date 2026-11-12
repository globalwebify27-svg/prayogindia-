"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Check,
  X,
  AlertCircle,
  Info,
  ArrowRight,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/mockData";

export interface ToastData {
  id: string;
  type?: "success" | "error" | "info";
  title: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  duration?: number;
  product?: Product;
  count?: number;
  iconType?: "wishlist-add" | "wishlist-remove" | "cart-add" | "stock-limit" | "default";
}

interface SuccessToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  toast,
  onClose,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isWishlistAdd =
    toast?.iconType === "wishlist-add" ||
    (toast?.title?.toLowerCase().includes("wishlist") &&
      toast?.type === "success");

  const isWishlistRemove =
    toast?.iconType === "wishlist-remove" ||
    (toast?.title?.toLowerCase().includes("wishlist") &&
      toast?.type === "info");

  const isCartAdd =
    toast?.iconType === "cart-add" ||
    (toast?.title?.toLowerCase().includes("cart") &&
      toast?.type === "success");

  const isStockLimit =
    toast?.iconType === "stock-limit" ||
    toast?.title?.toLowerCase().includes("units available") ||
    toast?.title?.toLowerCase().includes("only ");

  const isCenterPill = isWishlistAdd || isWishlistRemove || isCartAdd || isStockLimit;

  useEffect(() => {
    if (!toast || isPaused) return;

    const timeoutDuration =
      isCenterPill ? 2600 : (toast.duration || 3500);

    const timer = setTimeout(() => {
      onCloseRef.current();
    }, timeoutDuration);

    return () => {
      clearTimeout(timer);
    };
  }, [toast?.id, isPaused, isCenterPill]);

  return (
    <AnimatePresence mode="wait">
      {toast && (
        isCenterPill ? (
          <aside
            key={toast.id}
            aria-live="polite"
            className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto select-none"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-[0_12px_38px_-6px_rgba(0,0,0,0.16),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-200/90 px-6 py-3.5 flex items-center gap-3.5 whitespace-nowrap cursor-pointer hover:shadow-md transition-shadow"
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  isStockLimit
                    ? "bg-[#EF4444] text-white"
                    : isWishlistRemove
                    ? "bg-slate-700 text-white"
                    : "bg-[#10B981] text-white"
                }`}
              >
                {isStockLimit ? (
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3.5] text-white" />
                ) : isWishlistRemove ? (
                  <X className="w-3.5 h-3.5 stroke-[3] text-white" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                )}
              </div>
              <span className="text-[15px] sm:text-[16px] font-semibold text-slate-900 tracking-tight">
                {isStockLimit
                  ? toast.title
                  : isWishlistAdd
                  ? "Product added to wishlist!"
                  : isWishlistRemove
                  ? "Product removed from wishlist!"
                  : "Product added to cart!"}
              </span>
            </motion.div>
          </aside>
        ) : (
          <aside
            key={toast.id}
            aria-live="polite"
            className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100vw-32px)] sm:max-w-[460px] w-full pointer-events-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`relative overflow-hidden rounded-2xl p-3 sm:p-3.5 shadow-[0_18px_40px_-8px_rgba(15,23,42,0.18),0_4px_16px_rgba(0,0,0,0.06)] border backdrop-blur-md bg-white/98 text-slate-900 transition-all ${
                toast.type === "error"
                  ? "border-rose-200/90"
                  : toast.type === "info"
                    ? "border-blue-200/90"
                    : isWishlistRemove
                      ? "border-slate-200"
                      : isWishlistAdd
                        ? "border-slate-200/90 shadow-[0_18px_40px_-8px_rgba(15,23,42,0.14),0_2px_10px_rgba(244,63,94,0.06)]"
                        : "border-slate-200/90"
              }`}
            >
              {/* If product preview exists (Compact single-tier card) */}
              {toast.product ? (
                <div className="flex items-center gap-3 relative z-10">
                  {/* Product thumbnail with floating animated heart badge */}
                  <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 p-0.5 shrink-0 flex items-center justify-center">
                    <Image
                      src={toast.product.image}
                      alt={toast.product.name}
                      fill
                      className="object-contain p-0.5"
                    />
                    {isWishlistAdd ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.25, 1] }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs border border-white"
                      >
                        <Heart className="w-2.5 h-2.5 fill-white text-white" />
                      </motion.span>
                    ) : isWishlistRemove ? (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-xs border border-white">
                        <Heart className="w-2.5 h-2.5 text-white" />
                      </span>
                    ) : null}
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                        {isWishlistAdd
                          ? "Saved to Wishlist"
                          : isWishlistRemove
                            ? "Removed"
                            : toast.title}
                      </span>
                      {typeof toast.count === "number" && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full border border-slate-200/60 shrink-0">
                          {toast.count}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate mt-0.5 leading-tight">
                      {toast.product.name}
                    </p>

                    <div className="text-xs font-black text-[#2563EB] mt-0.5 leading-none">
                      ₹{toast.product.price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Action + Close Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {toast.actionHref ? (
                      <Link
                        href={toast.actionHref}
                        onClick={onClose}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : toast.onAction ? (
                      <button
                        onClick={() => {
                          toast.onAction?.();
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{toast.actionLabel || "View"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : null}

                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Close notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Fallback generic toast (centered clean card style) */
                <div className="flex items-start gap-3 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      toast.type === "error"
                        ? "bg-rose-50 text-rose-600 border border-rose-200/80"
                        : toast.type === "info"
                          ? "bg-blue-50 text-blue-600 border border-blue-200/80"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
                    }`}
                  >
                    {toast.type === "error" ? (
                      <AlertCircle className="w-4 h-4 stroke-[2.2]" />
                    ) : toast.type === "info" ? (
                      <Info className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug tracking-tight">
                      {toast.title}
                    </h4>
                    {toast.message && (
                      <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-relaxed mt-0.5">
                        {toast.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-start mt-0.5">
                    {toast.actionHref && (
                      <Link
                        href={toast.actionHref}
                        onClick={onClose}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white text-[11px] font-bold hover:bg-[#1D4ED8] transition-colors"
                      >
                        {toast.actionLabel || "View"}
                      </Link>
                    )}
                    {toast.onAction && (
                      <button
                        onClick={() => {
                          toast.onAction?.();
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white text-[11px] font-bold hover:bg-[#1D4ED8] transition-colors"
                      >
                        {toast.actionLabel || "View"}
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Close notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </aside>
        )
      )}
    </AnimatePresence>
  );
};
