import React from "react";

/**
 * Shimmer — skeleton placeholder with a sweeping shimmer animation.
 * Matches the dark theme of the marketing pages.
 */
export function Shimmer({ className = "" }) {
  return <div className={`shimmer-bg rounded-lg ${className}`} />;
}

/**
 * PricingSkeleton — matches the Pricing page layout (hero + billing toggle + card grid).
 * Shown while the lazy Pricing chunk loads or pricing data is being fetched.
 */
export function PricingSkeleton() {
  return (
    <div className="animate-fade-in">
      <section className="pt-40 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shimmer className="h-7 w-72 mx-auto rounded-full mb-6" />
          <Shimmer className="h-16 w-full max-w-2xl mx-auto mb-3" />
          <Shimmer className="h-16 w-3/4 max-w-xl mx-auto mb-6" />
          <Shimmer className="h-5 w-full max-w-xl mx-auto" />
          <Shimmer className="h-5 w-2/3 max-w-md mx-auto mt-2" />
        </div>
      </section>
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Shimmer className="h-10 w-24 rounded-lg" />
            <Shimmer className="h-10 w-28 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <Shimmer className="h-8 w-8 rounded-lg mb-4" />
                <Shimmer className="h-5 w-24 mb-2" />
                <Shimmer className="h-3 w-full mb-1" />
                <Shimmer className="h-3 w-2/3 mb-6" />
                <Shimmer className="h-8 w-20 mb-6" />
                <div className="space-y-3 mb-8">
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-4/5" />
                </div>
                <Shimmer className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * LeaderboardSkeleton — matches the Leaderboard page layout (header + stats + ranked cards).
 * Shown while the lazy Leaderboard chunk loads.
 */
export function LeaderboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Shimmer className="h-3 w-40 mb-2" />
        <Shimmer className="h-7 w-80 mb-2" />
        <Shimmer className="h-4 w-full max-w-xl" />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <Shimmer className="h-4 w-48 mb-2" />
            <Shimmer className="h-3 w-64" />
          </div>
          <Shimmer className="h-9 w-36 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <Shimmer className="h-4 w-4 mb-2" />
            <Shimmer className="h-7 w-12 mb-1" />
            <Shimmer className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <Shimmer className="h-4 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Shimmer className="h-6 w-6 rounded-full" />
                  <div className="flex-1">
                    <Shimmer className="h-4 w-32 mb-1" />
                    <Shimmer className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <Shimmer className="h-4 w-36 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <Shimmer className="h-3 w-full mb-1" />
                  <Shimmer className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * LandingSkeleton — matches the Landing page hero + stats + features grid.
 * Shown while the lazy Landing chunk loads.
 */
export function LandingSkeleton() {
  return (
    <div className="animate-fade-in">
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shimmer className="h-7 w-72 mx-auto rounded-full mb-8" />
          <Shimmer className="h-20 w-full max-w-3xl mx-auto mb-3" />
          <Shimmer className="h-20 w-3/4 max-w-2xl mx-auto mb-10" />
          <Shimmer className="h-5 w-full max-w-xl mx-auto mb-2" />
          <Shimmer className="h-5 w-2/3 max-w-md mx-auto mb-10" />
          <div className="flex items-center justify-center gap-4">
            <Shimmer className="h-12 w-36 rounded-xl" />
            <Shimmer className="h-12 w-36 rounded-xl" />
          </div>
        </div>
      </section>
      <section className="border-y border-white/5 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Shimmer className="h-9 w-16 mx-auto mb-2" />
              <Shimmer className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Shimmer className="h-10 w-96 mx-auto mb-4" />
          <Shimmer className="h-4 w-80 mx-auto mb-16" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <Shimmer className="h-11 w-11 rounded-xl mb-4" />
                <Shimmer className="h-5 w-28 mb-2" />
                <Shimmer className="h-3 w-full mb-1" />
                <Shimmer className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * LeaderboardListSkeleton — shimmer rows for an individual leaderboard card
 * while its data source loads (used inside Leaderboard.jsx).
 */
export function LeaderboardListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
          <Shimmer className="h-6 w-6 rounded-full" />
          <div className="flex-1">
            <Shimmer className="h-4 w-32 mb-1" />
            <Shimmer className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * AnalyticsBarSkeleton — shimmer bars for analytics sections.
 */
export function AnalyticsBarSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <Shimmer className="h-3 w-full mb-1" />
          <Shimmer className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}