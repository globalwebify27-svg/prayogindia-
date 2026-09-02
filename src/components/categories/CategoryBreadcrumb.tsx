import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CategoryBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-1 text-xs font-semibold text-slate-500">
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link 
            href="/" 
            className="hover:text-[#00AEEF] transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/50 rounded-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {item.href && !isLast ? (
                <Link 
                  href={item.href} 
                  className="hover:text-[#00AEEF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/50 rounded-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
