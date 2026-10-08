import React from "react";
import { Skeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded" />
            <span className="text-slate-300">/</span>
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-64 rounded-xl" />
              <Skeleton className="h-4 w-80 rounded mt-2" />
            </div>
            <Skeleton className="h-11 w-full md:w-80 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filter Skeleton */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              {/* Filter Section 1 */}
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-24 rounded" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3.5 w-24 rounded" />
                    </div>
                    <Skeleton className="h-3.5 w-6 rounded" />
                  </div>
                ))}
              </div>
              {/* Filter Section 2 */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right Product Grid Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-36 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-32 rounded-xl" />
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
            </div>

            {/* Product Grid */}
            <ProductGridSkeleton count={8} columns={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
