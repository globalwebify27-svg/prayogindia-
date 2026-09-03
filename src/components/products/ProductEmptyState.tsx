import React from "react";
import { PackageSearch, FilterX } from "lucide-react";

interface ProductEmptyStateProps {
  onClearFilters: () => void;
}

export const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({
  onClearFilters,
}) => {
  return (
    <div className="py-16 px-4 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-4 max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center mx-auto border border-[#00AEEF]/20">
        <PackageSearch className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-900">No Products Found</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          We couldn&apos;t find any hardware matching your active filter choices
          or search query.
        </p>
      </div>

      <button
        onClick={onClearFilters}
        className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-colors shadow-sm inline-flex items-center gap-2"
      >
        <FilterX className="w-4 h-4" />
        <span>Clear All Filters</span>
      </button>
    </div>
  );
};
