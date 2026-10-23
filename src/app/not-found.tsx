import React from "react";
import Link from "next/link";
import { Home, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | Prayog India",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16 text-center animate-in fade-in duration-300 overflow-hidden">
      {/* 1. Subtle Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-50/50 via-sky-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 2. Subtle Engineering Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />

      {/* 3. Giant 404 Watermark with Soft Gradient */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
        <span className="text-[190px] sm:text-[280px] md:text-[360px] lg:text-[420px] font-black tracking-tighter bg-gradient-to-b from-slate-200/90 via-slate-100/50 to-transparent bg-clip-text text-transparent select-none leading-none font-sans drop-shadow-2xs">
          404
        </span>
      </div>

      {/* 4. Foreground Content Layer Above 404 */}
      <div className="relative z-10 max-w-lg w-full mx-auto space-y-6">

        {/* Headline & Description */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Page not found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved, renamed, or is temporarily offline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-white" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#2563EB]" />
            <span>Browse Products</span>
          </Link>
        </div>

        {/* Subtle Support Link */}
        <div className="pt-6 border-t border-slate-200/60 text-xs text-slate-500">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-[#2563EB] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Contact Support</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
