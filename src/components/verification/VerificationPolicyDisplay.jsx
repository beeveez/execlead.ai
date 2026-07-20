import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { getPolicyForLevel, evaluatePolicyCompliance } from "@/lib/verificationPolicyEngine";

export default function VerificationPolicyDisplay({ verification, targetLevel }) {
  if (!verification) return null;
  const policy = getPolicyForLevel(targetLevel || verification.verification_level_number || 1);
  const compliance = evaluatePolicyCompliance(verification, targetLevel);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Verification Policy™</h3>
        <span className="text-[9px] text-white/20 uppercase tracking-wider ml-auto">Policy v{policy.policyVersion}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <PolicyMetric label="Min Readiness" value={`${policy.minReadinessScore}%`} />
        <PolicyMetric label="Min Confidence" value={`${policy.minEvidenceConfidence}%`} />
        <PolicyMetric label="Renewal" value={`${policy.renewalFrequencyMonths}mo`} />
        <PolicyMetric label="Risk Threshold" value={policy.riskThreshold} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Required Evidence</div>
          <div className="space-y-1">
            {policy.requiredEvidence.map((ev) => {
              const evidenceList = (() => { try { return JSON.parse(verification.evidence_json || "[]"); } catch { return []; } })();
              const has = evidenceList.some((e) => e.type === ev);
              return (
                <div key={ev} className="flex items-center gap-2 text-xs">
                  {has ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> : <XCircle size={12} className="text-white/20 shrink-0" />}
                  <span className={has ? "text-white/60" : "text-white/30"}>{ev.replace(/_/g, " ")}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Policy Flags</div>
          <div className="space-y-1">
            <PolicyFlag label="Manual Review" enabled={policy.manualReviewRequired} />
            <PolicyFlag label="AI Validation" enabled={policy.aiValidationRequired} />
            <PolicyFlag label="Auto-Approval" enabled={policy.autoApprovalEligible} />
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className={`mt-4 p-3 rounded-lg border flex items-start gap-2 ${
        compliance.compliant ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"
      }`}>
        {compliance.compliant ? <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />}
        <div className="flex-1">
          <div className={`text-xs font-medium ${compliance.compliant ? "text-emerald-400" : "text-amber-400"}`}>
            {compliance.compliant ? "Policy Compliant" : `${compliance.violations.length} Policy Violation(s)`}
          </div>
          {!compliance.compliant && (
            <ul className="mt-1 space-y-0.5">
              {compliance.violations.map((v, i) => (
                <li key={i} className="text-[11px] text-white/40">• {v}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PolicyMetric({ label, value }) {
  return (
    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-white/70 mt-0.5">{value}</div>
    </div>
  );
}

function PolicyFlag({ label, enabled }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-indigo-400" : "bg-white/10"}`} />
      <span className="text-white/40">{label}</span>
      <span className={`ml-auto text-[10px] ${enabled ? "text-indigo-400" : "text-white/20"}`}>{enabled ? "Required" : "Not Required"}</span>
    </div>
  );
}