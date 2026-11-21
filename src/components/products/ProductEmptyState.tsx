import React from "react";
import Image from "next/image";
import { FilterX } from "lucide-react";

interface ProductEmptyStateProps {
  onClearFilters: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({
  onClearFilters,
  title,
  description = "We couldn't find any hardware matching your active filter choices or search query.",
  buttonText = "Clear All Filters",
}) => {
  return (
    <div className="py-8 px-4 text-center bg-white border border-slate-200/90 rounded-3xl space-y-4 max-w-md mx-auto my-6 shadow-sm font-sans">
      <div className="relative w-64 sm:w-72 aspect-[1024/682] mx-auto overflow-hidden">
        <Image
          src="/images/no-products-robot.jpg"
          alt="No Products Available"
          fill
          sizes="(max-width: 640px) 256px, 288px"
          className="object-contain"
          priority
        />
      </div>

      <div className="space-y-1.5 -mt-2">
        {title && (
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {title}
          </h3>
        )}
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClearFilters}
        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer active:scale-95"
      >
        <FilterX className="w-4 h-4" />
        <span>{buttonText}</span>
      </button>
    </div>
  );
};

export default ProductEmptyState;
