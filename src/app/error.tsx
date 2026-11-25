"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-md w-full text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected error occurred while loading this page. Please try again or return to the store homepage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
