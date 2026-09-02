import React from 'react';
import Image from 'next/image';
import { 
  Bot, 
  Cpu, 
  Layers, 
  Boxes, 
  Radio, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface ProductsHeaderProps {
  title?: string;
  description?: string;
  totalCount: number;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

const QUICK_CATEGORIES = [
  { id: 'all', name: 'All Products', icon: Boxes },
  { id: 'Robot Kits', name: 'Robot Kits', icon: Bot },
  { id: 'Motors', name: 'Motors', icon: Zap },
  { id: 'Controllers', name: 'Controllers', icon: Cpu },
  { id: 'Sensors', name: 'Sensors', icon: Radio },
  { id: 'Development Boards', name: 'Development Boards', icon: Layers },
  { id: 'Accessories', name: 'Accessories', icon: Sparkles },
];

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  title,
  description = "Robotics, electronics, STEM & IoT components for innovators, educators and industries.",
  totalCount,
  selectedCategory = null,
  onSelectCategory,
}) => {
  const displayTitle = title || (selectedCategory ? `Explore ${selectedCategory}` : "Explore Products");

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-100/70 bg-[#F4F2FA] p-4 sm:p-6 md:p-7 shadow-xs mb-3.5 min-h-[190px] sm:min-h-[220px] flex flex-col justify-center">
      {/* Background Banner Image with Robot Arm & Glowing Circuit Traces */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <Image
          src="/images/robotics_arm_banner_v2.png"
          alt="Robotics & Electronics Circuit Background"
          fill
          priority
          unoptimized
          className="object-contain object-right opacity-100"
        />
        {/* Soft Left Overlay to Ensure Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F2FA] via-[#F4F2FA]/70 to-transparent w-full md:w-1/2" />
      </div>

      <div className="relative z-10 space-y-4 max-w-4xl">
        {/* Top Tag Header */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC]/90 border border-[#00AEEF]/20 px-3 py-1 rounded-md inline-block shadow-2xs">
            Official Catalogue
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1528] tracking-tight mt-1.5 font-sans">
            {displayTitle}
          </h1>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-2xl">
          {description}
        </p>

        {/* Quick Category Filter Pills Row (if handler provided) */}
        {onSelectCategory && (
          <div className="pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: 'none' }}>
            {QUICK_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = (!selectedCategory && cat.id === 'all') || selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id === 'all' ? null : cat.name)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00AEEF] text-white shadow-sm shadow-[#00AEEF]/30 scale-[1.02]'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

