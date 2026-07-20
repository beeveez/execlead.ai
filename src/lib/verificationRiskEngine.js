/**
 * Verification Risk Engine™
 * Expanded risk calculation with deterministic factor explanations.
 *
 * Risk Categories: Low, Medium, High, Critical
 * Factors: Missing Identity, Missing Employment, Expired Evidence,
 *          Policy Violations, Incomplete Submission, Low Confidence
 */

import { computeEvidenceConfidence, computeVerificationReadiness } from "./verificationIntelligenceEngine";

export const RISK_LEVELS = {
  low: { label: "Low", color: "#10b981", score_range: [0, 29] },
  medium: { label: "Medium", color: "#f59e0b", score_range: [30, 49] },
  high: { label: "High", color: "#f97316", score_range: [50, 69] },
  critical: { label: "Critical", color: "#ef4444", score_range: [70, 100] },
};

const RISK_FACTORS = [
  {
    id: "missing_identity",
    label: "Missing Identity Verification",
    weight: 25,
    check: (v) => v.identity_status !== "verified",
    explanation: "Government ID has not been verified — identity trust is not established.",
  },
  {
    id: "missing_employment",
    label: "Missing Employment Verification",
    weight: 20,
    check: (v) => v.employment_status !== "verified",
    explanation: "Employment has not been verified — professional credibility is unconfirmed.",
  },
  {
    id: "expired_evidence",
    label: "Expired Evidence",
    weight: 15,
    check: (v) => {
      const statuses = [v.identity_status, v.employment_status, v.certification_status, v.executive_status, v.enterprise_status];
      return statuses.some((s) => s === "expired");
    },
    explanation: "One or more evidence items have expired and need renewal.",
  },
  {
    id: "incomplete_submission",
    label: "Incomplete Submission",
    weight: 15,
    check: (v) => {
      if (!v || v.workflow_stage === "not_applied") return true;
      const evidenceCount = v.evidence_count || 0;
      return evidenceCount === 0 && v.workflow_stage !== "not_applied";
    },
    explanation: "Application is submitted but no evidence has been uploaded yet.",
  },
  {
    id: "low_confidence",
    label: "Low Evidence Confidence",
    weight: 15,
    check: (v) => {
      const { score } = computeEvidenceConfidence(v);
      return score < 40;
    },
    explanation: "Evidence confidence is below 40% — insufficient evidence quality.",
  },
  {
    id: "low_readiness",
    label: "Low Verification Readiness",
    weight: 10,
    check: (v) => {
      const { score } = computeVerificationReadiness(v);
      return score < 50;
    },
    explanation: "Verification readiness is below 50% — key requirements are not met.",
  },
];

/**
 * Calculates risk score with detailed factor breakdown.
 */
export function calculateDetailedRisk(verification) {
  if (!verification) {
    return {
      score: 0,
      level: "low",
      factors: [],
      explanation: "No verification record — no risk factors present.",
    };
  }

  const activeFactors = [];
  let score = 0;

  RISK_FACTORS.forEach((factor) => {
    if (factor.check(verification)) {
      score += factor.weight;
      activeFactors.push({
        id: factor.id,
        label: factor.label,
        weight: factor.weight,
        explanation: factor.explanation,
      });
    }
  });

  score = Math.min(100, score);
  let level = "low";
  if (score >= 70) level = "critical";
  else if (score >= 50) level = "high";
  else if (score >= 30) level = "medium";

  const explanation = activeFactors.length === 0
    ? "No risk factors detected — verification is in good standing."
    : `${activeFactors.length} risk factor(s) detected: ${activeFactors.map((f) => f.label).join(", ")}.`;

  return { score, level, factors: activeFactors, explanation };
}