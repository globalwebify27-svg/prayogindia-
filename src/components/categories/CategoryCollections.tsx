"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { COLLECTION_ECOSYSTEMS } from "@/data/categories";

export const CategoryCollections: React.FC = () => {
  return (
    <section className="my-8 sm:my-10 space-y-6">
      {/* Header: Clean & Modern without dark container */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] border border-[#00AEEF]/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> Product Ecosystems
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Category Collections
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Explore curated hardware architecture setups for robotics engineering,
          UAV drone development, and microcontrollers.
        </p>
      </div>

      {/* Sleek, Compact, Premium 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLLECTION_ECOSYSTEMS.map((eco, idx) => (
          <motion.div
            key={eco.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <Link
              href={`/categories/${eco.categorySlug}`}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden block border border-slate-200/90 hover:border-[#00AEEF] bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-end"
            >
              {/* Image with smooth zoom */}
              <Image
                src={eco.image}
                alt={eco.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.72] contrast-[1.05]"
              />

              {/* Refined Dark Gradient Vignette for high legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />

              {/* Content */}
              <div className="relative z-20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-white/15 backdrop-blur-md text-[#FFC20E] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border border-white/20 tracking-wider">
                    {eco.tag}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#00AEEF] group-hover:border-[#00AEEF] transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-[#00AEEF] transition-colors line-clamp-2">
                  {eco.title}
                </h3>

                <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  {eco.description}
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-[#FFC20E] group-hover:text-amber-300">
                  <span>Explore Collection</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

