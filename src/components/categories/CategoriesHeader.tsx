import React from "react";
import Image from "next/image";
import { ShieldCheck, Award, Truck, Headphones } from "lucide-react";

interface CategoriesHeaderProps {
  title?: string;
  description?: string;
}

export const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  title = "Explore Categories",
  description = "Explore robotics, electronics, STEM, IoT and technology products.",
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F0F9FF] via-[#E6F4FE] to-[#F8FAFC] border border-sky-100/80 p-4 sm:p-5 lg:px-7 lg:py-5 shadow-2xs mb-2">
      {/* Decorative background ambient glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-10 right-10 w-60 h-60 bg-amber-100/40 rounded-full blur-2xl pointer-events-none -z-0" />

      {/* Mobile-Only Background Watermark Image */}
      <div className="block lg:hidden absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-15">
        <Image
          src="/categories-hero-banner.png"
          alt="Prayog India Robotics Background"
          fill
          priority
          className="object-contain object-bottom-right translate-y-4 translate-x-4 scale-110"
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
        {/* Left Column: Headings & Trust Badges */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-2.5">
          <span className="text-[9.5px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#00AEEF]/10 px-2.5 py-0.5 rounded-full inline-block">
            Prayog India Marketplace
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-xs text-slate-600 max-w-xl leading-relaxed">
            {description}
          </p>

          {/* 4 Trust Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
            {/* 1. Trusted Products */}
            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/85 backdrop-blur-xs border border-slate-100 shadow-2xs">
              <div className="w-7 h-7 rounded-md bg-sky-50 text-[#00AEEF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="leading-none">
                <div className="text-[10.5px] font-black text-slate-900">
                  Trusted
                </div>
                <div className="text-[9px] font-semibold text-slate-500">
                  Products
                </div>
              </div>
            </div>

            {/* 2. Genuine Brands */}
            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/85 backdrop-blur-xs border border-slate-100 shadow-2xs">
              <div className="w-7 h-7 rounded-md bg-sky-50 text-[#00AEEF] flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="leading-none">
                <div className="text-[10.5px] font-black text-slate-900">
                  Genuine
                </div>
                <div className="text-[9px] font-semibold text-slate-500">
                  Brands
                </div>
              </div>
            </div>

            {/* 3. Fast & Safe Delivery */}
            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/85 backdrop-blur-xs border border-slate-100 shadow-2xs">
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="leading-none">
                <div className="text-[10.5px] font-black text-slate-900">
                  Fast & Safe
                </div>
                <div className="text-[9px] font-semibold text-slate-500">
                  Delivery
                </div>
              </div>
            </div>

            {/* 4. Expert Support */}
            <div className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white/85 backdrop-blur-xs border border-slate-100 shadow-2xs">
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <div className="leading-none">
                <div className="text-[10.5px] font-black text-slate-900">
                  Expert
                </div>
                <div className="text-[9px] font-semibold text-slate-500">
                  Support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Desktop Banner Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 relative items-center justify-end">
          <div className="relative w-full h-[180px] lg:h-[200px]">
            <Image
              src="/categories-hero-banner.png"
              alt="Prayog India Robotics, Drone & Arduino Hardware Showcase"
              fill
              priority
              className="object-contain object-right drop-shadow-sm"
            />
          </div>

          {/* Slogan Accent on Right Edge */}
          <div className="hidden sm:flex flex-col items-start gap-0.5 absolute right-1 top-2 pointer-events-none text-right">
            <span className="text-[9px] font-black tracking-widest text-[#00AEEF] uppercase">
              BUILD
            </span>
            <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
              INNOVATE
            </span>
            <span className="text-[9px] font-black tracking-widest text-[#00AEEF] uppercase">
              CREATE
            </span>
            <div className="w-5 h-0.5 bg-[#00AEEF] mt-0.5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
