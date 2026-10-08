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
  Cpu,
  Layers,
  Wrench,
  GraduationCap,
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
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6">
        {/* ── Hero Card ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Headline & Key Highlights */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F7FC] text-[#00AEEF]">
                    <Sparkles className="w-3 h-3 text-[#00AEEF]" />
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

              {/* 4 Micro Stat Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Timeline</div>
                  <div className="text-xs font-bold text-slate-900">7-14 Days</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Hardware</div>
                  <div className="text-xs font-bold text-slate-900">OEM Direct</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Training</div>
                  <div className="text-xs font-bold text-slate-900">Certified</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Warranty</div>
                  <div className="text-xs font-bold text-slate-900">1-Year AMC</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
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

        {/* ── 2-Column Section: Deliverables + Quotation Form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Deliverables & Process */}
          <div className="lg:col-span-7 space-y-6">
            {/* Deliverables */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Deliverables & Inclusions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {idx === 0 ? (
                        <Cpu className="w-3.5 h-3.5 text-[#00AEEF]" />
                      ) : idx === 1 ? (
                        <Layers className="w-3.5 h-3.5 text-[#005CA9]" />
                      ) : idx === 2 ? (
                        <Wrench className="w-3.5 h-3.5 text-[#FF7A00]" />
                      ) : idx === 3 ? (
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Step Deployment */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Setup Process
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-[#00AEEF]">01</div>
                  <div className="text-xs font-bold text-slate-900">Space Audit</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-[#005CA9]">02</div>
                  <div className="text-xs font-bold text-slate-900">Hardware Dispatch</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-[#FF7A00]">03</div>
                  <div className="text-xs font-bold text-slate-900">On-Site Setup</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-emerald-600">04</div>
                  <div className="text-xs font-bold text-slate-900">Faculty Training</div>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Applicable For
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.applications.map((app, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF]" />
                    <span>{app}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {service.gallery && service.gallery.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Photos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {service.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGalleryImg(img)}
                      className="relative h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                    >
                      <Image
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
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
                      className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00AEEF] font-medium"
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
                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00AEEF] font-medium"
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
                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00AEEF] font-medium"
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
                      className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00AEEF] font-medium"
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
                      className="w-full bg-slate-50 text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00AEEF] font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
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
                    className="text-xs font-bold text-[#00AEEF] hover:underline"
                  >
                    Submit another
                  </button>
                </div>
              )}

              {/* Direct Contacts */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Phone className="w-3 h-3 text-[#00AEEF]" />
                  <span>+91 87097 89641</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Mail className="w-3 h-3 text-[#00AEEF]" />
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
    </div>
  );
};
