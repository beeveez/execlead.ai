/**
 * Verification Intelligence Engine™
 * Deterministic business-logic engine — no LLM required.
 * Computes Evidence Confidence™, Verification Readiness™, lifecycle stages,
 * risk scores, and AI-style executive summaries from verification records.
 */

export const EVIDENCE_TYPES = [
  { key: "identity", label: "Government ID", weight: 25, field: "identity_status", icon: "Fingerprint" },
  { key: "employment", label: "Employment Verification", weight: 20, field: "employment_status", icon: "Briefcase" },
  { key: "business_email", label: "Business Email", weight: 15, field: "identity_status", icon: "Mail" },
  { key: "professional_profile", label: "Professional Profile", weight: 10, field: "employment_status", icon: "User" },
  { key: "certification", label: "Professional Certification", weight: 15, field: "certification_status", icon: "Award" },
  { key: "executive_portfolio", label: "Executive Portfolio™", weight: 10, field: "executive_status", icon: "ShieldCheck" },
  { key: "organization", label: "Organization Verification", weight: 5, field: "enterprise_status", icon: "Building2" },
];

export function computeEvidenceConfidence(verification) {
  if (!verification) return { score: 0, level: "low", breakdown: [] };
  let score = 0;
  const breakdown = [];
  const seen = new Set();

  EVIDENCE_TYPES.forEach((cfg) => {
    if (seen.has(cfg.field)) return;
    seen.add(cfg.field);
    const status = verification[cfg.field] || "not_started";
    if (status === "verified") {
      score += cfg.weight;
      breakdown.push({ ...cfg, status: "verified", contribution: cfg.weight });
    } else if (status === "pending") {
      score += cfg.weight * 0.5;
      breakdown.push({ ...cfg, status: "pending", contribution: cfg.weight * 0.5 });
    } else {
      breakdown.push({ ...cfg, status, contribution: 0 });
    }
  });

  const level = score >= 75 ? "high" : score >= 40 ? "medium" : "low";
  return { score: Math.round(score), level, breakdown };
}

export function computeVerificationReadiness(verification) {
  if (!verification) return { score: 0, completed: [], pending: [] };
  const checks = [
    { key: "email", label: "Email Verified", icon: "Mail", done: verification.verification_level_number >= 1 },
    { key: "profile", label: "Executive Profile Complete", icon: "User", done: verification.workflow_stage && verification.workflow_stage !== "not_applied" },
    { key: "business_email", label: "Business Email", icon: "Mail", done: verification.identity_status === "verified" },
    { key: "government_id", label: "Government ID", icon: "Fingerprint", done: verification.identity_status === "verified" },
    { key: "employment", label: "Employment Verification", icon: "Briefcase", done: verification.employment_status === "verified" },
    { key: "certification", label: "Professional Certification", icon: "Award", done: verification.certification_status === "verified" },
    { key: "portfolio", label: "Executive Portfolio™", icon: "ShieldCheck", done: verification.executive_status === "verified" },
    { key: "organization", label: "Organization Verification", icon: "Building2", done: verification.enterprise_status === "verified" },
  ];
  const completed = checks.filter((c) => c.done);
  const pending = checks.filter((c) => !c.done);
  const score = checks.length > 0 ? Math.round((completed.length / checks.length) * 100) : 0;
  return { score, completed, pending };
}

export function computeVerificationRisk(verification) {
  if (!verification) return { level: "low", score: 0 };
  const { score: confidence } = computeEvidenceConfidence(verification);
  const { score: readiness } = computeVerificationReadiness(verification);
  const riskScore = 100 - Math.min(confidence, readiness);
  let level = "low";
  if (riskScore >= 70) level = "critical";
  else if (riskScore >= 50) level = "high";
  else if (riskScore >= 30) level = "medium";
  return { level, score: Math.round(riskScore) };
}

export const LIFECYCLE_STAGES = [
  { id: "applied", label: "Applied", icon: "FileText" },
  { id: "evidence_submitted", label: "Evidence Submitted", icon: "Upload" },
  { id: "ai_validation", label: "AI Validation", icon: "Cpu" },
  { id: "manual_review", label: "Manual Review", icon: "Eye" },
  { id: "approved", label: "Approved", icon: "CheckCircle2" },
  { id: "verified", label: "Verified", icon: "ShieldCheck" },
  { id: "renewal_due", label: "Renewal Due", icon: "Clock" },
  { id: "renewed", label: "Renewed", icon: "RefreshCw" },
  { id: "archived", label: "Archived", icon: "Archive" },
];

export function getLifecycleStages(verification) {
  const stages = LIFECYCLE_STAGES.map((s) => ({ ...s, completed: false, current: false }));
  if (!verification) return stages;
  const workflowMap = {
    not_applied: -1, eligibility_check: 0, identity_verification: 1,
    evidence_submission: 1, ai_validation: 2, manual_review: 3,
    approved: 4, rejected: -1,
  };
  const wfIndex = workflowMap[verification.workflow_stage] ?? -1;
  const isVerified = verification.verification_status === "verified";
  const isExpired = verification.verification_status === "expired";
  const isRenewed = !!(verification.last_renewal_date && !isExpired);
  stages.forEach((stage, index) => {
    if (index <= wfIndex) stage.completed = true;
    if (stage.id === "verified" && isVerified) stage.completed = true;
    if (stage.id === "renewal_due" && isExpired) stage.completed = true;
    if (stage.id === "renewed" && isRenewed) stage.completed = true;
    if (index === wfIndex + 1) stage.current = true;
    if (stage.id === "verified" && isVerified && wfIndex >= 4) stage.current = true;
  });
  return stages;
}

