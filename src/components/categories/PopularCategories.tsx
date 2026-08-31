'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES_DATA } from '@/data/categories';

export const PopularCategories: React.FC = () => {
  return (
    <section className="py-8 bg-white border-t border-slate-100">
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              QUICK ACCESS
            </span>
            <h3 className="text-xl font-black text-slate-900">
              Popular Categories
            </h3>
          </div>
        </div>

        {/* Horizontal Carousel (CSS Scroll on Mobile/Desktop) */}
        <div 
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group shrink-0 bg-slate-50 hover:bg-[#E0F7FC]/50 border border-slate-200/80 hover:border-[#00AEEF]/40 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
            >
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-200">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              
              <span className="text-xs font-extrabold text-slate-900 group-hover:text-[#00AEEF] whitespace-nowrap">
                {cat.name}
              </span>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00AEEF] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
