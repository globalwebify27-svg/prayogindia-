"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { COMPANY_INFO } from "@/data/companyData";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  Headphones,
  Sparkles,
  ShieldCheck,
  Building2,
  Zap,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Cpu,
  Package,
  HelpCircle,
} from "lucide-react";

const INQUIRY_DOMAINS = [
  "Robotics & STEM Lab Setup (BOQ)",
  "Microcontrollers & Dev Boards (Arduino/RPi)",
  "Drone, UAV Parts & Flight Controllers",
  "Electronic Components & Sensor Arrays",
  "Bulk Institutional Orders & School POs",
  "Custom Mechatronics R&D Project",
];

const FAQS = [
  {
    question: "How quickly do you respond to institutional BOQ and lab quotations?",
    answer:
      "Our mechatronics engineering and sales desk prepares and emails customized technical BOQs and GST-compliant estimates within 2 to 4 business hours.",
  },
  {
    question: "Do you provide official GST Tax Invoices for university or school grants?",
    answer:
      "Yes. Every order and institutional procurement includes a 100% compliant B2B Tax Invoice with your institution's GSTIN, SAC/HSN codes, and official seal.",
  },
  {
    question: "Can I visit a physical store to test components before purchasing?",
    answer:
      "Absolutely! You are welcome to visit our Experience Centers in Bengaluru (Electronics City), Ranchi (Club Road / Main Road), and Patna (Kankarbagh) for hands-on trials of microcontrollers, drones, and robotics modules.",
  },
  {
    question: "What if a component arrives damaged or doesn't work?",
    answer:
      "We provide a 7-day instant replacement guarantee for all verified manufacturing defects. Our technical support engineers will assist you via video call or dispatch a fresh replacement immediately.",
  },
  {
    question: "Do you offer on-site faculty training and lab installation?",
    answer:
      "Yes. For turnkey Robotics, AI, and ATL Lab setups, our certified field application engineers visit your campus for installation, wiring, and hands-on faculty workshops.",
  },
];

const REGIONAL_HUBS = [
  {
    city: "Bengaluru",
    role: "Headquarters & R&D Hub",
    badge: "Tech Hub & Lab",
    address: "Prayog Tech Hub, Plot 42, Electronics City Phase 1, Bengaluru, Karnataka - 560100",
    phone: "+91 87097 89641",
    hours: "Mon – Sat: 9:00 AM – 6:30 PM",
    mapUrl: "https://maps.google.com/?q=Electronics+City+Phase+1+Bengaluru",
  },
  {
    city: "Ranchi",
    role: "Regional Hub & Walk-in Store",
    badge: "Express 24h Hub",
    address: "1st Floor, City Centre, Club Road, Ranchi, Jharkhand - 834001",
    phone: "+91 87097 89641",
    hours: "Mon – Sat: 9:30 AM – 7:30 PM",
    mapUrl: "https://maps.google.com/?q=Club+Road+Ranchi+Jharkhand",
  },
  {
    city: "Patna",
    role: "Regional Experience Center",
    badge: "Walk-in Store",
    address: "Prayog STEM Center, Kankarbagh Main Road, Patna, Bihar - 800020",
    phone: "+91 87097 89641",
    hours: "Mon – Sat: 9:30 AM – 7:00 PM",
    mapUrl: "https://maps.google.com/?q=Kankarbagh+Patna+Bihar",
  },
];