export function generateVerificationSummary(verification) {
  if (!verification) {
    return {
      overallStatus: "Not Started",
      currentAssessment: "No verification application has been submitted yet.",
      outstandingRequirements: ["Submit verification application"],
      estimatedCompletion: "—",
      nextRecommendedAction: "Begin verification by submitting an application.",
      riskLevel: "low", riskScore: 0, businessImpact: "none",
      trustImpact: "No trust signals established.",
      evidenceConfidence: 0, evidenceConfidenceLevel: "low",
      verificationReadiness: 0,
    };
  }
  const { score: confidence, level: confidenceLevel } = computeEvidenceConfidence(verification);
  const { score: readiness, pending } = computeVerificationReadiness(verification);
  const risk = computeVerificationRisk(verification);
  const statusLabels = {
    not_available: "Not Available", pending: "Pending", under_review: "Under Review",
    verified: "Verified", rejected: "Rejected", expired: "Expired", suspended: "Suspended",
  };
  const overallStatus = statusLabels[verification.verification_status] || "Unknown";
  const currentAssessment = verification.verification_status === "verified"
    ? `Verification approved at Level ${verification.verification_level_number}. Evidence Confidence is ${confidenceLevel} (${confidence}%).`
    : verification.verification_status === "rejected"
    ? "Verification application was rejected. Please review the requirements and resubmit."
    : `Verification is ${overallStatus.toLowerCase()}. Readiness is at ${readiness}%.`;
  const outstandingRequirements = pending.map((p) => p.label);
  let estimatedCompletion = "—";
  if (verification.verification_status === "verified") estimatedCompletion = "Completed";
  else if (["pending", "under_review"].includes(verification.verification_status))
    estimatedCompletion = pending.length > 0 ? `${pending.length} requirement(s) remaining` : "Awaiting review";
  else estimatedCompletion = pending.length > 0 ? `${pending.length} step(s) remaining` : "—";
  const nextRecommendedAction = pending.length > 0
    ? `Complete: ${pending[0].label}`
    : verification.verification_status === "under_review" ? "Awaiting admin review"
    : verification.verification_status === "verified" ? "Verification complete — monitor renewal date"
    : "Submit verification application";
  const businessImpact = ["critical", "high"].includes(risk.level) ? "high" : risk.level === "medium" ? "medium" : "low";
  const trustImpact = verification.verification_status === "verified"
    ? `High trust — Level ${verification.verification_level_number} verified`
    : confidenceLevel === "high" ? "Building trust — strong evidence base"
    : confidenceLevel === "medium" ? "Limited trust — more evidence needed"
    : "No trust signals established";
  return {
    overallStatus, currentAssessment, outstandingRequirements,
    estimatedCompletion, nextRecommendedAction,
    riskLevel: risk.level, riskScore: risk.score, businessImpact, trustImpact,
    evidenceConfidence: confidence, evidenceConfidenceLevel: confidenceLevel,
    verificationReadiness: readiness,
  };
}

export const VERIFIED_BENEFITS = [
  { id: "badge", label: "Verified Badge", icon: "BadgeCheck", description: "Display the EXEC™ Verified badge on your profile", minLevel: 1 },
  { id: "recruiter_visibility", label: "Recruiter Visibility", icon: "Eye", description: "Appear in verified executive search results", minLevel: 2 },
  { id: "verified_search", label: "Verified Executive Search", icon: "Search", description: "Access to verified executive talent pool", minLevel: 3 },
  { id: "credential_trust", label: "Credential Trust", icon: "ShieldCheck", description: "Verified credentials trusted across the platform", minLevel: 2 },
  { id: "executive_passport", label: "Executive Passport™", icon: "BookOpen", description: "Portable executive identity credential", minLevel: 3 },
  { id: "executive_network", label: "Executive Network™", icon: "Network", description: "Access to verified executive network", minLevel: 4 },
  { id: "priority_support", label: "Priority Support", icon: "Headphones", description: "Priority access to platform support", minLevel: 2 },
  { id: "leadership_recognition", label: "Leadership Recognition", icon: "Award", description: "Recognized leadership credibility status", minLevel: 3 },
];

export function getVerifiedBenefits(verificationLevel) {
  return VERIFIED_BENEFITS.map((b) => ({ ...b, unlocked: (verificationLevel || 1) >= b.minLevel }));
}

export function getAuditTrail(verification) {
  if (!verification) return [];
  try { return JSON.parse(verification.audit_trail_json || "[]"); } catch { return []; }
}

export function addAuditEvent(auditTrail, event) {
  return [...auditTrail, {
    timestamp: new Date().toISOString(),
    event: event.type, actor: event.actor || "system", details: event.details || "",
  }];
}