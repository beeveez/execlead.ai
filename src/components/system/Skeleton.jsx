import React from "react";

/**
 * Skeleton primitives — replace spinners with shimmer placeholders.
 * Matches the platform's dark theme.
 */
const baseClass = "bg-white/[0.04] rounded-md animate-pulse";

export function Skeleton({ className = "", ...props }) {
  return <div className={`${baseClass} ${className}`} {...props} />;
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: i === lines - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
      <Skeleton className="h-8 rounded-lg" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 4 }) {
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <div className="flex gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 flex-1" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 px-4 py-3.5 border-b border-white/5 last:border-0">
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-3 flex-1" style={{ width: c === 0 ? "40%" : undefined }} />)}
        </div>
      ))}
    </div>
  );
}

/**
 * Full-page loading state — centered skeleton block with fade.
 */
export function LoadingState({ variant = "grid", count }) {
  const map = {
    grid: () => <SkeletonGrid count={count || 8} />,
    list: () => <SkeletonList count={count || 5} />,
    table: () => <SkeletonTable rows={count || 6} />,
    card: () => <SkeletonCard />,
    text: () => <SkeletonText lines={count || 3} />,
  };
  return (
    <div className="animate-in fade-in duration-300">{(map[variant] || map.grid)()}</div>
  );
}