import React from "react";
import { getDecisionLabel } from "@/lib/releaseReadinessEngine";
import { ScoreRing, StatusBadge } from "./Shared";
import { Target, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function ExecutiveDecisionPanel({ decision, score, gateSummary, blockerSummary, domains }) {
  const isGo = decision.recommendation === "GO";
  const isConditional = decision.recommendation === "GO_WITH_CONDITIONS";
  const isNoGo = decision.recommendation === "NO_GO";

  const cardColor = isGo
    ? "border-emerald-500/30 bg-emerald-500/5"
    : isConditional
    ? "border-amber-500/30 bg-amber-500/5"
    : "border-red-500/30 bg-red-500/5";

  const Icon = isGo ? CheckCircle : isConditional ? AlertTriangle : XCircle;
  const iconColor = isGo ? "text-emerald-400" : isConditional ? "text-amber-400" : "text-red-400";
  const decisionTextColor = isGo ? "text-emerald-400" : isConditional ? "text-amber-400" : "text-red-400";

  const atRiskDomains = domains.filter((d) => d.status === "at_risk");
  const failingGates = gateSummary.fail + gateSummary.pending;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border ${cardColor} p-6`}>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ScoreRing score={score} size={130} label="Score" />
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <Target className={`w-5 h-5 ${iconColor}`} />
              <span className="text-xs uppercase tracking-wide text-white/40">Executive Recommendation</span>
            </div>
            <div className={`text-4xl font-bold ${decisionTextColor} tracking-tight`}>
              {getDecisionLabel(decision.recommendation)}
            </div>
            <p className="text-sm text-white/50 mt-2">
              Based on live platform state across {domains.length} readiness domains, {gateSummary.total} gates, and {blockerSummary.total} blockers.
            </p>
          </div>
          <div className="hidden lg:block">
            <Icon className={`w-16 h-16 ${iconColor} opacity-50`} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Decision Rationale
        </h3>
        <ul className="space-y-2">
          {decision.rationale.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-xs uppercase tracking-wide text-white/40 mb-3">Gate Summary</h3>
          <div className="grid grid-cols-2 gap-2">
            <SummaryItem label="Passing" value={gateSummary.pass} color="text-emerald-400" />
            <SummaryItem label="Warnings" value={gateSummary.warning} color="text-amber-400" />
            <SummaryItem label="Failing" value={gateSummary.fail} color="text-red-400" />
            <SummaryItem label="Pending" value={gateSummary.pending} color="text-slate-400" />
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-xs uppercase tracking-wide text-white/40 mb-3">Blocker Summary</h3>
          <div className="grid grid-cols-2 gap-2">
            <SummaryItem label="Critical" value={blockerSummary.critical} color="text-red-400" />
            <SummaryItem label="High" value={blockerSummary.high} color="text-orange-400" />
            <SummaryItem label="Unresolved" value={blockerSummary.unresolved} color="text-amber-400" />
            <SummaryItem label="Resolved" value={blockerSummary.resolved + blockerSummary.verified} color="text-emerald-400" />
          </div>
        </div>
      </div>

      {atRiskDomains.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="text-xs uppercase tracking-wide text-amber-400/70 mb-3">At-Risk Domains ({atRiskDomains.length})</h3>
          <div className="flex flex-wrap gap-2">
            {atRiskDomains.map((d) => (
              <StatusBadge key={d.id} status="at_risk" customLabel={`${d.name} — ${d.score}`} />
            ))}
          </div>
        </div>
      )}

      {(failingGates > 0 || blockerSummary.critical > 0) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="text-xs uppercase tracking-wide text-red-400/70 mb-2">Launch Blockers</h3>
          <p className="text-sm text-white/60">
            {failingGates > 0 && `${failingGates} gate(s) failing or pending. `}
            {blockerSummary.critical > 0 && `${blockerSummary.critical} critical blocker(s) unresolved. `}
            These must be resolved before GO recommendation.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}