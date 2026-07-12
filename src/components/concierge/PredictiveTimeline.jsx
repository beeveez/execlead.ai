import React from "react";
import { TrendingUp, ArrowRight } from "lucide-react";

function confColor(v) {
  if (v >= 80) return "#10b981";
  if (v >= 60) return "#f59e0b";
  if (v >= 40) return "#f97316";
  return "#ef4444";
}

const STAGES = [
  { key: "current", label: "Current", color: "#6366f1" },
  { key: "30_days", label: "30 Days", color: "#8b5cf6" },
  { key: "90_days", label: "90 Days", color: "#a855f7" },
  { key: "1_year", label: "1 Year", color: "#d946ef" },
  { key: "3_years", label: "3 Years", color: "#ec4899" },
  { key: "5_years", label: "5 Years", color: "#f43f5e" },
];

function StageCard({ stage, data }) {
  if (!data) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2 min-w-[120px] flex-shrink-0">
      <div className="text-[10px] font-bold mb-1" style={{ color: stage.color }}>{stage.label}</div>
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span className="text-[9px] text-muted-foreground">Readiness</span>
          <span className="text-[9px] font-bold" style={{ color: confColor(data.readiness || 0) }}>{data.readiness || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-muted-foreground">Promotion</span>
          <span className="text-[9px] font-bold" style={{ color: confColor(data.promotion_probability || 0) }}>{data.promotion_probability || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-muted-foreground">Journey</span>
          <span className="text-[9px] font-medium text-foreground">{(data.journey || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-muted-foreground">Salary</span>
          <span className="text-[9px] font-medium text-foreground truncate ml-1">{data.salary || "—"}</span>
        </div>
        {data.leadership_growth && (
          <div className="text-[9px] text-muted-foreground italic mt-0.5">{data.leadership_growth}</div>
        )}
      </div>
    </div>
  );
}

export default function PredictiveTimeline({ timeline }) {
  if (!timeline) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <TrendingUp size={12} className="text-indigo-500" />
        <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wide">Predictive Outcomes™</h4>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage.key}>
            <StageCard stage={stage} data={timeline[stage.key]} />
            {i < STAGES.length - 1 && <ArrowRight size={10} className="text-muted-foreground flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground italic">
        Predictions are AI-generated estimates based on current evidence and trajectory. Actual outcomes depend on execution, market conditions, and continuous development.
      </p>
    </div>
  );
}