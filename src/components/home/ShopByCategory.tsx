'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Bot, 
  Cpu, 
  Plane, 
  Wifi, 
  GraduationCap, 
  Activity, 
  Zap, 
  CircuitBoard,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Radio
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  count: string;
  IconComponent: React.ElementType;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'robotics', name: 'Robotics Kits', count: '2,400+ Items', IconComponent: Bot, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80' },
  { id: 'arduino', name: 'Arduino', count: '1,800+ Items', IconComponent: Cpu, image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=500&q=80' },
  { id: 'sensors', name: 'Sensors & Modules', count: '1,450+ Items', IconComponent: Activity, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80' },
  { id: 'drones', name: 'Drone Technology', count: '950+ Items', IconComponent: Plane, image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=500&q=80' },
  { id: 'stem', name: 'STEM Kits', count: '650+ Kits', IconComponent: GraduationCap, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=500&q=80' },
  { id: 'iot', name: 'IoT Products', count: '3,100+ Items', IconComponent: Wifi, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80' },
  { id: 'devboards', name: 'Development Boards', count: '820+ Boards', IconComponent: CircuitBoard, image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=500&q=80' },
  { id: 'components', name: 'Electronic Components', count: '5,000+ Parts', IconComponent: Zap, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80' },
];

const QUICK_FILTERS = [
  { label: 'All Categories', query: 'all', icon: LayoutGrid, accent: 'text-[#00AEEF] bg-sky-50' },
  { label: 'Microcontrollers & SBCs', query: 'Arduino', icon: Cpu, accent: 'text-amber-500 bg-amber-50' },
  { label: 'Robotics & Manipulators', query: 'Robotics Kits', icon: Bot, accent: 'text-blue-500 bg-blue-50' },
  { label: 'Drone UAV Aerial', query: 'Drone Technology', icon: Plane, accent: 'text-indigo-500 bg-indigo-50' },
  { label: 'Sensors & Telemetry', query: 'Sensors & Modules', icon: Activity, accent: 'text-rose-500 bg-rose-50' },
  { label: 'IoT & Wireless', query: 'IoT Products', icon: Wifi, accent: 'text-teal-500 bg-teal-50' },
  { label: 'School STEM Kits', query: 'STEM Kits', icon: GraduationCap, accent: 'text-emerald-500 bg-emerald-50' },
];

interface Props {
  onSelectCategory?: (category: string) => void;
}

export const ShopByCategory: React.FC<Props> = ({ onSelectCategory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

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

  const scrollManual = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const INFINITE_CATEGORIES = [...CATEGORIES, ...CATEGORIES];

  return (
    <section className="pt-2 sm:pt-4 lg:pt-5 pb-6 sm:pb-8 lg:pb-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
        
        {/* Section Header with Controls */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00AEEF]">
              Hardware Taxonomy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectCategory?.('all')}
              className="text-xs sm:text-sm font-extrabold text-[#00AEEF] hover:underline flex items-center gap-1 group cursor-pointer"
            >
              <span>Explore All Categories</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Categories Grid - 2 Rows (4 columns on desktop / tablet, 2 on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 pt-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.IconComponent;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory?.(cat.name)}
                className="bg-slate-50/80 hover:bg-[#E0F7FC]/40 border border-slate-200/80 hover:border-[#00AEEF]/50 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between"
              >
                {/* Top: Icon & Count Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs group-hover:bg-[#00AEEF] transition-colors">
                    <Icon className="w-5 h-5 text-[#00AEEF] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200/70 shadow-2xs">
                    {cat.count}
                  </span>
                </div>

                {/* Category Image */}
                <div className="relative h-28 sm:h-32 w-full mb-3 rounded-xl overflow-hidden bg-white p-1 border border-slate-100 shadow-2xs">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Category Name */}
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#00AEEF] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00AEEF] group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
