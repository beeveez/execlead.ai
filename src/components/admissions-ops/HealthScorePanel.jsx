import React from "react";
import { ShieldCheck, Clock, Users, List, Mail, Check, Bell, Shield } from "lucide-react";

const FACTOR_ICONS = { clock: Clock, users: Users, list: List, mail: Mail, check: Check, bell: Bell, shield: Shield };

export default function HealthScorePanel({ healthScore }) {
  if (!healthScore) return null;
  const score = healthScore.overall;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Attention" : "Critical";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-white/70">Executive Health Score™ — Admissions Health</h3>
      </div>

      <div className="flex items-center gap-6 p-5 rounded-xl bg-white/[0.02] border border-white/5">
        {/* Score Ring */}
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="48" cy="48" r="42" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 - (score / 100) * 2 * Math.PI * 42} className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[8px] text-white/30 uppercase tracking-wider">{label}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-white/70 font-medium">Overall Admissions Health</div>
          <p className="text-xs text-white/40 mt-1">Weighted score across 7 operational factors. Target: 80+</p>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {healthScore.factors.map((factor, i) => {
          const Icon = FACTOR_ICONS[factor.icon] || Shield;
          const fColor = factor.score >= 80 ? "#10b981" : factor.score >= 60 ? "#f59e0b" : "#ef4444";
          return (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <Icon size={12} className="text-white/40" />
                <span className="text-[9px] text-white/30">{factor.weight}</span>
              </div>
              <div className="text-lg font-bold" style={{ color: fColor }}>{factor.score}</div>
              <div className="text-[9px] text-white/30">{factor.label}</div>
              <div className="w-full h-1 rounded-full bg-white/5 mt-1.5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${factor.score}%`, background: fColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}