/**
 * Admissions Communication Engine™ v3.1
 *
 * Notification Synchronization Pipeline:
 *   Reviewer Action → Email → In-App Notification → Operations Notification
 *                    → Audit Event → Timeline Entry → Communication Record
 *
 * All generated automatically for every reviewer action.
 */

import { base44 } from "@/api/base44Client";
import { sendAdmissionsEmail } from "./admissionsEmailEngine";
import { dispatchAdmissionsNotifications } from "./notificationRoutingEngine";
import { generateApplicationId, mapStatusToTimelineStage } from "./foundingAdmissionsEngine";

function parseJson(str) {
  try { return JSON.parse(str || "[]"); } catch { return []; }
}

const ACTION_STATUS_MAP = {
  request_info: "additional_info_required",
  schedule_interview: "interview",
  approve: "approved",
  decline: "declined",
  invite: "invitation_sent",
  reopen: "under_review",
};

const ACTION_TEMPLATE_MAP = {
  request_info: "additional_info_requested",
  schedule_interview: "interview_invitation",
  approve: "approved",
  decline: "rejected",
  invite: "invitation_sent",
};

const ACTION_EVENT_MAP = {
  approve: "beta_application_approved",
  decline: "beta_application_declined",
  invite: "beta_application_invitation_sent",
  request_info: "beta_application_under_review",
  schedule_interview: "beta_application_under_review",
  reopen: "beta_application_under_review",
};

/**
 * Full sync pipeline for a reviewer action.
 * Returns the updated application and email delivery record.
 */
