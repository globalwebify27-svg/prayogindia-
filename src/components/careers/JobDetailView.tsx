"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { JOB_OPENINGS, JobOpening, COMPANY_INFO } from "@/data/companyData";
import {
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Send,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  MessageCircle,
  Share2,
} from "lucide-react";

interface JobDetailProps {
  slug: string;
}

export const JobDetailView: React.FC<JobDetailProps> = ({ slug }) => {
  const job =
    JOB_OPENINGS.find((j) => j.slug === slug || j.id === slug) ||
    JOB_OPENINGS[0];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cover, setCover] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumb & Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CategoryBreadcrumb
          items={[{ label: "Careers", href: "/careers" }, { label: job.title }]}
        />
        <Link
          href="/careers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#00AEEF] transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Openings</span>
        </Link>
      </div>

      {/* 2. High-Tech Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0B254E] to-slate-900 border border-slate-800 text-white p-6 sm:p-10 space-y-5 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#00AEEF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs">
                {job.department}
              </span>
              <span className="bg-white/10 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border border-white/10">
                {job.type}
              </span>
              <span className="bg-white/10 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border border-white/10">
                {job.experience}
              </span>
              {job.salaryRange && (
                <span className="bg-[#FFC20E] text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-xs">
                  {job.salaryRange}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#00AEEF]" /> {job.location}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-400" /> Electronics City R&amp;D
                Lab
              </span>
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {job.tags.map((t, i) => (
                  <span
                    key={i}
                    className="bg-white/10 text-sky-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-white/10"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Share Job"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid (Job Spec Left, Application Form Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Responsibilities & Requirements (Span 7) */}
        <div className="lg:col-span-7 space-y-8 text-slate-900">
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-2xs">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00AEEF]" />
              <span>Position Summary</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {job.shortDescription}
            </p>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00AEEF]" />
              <span>Key Responsibilities</span>
            </h2>
            <ul className="space-y-2.5">
              {job.responsibilities.map((resp, idx) => (
                <li
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Technical Qualifications &amp; Mindset</span>
            </h2>
            <ul className="space-y-2.5">
              {job.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Quick Contact helper */}
          <div className="bg-gradient-to-r from-sky-50 to-slate-50 p-6 rounded-3xl border border-sky-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-extrabold text-slate-900 text-xs">
                Questions about this role?
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Connect directly with our engineering talent team via WhatsApp.
              </p>
            </div>
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi Prayog India team, I am interested in applying for ${job.title}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right Column: Application Form (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 sticky top-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-2.5 py-0.5 rounded-full border border-[#00AEEF]/20 inline-block mb-1">
              Apply Now
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Application for {job.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your engineering portfolio. We review every application
              within 48 hours.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 font-bold transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 font-bold transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 font-bold transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  GitHub / Portfolio / Project Links{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Link to your GitHub profile, LinkedIn, YouTube hardware demos, or Google Drive PDF resume..."
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 font-bold transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#FFC20E]" />
                <span>Submit Application to Lab Leads</span>
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                We never share your contact information with external recruiters.
              </p>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Application Received!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
                Thank you, {name}. Our robotics engineering team will review
                your profile within 48 hours.
              </p>
              <div className="pt-2">
                <a
                  href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(`[Job Application] ${job.title} - ${name}`)}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#00AEEF] font-bold hover:underline"
                >
                  <span>Also email your resume directly →</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
