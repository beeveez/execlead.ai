import React from "react";
import SectionCard from "./SectionCard";
import { Shield, Activity } from "lucide-react";

function HealthMetric({ label, value, unit, score }) {
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#6366f1" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-[10px] text-white/30">{unit}</span>}
      </div>
      <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(score, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function EngineeringHealth({ engineering }) {
  return (
    <SectionCard title="Engineering Health" subtitle="Aggregate live metrics" icon={Shield} accent="emerald">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HealthMetric label="Architecture" value={engineering.architectureHealth} unit="%" score={engineering.architectureHealth} />
        <HealthMetric label="Experience Score" value={engineering.experienceScore} unit="/100" score={engineering.experienceScore} />
        <HealthMetric label="Performance" value={engineering.performanceScore} unit="%" score={engineering.performanceScore} />
        <HealthMetric label="Security" value={engineering.securityScore} unit="%" score={engineering.securityScore} />
        <HealthMetric label="Reliability" value={engineering.reliability} unit="%" score={engineering.reliability} />
        <HealthMetric label="Deployment Confidence" value={engineering.deploymentConfidence} unit="%" score={engineering.deploymentConfidence} />
        <HealthMetric label="Technical Debt" value={engineering.technicalDebt} unit="items" score={Math.max(0, 100 - engineering.technicalDebt * 5)} />
        <HealthMetric label="Recurring Issues" value={engineering.recurringIssues} unit="items" score={Math.max(0, 100 - engineering.recurringIssues * 10)} />
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