export const ContactView: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [domain, setDomain] = useState(INQUIRY_DOMAINS[0]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState("");

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopy = (text: string, type: "phone" | "email") => {
    navigator.clipboard.writeText(text);
    if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setInquiryId(`PRG-INQ-${Math.floor(100000 + Math.random() * 900000)}`);
      setSubmitted(true);
    }, 600);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, my name is ${name || "Customer"}. I am reaching out regarding: ${domain || "Product Inquiry"}.`,
  );

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] py-4 sm:py-6 font-sans">
      <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6 sm:space-y-8">
        
        {/* ── Breadcrumb & Status Bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <CategoryBreadcrumb items={[{ label: "Contact Us" }]} />
          <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold text-slate-700 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-900 font-extrabold">Support Desk Active</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">Mon–Sat 9AM–7PM IST</span>
          </div>
        </div>

        {/* ── Main Unified Contact Card (Matched to Reference Design) ── */}
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
          
          {/* ── LEFT PANEL: Clean White Form ("Send an Enquiry") (7 cols) ── */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 bg-white flex flex-col justify-between space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Send an Enquiry
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fill out the details below and our robotics engineering team will connect with you.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Row 1: Full Name & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-slate-600 text-[10px] tracking-wider uppercase mb-1.5">
                      FULL NAME <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#081E36]/20 focus:border-[#081E36] font-medium text-xs sm:text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-600 text-[10px] tracking-wider uppercase mb-1.5">
                      EMAIL ADDRESS <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#081E36]/20 focus:border-[#081E36] font-medium text-xs sm:text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Interested Domain / Course */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-slate-600 text-[10px] tracking-wider uppercase mb-1.5">
                      PHONE NUMBER <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 87097 89641"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#081E36]/20 focus:border-[#081E36] font-medium text-xs sm:text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-600 text-[10px] tracking-wider uppercase mb-1.5">
                      INTERESTED DOMAIN / SUBJECT <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white text-slate-900 pl-4 pr-10 py-3 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#081E36]/20 focus:border-[#081E36] font-semibold text-xs sm:text-sm transition-all appearance-none cursor-pointer truncate"
                      >
                        {INQUIRY_DOMAINS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Your Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-black text-slate-600 text-[10px] tracking-wider uppercase">
                      YOUR MESSAGE <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {message.length}/500
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    maxLength={500}
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white text-slate-900 p-4 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#081E36]/20 focus:border-[#081E36] font-medium text-xs sm:text-sm transition-all resize-y"
                  />
                </div>

                {/* Submit Enquiry Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#081E36] hover:bg-[#0A2540] active:bg-[#06182C] text-white px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-[#081E36]/25 active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Enquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Enquiry Submitted Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-1">
                    Thank you <strong className="text-slate-800">{name}</strong>. Your inquiry reference is{" "}
                    <span className="font-mono font-bold text-[#081E36] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                      {inquiryId}
                    </span>
                    . Our engineering team will contact you at <span className="font-semibold text-slate-800">{email}</span> within 2 hours.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL: Deep Solid Navy ("CONTACT INFORMATION") (5 cols) ── */}
          <div className="lg:col-span-5 bg-[#081E36] p-6 sm:p-10 lg:p-12 text-white flex flex-col justify-between space-y-8">
            <div className="space-y-7">
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-widest text-white uppercase">
                  CONTACT INFORMATION
                </h2>
                <div className="w-10 h-0.5 bg-[#FFC20E] mt-2.5 rounded-full" />
              </div>

              {/* Contact List */}
              <div className="space-y-6">
                {/* 1. Phone / Institutional Support */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                    <Phone className="w-5 h-5 text-[#FFC20E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
                      INSTITUTIONAL SUPPORT
                    </span>
                    <a
                      href={`tel:${COMPANY_INFO.phone}`}
                      className="text-sm sm:text-base font-black text-white hover:text-[#FFC20E] transition-colors mt-0.5 block truncate"
                    >
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(COMPANY_INFO.phone, "phone")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors shrink-0 cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedPhone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* 2. Email / Direct Inquiry */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                    <Mail className="w-5 h-5 text-[#FFC20E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
                      DIRECT INQUIRY
                    </span>
                    <a
                      href={`mailto:${COMPANY_INFO.email}`}
                      className="text-sm sm:text-base font-bold text-white hover:text-[#FFC20E] transition-colors mt-0.5 block truncate"
                    >
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(COMPANY_INFO.email, "email")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors shrink-0 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* 3. Address / Regional Hub */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                    <MapPin className="w-5 h-5 text-[#FFC20E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
                      REGIONAL &amp; TECH HUBS
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug mt-1">
                      {COMPANY_INFO.address}, {COMPANY_INFO.city}, {COMPANY_INFO.state} - {COMPANY_INFO.pincode}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      1st Floor, City Centre, Club Road, Ranchi - 834001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Support Note & WhatsApp CTA */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Our academic counselors and robotics engineers are available Mon–Sat (9AM – 7PM) for immediate assistance.
              </p>

              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-900/30 active:scale-98"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp Directly</span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-[#FFC20E]" />
                  <span>Existing Customer?</span>
                </span>
                <Link
                  href="/account/support"
                  className="text-[#FFC20E] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Support Tickets</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 Trust Highlights ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Rapid Technical Response</div>
              <div className="text-[11.5px] text-slate-500 mt-0.5">Under 2 hours during desk hours by robotics engineers</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">100% Genuine Components</div>
              <div className="text-[11.5px] text-slate-500 mt-0.5">OEM direct sourcing with replacement warranties &amp; datasheets</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#FF7A00]" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Institutional Tech Hubs</div>
              <div className="text-[11.5px] text-slate-500 mt-0.5">Walk-in labs &amp; distribution in Bengaluru, Ranchi &amp; Patna</div>
            </div>
          </div>
        </div>

        {/* ── Regional Hubs & Experience Stores Section ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Our Physical Experience Centers &amp; Hubs
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Visit our walk-in stores to test microcontrollers, drone kits, and robotics setups in person.
              </p>
            </div>
            <Link
              href="/walk-in"
              className="text-xs font-extrabold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>Explore All Walk-in Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REGIONAL_HUBS.map((hub) => (
              <div
                key={hub.city}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">{hub.city}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200/60">
                      {hub.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {hub.role}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    {hub.address}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hub.hours}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${hub.phone}`}
                    className="text-xs font-bold text-slate-800 hover:text-[#2563EB] transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Call Store</span>
                  </a>
                  <a
                    href={hub.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Frequently Asked Questions Accordion ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500">
                Quick answers regarding ordering, warranties, institutional POs, and tech support.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.question} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#2563EB]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-2 sm:pr-8 animate-in fade-in duration-150">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
