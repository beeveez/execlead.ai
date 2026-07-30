import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getPolicies,
  updatePolicy,
  checkDecisionPolicy,
  computeAIRiskScore,
  getAuditLog,
  appendAuditLog,
  reviewAuditEntry,
  exportAuditLog,
  getModelRegistry,
  registerModelVersion,
  rollbackModel,
  getPromptRegistry,
  registerPromptVersion,
  approvePrompt,
  rollbackPrompt,
  getGovernanceDashboard,
} from "@/lib/aiGovernanceEngine";

/**
 * useAIGovernance — loads policies, audit log, model & prompt registries,
 * runs a Decision Policy Check™ + AI Risk Score™ for a recommendation, logs
 * it to the AI Audit Log™, and exposes the enterprise governance dashboard.
 */
export function useAIGovernance() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [models, setModels] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [latestCheck, setLatestCheck] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const refresh = useCallback(() => {
    setPolicies(getPolicies());
    setAuditLog(getAuditLog());
    setModels(getModelRegistry());
    setPrompts(getPromptRegistry());
    setDashboard(getGovernanceDashboard());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const togglePolicy = useCallback((id, patch) => {
    setPolicies(updatePolicy(id, patch));
    setDashboard(getGovernanceDashboard());
  }, []);

  const governRecommendation = useCallback(
    (explanation, trustScore) => {
      if (!explanation) return null;
      const check = checkDecisionPolicy(explanation, trustScore, getPolicies());
      const risk = computeAIRiskScore(explanation, trustScore, check);
      const entry = appendAuditLog({
        user: user?.full_name || user?.email || "system",
        workspace: "executive",
        model: explanation.modelVersion,
        evidenceUsed: explanation.evidenceUsed,
        policyApplied: getPolicies().filter((p) => p.enabled).map((p) => p.id),
        recommendation: explanation.recommendation,
        confidence: explanation.confidence?.value || 0,
        decisionTrace: explanation.trace,
        passed: check.passed,
        humanReviewRequired: check.humanReviewRequired,
        highImpact: check.highImpact,
        riskScore: risk,
        governanceScore: risk.governanceScore,
      });
      setLatestCheck({ check, risk });
      setAuditLog(getAuditLog());
      setDashboard(getGovernanceDashboard());
      return entry;
    },
    [user]
  );

  const reviewEntry = useCallback((id) => {
    reviewAuditEntry(id, user?.full_name || user?.email || "reviewer");
    setAuditLog(getAuditLog());
    setDashboard(getGovernanceDashboard());
  }, [user]);

  const addModel = useCallback((data) => {
    setModels(registerModelVersion(data));
    setDashboard(getGovernanceDashboard());
  }, []);
  const rollbackTo = useCallback((id) => {
    setModels(rollbackModel(id));
    setDashboard(getGovernanceDashboard());
  }, []);

  const addPrompt = useCallback((data) => {
    setPrompts(registerPromptVersion(data));
    setDashboard(getGovernanceDashboard());
  }, []);
  const approve = useCallback((id) => {
    setPrompts(approvePrompt(id));
    setDashboard(getGovernanceDashboard());
  }, []);
  const rollbackPromptTo = useCallback((id) => {
    setPrompts(rollbackPrompt(id));
    setDashboard(getGovernanceDashboard());
  }, []);

  const downloadAudit = useCallback(() => {
    const csv = exportAuditLog();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execlead-ai-audit-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    policies,
    auditLog,
    models,
    prompts,
    latestCheck,
    dashboard,
    togglePolicy,
    governRecommendation,
    reviewEntry,
    addModel,
    rollbackTo,
    addPrompt,
    approve,
    rollbackPromptTo,
    downloadAudit,
  };
}