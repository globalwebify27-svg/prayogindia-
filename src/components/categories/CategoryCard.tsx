"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CategoryData } from "@/data/categories";

interface CategoryCardProps {
  category: CategoryData;
  index?: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <Link
        href={`/categories/${category.slug}`}
        className="group bg-white rounded-3xl border border-slate-200/90 p-5 flex flex-col justify-between hover:border-[#00AEEF]/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden block h-full focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
      >
        <div>
          {/* Visual Image */}
          <div className="relative h-44 w-full mb-4 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-2xs border border-slate-200/60">
              {category.productCount.toLocaleString()}+ Items
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#00AEEF] transition-colors leading-tight">
              {category.name}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {category.shortDescription}
            </p>
          </div>
        </div>

        {/* Explore Link Indicator */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#00AEEF] group-hover:text-[#0096D6]">
          <span>Explore Category</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
};
