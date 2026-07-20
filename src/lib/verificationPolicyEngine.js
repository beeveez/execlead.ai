/**
 * Verification Policy Engine™
 * Configurable, versioned policies per verification level.
 * Requirements are never hardcoded — they are declared here and
 * can be changed without code modifications.
 *
 * Every policy references a Policy Version™ so historical decisions
 * remain explainable even after policies change.
 */

import { computeEvidenceConfidence, computeVerificationReadiness, computeVerificationRisk } from "./verificationIntelligenceEngine";

export const CURRENT_POLICY_VERSION = "2.1.0";
export const CURRENT_REVIEW_VERSION = "1.0.0";
export const CURRENT_EVIDENCE_VERSION = "1.0.0";
export const CURRENT_CONFIDENCE_ALGORITHM_VERSION = "2.1.0";
export const CURRENT_RISK_ALGORITHM_VERSION = "2.1.0";

export const VERIFICATION_POLICIES = {
  level_1_email: {
    level: 1,
    name: "Email Verified",
    policyVersion: CURRENT_POLICY_VERSION,
    minReadinessScore: 10,
    minEvidenceConfidence: 10,
    requiredEvidence: ["business_email"],
    optionalEvidence: [],
    renewalFrequencyMonths: 24,
    manualReviewRequired: false,
    aiValidationRequired: false,
    riskThreshold: "medium",
    autoApprovalEligible: true,
    description: "Email address ownership confirmed. Lowest trust tier.",
  },
  level_2_identity: {
    level: 2,
    name: "Identity Verified",
    policyVersion: CURRENT_POLICY_VERSION,
    minReadinessScore: 35,
    minEvidenceConfidence: 35,
    requiredEvidence: ["business_email", "government_id"],
    optionalEvidence: ["linkedin"],
    renewalFrequencyMonths: 24,
    manualReviewRequired: true,
    aiValidationRequired: false,
    riskThreshold: "medium",
    autoApprovalEligible: false,
    description: "Government ID verified. Identity trust established.",
  },
  level_3_professional: {
    level: 3,
    name: "Professional Verified",
    policyVersion: CURRENT_POLICY_VERSION,
    minReadinessScore: 50,
    minEvidenceConfidence: 55,
    requiredEvidence: ["business_email", "employment_verification", "professional_profile"],
    optionalEvidence: ["professional_certifications", "linkedin"],
    renewalFrequencyMonths: 12,
    manualReviewRequired: true,
    aiValidationRequired: true,
    riskThreshold: "low",
    autoApprovalEligible: false,
    description: "Employment and professional profile verified.",
  },
  level_4_exec: {
    level: 4,
    name: "EXEC™ Verified",
    policyVersion: CURRENT_POLICY_VERSION,
    minReadinessScore: 75,
    minEvidenceConfidence: 80,
    requiredEvidence: ["business_email", "employment_verification", "professional_profile", "leadership_credentials"],
    optionalEvidence: ["professional_certifications", "executive_portfolio", "linkedin"],
    renewalFrequencyMonths: 12,
    manualReviewRequired: true,
    aiValidationRequired: true,
    riskThreshold: "low",
    autoApprovalEligible: false,
    description: "Leadership profile and experience validated. Full executive trust.",
  },
  level_5_enterprise: {
    level: 5,
    name: "Enterprise Verified",
    policyVersion: CURRENT_POLICY_VERSION,
    minReadinessScore: 85,
    minEvidenceConfidence: 90,
    requiredEvidence: ["business_email", "employment_verification", "organization_verification", "leadership_credentials"],
    optionalEvidence: ["professional_certifications", "executive_portfolio", "evidence_vault"],
    renewalFrequencyMonths: 12,
    manualReviewRequired: true,
    aiValidationRequired: true,
    riskThreshold: "low",
    autoApprovalEligible: false,
    description: "Organization verification completed. Enterprise-grade trust.",
  },
};

export function getPolicyForLevel(level) {
  const key = typeof level === "number"
    ? Object.keys(VERIFICATION_POLICIES).find((k) => VERIFICATION_POLICIES[k].level === level)
    : level;
  return VERIFICATION_POLICIES[key] || VERIFICATION_POLICIES.level_1_email;
}

/**
 * Evaluates a verification record against its target policy.
 * Returns compliance details without modifying the record.
 */
export function evaluatePolicyCompliance(verification, targetLevel) {
  if (!verification) return { compliant: false, violations: ["No verification record"], policy: null };
  const policy = getPolicyForLevel(targetLevel || verification.verification_level_number || 1);
  const violations = [];

  const { score: confidence } = computeEvidenceConfidence(verification);
  const { score: readiness } = computeVerificationReadiness(verification);
  const risk = computeVerificationRisk(verification);

  if (readiness < policy.minReadinessScore) {
    violations.push(`Readiness ${readiness}% below required ${policy.minReadinessScore}%`);
  }
  if (confidence < policy.minEvidenceConfidence) {
    violations.push(`Evidence Confidence ${confidence}% below required ${policy.minEvidenceConfidence}%`);
  }

  // Check required evidence types
  const evidenceList = (() => { try { return JSON.parse(verification.evidence_json || "[]"); } catch { return []; } })();
  const submittedTypes = new Set(evidenceList.map((e) => e.type));
  policy.requiredEvidence.forEach((req) => {
    if (!submittedTypes.has(req)) {
      violations.push(`Missing required evidence: ${req}`);
    }
  });

  // Check risk threshold
  const riskOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  if (riskOrder[risk.level] > riskOrder[policy.riskThreshold]) {
    violations.push(`Risk level ${risk.level} exceeds threshold ${policy.riskThreshold}`);
  }

  // Check manual review if required
  if (policy.manualReviewRequired && !verification.reviewer_id) {
    violations.push("Manual review required but no reviewer assigned");
  }

  return {
    compliant: violations.length === 0,
    violations,
    policy,
    metrics: { readiness, confidence, riskScore: risk.score, riskLevel: risk.level },
    autoApprovalEligible: policy.autoApprovalEligible && violations.length === 0,
  };
}

/**
 * Returns the full versioning metadata block for a verification record.
 * Every verification decision references these versions so historical
 * decisions remain explainable.
 */
export function getVersioningMetadata() {
  return {
    policyVersion: CURRENT_POLICY_VERSION,
    reviewVersion: CURRENT_REVIEW_VERSION,
    evidenceVersion: CURRENT_EVIDENCE_VERSION,
    confidenceAlgorithmVersion: CURRENT_CONFIDENCE_ALGORITHM_VERSION,
    riskAlgorithmVersion: CURRENT_RISK_ALGORITHM_VERSION,
  };
}