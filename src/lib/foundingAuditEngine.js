/**
 * Founding Member Admissions — Audit Engine
 * Immutable audit trail for all application lifecycle events.
 */

export const FOUNDING_AUDIT_EVENT_TYPES = {
  application_created: { label: "Application Created", desc: "Applicant submitted their application" },
  email_verified: { label: "Email Verified", desc: "Applicant verified their email address" },
  reviewer_assigned: { label: "Reviewer Assigned", desc: "Admin reviewer assigned to application" },
  notes_added: { label: "Notes Added", desc: "Reviewer added internal notes" },
  decision_made: { label: "Decision Made", desc: "Review decision recorded (approve/decline/request info/interview)" },
  invitation_sent: { label: "Invitation Sent", desc: "Invitation email sent to approved applicant" },
  account_activated: { label: "Account Activated", desc: "Applicant activated their account" },
};

export function captureFoundingAuditEvent(event, { actor, reviewer, reason } = {}) {
  return {
    timestamp: new Date().toISOString(),
    event,
    actor: actor || "system",
    reviewer: reviewer || null,
    reason: reason || null,
  };
}

export function parseAuditTrail(json) {
  try { return JSON.parse(json || "[]"); } catch { return []; }
}

export function parseTimeline(json) {
  try { return JSON.parse(json || "[]"); } catch { return []; }
}

export function parseDecisionHistory(json) {
  try { return JSON.parse(json || "[]"); } catch { return []; }
}