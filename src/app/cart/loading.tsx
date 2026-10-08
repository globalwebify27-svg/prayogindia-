import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex gap-4 items-center shadow-sm"
              >
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 h-fit shadow-sm">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
