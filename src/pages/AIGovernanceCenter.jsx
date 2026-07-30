import React, { useEffect, useRef } from "react";
import { useDecisionTransparency } from "@/hooks/useDecisionTransparency";
import { useAIGovernance } from "@/hooks/useAIGovernance";
import GovernanceHero from "@/components/governance/GovernanceHero";
import PolicyEnginePanel from "@/components/governance/PolicyEnginePanel";
import DecisionPolicyCheckPanel from "@/components/governance/DecisionPolicyCheckPanel";
import HumanReviewQueue from "@/components/governance/HumanReviewQueue";
import ModelRegistryPanel from "@/components/governance/ModelRegistryPanel";
import PromptGovernancePanel from "@/components/governance/PromptGovernancePanel";
import AIAuditLogPanel from "@/components/governance/AIAuditLogPanel";
import DecisionExplanationPanel from "@/components/transparency/DecisionExplanationPanel";

/**
 * AIGovernanceCenter — enterprise control plane for AI policy, safety,
 * compliance, monitoring, oversight, and continuous governance.
 *
 * On load, runs a Decision Policy Check™ + AI Risk Score™ against the current
 * top recommendation and logs it to the AI Audit Log™ — so every recommendation
 * is validated, policy-checked, risk-scored, and auditable.
 */
export default function AIGovernanceCenter() {
  const { explanation, trustScore, exportTrace } = useDecisionTransparency();
  const gov = useAIGovernance();
  const checkedRef = useRef(false);

  // Validate the current recommendation once per mount.
  useEffect(() => {
    if (explanation && trustScore && !checkedRef.current) {
      checkedRef.current = true;
      gov.governRecommendation(explanation, trustScore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explanation, trustScore]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">AI Governance Center™</h1>
        <p className="text-xs text-white/40 mt-1">
          Responsible Executive AI Framework — policy, safety, compliance, monitoring, oversight, and continuous governance.
        </p>
      </div>

      <GovernanceHero dashboard={gov.dashboard} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DecisionPolicyCheckPanel latestCheck={gov.latestCheck} />
        <HumanReviewQueue auditLog={gov.auditLog} onReview={gov.reviewEntry} />
      </div>

      {/* The decision being governed */}
      <DecisionExplanationPanel explanation={explanation} onExport={exportTrace} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PolicyEnginePanel policies={gov.policies} onToggle={gov.togglePolicy} />
        <ModelRegistryPanel models={gov.models} onAdd={gov.addModel} onRollback={gov.rollbackTo} />
      </div>

      <PromptGovernancePanel
        prompts={gov.prompts}
        onAdd={gov.addPrompt}
        onApprove={gov.approve}
        onRollback={gov.rollbackPromptTo}
      />

      <AIAuditLogPanel auditLog={gov.auditLog} onExport={gov.downloadAudit} />
    </div>
  );
}