import React from "react";
import { Activity, Wrench, AlertTriangle, History } from "lucide-react";
import { getHealthLabel, getHealthColor } from "@/lib/selfHealingEngine";

const COLOR_CLASSES = {
  emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  amber: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  orange: { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  red: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function SelfHealingSummary({ analysis, onAnalyze, onRepair, onReview, onHistory }) {
  const score = analysis?.healthScore ?? 0;
  const label = analysis ? getHealthLabel(score) : "Not Analyzed";
  const colorKey = analysis ? getHealthColor(score) : "red";
  const colors = COLOR_CLASSES[colorKey];

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Platform Self-Healing Engine™</h3>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${colors.bg} ${colors.border} ${colors.text}`}>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border ${colors.bg} ${colors.border}`}>
          <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <Stat label="Coverage" value={analysis ? `${analysis.coverage}%` : "—"} />
          <Stat label="Safe Repairs" value={analysis?.safeCount ?? "—"} />
          <Stat label="Reviews" value={analysis?.reviewCount ?? "—"} />
          <Stat label="Total Findings" value={analysis?.totalFindings ?? "—"} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <ActionButton icon={Activity} label="Analyze" onClick={onAnalyze} primary />
        <ActionButton icon={Wrench} label="Repair" onClick={onRepair} disabled={!analysis} />
        <ActionButton icon={AlertTriangle} label="Review" onClick={onReview} disabled={!analysis?.reviewCount} />
        <ActionButton icon={History} label="History" onClick={onHistory} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col px-2 py-1.5 rounded-md bg-background/50">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, primary, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
        disabled
          ? "bg-muted border-border text-muted-foreground/40 cursor-not-allowed"
          : primary
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
          : "bg-muted border-border text-foreground hover:bg-accent"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}