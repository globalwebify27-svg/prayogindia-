"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { submitServiceEnquiry } from "@/lib/apiServices";

interface ServiceEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

export const ServiceEnquiryModal: React.FC<ServiceEnquiryModalProps> = ({
  isOpen,
  onClose,
  serviceName,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const result = await submitServiceEnquiry({
      serviceName,
      name,
      phone,
      email,
      message,
    });

    if (result.success) {
      setSubmitted(true);
    } else {
      setApiError(result.message || "Failed to submit enquiry.");
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, I would like to enquire about: "${serviceName}". My name is ${name || "a customer"}. Please share detailed proposal details.`,
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 space-y-6 text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF] bg-[#E0F7FC] px-2.5 py-0.5 rounded-full inline-block">
              Institutional Enquiry
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Enquire: {serviceName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {apiError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs">
                {apiError}
              </div>
            )}

            {/* Auto-populated Service Field */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Selected Service
              </label>
              <input
                type="text"
                disabled
                value={serviceName}
                className="w-full bg-slate-100 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 font-extrabold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contact person name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Institutional / Work Email
              </label>
              <input
                type="email"
                required
                placeholder="name@institution.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Requirement Details
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe your institution size, lab budget, or custom project scope..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Service Enquiry</span>
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">
              Enquiry Prepared Successfully
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Thank you {name}. Our mechatronics & lab setup engineering team
              will contact you at {phone}.
            </p>

            <a
              href={`https://wa.me/919876543210?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Chat Immediately on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
