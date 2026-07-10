import React from "react";
import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { STREAK_CATEGORIES } from "@/lib/journeyEngine";

/**
 * JourneyStreaks — displays current and best streaks by category.
 * Props: streaks (object from backend)
 */
export default function JourneyStreaks({ streaks = {} }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-white font-semibold text-sm">Journey Streaks</h3>
        <p className="text-white/30 text-xs">Consistency compounds. Maintain your streaks to maximize growth.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STREAK_CATEGORIES.map((cat, i) => {
          const data = streaks[cat.id] || { current: 0, best: 0 };
          const isActive = data.current > 0;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className={`rounded-xl p-4 border transition-all ${
                isActive
                  ? "bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/15"
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{cat.icon}</span>
                <h4 className="text-white/80 text-xs font-medium">{cat.label}</h4>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className={isActive ? "text-orange-400" : "text-white/20"} />
                    <span className={`text-2xl font-bold ${isActive ? "text-white" : "text-white/30"}`}>{data.current}</span>
                    <span className="text-white/30 text-xs">weeks</span>
                  </div>
                  <p className="text-white/25 text-[10px] mt-0.5">Current</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Trophy size={12} className="text-amber-400/60" />
                    <span className="text-white/60 text-sm font-bold">{data.best}</span>
                  </div>
                  <p className="text-white/25 text-[10px] mt-0.5">Best</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}