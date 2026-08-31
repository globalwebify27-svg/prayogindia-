'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CategoryBreadcrumb } from '@/components/categories/CategoryBreadcrumb';
import { JOB_OPENINGS, JobOpening, COMPANY_INFO } from '@/data/companyData';
import { MapPin, Briefcase, Clock, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

interface JobDetailProps {
  slug: string;
}

export const JobDetailView: React.FC<JobDetailProps> = ({ slug }) => {
  const job = JOB_OPENINGS.find(j => j.slug === slug || j.id === slug) || JOB_OPENINGS[0];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cover, setCover] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: 'Careers', href: '/careers' },
          { label: job.title }
        ]}
      />

      {/* 2. Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#FFC20E] text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full">
            {job.department}
          </span>
          <span className="text-xs text-slate-300 font-bold">• {job.type}</span>
          <span className="text-xs text-slate-300 font-bold">• {job.experience}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
          {job.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-[#00AEEF]" /> {job.location}
        </p>
      </div>

      {/* Main 2-Column Grid (Job Spec Left, Application Form Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Responsibilities & Requirements (Span 7) */}
        <div className="lg:col-span-7 space-y-8 text-slate-900">
          
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Position Summary</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {job.shortDescription}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Key Responsibilities</h2>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Technical Qualifications</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* Right Column: Application Form (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Apply for this Role</h3>
            <p className="text-xs text-slate-500">Submit your engineering application profile.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Applicant Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                />
              </div>

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

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Cover Note / GitHub / Portfolio Link</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Include links to your robotics projects, PCB designs, or GitHub repositories..."
                  value={cover}
                  onChange={e => setCover(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Job Application</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">Application Prepared</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you {name}. You can also email your CV directly to <strong className="text-slate-900">{COMPANY_INFO.email}</strong> referencing role: {job.title}.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
