import React from "react";
import { calculateERI, getBrandTier } from "@/lib/executiveReputation";
import { TrendingUp, Activity } from "lucide-react";

function TierBadge({ tier }) {
  if (!tier) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: `${tier.color}15`, color: tier.color, border: `1px solid ${tier.color}30` }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: tier.color }} />
        {tier.name}
      </div>
    </div>
  );
}

export default function ExecutiveReputationIndex({ profile }) {
  const { overall, level, tier, momentum, dimensions } = calculateERI(profile);
  const ringColor = tier?.color || "#64748b";
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (overall / 100) * circumference;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Executive Reputation Index</h3>
        </div>
        <TierBadge tier={tier} />
      </div>

      <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
        {/* Score Ring */}
        <div className="relative flex-shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
            <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="65" cy="65" r="52" fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{overall}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        {/* Level + Momentum */}
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Executive Level</div>
          <div className="text-lg font-bold text-white mb-2">{level}</div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${momentum.color}15`, color: momentum.color }}>
              <TrendingUp size={10} /> {momentum.label}
            </span>
          </div>
          {tier?.next && (
            <div className="mt-3 text-xs text-white/40">
              <span className="text-white/50">{tier.next.min - overall} points</span> to <span style={{ color: tier.next.color }}>{tier.next.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="px-5 pb-5">
        <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Breakdown</div>
        <div className="space-y-2.5">
          {dimensions.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-36 flex-shrink-0 truncate">{d.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.score}%`, background: d.score >= 75 ? "#10b981" : d.score >= 50 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <span className="text-xs font-medium text-white/40 w-8 text-right">{d.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
        <p className="text-[10px] text-white/30 leading-relaxed">
          The ERI reflects activity and profile completeness within EXECLEAD.AI. It is not a universal measure of professional ability.
        </p>
      </div>
    </div>
  );
}