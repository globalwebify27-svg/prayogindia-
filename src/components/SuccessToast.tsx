"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  X,
  AlertCircle,
  Info,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export interface ToastData {
  id: string;
  type?: "success" | "error" | "info";
  title: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  duration?: number;
}

interface SuccessToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  toast,
  onClose,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <aside
          aria-live="polite"
          className="fixed top-16 sm:top-24 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-[calc(100vw-32px)] sm:max-w-[360px] w-full pointer-events-auto mx-auto sm:mx-0"
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl flex flex-col gap-2 ${
              toast.type === "error"
                ? "bg-rose-950/95 text-white border-rose-800"
                : toast.type === "info"
                  ? "bg-slate-900/95 text-white border-slate-700"
                  : "bg-[#0A1128]/95 text-white border-[#00AEEF]/40 shadow-[#00AEEF]/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    toast.type === "error"
                      ? "bg-rose-500/20 text-rose-400"
                      : toast.type === "info"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {toast.type === "error" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : toast.type === "info" ? (
                    <Info className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white tracking-wide">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-[11px] text-slate-300 font-medium line-clamp-2 mt-0.5">
                      {toast.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Optional Action Button */}
            {(toast.actionHref || toast.onAction) && (
              <div className="pt-1 flex justify-end">
                {toast.actionHref ? (
                  <Link
                    href={toast.actionHref}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00AEEF] hover:underline"
                  >
                    <span>{toast.actionLabel || "View"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00AEEF] hover:underline cursor-pointer"
                  >
                    <span>{toast.actionLabel || "Action"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};
