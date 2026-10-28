"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { COMPANY_INFO } from "@/data/companyData";
import {
  AboutShowcaseItem,
  DEFAULT_ABOUT_SHOWCASE,
  BUBBLE_COLOR_MAP,
  ShowcaseIconType,
} from "@/data/aboutShowcaseData";
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
  RotateCcw,
  Phone,
  Mail,
  MapPin,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const INSTITUTIONAL_PARTNERS = [
  {
    name: "CISF",
    fullName: "Central Industrial Security Force",
    logo: "/images/partners/cisf.png",
  },
  {
    name: "TATA STEEL",
    fullName: "Tata Steel",
    logo: "/images/partners/tata-steel.png",
  },
  {
    name: "Indian Air Force",
    fullName: "Indian Air Force (Bharatiya Vayu Sena)",
    logo: "/images/partners/indian-air-force.png",
  },
  {
    name: "INDIAN ARMY",
    fullName: "Indian Army (Bharatiya Sena)",
    logo: "/images/partners/indian-army.png",
  },
  {
    name: "Indian Navy",
    fullName: "Indian Navy (Bharatiya Nau Sena)",
    logo: "/images/partners/indian-navy.png",
  },
  {
    name: "IndianOil",
    fullName: "Indian Oil Corporation Limited",
    logo: "/images/partners/indianoil.png",
  },
  {
    name: "PWD Government of West Bengal",
    fullName: "Public Works Department, Govt. of West Bengal",
    logo: "/images/partners/pwd-wb.png",
  },
  {
    name: "TATA METALIKS",
    fullName: "Tata Metaliks",
    logo: "/images/partners/tata-metaliks.png",
  },
  {
    name: "IIT Kharagpur",
    fullName: "Indian Institute of Technology Kharagpur",
    logo: "/images/partners/iit-kharagpur.png",
  },
];

const ROW_1_PARTNERS = [...INSTITUTIONAL_PARTNERS, ...INSTITUTIONAL_PARTNERS];
const ROW_2_PARTNERS = [
  ...INSTITUTIONAL_PARTNERS.slice(4),
  ...INSTITUTIONAL_PARTNERS.slice(0, 4),
  ...INSTITUTIONAL_PARTNERS.slice(4),
  ...INSTITUTIONAL_PARTNERS.slice(0, 4),
];

const SHOWCASE_ICONS: Record<ShowcaseIconType, React.ElementType> = {
  users: UsersIcon,
  plane: Plane,
  shield: ShieldCheck,
  award: Award,
  bot: Bot,
  cpu: Cpu,
  wrench: Wrench,
};

interface CompliancePolicy {
  id: string;
  category: "shipping" | "safety" | "legal" | "privacy";
  categoryLabel: string;
  title: string;
  badge: string;
  badgeStyle: string;
  icon: React.ElementType;
  iconBg: string;
  gradient: string;
  description: string;
  keyPoints: string[];
}

const POLICY_CATEGORIES = [
  { id: "all", label: "All Policies", count: 8 },
  { id: "shipping", label: "Shipping & Returns", count: 2 },
  { id: "safety", label: "Warranty & Safety", count: 2 },
  { id: "legal", label: "Commercial & Terms", count: 2 },
  { id: "privacy", label: "Privacy & Cookies", count: 2 },
];

