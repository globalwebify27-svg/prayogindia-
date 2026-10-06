"use client";

import React from "react";
import Image from "next/image";
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  PhoneCall,
  Sparkles,
} from "lucide-react";

export const B2BInstitutionalPromoBanner: React.FC = () => {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#071927] border border-slate-800 text-white p-6 sm:p-10 relative overflow-hidden shadow-2xl">
      {/* Background Lighting Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00AEEF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-[#FFC20E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Text & Value */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Institutions &amp; Labs
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              ATL • Colleges • R&amp;D Centers • Defense Startups
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Setting up a Robotics, Drone or IoT Lab?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Get exclusive institutional bulk discount slabs up to 25%, formal GST input credit tax invoices, Net-30 purchase order payment terms, and customized robotics curriculum kits.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#00AEEF] shrink-0" />
              <span>Bulk Tier Discounts</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>18% GST Input Credit</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official PO Invoicing</span>
            </div>
          </div>
        </div>

        {/* Right Column: CTA Buttons */}
        <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
          <a
            href="https://wa.me/919876543210?text=Hello%20Prayog%20India%20Team%2C%20I%20am%20looking%20for%20an%20Institutional%20B2B%20Lab%20Setup%20Quote%20and%20Bulk%20Discounts."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95 transition-all text-center"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat With Institutional Desk</span>
          </a>

          <a
            href="/contact"
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
          >
            <span>Request Custom Quotation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
