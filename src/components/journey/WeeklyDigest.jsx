import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award } from "lucide-react";

/**
 * WeeklyDigest — weekly executive summary of journey progress.
 * Props: digest (object from backend)
 */
export default function WeeklyDigest({ digest }) {
  if (!digest) return null;

  const { weekPoints, weekActivities, breakdown, percentToNext, nextLevel, currentLevel } = digest;

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/15 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Weekly Executive Digest</h3>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">+{weekPoints}</div>
          <div className="text-white/30 text-xs">Points This Week</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{weekActivities}</div>
          <div className="text-white/30 text-xs">Activities Completed</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold text-indigo-400">{percentToNext}%</div>
          <div className="text-white/30 text-xs">To {nextLevel || "Max"}</div>
        </div>
      </div>

      {/* Progress to next level */}
      {nextLevel && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
            <span>{currentLevel}</span>
            <span>{nextLevel}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentToNext}%` }}
              transition={{ duration: 0.7 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
          <p className="text-white/40 text-xs mt-2 text-center">
            You are now {percentToNext}% toward {nextLevel}.
          </p>
        </div>
      )}

      {/* Breakdown by activity */}
      {breakdown && breakdown.length > 0 ? (
        <div>
          <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">This Week's Activities</h4>
          <div className="space-y-1.5">
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <TrendingUp size={12} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-white/60 text-xs truncate">{item.label}</span>
                  <span className="text-white/30 text-xs">×{item.count}</span>
                </div>
                <span className="text-emerald-400 text-xs font-medium flex-shrink-0">+{item.points}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-white/30 text-xs text-center py-3">No activities this week. Start something today!</p>
      )}
    </div>
  );
}