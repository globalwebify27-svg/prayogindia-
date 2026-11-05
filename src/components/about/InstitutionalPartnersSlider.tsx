"use client";

import React from "react";
import { InfiniteSlider } from "@/components/core/infinite-slider";

export function InfiniteSliderBasic() {
  return (
    <InfiniteSlider gap={28} reverse duration={25} durationOnHover={60}>
      <img
        src="/images/partners/cisf.png"
        alt="CISF"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
      <img
        src="/images/partners/tata-steel.png"
        alt="Tata Steel"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
      <img
        src="/images/partners/indian-air-force.png"
        alt="Indian Air Force"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
      <img
        src="/images/partners/indian-army.png"
        alt="Indian Army"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 rounded-lg select-none"
      />
      <img
        src="/images/partners/indian-navy.png"
        alt="Indian Navy"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
      <img
        src="/images/partners/indianoil.png"
        alt="IndianOil"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
      <img
        src="/images/partners/pwd-wb.png"
        alt="PWD Government of West Bengal"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
      <img
        src="/images/partners/tata-metaliks.png"
        alt="Tata Metaliks"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
      <img
        src="/images/partners/iit-kharagpur.png"
        alt="IIT Kharagpur"
        className="h-[70px] sm:h-[85px] md:h-[95px] w-auto object-contain shrink-0 px-2 select-none"
      />
    </InfiniteSlider>
  );
}

export function InstitutionalPartnersSection() {
  return (
    <section className="py-8 sm:py-12 bg-white border-y border-slate-200/70 overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10 2xl:-mx-12 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6 text-center">
      {/* Section Header with Centered Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative bg-white px-4 sm:px-8">
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight">
            Official Institutional &amp; Defense Partners
          </h2>
        </div>
      </div>

      {/* Clean Single Infinite Slider with Large Floating Logos */}
      <div className="py-2 overflow-hidden">
        <InfiniteSliderBasic />
      </div>
    </section>
  );
}
