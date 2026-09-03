"use client";

import React from "react";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ServiceCard } from "@/components/services/ServiceCard";
import { SERVICES_DATA } from "@/data/servicesData";
import { ShieldCheck, Award, Wrench, Users } from "lucide-react";

export const ServicesLandingView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "Services" }]} />

      {/* 2. Services Header */}
      <div className="py-6 border-b border-slate-100 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
          Technical & Educational Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Turnkey Technology & STEM Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Prayog India empowers educational institutions, universities, and
          industrial enterprises with turnkey laboratory setups, custom hardware
          prototyping, and technical consultancy.
        </p>
      </div>

      {/* 3. 5 PDF Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {SERVICES_DATA.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* 4. Why Choose Prayog India Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC20E] bg-white/10 px-3 py-1 rounded-full inline-block">
            Engineering Excellence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Why Partner with Prayog India?
          </h2>
          <p className="text-xs text-slate-400">
            Over 500+ successful STEM labs and robotics installations across
            India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-center">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <Wrench className="w-6 h-6 text-[#00AEEF] mx-auto" />
            <h4 className="text-xs font-extrabold text-white">
              Turnkey Hardware
            </h4>
            <p className="text-[11px] text-slate-400">
              Complete setup from workbenches to microcontrollers.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <Award className="w-6 h-6 text-[#FFC20E] mx-auto" />
            <h4 className="text-xs font-extrabold text-white">
              Curriculum Aligned
            </h4>
            <p className="text-[11px] text-slate-400">
              Designed per NEP 2020 & ATL guidelines.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <Users className="w-6 h-6 text-[#00AEEF] mx-auto" />
            <h4 className="text-xs font-extrabold text-white">
              Faculty Training
            </h4>
            <p className="text-[11px] text-slate-400">
              Certified educator workshops included.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-extrabold text-white">
              Annual Support
            </h4>
            <p className="text-[11px] text-slate-400">
              Pan-India component warranty replacement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
