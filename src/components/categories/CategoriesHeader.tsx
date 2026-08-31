import React from 'react';

interface CategoriesHeaderProps {
  title?: string;
  description?: string;
}

export const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  title = "Explore Categories",
  description = "Explore robotics, electronics, STEM, IoT and technology products."
}) => {
  return (
    <div className="py-6 sm:py-8 space-y-2 border-b border-slate-100">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
        Prayog India Marketplace
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        {title}
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
};
