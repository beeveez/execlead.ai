import React, { useMemo } from "react";
import { Target, TrendingUp, Clock, ShieldCheck, AlertTriangle, Activity, Layers, Zap, Gauge, Calendar, User, GitMerge } from "lucide-react";
import { computeEngineeringSummary } from "@/lib/foundationCertificationEngine";

export default function EngineeringSummary({ cert }) {
  const summary = useMemo(() => computeEngineeringSummary(cert), [cert]);

  const trendIcon = summary.trend.direction === "up" ? "↗" : summary.trend.direction === "down" ? "↘" : "→";
  const trendColor = summary.trend.direction === "up" ? "#10b981" : summary.trend.direction === "down" ? "#ef4444" : "#f59e0b";
  const confidenceColor = summary.confidence === "High" ? "#10b981" : summary.confidence === "Medium" ? "#f59e0b" : "#ef4444";

  const fields = [
    { label: "Current Score", value: `${summary.currentScore}%`, icon: Target, color: "#818cf8" },
    { label: "Certification Target", value: `${summary.certificationTarget}%`, icon: ShieldCheck, color: "#10b981" },
    { label: "Production Target", value: `${summary.productionTarget}%`, icon: Zap, color: "#f59e0b" },
    { label: "Remaining Points", value: `${summary.remainingPoints} pts`, icon: TrendingUp, color: "#ef4444" },
    { label: "Remaining Tasks", value: summary.remainingTasks, icon: AlertTriangle, color: "#f59e0b" },
    { label: "Estimated Hours", value: `${summary.estimatedHours}h`, icon: Clock, color: "#60a5fa" },
    { label: "Current Trend", value: `${trendIcon} ${summary.trend.label}`, icon: Activity, color: trendColor },
    { label: "Confidence", value: summary.confidence, icon: Gauge, color: confidenceColor },
    { label: "Blocking Domains", value: summary.blockingDomainCount, icon: Layers, color: "#ef4444" },
    { label: "Last Verification", value: summary.lastVerification, icon: Calendar, color: "#64748b" },
    { label: "Next Verification", value: summary.nextVerification, icon: Calendar, color: "#64748b" },
    { label: "Engineering Owner", value: summary.engineeringOwner, icon: User, color: "#818cf8" },
    { label: "RC Status", value: summary.releaseCandidateStatus, icon: GitMerge, color: summary.releaseCandidateStatus === "GO" ? "#10b981" : "#f59e0b" },
    { label: "Max Potential", value: `${summary.maxPotentialScore}%`, icon: Zap, color: "#a78bfa" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Engineering Summary™</h3>
        <span className="text-[10px] text-white/30 ml-auto">All values computed from live telemetry</span>
      </div>

      {/* Three-tier progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2 text-[10px]">
          <span className="text-indigo-400 font-medium">Current: {summary.currentScore}%</span>
          <span className="text-emerald-400 font-medium">Certification: {summary.certificationTarget}%</span>
          <span className="text-amber-400 font-medium">Production Excellence: {summary.productionTarget}%</span>
        </div>
        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
          {/* Current progress */}
          <div className="absolute h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${summary.currentScore}%` }} />
          {/* Certification threshold marker */}
          <div className="absolute h-full w-0.5 bg-emerald-400" style={{ left: `${summary.certificationTarget}%` }} />
          {/* Production target marker */}
          <div className="absolute h-full w-0.5 bg-amber-400" style={{ left: "99.5%" }} />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[9px] text-white/30">
          <span>0%</span>
          <span className="text-emerald-400/50">{summary.remainingPoints} pts to certification</span>
          <span className="text-amber-400/50">{summary.productionRemainingPoints} pts to production</span>
          <span>100%</span>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {fields.map((f) => (
          <div key={f.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <f.icon size={10} style={{ color: f.color }} />
              <span className="text-[9px] text-white/40 uppercase tracking-wider truncate">{f.label}</span>
            </div>
            <div className="text-sm font-bold" style={{ color: f.color }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}