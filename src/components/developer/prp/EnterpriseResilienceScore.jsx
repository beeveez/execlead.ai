import React from "react";
import { Award, TrendingUp } from "lucide-react";
import { ENTERPRISE_RESILIENCE_DIMENSIONS, ENTERPRISE_RESILIENCE_SCORE, ERS_MATURITY_LEVELS, getErsLevel } from "@/lib/performanceResilienceEngine";

const maturity = getErsLevel(ENTERPRISE_RESILIENCE_SCORE);
const nextLevel = ERS_MATURITY_LEVELS[maturity.level + 1];
const gap = nextLevel ? nextLevel.minScore - ENTERPRISE_RESILIENCE_SCORE : 0;

export default function EnterpriseResilienceScore() {
  return (
    <div className="space-y-4">
      {/* ERS Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="75" cy="75" r="65" fill="none" stroke={maturity.color} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 65 * (ENTERPRISE_RESILIENCE_SCORE / 100)} ${2 * Math.PI * 65}`}
                strokeLinecap="round" transform="rotate(-90 75 75)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{ENTERPRISE_RESILIENCE_SCORE}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">ERS Score</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <Award size={20} className="text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Enterprise Resilience Score™</h2>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: maturity.color }}>
              {maturity.short} — {maturity.name}
            </div>
            <p className="text-sm text-white/50">
              {nextLevel
                ? `${gap} points to ${nextLevel.name} (L${nextLevel.level}). Focus on weakest dimensions below.`
                : "Maximum maturity level achieved."}
            </p>
          </div>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">10 Resilience Dimensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ENTERPRISE_RESILIENCE_DIMENSIONS.map((d) => {
            const color = d.score >= 80 ? "#10b981" : d.score >= 70 ? "#f59e0b" : "#ef4444";
            return (
              <div key={d.id} className="bg-white/[0.02] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/70">{d.label}</span>
                  <span className="text-[10px] text-white/30">{d.weight}% weight</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${d.score}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-sm font-bold text-white w-10 text-right">{d.score}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{d.rationale}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maturity Roadmap */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Maturity Roadmap</h3>
        <div className="flex items-center justify-between gap-1">
          {ERS_MATURITY_LEVELS.map((l) => {
            const isActive = l.level === maturity.level;
            const isPassed = l.level < maturity.level;
            return (
              <div key={l.level} className="flex-1 text-center">
                <div
                  className="w-10 h-10 mx-auto rounded-full border-2 flex items-center justify-center mb-1"
                  style={{
                    borderColor: isActive || isPassed ? l.color : "rgba(255,255,255,0.1)",
                    backgroundColor: isActive ? `${l.color}20` : isPassed ? `${l.color}10` : "transparent",
                  }}
                >
                  <span className="text-[10px] font-bold" style={{ color: isActive || isPassed ? l.color : "rgba(255,255,255,0.3)" }}>{l.short}</span>
                </div>
                <div className="text-[9px]" style={{ color: isActive ? l.color : "rgba(255,255,255,0.3)" }}>{l.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}