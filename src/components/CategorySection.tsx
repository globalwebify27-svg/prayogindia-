'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface CategoryProps {
  onSelectCategory?: (categoryName: string) => void;
}

export const CategorySection: React.FC<CategoryProps> = ({ onSelectCategory }) => {
  return (
    <section id="categories" className="pt-2 pb-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Robocraze Style Section Divider Heading */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative bg-white px-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
              SHOP
            </h2>
          </div>
        </div>

        {/* Robocraze 5-Card Asymmetric Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Big Feature Card Left: Raspberry Pi (Col Span 6) */}
          <div 
            onClick={() => onSelectCategory?.('Single Board Computers & Dev Boards')}
            className="lg:col-span-6 bg-[#E8F8F5] rounded-2xl p-8 relative flex flex-col justify-between overflow-hidden cursor-pointer group min-h-[440px] border border-emerald-100 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="max-w-md z-10 space-y-3">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Power Your Projects with Raspberry Pi
              </h3>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">
                Experience next-level performance. Shop the latest boards, complete kits, and essential accessories.
              </p>
            </div>

            {/* High-res Raspberry Pi Hero Image */}
            <div className="relative w-full h-64 mt-4 rounded-xl overflow-hidden">
              <Image
                src="/images/pi_hero.jpg"
                alt="Raspberry Pi 5"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Side 4 Bento Box Cards (Col Span 6, 2x2 Grid) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Box 1: Drones */}
            <div 
              onClick={() => onSelectCategory?.('Drones & UAV Parts')}
              className="bg-[#EBF7FF] rounded-2xl p-6 relative min-h-[210px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-blue-100 shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <h4 className="text-2xl font-extrabold text-slate-900">Drones</h4>
                <p className="text-xs font-semibold text-slate-500">from ₹1599*</p>
              </div>
              <div className="relative w-full h-32 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80"
                  alt="Drones"
                  fill
                  className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Box 2: Robotics & 3D Parts */}
            <div 
              onClick={() => onSelectCategory?.('Robotics & DIY Kits')}
              className="bg-[#F4F4F4] rounded-2xl p-6 relative min-h-[210px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <h4 className="text-2xl font-extrabold text-slate-900">Robotics & Kits</h4>
                <p className="text-xs font-semibold text-slate-500">from ₹299*</p>
              </div>
              <div className="relative w-full h-32 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
                  alt="Robotics"
                  fill
                  className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Box 3: Wireless & IoT Boards */}
            <div 
              onClick={() => onSelectCategory?.('IoT & Wireless Modules')}
              className="bg-[#F2F2F2] rounded-2xl p-6 relative min-h-[210px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <h4 className="text-2xl font-extrabold text-slate-900">Wireless Boards</h4>
                <p className="text-xs font-semibold text-slate-500">from ₹349*</p>
              </div>
              <div className="relative w-full h-32 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
                  alt="Wireless Boards"
                  fill
                  className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Box 4: Sensors & Modules */}
            <div 
              onClick={() => onSelectCategory?.('Sensors & Electronic Modules')}
              className="bg-[#EAF6FF] rounded-2xl p-6 relative min-h-[210px] flex flex-col justify-between overflow-hidden cursor-pointer group border border-blue-100 shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <h4 className="text-2xl font-extrabold text-slate-900">Sensors</h4>
                <p className="text-xs font-semibold text-slate-500">299+ varieties available</p>
              </div>
              <div className="relative w-full h-32 mt-2">
                <Image
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                  alt="Sensors"
                  fill
                  className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
