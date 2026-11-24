"use client";

import React, { useState } from "react";
import { Flag, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface ReportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    id: string;
    author: string;
    productName?: string;
  } | null;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  "Inappropriate language or profanity",
  "Spam, advertising, or promotional content",
  "Fake or fabricated review",
  "Wrong or unrelated product review",
  "Harassment, hate speech, or offensive content",
  "Other policy violation",
];

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  isOpen,
  onClose,
  review,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Submit report to API
      await fetch("/api/reviews/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          reason: selectedReason,
          details: additionalDetails.trim(),
        }),
      });

      // 2. Mark as reported in localStorage cache
      try {
        const stored = localStorage.getItem("prayog_product_reviews");
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((r: any) =>
            r.id === review.id
              ? {
                  ...r,
                  isReported: true,
                  reportReason: selectedReason,
                  reportedAt: new Date().toISOString(),
                }
              : r
          );
          localStorage.setItem("prayog_product_reviews", JSON.stringify(updated));
        }
      } catch {}

      setSuccess(true);
      setTimeout(() => {
        setSubmitting(false);
        setSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch {
      setSuccess(true);
      setTimeout(() => {
        setSubmitting(false);
        setSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 select-none">
      <div
        className="w-full max-w-md bg-white rounded-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Report Review</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">
              Report Submitted
            </h4>
            <p className="text-xs text-slate-500">
              Thank you for keeping Prayog India safe. Our moderation team will inspect this review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <p className="text-slate-600">
              Help us understand what is wrong with the review by{" "}
              <strong>{review.author}</strong>:
            </p>

            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-rose-600"
                  />
                  <span className="text-slate-800 font-medium">{reason}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Provide any additional context..."
                className="w-full p-2 border border-slate-200 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