const COMPLIANCE_POLICIES: CompliancePolicy[] = [
  {
    id: "terms",
    category: "legal",
    categoryLabel: "Commercial & Orders",
    title: "Terms & Conditions",
    badge: "100% Compliant",
    badgeStyle: "bg-blue-50 text-[#2563EB] border-blue-200/80",
    icon: ShieldCheck,
    iconBg: "bg-blue-50 text-[#2563EB] border border-blue-200/70",
    gradient: "from-blue-500 to-indigo-500",
    description:
      "By purchasing components or lab services, you agree to our commercial terms. Official POs supersede default retail checkout terms.",
    keyPoints: [
      "Institutional POs & SLAs honored",
      "Transparent commercial & dispatch terms",
    ],
  },
  {
    id: "disclaimer",
    category: "safety",
    categoryLabel: "Safety & Education",
    title: "Hardware Disclaimer",
    badge: "Safety Protocol",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/80",
    icon: Target,
    iconBg: "bg-amber-50 text-amber-700 border border-amber-200/70",
    gradient: "from-amber-500 to-orange-500",
    description:
      "Hardware and drone modules are intended for education and research. Users must observe proper reverse-polarity and voltage protocols.",
    keyPoints: [
      "Reverse-polarity & voltage safety",
      "LiPo battery & drone safety guidelines",
    ],
  },
  {
    id: "privacy",
    category: "privacy",
    categoryLabel: "Data Protection",
    title: "Privacy & Data Policy",
    badge: "Zero Spam • 256-Bit",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: Eye,
    iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
    gradient: "from-emerald-500 to-teal-500",
    description:
      "Customer details and GST info are stored with 256-bit encryption. We never sell data to advertisers, only using it for orders and tracking.",
    keyPoints: [
      "256-bit SSL enterprise encryption",
      "Zero 3rd-party data selling or tracking",
    ],
  },
  {
    id: "returns",
    category: "shipping",
    categoryLabel: "Assurance & Returns",
    title: "Return & Replacement",
    badge: "7-Day Guarantee",
    badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    icon: RotateCcw,
    iconBg: "bg-indigo-50 text-indigo-700 border border-indigo-200/70",
    gradient: "from-indigo-500 to-violet-500",
    description:
      "Hassle-free 7-day replacement guarantee on hardware with transit damage or defects. Direct refunds are processed within 3-5 business days.",
    keyPoints: [
      "7-Day cover for defects & transit damage",
      "Direct refunds in 3-5 business days",
    ],
  },
  {
    id: "shipping",
    category: "shipping",
    categoryLabel: "Logistics & Dispatch",
    title: "Pan-India Shipping",
    badge: "Same-Day Dispatch",
    badgeStyle: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
    icon: Truck,
    iconBg: "bg-cyan-50 text-cyan-700 border border-cyan-200/70",
    gradient: "from-cyan-500 to-blue-500",
    description:
      "Orders before 2:00 PM IST dispatch same-day in ESD-safe packaging. Delivery in 2-4 days for metros and 3-6 days pan-India across 19,000+ pincodes.",
    keyPoints: [
      "Same-day cutoff at 2:00 PM IST",
      "19,000+ pincodes via Bluedart/DTDC",
    ],
  },
  {
    id: "warranty",
    category: "safety",
    categoryLabel: "Quality Assurance",
    title: "Hardware Warranty",
    badge: "Up to 1-Yr Warranty",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/80",
    icon: Cpu,
    iconBg: "bg-purple-50 text-purple-700 border border-purple-200/70",
    gradient: "from-purple-500 to-pink-500",
    description:
      "Development boards and lab gear carry standard 6-month or 1-year warranty against failure. Consumables carry DOA replacement cover.",
    keyPoints: [
      "6 to 12-month hardware warranty",
      "DOA instant replacement protection",
    ],
  },
  {
    id: "payment",
    category: "legal",
    categoryLabel: "Billing & Credit",
    title: "Payment & Net-30",
    badge: "Net-30 for Labs",
    badgeStyle: "bg-rose-50 text-rose-700 border-rose-200/80",
    icon: Building2,
    iconBg: "bg-rose-50 text-rose-700 border border-rose-200/70",
    gradient: "from-rose-500 to-red-500",
    description:
      "We accept UPI, cards, Net Banking across 50+ banks, and NEFT/RTGS. Colleges and research labs can apply for Net-30 credit against verified POs.",
    keyPoints: [
      "UPI, Net Banking & NEFT/RTGS",
      "Net-30 credit for colleges & R&D labs",
    ],
  },
  {
    id: "cookies",
    category: "privacy",
    categoryLabel: "Session & Privacy",
    title: "Cookie & Session Policy",
    badge: "Zero Ad Trackers",
    badgeStyle: "bg-teal-50 text-teal-700 border-teal-200/80",
    icon: Sparkles,
    iconBg: "bg-teal-50 text-teal-700 border border-teal-200/70",
    gradient: "from-teal-500 to-emerald-500",
    description:
      "We use lightweight local storage only for cart retention and user session. We run zero cross-site ad trackers and cookies can be cleared anytime.",
    keyPoints: [
      "Local cart & session storage only",
      "Zero cross-site trackers or ad pixels",
    ],
  },
];

