import React from "react";
import SectionCard from "./SectionCard";
import { Shield, Activity, ArrowRight } from "lucide-react";
import { openMetricDrawer } from "@/lib/metricDrawerStore";

const METRIC_MAP = {
  architectureHealth: "architecture_governance",
  experienceScore: "experience_engine",
  performanceScore: "performance",
  securityScore: "security_score",
  reliability: "engineering_reliability",
  deploymentConfidence: "engineering_deployment_confidence",
  technicalDebt: "technical_debt",
  recurringIssues: "engineering_recurring_issues",
};

function HealthMetric({ label, value, unit, score, metricId }) {
  const s = score != null ? score : 0;
  const color = s >= 90 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";

  const handleClick = () => openMetricDrawer(metricId, s, undefined, label);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`View Engineering Analysis: ${label}`}
      title="View Engineering Analysis"
      className="group text-left bg-white/[0.02] border border-white/5 rounded-lg p-3 cursor-pointer
                 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg hover:shadow-black/20
                 hover:-translate-y-0.5 transition-all duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
    >
      <div className="flex items-start justify-between mb-1">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <ArrowRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-foreground">{value}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(s, 100)}%`, backgroundColor: color }} />
      </div>
      <div className="mt-1.5 text-[9px] text-white/20 group-hover:text-indigo-400/60 transition-colors flex items-center gap-1">
        <Activity size={8} /> View Analysis
      </div>
    </button>
  );
}

export default function EngineeringHealth({ engineering }) {
  return (
    <SectionCard title="Engineering Health" subtitle="Aggregate live metrics — click any card for intelligence" icon={Shield} accent="emerald">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HealthMetric label="Architecture" value={engineering.architectureHealth} unit="%" score={engineering.architectureHealth} metricId={METRIC_MAP.architectureHealth} />
        <HealthMetric label="Experience Score" value={engineering.experienceScore} unit="/100" score={engineering.experienceScore} metricId={METRIC_MAP.experienceScore} />
        <HealthMetric label="Performance" value={engineering.performanceScore} unit="%" score={engineering.performanceScore} metricId={METRIC_MAP.performanceScore} />
        <HealthMetric label="Security" value={engineering.securityScore} unit="%" score={engineering.securityScore} metricId={METRIC_MAP.securityScore} />
        <HealthMetric label="Reliability" value={engineering.reliability} unit="%" score={engineering.reliability} metricId={METRIC_MAP.reliability} />
        <HealthMetric label="Deployment Confidence" value={engineering.deploymentConfidence} unit="%" score={engineering.deploymentConfidence} metricId={METRIC_MAP.deploymentConfidence} />
        <HealthMetric label="Technical Debt" value={engineering.technicalDebt} unit="items" score={Math.max(0, 100 - engineering.technicalDebt * 5)} metricId={METRIC_MAP.technicalDebt} />
        <HealthMetric label="Recurring Issues" value={engineering.recurringIssues} unit="items" score={Math.max(0, 100 - engineering.recurringIssues * 10)} metricId={METRIC_MAP.recurringIssues} />
      </div>
      {(engineering.guardianPending > 0 || engineering.manifestErrors > 0 || engineering.safeMode) && (
        <div className="mt-3 flex items-center gap-3 text-[11px] text-white/40">
          {engineering.safeMode && <span className="text-red-400">⚠ Safe mode active</span>}
          {engineering.guardianPending > 0 && <span className="text-amber-400">⚠ {engineering.guardianPending} Guardian pending</span>}
          {engineering.manifestErrors > 0 && <span className="text-red-400">⚠ {engineering.manifestErrors} manifest errors</span>}
        </div>
      )}
    </SectionCard>
  );
}