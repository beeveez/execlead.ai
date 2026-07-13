import React, { useState } from "react";
import { AlertTriangle, ChevronRight, ChevronDown, FileWarning, Wrench, FileText } from "lucide-react";
import { computeFailureRegistry } from "@/lib/foundationCertificationEngine";
import MetadataDrawer from "../metadata/MetadataDrawer";
import SelfHealingActions from "../metadata/SelfHealingActions";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";

export default function FailureRegistry({ cert }) {
  const [expanded, setExpanded] = useState(null);
  const [activeFailure, setActiveFailure] = useState(null);
  const failures = computeFailureRegistry(cert);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileWarning size={16} className="text-red-400" />
        <h3 className="text-sm font-bold text-white">Failure Registry™</h3>
        <span className="text-xs text-white/40">{failures.length} modules with failures</span>
      </div>

      <div className="space-y-2">
        {failures.map((group) => (
          <div key={group.module} className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === group.module ? null : group.module)}
              className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/[0.03] transition-colors"
            >
              {expanded === group.module ? <ChevronDown size={12} className="text-white/40" /> : <ChevronRight size={12} className="text-white/40" />}
              <AlertTriangle size={12} className={group.critical > 0 ? "text-red-400" : "text-amber-400"} />
              <span className="text-xs text-white/80 font-medium flex-1 truncate">{group.module}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${group.critical > 0 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                {group.count} failure{group.count !== 1 ? "s" : ""}
              </span>
            </button>
            {expanded === group.module && (
              <div className="px-3 pb-3 space-y-1.5">
                {group.failures.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFailure(f)}
                    className="w-full flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-left hover:bg-white/[0.04] transition-colors group"
                  >
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${
                      f.severity === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : f.severity === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>{f.severity}</span>
                    <span className="text-xs text-white/60 flex-1 truncate">{f.description}</span>
                    <ChevronRight size={10} className="text-white/20 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {failures.length === 0 && (
        <div className="text-center py-6 text-xs text-emerald-400">No failures detected — all modules pass certification.</div>
      )}

      {activeFailure && (
        <MetadataDrawer
          title={activeFailure.component}
          subtitle={`${activeFailure.severity} · Failure Details — Drill-Down`}
          icon={AlertTriangle}
          onClose={() => setActiveFailure(null)}
          maxWidth="max-w-xl"
          footer={<ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${activeFailure.component}-Failure`} supportCSV />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Module" value={activeFailure.component} />
              <DetailStat label="Severity" value={activeFailure.severity} />
              <DetailStat label="Expected Value" value={activeFailure.expectedValue} />
              <DetailStat label="Current Value" value={activeFailure.currentValue} />
              <DetailStat label="Category" value={activeFailure.categoryLabel || "—"} />
              <DetailStat label="Phase" value={`Phase ${activeFailure.phase || "—"}`} />
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Evidence</h4>
              <p className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg p-3">{activeFailure.evidence}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Repair Patch</h4>
              <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-3 font-mono text-[11px] text-emerald-400/80">
                <div className="text-white/30 mb-1">// Repair action</div>
                {activeFailure.repairPatch}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Fix & Verify</h4>
              <SelfHealingActions item={{ ...activeFailure, field: activeFailure.component, repairAction: activeFailure.remediation, autoRepair: activeFailure.autoRepairAvailable }} />
            </div>
          </div>
        </MetadataDrawer>
      )}
    </div>
  );
}

function DetailStat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 mt-0.5 truncate">{value}</div>
    </div>
  );
}