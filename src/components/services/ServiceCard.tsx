'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ServiceItem } from '@/data/servicesData';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface ServiceCardProps {
  service: ServiceItem;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-[#00AEEF]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      
      <div>
        {/* Service Image */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#00AEEF] transition-colors leading-snug">
            {service.name}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {service.shortDescription}
          </p>

          {/* Feature Highlights */}
          <div className="space-y-1.5 pt-2">
            {service.features.slice(0, 2).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] font-semibold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF] shrink-0 mt-0.5" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 pt-0">
        <Link
          href={`/services/${service.slug}`}
          className="w-full bg-slate-50 hover:bg-[#E0F7FC] text-slate-900 hover:text-[#00AEEF] border border-slate-200 hover:border-[#00AEEF]/30 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all group-hover:shadow-sm"
        >
          <span>Explore Service Details</span>
          <ArrowRight className="w-4 h-4 text-[#00AEEF]" />
        </Link>
      </div>

    </div>
  );
};
