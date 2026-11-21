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
const DroneIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
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
    <footer
      className="relative text-white pt-8 pb-20 sm:pb-16 lg:pb-12 border-t border-cyan-500/30 overflow-hidden font-inter select-none"
      style={{
        background: "linear-gradient(180deg, #020914 0%, #030d22 50%, #010611 100%)",
      }}
    >
      {/* ── Top Neon Cyber Cyan Accent Line ── */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_15px_#00F0FF] z-20" />

      {/* ── Background Cyber Ambient Glows & PCB Circuit Lines ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -left-20 top-1/4 w-[420px] h-[420px] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute -right-20 top-1/4 w-[420px] h-[420px] bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-blue-900/15 blur-[140px] rounded-full" />

        {/* Decorative Glowing SVG Circuit Board Traces */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
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

          {/* Circuit tracks across top and sides */}
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
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* ── Upper Unified Section: Brand Column + 4 Cyber Cards ── */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 pb-6 items-start">
          
          {/* Brand Info Column (Left, ~28% width on desktop) */}
          <div className="w-full lg:w-[280px] xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col justify-start">
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <PrayogLogo size="lg" dark={true} />
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              India&apos;s leading platform for Robotics, STEM, Drones, and Embedded Innovation.
            </p>

            {/* 5 Tech Category Icons Strip (Placed neatly below description) */}
            <div className="mt-5 flex items-center gap-2.5 sm:gap-3 flex-wrap">
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

          {/* 4 Cyber Information Panels (Flex-1 grid with equal balanced width) */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5">
            
            {/* Panel 1: CONTACT US */}
            <div
              className="relative group transition-all duration-300 hover:scale-[1.01]"
              style={{ filter: "drop-shadow(0 0 12px rgba(0, 240, 255, 0.28))" }}
            >
              {/* Outer Chamfer Border */}
              <div
                className="p-[1.5px] bg-gradient-to-br from-cyan-400 via-cyan-500/70 to-blue-600/40 h-full w-full"
                style={{
                  clipPath:
                    "polygon(22px 0%, calc(100% - 12px) 0%, calc(100% - 4px) 4px, 100% 12px, 100% calc(100% - 12px), calc(100% - 4px) calc(100% - 4px), calc(100% - 12px) 100%, 12px 100%, 4px calc(100% - 4px), 0% calc(100% - 12px), 0% 22px)",
                }}
              >
                {/* Inner Card Content */}
                <div
                  className="bg-[#05112a]/92 backdrop-blur-md p-4 sm:p-5 h-full w-full flex flex-col justify-start"
                  style={{
                    clipPath:
                      "polygon(21px 0%, calc(100% - 11px) 0%, calc(100% - 4px) 4px, 100% 11px, 100% calc(100% - 11px), calc(100% - 4px) calc(100% - 4px), calc(100% - 11px) 100%, 11px 100%, 4px calc(100% - 4px), 0% calc(100% - 11px), 0% 21px)",
                  }}
                >
                  {/* Header Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-950/90 via-[#071d47] to-cyan-950/80 text-white shadow-[0_0_12px_rgba(0,240,255,0.35)] mb-4.5 w-fit whitespace-nowrap">
                    <Phone className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span className="text-[13px] font-bold text-white tracking-wide">Contact Us</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3.5 text-xs">
                    {/* Phone */}
                    <div className="flex items-center gap-3 group/item">
                      <span className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400/60 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.25)] group-hover/item:border-cyan-300 transition-all">
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <a
                          href="tel:+918709789641"
                          className="font-bold text-slate-100 hover:text-cyan-300 transition-colors text-[13px] tracking-wide whitespace-nowrap"
                        >
                          +91 87097 89641
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 group/item">
                      <span className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/60 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.25)] group-hover/item:border-cyan-300 transition-all">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <a
                          href="mailto:business@prayogindia.com"
                          className="font-medium text-slate-200 hover:text-cyan-300 transition-colors text-xs whitespace-nowrap"
                        >
                          business@prayogindia.com
                        </a>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 group/item">
                      <span className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400/60 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.25)] mt-0.5 group-hover/item:border-cyan-300 transition-all">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <p className="text-slate-200 text-[11.5px] leading-relaxed">
                        Prayog India Tech Hub,
                        <br />
                        Plot No. 42, Industrial Area,
                        <br />
                        Ranchi, Jharkhand - 834001, India.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2: QUICK LINKS */}
            <div
              className="relative group transition-all duration-300 hover:scale-[1.01]"
              style={{ filter: "drop-shadow(0 0 12px rgba(0, 240, 255, 0.28))" }}
            >
              {/* Outer Chamfer Border */}
              <div
                className="p-[1.5px] bg-gradient-to-br from-cyan-400 via-cyan-500/70 to-blue-600/40 h-full w-full"
                style={{
                  clipPath:
                    "polygon(22px 0%, calc(100% - 12px) 0%, calc(100% - 4px) 4px, 100% 12px, 100% calc(100% - 12px), calc(100% - 4px) calc(100% - 4px), calc(100% - 12px) 100%, 12px 100%, 4px calc(100% - 4px), 0% calc(100% - 12px), 0% 22px)",
                }}
              >
                {/* Inner Card Content */}
                <div
                  className="bg-[#05112a]/92 backdrop-blur-md p-4 sm:p-5 h-full w-full flex flex-col justify-start"
                  style={{
                    clipPath:
                      "polygon(21px 0%, calc(100% - 11px) 0%, calc(100% - 4px) 4px, 100% 11px, 100% calc(100% - 11px), calc(100% - 4px) calc(100% - 4px), calc(100% - 11px) 100%, 11px 100%, 4px calc(100% - 4px), 0% calc(100% - 11px), 0% 21px)",
                  }}
                >
                  {/* Header Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-950/90 via-[#071d47] to-cyan-950/80 text-white shadow-[0_0_12px_rgba(0,240,255,0.35)] mb-4.5 w-fit whitespace-nowrap">
                    <LinkIcon className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span className="text-[13px] font-bold text-white tracking-wide">Quick Links</span>
                  </div>

                  {/* Links */}
                  <ul className="space-y-2.5 text-xs">
                    <li>
                      <Link
                        href="/about"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">About Us</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/learning"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Tech Blogs &amp; Guides</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">News &amp; Media</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/careers"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Careers at Prayog</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/quotations"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Request a Quote</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Reach Us</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Panel 3: DRONE & STEM SERVICES */}
            <div
              className="relative group transition-all duration-300 hover:scale-[1.01]"
              style={{ filter: "drop-shadow(0 0 12px rgba(0, 240, 255, 0.28))" }}
            >
              {/* Outer Chamfer Border */}
              <div
                className="p-[1.5px] bg-gradient-to-br from-cyan-400 via-cyan-500/70 to-blue-600/40 h-full w-full"
                style={{
                  clipPath:
                    "polygon(22px 0%, calc(100% - 12px) 0%, calc(100% - 4px) 4px, 100% 12px, 100% calc(100% - 12px), calc(100% - 4px) calc(100% - 4px), calc(100% - 12px) 100%, 12px 100%, 4px calc(100% - 4px), 0% calc(100% - 12px), 0% 22px)",
                }}
              >
                {/* Inner Card Content */}
                <div
                  className="bg-[#05112a]/92 backdrop-blur-md p-4 sm:p-5 h-full w-full flex flex-col justify-start"
                  style={{
                    clipPath:
                      "polygon(21px 0%, calc(100% - 11px) 0%, calc(100% - 4px) 4px, 100% 11px, 100% calc(100% - 11px), calc(100% - 4px) calc(100% - 4px), calc(100% - 11px) 100%, 11px 100%, 4px calc(100% - 4px), 0% calc(100% - 11px), 0% 21px)",
                  }}
                >
                  {/* Header Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-950/90 via-[#071d47] to-cyan-950/80 text-white shadow-[0_0_12px_rgba(0,240,255,0.35)] mb-4.5 w-fit whitespace-nowrap">
                    <DroneIcon className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span className="text-[12.5px] font-bold text-white tracking-wide">Drone &amp; STEM Services</span>
                  </div>

                  {/* Links */}
                  <ul className="space-y-2 text-xs">
                    <li>
                      <Link
                        href="/services/drone-lab-setup"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Drone for Surveying &amp; Mapping</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/drone-lab-setup"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Drone for Surveillance &amp; Inspection</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/drone-lab-setup"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Precision Agriculture Drones</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/robotics-lab-setup"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Robotics &amp; AI Lab Setup</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/learning"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Training &amp; Flight Certification</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/consultancy"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Institutional Lab Consultancy</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Panel 4: POLICIES */}
            <div
              className="relative group transition-all duration-300 hover:scale-[1.01]"
              style={{ filter: "drop-shadow(0 0 12px rgba(0, 240, 255, 0.28))" }}
            >
              {/* Outer Chamfer Border */}
              <div
                className="p-[1.5px] bg-gradient-to-br from-cyan-400 via-cyan-500/70 to-blue-600/40 h-full w-full"
                style={{
                  clipPath:
                    "polygon(22px 0%, calc(100% - 12px) 0%, calc(100% - 4px) 4px, 100% 12px, 100% calc(100% - 12px), calc(100% - 4px) calc(100% - 4px), calc(100% - 12px) 100%, 12px 100%, 4px calc(100% - 4px), 0% calc(100% - 12px), 0% 22px)",
                }}
              >
                {/* Inner Card Content */}
                <div
                  className="bg-[#05112a]/92 backdrop-blur-md p-4 sm:p-5 h-full w-full flex flex-col justify-start"
                  style={{
                    clipPath:
                      "polygon(21px 0%, calc(100% - 11px) 0%, calc(100% - 4px) 4px, 100% 11px, 100% calc(100% - 11px), calc(100% - 4px) calc(100% - 4px), calc(100% - 11px) 100%, 11px 100%, 4px calc(100% - 4px), 0% calc(100% - 11px), 0% 21px)",
                  }}
                >
                  {/* Header Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-950/90 via-[#071d47] to-cyan-950/80 text-white shadow-[0_0_12px_rgba(0,240,255,0.35)] mb-4.5 w-fit whitespace-nowrap">
                    <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span className="text-[13px] font-bold text-white tracking-wide">Policies</span>
                  </div>

                  {/* Links */}
                  <ul className="space-y-2.5 text-xs">
                    <li>
                      <Link
                        href="/about#terms"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Terms &amp; Conditions</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#privacy"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Privacy Policy</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#returns"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Return &amp; Refund Policy</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#shipping"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Shipping Policy</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#warranty"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Warranty Policy</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#cookies"
                        className="group flex items-center gap-2 text-slate-200 hover:text-cyan-300 hover:translate-x-1 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 stroke-[2.5]" />
                        <span className="text-[12px] font-medium leading-normal">Cookie Policy</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Glowing Neon Cyber Dock / Bottom Bar ── */}
        <div className="relative mt-3 rounded-2xl bg-[#040C22]/90 border border-cyan-400/50 p-3.5 sm:p-4 shadow-[0_0_30px_rgba(0,180,255,0.22)] backdrop-blur-xl">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
            
            {/* Left: 100% Secure Payments + Payment Badges */}
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
              <div className="flex items-center gap-1.5 text-white text-[11px] font-bold uppercase tracking-wider shrink-0">
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
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 xl:mr-24">
              {/* GST Certified */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/50 text-emerald-400 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GST Certified</span>
              </div>

              {/* Made in India */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-white text-[11px] font-bold shrink-0">
                <span className="w-4 h-2.5 rounded-[2px] overflow-hidden inline-flex flex-col shadow-xs">
                  <span className="h-1/3 bg-[#FF9933] w-full" />
                  <span className="h-1/3 bg-white w-full" />
                  <span className="h-1/3 bg-[#138808] w-full" />
                </span>
                <span>Made in India</span>
              </div>

              {/* Social Media Circular Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-7 h-7 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-7 h-7 rounded-full bg-[#FF0000] hover:bg-[#d90000] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
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
