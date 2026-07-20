/**
 * Founding Member Admissions System™ — Admissions Engine v2.0
 *
 * Complete admissions workflow: application ID generation, duplicate
 * protection, capacity management, status tracking, timeline, scoring,
 * notification templates, and analytics.
 */

import { base44 } from "@/api/base44Client";
import { CURRENT_BETA_STAGE, BETA_STAGES } from "./betaProgramEngine";
import { dispatchAdmissionsNotifications } from "./notificationRoutingEngine";

// ============================================================
// ADMISSIONS STATUSES (10-status workflow)
// ============================================================
export const ADMISSIONS_STATUSES = {
  submitted: { label: "Submitted", color: "#f59e0b", desc: "Application received and pending email verification" },
  email_verified: { label: "Email Verified", color: "#06b6d4", desc: "Email verified — application activated for review" },
  under_review: { label: "Under Review", color: "#6366f1", desc: "Application is being evaluated by the review team" },
  additional_info_required: { label: "Additional Info Required", color: "#f97316", desc: "Reviewer has requested additional information" },
  interview: { label: "Interview", color: "#8b5cf6", desc: "Interview scheduled (optional stage)" },
  approved: { label: "Approved", color: "#10b981", desc: "Application approved — founding member recognition assigned" },
  invitation_sent: { label: "Invitation Sent", color: "#06b6d4", desc: "Invitation email sent to applicant" },
  account_activated: { label: "Account Activated", color: "#10b981", desc: "Applicant has created an account and is active" },
  declined: { label: "Declined", color: "#ef4444", desc: "Application was not approved" },
  withdrawn: { label: "Withdrawn", color: "#64748b", desc: "Applicant withdrew their application" },
};

export const ADMISSIONS_STATUS_FLOW = [
  "submitted",
  "email_verified",
  "under_review",
  "additional_info_required",
  "interview",
  "approved",
  "invitation_sent",
  "account_activated",
];

// ============================================================
// TIMELINE STAGES (6 stages)
// ============================================================
export const TIMELINE_STAGES = [
  { id: "received", label: "Application Received", desc: "Application submitted successfully" },
  { id: "review_queue", label: "Review Queue", desc: "Application in review queue" },
  { id: "evaluation", label: "Evaluation", desc: "Being evaluated by the review team" },
  { id: "decision", label: "Decision", desc: "Decision made — approved or declined" },
  { id: "invitation", label: "Invitation", desc: "Invitation sent to join the beta" },
  { id: "activation", label: "Activation", desc: "Account activated — founding member" },
];

export function mapStatusToTimelineStage(status) {
  const mapping = {
    submitted: "received",
    email_verified: "received",
    under_review: "review_queue",
    additional_info_required: "evaluation",
    interview: "evaluation",
    approved: "decision",
    declined: "decision",
    invitation_sent: "invitation",
    account_activated: "activation",
  };
  return mapping[status] || "received";
}

export function getTimelineProgress(status) {
  const stage = mapStatusToTimelineStage(status);
  const idx = TIMELINE_STAGES.findIndex((s) => s.id === stage);
  return { currentStage: stage, currentIndex: idx, total: TIMELINE_STAGES.length };
}

// ============================================================
// NOTIFICATION TEMPLATES (10 templates)
// ============================================================
export const ADMISSIONS_NOTIFICATION_TEMPLATES = {
  application_received: { label: "Application Received", subject: "Your Founding Member application has been received", trigger: "Application submitted" },
  email_verified: { label: "Email Verified", subject: "Your email has been verified", trigger: "Email verification completed" },
  under_review: { label: "Under Review", subject: "Your application is now under review", trigger: "Status changed to under_review" },
  more_info_requested: { label: "More Information Requested", subject: "Additional information required for your application", trigger: "Status changed to additional_info_required" },
  interview_invitation: { label: "Interview Invitation", subject: "You've been invited to an interview", trigger: "Status changed to interview" },
  approved: { label: "Approved", subject: "Congratulations — your application has been approved", trigger: "Status changed to approved" },
  invitation_sent: { label: "Invitation Sent", subject: "Your Founding Member invitation is ready", trigger: "Status changed to invitation_sent" },
  rejected: { label: "Rejected", subject: "Update on your Founding Member application", trigger: "Status changed to declined" },
  waitlisted: { label: "Waitlisted", subject: "You've been added to the Executive Waitlist", trigger: "Beta capacity reached" },
  account_activated: { label: "Account Activated", subject: "Welcome to EXECLEAD.AI — your account is active", trigger: "Status changed to account_activated" },
};

