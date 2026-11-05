"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { INDUSTRIES, LEARNING_HUB, TESTIMONIALS } from "@/data/mockData";
import {
  ArrowRight,
  Star,
  GraduationCap,
  CheckCircle2,
  Shield,
  Truck,
  Headset,
  Award,
  Layers,
  Building2,
  FileText,
  Cpu,
  Headphones,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface AdditionalSectionsProps {
  onOpenB2BModal: () => void;
}

export const IndustriesSection: React.FC = () => {
  return (
    <section
      id="industries"
      className="py-8 bg-slate-50/60 border-t border-slate-100"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block bg-blue-50 text-[#1E56A0] text-xs font-extrabold tracking-widest uppercase px-3.5 py-1 rounded-full mb-3">
            SECTORS SERVED
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            Technology Across Industries
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.id}
              className="group relative rounded-3xl overflow-hidden h-64 border border-slate-200 shadow-card-premium hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            >
              <Image
                src={ind.image}
                alt={ind.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/90 via-[#0A1128]/40 to-transparent"></div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-lg font-bold group-hover:text-[#D4AF37] transition-colors mb-1">
                  {ind.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {ind.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const LearningHubSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "internship" | "workshops" | "certifications"
  >("all");
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantCollege, setApplicantCollege] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "internship") setActiveFilter("internship");
      else if (tab === "workshops" || tab === "workshop") setActiveFilter("workshops");
      else if (tab === "certifications" || tab === "certification") setActiveFilter("certifications");
    }
  }, []);

  const filteredItems = LEARNING_HUB.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "internship") return item.category === "Internships";
    if (activeFilter === "workshops") return item.category === "Workshops";
    if (activeFilter === "certifications") return item.category === "Certifications";
    return true;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        setSelectedProgram(null);
        setApplicantName("");
        setApplicantPhone("");
        setApplicantCollege("");
      }, 2000);
    }, 600);
  };

  return (
    <section id="learning-hub" className="py-8 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#2563EB] text-xs font-bold mb-3 uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Prayog Academy &amp; Labs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
              Learning Hub
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Industry-grade robotics internships, live hands-on engineering workshops, and recognized STEM skill certifications.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Programs" },
              { id: "internship", label: "Internship Program" },
              { id: "workshops", label: "Workshops" },
              { id: "certifications", label: "Certifications" },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isInternship = item.category === "Internships";
            const isWorkshop = item.category === "Workshops";
            const isCertification = item.category === "Certifications";

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                      isInternship
                        ? "bg-amber-500 text-white"
                        : isWorkshop
                        ? "bg-blue-600 text-white"
                        : isCertification
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {item.category === "Internships"
                      ? "Internship"
                      : item.category}
                  </span>

                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                    {item.duration}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#1E56A0] mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                        {item.level}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0A1128] group-hover:text-[#2563EB] transition-colors line-clamp-2 mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProgram(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-[#2563EB] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group-hover:bg-[#2563EB]"
                    >
                      <span>
                        {isInternship
                          ? "Apply for Internship"
                          : isWorkshop
                          ? "Register for Workshop"
                          : isCertification
                          ? "Enroll in Certification"
                          : "Explore Program"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Application Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedProgram(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {appliedSuccess ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Application Received!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our Prayog India Academic team will contact you within 24 hours with schedule and syllabus details.
                </p>
              </div>
            ) : (
              <div>
                <div className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-black uppercase tracking-wider mb-2">
                  {selectedProgram.category}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1 leading-snug">
                  {selectedProgram.title}
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Duration: {selectedProgram.duration} • Level: {selectedProgram.level}
                </p>

                <form onSubmit={handleApplySubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Om Kumar"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College / Institution / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantCollege}
                      onChange={(e) => setApplicantCollege(e.target.value)}
                      placeholder="e.g. BIT Mesra / Engineering Student"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isApplying}
                    className="w-full mt-2 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isApplying ? "Submitting..." : "Submit Application / Enquiry →"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export const WhyPrayogSection: React.FC = () => {
  const features = [
    {
      title: "Authentic Technology Products",
      desc: "Direct sourcing from certified manufacturers with 100% component verification.",
      icon: Shield,
    },
    {
      title: "Expert Engineering Support",
      desc: "Dedicated technical support engineers for circuit debugging & UAV setup.",
      icon: Headset,
    },
    {
      title: "STEM & Robotics Learning",
      desc: "Step-by-step schematics, sample codes, and instructional video guides.",
      icon: GraduationCap,
    },
    {
      title: "Fast & Reliable Delivery",
      desc: "Express Pan-India courier dispatch with real-time tracking.",
      icon: Truck,
    },
    {
      title: "B2B & Institutional Support",
      desc: "GST invoice compliance, bulk quotation desk & educational discounts.",
      icon: Award,
    },
    {
      title: "Professional Tech Solutions",
      desc: "Custom robotics hardware design and drone payload customization.",
      icon: Layers,
    },
  ];

  return (
    <section
      id="why-prayog"
      className="py-8 bg-slate-50/70 border-y border-slate-100"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            More Than a Store. A Technology Ecosystem.
          </h2>
          <p className="text-slate-600 text-base mt-3">
            Prayog India by Dilay Robotics provides complete end-to-end hardware
            procurement, STEM learning resources, and technical support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card-premium flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E56A0] flex items-center justify-center shrink-0">
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A1128] mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const B2BSection: React.FC<AdditionalSectionsProps> = ({
  onOpenB2BModal,
}) => {
  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="bg-gradient-to-br from-[#F0F9FF] via-white to-[#F8FAFC] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden border border-sky-100">
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-amber-50/60 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (Span 7): Core Messaging & Actions */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 border border-blue-200/60 px-3.5 py-1 rounded-full shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />{" "}
                Institutional &amp; B2B Desk
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Technology Solutions for{" "}
                <span className="text-[#2563EB]">Institutions &amp; Labs</span>
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                Access specialized institutional procurement, volume discounts,
                official GST tax invoicing, and turnkey robotics &amp; STEM
                hardware packages tailored for schools, universities, and
                research labs.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenB2BModal}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Request Institutional Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenB2BModal}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm border border-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Headphones className="w-4 h-4 text-[#2563EB]" />
                  <span>Talk to an Expert</span>
                </button>
              </div>

              {/* Verified Client Sectors */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>Schools &amp; Colleges</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>STEM &amp; ATL Labs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>Corporate R&amp;D</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>GeM &amp; Tenders</span>
                </div>
              </div>
            </div>

            {/* Right Column (Span 5): Sleek Feature & Benefit Cards */}
            <div className="lg:col-span-5 space-y-3">
              {/* Feature Card 1: Bulk Discounts & Invoicing */}
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-[#2563EB]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Tiered Institutional Pricing
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Official GST proforma tax invoices with volume discounts up
                    to 35% on batch orders.
                  </p>
                </div>
              </div>

              {/* Feature Card 2: Turnkey Lab Packages */}
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-[#2563EB]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Turnkey Lab &amp; Curriculum Kits
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Complete setups for robotics, IoT sensors, drone flight
                    controllers, and microcontrollers.
                  </p>
                </div>
              </div>

              {/* Feature Card 3: Priority Regional Dispatch */}
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-[#2563EB]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Priority Regional Dispatch
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Same-day and 24h dispatch from Ranchi &amp; Patna hubs with
                    dedicated technical support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const TestimonialsSection: React.FC = () => {
  const VERIFIED_REVIEWS = [
    {
      id: "rev-1",
      name: "Dr. Arindam Bose",
      role: "Robotics Lab Lead",
      institution: "IIT Kharagpur",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      comment:
        "Ordered 15 sets of Pixhawk 6C and SimonK ESCs for our UAV swarm testing. Ranchi dispatch arrived within 24 hours with authentic GST tax invoice. Outstanding build quality.",
      product: "Pixhawk 6C Autopilot",
      verified: true,
    },
    {
      id: "rev-2",
      name: "Sneha Kulkarni",
      role: "STEM Coordinator",
      institution: "St. Xavier High School",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      comment:
        "The Dilay-Bot 4WD Robotics starter kits made our ATL lab workshop an absolute success. Students assembled obstacle avoiders in under 3 hours using the included manuals.",
      product: "PRAYOG Dilay-Bot Kit",
      verified: true,
    },
    {
      id: "rev-3",
      name: "Rohan Deshmukh",
      role: "IoT Embedded Developer",
      institution: "Apex IoT Labs",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      comment:
        "Best supplier for genuine Raspberry Pi 5 8GB and dual-core ESP32 boards. Flashed firmware instantly without driver errors. Will definitely reorder for industrial projects.",
      product: "Raspberry Pi 5 (8GB)",
      verified: true,
    },
    {
      id: "rev-4",
      name: "Dr. Meera Nambiar",
      role: "AI & Robotics Scientist",
      institution: "IISc Bangalore",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      comment:
        "Procured Jetson Orin Nano modules for our SLAM LiDAR rover project. Hardware performance and GPIO pinout reliability are impeccable. Excellent institutional support.",
      product: "Jetson Orin Nano Kit",
      verified: true,
    },
    {
      id: "rev-5",
      name: "Amitav Sanyal",
      role: "Drone Systems Lead",
      institution: "AeroTech Innovations",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      comment:
        "The brushless A2212 motors and 30A ESCs balanced perfectly during payload drop testing. Zero jitter and solid telemetry communication up to 4km range.",
      product: "Carbon Quad Frame",
      verified: true,
    },
    {
      id: "rev-6",
      name: "Vikramjit Singh",
      role: "Embedded Club Mentor",
      institution: "DTU Delhi",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
      comment:
        "High-torque MG996R metal gear servos handled multi-axis inverse kinematics smoothly during our annual inter-college robotics symposium.",
      product: "6-DOF Robot Arm Kit",
      verified: true,
    },
    {
      id: "rev-7",
      name: "Pooja Agarwal",
      role: "Electronics Dept",
      institution: "NIT Patna",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      comment:
        "Local Patna hub delivered our batch order within 18 hours. The LED matrix on the UNO R4 WiFi is great for teaching embedded C to undergraduate engineering students.",
      product: "Arduino UNO R4 WiFi",
      verified: true,
    },
    {
      id: "rev-8",
      name: "Kunal Mukherjee",
      role: "Automation Engineer",
      institution: "Kolkata AgriTech",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      comment:
        "Industrial grade capacitive soil moisture probes and LoRa SX1278 transceivers deployed across 20 greenhouse zones with flawless telemetry packet reception.",
      product: "Smart Agri LoRa Kit",
      verified: true,
    },
  ];

  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isWrapping = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  // Triple clone for continuous circular linked list motion
  const CIRCULAR_REVIEWS = [
    ...VERIFIED_REVIEWS.map((r, i) => ({ ...r, _cloneKey: `prev-${r.id}-${i}` })),
    ...VERIFIED_REVIEWS.map((r, i) => ({ ...r, _cloneKey: `curr-${r.id}-${i}` })),
    ...VERIFIED_REVIEWS.map((r, i) => ({ ...r, _cloneKey: `next-${r.id}-${i}` })),
  ];

  // Initialize scroll position in the center set on mount
  useEffect(() => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 20 : 370;
    const singleSetWidth = VERIFIED_REVIEWS.length * cardWidth;

    container.style.scrollBehavior = "auto";
    container.scrollLeft = singleSetWidth;
    requestAnimationFrame(() => {
      if (sliderRef.current) {
        sliderRef.current.style.scrollBehavior = "smooth";
      }
    });
  }, []);

  const handleScroll = () => {
    if (!sliderRef.current || isWrapping.current) return;
    const container = sliderRef.current;
    const card = container.firstElementChild as HTMLElement;
    if (!card) return;
    const cardWidth = card.offsetWidth + 20;
    const singleSetWidth = VERIFIED_REVIEWS.length * cardWidth;
    const currentScroll = container.scrollLeft;

    const rawIdx = Math.round(currentScroll / cardWidth);
    const active =
      ((rawIdx % VERIFIED_REVIEWS.length) + VERIFIED_REVIEWS.length) %
      VERIFIED_REVIEWS.length;
    setActiveIndex(active);

    // Continuous circular linked list wrapping
    if (currentScroll >= singleSetWidth * 2) {
      isWrapping.current = true;
      container.style.scrollBehavior = "auto";
      container.scrollLeft = currentScroll - singleSetWidth;
      requestAnimationFrame(() => {
        container.style.scrollBehavior = "smooth";
        isWrapping.current = false;
      });
    } else if (currentScroll <= singleSetWidth * 0.2) {
      isWrapping.current = true;
      container.style.scrollBehavior = "auto";
      container.scrollLeft = currentScroll + singleSetWidth;
      requestAnimationFrame(() => {
        container.style.scrollBehavior = "smooth";
        isWrapping.current = false;
      });
    }
  };

  const scrollNext = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 20 : 370;
    container.scrollBy({ left: cardWidth, behavior: "smooth" });
  };

  const scrollPrev = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 20 : 370;
    container.scrollBy({ left: -cardWidth, behavior: "smooth" });
  };

  const scrollToSlide = (index: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const card = container.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 20 : 370;
    const singleSetWidth = VERIFIED_REVIEWS.length * cardWidth;

    const currentScroll = container.scrollLeft;
    const currentSetIndex = Math.round(currentScroll / singleSetWidth);
    const target = currentSetIndex * singleSetWidth + index * cardWidth;
    container.scrollTo({ left: target, behavior: "smooth" });
  };

  // Autoplay continuously cycles through the circular list
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      scrollNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Mouse Drag handlers for desktop swipe feel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollStart.current = sliderRef.current.scrollLeft;
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    setIsPaused(false);
  };

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-white via-slate-50/50 to-white border-t border-slate-200/80 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6 sm:space-y-8">
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trusted by 5,000+ Innovators, Labs &amp; Schools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Real customer hardware setups, verified ratings, and project builds across India.
            </p>
          </div>

          {/* Slider Prev / Next Controls */}
          <div className="hidden sm:flex items-center gap-2 self-end pb-1">
            <button
              onClick={scrollPrev}
              aria-label="Previous review"
              className="w-10 h-10 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-[#2563EB] flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next review"
              className="w-10 h-10 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-[#2563EB] flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Smooth User-Friendly Snap Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-1 cursor-grab active:cursor-grabbing select-none"
          >
            {CIRCULAR_REVIEWS.map((t) => (
              <div
                key={t._cloneKey}
                className="w-[85vw] sm:w-[350px] lg:w-[390px] shrink-0 snap-start bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-[#2563EB]/40 transition-all duration-300 flex flex-col justify-between space-y-4 group select-none cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Rating, Verified Pill & Circle Profile Image */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Lab Setup</span>
                      </div>
                    </div>

                    {/* Circle Profile Image */}
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xs ring-1 ring-slate-200/80 shrink-0">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Comment Text with clean readability */}
                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                {/* Author & Product Info */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-[13px] font-bold text-slate-900 truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                      {t.role} • {t.institution}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-blue-100 px-2.5 py-1 rounded-lg shrink-0 max-w-[130px] truncate">
                    {t.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Pagination Dots & Mobile Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Interactive Pagination Dots */}
          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            {VERIFIED_REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === i
                    ? "w-6 h-2 bg-[#2563EB]"
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          {/* Mobile Arrows */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous review"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white active:scale-95 text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next review"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white active:scale-95 text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const LinkButton: React.FC<{ href: string; label: string }> = ({ label }) => (
  <button className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors cursor-pointer">
    <span>{label}</span>
    <ArrowRight className="w-4 h-4" />
  </button>
);
