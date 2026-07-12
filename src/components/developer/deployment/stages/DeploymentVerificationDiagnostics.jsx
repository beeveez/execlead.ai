import React, { useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { computeDeploymentReadiness } from "@/lib/deploymentReadinessEngine";
import FindingCard from "../FindingCard";

export default function DeploymentVerificationDiagnostics({ query }) {
  const readiness = useMemo(() => computeDeploymentReadiness(), []);
  const [expandedChecks, setExpandedChecks] = useState(new Set());

  const toggle = (id) => {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/80 text-sm font-semibold">Deployment Readiness™</h3>
          <span className={`text-2xl font-bold ${readiness.summary.healthScore >= 85 ? "text-emerald-400" : readiness.summary.healthScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
            {readiness.summary.healthScore}%
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <Stat label="Passed" value={readiness.summary.passed} color="text-emerald-400" />
          <Stat label="Failed" value={readiness.summary.failed} color="text-red-400" />
          <Stat label="Warnings" value={readiness.summary.warned} color="text-amber-400" />
          <Stat label="Total" value={readiness.summary.total} color="text-white/60" />
        </div>
        <div className={`mt-3 text-sm font-medium text-center py-2 rounded-lg ${readiness.summary.canDeploy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          {readiness.summary.canDeploy ? "✓ Ready for Deployment" : "✗ Deployment Blocked — Resolve Failures First"}
        </div>
      </div>

      {/* Checks */}
      <div>
        <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Verification Checks</h3>
        <div className="space-y-1">
          {readiness.checks.map((c) => (
            <div key={c.id} className="border border-white/5 rounded-lg overflow-hidden bg-white/[0.02]">
              <button onClick={() => toggle(c.id)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02]">
                <ChevronDown size={14} className={`text-white/30 transition-transform shrink-0 ${expandedChecks.has(c.id) ? "rotate-180" : ""}`} />
                {c.status === "pass" ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> :
                  c.status === "warn" ? <AlertTriangle size={14} className="text-amber-400 shrink-0" /> :
                  <XCircle size={14} className="text-red-400 shrink-0" />}
                <span className="text-white/70 text-sm flex-1">{c.label}</span>
                <span className="text-white/30 text-xs font-mono">{c.healthScore}%</span>
                <span className={`text-xs ${c.severity === "Critical" ? "text-red-400" : c.severity === "High" ? "text-amber-400" : c.severity === "Medium" ? "text-amber-400/70" : "text-blue-400"}`}>{c.severity}</span>
              </button>
              {expandedChecks.has(c.id) && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                  <p className="text-xs text-white/50 pt-2">{c.summary.detail}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Field label="Affected Components" value={c.impact.affectedComponents?.join(", ") || "—"} />
                    <Field label="Can Auto Repair" value={c.canRepair ? "Yes" : "No"} />
                  </div>
                  <p className="text-xs text-white/40">{c.impact.description}</p>
                  {c.recommendedActions?.length > 0 && (
                    <div>
                      <span className="text-white/30 text-xs uppercase tracking-wider">Recommended Actions</span>
                      <ul className="mt-1 space-y-1">
                        {c.recommendedActions.map((a, i) => <li key={i} className="text-xs text-white/50 flex gap-2"><span className="text-indigo-400">→</span> {a}</li>)}
                      </ul>
                    </div>
                  )}
                  {c.evidence.failed?.length > 0 && (
                    <div>
                      <span className="text-white/30 text-xs uppercase tracking-wider">Failed Evidence</span>
                      <div className="mt-1 space-y-1">
                        {c.evidence.failed.map((f, i) => (
                          <div key={i} className="text-xs text-red-400/60 font-mono bg-red-500/5 rounded px-2 py-1">{f.code}: {f.message}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {c.deepLinks?.map((link) => (
                      <a key={link.path} href={link.path} className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 rounded px-2 py-1">{link.label} →</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, color }) => (
  <div><div className={`text-xl font-bold ${color}`}>{value}</div><div className="text-white/30 text-xs">{label}</div></div>
);
const Field = ({ label, value }) => (
  <div><span className="text-white/30">{label}</span><p className="text-white/60 font-medium truncate">{value}</p></div>
);