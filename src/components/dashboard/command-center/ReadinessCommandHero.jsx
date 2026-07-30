import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Calendar, Gauge } from "lucide-react";

/**
 * ReadinessCommandHero — the first thing every user sees.
 * Answers "Where am I today?" + "How much have I improved?"
 *
 * Shows: Current Readiness Score, Trend, Weekly Progress, Monthly Progress.
 */
export default function ReadinessCommandHero({ command }) {
  const score = command?.readinessScore || 0;
  const trend = command?.readinessTrend || "Stable";
  const weekly = command?.weeklyProgress;
  const monthly = command?.monthlyProgress;
  const daily = command?.dailyDelta;

  const TrendIcon = trend === "Improving" ? TrendingUp : trend === "Declining" ? TrendingDown : Minus;
  const trendColor = trend === "Improving" ? "text-emerald-400" : trend === "Declining" ? "text-rose-400" : "text-white/40";

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6">
        {/* Score ring */}
        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="url(#cmdGrad)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="cmdGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{score}</span>
              <span className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">Ready</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Executive Readiness Score™</p>
            <h2 className="text-white font-bold text-lg">Become Executive Ready</h2>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendIcon size={14} className={trendColor} />
              <span className={`text-sm font-medium ${trendColor}`}>{trend}</span>
              <span className="text-white/20 text-xs">·</span>
              <Gauge size={12} className="text-indigo-400" />
              <span className="text-white/40 text-xs">Confidence: {command?.readinessConfidence}</span>
            </div>
            {command?.estimatedMonths > 0 && (
              <p className="text-white/40 text-xs mt-1.5">Estimated readiness in <span className="text-cyan-400 font-medium">{command.estimatedMonths} months</span></p>
            )}
          </div>
        </div>

        {/* Progress deltas */}
        <div className="hidden lg:block w-px bg-white/5" />
        <div className="grid grid-cols-3 gap-3 flex-1 w-full">
          <ProgressTile label="vs Yesterday" value={daily} icon={Calendar} />
          <ProgressTile label="Weekly Progress" value={weekly} icon={TrendingUp} accent="emerald" />
          <ProgressTile label="Monthly Progress" value={monthly} icon={TrendingUp} accent="indigo" />
        </div>
      </div>
    </div>
  );
}

function ProgressTile({ label, value, icon: Icon, accent }) {
  const has = value != null;
  const positive = has && value > 0;
  const negative = has && value < 0;
  const color = !has ? "text-white/30" : positive ? "text-emerald-400" : negative ? "text-rose-400" : "text-white/50";
  const ring = accent === "emerald" ? "text-emerald-400" : accent === "indigo" ? "text-indigo-400" : "text-white/40";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className={ring} />
        <span className="text-white/40 text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl font-bold mt-2 ${color}`}>
        {has ? `${value > 0 ? "+" : ""}${value}` : "—"}
      </div>
    </div>
  );
}