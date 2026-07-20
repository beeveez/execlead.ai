import React from "react";
import { Brain, AlertTriangle, TrendingUp, Clock, ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { generateVerificationSummary } from "@/lib/verificationIntelligenceEngine";
import VerificationReadiness from "./VerificationReadiness";
import EvidenceConfidenceBreakdown from "./EvidenceConfidenceBreakdown";
import VerificationLifecycle from "./VerificationLifecycle";

const RISK_COLORS = { low: "text-emerald-400 bg-emerald-500/10", medium: "text-amber-400 bg-amber-500/10", high: "text-orange-400 bg-orange-500/10", critical: "text-red-400 bg-red-500/10" };
const IMPACT_COLORS = { none: "text-white/40", low: "text-emerald-400", medium: "text-amber-400", high: "text-orange-400" };

function SummaryRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <Icon size={14} className={`mt-0.5 shrink-0 ${color || "text-white/40"}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className="text-xs text-white/70 mt-0.5 leading-relaxed">{value}</div>
      </div>
    </div>
  );
}

export default function VerificationIntelligence({ verification }) {
  const summary = generateVerificationSummary(verification);

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Verification Intelligence™</h3>
          <span className="text-[9px] text-white/20 uppercase tracking-wider ml-auto">AI-Generated Summary</span>
        </div>
        <p className="text-sm text-white/60 leading-relaxed mb-4">{summary.currentAssessment}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <SummaryRow icon={ShieldCheck} label="Overall Status" value={summary.overallStatus} />
          <SummaryRow icon={AlertTriangle} label="Verification Risk" value={`${summary.riskLevel} (${summary.riskScore}/100)`} color={RISK_COLORS[summary.riskLevel]?.split(" ")[0]} />
          <SummaryRow icon={TrendingUp} label="Business Impact" value={summary.businessImpact} color={IMPACT_COLORS[summary.businessImpact]} />
          <SummaryRow icon={Clock} label="Estimated Completion" value={summary.estimatedCompletion} />
          <SummaryRow icon={ArrowRight} label="Next Recommended Action" value={summary.nextRecommendedAction} />
          <SummaryRow icon={Building2} label="Trust Impact" value={summary.trustImpact} />
        </div>
        {summary.outstandingRequirements.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5">Outstanding Requirements</div>
            <div className="flex flex-wrap gap-1.5">
              {summary.outstandingRequirements.map((req, i) => (
                <span key={i} className="text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full">{req}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Readiness + Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VerificationReadiness verification={verification} />
        <EvidenceConfidenceBreakdown verification={verification} />
      </div>

      {/* Lifecycle */}
      <VerificationLifecycle verification={verification} />
    </div>
  );
}