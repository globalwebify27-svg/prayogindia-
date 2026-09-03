"use client";

import React from "react";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { COMPANY_INFO } from "@/data/companyData";
import {
  ShieldCheck,
  Target,
  Eye,
  Wrench,
  BookOpen,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "About Prayog India" }]} />

      {/* 2. Header */}
      <div className="py-6 border-b border-slate-100 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
          Institutional Overview
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          About Prayog India
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          {COMPANY_INFO.tagline}
        </p>
      </div>

      {/* 3. Company Introduction */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Our Identity & Mission
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
          {COMPANY_INFO.description}
        </p>
      </section>

      {/* 4. Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Our Mission</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {COMPANY_INFO.mission}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Our Vision</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {COMPANY_INFO.vision}
          </p>
        </div>
      </div>

      {/* 5. What We Do (Connections to Products, Services, Learning Hub) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            What We Do
          </h2>
          <p className="text-xs text-slate-500">
            Connecting hardware, education, and engineering services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <ShoppingBag className="w-6 h-6 text-[#00AEEF]" />
              <h4 className="text-base font-extrabold text-slate-900">
                100% Genuine Hardware
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Official distributor of Arduino, Raspberry Pi, flight
                controllers, LiDAR sensors, and electronic components.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 pt-2"
            >
              <span>Explore Products Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <Wrench className="w-6 h-6 text-[#00AEEF]" />
              <h4 className="text-base font-extrabold text-slate-900">
                Turnkey Lab Setup Services
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                STEM labs, Robotics mechatronics setup, UAV Drone flight
                centers, and custom R&D industrial engineering projects.
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 pt-2"
            >
              <span>Explore Lab Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <BookOpen className="w-6 h-6 text-[#00AEEF]" />
              <h4 className="text-base font-extrabold text-slate-900">
                Learning Hub & Tutorials
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Curriculum manuals, pinout references, sensor tutorials, and
                educator workshop certifications.
              </p>
            </div>
            <Link
              href="/learning-hub"
              className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 pt-2"
            >
              <span>Explore Learning Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Contact CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-white">
            Have an Institutional Query?
          </h3>
          <p className="text-xs text-slate-400">
            Speak directly with our mechatronics engineers and lab setup team.
          </p>
        </div>

        <Link
          href="/contact"
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
};
