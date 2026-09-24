"use client";

import React from "react";
import Image from "next/image";
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
  Sparkles,
  Building2,
  CheckCircle2,
  Cpu,
  Layers,
  Plane,
  Bot,
  Award,
  Truck,
  Phone,
  Mail,
  MapPin,
  Star,
  ExternalLink,
} from "lucide-react";

export const AboutView: React.FC = () => {
  const IMPACT_STATS = [
    {
      value: "5,000+",
      label: "Innovators & Labs",
      description: "Engineers, student researchers & hobbyists supported",
      icon: UsersIcon,
      color: "text-[#00AEEF]",
      bg: "bg-[#E0F7FC]",
    },
    {
      value: "50,000+",
      label: "Components Dispatched",
      description:
        "100% verified genuine microcontrollers, sensors & actuators",
      icon: Cpu,
      color: "text-[#FFC20E]",
      bg: "bg-amber-50",
    },
    {
      value: "250+",
      label: "Turnkey Labs Equipped",
      description:
        "Atal Tinkering Labs (ATL) & university mechatronics centers",
      icon: Building2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      value: "99.4%",
      label: "On-Time Dispatch Rate",
      description: "Rapid express shipping from Ranchi & Bengaluru hubs",
      icon: Truck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  const CORE_PILLARS = [
    {
      icon: ShieldCheck,
      title: "100% Genuine Hardware",
      description:
        "Direct manufacturer sourcing for authentic Arduino, Raspberry Pi, ESP32, STM32, and Pixhawk hardware. Zero tolerance for counterfeit clones or sub-standard ICs.",
      badge: "Zero Counterfeit Policy",
    },
    {
      icon: Wrench,
      title: "Turnkey ATL & Robotics Labs",
      description:
        "Comprehensive laboratory planning and equipment supply compliant with Atal Innovation Mission (AIM) guidelines, complete with 3D printers, safety stations, and workbench setups.",
      badge: "AIM & NITI Aayog Aligned",
    },
    {
      icon: Cpu,
      title: "In-House Mechatronics Support",
      description:
        "Our engineers create verified pinouts, wiring diagrams, sample firmware, and provide live technical guidance for student projects and institutional testbenches.",
      badge: "Dedicated Engineer Desk",
    },
    {
      icon: Award,
      title: "Official GST & B2B Compliance",
      description:
        "Transparent commercial billing with automatic GST tax invoices, formal institutional quotes, government GeM procurement assistance, and custom credit terms.",
      badge: "Instant Tax Invoicing",
    },
  ];

  const TECH_DOMAINS = [
    {
      title: "Autonomous Drones & UAVs",
      category: "Flight Avionics",
      description:
        "Pixhawk 6C autopilots, MavLink telemetry, brushless motors, SimonK ESCs, GPS compass modules, and carbon-fiber quadcopter airframes.",
      image: "/images/drone_cutout.jpg",
      href: "/categories/drone-technology",
      tag: "ArduPilot / PX4 Ready",
    },
    {
      title: "Robotics & Mechatronics",
      category: "Industrial & STEM",
      description:
        "6-DOF robotic arms, Dilay-Bot 4WD obstacle avoiders, ROS2 SLAM mobile rovers, metal gear servos, and planetary drive systems.",
      image: "/images/ecosystem/robotics.jpg",
      href: "/categories/robotics",
      tag: "ROS2 & Arduino Driven",
    },
    {
      title: "Embedded Systems & IoT",
      category: "Microcontrollers",
      description:
        "Raspberry Pi 5 (8GB), ESP32-WROOM dual-core modules, Arduino UNO R4 WiFi, LoRa SX1278 transceivers, and precision sensor shields.",
      image: "/images/pi_hero.jpg",
      href: "/categories/arduino-development-boards",
      tag: "Official Hardware",
    },
    {
      title: "Turnkey Lab Engineering",
      category: "Institutional Setups",
      description:
        "End-to-end laboratory infrastructure: 3D rapid prototyping printers, soldering workstations, oscilloscope benches, and educator training manuals.",
      image: "/images/ecosystem/rapid-prototyping.jpg",
      href: "/services",
      tag: "Full Lab Setup",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Top Breadcrumb */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <CategoryBreadcrumb items={[{ label: "About Prayog India" }]} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* 2. Hero Section: Open, Classic Modern Light Layout */}
        <section className="py-2 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#E0F7FC] border border-[#00AEEF]/20 text-[#00AEEF] text-xs font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#FFC20E]" />
                <span>PRAYOG INDIA • THE WORLD OF ROBOTICS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
                Powering India’s Next Generation of{" "}
                <span className="text-[#00AEEF]">Robotics</span>,{" "}
                <span className="text-[#00AEEF]">AI</span> &amp;{" "}
                <span className="text-[#FFC20E]">STEM</span> Innovators
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
                Prayog India is a premier mechatronics and hardware technology
                ecosystem provider. From school Atal Tinkering Labs (ATL) to
                elite university research labs and industrial tech incubators,
                we deliver genuine electronic components, autonomous flight
                avionics, and turnkey laboratory infrastructure across India.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#00AEEF]" /> 100%
                  Genuine Silicon
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#FFC20E]" /> Official
                  GST Invoiced
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                  Pan-India Rapid Dispatch
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Hardware Store</span>
                </Link>

                <Link
                  href="/services"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-2xs hover:border-slate-300 flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-[#00AEEF]" />
                  <span>Turnkey Lab Services</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Clean Hardware Visual Display */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-50 aspect-[4/3] sm:aspect-[16/11] p-2">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/robotics_banner.jpg"
                    alt="Prayog India Robotics Lab Hardware"
                    fill
                    priority
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

                  {/* Floating Overlay Info Badges */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Hubs: Ranchi &amp; Bengaluru</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/90 p-3.5 rounded-xl space-y-1 shadow-lg">
                    <div className="flex items-center justify-between text-xs font-black text-slate-900">
                      <span>Indigenous Hardware Ecosystem</span>
                      <span className="text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9/5
                        Rating
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium leading-normal">
                      Direct hardware distribution partner for Atal Innovation
                      Mission, IITs, NITs, and STEM educators across India.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Impact Stats Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {IMPACT_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3 group hover:border-[#00AEEF]/40"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${stat.color}`}
                  >
                    {stat.value}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {stat.label}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* 4. Our Story & Bento Grid (Identity, Mission, Vision, Indigenous Focus) */}
        <section className="space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="bg-[#E0F7FC] text-[#00AEEF] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block">
              OUR HERITAGE &amp; MISSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bridging the Gap Between Engineering Theory and Hardware Reality
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Prayog India was founded to eliminate the roadblocks young Indian
              engineers face: counterfeit silicon, missing schematics, and weeks
              of international shipping delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Story Card - Spans 7 columns */}
            <div className="md:col-span-7 bg-slate-50 border border-slate-200/90 rounded-3xl p-8 space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-black text-[#00AEEF] uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>The Prayog India Origin</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-snug">
                  Built by Robotics Engineers, for Innovators Across India
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  STEM and mechatronics education in India has long been
                  hindered by sub-standard component clones and lack of hands-on
                  laboratory infrastructure. When microcontrollers glitch or
                  flight controllers lack authenticated bootloaders, student
                  learning grinds to a halt.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Prayog India established a rigorous QC-tested supply chain,
                  direct manufacturer distribution, and comprehensive curriculum
                  integration. Today, we equip students from primary school
                  robotics clubs to postgraduate UAV research laboratories with
                  verified hardware they can trust.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00AEEF]" /> Dual Hubs
                  in Ranchi &amp; Bengaluru
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FFC20E]" /> 100% Tax
                  Invoiced
                </div>
              </div>
            </div>

            {/* Mission & Vision Bento Cards - Spans 5 columns */}
            <div className="md:col-span-5 flex flex-col gap-6">
              {/* Mission Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-2.5 shadow-xs flex-1 hover:border-[#00AEEF]/40 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Our Mission
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To democratize experiential mechatronics, embedded systems,
                  and robotics education across every school district,
                  university, and innovation lab in India by providing
                  high-reliability hardware and turnkey laboratory setups.
                </p>
              </div>

              {/* Vision Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-2.5 shadow-xs flex-1 hover:border-[#FFC20E]/50 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Our Vision
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To build India’s largest indigenous hardware engineering
                  backbone for robotics, autonomous drones, and Industry 4.0
                  automation—fostering self-reliance in cutting-edge robotics
                  technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Four Pillars of Prayog India */}
        <section className="space-y-8 bg-slate-50/70 border border-slate-200/80 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="bg-[#E0F7FC] text-[#00AEEF] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block">
              THE PRAYOG PROMISE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why 5,000+ Innovators &amp; Institutions Trust Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We stand apart from marketplace sellers with end-to-end hardware
              accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3.5 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-[#00AEEF]/50 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {pillar.badge}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Technologies & Ecosystem We Power */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="bg-[#E0F7FC] text-[#00AEEF] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block">
                HARDWARE DOMAINS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Technologies &amp; Systems We Power
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Comprehensive component catalogs and turnkey laboratory setups
                across India’s core robotics sectors.
              </p>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-[#00AEEF] hover:text-[#008BBF] flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>View Full Hardware Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECH_DOMAINS.map((domain, idx) => (
              <Link
                key={idx}
                href={domain.href}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-[#00AEEF]/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={domain.image}
                      alt={domain.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 px-2.5 py-1 rounded-full">
                      {domain.category}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold text-[#FFC20E] bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                      {domain.tag}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#00AEEF] transition-colors">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00AEEF]">
                  <span>Explore Hardware</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. Institutions & Labs Trust Banner */}
        <section className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
              INSTITUTIONAL NETWORK
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Equipping India’s Premier Labs &amp; Atal Tinkering Centers
            </h2>
            <p className="text-xs text-slate-500">
              Verified supply partner for premier universities, engineering
              departments, and school robotics clubs.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            {[
              "IIT Kharagpur",
              "IISc Bangalore",
              "DTU Delhi",
              "NIT Patna",
              "BITS Pilani",
              "St. Xavier High School",
              "Apex IoT Labs",
              "AeroTech Dynamics",
              "250+ Atal Tinkering Labs",
            ].map((inst, i) => (
              <span
                key={i}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-2xl shadow-2xs"
              >
                {inst}
              </span>
            ))}
          </div>
        </section>

        {/* 8. Institutional Procurement & Contact CTA */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#E0F7FC]/70 via-white to-sky-50/60 border border-[#00AEEF]/30 p-8 sm:p-12 shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white border border-[#00AEEF]/30 text-[#00AEEF] text-[11px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full shadow-2xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>INSTITUTIONAL &amp; B2B PROCUREMENT DESK</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Setting Up a Lab or Need Bulk Hardware Procurement?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Connect directly with our lab application engineers for official
                GST quotations, turnkey ATL equipment lists, volume
                institutional pricing, or custom hardware kits.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-xl border border-slate-200">
                  <Phone className="w-4 h-4 text-[#00AEEF]" />{" "}
                  {COMPANY_INFO.phone}
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-xl border border-slate-200">
                  <Mail className="w-4 h-4 text-[#FFC20E]" />{" "}
                  {COMPANY_INFO.email}
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-xl border border-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Ranchi &amp;
                  Bengaluru, India
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/contact"
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>Request Institutional Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 shadow-2xs hover:border-slate-300"
              >
                <span>View Lab Setup Services</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Compass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
