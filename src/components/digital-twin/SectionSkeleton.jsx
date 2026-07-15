import React from 'react';

/**
 * Skeleton loaders for each Digital Twin section.
 * Shown while data is being fetched / computed in the background.
 */

function SkeletonBlock({ className = '' }) {
  return <div className={`shimmer-bg rounded-lg ${className}`} />;
}

export function HeroSkeleton() {
  return (
    <div className="bg-gradient-to-br from-violet-500/5 via-indigo-500/[0.02] to-transparent border border-violet-500/10 rounded-2xl p-6">
      <div className="flex items-start gap-6 flex-wrap mb-6">
        <SkeletonBlock className="w-16 h-16 rounded-2xl" />
        <div className="flex-1 min-w-[200px]">
          <SkeletonBlock className="h-5 w-48 mb-2" />
          <SkeletonBlock className="h-3 w-32 mb-3" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-5 w-20 rounded-full" />
            <SkeletonBlock className="h-5 w-40 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-5 w-12" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <SkeletonBlock className="w-20 h-20 rounded-full" />
            <SkeletonBlock className="h-3 w-16 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonBlock className="h-5 w-44" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <SkeletonBlock className="h-32 rounded-xl" />
    </div>
  );
}

export function TrajectorySkeleton() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonBlock className="h-5 w-40" />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 flex-1">
              <SkeletonBlock className="w-14 h-14 rounded-2xl" />
              <div className="flex-1">
                <SkeletonBlock className="h-3 w-16 mb-2" />
                <SkeletonBlock className="h-4 w-24 mb-1" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimulatorSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonBlock className="h-5 w-44" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function IntelligenceSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonBlock className="h-5 w-44" />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-16 rounded-xl mb-2" />
      ))}
    </div>
  );
}

export function RecommendationSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonBlock className="h-5 w-56" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Generic section wrapper that shows a skeleton while loading
 * and renders children when data is available.
 */
export function SectionLoader({ loading, skeleton: Skeleton, children, label }) {
  if (loading) {
    return (
      <div className="relative">
        {label && (
          <div className="absolute top-0 right-0 z-10 flex items-center gap-1 text-[9px] text-white/30 bg-white/[0.02] border border-white/5 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Loading {label}...
          </div>
        )}
        <Skeleton />
      </div>
    );
  }
  return <>{children}</>;
}