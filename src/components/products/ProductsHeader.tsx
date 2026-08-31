import React from 'react';

interface ProductsHeaderProps {
  title?: string;
  description?: string;
  totalCount: number;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  title = "Explore Products",
  description = "Discover robotics, electronics, STEM, IoT and technology products.",
  totalCount,
}) => {
  return (
    <div className="py-6 border-b border-slate-100 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
            Official Catalogue
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            {title}
          </h1>
        </div>

        <div className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-black self-start sm:self-auto border border-slate-200">
          {totalCount} Products
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
};
