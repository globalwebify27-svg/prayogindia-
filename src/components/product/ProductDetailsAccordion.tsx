"use client";

import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

interface ProductDetailsTabProps {
  description: string;
  features?: string[];
  applications?: string[];
  whatsIncluded?: string[];
  specs: Record<string, string>;
  specsRef?: React.RefObject<HTMLDivElement | null>;
}

export const ProductDetailsAccordion: React.FC<ProductDetailsTabProps> = ({
  description,
  features,
  applications,
  whatsIncluded,
  specs,
  specsRef,
}) => {
  return (
    <div className="space-y-10 border-t border-slate-200 pt-10 text-slate-900">
      {/* 1. Product Description */}
      <section id="description" className="space-y-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Product Description
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
          {description}
        </p>
      </section>

      {/* 2. Key Features */}
      {features && features.length > 0 && (
        <section id="features" className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Key Hardware Features
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
            {features.map((feat, idx) => (
              <li
                key={idx}
                className="bg-gradient-to-br from-slate-50 to-[#E0F7FC]/30 p-4 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-start gap-2.5 hover:border-[#00AEEF]/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 3. Applications */}
      {applications && applications.length > 0 && (
        <section id="applications" className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Target Applications
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {applications.map((app, idx) => (
              <span
                key={idx}
                className="bg-[#E0F7FC] text-[#0096D6] text-xs font-extrabold px-3.5 py-2 rounded-xl border border-[#00AEEF]/25 flex items-center gap-1.5 hover:bg-[#B3EBF9] transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
                {app}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 4. What's Included */}
      {whatsIncluded && whatsIncluded.length > 0 && (
        <section id="whats-included" className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            What&apos;s Included in Box
          </h2>
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl max-w-lg overflow-hidden">
            {whatsIncluded.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-800 ${
                  idx > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#00AEEF]/10 text-[#00AEEF] text-[9px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Technical Specifications Table */}
      <section
        id="specifications"
        ref={specsRef}
        className="space-y-4 scroll-mt-24"
      >
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Technical Specifications
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-4xl shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="py-3 px-5 font-extrabold uppercase tracking-wider w-1/3 text-[10px]">
                  Parameter
                </th>
                <th className="py-3 px-5 font-extrabold uppercase tracking-wider text-[10px]">
                  Value / Specification
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(specs).map(([key, val], idx) => (
                <tr
                  key={key}
                  className={`${idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"} hover:bg-[#E0F7FC]/50 transition-colors`}
                >
                  <td className="py-3 px-5 font-bold text-slate-600 border-b border-slate-100 w-1/3">
                    {key}
                  </td>
                  <td className="py-3 px-5 font-semibold text-slate-900 border-b border-slate-100">
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
