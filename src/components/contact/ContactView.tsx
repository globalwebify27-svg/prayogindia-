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
} from "lucide-react";

const QUICK_TOPICS = [
  "Lab Setup & BOQ",
  "Product Technical Support",
  "Bulk Institutional Order",
  "Custom Project",
];

export const ContactView: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(QUICK_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, my name is ${name || "Customer"}. I am reaching out regarding: ${subject || "Product Inquiry"}.`,
  );

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-4 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
        {/* ── Breadcrumb & Status Bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CategoryBreadcrumb items={[{ label: "Contact Us" }]} />
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Support Desk Active</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400 font-normal">Mon-Sat 9AM-7PM</span>
          </div>
        </div>

        {/* ── Main Unified Contact Card ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Clean Solid Neutral Info Panel (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E0F7FC] text-[#00AEEF]">
                  <Sparkles className="w-3 h-3 text-[#00AEEF]" />
                  Prayog India Helpdesk
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                  Get in Touch
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Connect with our robotics engineers, lab consultants, and sales desk.
                </p>
              </div>

              {/* Direct Info List */}
              <div className="space-y-3.5 text-xs pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin className="w-4 h-4 text-[#00AEEF]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Corporate & Tech Hub
                    </span>
                    <p className="text-slate-800 font-medium leading-snug mt-0.5">
                      {COMPANY_INFO.address}, {COMPANY_INFO.city}, {COMPANY_INFO.state} - {COMPANY_INFO.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <Phone className="w-4 h-4 text-[#00AEEF]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Direct Phone
                    </span>
                    <a
                      href={`tel:${COMPANY_INFO.phone}`}
                      className="text-slate-900 font-bold hover:text-[#00AEEF] transition-colors"
                    >
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <Mail className="w-4 h-4 text-[#00AEEF]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Support Email
                    </span>
                    <a
                      href={`mailto:${COMPANY_INFO.email}`}
                      className="text-slate-900 font-bold hover:text-[#00AEEF] transition-colors"
                    >
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions on Left Panel */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Headphones className="w-3.5 h-3.5 text-[#00AEEF]" />
                  <span>Existing Customer?</span>
                </span>
                <Link
                  href="/account/support"
                  className="text-[#00AEEF] font-bold hover:underline flex items-center gap-0.5"
                >
                  <span>Support Tickets</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Modern Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-white flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Send a Message
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your topic and our engineering team will respond quickly.
              </p>

              {/* Quick Topic Selector Pills */}
              <div className="flex flex-wrap gap-1.5 pt-3">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSubject(topic)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      subject === topic
                        ? "bg-[#00AEEF] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aman Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 87097 89641"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@institution.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Topic / Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Selected topic"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    How can we help?
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your requirement, component inquiry, or lab setup details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  Message Sent Successfully
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Thank you {name}. Our engineering desk will respond to {email} shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#00AEEF] hover:underline pt-2"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 3 Trust Highlights ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#00AEEF]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Quick Response</div>
              <div className="text-[11px] text-slate-500">Under 2 hours during desk hours</div>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">OEM Direct Support</div>
              <div className="text-[11px] text-slate-500">Genuine components & warranties</div>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-[#FF7A00]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Institutional Hubs</div>
              <div className="text-[11px] text-slate-500">Bengaluru, Ranchi & Patna</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
