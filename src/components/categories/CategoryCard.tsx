"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CircuitBoard,
  Cpu,
  Zap,
  Radio,
  Layers,
  Activity,
  Bot,
  Plane,
  Camera,
  Wrench,
  Wifi,
} from "lucide-react";
import { CategoryData } from "@/data/categories";
import {
  RoboticsCategoryIcon,
  ArduinoCategoryIcon,
  SensorsCategoryIcon,
  DroneCategoryIcon,
  StemCategoryIcon,
  IoTCategoryIcon,
  DevBoardCategoryIcon,
  ComponentsCategoryIcon,
} from "@/components/icons/CategoryIcons";

interface CategoryCardProps {
  category: CategoryData;
  index?: number;
}

const getCategoryIcon = (slug: string, name: string) => {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  if (s.includes("arduino") || s.includes("microcontroller") || n.includes("arduino"))
    return ArduinoCategoryIcon;
  if (s.includes("robot") || n.includes("robot"))
    return RoboticsCategoryIcon;
  if (s.includes("sensor") || n.includes("sensor"))
    return SensorsCategoryIcon;
  if (s.includes("drone") || n.includes("drone") || s.includes("uav"))
    return DroneCategoryIcon;
  if (s.includes("stem") || s.includes("educational") || n.includes("stem"))
    return StemCategoryIcon;
  if (s.includes("iot") || s.includes("wireless") || n.includes("iot"))
    return IoTCategoryIcon;
  if (s.includes("electronic-component") || s.includes("component") || n.includes("component"))
    return ComponentsCategoryIcon;
  if (s.includes("dev-board") || s.includes("development-board") || n.includes("development"))
    return DevBoardCategoryIcon;
  if (s.includes("raspberry") || n.includes("raspberry"))
    return CircuitBoard;
  if (s.includes("motor") || s.includes("driver") || s.includes("power") || s.includes("batter"))
    return Zap;
  if (s.includes("camera") || s.includes("imaging"))
    return Camera;
  if (s.includes("tool") || s.includes("hardware"))
    return Wrench;
  if (s.includes("3d-print"))
    return Layers;
  if (s.includes("communication") || s.includes("network"))
    return Wifi;

  return Cpu;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  index = 0,
}) => {
  const IconComponent = getCategoryIcon(category.slug, category.name);
  const subNames =
    category.subcategories && category.subcategories.length > 0
      ? category.subcategories
          .slice(0, 3)
          .map((s) => s.name)
          .join(", ")
      : category.shortDescription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.25) }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Link
        href={`/categories/${category.slug}`}
        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#00AEEF] hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 p-3 flex flex-col justify-between overflow-hidden block h-full focus:outline-none"
      >
        <div>
          {/* Top Visual Image Box */}
          <div className="relative h-38 sm:h-40 w-full mb-3 rounded-xl overflow-hidden bg-slate-100">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Top Right Item Count Pill */}
            <div className="absolute top-2.5 right-2.5 bg-[#00AEEF] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
              {category.productCount.toLocaleString()}+ items
            </div>
          </div>
        </div>

        {/* Bottom Info Row */}
        <div className="flex items-center gap-3 pt-1">
          {/* Category Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#00AEEF] flex items-center justify-center shrink-0 border border-sky-100 group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
            <IconComponent className="w-5 h-5 stroke-[1.8]" />
          </div>

          {/* Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#00AEEF] transition-colors truncate">
              {category.shortName || category.name}
            </h3>
            <p className="text-[10.5px] font-medium text-slate-400 truncate">
              {subNames}
            </p>
          </div>

          {/* Circle Arrow Action Button */}
          <div className="w-7 h-7 rounded-full bg-sky-50 text-[#00AEEF] group-hover:bg-[#00AEEF] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
