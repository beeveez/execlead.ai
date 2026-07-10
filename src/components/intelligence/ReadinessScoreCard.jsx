import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Target, Briefcase } from "lucide-react";

/**
 * ReadinessScoreCard — hero card showing the Executive Readiness score
 * with current role, target role, estimated months, confidence, and trend.
 */
export default function ReadinessScoreCard({ readiness, profile }) {
  if (!readiness) return null;
  const { overallScore, estimatedMonths, confidence, trend } = readiness;

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Score circle */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="url(#readinessGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overallScore / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{overallScore}%</span>
              <span className="text-white/30 text-[9px] uppercase tracking-wider">Ready</span>
            </div>
          </div>
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Executive Readiness</p>
            <h2 className="text-white font-bold text-xl">{profile?.current_role || "Current Role"}</h2>
            <div className="flex items-center gap-1.5 text-white/50 text-sm mt-1">
              <Target size={12} className="text-indigo-400" />
              <span>Target: <span className="text-white/80 font-medium">{profile?.target_role || "—"}</span></span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
          <Stat icon={Clock} label="Est. Readiness" value={estimatedMonths > 0 ? `${estimatedMonths} mo` : "Ready"} color="text-cyan-400" />
          <Stat icon={TrendingUp} label="Confidence" value={confidence} color="text-emerald-400" />
          <Stat icon={Briefcase} label="Trend" value={trend} color="text-indigo-400" />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center">
      <Icon size={14} className={`mx-auto mb-1 ${color}`} />
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}