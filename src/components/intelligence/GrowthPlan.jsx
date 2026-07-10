import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight, TrendingUp } from "lucide-react";

/**
 * GrowthPlan — "What To Do Next" optimized growth plan.
 * Shows recommended activities with Journey Points and estimated
 * Executive Readiness impact after completion.
 */
export default function GrowthPlan({ recommendations = [], readiness }) {
  const currentScore = readiness?.overallScore || 0;
  const totalPoints = recommendations.reduce((sum, r) => sum + (r.points || 0), 0);
  const estimatedGain = Math.min(100 - currentScore, recommendations.length * 2);
  const projectedScore = Math.min(100, currentScore + estimatedGain);

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">What To Do Next</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          <TrendingUp size={12} />
          {currentScore}% → {projectedScore}%
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-white/30 mb-1">
          <span>Current: {currentScore}%</span>
          <span>After completion: {projectedScore}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${projectedScore}%` }} />
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-white/40 text-xs text-center py-4">All recommendations complete. Keep up the great work!</p>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <motion.div key={rec.activity || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.05, 0.25) }}>
              <Link to={rec.path} className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-3 py-2.5 transition-all group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">{rec.icon}</span>
                  <div className="min-w-0">
                    <span className="text-white/70 text-sm truncate block">{rec.label}</span>
                    <span className="text-emerald-400/60 text-[10px]">+{Math.max(1, Math.round(rec.gain || 2))}% readiness</span>
                  </div>
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

      {totalPoints > 0 && (
        <p className="text-white/30 text-xs mt-3 text-center">Complete all for +{totalPoints} Journey Points and +{estimatedGain}% readiness</p>
      )}
    </div>
  );
}