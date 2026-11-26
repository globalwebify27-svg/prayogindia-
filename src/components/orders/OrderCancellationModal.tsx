"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  X,
  CheckCircle2,
  Package,
  CreditCard,
  Check,
  ChevronDown,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { CANCELLATION_REASONS } from "@/lib/cancellationConstants";

export interface OrderCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status?: string;
    paymentMethod?: string;
    items?: Array<{
      name?: string;
      productName?: string;
      image?: string;
      quantity?: number;
      price?: number;
    }>;
    [key: string]: any;
  };
  onSuccess?: (cancellationData: any) => void;
}

export const OrderCancellationModal: React.FC<OrderCancellationModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherComment, setOtherComment] = useState<string>("");
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!isOpen) return null;

  const firstItem = order.items?.[0];
  const productName =
    firstItem?.productName || firstItem?.name || "Ordered Hardware Component";
  const productImage = firstItem?.image || "/images/products/arduino-uno-r3.png";
  const totalQuantity =
    order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;

  const isOther = selectedReason === "Other";
  const isValid = selectedReason && (!isOther || otherComment.trim().length > 0);

  const isPrepaid = !(
    order.paymentMethod?.toLowerCase().includes("cod") ||
    order.paymentMethod?.toLowerCase().includes("cash on delivery")
  );

  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMsg("Please select why you want to cancel this order.");
      return;
    }
    if (isOther && !otherComment.trim()) {
      setErrorMsg("Please tell us why you want to cancel your order.");
      return;
    }
    setErrorMsg(null);
    setIsConfirmStep(true);
  };

  const handleFinalCancelSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          comment: isOther ? otherComment.trim() : null,
          initiatedBy: "Customer",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to cancel order.");
      }

      setSuccessData(json.cancellation);

      // Reconcile and update local orders storage so UI stays in sync
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("prayog_placed_orders");
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map((o: any) => {
              if (o.id === order.id || o.orderNumber === order.orderNumber) {
                return {
                  ...o,
                  status: "CANCELLED",
                  cancelledAt: new Date().toISOString(),
                  cancelReason: selectedReason,
                  cancellationReferenceId: json.cancellation?.cancellationReferenceId,
                  refundStatus: json.cancellation?.refundStatus,
                };
              }
              return o;
            });
            localStorage.setItem("prayog_placed_orders", JSON.stringify(updated));
            window.dispatchEvent(new Event("prayog_orders_updated"));
          }
        } catch (e) {
          console.warn("Could not update local storage cache:", e);
        }
      }

      if (onSuccess) {
        onSuccess(json.cancellation);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while processing cancellation.");
      setIsConfirmStep(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setSelectedReason("");
    setOtherComment("");
    setIsConfirmStep(false);
    setErrorMsg(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3.5 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={handleModalClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Container */}
      <div className="relative max-w-lg w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-200/80">
        {/* Close Button */}
        {!isSubmitting && (
          <button
            type="button"
            onClick={handleModalClose}
            className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ── SUCCESS STATE ── */}
        {successData ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Your order has been cancelled successfully.
              </h3>
              <p className="text-xs text-slate-500">
                A confirmation has been saved and your inventory reservation has been restored.
              </p>
            </div>

            {/* Structured Details Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Order ID:</span>
                <span className="font-mono font-bold text-slate-900">
                  {order.orderNumber}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Cancellation Ref ID:</span>
                <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                  {successData.cancellationReferenceId}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Cancellation Date:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(successData.cancellationDate || Date.now()).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Cancellation Reason:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                  {successData.cancellationReason}
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-500 font-medium">Refund Status:</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    successData.refundStatus === "Not Applicable"
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  }`}
                >
                  <CreditCard className="w-3 h-3" />
                  <span>{successData.refundStatus || "Not Applicable"}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Done &amp; View Orders
            </button>
          </div>
        ) : isConfirmStep ? (
          /* ── FINAL CONFIRMATION STEP ── */
          <div className="space-y-4 py-1">
            <div className="flex items-start gap-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-rose-900">
                  Please Confirm Your Order Cancellation
                </h4>
                <p className="text-rose-700 leading-relaxed font-normal">
                  Are you sure you want to cancel order <strong>#{order.orderNumber}</strong>? Once cancelled, this action cannot be undone.
                  {isPrepaid
                    ? " Your payment will be refunded to your original payment method."
                    : " Since this was a Cash on Delivery order, no payment deduction occurred."}
                </p>
              </div>
            </div>

            {/* Summary preview */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Reason:</span>
                <span className="font-semibold text-slate-900">{selectedReason}</span>
              </div>
              {isOther && otherComment && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Details:</span>
                  <span className="text-slate-700 text-right truncate max-w-[220px]">
                    {otherComment}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Total Refund Amount:</span>
                <span className="font-bold text-slate-900">
                  {isPrepaid ? `₹${order.totalAmount.toLocaleString("en-IN")}` : "₹0 (COD)"}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsConfirmStep(false)}
                className="w-full sm:flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Keep My Order
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalCancelSubmit}
                className="w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ── MAIN CANCELLATION MODAL STEP ── */
          <form onSubmit={handleProceedToConfirmation} className="space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Cancel Your Order?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                We are sorry to see your cancellation. Please review your order items below.
              </p>
            </div>

            {/* Order Item Preview Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3 text-xs">
              <div className="w-14 h-14 shrink-0 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center relative overflow-hidden">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-contain p-0.5"
                  sizes="56px"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {productName}
                </h4>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <span>Qty: {totalQuantity}</span>
                  <span>•</span>
                  <span>Order #{order.orderNumber}</span>
                </div>
                <div className="text-slate-900 font-extrabold text-xs sm:text-sm pt-0.5">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Mandatory Reason Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="cancel-reason"
                className="block text-xs font-bold text-slate-800"
              >
                Why do you want to cancel this order? <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <select
                  id="cancel-reason"
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent appearance-none cursor-pointer pr-10 shadow-2xs font-medium"
                >
                  <option value="" disabled>
                    -- Select a cancellation reason --
                  </option>
                  {CANCELLATION_REASONS.map((r, i) => (
                    <option key={r} value={r}>
                      {i + 1}. {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Conditional "Other" Textarea */}
            {isOther && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label
                  htmlFor="cancel-comment"
                  className="block text-xs font-bold text-slate-800"
                >
                  Please specify your reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="cancel-comment"
                  rows={3}
                  value={otherComment}
                  onChange={(e) => {
                    setOtherComment(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Please tell us why you want to cancel..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent shadow-2xs resize-none"
                />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Keep My Order
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="w-full sm:flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                Proceed to Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
