'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SOLUTIONS } from '@/data/mockData';

interface SolutionsProps {
  onSelectSolution: (solutionTitle: string) => void;
}

export const SolutionsSection: React.FC<SolutionsProps> = ({ onSelectSolution }) => {
  return (
    <section id="solutions" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block bg-blue-50 text-[#1E56A0] text-xs font-extrabold tracking-widest uppercase px-3.5 py-1 rounded-full mb-3">
            OUR SOLUTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            Technology for Every Journey
          </h2>
          <p className="text-slate-600 text-base mt-3">
            Custom engineered robotics architectures, aerial UAV solutions, and AI edge vision tailored for institutional, industrial and research applications.
          </p>
        </div>

        {/* 4 Large Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SOLUTIONS.map((sol) => (
            <div
              key={sol.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card-premium hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Header */}
              <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={sol.image}
                  alt={sol.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#0A1128]">
                  {sol.category}
                </div>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {sol.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {sol.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2 mb-6">
                    {sol.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-[#1E56A0] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectSolution(sol.title)}
                  className="w-full bg-slate-50 hover:bg-[#0A1128] text-[#0A1128] hover:text-white py-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn border border-slate-200"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 text-[#1E56A0] group-hover/btn:text-[#D4AF37] group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
