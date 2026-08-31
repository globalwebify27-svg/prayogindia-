'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface PromoProps {
  onShopNow: () => void;
}

export const PromoBanner: React.FC<PromoProps> = ({ onShopNow }) => {
  return (
    <section id="offers" className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0A1128] via-[#0F172A] to-[#1E56A0] overflow-hidden shadow-2xl p-8 sm:p-12 border border-[#D4AF37]/30">
          
          {/* Subtle Technical Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Content Side */}
            <div className="lg:col-span-7 space-y-6 text-white">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-3.5 py-1 rounded-full text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> DILAY ROBOTICS INNOVATION HUB
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Build. Experiment. <br />
                <span className="text-[#D4AF37]">Innovate.</span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Everything you need for robotics, electronics and STEM innovation. Equipping India&apos;s next generation of robotics engineers & research pioneers.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onShopNow}
                  className="bg-[#D4AF37] hover:bg-amber-400 text-slate-950 font-extrabold px-8 py-4 rounded-full text-base shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-3"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 pl-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>GST Billing & Institutional Procurement</span>
                </div>
              </div>
            </div>

            {/* Visual Side */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-16/9 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <Image
                  src="/images/promo_banner.jpg"
                  alt="Prayog India STEM Robotics Workbench"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
