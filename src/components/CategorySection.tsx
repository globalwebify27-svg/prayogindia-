'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface CategoryProps {
  onSelectCategory?: (categoryName: string) => void;
}

export const CategorySection: React.FC<CategoryProps> = ({ onSelectCategory }) => {
  return (
    <section id="categories" className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Section Header Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative bg-white px-5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00AEEF]"></span>
              SHOP BY CATEGORY
            </h2>
          </div>
        </div>

        {/* Compact 5-Card Asymmetric Bento Grid matching Prayog Brand Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Main Hero Card Left: Raspberry Pi 5 (Col Span 6) */}
          <div 
            onClick={() => onSelectCategory?.('Single Board Computers & Dev Boards')}
            className="lg:col-span-6 bg-gradient-to-br from-[#E0F7FC] to-[#EBF9FD] rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden cursor-pointer group min-h-[340px] border border-[#BCEBF7] shadow-2xs hover:shadow-md transition-all"
          >
            <div className="max-w-md z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-[#00AEEF] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Featured Flagship
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Power Your Innovations with Raspberry Pi 5
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Shop official boards, AI HAT kits, and high-performance computing modules.
              </p>
            </div>

            {/* Compact Raspberry Pi Image */}
            <div className="relative w-full h-44 mt-3 rounded-xl overflow-hidden bg-white/50 p-2 border border-cyan-100">
              <Image
                src="/images/pi_hero.jpg"
                alt="Raspberry Pi 5"
                fill
                className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="flex justify-between items-center mt-3 z-10">
              <span className="text-xs font-bold text-[#00AEEF]">Explore Raspberry Pi Range →</span>
              <span className="w-8 h-8 rounded-full bg-[#00AEEF] text-white flex items-center justify-center group-hover:bg-[#0096D6] transition-colors shadow-xs">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Right Side 4 Compact Bento Box Cards (Col Span 6, 2x2 Grid) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box 1: Drones & UAV */}
            <div 
              onClick={() => onSelectCategory?.('Drones & UAV Parts')}
              className="bg-[#F8FAFC] rounded-2xl p-4 relative min-h-[160px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-slate-200 shadow-2xs hover:border-[#00AEEF] hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Drones & UAV</h4>
                  <p className="text-[11px] font-semibold text-[#00AEEF]">from ₹1,599*</p>
                </div>
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80"
                  alt="Drones"
                  fill
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Box 2: Robotics & DIY Kits */}
            <div 
              onClick={() => onSelectCategory?.('Robotics & DIY Kits')}
              className="bg-[#F8FAFC] rounded-2xl p-4 relative min-h-[160px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-slate-200 shadow-2xs hover:border-[#00AEEF] hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Robotics & Kits</h4>
                  <p className="text-[11px] font-semibold text-[#00AEEF]">from ₹299*</p>
                </div>
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
                  alt="Robotics"
                  fill
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Box 3: Wireless & IoT Boards */}
            <div 
              onClick={() => onSelectCategory?.('IoT & Wireless Modules')}
              className="bg-[#F8FAFC] rounded-2xl p-4 relative min-h-[160px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-slate-200 shadow-2xs hover:border-[#00AEEF] hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Wireless & IoT</h4>
                  <p className="text-[11px] font-semibold text-[#00AEEF]">from ₹349*</p>
                </div>
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
                  alt="Wireless Boards"
                  fill
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Box 4: Sensors & Modules */}
            <div 
              onClick={() => onSelectCategory?.('Sensors & Electronic Modules')}
              className="bg-[#F8FAFC] rounded-2xl p-4 relative min-h-[160px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-slate-200 shadow-2xs hover:border-[#00AEEF] hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Sensors Lab</h4>
                  <p className="text-[11px] font-semibold text-[#00AEEF]">299+ varieties</p>
                </div>
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                  alt="Sensors"
                  fill
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
