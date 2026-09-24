"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Radio,
} from "lucide-react";
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

interface CategoryItem {
  id: string;
  name: string;
  count: string;
  IconComponent: React.ElementType;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "robotics",
    name: "Robotics Kits",
    count: "2,400+ Items",
    IconComponent: RoboticsCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595386/prayog/products/prod_catalog_template_4.jpg",
  },
  {
    id: "arduino",
    name: "Arduino",
    count: "1,800+ Items",
    IconComponent: ArduinoCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595383/prayog/products/prod_catalog_template_1.jpg",
  },
  {
    id: "sensors",
    name: "Sensors & Modules",
    count: "1,450+ Items",
    IconComponent: SensorsCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595387/prayog/products/prod_catalog_template_5.jpg",
  },
  {
    id: "drones",
    name: "Drone Technology",
    count: "950+ Items",
    IconComponent: DroneCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595385/prayog/products/prod_catalog_template_3.jpg",
  },
  {
    id: "stem",
    name: "STEM Kits",
    count: "650+ Kits",
    IconComponent: StemCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595388/prayog/products/prod_catalog_template_7.jpg",
  },
  {
    id: "iot",
    name: "IoT Products",
    count: "3,100+ Items",
    IconComponent: IoTCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595384/prayog/products/prod_catalog_template_2.jpg",
  },
  {
    id: "devboards",
    name: "Development Boards",
    count: "820+ Boards",
    IconComponent: DevBoardCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595388/prayog/products/prod_catalog_template_6.jpg",
  },
  {
    id: "components",
    name: "Electronic Components",
    count: "5,000+ Parts",
    IconComponent: ComponentsCategoryIcon,
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595390/prayog/products/prod_catalog_template_9.jpg",
  },
];

const QUICK_FILTERS = [
  {
    label: "All Categories",
    query: "all",
    icon: LayoutGrid,
    accent: "text-[#00AEEF] bg-sky-50",
  },
  {
    label: "Microcontrollers & SBCs",
    query: "Arduino",
    icon: ArduinoCategoryIcon,
    accent: "text-amber-500 bg-amber-50",
  },
  {
    label: "Robotics & Manipulators",
    query: "Robotics Kits",
    icon: RoboticsCategoryIcon,
    accent: "text-blue-500 bg-blue-50",
  },
  {
    label: "Drone UAV Aerial",
    query: "Drone Technology",
    icon: DroneCategoryIcon,
    accent: "text-indigo-500 bg-indigo-50",
  },
  {
    label: "Sensors & Telemetry",
    query: "Sensors & Modules",
    icon: SensorsCategoryIcon,
    accent: "text-rose-500 bg-rose-50",
  },
  {
    label: "IoT & Wireless",
    query: "IoT Products",
    icon: IoTCategoryIcon,
    accent: "text-teal-500 bg-teal-50",
  },
  {
    label: "School STEM Kits",
    query: "STEM Kits",
    icon: StemCategoryIcon,
    accent: "text-emerald-500 bg-emerald-50",
  },
];

interface Props {
  onSelectCategory?: (category: string) => void;
}

export const ShopByCategory: React.FC<Props> = ({ onSelectCategory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Infinite right-to-left marquee loop
  useEffect(() => {
    let animationId: number;
    let lastTime: number | null = null;
    const speed = 45; // Pixels per second

    const step = (time: number) => {
      if (lastTime !== null && scrollRef.current && !isPaused) {
        const delta = (time - lastTime) / 1000;
        const container = scrollRef.current;
        const halfWidth = container.scrollWidth / 2;

        container.scrollLeft += speed * delta;

        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      lastTime = time;
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const scrollManual = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const INFINITE_CATEGORIES = [...CATEGORIES, ...CATEGORIES];

  return (
    <section className="py-6 sm:py-8 lg:py-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-5">
        {/* Section Header with Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/categories"
              className="text-xs sm:text-sm font-semibold text-[#00AEEF] hover:underline flex items-center gap-1 group cursor-pointer"
            >
              <span>View All</span>{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Categories Grid - 2 Rows (4 columns on desktop / tablet, 2 on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 pt-1">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.name)}
              className="bg-white hover:bg-[#E0F7FC]/30 border border-slate-200/90 hover:border-[#00AEEF]/50 rounded-2xl p-2.5 sm:p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group flex flex-col items-center text-center"
            >
              {/* Category Image */}
              <div className="relative h-24 sm:h-36 w-full mb-2 sm:mb-3 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-2xs">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Category Name */}
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#00AEEF] transition-colors leading-tight">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
