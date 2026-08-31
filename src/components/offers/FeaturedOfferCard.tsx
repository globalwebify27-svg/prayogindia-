'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OfferItem } from '@/data/offersData';
import { ArrowRight, Tag, Calendar, ShieldCheck } from 'lucide-react';

interface OfferCardProps {
  offer: OfferItem;
}

export const FeaturedOfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  return (
    <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between group">
      
      {/* Left Content */}
      <div className="p-6 sm:p-10 space-y-4 max-w-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#FFC20E] text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full">
            {offer.badge}
          </span>
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#00AEEF]" /> {offer.startDate} - {offer.endDate}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {offer.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {offer.shortDescription}
        </p>

        {offer.couponCode && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-bold">Voucher Code:</span>
            <span className="bg-white/10 text-[#FFC20E] border border-white/20 px-3 py-1 rounded-xl text-xs font-mono font-bold">
              {offer.couponCode}
            </span>
          </div>
        )}

        <div className="pt-2">
          <Link
            href={`/offers/${offer.slug}`}
            className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <span>Explore Offer & Products</span>
            <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
          </Link>
        </div>
      </div>

      {/* Right Image Banner */}
      <div className="relative h-64 md:h-80 w-full md:w-1/2 bg-slate-800 overflow-hidden">
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
        />
      </div>

    </div>
  );
};
