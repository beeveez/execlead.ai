import React from "react";
import { CheckCircle2, AlertTriangle, Wrench, FileDown, X } from "lucide-react";
import { getHealthLabel, getHealthColor, exportValidationReport } from "@/lib/selfHealingEngine";

const HIGHLIGHT_COLORS = {
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  orange: "text-orange-500",
  red: "text-red-500",
};

export default function SelfHealingReport({ type, data, onStartRepair, onReview, onCancel, onDone }) {
  if (type === "analysis") {
    return <AnalysisReport data={data} onStartRepair={onStartRepair} onReview={onReview} onCancel={onCancel} />;
  }
  return <RepairComplete data={data} onReview={onReview} onDone={onDone} />;
}

function AnalysisReport({ data, onStartRepair, onReview, onCancel }) {
  const healthLabel = getHealthLabel(data.healthScore);
  const healthColor = getHealthColor(data.healthScore);
  const colorClass = HIGHLIGHT_COLORS[healthColor];

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-500" />
        <h3 className="text-sm font-bold text-foreground">Platform Analysis Complete</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ReportStat label="Total Findings" value={data.totalFindings} />
        <ReportStat label="Safe Auto Repairs" value={data.safeCount} highlight="emerald" />
        <ReportStat label="Require Review" value={data.reviewCount} highlight={data.reviewCount > 0 ? "amber" : null} />
        <ReportStat label="Est. Repair Time" value={`${data.estimatedRepairTime}s`} />
        <ReportStat label="Coverage" value={`${data.coverage}%`} />
        <ReportStat label="Health Score" value={`${data.healthScore}/100`} highlight={healthColor} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/50">
        <span className="text-xs text-muted-foreground">Platform Health:</span>
        <span className={`text-xs font-medium ${colorClass}`}>{healthLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onStartRepair}
          disabled={data.safeCount === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
        >
          <Wrench size={12} /> Start Auto-Repair ({data.safeCount})
        </button>
        <button
          onClick={() => exportValidationReport(data)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors"
        >
          <FileDown size={12} /> Export
        </button>
        <button
          onClick={onReview}
          disabled={data.reviewCount === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40"
        >
          <AlertTriangle size={12} /> Review ({data.reviewCount})
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-xs hover:text-foreground transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function RepairComplete({ data, onReview, onDone }) {
  const coverageImproved = data.coverageAfter > data.coverageBefore;
  const healthImproved = data.healthAfter > data.healthBefore;
  const healthColor = getHealthColor(data.healthAfter);
  const colorClass = HIGHLIGHT_COLORS[healthColor];

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-500" />
        <h3 className="text-sm font-bold text-foreground">Repair Complete</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ReportStat label="Issues Repaired" value={data.issuesRepaired} highlight="emerald" />
        <ReportStat label="Remaining Issues" value={data.remaining} highlight={data.remaining > 0 ? "amber" : null} />
        <ReportStat
          label="Coverage"
          value={`${data.coverageBefore}% → ${data.coverageAfter}%`}
          highlight={coverageImproved ? "emerald" : null}
        />
        <ReportStat
          label="Health Score"
          value={`${data.healthBefore} → ${data.healthAfter}`}
          highlight={healthImproved ? "emerald" : null}
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/50">
        <span className="text-xs text-muted-foreground">Platform Status:</span>
        <span className={`text-xs font-medium ${colorClass}`}>
          {data.remaining > 0 ? "Needs Review" : "Healthy"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {data.remaining > 0 && (
          <button
            onClick={onReview}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            <AlertTriangle size={12} /> Review Remaining ({data.remaining})
          </button>
        )}
        <button
          onClick={onDone}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <CheckCircle2 size={12} /> Done
        </button>
      </div>
    </div>
  );
}

function ReportStat({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-background/50">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? HIGHLIGHT_COLORS[highlight] : "text-foreground"}`}>{value}</span>
    </div>
  );
}