import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
import { checkAchievements } from "@/lib/gamification";

export default function RecentAchievements({ profile }) {
  const unlocked = useMemo(() => checkAchievements(profile), [profile]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Achievements</h2>
        </div>
        <span className="text-xs text-white/30">{unlocked.length} unlocked</span>
      </div>
      {unlocked.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-white/30 text-sm">No achievements yet</p>
          <p className="text-white/20 text-xs mt-1">Complete challenges to unlock your first badge</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {unlocked.slice(0, 4).map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center hover:border-amber-500/20 transition-colors">
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className="text-white/70 text-xs font-medium truncate">{a.name}</p>
              <p className="text-amber-400 text-[10px] mt-0.5">+{a.xp} XP</p>
            </motion.div>
          ))}
        </div>
      )}
      <Link to="/analytics" className="flex items-center gap-1 text-amber-400 text-xs mt-3 hover:gap-2 transition-all">
        View All <ArrowRight size={10} />
      </Link>
    </div>
  );
}