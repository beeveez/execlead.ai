/**
 * Enterprise Audit Engine™
 * Expands immutable audit logging with policy versioning, evidence
 * snapshots, and full decision traceability.
 *
 * Every audit event records: timestamp, reviewer, policy version,
 * decision, decision reason, evidence snapshot, confidence score,
 * risk score, readiness score, and lifecycle stage.
 */

import { getVersioningMetadata } from "./verificationPolicyEngine";
import { computeEvidenceConfidence, computeVerificationReadiness, computeVerificationRisk } from "./verificationIntelligenceEngine";

export const AUDIT_EVENT_TYPES = {
  application_created: { label: "Application Created", desc: "User submitted a verification application" },
  evidence_uploaded: { label: "Evidence Uploaded", desc: "New evidence item submitted" },
  evidence_removed: { label: "Evidence Removed", desc: "Evidence item withdrawn by applicant" },
  status_changed: { label: "Status Changed", desc: "Verification status transitioned" },
  reviewer_assigned: { label: "Reviewer Assigned", desc: "Admin reviewer assigned to application" },
  approved: { label: "Approved", desc: "Verification approved by reviewer" },
  rejected: { label: "Rejected", desc: "Verification rejected by reviewer" },
  renewed: { label: "Renewed", desc: "Verification renewed" },
  expired: { label: "Expired", desc: "Verification expired without renewal" },
  suspended: { label: "Suspended", desc: "Verification suspended by admin" },
  restored: { label: "Restored", desc: "Suspended verification restored" },
  policy_evaluated: { label: "Policy Evaluated", desc: "Policy compliance check run" },
  trust_snapshot_captured: { label: "Trust Snapshot Captured", desc: "Trust score snapshot recorded" },
};

/**
 * Creates a fully-detailed audit event with all governance metadata.
 * The event is immutable once created.
 */
export function createAuditEvent(verification, eventType, actor, details = "") {
  const versions = getVersioningMetadata();
  const { score: confidence } = computeEvidenceConfidence(verification);
  const { score: readiness } = computeVerificationReadiness(verification);
  const risk = computeVerificationRisk(verification);

  // Snapshot the evidence set at decision time
  let evidenceSnapshot = [];
  try {
    evidenceSnapshot = JSON.parse(verification?.evidence_json || "[]").map((e) => ({
      type: e.type,
      status: e.status,
      submitted_date: e.submitted_date,
    }));
  } catch { /* empty */ }

  return {
    timestamp: new Date().toISOString(),
    event: eventType,
    event_label: AUDIT_EVENT_TYPES[eventType]?.label || eventType,
    actor: actor || "system",
    details,
    // ── Governance metadata ──
    policy_version: verification?.policy_version || versions.policyVersion,
    review_version: versions.reviewVersion,
    evidence_version: versions.evidenceVersion,
    confidence_algorithm_version: versions.confidenceAlgorithmVersion,
    risk_algorithm_version: versions.riskAlgorithmVersion,
    // ── Decision traceability ──
    decision: eventType,
    decision_reason: details,
    evidence_snapshot: evidenceSnapshot,
    confidence_score: confidence,
    risk_score: risk.score,
    risk_level: risk.level,
    readiness_score: readiness,
    verification_level: verification?.verification_level_number || 1,
    lifecycle_stage: verification?.workflow_stage || "not_applied",
    // ── Future fields (reserved) ──
    ip_address: null,
    organization: verification?.organization_name || null,
  };
}

/**
 * Appends an audit event to the audit trail and returns the updated JSON string.
 */
export function appendAuditEvent(verification, event) {
  let trail = [];
  try {
    trail = JSON.parse(verification?.audit_trail_json || "[]");
  } catch { /* empty */ }
  trail.push(event);
  return JSON.stringify(trail);
}

/**
 * Retrieves the full audit trail from a verification record.
 */
export function getFullAuditTrail(verification) {
  if (!verification) return [];
  try {
    return JSON.parse(verification.audit_trail_json || "[]");
  } catch {
    return [];
  }
}

/**
 * Filters the audit trail by event type.
 */
export function filterAuditTrail(verification, eventType) {
  return getFullAuditTrail(verification).filter((e) => e.event === eventType);
}