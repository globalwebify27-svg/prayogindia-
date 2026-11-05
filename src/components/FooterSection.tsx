"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Link as LinkIcon,
  Bot,
  Cpu,
  GraduationCap,
  Settings,
  ChevronRight,
  ArrowRight,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { PrayogLogo } from "./PrayogLogo";
import {
  UPILogo,
  RuPayLogo,
  VisaLogo,
  MastercardLogo,
  NetBankingLogo,
  RazorpayLogo,
} from "@/components/icons/PaymentLogos";

// ── Custom Drone Vector Icon ──
const DroneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="2.5" />
    <line x1="5.5" y1="5.5" x2="9.5" y2="9.5" />
    <line x1="18.5" y1="5.5" x2="14.5" y2="9.5" />
    <line x1="5.5" y1="18.5" x2="9.5" y2="14.5" />
    <line x1="18.5" y1="18.5" x2="14.5" y2="14.5" />
    <circle cx="4" cy="4" r="2" />
    <circle cx="20" cy="4" r="2" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" />
  </svg>
);

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative bg-[#030712] text-white pt-8 pb-24 lg:pb-10 border-t border-cyan-500/30 overflow-hidden font-inter select-none">
      {/* ── Top Neon Cyber Cyan Accent Line ── */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_15px_#00F0FF] z-20" />

      {/* ── Background Cyber Ambient Glows & PCB Circuit Lines ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Radial ambient lighting */}
        <div className="absolute -left-20 top-1/4 w-[420px] h-[420px] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute -right-20 top-1/4 w-[420px] h-[420px] bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-blue-900/15 blur-[140px] rounded-full" />

        {/* Decorative Glowing SVG Circuit Board Traces */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cyberTraceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00A3FF" stopOpacity="0.2" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Circuit tracks across the top and sides */}
          <path
            d="M0,25 L180,25 L210,55 L420,55 M460,55 L580,55 L610,25 L920,25 L950,55 L1440,55"
            fill="none"
            stroke="url(#cyberTraceGrad)"
            strokeWidth="1.5"
            filter="url(#neonGlow)"
          />
          <circle cx="210" cy="55" r="3" fill="#00F0FF" />
          <circle cx="420" cy="55" r="3" fill="#00F0FF" />
          <circle cx="610" cy="25" r="3" fill="#00F0FF" />
          <circle cx="950" cy="55" r="3" fill="#00F0FF" />

          {/* Bottom circuit traces above dock */}
          <path
            d="M0,380 L240,380 L270,350 L750,350 M820,350 L1100,350 L1130,380 L1440,380"
            fill="none"
            stroke="url(#cyberTraceGrad)"
            strokeWidth="1.5"
            filter="url(#neonGlow)"
          />
          <circle cx="270" cy="350" r="3" fill="#00F0FF" />
          <circle cx="750" cy="350" r="3" fill="#00F0FF" />
          <circle cx="1130" cy="380" r="3" fill="#00F0FF" />
        </svg>

        {/* Giant architectural cyber watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] select-none pointer-events-none">
          <span className="text-[14vw] font-black uppercase tracking-tighter text-cyan-400">
            PRAYOG INDIA
          </span>
        </div>
      </div>



      {/* ── Main Content Container ── */}
      <div className="relative z-10 max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* ── Top Brand & Tech Category Strip ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-cyan-500/20">
          {/* Logo & Headline */}
          <div className="space-y-2 max-w-xl">
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <PrayogLogo size="lg" dark={true} />
            </Link>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              India&apos;s leading platform for Robotics, STEM, Drones, and Embedded Innovation.
            </p>
          </div>

          {/* 5 Tech Category Icons Strip */}
          <div className="flex items-center gap-3 sm:gap-5 bg-[#06122E]/80 border border-cyan-500/30 px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(0,163,255,0.12)] backdrop-blur-md">
            {/* Robotics */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                Robotics
              </span>
            </div>

            {/* Drones */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                <DroneIcon className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                Drones
              </span>
            </div>

            {/* IoT */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                IoT
              </span>
            </div>

            {/* STEM */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                STEM
              </span>
            </div>

            {/* Training */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                <Settings className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                Training
              </span>
            </div>
          </div>
        </div>

        {/* ── 4 Futuristic Sci-Fi Panels Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-8 pb-8">
          {/* Panel 1: CONTACT US */}
          <div className="relative rounded-2xl bg-[#06112C]/75 border border-cyan-500/30 p-5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,163,255,0.08)] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 flex flex-col justify-between">
            {/* Top Corner Chamfer Highlight */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400/20 rotate-45 border-b border-cyan-400/50" />
            </div>

            <div>
              {/* Header Badge */}
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-cyan-500/25">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase">
                  Contact Us
                </h3>
              </div>

              {/* Items */}
              <div className="space-y-3.5 text-xs">
                {/* Phone */}
                <div className="flex items-start gap-2.5 group">
                  <span className="w-6 h-6 rounded-md bg-cyan-950/80 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_8px_rgba(0,240,255,0.3)] transition-all mt-0.5">
                    <Phone className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-cyan-400/80">Support &amp; Orders</span>
                    <a
                      href="tel:+918709789641"
                      className="font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                    >
                      +91 87097 89641
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-2.5 group">
                  <span className="w-6 h-6 rounded-md bg-cyan-950/80 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_8px_rgba(0,240,255,0.3)] transition-all mt-0.5">
                    <Mail className="w-3 h-3" />
                  </span>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-cyan-400/80">Business Inquiries</span>
                    <a
                      href="mailto:business@prayogindia.com"
                      className="font-semibold text-slate-200 hover:text-cyan-300 transition-colors break-all"
                    >
                      business@prayogindia.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2.5 group">
                  <span className="w-6 h-6 rounded-md bg-cyan-950/80 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_8px_rgba(0,240,255,0.3)] transition-all mt-0.5">
                    <MapPin className="w-3 h-3" />
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Prayog India Tech Hub, Plot No. 42, Industrial Area, Ranchi, Jharkhand - 834001, India.
                  </p>
                </div>
              </div>
            </div>

            {/* Staff Portal Link */}
            <div className="pt-4 mt-4 border-t border-cyan-500/20">
              <Link
                href="/login-staff"
                className="inline-flex items-center gap-2 text-[11px] font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-1.5 rounded-lg border border-cyan-500/40 transition-all shadow-[0_0_8px_rgba(0,240,255,0.15)]"
              >
                <span>Staff Portal</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </Link>
            </div>
          </div>

          {/* Panel 2: QUICK LINKS */}
          <div className="relative rounded-2xl bg-[#06112C]/75 border border-cyan-500/30 p-5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,163,255,0.08)] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 flex flex-col justify-between">
            {/* Top Corner Chamfer Highlight */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400/20 rotate-45 border-b border-cyan-400/50" />
            </div>

            <div>
              {/* Header Badge */}
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-cyan-500/25">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase">
                  Quick Links
                </h3>
              </div>

              {/* Links */}
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href="/about"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/learning"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Tech Blogs &amp; Guides</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>News &amp; Media</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Careers at Prayog</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/quotations"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Request a Quote</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Reach Us</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Panel 3: DRONE & STEM SERVICES */}
          <div className="relative rounded-2xl bg-[#06112C]/75 border border-cyan-500/30 p-5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,163,255,0.08)] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 flex flex-col justify-between">
            {/* Top Corner Chamfer Highlight */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400/20 rotate-45 border-b border-cyan-400/50" />
            </div>

            <div>
              {/* Header Badge */}
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-cyan-500/25">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                  <DroneIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase">
                  Drone &amp; STEM Services
                </h3>
              </div>

              {/* Links */}
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href="/services/drone-lab-setup"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Drone for Surveying &amp; Mapping</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/drone-lab-setup"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Drone for Surveillance &amp; Inspection</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/drone-lab-setup"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Precision Agriculture Drones</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/robotics-lab-setup"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Robotics &amp; AI Lab Setup</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/learning"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Training &amp; Flight Certification</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/consultancy"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Institutional Lab Consultancy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Panel 4: POLICIES */}
          <div className="relative rounded-2xl bg-[#06112C]/75 border border-cyan-500/30 p-5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,163,255,0.08)] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 flex flex-col justify-between">
            {/* Top Corner Chamfer Highlight */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400/20 rotate-45 border-b border-cyan-400/50" />
            </div>

            <div>
              {/* Header Badge */}
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-cyan-500/25">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase">
                  Policies
                </h3>
              </div>

              {/* Links */}
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href="/about#terms"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Terms &amp; Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#privacy"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#returns"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Return &amp; Refund Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#shipping"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Shipping Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#warranty"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Warranty Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#cookies"
                    className="group flex items-center gap-2 text-slate-300 hover:text-cyan-300 hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <span>Cookie Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Glowing Neon Cyber Dock / Bottom Bar ── */}
        <div className="mt-4 rounded-2xl bg-[#040C22]/90 border border-cyan-400/40 p-3.5 sm:p-4 shadow-[0_0_25px_rgba(0,180,255,0.22)] backdrop-blur-xl">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
            {/* Left: 100% Secure Payments + Payment Badges */}
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
              <div className="flex items-center gap-1.5 text-white text-[11px] font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>100% SECURE PAYMENTS</span>
              </div>

              {/* White Pill Logos */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div
                  title="UPI"
                  className="h-7 px-2.5 rounded-lg bg-white shadow-xs flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <UPILogo className="h-3.5 w-auto" />
                </div>
                <div
                  title="RuPay"
                  className="h-7 px-2.5 rounded-lg bg-white shadow-xs flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <RuPayLogo className="h-3.5 w-auto" />
                </div>
                <div
                  title="Visa"
                  className="h-7 px-2.5 rounded-lg bg-white shadow-xs flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <VisaLogo className="h-3 w-auto" />
                </div>
                <div
                  title="Mastercard"
                  className="h-7 px-2.5 rounded-lg bg-white shadow-xs flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <MastercardLogo className="h-3.5 w-auto" />
                </div>
                <div
                  title="NetBanking"
                  className="h-7 px-2.5 rounded-lg bg-white shadow-xs flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <NetBankingLogo className="h-3.5 w-auto" />
                </div>
                <div
                  title="Razorpay"
                  className="h-7 px-2.5 rounded-lg bg-white shadow-xs flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <RazorpayLogo className="h-3.5 w-auto" />
                </div>
              </div>
            </div>

            {/* Right: Verification Badges + Socials + WhatsApp Channel */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* GST Certified */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/50 text-emerald-400 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GST Certified</span>
              </div>

              {/* Made in India */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-white text-[11px] font-bold">
                <span className="w-4 h-2.5 rounded-[2px] overflow-hidden inline-flex flex-col shadow-xs">
                  <span className="h-1/3 bg-[#FF9933] w-full" />
                  <span className="h-1/3 bg-white w-full" />
                  <span className="h-1/3 bg-[#138808] w-full" />
                </span>
                <span>Made in India</span>
              </div>

              {/* Social Media Circular Buttons */}
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-7 h-7 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-7 h-7 rounded-full bg-[#FF0000] hover:bg-[#d90000] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-7 h-7 rounded-full bg-[#0077b5] hover:bg-[#005582] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>

              {/* Join WhatsApp Channel Button */}
              <a
                href="https://wa.me/918709789641?text=Hi%20Prayog%20India%2C%20I%20want%20to%20join%20the%20Robotics%20Community%20Channel!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Join Our WhatsApp Channel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Sub-strip: Disclaimer & Copyright ── */}
        <div className="pt-6 border-t border-cyan-500/20 mt-6 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-[11px] text-slate-400 font-normal max-w-4xl leading-relaxed">
            <span className="font-bold text-slate-200">Disclaimer:</span> All drones, robotics hardware, and electronic components are supplied with official GST tax compliance, authentic microchip sourcing, and manufacturer warranty coverage.
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 tracking-wider">
            © {new Date().getFullYear()} PRAYOG INDIA TECHNOLOGIES PVT. LTD. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;