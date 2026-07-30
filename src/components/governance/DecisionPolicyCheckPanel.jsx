import React from "react";
import { ClipboardCheck, CheckCircle2, XCircle, UserCheck } from "lucide-react";

/**
 * DecisionPolicyCheckPanel — shows the latest Decision Policy Check™ result:
 * each validation check (evidence, confidence, reliability, outcome validation,
 * policy compliance, bias, hallucination) and the human-review requirement.
 */
export default function DecisionPolicyCheckPanel({ latestCheck }) {
  if (!latestCheck) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck size={16} className="text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Decision Policy Check™</h3>
        </div>
        <p className="text-xs text-white/40">Run a governance check on the current recommendation to validate it.</p>
      </div>
    );
  }
  const { check, risk } = latestCheck;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={16} className="text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Decision Policy Check™</h3>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${check.passed ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
          {check.passed ? "PASSED" : "FAILED"}
        </span>
      </div>

      <div className="space-y-2">
        {check.checks.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            {c.passed ? (
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle size={14} className="text-rose-400 flex-shrink-0" />
            )}
            <span className="text-xs text-white/70 flex-1">{c.name}</span>
            <span className="text-[11px] text-white/40">{c.detail}</span>
          </div>
        ))}
      </div>

      {check.humanReviewRequired && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <UserCheck size={14} className="text-amber-400" />
          <span className="text-xs text-amber-300">Human review required {check.highImpact ? "· high-impact recommendation" : "· policy threshold not met"}</span>
        </div>
      )}

      {/* AI Risk Score */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">AI Risk Score™</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Risk label="Evidence Risk" value={risk.evidenceRisk} />
          <Risk label="Model Risk" value={risk.modelRisk} />
          <Risk label="Prediction Risk" value={risk.predictionRisk} />
          <Risk label="Policy Risk" value={risk.policyRisk} />
          <Risk label="Bias Risk" value={risk.biasRisk} />
          <Risk label="Overall Risk" value={risk.overall} bold />
        </div>
        <div className="mt-2 text-[11px] text-white/50">
          Governance Score: <span className="font-semibold text-white">{risk.governanceScore}/100</span>
        </div>
      </div>
    </div>
  );
}

function Risk({ label, value, bold }) {
  const color = value >= 60 ? "#ef4444" : value >= 35 ? "#f59e0b" : "#10b981";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
      <div className="text-[10px] text-white/40">{label}</div>
      <div className={`text-sm font-bold ${bold ? "text-white" : ""}`} style={bold ? {} : { color }}>
        {value}<span className="text-[10px] text-white/30 font-normal">/100</span>
      </div>
    </div>
  );
}