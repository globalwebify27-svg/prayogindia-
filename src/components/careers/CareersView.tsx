'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryBreadcrumb } from '@/components/categories/CategoryBreadcrumb';
import { JOB_OPENINGS, JobOpening } from '@/data/companyData';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CareersView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: 'Careers' }]} />

      {/* 2. Header */}
      <div className="py-6 border-b border-slate-100 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
          Join Our Engineering Team
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          Careers at Prayog India
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Build the next generation of mechatronics hardware, drone flight controllers, and educational robotics ecosystems.
        </p>
      </div>

      {/* 3. Job Openings List */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Open Engineering Positions ({JOB_OPENINGS.length})</h2>

        {JOB_OPENINGS.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-2 max-w-md mx-auto">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Current Openings</h3>
            <p className="text-xs text-slate-500">Please check back later for new opportunities at Prayog India.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {JOB_OPENINGS.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[#00AEEF]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#E0F7FC] text-[#00AEEF] text-[10px] font-black uppercase px-3 py-0.5 rounded-full border border-[#00AEEF]/20">
                      {job.department}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">• {job.type}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{job.shortDescription}</p>
                </div>

                <Link
                  href={`/careers/${job.slug}`}
                  className="bg-slate-900 hover:bg-[#00AEEF] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
