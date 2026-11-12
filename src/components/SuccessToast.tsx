"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info } from "lucide-react";
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

  const isError =
    toast?.type === "error" ||
    toast?.iconType === "stock-limit" ||
    toast?.title?.toLowerCase().includes("units available") ||
    toast?.title?.toLowerCase().includes("only ") ||
    toast?.title?.toLowerCase().includes("out of stock") ||
    toast?.title?.toLowerCase().includes("not available");

  const isInfo = toast?.type === "info" && !isWishlistRemove;

  // Determine dynamic toast message content
  let content = "";
  if (isWishlistAdd) {
    content = "Product added to wishlist!";
  } else if (isWishlistRemove) {
    content = "Product removed from wishlist!";
  } else if (isCartAdd) {
    content = "Product added to cart!";
  } else if (toast?.title) {
    content = toast.title;
  } else if (toast?.message) {
    content = toast.message;
  }

  useEffect(() => {
    if (!toast || isPaused) return;

    const timeoutDuration = toast.duration || 2600;

    const timer = setTimeout(() => {
      onCloseRef.current();
    }, timeoutDuration);

    return () => {
      clearTimeout(timer);
    };
  }, [toast?.id, isPaused, toast?.duration]);

  return (
    <AnimatePresence mode="wait">
      {toast && (
        <aside
          key={toast.id}
          aria-live="polite"
          className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto select-none max-w-[calc(100vw-32px)]"
          onClick={onClose}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
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
                isError
                  ? "bg-[#EF4444] text-white"
                  : isWishlistRemove
                  ? "bg-slate-700 text-white"
                  : isInfo
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#10B981] text-white"
              }`}
            >
              {isError ? (
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3.5] text-white" />
              ) : isWishlistRemove ? (
                <X className="w-3.5 h-3.5 stroke-[3] text-white" />
              ) : isInfo ? (
                <Info className="w-3.5 h-3.5 stroke-[3] text-white" />
              ) : (
                <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
              )}
            </div>
            <span className="text-[15px] sm:text-[16px] font-semibold text-slate-900 tracking-tight">
              {content}
            </span>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};