export async function syncReviewerAction(applicationId, action, opts = {}) {
  const { reviewer, reason, notes, deadline, sendEmail = true, sendInApp = true, notifyOps = true, interviewDetails = null, messageSubject = null, messageBody = null } = opts;

  const app = await base44.entities.BetaApplication.get(applicationId);
  if (!app) throw new Error("Application not found");

  const now = new Date().toISOString();
  const previousStatus = app.status;
  const newStatus = ACTION_STATUS_MAP[action] || app.status;

  // Parse existing JSON fields
  const audit = parseJson(app.audit_trail_json);
  const timeline = parseJson(app.timeline_json);
  const communications = parseJson(app.communications_json);
  const emailHistory = parseJson(app.email_history_json);
  const decisions = parseJson(app.decision_history_json);

  // 1. Audit event (immutable)
  audit.push({
    timestamp: now,
    event: action,
    actor: reviewer?.email || "system",
    reviewer: reviewer?.full_name || null,
    previous_status: previousStatus,
    new_status: newStatus,
    reason: reason || null,
    message_sent: ["request_info", "schedule_interview", "message"].includes(action),
    email_status: sendEmail ? "pending" : "not_sent",
  });

  // 2. Timeline entry
  const timelineNotes = {
    request_info: reason || "Additional information requested",
    schedule_interview: `Interview scheduled${interviewDetails?.date ? ` for ${new Date(interviewDetails.date).toLocaleString()}` : ""}`,
    approve: reason || "Application approved",
    decline: reason || "Application declined",
    invite: "Invitation sent to applicant",
    hold: reason || "Application put on hold",
    reopen: "Review reopened",
    message: messageSubject || "Message sent to applicant",
  };
  timeline.push({
    stage: mapStatusToTimelineStage(newStatus),
    status: newStatus,
    timestamp: now,
    note: timelineNotes[action] || action,
  });

  // 3. Communication record
  if (["request_info", "schedule_interview", "message"].includes(action)) {
    communications.push({
      type: action,
      direction: "outbound",
      subject: messageSubject || timelineNotes[action] || action,
      message: messageBody || notes || reason || "",
      reviewer: reviewer?.full_name || "System",
      sent_at: now,
      email_status: sendEmail ? "pending" : "not_sent",
    });
  }

  // 4. Email delivery (if requested or auto for major decisions)
  const shouldSendEmail = sendEmail || ["approve", "decline", "invite"].includes(action);
  let emailRecord = null;
  if (shouldSendEmail && app.email) {
    const templateName = ACTION_TEMPLATE_MAP[action];
    const variables = {
      applicant_name: app.full_name,
      application_id: app.application_id,
      reviewer_name: reviewer?.full_name || "Admissions Team",
      status: newStatus.replace(/_/g, " "),
      deadline: deadline || "",
      interview_date: interviewDetails?.date ? new Date(interviewDetails.date).toLocaleDateString() : "",
      interview_time: interviewDetails?.date ? new Date(interviewDetails.date).toLocaleTimeString() : "",
      interview_type: interviewDetails?.type || "",
      meeting_link: interviewDetails?.meetingLink || "",
    };

    if (templateName) {
      emailRecord = await sendAdmissionsEmail(app, templateName, variables);
    } else if (action === "message" && messageSubject) {
      emailRecord = await sendAdmissionsEmail(app, null, variables, { subject: messageSubject, html: messageBody, text: messageBody });
    }

    if (emailRecord) {
      emailHistory.push(emailRecord);
      if (communications.length > 0 && communications[communications.length - 1].email_status === "pending") {
        communications[communications.length - 1].email_status = emailRecord.status;
      }
      if (audit.length > 0) {
        audit[audit.length - 1].email_status = emailRecord.status;
      }
    }
  }

  // 5. Decision history
  if (["approve", "decline", "request_info", "schedule_interview"].includes(action)) {
    decisions.push({ decision: action, reason: reason || "", reviewer: reviewer?.full_name || "System", timestamp: now });
  }

  // 6. Build update object
  const update = {
    status: newStatus,
    audit_trail_json: JSON.stringify(audit),
    timeline_json: JSON.stringify(timeline),
    communications_json: JSON.stringify(communications),
    email_history_json: JSON.stringify(emailHistory),
    decision_history_json: JSON.stringify(decisions),
    reviewed_by_id: reviewer?.id || app.reviewed_by_id,
    reviewed_by_name: reviewer?.full_name || app.reviewed_by_name,
    reviewed_at: now,
    review_notes: notes !== undefined ? notes : app.review_notes,
  };

  if (reason) {
    if (action === "approve") update.approval_reason = reason;
    if (action === "decline") update.rejection_reason = reason;
  }
  if (deadline) update.response_deadline = deadline;
  if (action === "request_info") {
    update.additional_info_requested = true;
    update.additional_info_details = reason || notes || "";
  }
  if (action === "schedule_interview") {
    update.interview_scheduled = true;
    if (interviewDetails?.date) update.interview_date = interviewDetails.date;
  }
  if (action === "hold") {
    update.on_hold = true;
    update.on_hold_reason = reason || "";
  }
  if (action === "reopen") {
    update.on_hold = false;
    update.on_hold_reason = "";
  }
  if (action === "approve") {
    update.founding_badge_eligible = true;
    update.founding_pricing_eligible = true;
    update.founding_member_assigned = true;
    update.founding_member_number = app.founding_member_number || `FM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`;
    update.beta_cohort = app.beta_cohort || "Batch #1";
  }
  if (action === "invite") {
    update.invitation_sent_at = now;
  }

  // 7. In-app notification (synchronized)
  if (sendInApp || ["approve", "decline", "invite", "request_info", "schedule_interview"].includes(action)) {
    try {
      const event = ACTION_EVENT_MAP[action];
      if (event) await dispatchAdmissionsNotifications(event, { ...app, ...update });
    } catch {}
  }

  // 8. Update the application
  const updated = await base44.entities.BetaApplication.update(applicationId, update);
  return { ...updated, _emailRecord: emailRecord };
}

/**
 * Retry a failed email delivery.
 */
export async function retryEmail(applicationId, emailIndex) {
  const app = await base44.entities.BetaApplication.get(applicationId);
  if (!app) throw new Error("Application not found");

  const emailHistory = parseJson(app.email_history_json);
  if (emailIndex < 0 || emailIndex >= emailHistory.length) return null;

  const email = emailHistory[emailIndex];
  email.retry_count = (email.retry_count || 0) + 1;
  email.status = "queued";

  const { sendAdmissionsEmail } = await import("./admissionsEmailEngine");
  const templateName = email.template !== "custom" ? email.template : null;
  const variables = {
    applicant_name: app.full_name,
    application_id: app.application_id,
    reviewer_name: app.reviewed_by_name || "Admissions Team",
    status: app.status?.replace(/_/g, " ") || "",
  };

  const newRecord = await sendAdmissionsEmail(app, templateName, variables, templateName ? null : { subject: email.subject, html: email.message || email.text, text: email.message || email.text });
  emailHistory[emailIndex] = { ...email, ...newRecord, retry_count: email.retry_count };

  await base44.entities.BetaApplication.update(applicationId, { email_history_json: JSON.stringify(emailHistory) });
  return emailHistory[emailIndex];
}