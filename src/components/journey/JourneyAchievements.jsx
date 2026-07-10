import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { mergeAchievements } from "@/lib/journeyEngine";

/**
 * JourneyAchievements — badge grid showing unlocked & locked achievements.
 * Props: achievements (array of { id, unlocked } from backend)
 */
export default function JourneyAchievements({ achievements = [] }) {
  const merged = mergeAchievements(achievements);
  const unlocked = merged.filter((a) => a.unlocked);
  const locked = merged.filter((a) => !a.unlocked);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">Achievements</h3>
          <p className="text-white/30 text-xs">{unlocked.length} of {merged.length} unlocked</p>
        </div>
        <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${(unlocked.length / merged.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {merged.map((ach, i) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
            className={`relative rounded-xl p-4 border text-center transition-all ${
              ach.unlocked
                ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20"
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}
          >
            <div className="text-3xl mb-2">
              {ach.unlocked ? ach.icon : <Lock size={24} className="mx-auto text-white/20" />}
            </div>
            <h4 className={`text-xs font-medium mb-1 ${ach.unlocked ? "text-white" : "text-white/40"}`}>{ach.name}</h4>
            <p className="text-white/30 text-[10px] leading-tight">{ach.description}</p>
            {ach.unlocked && ach.points > 0 && (
              <span className="inline-block mt-2 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/10 text-emerald-400">
                +{ach.points} JP
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}