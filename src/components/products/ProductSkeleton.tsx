import React from "react";

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-44 w-full bg-slate-100 rounded-xl" />

      {/* Content Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
      </div>

      {/* Price & CTA Skeleton */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="h-5 w-20 bg-slate-200 rounded" />
        <div className="h-8 w-24 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
};
