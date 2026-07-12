import React from "react";
import { Gauge, TrendingUp, ArrowUp } from "lucide-react";
import { TRUST_SCORECARD_DIMENSIONS } from "@/lib/trustCenterExtendedData";

const TIER_COLORS = {
  "Enterprise Ready": "#10b981",
  "Strong": "#06b6d4",
  "Developing": "#f59e0b",
  "Early Stage": "#ef4444",
};

export default function TrustScorecard({ trustScore }) {
  const { overall, tier, trend, dimensions } = trustScore;
  const tierColor = TIER_COLORS[tier] || "#64748b";
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (overall / 100) * circumference;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Gauge size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Enterprise Trust Score™</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={tierColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{overall}</span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">out of 100</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-sm font-bold mb-1" style={{ color: tierColor }}>{tier}</div>
            <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1"><TrendingUp size={12} className="text-emerald-400" /> Trend: +{trend}</span>
              <span className="flex items-center gap-1"><ArrowUp size={12} className="text-emerald-400" /> Since last release: +{trend}</span>
            </div>
            <p className="text-[10px] text-white/30 mt-2 max-w-sm">
              Computed from 8 weighted dimensions using live platform telemetry. Not manually curated.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-4">Dimension Breakdown</div>
        <div className="space-y-3">
          {dimensions.map((d) => (
            <div key={d.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">{d.label}</span>
                  <span className="text-[9px] text-white/20">({d.weight}% weight)</span>
                </div>
                <span className="text-xs font-bold" style={{ color: d.score >= 80 ? "#10b981" : d.score >= 50 ? "#f59e0b" : "#ef4444" }}>{d.score}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.score}%`, backgroundColor: d.score >= 80 ? "#10b981" : d.score >= 50 ? "#f59e0b" : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}