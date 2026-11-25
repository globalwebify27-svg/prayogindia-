"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, LogIn } from "lucide-react";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Account page error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-md w-full text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Account Dashboard Notice
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn&apos;t load your account information right now. Please reload or sign in to refresh your session.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
