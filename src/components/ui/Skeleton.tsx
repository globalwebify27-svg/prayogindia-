"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "shimmer" | "pulse";
}

/**
 * Base atomic Skeleton component with modern shimmer wave animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "shimmer",
  ...props
}) => {
  if (variant === "pulse") {
    return (
      <div
        className={`bg-slate-200/80 rounded-lg animate-pulse ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent ${className}`}
      {...props}
    />
  );
};

/**
 * Product Card Skeleton for store & category pages
 */
export const ProductCardSkeleton: React.FC<{ viewMode?: "grid" | "list" }> = ({
  viewMode = "grid",
}) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row gap-5 shadow-sm">
        <Skeleton className="w-full sm:w-48 h-44 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="space-y-1">
              <Skeleton className="h-6 w-28 rounded-lg" />
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 shadow-sm flex flex-col justify-between h-full">
      <div className="space-y-3.5">
        {/* Product Image Area */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100">
          <Skeleton className="w-full h-full rounded-xl" />
          <div className="absolute top-2.5 left-2.5">
            <Skeleton className="h-5 w-16 rounded-full bg-slate-200/90" />
          </div>
        </div>

        {/* Brand & Category tags */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-16 rounded" />
          <span className="text-slate-300">•</span>
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>

        {/* Rating stars & stock indicator */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <Skeleton className="h-3.5 w-14 rounded-full" />
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3 border-t border-slate-100/90 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Grid of product card skeletons
 */
export const ProductGridSkeleton: React.FC<{
  count?: number;
  columns?: 2 | 3 | 4 | 5;
}> = ({ count = 8, columns = 4 }) => {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  }[columns];

  return (
    <div className={`grid ${colClasses} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Walk-In Kiosk Product Tile Skeleton
 */
export const KioskProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 flex flex-col justify-between h-full shadow-sm">
      <div className="space-y-3">
        {/* Kiosk Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        {/* Category & Name */}
        <Skeleton className="h-3 w-16 rounded" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>
      {/* Price & Add button */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Full Walk-In Kiosk Screen Skeleton
 */
export const KioskGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Kiosk Header Skeleton */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
        <div className="flex-1 max-w-md hidden md:block">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Category Pills Skeleton */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-8 rounded-full shrink-0 ${i === 0 ? "w-16" : i % 2 === 0 ? "w-28" : "w-36"}`}
          />
        ))}
      </div>

      {/* Product Grid Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: count }).map((_, idx) => (
            <KioskProductSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Data Table Skeleton for Admin & Store Manager dashboards
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 5, showHeader = true }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {showHeader && (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-48 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-4 w-20 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-3.5">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    ) : cIdx === columns - 1 ? (
                      <Skeleton className="h-7 w-20 rounded-lg ml-auto" />
                    ) : (
                      <Skeleton
                        className={`h-4 ${cIdx % 2 === 0 ? "w-24" : "w-16"} rounded`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Metric / Stats Card Skeleton
 */
export const StatsCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-28 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Category Carousel / Pills Skeleton
 */
export const CategoryPillsSkeleton: React.FC<{ count?: number }> = ({
  count = 8,
}) => {
  return (
    <div className="flex items-center gap-3 overflow-hidden py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0"
        >
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
};

/**
 * Full Page Header Skeleton
 */
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 pb-6 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-16 rounded" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-3.5 w-24 rounded" />
      </div>
      <Skeleton className="h-8 w-64 rounded-xl" />
      <Skeleton className="h-4 w-96 max-w-full rounded" />
    </div>
  );
};
