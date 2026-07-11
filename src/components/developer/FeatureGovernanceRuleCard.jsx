import React from "react";
import { ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import {
  FEATURE_GOVERNANCE_RULE,
  FEATURE_GOVERNANCE_CRITERIA,
  FEATURE_GOVERNANCE_THRESHOLD,
} from "@/lib/featureGovernanceRule";

/**
 * Feature Governance Rule™ — Card
 * Displays the single governance rule that guides every major feature decision.
 * Surfaced in the Platform Governance workspace.
 */
export default function FeatureGovernanceRuleCard() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Feature Governance Rule™</h3>
        <span className="ml-auto text-[10px] text-white/30">v{FEATURE_GOVERNANCE_RULE.version}</span>
      </div>

      <p className="text-xs text-white/60 leading-relaxed mb-4">
        {FEATURE_GOVERNANCE_RULE.principle}
      </p>

      <div className="space-y-2 mb-4">
        {FEATURE_GOVERNANCE_CRITERIA.map((c, i) => (
          <div
            key={c.id}
            className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
          >
            <Circle size={12} className="text-white/30 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/80">
                {i + 1}. {c.label}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">{c.pillar}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
        <CheckCircle2 size={14} className="text-indigo-400 flex-shrink-0" />
        <span className="text-[11px] text-white/70">
          A proposal must satisfy at least{" "}
          <span className="font-bold text-indigo-400">
            {FEATURE_GOVERNANCE_THRESHOLD} of {FEATURE_GOVERNANCE_CRITERIA.length}
          </span>{" "}
          criteria, or it is deferred.
        </span>
      </div>
    </div>
  );
}