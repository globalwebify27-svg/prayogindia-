import React from 'react';
import Link from 'next/link';
import { PrayogLogo } from '@/components/PrayogLogo';
import { ShoppingBag, Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center space-y-6 animate-in fade-in duration-300">
      
      <div className="w-16 h-16 rounded-3xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center border border-[#00AEEF]/20 mx-auto shadow-2xs">
        <Search className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3B30] bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested hardware catalog page, learning resource, or service URL does not exist or has been moved.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4 text-[#FFC20E]" />
          <span>Return Home</span>
        </Link>

        <Link
          href="/products"
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>

    </div>
  );
}
