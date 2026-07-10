import React from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { getTrustTier } from "@/lib/intelligenceEngine";

/**
 * TrustFramework — displays trust levels (badges), trust factors (with scores),
 * and the overall trust score.
 */
export default function TrustFramework({ trust }) {
  if (!trust) return null;
  const { levels, factors, totalScore, tier } = trust;
  const trustTier = getTrustTier(totalScore);

  return (
    <div className="space-y-5">
      {/* Trust score hero */}
      <div className={`bg-gradient-to-br ${trustTier.bg} to-transparent border border-white/5 rounded-xl p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Executive Trust</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold ${trustTier.color}`}>{totalScore}</span>
              <span className="text-white/30 text-lg">/ 100</span>
            </div>
            <span className={`text-sm font-medium ${trustTier.color}`}>{tier} Trust</span>
          </div>
          <div className="w-20 h-20 relative flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
                className={trustTier.color}
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - totalScore / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Trust Levels */}
      <div>
        <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Trust Levels</h4>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                level.unlocked
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-white/[0.02] text-white/30 border-white/5"
              }`}
            >
              <span>{level.icon}</span>
              <span className="font-medium">{level.label}</span>
              {level.unlocked ? <Check size={10} /> : <Lock size={9} />}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Factors */}
      <div>
        <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Trust Factors</h4>
        <div className="space-y-2">
          {factors.map((factor, i) => (
            <motion.div
              key={factor.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2"
            >
              <span className="text-sm">{factor.icon}</span>
              <span className="text-white/60 text-xs flex-1">{factor.label}</span>
              <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${factor.earned ? "bg-emerald-500" : "bg-white/10"}`}
                  style={{ width: `${(factor.score / factor.weight) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium w-8 text-right ${factor.earned ? "text-emerald-400" : "text-white/30"}`}>
                {factor.score}/{factor.weight}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}