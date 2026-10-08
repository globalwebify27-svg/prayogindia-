import React from "react";
import {
  Skeleton,
  ProductGridSkeleton,
  CategoryPillsSkeleton,
} from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Announcement & Header Skeleton Placeholder */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
          <div className="flex-1 max-w-lg hidden md:block">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Hero Banner Skeleton */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900/5 p-8 sm:p-12 min-h-[320px] sm:min-h-[400px] flex flex-col justify-center border border-slate-200/80">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 sm:h-12 w-full rounded-2xl" />
            <Skeleton className="h-10 sm:h-12 w-4/5 rounded-2xl" />
            <Skeleton className="h-5 w-3/4 rounded-lg pt-2" />
            <div className="flex items-center gap-3 pt-4">
              <Skeleton className="h-12 w-36 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Categories Bar Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <CategoryPillsSkeleton count={7} />
        </div>

        {/* Featured Products Section Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
          <ProductGridSkeleton count={8} columns={4} />
        </div>
      </main>
    </div>
  );
}
