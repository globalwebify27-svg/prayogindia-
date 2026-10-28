"use client";

import React, { useState } from "react";
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
  Sparkles,
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

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, I want a quotation for "${service.name}".`,
  );

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
    <div className="min-h-screen bg-slate-50/50 pb-28 lg:pb-16 font-sans">
      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 flex items-center justify-between">
          <CategoryBreadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: service.name },
            ]}
          />
          <Link
            href="/services"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Services</span>
          </Link>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-5 space-y-6">
        {/* ── Hero Card ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Headline & Key Highlights */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200/60">
                    <Sparkles className="w-3 h-3 text-[#2563EB]" />
                    Turnkey Service
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    NEP 2020
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {service.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {service.shortDescription}
                </p>
              </div>

              {/* Micro Specs Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Timeline: </span>
                  <span className="font-bold text-slate-800">7–14 Days</span>
                </div>
                <div className="hidden sm:inline text-slate-200">•</div>
                <div>
                  <span className="text-slate-400 font-medium">Hardware: </span>
                  <span className="font-bold text-slate-800">OEM Direct</span>
                </div>
                <div className="hidden sm:inline text-slate-200">•</div>
                <div>
                  <span className="text-slate-400 font-medium">Training: </span>
                  <span className="font-bold text-slate-800">Certified</span>
                </div>
                <div className="hidden sm:inline text-slate-200">•</div>
                <div>
                  <span className="text-slate-400 font-medium">Warranty: </span>
                  <span className="font-bold text-slate-800">1-Year AMC</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Quotation</span>
                </button>

                <a
                  href={`https://wa.me/918709789641?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right: Feature Image */}
            <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full bg-slate-100 overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
              <Image
                src={service.bannerImage || service.image}
                alt={service.name}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* ── 2-Column Section: Service Details + Quotation Form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Unified Service Details */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs divide-y divide-slate-100 space-y-7">
            {/* Overview & Scope */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Service Scope & Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {service.description || service.shortDescription}
              </p>
            </div>

            {/* Deliverables & Inclusions */}
            <div className="space-y-4 pt-7">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Deliverables & Inclusions
              </h2>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {service.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-700 leading-relaxed">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Setup Process */}
            <div className="space-y-4 pt-7">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Setup Process
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { step: "01", title: "Space Audit", desc: "Site survey & layout planning" },
                  { step: "02", title: "Hardware Dispatch", desc: "OEM equipment & kits dispatch" },
                  { step: "03", title: "On-Site Setup", desc: "Workbench & lab installation" },
                  { step: "04", title: "Faculty Training", desc: "Educator workshop & handoff" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="inline-block text-[11px] font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                      Step {item.step}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="space-y-3 pt-7">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Applicable For
              </h2>
              <div className="flex flex-wrap gap-2">
                {service.applications.map((app, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <span>{app}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Photos */}
            {service.gallery && service.gallery.length > 0 && (
              <div className="space-y-3 pt-7">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Photos & Reference Installations
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {service.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGalleryImg(img)}
                      className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group"
                    >
                      <Image
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Instant Quotation Request Card */}
          <div className="lg:col-span-5 sticky top-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Request Quotation
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Get custom itemized BOQ & pricing schedule.
                </p>
              </div>

              {!formSuccess ? (
                <form onSubmit={handleInlineSubmit} className="space-y-3 text-xs">
                  {formError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-[11px]">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-600 text-[11px] mb-1">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="School / College / Company"
                      value={formOrg}
                      onChange={(e) => setFormOrg(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-600 text-[11px] mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 text-[11px] mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91..."
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 text-[11px] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@institution.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 text-[11px] mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Budget or batch size..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Submitting..." : "Submit Quotation Request"}</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-5 space-y-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Request Submitted
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Our team will contact you at {formPhone}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormSuccess(false)}
                    className="text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Submit another
                  </button>
                </div>
              )}

              {/* Direct Contacts */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Phone className="w-3 h-3 text-[#2563EB]" />
                  <span>+91 87097 89641</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Mail className="w-3 h-3 text-[#2563EB]" />
                  <span>institutional@prayogindia.in</span>
                </div>
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
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/918709789641?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 sm:h-12 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white rounded-xl font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 fill-white shrink-0" />
            <span>WhatsApp</span>
          </a>

          {/* Request Quotation Button */}
          <button
            type="button"
            onClick={() => setEnquiryOpen(true)}
            className="h-11 sm:h-12 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white rounded-xl font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Request Quote</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