export const AboutView: React.FC = () => {
  const [aimSlide, setAimSlide] = useState(1);
  const [showcaseItems, setShowcaseItems] = useState<AboutShowcaseItem[]>(DEFAULT_ABOUT_SHOWCASE);
  const [selectedPolicyCategory, setSelectedPolicyCategory] = useState<string>("all");
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const card = container.children[index] as HTMLElement | undefined;
    if (card) {
      const scrollPos = card.offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: scrollPos,
        behavior: "smooth",
      });
      setAimSlide(index);
    }
  };

  const handleNext = () => {
    const nextIndex = aimSlide >= showcaseItems.length - 1 ? 0 : aimSlide + 1;
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = aimSlide <= 0 ? showcaseItems.length - 1 : aimSlide - 1;
    scrollToIndex(prevIndex);
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollLeft = container.scrollLeft;
    const firstCard = container.firstElementChild as HTMLElement | null;
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth + 20; // 20px gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex >= 0 && newIndex < showcaseItems.length && newIndex !== aimSlide) {
        setAimSlide(newIndex);
      }
    }
  };

  useEffect(() => {
    fetch("/api/about-showcase?activeOnly=true")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setShowcaseItems(json.data);
        }
      })
      .catch((err) => console.error("Error loading showcase items:", err));

    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const matched = COMPLIANCE_POLICIES.find((p) => p.id === hash);
      if (matched) {
        setSelectedPolicyCategory("all");
      }
    }
  }, []);

  const filteredPolicies =
    selectedPolicyCategory === "all"
      ? COMPLIANCE_POLICIES
      : COMPLIANCE_POLICIES.filter((p) => p.category === selectedPolicyCategory);

  const IMPACT_STATS = [
    {
      value: "5,000+",
      label: "Innovators & Labs",
      description: "Engineers, student researchers & hobbyists supported",
      icon: UsersIcon,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
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
      href: "/categories/development-boards",
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3">
          <CategoryBreadcrumb items={[{ label: "About Prayog India" }]} />
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* 2. Hero Section: Open, Classic Modern Light Layout */}
        <section className="py-2 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 text-[#2563EB] text-xs font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#FFC20E]" />
                <span>PRAYOG INDIA • THE WORLD OF ROBOTICS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
                Powering India’s Next Generation of{" "}
                <span className="text-[#2563EB]">Robotics</span>,{" "}
                <span className="text-[#2563EB]">AI</span> &amp;{" "}
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
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" /> 100%
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
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Hardware Store</span>
                </Link>

                <Link
                  href="/services"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-2xs hover:border-slate-300 flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-[#2563EB]" />
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
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3 group hover:border-[#2563EB]/40"
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

        {/* 4. Our Aim At Prayog India (Pixel-perfect matching reference) */}
        <section className="relative space-y-5 sm:space-y-6">
          {/* Subtle Ambient Decorative Gradients matching reference */}
          <div className="absolute -top-16 -left-16 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header */}
          <div className="text-center space-y-3.5 max-w-2xl mx-auto">
            {/* Eyebrow: -- OUR MISSION -- */}
            <div className="inline-flex items-center gap-3 justify-center">
              <span className="w-10 h-[2px] bg-[#FFC20E] rounded-full" />
              <span className="text-xs font-bold text-[#2563EB] tracking-widest uppercase">
                OUR MISSION
              </span>
              <span className="w-10 h-[2px] bg-[#FFC20E] rounded-full" />
            </div>

            {/* Title: Our Aim At Prayog India */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Aim At <span className="text-[#2563EB]">Prayog India</span>
            </h2>

            {/* Subtitle - Clear, plain language, and easily understandable */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl mx-auto">
              Making robotics, drones, and technology simple and practical — providing 100% genuine hardware, hands-on learning, and turnkey lab setups across India.
            </p>
          </div>

          {/* Swipable Single-Row Action Showcase Carousel */}
          <div className="relative group/showcase">
            {/* Scrollable Gallery Track — STRICTLY Exactly ONE Single Row */}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {showcaseItems.map((photo, idx) => {
                const IconComponent = SHOWCASE_ICONS[photo.iconType] || UsersIcon;
                const bubbleBg = BUBBLE_COLOR_MAP[photo.bubbleColor] || "bg-[#FFC20E] text-slate-900";
                const isActive = aimSlide === idx;
                return (
                  <div
                    key={photo.id || idx}
                    onClick={() => {
                      setAimSlide(idx);
                      scrollToIndex(idx);
                    }}
                    className={`shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc((100%-40px)/3)] snap-start relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[10/12] bg-slate-900 group/card transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "border-2 border-[#FFC20E] shadow-xl shadow-amber-500/10 scale-[1.01]"
                        : "border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md"
                    }`}
                  >
                    <Image
                      src={photo.image}
                      alt={photo.alt || photo.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                    {/* Bottom Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                    {/* Top Floating Badge Tag ("Tip") — Clean Frosted White Pill with Icon Bubble */}
                    <div className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 z-10">
                      <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md pl-1.5 pr-3.5 py-1 rounded-full shadow-md border border-white/80 transition-transform group-hover/card:scale-105">
                        {/* Colored Icon Bubble */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${bubbleBg}`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </span>

                        {/* Tag Label */}
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          {photo.badge}
                        </span>
                      </span>
                    </div>

                    {/* Bottom Captions */}
                    <div className="absolute bottom-5 left-5 right-5 text-left space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-sm">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal drop-shadow-sm line-clamp-3">
                        {photo.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Left & Right Nav Arrows (White round buttons positioned outside cards) */}
            <button
              type="button"
              aria-label="Previous slide"
              onClick={handlePrev}
              className="absolute -left-3 sm:-left-5 lg:-left-6 top-1/2 -translate-y-1/2 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-md hover:shadow-lg flex items-center justify-center transition-all z-20 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={handleNext}
              className="absolute -right-3 sm:-right-5 lg:-right-6 top-1/2 -translate-y-1/2 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-md hover:shadow-lg flex items-center justify-center transition-all z-20 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {showcaseItems.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={`transition-all duration-300 rounded-full ${
                    aimSlide === i
                      ? "w-3 h-3 bg-[#2563EB]"
                      : "w-2.5 h-2.5 bg-blue-200 hover:bg-blue-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 5. Four Pillars of Prayog India */}
        <section className="space-y-6 bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="bg-blue-50 text-[#2563EB] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block border border-blue-200/60">
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
                  className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3.5 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-[#2563EB]/50 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
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
              <span className="bg-blue-50 text-[#2563EB] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block border border-blue-200/60">
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
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
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
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-[#2563EB]/60 transition-all duration-300 flex flex-col justify-between"
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
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#2563EB] transition-colors">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB]">
                  <span>Explore Hardware</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. Institutions & Labs Trust Banner - Styled like Home Page BrandPartners */}
        <section className="py-5 sm:py-7 bg-white border-y border-slate-200/70 overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10 2xl:-mx-12 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-3 sm:space-y-4 text-center">
          {/* Section Header with Centered Divider (Styled like the reference design) */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative bg-white px-4 sm:px-8">
              <h2 className="text-xs sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight">
                Official Institutional &amp; Defense Partners
              </h2>
            </div>
          </div>

          {/* Two-Row Opposing Marquee Tracks (Compact & Sleek) */}
          <div className="space-y-2.5 sm:space-y-3 py-1">
            {/* Row 1: Right to Left */}
            <div className="circular-loop-wrapper">
              <div className="circular-loop-track-left items-center">
                {ROW_1_PARTNERS.map((partner, idx) => (
                  <div
                    key={`r1-${partner.name}-${idx}`}
                    title={`${partner.name} (${partner.fullName})`}
                    className="shrink-0 w-24 sm:w-28 lg:w-32 h-16 sm:h-[70px] lg:h-[74px] bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-slate-300 rounded-xl p-1.5 sm:p-2 flex items-center justify-center transition-all duration-300 group cursor-pointer shadow-2xs hover:shadow-sm hover:-translate-y-0.5 select-none"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Left to Right */}
            <div className="circular-loop-wrapper">
              <div className="circular-loop-track-right items-center">
                {ROW_2_PARTNERS.map((partner, idx) => (
                  <div
                    key={`r2-${partner.name}-${idx}`}
                    title={`${partner.name} (${partner.fullName})`}
                    className="shrink-0 w-24 sm:w-28 lg:w-32 h-16 sm:h-[70px] lg:h-[74px] bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-slate-300 rounded-xl p-1.5 sm:p-2 flex items-center justify-center transition-all duration-300 group cursor-pointer shadow-2xs hover:shadow-sm hover:-translate-y-0.5 select-none"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Institutional Procurement & Contact CTA */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 border border-blue-200/60 p-8 sm:p-12 shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white border border-blue-200/60 text-[#2563EB] text-[11px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full shadow-2xs">
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
                  <Phone className="w-4 h-4 text-[#2563EB]" />{" "}
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
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2 hover:scale-[1.02]"
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

        {/* 9. Policy, Legal & Operational Compliance Documents (Anchors for Footer) */}
        <section id="policies" className="pt-10 border-t border-slate-200/90 space-y-8 scroll-mt-20">
          <div className="space-y-3 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 text-[#2563EB] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LEGAL &amp; OPERATIONAL POLICIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Customer Trust &amp; Hardware Compliance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Official operating standards, warranty terms, dispatch timelines, and legal disclaimers for Prayog India customers, schools, and institutional partner labs.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {POLICY_CATEGORIES.map((cat) => {
                const isActive = selectedPolicyCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedPolicyCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 scale-105"
                        : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90 shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid - Compact 4-Column Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
            {filteredPolicies.map((policy) => {
              const Icon = policy.icon;
              return (
                <article
                  id={policy.id}
                  key={policy.id}
                  className="scroll-mt-24 group relative bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-4.5 shadow-2xs hover:shadow-lg hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Color Accent Line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${policy.gradient} opacity-75 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl ${policy.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-300`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 inline-flex items-center shadow-2xs leading-tight ${policy.badgeStyle}`}
                      >
                        {policy.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        {policy.categoryLabel}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors leading-snug">
                        {policy.title}
                      </h3>
                    </div>

                    {/* Description Body */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {policy.description}
                    </p>
                  </div>

                  {/* Key Provisions */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 space-y-1">
                    {policy.keyPoints.map((point, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-100/80"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#2563EB] shrink-0" />
                        <span className="truncate leading-none">{point}</span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom Trust & Escalation Strip */}
          <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/80 border border-blue-200/70 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise &amp; Institutional Assurance</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Need custom SLAs, vendor registration, or institutional onboarding?
              </h4>
              <p className="text-xs text-slate-500 max-w-xl">
                Our compliance team coordinates directly with procurement officers, ATL coordinators, and academic institutions across India.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20Prayog%20India,%20I%20have%20an%20inquiry%20regarding%20commercial%20policies%20and%20hardware%20compliance.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:scale-105"
              >
                <span>WhatsApp Legal Desk</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:border-slate-300"
              >
                <span>Contact Compliance Team</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
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
