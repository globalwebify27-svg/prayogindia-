'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface CategorySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}

export const CategorySearch: React.FC<CategorySearchProps> = ({
  searchQuery,
  onSearchChange,
  onClear
}) => {
  return (
    <div className="relative max-w-md w-full my-6">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search categories..."
          className="w-full bg-slate-50 text-slate-900 text-xs sm:text-sm pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] focus:bg-white focus:ring-4 focus:ring-[#00AEEF]/10 transition-all shadow-2xs"
          aria-label="Search categories"
        />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 rounded-full focus:outline-none"
            aria-label="Clear category search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
