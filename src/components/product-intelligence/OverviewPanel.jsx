import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatCard, ScoreRing } from "./Shared";

export default function OverviewPanel({ data }) {
  if (!data) return null;
  const { executiveKPIs, overallScore } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <ScoreRing score={overallScore} label="Product Intelligence Score™" color={overallScore >= 70 ? "#10b981" : overallScore >= 40 ? "#f59e0b" : "#ef4444"} />
        <div>
          <h2 className="text-lg font-bold text-white">Overall Customer Success Score</h2>
          <p className="text-white/40 text-sm mt-1 max-w-md">
            Measures whether EXECLEAD.AI is creating better leaders — not just whether the software works.
            {overallScore >= 70 ? " Platform is delivering strong customer value." : overallScore >= 40 ? " Room for improvement in customer outcomes." : " Customer success requires immediate attention."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {executiveKPIs.map((kpi) => (
          <StatCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            sublabel={kpi.sub}
            color={kpi.score >= 70 ? "emerald" : kpi.score >= 40 ? "amber" : "red"}
          />
        ))}
      </div>
    </div>
  );
}