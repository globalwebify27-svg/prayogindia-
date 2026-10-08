import React from "react";
import {
  Skeleton,
  StatsCardSkeleton,
  TableSkeleton,
} from "@/components/ui/Skeleton";

export default function StoreLoading() {
  return (
    <div className="space-y-6">
      {/* Header Banner Skeleton */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
          <Skeleton className="h-6 w-64 rounded-lg" />
          <Skeleton className="h-3.5 w-80 rounded" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* KPI Stat Cards Skeleton */}
      <StatsCardSkeleton count={4} />

      {/* Dashboard Tables & Widgets Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <TableSkeleton rows={5} columns={4} showHeader={true} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
