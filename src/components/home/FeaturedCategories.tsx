'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  badge?: string;
}

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: '1',
    title: 'Autonomous Robotics & Arm Manipulators',
    subtitle: '6-DOF Precision Servos & Industrial Metal Controllers',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    category: 'Robotics Kits',
    badge: 'FLAGSHIP'
  },
  {
    id: '2',
    title: 'UAV Drone Hardware & Autopilots',
    subtitle: 'Pixhawk 6C, BLDC Motors & Carbon Fiber Platforms',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    category: 'Drone Technology',
    badge: 'PRO SPEC'
  },
  {
    id: '3',
    title: 'Arduino & Microcontroller Ecosystem',
    subtitle: 'Official UNO R3, ESP32 Dual-Core & Expansion Shields',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
    category: 'Arduino',
    badge: 'BESTSELLER'
  }
];

interface Props {
  onSelectCategory?: (category: string) => void;
}

export const FeaturedCategories: React.FC<Props> = ({ onSelectCategory }) => {
  return (
    <section className="py-12 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        
        {/* Section Title */}
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#FFC20E]">
            Premium Collections
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Featured Categories
          </h2>
        </div>

        {/* 3-Column Large Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onSelectCategory?.(item.category)}
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer border border-slate-800 hover:border-[#00AEEF]/60 transition-all duration-500 shadow-2xl flex flex-col justify-end p-6"
            >
              {/* Background Image with Dark Gradient Overlay */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/60 to-transparent z-10" />

              {/* Badge & Details */}
              <div className="relative z-20 space-y-3">
                {item.badge && (
                  <span className="bg-[#00AEEF] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md inline-block">
                    {item.badge}
                  </span>
                )}
                
                <h3 className="text-xl font-extrabold text-white leading-tight group-hover:text-[#00AEEF] transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs font-black text-[#FFC20E] group-hover:text-amber-300 transition-colors">
                  <span>Explore Collection</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
