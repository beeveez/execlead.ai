import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";

/**
 * ReadinessHero — large circular Executive Readiness™ visualization.
 * Shows current, previous, 30-day trend, best, and target scores.
 */
export default function ReadinessHero({ readiness }) {
  if (!readiness) return null;
  const score = readiness.overallScore || 0;
  const trend = readiness.trend === "up" ? 1 : readiness.trend === "down" ? -1 : 0;
  const previous = Math.max(0, score - (readiness.trendDelta || 0));
  const best = Math.max(score, readiness.bestScore || score);
  const target = readiness.targetScore || 85;
  const percentile = readiness.percentile || (score >= 80 ? 12 : score >= 60 ? 35 : score >= 40 ? 60 : 85);

  const label = score >= 80 ? "Excellent" : score >= 60 ? "Strong" : score >= 40 ? "Developing" : "Early Stage";
  const labelColor = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-indigo-400" : score >= 40 ? "text-amber-400" : "text-white/50";

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular viz */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" stroke="url(#heroGrad)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
            <span className="text-white/30 text-[10px]">Top {percentile}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 flex-1 w-full">
          <Stat icon={TrendingUp} label="Previous" value={`${previous}%`} color="text-white/60" />
          <Stat icon={trend >= 0 ? TrendingUp : TrendingDown} label="30-Day Trend" value={`${trend >= 0 ? "+" : ""}${readiness.trendDelta || 0}%`} color={trend >= 0 ? "text-emerald-400" : "text-red-400"} />
          <Stat icon={Award} label="Best Score" value={`${best}%`} color="text-amber-400" />
          <Stat icon={Target} label="Target" value={`${target}%`} color="text-cyan-400" />
        </div>
      </div>

      {readiness.estimatedMonths > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 text-center text-xs text-white/40">
          Estimated <span className="text-cyan-400 font-medium">{readiness.estimatedMonths} months</span> to target readiness · Confidence: <span className="text-emerald-400 font-medium">{readiness.confidence}</span>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
      <Icon size={14} className={`mx-auto mb-1 ${color}`} />
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}