'use client';

import React from 'react';

export function SkeletonCard() {
  return (
    <div className="rounded-card border border-gray-200 bg-banorte-white h-full flex flex-col p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-[70%] bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-[60px] bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Description lines */}
      <div className="flex-grow space-y-2 mb-4">
        <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-[90%] bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-[80%] bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Category + stats */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Chips */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-[120px] bg-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-[100px] bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-[90px] bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <SkeletonCard />
        </div>
      ))}
    </>
  );
}
