import React, { useMemo } from "react";
import { ShieldCheck, ShieldAlert, Lock, ChevronRight, AlertTriangle, Clock, Layers, Target, TrendingUp } from "lucide-react";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";
import { computeReleaseStage } from "@/lib/releaseStageEngine";

export default function ExecutionStreamStatus({ cert, onOpenDiagnostics }) {
  const stage = useMemo(() => computeReleaseStage(), []);
  const certified = cert.certified;
  const remaining = Math.max(0, cert.requiredThreshold - cert.foundationScore);
  const estimatedHours = cert.verification.issues.reduce((s, i) => {
    const m = (i.estimatedRepairTime || "").match(/(\d+)/);
    return s + (m ? parseInt(m[1]) : 0.5);
  }, 0);

  const fields = [
    { label: "Current Stage", value: stage.currentStage, icon: Target },
    { label: "Status", value: certified ? "CERTIFIED" : "BLOCKED", icon: certified ? ShieldCheck : Lock, color: certified ? "text-emerald-400" : "text-red-400" },
    { label: "Reason", value: certified ? "All thresholds met" : "Certification Score below threshold", icon: AlertTriangle },
    { label: "Remaining", value: `${remaining} points`, icon: TrendingUp },
    { label: "Blocking Domains", value: cert.blockingDomains.length, icon: Layers },
    { label: "Remaining Tasks", value: cert.remainingTasks, icon: Clock },
    { label: "Estimated Hours", value: `${estimatedHours}h`, icon: Clock },
    { label: "Next Stage", value: stage.nextMilestone, icon: ChevronRight },
  ];

  return (
    <div className={`rounded-xl border p-5 ${certified ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
      <div className="flex items-center gap-2 mb-4">
        {certified ? <ShieldCheck size={18} className="text-emerald-400" /> : <ShieldAlert size={18} className="text-red-400" />}
        <h3 className="text-sm font-bold text-white">Execution Stream Status™</h3>
        <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${certified ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {certified ? "CERTIFIED" : "BLOCKED"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {fields.map((f) => (
          <div key={f.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <f.icon size={11} className={f.color || "text-white/40"} />
              <span className="text-[9px] text-white/40 uppercase tracking-wider">{f.label}</span>
            </div>
            <div className={`text-sm font-bold ${f.color || "text-white/80"}`}>{f.value}</div>
          </div>
        ))}
      </div>

      {cert.blockingDomains.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Blocking Domains</div>
          <div className="flex flex-wrap gap-2">
            {cert.blockingDomains.map((d) => (
              <button key={d.category} onClick={onOpenDiagnostics} className="text-xs px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                {d.label} ({d.count})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
        <button onClick={onOpenDiagnostics} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-xs font-medium transition-colors">
          Open Diagnostics <ChevronRight size={12} />
        </button>
        <ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix="Execution-Stream-Status" supportCSV={false} />
        {!certified && (
          <div className="flex items-center gap-2 text-xs ml-auto">
            <Lock size={12} className="text-red-400" />
            <span className="text-red-400">{stage.nextMilestone} is BLOCKED until foundation is certified.</span>
          </div>
        )}
        {certified && (
          <div className="flex items-center gap-2 text-xs ml-auto">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span className="text-emerald-400">{stage.nextMilestone} is authorized to begin.</span>
          </div>
        )}
      </div>
    </div>
  );
}