// ============================================================
// APPLICATION ID GENERATION (FB-YYYY-NNNNNN)
// ============================================================
export function generateApplicationId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `FB-${year}-${random}`;
}

// ============================================================
// APPLICATION SCORE (0-100)
// ============================================================
const LEADERSHIP_SCORES = {
  individual_contributor: 5, team_lead: 10, manager: 12, senior_manager: 15,
  director: 18, senior_director: 20, vp: 22, svp: 23, c_suite: 25, founder: 25, consultant: 15, other: 5,
};

export function computeApplicationScore(app) {
  if (!app) return 0;
  let score = 0;
  const years = app.years_of_experience || 0;
  score += Math.min(years, 20);
  score += LEADERSHIP_SCORES[app.leadership_level] || 0;
  if (app.linkedin_url) score += 5;
  if (app.company) score += 5;
  if (app.primary_goal) score += 5;
  const whyWords = (app.why_join || "").trim().split(/\s+/).filter(Boolean).length;
  score += Math.min(whyWords, 40);
  return Math.min(Math.round(score), 100);
}

// ============================================================
// DUPLICATE PROTECTION
// ============================================================
export async function checkDuplicateEmail(email) {
  if (!email) return null;
  try {
    const existing = await base44.entities.BetaApplication.filter({ email });
    return existing && existing.length > 0 ? existing[0] : null;
  } catch {
    return null;
  }
}

// ============================================================
// TIMELINE + AUDIT BUILDERS
// ============================================================
export function buildInitialTimeline() {
  const now = new Date().toISOString();
  return JSON.stringify([{ stage: "received", status: "submitted", timestamp: now, note: "Application submitted" }]);
}

export function buildInitialAuditTrail(actor) {
  const now = new Date().toISOString();
  return JSON.stringify([{ timestamp: now, event: "application_created", actor: actor || "applicant", reviewer: null, reason: "Application submitted" }]);
}

// ============================================================
// SUBMIT FOUNDING APPLICATION (enhanced)
// ============================================================
export async function submitFoundingApplication(formData) {
  const existing = await checkDuplicateEmail(formData.email);
  if (existing) {
    throw new Error("DUPLICATE_APPLICATION");
  }
  const applicationId = generateApplicationId();
  const score = computeApplicationScore(formData);
  const now = new Date().toISOString();
  const created = await base44.entities.BetaApplication.create({
    ...formData,
    application_id: applicationId,
    status: "submitted",
    email_verified: false,
    application_score: score,
    beta_tier: formData.beta_tier || "founding_beta",
    beta_stage: CURRENT_BETA_STAGE,
    is_active_beta_user: false,
    founding_badge_eligible: false,
    founding_pricing_eligible: false,
    founding_member_assigned: false,
    timeline_json: buildInitialTimeline(),
    audit_trail_json: buildInitialAuditTrail(formData.full_name),
    notification_history_json: JSON.stringify([{ template: "application_received", channel: "email", sent_at: now, status: "pending" }]),
  });
  try { await dispatchAdmissionsNotifications("beta_application_submitted", created); } catch {}
  return created;
}

// ============================================================
// CAPACITY MANAGEMENT
// ============================================================
export async function getCapacityInfo() {
  const stage = BETA_STAGES[CURRENT_BETA_STAGE];
  const capacity = stage?.maxUsers || 100;
  try {
    const all = await base44.entities.BetaApplication.list("-created_date", 500);
    const activeCount = all.filter((a) => ["approved", "invitation_sent", "account_activated"].includes(a.status)).length;
    const submittedCount = all.filter((a) => !["declined", "withdrawn"].includes(a.status)).length;
    return {
      capacity,
      accepted: activeCount,
      remaining: Math.max(capacity - activeCount, 0),
      isFull: activeCount >= capacity,
      totalApplications: all.length,
      activeApplications: submittedCount,
    };
  } catch {
    return { capacity, accepted: 0, remaining: capacity, isFull: false, totalApplications: 0, activeApplications: 0 };
  }
}

