import React from "react";
import Panel from "./Panel";
import { HeartPulse } from "lucide-react";
import { fmtPct } from "@/lib/aiOperations";

const FACTOR_LABELS = {
  availability: "Availability", latency: "Latency", errorRate: "Error Resilience",
  providerHealth: "Provider Health", tokenProcessing: "Token Processing", budget: "Budget Status",
};

export default function HealthScore({ analytics, budgetState }) {
  const score = analytics.health.score;
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  const label = score >= 90 ? "Excellent" : score >= 70 ? "Fair" : "Critical";
  const factors = { ...analytics.health.factors, budget: budgetState.status === "exceeded" ? 40 : budgetState.status === "warning" ? 70 : 100 };

  return (
    <Panel title="AI Health Score" icon={HeartPulse}>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ffffff10" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(score / 100) * 97.4} 97.4`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[9px] text-white/30">/ 100</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Platform Health</div>
          <div className="text-xs" style={{ color }}>{label}</div>
          <div className="text-[10px] text-white/30 mt-1">Composite of availability, latency,<br />errors, providers & budget</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {Object.entries(factors).map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="text-white/40">{FACTOR_LABELS[k] || k}</span>
              <span className="text-white/60">{fmtPct(v)}</span>
            </div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, v)}%`, backgroundColor: v >= 90 ? "#10b981" : v >= 60 ? "#f59e0b" : "#ef4444" }} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}