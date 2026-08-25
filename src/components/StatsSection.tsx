'use client';

import React from 'react';
import { Package, Layers, Building2, Users } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      number: '10,000+',
      label: 'Products',
      description: 'Microcontrollers, kits & robotics gear',
      icon: Package,
      color: 'text-[#1E56A0]'
    },
    {
      number: '50+',
      label: 'Technology Categories',
      description: 'From AI vision to drone components',
      icon: Layers,
      color: 'text-[#D4AF37]'
    },
    {
      number: 'Multiple',
      label: 'Industries Served',
      description: 'Defense, R&D, Agri & Manufacturing',
      icon: Building2,
      color: 'text-[#1E56A0]'
    },
    {
      number: 'Trusted',
      label: 'by Students & Professionals',
      description: 'Over 500+ STEM labs across India',
      icon: Users,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-30 -mt-10 sm:-mt-12 mb-6">
      <div className="bg-white rounded-3xl shadow-card-hover border border-slate-100 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {stats.map((stat, idx) => (
          <div key={idx} className={`flex flex-col justify-center ${idx > 0 ? 'pt-4 lg:pt-0 lg:pl-6' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
                {stat.number}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {stat.label}
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
