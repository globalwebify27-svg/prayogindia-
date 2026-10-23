"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  FileCheck2,
  Headphones,
  ChevronRight,
  ArrowRight,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { PrayogLogo } from "./PrayogLogo";

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-slate-50/70 via-white to-slate-50/90 text-slate-800 pt-12 sm:pt-16 pb-24 lg:pb-12 border-t border-slate-200/90 overflow-hidden">
      {/* ── Top Subtle Brand Accent Line ── */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-80" />

      {/* ── Background Branding Watermark ("PRAYOG INDIA") ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-center items-center z-0">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-blue-100/30 via-indigo-50/15 to-transparent blur-3xl" />

        {/* Primary Giant Architectural Watermark */}
        <div className="w-full flex items-center justify-center opacity-[0.032] sm:opacity-[0.042] transform -translate-y-6">
          <span
            className="text-[13vw] font-black tracking-tighter uppercase whitespace-nowrap text-slate-900 leading-none select-none"
            style={{
              letterSpacing: "-0.04em",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            PRAYOG INDIA
          </span>
        </div>

        {/* Secondary subtle outline watermark in bottom-right */}
        <div className="absolute bottom-16 right-[-2vw] opacity-[0.022] hidden md:block select-none pointer-events-none">
          <span
            className="text-[7.5vw] font-black uppercase text-transparent tracking-widest whitespace-nowrap"
            style={{
              WebkitTextStroke: "2px #2563EB",
            }}
          >
            THE WORLD OF ROBOTICS
          </span>
        </div>
      </div>

      {/* ── Content Container ── */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* ── Top Feature / Trust Highlights Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pb-10 mb-10 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/70 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">100% Genuine Hardware</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Authentic microchips with warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/70 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Fast Pan-India Dispatch</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">ESD-safe packaging to all pincodes</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/70 shadow-2xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">GST Tax Compliance</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Instant input tax credit invoices</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/70 shadow-2xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Engineer Tech Support</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Mechatronics &amp; robotics assistance</p>
            </div>
          </div>
        </div>

        {/* ── Main 4-Column Grid Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          {/* Column 1: Company Logo, Bio, Contact Details, Social & CTA (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <PrayogLogo size="lg" dark={false} />
            </Link>

            {/* Bio Paragraph */}
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              Prayog India, established with a vision to advance robotics and STEM innovation, is now India&apos;s leading technology and hardware platform. Serving schools, universities, DIY makers, and industrial innovators nationwide with authentic components, turnkey lab setups, and mechatronics kits.
            </p>

            {/* Detailed Contact List */}
            <div className="space-y-3 pt-1">
              {/* Contact Item 1: Robotics & Lab Solutions */}
              <div className="group flex items-start gap-3 p-1.5 rounded-lg hover:bg-white/80 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100/80 flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 group-hover:bg-[#2563EB] group-hover:text-white shadow-2xs">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="block text-[11px] font-bold text-slate-900 leading-tight">
                    Robotics &amp; Lab Solutions
                  </span>
                  <a
                    href="tel:+918709789641"
                    className="text-xs font-semibold text-slate-600 hover:text-[#2563EB] transition-colors"
                  >
                    +91 87097 89641
                  </a>
                </div>
              </div>

              {/* Contact Item 2: Business Email */}
              <div className="group flex items-start gap-3 p-1.5 rounded-lg hover:bg-white/80 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100/80 flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 group-hover:bg-[#2563EB] group-hover:text-white shadow-2xs">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <div>
                  <a
                    href="mailto:business@prayogindia.com"
                    className="text-xs font-semibold text-slate-600 hover:text-[#2563EB] transition-colors"
                  >
                    business@prayogindia.com
                  </a>
                </div>
              </div>

              {/* Contact Item 3: Sales & Institutional Inquiry */}
              <div className="group flex items-start gap-3 p-1.5 rounded-lg hover:bg-white/80 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100/80 flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 group-hover:bg-[#2563EB] group-hover:text-white shadow-2xs">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="block text-[11px] font-bold text-slate-900 leading-tight">
                    Sales &amp; Institutional Inquiry
                  </span>
                  <a
                    href="tel:+918709789641"
                    className="text-xs font-semibold text-slate-600 hover:text-[#2563EB] transition-colors"
                  >
                    +91 87097 89641
                  </a>
                </div>
              </div>

              {/* Contact Item 4: General Email */}
              <div className="group flex items-start gap-3 p-1.5 rounded-lg hover:bg-white/80 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100/80 flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 group-hover:bg-[#2563EB] group-hover:text-white shadow-2xs">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <div>
                  <a
                    href="mailto:info@prayogindia.com"
                    className="text-xs font-semibold text-slate-600 hover:text-[#2563EB] transition-colors"
                  >
                    info@prayogindia.com
                  </a>
                </div>
              </div>

              {/* Contact Item 5: Registered Hub Address */}
              <div className="group flex items-start gap-3 p-1.5 rounded-lg hover:bg-white/80 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100/80 flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 group-hover:bg-[#2563EB] group-hover:text-white shadow-2xs">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                  Prayog India Tech Hub, Plot No. 42, Industrial Area, Ranchi, Jharkhand - 834001, India.
                </p>
              </div>
            </div>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#c4302b] hover:bg-[#a0221e] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-[#0077b5] hover:bg-[#005582] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>

            {/* Action CTA Pill Button */}
            <div className="pt-2">
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:from-[#0d7a6e] hover:to-[#054c43] active:scale-98 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-emerald-400/30"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Join Our WhatsApp Channel</span>
              </a>
            </div>
          </div>

          {/* Column 2: CONTACT US (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
              <span className="w-1.5 h-3.5 rounded-full bg-[#2563EB]" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Contact Us
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/about" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/learning" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Tech Blogs &amp; Guides</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Hardware News &amp; Updates</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>News &amp; Media</span>
                </Link>
              </li>
              <li>
                <Link href="/account/quotations" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Request a Quote</span>
                </Link>
              </li>
              <li>
                <Link href="/careers" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Careers at Prayog</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Reach Us</span>
                </Link>
              </li>
              <li className="pt-1.5">
                <Link
                  href="/login-staff"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#2563EB] bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200/80 shadow-2xs"
                >
                  <span>Staff Portal</span>
                  <ArrowRight className="w-3 h-3 text-[#2563EB]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ROBOTICS & LAB SERVICES (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
              <span className="w-1.5 h-3.5 rounded-full bg-cyan-500" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Drone &amp; STEM Services
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/services/drone-lab-setup" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Drone for Surveying &amp; Mapping</span>
                </Link>
              </li>
              <li>
                <Link href="/services/drone-lab-setup" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Drone for Surveillance &amp; Inspection</span>
                </Link>
              </li>
              <li>
                <Link href="/services/drone-lab-setup" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Drone for Precision Agriculture</span>
                </Link>
              </li>
              <li>
                <Link href="/services/robotics-lab-setup" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Robotics &amp; AI Lab Setup</span>
                </Link>
              </li>
              <li>
                <Link href="/services/stem-lab-setup" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Turnkey STEM &amp; ATL School Labs</span>
                </Link>
              </li>
              <li>
                <Link href="/services/industrial-projects" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Drone Repair &amp; Maintenance</span>
                </Link>
              </li>
              <li>
                <Link href="/learning" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Training &amp; Flight Certification</span>
                </Link>
              </li>
              <li>
                <Link href="/services/consultancy" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Institutional Lab Consultancy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: IMPORTANT LINKS (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
              <span className="w-1.5 h-3.5 rounded-full bg-amber-500" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Important Links
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/about#terms" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/about#disclaimer" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Disclaimer</span>
                </Link>
              </li>
              <li>
                <Link href="/about#privacy" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/about#returns" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Return &amp; Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/about#shipping" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Shipping Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/about#warranty" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Warranty Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/about#payment" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Payment Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/about#cookies" className="group inline-flex items-center gap-1.5 hover:text-[#2563EB] hover:translate-x-1 transition-all">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                  <span>Cookie Policy</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Payment Trust Badges & Certifications ── */}
        <div className="pt-6 pb-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              100% Secure Payments
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-white text-[10px] font-extrabold text-blue-700 border border-slate-200 shadow-2xs">UPI</span>
              <span className="px-2 py-0.5 rounded bg-white text-[10px] font-extrabold text-emerald-700 border border-slate-200 shadow-2xs">RuPay</span>
              <span className="px-2 py-0.5 rounded bg-white text-[10px] font-extrabold text-blue-900 border border-slate-200 shadow-2xs">VISA</span>
              <span className="px-2 py-0.5 rounded bg-white text-[10px] font-extrabold text-orange-600 border border-slate-200 shadow-2xs">Mastercard</span>
              <span className="px-2 py-0.5 rounded bg-white text-[10px] font-extrabold text-slate-700 border border-slate-200 shadow-2xs">NetBanking</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <CheckCircle className="w-3 h-3" />
              <span className="text-[11px] font-bold">GST Certified</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <CheckCircle className="w-3 h-3" />
              <span className="text-[11px] font-bold">Made in India</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Strip: Disclaimer & Copyright ── */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-[11px] text-slate-500 font-normal max-w-4xl leading-relaxed">
            <span className="font-bold text-slate-800">Disclaimer:</span> All drones, robotics hardware, and electronic components are supplied with official GST tax compliance, authentic microchip sourcing, and manufacturer warranty coverage.
          </p>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider">
            © {new Date().getFullYear()} PRAYOG INDIA TECHNOLOGIES PVT. LTD. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
