"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { JOB_OPENINGS, COMPANY_INFO } from "@/data/companyData";
import {
  MapPin,
  Clock,
  ArrowRight,
  Search,
  X,
  Send,
  MessageCircle,
  Briefcase,
} from "lucide-react";

export const CareersView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter positions
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return JOB_OPENINGS;

    const q = searchQuery.toLowerCase().trim();
    return JOB_OPENINGS.filter((job) => {
      const inTitle = job.title.toLowerCase().includes(q);
      const inDept = job.department.toLowerCase().includes(q);
      const inDesc = job.shortDescription.toLowerCase().includes(q);
      const inTags = job.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;

      return inTitle || inDept || inDesc || inTags;
    });
  }, [searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "Careers" }]} />

      {/* 2. Sleek Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B254E] to-slate-950 border border-slate-800 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-[#00AEEF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-[#00AEEF]/30">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-200">
              Join Our Engineering Team
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Careers at Prayog India
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Build the next generation of mechatronics hardware, drone flight
            controllers, and educational robotics ecosystems in Bengaluru.
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight self-start sm:self-auto">
            Open Positions ({filteredJobs.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or skill (e.g. ROS2, C++)..."
              className="w-full bg-white border border-slate-200 pl-10 pr-9 py-2 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Clean & Polished Job Cards */}
      {filteredJobs.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-3xl space-y-2 max-w-md mx-auto p-6">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">
            No Roles Found
          </h3>
          <p className="text-xs text-slate-500">
            Try clearing your search query.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-[#00AEEF] font-bold hover:underline cursor-pointer pt-1"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:border-[#00AEEF] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span className="bg-sky-50 text-[#005CA9] border border-sky-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black">
                    {job.department}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {job.experience}
                  </span>
                  {job.salaryRange && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        {job.salaryRange}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#005CA9] transition-colors">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {job.shortDescription}
                </p>

                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {job.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-mono px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={`/careers/${job.slug}`}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-900 group-hover:bg-[#00AEEF] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 self-start md:self-auto cursor-pointer"
              >
                <span>View &amp; Apply</span>
                <ArrowRight className="w-4 h-4 text-[#FFC20E] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 5. Simple Bottom Open Application Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">
            Don&apos;t see your role?
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Send your resume and project links directly to our engineering team.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <a
            href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent("[Open Application] Robotics Engineer")}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-[#FFC20E]" />
            <span>Email Resume</span>
          </a>

          <a
            href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Prayog India Careers Team, I would like to enquire about open engineering opportunities.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
