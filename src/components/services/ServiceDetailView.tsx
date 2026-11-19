"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ServiceEnquiryModal } from "@/components/services/ServiceEnquiryModal";
import { SERVICES_DATA } from "@/data/servicesData";
import { submitServiceEnquiry } from "@/lib/apiServices";
import {
  CheckCircle2,
  ArrowLeft,
  Send,
  MessageSquare,
  Maximize2,
  X,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  User,
  FileText,
  Clock,
  Cpu,
  GraduationCap,
  Award,
  ArrowRight,
  Wrench,
  BookOpen,
  Layers,
} from "lucide-react";

interface ServiceDetailProps {
  slug: string;
}

export const ServiceDetailView: React.FC<ServiceDetailProps> = ({ slug }) => {
  const service =
    SERVICES_DATA.find((s) => s.slug === slug || s.id === slug) ||
    SERVICES_DATA[0];

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(
    null,
  );

  // Quick Inline Form State
  const [formName, setFormName] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const institutionInputRef = useRef<HTMLInputElement>(null);

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, I am requesting a quotation for "${service.name}". Please provide an itemized proposal.`,
  );

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        institutionInputRef.current?.focus();
      }, 400);
    }
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await submitServiceEnquiry({
        serviceName: service.name,
        name: `${formName} (${formOrg || "Institution"})`,
        phone: formPhone,
        email: formEmail,
        notes: formNotes,
        message: formNotes || `Quotation request for ${service.name}`,
      });

      if (res.success) {
        setFormSuccess(true);
      } else {
        setFormError(res.message || "Failed. Please contact on WhatsApp.");
      }
    } catch {
      setFormError("Network error. Please reach out on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 lg:pb-16 font-sans">
      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 flex items-center justify-between">
          <CategoryBreadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: service.name },
            ]}
          />
          <Link
            href="/services"
            className="text-xs font-extrabold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Services</span>
          </Link>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-6 space-y-8">
        {/* ── Executive Hero Card ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Headline, Key Value Props & Specs */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Badges Strip */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#00AEEF] border border-blue-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] animate-pulse" />
                    Turnkey Institutional Solution
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    NEP 2020 Aligned
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    <Award className="w-3.5 h-3.5 text-slate-600" />
                    Govt & ATL Ready
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {service.name}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-medium">
                  {service.shortDescription}
                </p>
              </div>

              {/* 4 Key Specifications Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-[#00AEEF]" />
                    <span>Timeline</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    7–14 Days
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Turnkey Setup
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hardware</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    OEM Direct
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Lab Grade
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Training</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    Certified
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Educator Master
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Warranty</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    1-Year AMC
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    On-Site Support
                  </div>
                </div>
              </div>

              {/* Action Buttons Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="bg-[#0B132B] hover:bg-[#00AEEF] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0B132B]/10 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Quotation</span>
                </button>

                <a
                  href={`https://wa.me/918709789641?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp Enquiry</span>
                </a>

                <a
                  href="tel:+918709789641"
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91 87097 89641</span>
                </a>
              </div>
            </div>

            {/* Right: Feature Image Card */}
            <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-slate-100 overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
              <Image
                src={service.bannerImage || service.image}
                alt={service.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-white/40 shadow-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00AEEF] text-white flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                      Turnkey Deployment
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      Official Prayog India Setup
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-Column Section: Service Content & Interactive Quotation Desk ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Clean Modular Content Architecture */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Scope & Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  Service Scope
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Turnkey Architecture & Lab Scope
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {service.description || service.shortDescription}
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 mt-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-extrabold text-slate-900">
                    Full Compliance Guarantee:{" "}
                  </span>
                  Turnkey installations adhere to CBSE/ICSE STEM guidelines,
                  National Education Policy (NEP 2020), and ISO-certified
                  electrical ESD safety protocols.
                </div>
              </div>
            </div>

            {/* Card 2: Deliverables & Inclusions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 block w-fit mb-1">
                    Deliverables & Inclusions
                  </span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    What is Included in this Setup
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400 hidden sm:block">
                  {service.features.length} Items Included
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {service.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#00AEEF] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-relaxed">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: 4-Stage Setup Process */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60 block w-fit mb-1">
                  Implementation Workflow
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  4-Stage Turnkey Deployment Roadmap
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    step: "01",
                    title: "Space Audit & Layout Plan",
                    desc: "Site survey, electrical load review, CAD workbench floor layout design.",
                    icon: Layers,
                  },
                  {
                    step: "02",
                    title: "Hardware Dispatch & Staging",
                    desc: "Dispatch of OEM robotics kits, microcontrollers, ESD tools, and test gear.",
                    icon: Cpu,
                  },
                  {
                    step: "03",
                    title: "On-Site Lab Installation",
                    desc: "Assembly of modular benches, 3D printers, workstations, and safety systems.",
                    icon: Wrench,
                  },
                  {
                    step: "04",
                    title: "Faculty Training & Handover",
                    desc: "Hands-on educator training workshops, curriculum handoff, and AMC start.",
                    icon: GraduationCap,
                  },
                ].map((item, idx) => {
                  const StepIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-block text-[10px] font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                          Step {item.step}
                        </span>
                        <StepIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 4: Applicable For / Institutional Scope */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 block w-fit mb-1">
                  Institutional Scope
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Applicable For Academic & Maker Tiers
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.applications.map((app, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 text-xs font-bold"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#00AEEF] shrink-0" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Gallery / Reference Installations */}
            {service.gallery && service.gallery.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60 block w-fit mb-1">
                      Visual Proof
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Photos of Reference Installations
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Click to zoom
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {service.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGalleryImg(img)}
                      className="relative h-32 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group border border-slate-200 shadow-2xs"
                    >
                      <Image
                        src={img}
                        alt={`Installation reference photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-5 h-5 drop-shadow-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Sticky Institutional Quotation Desk */}
          <div ref={formRef} id="quotation-form" className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-5">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                    Institutional Sales Desk
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Request Official Quotation
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Get custom itemized BOQ, curriculum plan & institutional pricing schedule.
                </p>
              </div>

              {!formSuccess ? (
                <form onSubmit={handleInlineSubmit} className="space-y-3.5 text-xs">
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs">
                      {formError}
                    </div>
                  )}

                  {/* Institution Name */}
                  <div>
                    <label className="block font-black text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                      Institution / Organization
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        ref={institutionInputRef}
                        type="text"
                        required
                        placeholder="e.g. St. Xavier's School / IIT / ABC Academy"
                        value={formOrg}
                        onChange={(e) => setFormOrg(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white font-bold transition-all text-xs placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block font-black text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                      Contact Person Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. / Prof. / Principal Name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white font-bold transition-all text-xs placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  {/* Contact Number & Email in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                        Phone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder="+91..."
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white font-bold transition-all text-xs placeholder:text-slate-400 placeholder:font-normal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="principal@school.edu"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white font-bold transition-all text-xs placeholder:text-slate-400 placeholder:font-normal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes (Optional) */}
                  <div>
                    <label className="block font-black text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                      Notes (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <textarea
                        rows={2}
                        placeholder="Estimated budget, student batch size, space dimensions..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white font-medium transition-all text-xs placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0B132B] hover:bg-[#00AEEF] disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting
                        ? "Submitting Enquiry..."
                        : "Submit Quotation Request"}
                    </span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3.5">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Request Submitted Successfully
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Our institutional engineering team will contact you at{" "}
                      <span className="font-bold text-slate-800">{formPhone}</span>{" "}
                      with an itemized proposal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormSuccess(false)}
                    className="text-xs font-bold text-[#00AEEF] hover:underline cursor-pointer"
                  >
                    Submit another enquiry
                  </button>
                </div>
              )}

              {/* Trust Guarantees */}
              <div className="border-t border-slate-100 pt-3.5 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-bold">
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  Free BOQ
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  GST Invoicing
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  Pan-India AMC
                </div>
              </div>
            </div>

            {/* Direct Helpline Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Direct Engineering Helpline
              </span>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/918709789641?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition-colors text-xs font-bold"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>Chat on WhatsApp (+91 87097 89641)</span>
                </a>
                <a
                  href="tel:+918709789641"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-bold"
                >
                  <Phone className="w-4 h-4 text-[#00AEEF]" />
                  <span>Call: +91 87097 89641</span>
                </a>
                <a
                  href="mailto:institutional@prayogindia.in"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-bold"
                >
                  <Mail className="w-4 h-4 text-[#00AEEF]" />
                  <span>institutional@prayogindia.in</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedGalleryImg && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedGalleryImg(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer"
          />
          <div className="relative max-w-4xl w-full h-[70vh] bg-white rounded-3xl overflow-hidden p-3 z-10 shadow-2xl">
            <button
              onClick={() => setSelectedGalleryImg(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full z-20 cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <Image
              src={selectedGalleryImg}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Floating Modal */}
      <ServiceEnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        serviceName={service.name}
      />

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <aside
        aria-label="Mobile service enquiry actions"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] px-3 sm:px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2.5">
          <a
            href={`https://wa.me/918709789641?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 sm:h-12 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white rounded-xl font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 fill-white shrink-0" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={scrollToForm}
            className="h-11 sm:h-12 bg-[#0B132B] hover:bg-[#00AEEF] active:scale-95 text-white rounded-xl font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#0B132B]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Request Quote</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