// ============================================================
// STATUS UPDATE (with timeline + audit)
// ============================================================
export async function updateApplicationStatus(applicationId, newStatus, { reviewer, reason, notes, extraData = {} } = {}) {
  const now = new Date().toISOString();
  const app = await base44.entities.BetaApplication.get(applicationId);
  if (!app) throw new Error("Application not found");

  let timeline = [];
  try { timeline = JSON.parse(app.timeline_json || "[]"); } catch {}
  const stage = mapStatusToTimelineStage(newStatus);
  timeline.push({ stage, status: newStatus, timestamp: now, note: reason || `Status changed to ${newStatus}` });

  let audit = [];
  try { audit = JSON.parse(app.audit_trail_json || "[]"); } catch {}
  const eventType = newStatus === "approved" ? "decision_made" : newStatus === "email_verified" ? "email_verified" : "status_changed";
  audit.push({ timestamp: now, event: eventType, actor: reviewer?.email || "system", reviewer: reviewer?.full_name || null, reason: reason || `Status changed to ${newStatus}` });

  const update = {
    status: newStatus,
    timeline_json: JSON.stringify(timeline),
    audit_trail_json: JSON.stringify(audit),
    ...extraData,
  };

  if (reviewer) {
    update.assigned_reviewer_id = reviewer.id;
    update.assigned_reviewer_name = reviewer.full_name;
  }

  if (newStatus === "approved") {
    update.founding_badge_eligible = true;
    update.founding_pricing_eligible = true;
    update.founding_member_assigned = true;
    update.founding_member_number = app.founding_member_number || `FM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`;
    update.beta_cohort = app.beta_cohort || "Batch #1";
    update.approval_reason = reason || "";
    update.reviewed_by_id = reviewer?.id || app.reviewed_by_id;
    update.reviewed_by_name = reviewer?.full_name || app.reviewed_by_name;
    update.reviewed_at = now;
  }

  if (newStatus === "declined") {
    update.rejection_reason = reason || "";
    update.reviewed_by_id = reviewer?.id || app.reviewed_by_id;
    update.reviewed_by_name = reviewer?.full_name || app.reviewed_by_name;
    update.reviewed_at = now;
  }

  if (newStatus === "invitation_sent") {
    update.invitation_sent_at = now;
  }

  if (newStatus === "account_activated") {
    update.activated_at = now;
    update.is_active_beta_user = true;
  }

  if (notes !== undefined) update.review_notes = notes;

  let decisionHistory = [];
  try { decisionHistory = JSON.parse(app.decision_history_json || "[]"); } catch {}
  if (["approved", "declined", "additional_info_required", "interview"].includes(newStatus)) {
    decisionHistory.push({ decision: newStatus, reason: reason || "", reviewer: reviewer?.full_name || "System", timestamp: now });
    update.decision_history_json = JSON.stringify(decisionHistory);
  }

  const updated = await base44.entities.BetaApplication.update(applicationId, update);
  try {
    const eventMap = { under_review: "beta_application_under_review", approved: "beta_application_approved", invitation_sent: "beta_application_invitation_sent", declined: "beta_application_declined" };
    const evt = eventMap[newStatus];
    if (evt) await dispatchAdmissionsNotifications(evt, { ...app, ...update });
  } catch {}
  return updated;
}

// ============================================================
// ANALYTICS
// ============================================================
export function computeAdmissionsAnalytics(records = []) {
  const total = records.length;
  const approved = records.filter((r) => ["approved", "invitation_sent", "account_activated"].includes(r.status)).length;
  const declined = records.filter((r) => r.status === "declined").length;
  const pending = records.filter((r) => ["submitted", "email_verified", "under_review", "additional_info_required", "interview"].includes(r.status)).length;
  const invited = records.filter((r) => ["invitation_sent", "account_activated"].includes(r.status)).length;
  const activated = records.filter((r) => r.status === "account_activated").length;

  const reviewTimes = records
    .filter((r) => r.created_date && r.reviewed_at)
    .map((r) => new Date(r.reviewed_at) - new Date(r.created_date));
  const avgReviewHours = reviewTimes.length > 0 ? Math.round(reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length / (1000 * 60 * 60)) : 0;

  const byCountry = {};
  const byLeadership = {};
  records.forEach((r) => {
    if (r.country) byCountry[r.country] = (byCountry[r.country] || 0) + 1;
    if (r.leadership_level) byLeadership[r.leadership_level] = (byLeadership[r.leadership_level] || 0) + 1;
  });

  const conversionRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const invitationAcceptanceRate = invited > 0 ? Math.round((activated / invited) * 100) : 0;

  return {
    total, approved, declined, pending, invited, activated,
    avgReviewHours, conversionRate, invitationAcceptanceRate,
    byCountry: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8),
    byLeadership: Object.entries(byLeadership).sort((a, b) => b[1] - a[1]),
  };
}