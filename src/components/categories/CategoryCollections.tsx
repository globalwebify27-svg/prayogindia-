'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { COLLECTION_ECOSYSTEMS } from '@/data/categories';

export const CategoryCollections: React.FC = () => {
  return (
    <section className="py-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-10 my-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC20E] bg-[#FFC20E]/10 border border-[#FFC20E]/30 px-3 py-1 rounded-full inline-block">
            Product Ecosystems
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Category Collections
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          Explore curated hardware architecture setups for robotics engineering, UAV drone development, and microcontrollers.
        </p>
      </div>

      {/* Asymmetrical Premium Layout (1 Large + 2 Side Stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Large Feature Card (Span 7) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="lg:col-span-7"
        >
          <Link
            href={`/categories/${COLLECTION_ECOSYSTEMS[0].categorySlug}`}
            className="group relative h-96 sm:h-[420px] rounded-3xl overflow-hidden block border border-slate-800 hover:border-[#00AEEF] transition-all duration-500 shadow-2xl p-8 flex flex-col justify-end"
          >
            <Image
              src={COLLECTION_ECOSYSTEMS[0].image}
              alt={COLLECTION_ECOSYSTEMS[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/50 to-transparent z-10" />

            <div className="relative z-20 space-y-3">
              <span className="bg-[#00AEEF] text-white text-[9px] font-black uppercase px-3 py-1 rounded-full inline-block">
                {COLLECTION_ECOSYSTEMS[0].tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug group-hover:text-[#00AEEF] transition-colors">
                {COLLECTION_ECOSYSTEMS[0].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                {COLLECTION_ECOSYSTEMS[0].description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-black text-[#FFC20E] group-hover:text-amber-300">
                <span>Explore Ecosystem</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 2 Side Stacked Cards (Span 5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {COLLECTION_ECOSYSTEMS.slice(1).map((eco, idx) => (
            <motion.div
              key={eco.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <Link
                href={`/categories/${eco.categorySlug}`}
                className="group relative h-48 sm:h-52 rounded-3xl overflow-hidden block border border-slate-800 hover:border-[#00AEEF] transition-all duration-500 p-6 flex flex-col justify-end"
              >
                <Image
                  src={eco.image}
                  alt={eco.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/60 to-transparent z-10" />

                <div className="relative z-20 space-y-1.5">
                  <span className="bg-white/10 backdrop-blur-md text-[#FFC20E] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block border border-white/15">
                    {eco.tag}
                  </span>
                  <h4 className="text-lg font-extrabold text-white group-hover:text-[#00AEEF] transition-colors leading-tight">
                    {eco.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 pt-1">
                    <span>View Collection</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00AEEF]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
