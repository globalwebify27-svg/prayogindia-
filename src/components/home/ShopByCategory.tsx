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
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
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
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={() => scrollManual('left')}
                aria-label="Slide left"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-[#00AEEF] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollManual('right')}
                aria-label="Slide right"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-[#00AEEF] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => onSelectCategory?.('all')}
              className="text-xs sm:text-sm font-extrabold text-[#00AEEF] hover:underline flex items-center gap-1 group cursor-pointer"
            >
              <span>Explore All</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Sleek Custom Tech Badges / Filter Pills (Replaces generic emojis) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          {QUICK_FILTERS.map((filt, idx) => {
            const Icon = filt.icon;
            const isActive = activeFilter === filt.query;

            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveFilter(filt.query);
                  onSelectCategory?.(filt.query);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all duration-200 border cursor-pointer shadow-2xs group active:scale-95 ${
                  isActive
                    ? 'bg-[#0F172A] text-white border-slate-800 shadow-md ring-2 ring-[#00AEEF]/30'
                    : 'bg-slate-50/80 hover:bg-white text-slate-700 border-slate-200 hover:border-[#00AEEF]/40 hover:text-[#00AEEF]'
                }`}
              >
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#00AEEF] text-white shadow-xs'
                    : `${filt.accent} group-hover:scale-110`
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="tracking-tight">{filt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Automatic Infinite Circular Sliding Cards Carousel Container */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none pb-4 pt-1" 
          style={{ scrollbarWidth: 'none' }}
        >
          {INFINITE_CATEGORIES.map((cat, idx) => {
            const Icon = cat.IconComponent;
            return (
              <div
                key={`${cat.id}-${idx}`}
                onClick={() => onSelectCategory?.(cat.name)}
                className="w-44 sm:w-52 shrink-0 bg-slate-50 hover:bg-[#E0F7FC]/40 border border-slate-200/80 hover:border-[#00AEEF]/40 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs group-hover:bg-[#00AEEF] transition-colors">
                    <Icon className="w-5 h-5 text-[#00AEEF] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                    {cat.count}
                  </span>
                </div>

                <div className="relative h-24 w-full mb-3 rounded-xl overflow-hidden bg-white p-1 border border-slate-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#00AEEF] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
