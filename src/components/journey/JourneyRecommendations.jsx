import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Clock, Sparkles } from "lucide-react";

/**
 * JourneyRecommendations — AI-powered recommendations for fastest path
 * to the next journey level.
 * Props: recommendations (array), level (object), estimatedDays (number|null)
 */
export default function JourneyRecommendations({ recommendations = [], level, estimatedDays }) {
  if (!level?.next) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/15 rounded-xl p-6 text-center">
        <Sparkles size={28} className="mx-auto text-purple-400 mb-3" />
        <h3 className="text-white font-semibold text-sm mb-1">Legacy Leader Achieved</h3>
        <p className="text-white/40 text-xs">You've reached the pinnacle of the Executive Journey. Continue mentoring and building your legacy.</p>
      </div>
    );
  }

  const totalPotential = recommendations.reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Fastest Path to {level.next.title}</h3>
        </div>
        {estimatedDays != null && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium">
            <Clock size={12} /> ~{estimatedDays} days
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
          <span>{level.current.title}</span>
          <span>{level.pointsToNext.toLocaleString()} points to {level.next.title}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${level.progress}%` }} />
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-white/40 text-xs text-center py-4">All recommendations complete. Keep up the great work!</p>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.activity}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.25) }}
            >
              <Link
                to={rec.path}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-3 py-2.5 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">{rec.icon}</span>
                  <span className="text-white/70 text-sm truncate">{rec.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">+{rec.points}</span>
                  <ArrowRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {totalPotential > 0 && (
        <p className="text-white/30 text-xs mt-3 text-center">
          Complete all for +{totalPotential} Journey Points
        </p>
      )}
    </div>
  );
}