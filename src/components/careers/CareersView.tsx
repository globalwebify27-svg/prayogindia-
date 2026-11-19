"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { JOB_OPENINGS, JobOpening, COMPANY_INFO } from "@/data/companyData";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Cpu,
  Bot,
  Plane,
  Wrench,
  Search,
  X,
  ShieldCheck,
  Zap,
  Award,
  Users,
  Send,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Heart,
  TrendingUp,
} from "lucide-react";

export const CareersView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Derive unique departments
  const departments = useMemo(() => {
    const set = new Set(JOB_OPENINGS.map((j) => j.department));
    return ["all", ...Array.from(set)];
  }, []);

  // Filter positions
  const filteredJobs = useMemo(() => {
    return JOB_OPENINGS.filter((job) => {
      const matchesDept =
        selectedDept === "all" || job.department === selectedDept;

      if (!matchesDept) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = job.title.toLowerCase().includes(q);
      const inDept = job.department.toLowerCase().includes(q);
      const inDesc = job.shortDescription.toLowerCase().includes(q);
      const inTags = job.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      const inReqs = job.requirements.some((r) => r.toLowerCase().includes(q));

      return inTitle || inDept || inDesc || inTags || inReqs;
    });
  }, [selectedDept, searchQuery]);

  // Department icon mapper
  const getDeptBadgeColor = (dept: string) => {
    switch (dept) {
      case "Flight Systems & Avionics":
        return "bg-sky-50 text-[#00AEEF] border-sky-200/80";
      case "Autonomous Systems & AI":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "Hardware R&D":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "Mechanical Design & Prototyping":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
    }
  };

  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case "Flight Systems & Avionics":
        return <Plane className="w-3.5 h-3.5" />;
      case "Autonomous Systems & AI":
        return <Bot className="w-3.5 h-3.5" />;
      case "Hardware R&D":
        return <Cpu className="w-3.5 h-3.5" />;
      case "Mechanical Design & Prototyping":
        return <Wrench className="w-3.5 h-3.5" />;
      default:
        return <Briefcase className="w-3.5 h-3.5" />;
    }
  };

  const FAQS = [
    {
      q: "Can freshers or self-taught makers apply?",
      a: "Absolutely! At Prayog India, we care vastly more about what you have built than credentials on paper. If you have designed custom PCBs, written FreeRTOS bootloaders, flown custom quadcopters, or published open-source ROS2 packages, we want to talk to you.",
    },
    {
      q: "Where is the main engineering laboratory located?",
      a: "Our hardware R&D facility, rapid prototyping workshop, and test flight cages are situated at Prayog Tech Hub, Plot 42, Electronics City Phase 1, Bengaluru, Karnataka.",
    },
    {
      q: "What is the interview and hiring timeline?",
      a: "Our hiring process is fast and respectful of your time: initial application review within 48 hours, followed by a hands-on technical discussion, an in-person or virtual lab tour, and a formal offer within 7 to 10 days.",
    },
    {
      q: "Does Prayog India provide relocation assistance for outstation engineers?",
      a: "Yes. For candidates relocating to Bengaluru from other states across India, we provide comprehensive relocation allowances, temporary accommodation assistance, and travel booking support.",
    },
    {
      q: "Can I use the lab for my own personal robotics projects?",
      a: "Yes! Every engineer receives an annual prototyping allowance and after-hours access to our 3D printers, laser cutters, CNC tools, and test gear for their own personal maker hacks.",
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-12 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "Careers" }]} />

      {/* 2. Hero Section: High-Tech Robotics & Hardware Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0B254E] to-slate-900 border border-slate-800 text-white shadow-2xl p-6 sm:p-10 lg:p-12">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-[#00AEEF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-24 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-[#00AEEF]/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#00AEEF] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-sky-200">
              We Are Hiring · Mechatronics, Firmware &amp; UAV Engineers
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Build Real Hardware That{" "}
            <span className="bg-gradient-to-r from-[#00AEEF] via-sky-300 to-[#FFC20E] bg-clip-text text-transparent">
              Flies, Drives, and Computes.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-medium">
            Join Prayog India’s indigenous hardware engineering laboratory in{" "}
            <strong className="text-white">Electronics City, Bengaluru</strong>.
            We design high-reliability microcontrollers, autonomous drone flight
            stacks, and turnkey laboratory ecosystems that empower hundreds of
            universities and R&amp;D institutions across the nation.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {[
              {
                value: "10,000+",
                label: "Robotics Labs Powered",
                sub: "Across 28 Indian States",
              },
              {
                value: "100%",
                label: "Indigenous R&D",
                sub: "PCB, Firmware & Mechanics",
              },
              {
                value: "Bengaluru",
                label: "Electronics City HQ",
                sub: "Prototyping & Flight Lab",
              },
              {
                value: "48 Hours",
                label: "Application Response",
                sub: "Direct Engineer Review",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-sm"
              >
                <div className="text-xl sm:text-2xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-[11px] font-bold text-sky-200 mt-0.5">
                  {stat.label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#openings"
              className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#00AEEF]/25 cursor-pointer"
            >
              <span>Explore Open Positions</span>
              <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
            </a>
            <a
              href="#perks"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>Why Engineers Choose Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Why Build With Us: Perks & Engineering Culture */}
      <div id="perks" className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full border border-[#00AEEF]/20 inline-block">
            Our Engineering Culture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Engineers Love Building at Prayog India
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            We don’t just write software; we touch real silicon, solder physical
            PCBs, assemble drone gimbals, and build autonomous machines that
            interact with the physical world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Cpu,
              title: "Physical Hardware Workstation",
              desc: "Every engineer gets a fully equipped workbench: Rigol 4-channel digital oscilloscopes, multi-layer SMD rework stations, logic analyzers, and DC power supplies.",
              tag: "Real Silicon Lab",
              color: "border-sky-200 bg-sky-50/50 text-[#005CA9]",
            },
            {
              icon: Zap,
              title: "Unlimited Prototyping Allowance",
              desc: "Get an internal monthly hardware credit to order any microcontrollers, LIDARs, ESCs, carbon-fiber plates, and sensors from our store for personal weekend maker projects.",
              tag: "Maker Budget",
              color: "border-amber-200 bg-amber-50/50 text-amber-900",
            },
            {
              icon: Award,
              title: "Direct Real-World Impact",
              desc: "Your firmware bootloaders, flight stacks, and mechanical assemblies will be deployed in thousands of Atal Tinkering Labs and elite engineering universities nationwide.",
              tag: "10,000+ Labs",
              color: "border-emerald-200 bg-emerald-50/50 text-emerald-900",
            },
            {
              icon: TrendingUp,
              title: "Rapid Iteration, Zero Red Tape",
              desc: "Design a schematic on Monday, mill the PCB or 3D print in-house by Wednesday, and verify code execution on physical silicon by Friday. No corporate bureaucracy.",
              tag: "Ship Every Week",
              color: "border-purple-200 bg-purple-50/50 text-purple-900",
            },
            {
              icon: Heart,
              title: "Comprehensive Health & Relocation",
              desc: "Competitive compensation packages, performance incentives, 100% comprehensive medical insurance for you and your family, plus full relocation assistance to Bengaluru.",
              tag: "Full Wellness",
              color: "border-rose-200 bg-rose-50/50 text-rose-900",
            },
            {
              icon: GraduationCap,
              title: "Patents, Papers & Conferences",
              desc: "We sponsor conference tickets (ROSCon, Maker Faire, IEEE), cover technical certifications, and fully fund and file hardware patents under your name.",
              tag: "IP Support",
              color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
            },
          ].map((perk, idx) => {
            const IconComp = perk.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-[#00AEEF] flex items-center justify-center group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${perk.color}`}
                  >
                    {perk.tag}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {perk.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Open Positions Desk */}
      <div id="openings" className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-0.5 rounded-full border border-[#00AEEF]/20">
                Current Opportunities
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Open Engineering Positions ({filteredJobs.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Explore open vacancies at our Bengaluru R&amp;D lab and field
              engineering units.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by role, skill (e.g. ROS2, C++)..."
              className="w-full bg-white border border-slate-200 pl-10 pr-9 py-2.5 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {departments.map((dept) => {
            const active = selectedDept === dept;
            const count =
              dept === "all"
                ? JOB_OPENINGS.length
                : JOB_OPENINGS.filter((j) => j.department === dept).length;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  active
                    ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20 ring-2 ring-[#00AEEF]/30"
                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                }`}
              >
                <span>{dept === "all" ? "All Disciplines" : dept}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-3 max-w-md mx-auto px-4">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">
              No Positions Matching Your Query
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              We couldn&apos;t find any roles matching &quot;{searchQuery}&quot;. Try clearing
              your search filter or exploring other departments.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDept("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs hover:border-[#00AEEF] hover:shadow-lg transition-all group relative overflow-hidden"
              >
                {/* Featured indicator strip */}
                {job.isFeatured && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00AEEF] to-[#FFC20E]" />
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Role Details */}
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-0.5 rounded-full border ${getDeptBadgeColor(job.department)}`}
                      >
                        {getDeptIcon(job.department)}
                        <span>{job.department}</span>
                      </span>

                      {job.isFeatured && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Featured Role</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>

                      <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.experience}
                      </span>

                      {job.salaryRange && (
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          {job.salaryRange}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#005CA9] transition-colors">
                      {job.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {job.shortDescription}
                    </p>

                    {/* Tech Stack Tags */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
                          Stack:
                        </span>
                        {job.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right CTA */}
                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-center gap-3">
                    <Link
                      href={`/careers/${job.slug}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 group-hover:bg-[#00AEEF] text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md group-hover:shadow-sky-500/25"
                    >
                      <span>View Role &amp; Apply</span>
                      <ArrowRight className="w-4 h-4 text-[#FFC20E] group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Full-time · Bengaluru Lab
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Transparent 4-Step Hiring Roadmap */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0B254E] to-slate-950 rounded-3xl p-6 sm:p-10 border border-slate-800 text-white space-y-8 shadow-xl">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#00AEEF]/10 px-3 py-1 rounded-full border border-[#00AEEF]/20 inline-block">
            Simple &amp; Fast Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Our 4-Step Engineering Journey
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            We value your time. No endless automated loops or robotic HR filters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Application Review",
              time: "Within 48 Hours",
              desc: "A senior robotics engineer directly examines your portfolio, GitHub repositories, and hardware projects.",
            },
            {
              step: "02",
              title: "Technical Deep Dive",
              time: "45 Minutes",
              desc: "A hands-on discussion exploring your schematic designs, firmware architecture, or mechanical CAD problem solving.",
            },
            {
              step: "03",
              title: "Robotics Lab Tour",
              time: "In-Person / Virtual",
              desc: "Tour our Bengaluru prototyping lab, meet your teammates, and test drive ongoing rover and UAV prototypes.",
            },
            {
              step: "04",
              title: "Offer & Welcome Kit",
              time: "Prompt Decision",
              desc: "Transparent offer details and a personalized hardware welcome box packed with custom development boards.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5 backdrop-blur-xs relative overflow-hidden"
            >
              <span className="text-3xl font-black text-white/10 absolute right-3 top-2 font-mono">
                {item.step}
              </span>
              <span className="text-[10px] font-mono font-black text-[#00AEEF] uppercase tracking-wider block">
                {item.time}
              </span>
              <h3 className="text-sm font-extrabold text-white">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. General Open Application / Resume Drop CTA */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50/50 rounded-3xl border border-sky-200/80 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-[#005CA9] text-[10px] font-black uppercase">
            <Users className="w-3.5 h-3.5" />
            <span>Open Application Desk</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Don&apos;t See Your Exact Role?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            We are always scouting brilliant PCB designers, drone pilots,
            computer vision researchers, and mechatronics makers. Send us your
            resume and project portfolio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent("[Open Application] Robotics Engineer - [Your Name]")}&body=${encodeURIComponent("Hi Prayog India Team,\n\nI am passionate about robotics and would love to be considered for engineering opportunities.\n\nPortfolio / GitHub: \nLinkedIn: \nPhone: \n\nLooking forward to speaking with the team!")}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#FFC20E]" />
            <span>Email Open Application</span>
          </a>

          <a
            href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Prayog India Careers Team, I would like to enquire about open engineering opportunities.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 7. Engineering FAQs */}
      <div className="space-y-4 pt-2">
        <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full border border-[#00AEEF]/20 inline-block">
            Frequently Asked Questions
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Questions About Joining Prayog India
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-extrabold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#00AEEF] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
