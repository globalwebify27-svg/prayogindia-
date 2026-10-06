"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
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
  iconType?: "wishlist-add" | "wishlist-remove" | "default";
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!toast || isPaused) return;

    timerRef.current = setTimeout(() => {
      onClose();
    }, toast.duration || 3800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast, isPaused, onClose]);

  const isWishlistAdd =
    toast?.iconType === "wishlist-add" ||
    (toast?.title?.toLowerCase().includes("wishlist") &&
      toast?.type === "success");

  const isWishlistRemove =
    toast?.iconType === "wishlist-remove" ||
    (toast?.title?.toLowerCase().includes("wishlist") &&
      toast?.type === "info");

  return (
    <AnimatePresence>
      {toast && (
        <aside
          aria-live="polite"
          className="fixed top-16 sm:top-24 right-3 sm:right-6 z-50 max-w-[calc(100vw-24px)] sm:max-w-[325px] w-full pointer-events-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 380 }}
            className={`relative overflow-hidden rounded-xl p-2.5 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(0,0,0,0.04)] border backdrop-blur-md bg-white/95 text-slate-900 transition-all ${
              toast.type === "error"
                ? "border-rose-200"
                : isWishlistRemove
                  ? "border-slate-200"
                  : isWishlistAdd
                    ? "border-slate-200/90 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.1),0_2px_10px_rgba(244,63,94,0.06)]"
                    : "border-slate-200/90"
            }`}
          >
            {/* If product preview exists (Compact single-tier card) */}
            {toast.product ? (
              <div className="flex items-center gap-2.5 relative z-10">
                {/* Product thumbnail with floating animated heart badge */}
                <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 shrink-0 flex items-center justify-center">
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
                    <span className="text-[11px] font-extrabold text-slate-900 tracking-tight">
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

                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5 leading-tight">
                    {toast.product.name}
                  </p>

                  <div className="text-[11px] font-black text-[#00AEEF] mt-0.5 leading-none">
                    ₹{toast.product.price.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Action + Close Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {toast.actionHref ? (
                    <Link
                      href={toast.actionHref}
                      onClick={onClose}
                      className="px-2.5 py-1 rounded-lg bg-[#00AEEF] hover:bg-[#0096D6] text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  ) : toast.onAction ? (
                    <button
                      onClick={() => {
                        toast.onAction?.();
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#00AEEF] hover:bg-[#0096D6] text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{toast.actionLabel || "View"}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ) : null}

                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Close notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback generic toast (compact style) */
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      toast.type === "error"
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : toast.type === "info"
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    }`}
                  >
                    {toast.type === "error" ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : toast.type === "info" ? (
                      <Info className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {toast.title}
                    </h4>
                    {toast.message && (
                      <p className="text-[11px] text-slate-600 truncate">
                        {toast.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {toast.actionHref && (
                    <Link
                      href={toast.actionHref}
                      onClick={onClose}
                      className="px-2 py-0.5 rounded-md bg-[#00AEEF] text-white text-[10px] font-bold hover:bg-[#0096D6]"
                    >
                      {toast.actionLabel || "View"}
                    </Link>
                  )}
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Subtle Hairline Auto-Dismiss Timer Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: isPaused ? "100%" : "0%" }}
                transition={{
                  duration: isPaused ? 0 : (toast.duration || 3800) / 1000,
                  ease: "linear",
                }}
                className={`h-full ${
                  toast.type === "error"
                    ? "bg-rose-500"
                    : isWishlistRemove
                      ? "bg-slate-400"
                      : "bg-gradient-to-r from-rose-500 via-[#00AEEF] to-[#1E56A0]"
                }`}
              />
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};
