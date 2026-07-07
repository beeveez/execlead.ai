import React from "react";
import { LeaderboardListSkeleton } from "@/components/marketing/Shimmer";

/**
 * Reusable card wrapper for a leaderboard section.
 * Handles the loading skeleton and empty state so each section
 * stays declarative.
 */
export default function LeaderboardSection({ icon: Icon, iconColor, title, subtitle, loading, empty, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={15} className={iconColor || "text-indigo-400"} />}
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">{title}</h3>
      </div>
      {subtitle && <p className="text-white/30 text-xs mb-3">{subtitle}</p>}
      {loading ? (
        <LeaderboardListSkeleton />
      ) : empty ? (
        <p className="text-white/30 text-sm text-center py-8">{empty}</p>
      ) : (
        children
      )}
    </div>
  );
}