'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CategoryBreadcrumb } from '@/components/categories/CategoryBreadcrumb';
import { COMPANY_INFO } from '@/data/companyData';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Headphones } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, my name is ${name || 'Customer'}. I am reaching out regarding: ${subject || 'Product Inquiry'}.`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: 'Contact Us' }]} />

      {/* 2. Header */}
      <div className="py-6 border-b border-slate-100 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
          Official Touchpoints
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Contact Prayog India
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Get in touch with our mechatronics support engineering team, institutional lab setup consultants, and sales desk.
        </p>
      </div>

      {/* Main 2-Column Grid (Info Left, Form Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Official Contact Cards (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3">
              Official Head Office
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#00AEEF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Corporate & Technical Hub</span>
                  <p className="text-slate-400 leading-relaxed">
                    {COMPANY_INFO.address}, {COMPANY_INFO.city}, {COMPANY_INFO.state} - {COMPANY_INFO.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#00AEEF] shrink-0" />
                <div>
                  <span className="font-bold text-white block">Phone Desk (Click-to-Call)</span>
                  <a href={`tel:${COMPANY_INFO.phone}`} className="text-slate-300 hover:text-[#00AEEF]">
                    {COMPANY_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#00AEEF] shrink-0" />
                <div>
                  <span className="font-bold text-white block">Official Email</span>
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-slate-300 hover:text-[#00AEEF]">
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#00AEEF] shrink-0" />
                <div>
                  <span className="font-bold text-white block">Business Hours</span>
                  <span className="text-slate-400">{COMPANY_INFO.businessHours}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp</span>
            </a>

          </div>

          {/* Account Support Ticket Link Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-[#00AEEF]" /> Registered Customer?
            </h4>
            <p className="text-slate-500">
              Logged-in customers can submit trackable helpdesk support tickets directly.
            </p>
            <Link href="/account/support" className="text-xs font-black text-[#00AEEF] hover:underline block pt-1">
              Open Support Ticket Portal →
            </Link>
          </div>

        </div>

        {/* Right Column: Contact Form (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Send Us a Direct Message</h3>
            <p className="text-xs text-slate-500">Fill in the contact form below. Our response team typical responds within 2 business hours.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab Setup Quotation / Product Support"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Message Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can Prayog India assist your mechatronics setup or hardware order?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>

            </form>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Thank you. Your message has been received.</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Our support team has recorded your contact submission for {email}.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
