import React, { useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Lock, Rocket } from "lucide-react";
import { runGovernancePipeline } from "@/lib/governancePipeline";
import { computeDeploymentReadiness } from "@/lib/deploymentReadinessEngine";

export default function ProductionCertificationDiagnostics({ query }) {
  const { cert, readiness } = useMemo(() => ({
    cert: runGovernancePipeline("deployment"),
    readiness: computeDeploymentReadiness(),
  }), []);

  const launchBlockers = readiness.checks.filter((c) => c.status === "fail");
  const remainingRisks = readiness.checks.filter((c) => c.status === "warn");
  const canLaunch = launchBlockers.length === 0;

  const readinessScores = [
    { label: "Enterprise Readiness", score: cert.enterpriseReadiness, icon: ShieldCheck },
    { label: "Security Readiness", score: cert.manifestHealth, icon: Lock },
    { label: "Performance Readiness", score: cert.deploymentReadiness, icon: Rocket },
    { label: "Architecture Readiness", score: cert.registryHealth, icon: ShieldCheck },
    { label: "Compliance Readiness", score: cert.knowledgeHealth, icon: CheckCircle2 },
    { label: "Platform State", score: cert.platformState, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4">
      {/* Launch Recommendation */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${canLaunch ? "bg-emerald-500/5 border border-emerald-500/20" : "bg-red-500/5 border border-red-500/20"}`}>
        {canLaunch ? <CheckCircle2 className="text-emerald-400 shrink-0" size={24} /> : <XCircle className="text-red-400 shrink-0" size={24} />}
        <div className="flex-1">
          <div className={`text-sm font-medium ${canLaunch ? "text-emerald-400" : "text-red-400"}`}>
            {canLaunch ? "Production Ready — Clear for Launch" : "Launch Blocked — Critical Issues Remain"}
          </div>
          <div className="text-xs text-white/40 mt-0.5">
            {launchBlockers.length} blockers · {remainingRisks.length} risks · {cert.warnings} warnings
          </div>
        </div>
      </div>

      {/* Readiness Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {readinessScores.map((r) => (
          <div key={r.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <r.icon size={12} className="text-indigo-400" />
              <span className="text-white/30 text-xs">{r.label}</span>
            </div>
            <div className={`text-lg font-bold ${r.score >= 85 ? "text-emerald-400" : r.score >= 60 ? "text-amber-400" : "text-red-400"}`}>{r.score}%</div>
          </div>
        ))}
      </div>

      {/* Launch Blockers */}
      {launchBlockers.length > 0 && (
        <div>
          <h3 className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Lock size={14} /> Launch Blockers ({launchBlockers.length})
          </h3>
          <div className="space-y-1">
            {launchBlockers.map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                <XCircle size={14} className="text-red-400 shrink-0" />
                <span className="text-white/70 text-sm flex-1">{b.label}</span>
                <span className="text-red-400/50 text-xs font-mono">{b.summary.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remaining Risks */}
      {remainingRisks.length > 0 && (
        <div>
          <h3 className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertTriangle size={14} /> Remaining Risks ({remainingRisks.length})
          </h3>
          <div className="space-y-1">
            {remainingRisks.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                <span className="text-white/70 text-sm flex-1">{r.label}</span>
                <span className="text-amber-400/50 text-xs">{r.summary.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {canLaunch && remainingRisks.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
          <p className="text-emerald-400 text-sm font-medium">All checks passed. Platform is fully production-ready.</p>
        </div>
      )}
    </div>
  );
}