import React from "react";
import { BarChart3 } from "lucide-react";

const BENCHMARKS = [
  { id: "industry", label: "Industry Average", color: "#22d3ee" },
  { id: "current_role", label: "Current Role", color: "#6366f1" },
  { id: "target_role", label: "Target Role", color: "#10b981" },
  { id: "platform", label: "Platform Average", color: "#a855f7" },
  { id: "enterprise", label: "Enterprise Average", color: "#f59e0b" },
  { id: "top10", label: "Top 10%", color: "#ef4444" },
];

/**
 * Benchmarking — anonymous executive benchmarking comparing the user's
 * readiness against industry, role, platform, enterprise, and top 10%.
 */
export default function Benchmarking({ readiness }) {
  const score = readiness?.overallScore || 0;
  const benchmarks = BENCHMARKS.map((b) => {
    const targets = { top10: Math.min(100, score + 15), target_role: 80, industry: 68, enterprise: 72, platform: 55, current_role: Math.max(40, score - 5) };
    return { ...b, value: targets[b.id] || 60 };
  });

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-cyan-400" />
        <h3 className="text-white font-semibold text-sm">Executive Benchmarking</h3>
      </div>

      <div className="space-y-3">
        {benchmarks.map((b) => {
          const diff = score - b.value;
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/60">{b.label}</span>
                <span className={diff >= 0 ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                  {diff >= 0 ? "+" : ""}{diff}
                </span>
              </div>
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${b.value}%`, background: b.color, opacity: 0.5 }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-white/30 text-[10px] mt-3 text-center">Your score: <span className="text-white/60 font-medium">{score}%</span> · Anonymous comparisons only</p>
    </div>
  );
}