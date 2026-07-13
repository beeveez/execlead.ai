import React from "react";
import { AlertTriangle, ChevronRight, Link2, Wrench, FileText, GitBranch, ShieldCheck } from "lucide-react";
import MetadataDrawer from "../metadata/MetadataDrawer";
import SelfHealingActions from "../metadata/SelfHealingActions";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";

const DRILL_STEPS = [
  { id: "capability", label: "Capability", icon: GitBranch },
  { id: "task", label: "Engineering Task", icon: Wrench },
  { id: "evidence", label: "Evidence", icon: FileText },
  { id: "fix", label: "Fix", icon: ShieldCheck },
  { id: "verify", label: "Verify", icon: ShieldCheck },
  { id: "report", label: "Generate Report", icon: FileText },
];

export default function BlockerDrillDown({ issue, onClose }) {
  if (!issue) return null;

  return (
    <MetadataDrawer title={issue.component} subtitle={`${issue.severity} · ${issue.categoryLabel || "Blocker"} — Drill-Down`} icon={AlertTriangle} onClose={onClose} maxWidth="max-w-xl"
      footer={<ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${issue.component}-DrillDown`} supportCSV />}>
      <div className="space-y-4">
        {/* Drill-Down Steps Header */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {DRILL_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <s.icon size={11} className="text-indigo-400" />
                </div>
                <span className="text-[10px] text-white/60 whitespace-nowrap">{s.label}</span>
              </div>
              {i < DRILL_STEPS.length - 1 && <ChevronRight size={10} className="text-white/20 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Capability */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={12} className="text-indigo-400" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Step 1: Capability</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DetailStat label="Component" value={issue.component} />
            <DetailStat label="Category" value={issue.categoryLabel || "—"} />
            <DetailStat label="Severity" value={issue.severity} />
            <DetailStat label="Phase" value={`Phase ${issue.phase || "—"}`} />
          </div>
        </div>

        {/* Step 2: Engineering Task */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={12} className="text-blue-400" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Step 2: Engineering Task</span>
          </div>
          <p className="text-xs text-white/70">{issue.remediation}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <DetailStat label="Est. Repair Time" value={issue.estimatedRepairTime} />
            <DetailStat label="Manual Review" value={issue.manualReviewRequired ? "Required" : "Not Required"} />
          </div>
        </div>

        {/* Step 3: Evidence */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={12} className="text-white/40" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Step 3: Evidence</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">{issue.description}</p>
          <div className="mt-2">
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Affected Components</div>
            <div className="flex flex-wrap gap-1.5">{(issue.affectedComponents || [issue.component]).map((c) => <span key={c} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5">{c}</span>)}</div>
          </div>
        </div>

        {/* Step 4 & 5: Fix & Verify */}
        <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wider">Steps 4 & 5: Fix → Verify</span>
          </div>
          <SelfHealingActions item={{ ...issue, field: issue.component, repairAction: issue.remediation, autoRepair: issue.autoRepairAvailable }} />
        </div>

        {/* Step 6: Generate Report */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={12} className="text-white/40" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Step 6: Generate Report</span>
          </div>
          <ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${issue.component}-Blocker`} supportCSV />
        </div>

        {/* Deep Link */}
        {issue.deepLink && (
          <a href={issue.deepLink} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
            <Link2 size={12} /> Open Diagnostics
          </a>
        )}
      </div>
    </MetadataDrawer>
  );
}

function DetailStat({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2"><div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 mt-0.5 truncate">{value}</div></div>);
}