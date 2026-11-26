"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { SERVICES_DATA } from "@/data/servicesData";
import { useUIStore } from "@/store/useUIStore";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
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

  const openB2BModal = useUIStore((s) => s.openB2BModal);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(
    null,
  );

  // Quick Inline Form State & Validation
  const [formName, setFormName] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  interface FormErrors {
    org?: string;
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
  }
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formRef = useRef<HTMLDivElement>(null);
  const institutionInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const validateField = (field: keyof FormErrors, value: string): string | undefined => {
    const trimmed = value.trim();
    switch (field) {
      case "org":
        if (!trimmed) return "Institution or organization name is required.";
        if (trimmed.length < 2) return "Institution name must be at least 2 characters.";
        return undefined;
      case "name":
        if (!trimmed) return "Contact person name is required.";
        if (trimmed.length < 2) return "Contact person name must be at least 2 characters.";
        return undefined;
      case "phone": {
        if (!trimmed) return "Phone / WhatsApp number is required.";
        const cleaned = trimmed.replace(/[\s\-\(\)\+]/g, "").replace(/^(?:91|0)/, "");
        if (!/^[6-9]\d{9}$/.test(cleaned)) {
          return "Enter a valid 10-digit Indian phone/WhatsApp number (e.g. 9876543210).";
        }
        return undefined;
      }
      case "email": {
        if (!trimmed) return "Official or institutional email is required.";
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
          return "Enter a valid email address (e.g. principal@school.edu).";
        }
        return undefined;
      }
      case "notes":
        if (value.length > 1000) return "Notes must not exceed 1000 characters.";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAll = (): { isValid: boolean; errors: FormErrors } => {
    const orgErr = validateField("org", formOrg);
    const nameErr = validateField("name", formName);
    const phoneErr = validateField("phone", formPhone);
    const emailErr = validateField("email", formEmail);
    const notesErr = validateField("notes", formNotes);

    const errs: FormErrors = {};
    if (orgErr) errs.org = orgErr;
    if (nameErr) errs.name = nameErr;
    if (phoneErr) errs.phone = phoneErr;
    if (emailErr) errs.email = emailErr;
    if (notesErr) errs.notes = notesErr;

    return {
      isValid: Object.keys(errs).length === 0,
      errors: errs,
    };
  };

  const handleBlur = (field: keyof FormErrors, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (
    field: keyof FormErrors,
    value: string,
    setter: (val: string) => void,
  ) => {
    setter(value);
    if (touched[field]) {
      const err = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, I am requesting a quotation for "${service.name}". Please provide an itemized proposal.`,
  );

  const handleOpenQuotation = () => {
    openB2BModal({
      name: service.name,
      link: typeof window !== "undefined" ? window.location.href : undefined,
      quantity: "1",
    });
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Mark all required fields as touched
    setTouched({
      org: true,
      name: true,
      phone: true,
      email: true,
      notes: true,
    });

    const { isValid, errors } = validateAll();
    setFieldErrors(errors);

    if (!isValid) {
      setFormError("Please fill in all required fields accurately before submitting.");
      if (errors.org) {
        institutionInputRef.current?.focus();
      } else if (errors.name) {
        nameInputRef.current?.focus();
      } else if (errors.phone) {
        phoneInputRef.current?.focus();
      } else if (errors.email) {
        emailInputRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    const cleanedPhone = formPhone.replace(/[\s\-\(\)\+]/g, "").replace(/^(?:91|0)/, "");
    const formattedPhone = cleanedPhone.length === 10 ? `+91 ${cleanedPhone}` : formPhone.trim();

    try {
      const res = await fetch("/api/quotations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formOrg.trim(),
          customerName: formName.trim(),
          customerEmail: formEmail.trim(),
          customerPhone: formattedPhone,
          institutionType: "ATL School",
          notes: formNotes
            ? `Service Requirement: ${service.name}\n${formNotes.trim()}`
            : `Service Requirement: ${service.name}`,
          items: [
            {
              productName: service.name,
              productLink:
                typeof window !== "undefined" ? window.location.href : undefined,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormSuccess(true);
      } else {
        setFormError(data.message || "Failed. Please contact on WhatsApp.");
      }
    } catch {
      setFormError("Network error. Please reach out on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 lg:pb-16 font-sans">
      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <CategoryBreadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: service.name },
            ]}
          />
          <Link
            href="/services"
            className="text-[11px] sm:text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0 bg-slate-100 hover:bg-slate-200/80 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">All Services</span>
            <span className="xs:hidden">All</span>
          </Link>
        </div>
      </div>

      <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-4 sm:pt-6 space-y-5 sm:space-y-6 lg:space-y-8">
        {/* ── Executive Hero Card ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Headline, Key Value Props & Specs */}
            <div className="lg:col-span-7 p-4 sm:p-7 lg:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Badges Strip */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#00AEEF] border border-blue-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] animate-pulse" />
                    Turnkey Solution
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    NEP 2020 Aligned
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600" />
                    Govt & ATL Ready
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
                  {service.name}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-medium">
                  {service.shortDescription}
                </p>
              </div>

              {/* 4 Key Specifications Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00AEEF]" />
                    <span>Timeline</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    7–14 Days
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Turnkey Setup
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                    <span>Hardware</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    OEM Direct
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Lab Grade
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600" />
                    <span>Training</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    Certified
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Educator Master
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
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
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={handleOpenQuotation}
                  className="flex-1 sm:flex-initial bg-[#0B132B] hover:bg-[#00AEEF] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Quote</span>
                </button>

                <a
                  href={`https://wa.me/918709789641?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="tel:+918709789641"
                  className="hidden sm:flex text-xs font-bold text-slate-700 hover:text-slate-900 items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91 87097 89641</span>
                </a>
              </div>
            </div>

            {/* Right: Feature Image Card */}
            <div className="lg:col-span-5 relative h-52 sm:h-72 lg:h-auto min-h-0 lg:min-h-full bg-slate-100 overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
              <Image
                src={service.bannerImage || service.image}
                alt={service.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3.5 sm:p-5">
                <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/40 shadow-sm flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#00AEEF] text-white flex items-center justify-center shrink-0">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider block">
                      Turnkey Deployment
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                      Official Prayog India Setup
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-Column Section: Service Content & Interactive Quotation Desk ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
          {/* Left Column (7 cols): Clean Modular Content Architecture */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Card 1: Scope & Overview */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#00AEEF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                  Service Scope
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Turnkey Architecture & Lab Scope
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {service.description || service.shortDescription}
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 mt-2 sm:mt-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900">
                    Full Compliance Guarantee:{" "}
                  </span>
                  Turnkey installations adhere to CBSE/ICSE STEM guidelines,
                  National Education Policy (NEP 2020), and ISO-certified
                  electrical ESD safety protocols.
                </div>
              </div>
            </div>

            {/* Card 2: Deliverables & Inclusions */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 block w-fit mb-1">
                    Deliverables & Inclusions
                  </span>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    What is Included in this Setup
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 hidden sm:block shrink-0">
                  {service.features.length} Items Included
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {service.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-md bg-blue-100 text-[#00AEEF] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 leading-snug">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: 4-Stage Setup Process */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xs space-y-3.5 sm:space-y-4">
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60 block w-fit mb-1">
                  Implementation Workflow
                </span>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                  4-Stage Turnkey Deployment Roadmap
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-block text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          Step {item.step}
                        </span>
                        <StepIcon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">
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
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xs space-y-3 sm:space-y-4">
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 block w-fit mb-1">
                  Institutional Scope
                </span>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                  Applicable For Academic & Maker Tiers
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {service.applications.map((app, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 text-xs font-semibold"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Gallery / Reference Installations */}
            {service.gallery && service.gallery.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/60 block w-fit mb-1">
                      Visual Proof
                    </span>
                    <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                      Photos of Reference Installations
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Tap to zoom
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {service.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGalleryImg(img)}
                      className="relative h-28 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group border border-slate-200 shadow-2xs"
                    >
                      <Image
                        src={img}
                        alt={`Installation reference photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Sticky Institutional Quotation Desk */}
          <div ref={formRef} id="quotation-form" className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              {/* Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                    Institutional Sales Desk
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Request Official Quotation
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Get custom itemized BOQ, curriculum plan & institutional pricing schedule.
                </p>
              </div>

              {!formSuccess ? (
                <form onSubmit={handleInlineSubmit} noValidate className="space-y-3 text-xs">
                  {formError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Institution Name */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] sm:text-[11px] uppercase tracking-wider mb-1">
                      Institution / Organization <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className={`w-3.5 h-3.5 absolute left-3 top-2.5 transition-colors ${
                        touched.org && fieldErrors.org ? "text-rose-500" : "text-slate-400"
                      }`} />
                      <input
                        ref={institutionInputRef}
                        type="text"
                        placeholder="e.g. St. Xavier's School / IIT / ABC Academy"
                        value={formOrg}
                        onChange={(e) => handleChange("org", e.target.value, setFormOrg)}
                        onBlur={() => handleBlur("org", formOrg)}
                        aria-invalid={!!(touched.org && fieldErrors.org)}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border font-medium transition-all text-xs placeholder:text-slate-400 outline-none ${
                          touched.org && fieldErrors.org
                            ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:ring-2 focus:ring-rose-400"
                            : "bg-slate-50 text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white"
                        }`}
                      />
                    </div>
                    {touched.org && fieldErrors.org && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.org}</span>
                      </p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] sm:text-[11px] uppercase tracking-wider mb-1">
                      Contact Person Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className={`w-3.5 h-3.5 absolute left-3 top-2.5 transition-colors ${
                        touched.name && fieldErrors.name ? "text-rose-500" : "text-slate-400"
                      }`} />
                      <input
                        ref={nameInputRef}
                        type="text"
                        placeholder="Dr. / Prof. / Principal Name"
                        value={formName}
                        onChange={(e) => handleChange("name", e.target.value, setFormName)}
                        onBlur={() => handleBlur("name", formName)}
                        aria-invalid={!!(touched.name && fieldErrors.name)}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border font-medium transition-all text-xs placeholder:text-slate-400 outline-none ${
                          touched.name && fieldErrors.name
                            ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:ring-2 focus:ring-rose-400"
                            : "bg-slate-50 text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white"
                        }`}
                      />
                    </div>
                    {touched.name && fieldErrors.name && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Contact Number & Email in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 text-[10px] sm:text-[11px] uppercase tracking-wider mb-1">
                        Phone / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className={`w-3.5 h-3.5 absolute left-3 top-2.5 transition-colors ${
                          touched.phone && fieldErrors.phone ? "text-rose-500" : "text-slate-400"
                        }`} />
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          maxLength={15}
                          placeholder="+91..."
                          value={formPhone}
                          onChange={(e) => handleChange("phone", e.target.value, setFormPhone)}
                          onBlur={() => handleBlur("phone", formPhone)}
                          aria-invalid={!!(touched.phone && fieldErrors.phone)}
                          className={`w-full pl-9 pr-3 py-2 rounded-lg border font-medium transition-all text-xs placeholder:text-slate-400 outline-none ${
                            touched.phone && fieldErrors.phone
                              ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:ring-2 focus:ring-rose-400"
                              : "bg-slate-50 text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white"
                          }`}
                        />
                      </div>
                      {touched.phone && fieldErrors.phone && (
                        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 text-[10px] sm:text-[11px] uppercase tracking-wider mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className={`w-3.5 h-3.5 absolute left-3 top-2.5 transition-colors ${
                          touched.email && fieldErrors.email ? "text-rose-500" : "text-slate-400"
                        }`} />
                        <input
                          ref={emailInputRef}
                          type="email"
                          placeholder="principal@school.edu"
                          value={formEmail}
                          onChange={(e) => handleChange("email", e.target.value, setFormEmail)}
                          onBlur={() => handleBlur("email", formEmail)}
                          aria-invalid={!!(touched.email && fieldErrors.email)}
                          className={`w-full pl-9 pr-3 py-2 rounded-lg border font-medium transition-all text-xs placeholder:text-slate-400 outline-none ${
                            touched.email && fieldErrors.email
                              ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:ring-2 focus:ring-rose-400"
                              : "bg-slate-50 text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white"
                          }`}
                        />
                      </div>
                      {touched.email && fieldErrors.email && (
                        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 text-[10px] sm:text-[11px] uppercase tracking-wider">
                        Notes (Optional)
                      </label>
                      {formNotes.length > 800 && (
                        <span className={`text-[10px] font-semibold ${formNotes.length > 1000 ? "text-rose-600" : "text-slate-400"}`}>
                          {formNotes.length}/1000
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <textarea
                        rows={2}
                        placeholder="Estimated budget, student batch size, space dimensions..."
                        value={formNotes}
                        onChange={(e) => handleChange("notes", e.target.value, setFormNotes)}
                        onBlur={() => handleBlur("notes", formNotes)}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border font-medium transition-all text-xs placeholder:text-slate-400 outline-none ${
                          touched.notes && fieldErrors.notes
                            ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:ring-2 focus:ring-rose-400"
                            : "bg-slate-50 text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:bg-white"
                        }`}
                      />
                    </div>
                    {touched.notes && fieldErrors.notes && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.notes}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0B132B] hover:bg-[#00AEEF] disabled:opacity-50 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Quotation Request</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-5 space-y-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
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
                    onClick={() => {
                      setFormSuccess(false);
                      setFormOrg("");
                      setFormName("");
                      setFormPhone("");
                      setFormEmail("");
                      setFormNotes("");
                      setFieldErrors({});
                      setTouched({});
                      setFormError(null);
                    }}
                    className="text-xs font-bold text-[#00AEEF] hover:underline cursor-pointer"
                  >
                    Submit another enquiry
                  </button>
                </div>
              )}

              {/* Trust Guarantees */}
              <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-bold">
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
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                Direct Engineering Helpline
              </span>
              <div className="space-y-1.5">
                <a
                  href={`https://wa.me/918709789641?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition-colors text-xs font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
                  <span className="truncate">Chat on WhatsApp (+91 87097 89641)</span>
                </a>
                <a
                  href="tel:+918709789641"
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                  <span>Call: +91 87097 89641</span>
                </a>
                <a
                  href="mailto:institutional@prayogindia.in"
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                  <span className="truncate">institutional@prayogindia.in</span>
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

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <aside
        aria-label="Mobile service enquiry actions"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] px-3 sm:px-4 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/918709789641?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 sm:h-11 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white rounded-lg sm:rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleOpenQuotation}
            className="h-10 sm:h-11 bg-[#0B132B] hover:bg-[#00AEEF] active:scale-95 text-white rounded-lg sm:rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Request Quote</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
