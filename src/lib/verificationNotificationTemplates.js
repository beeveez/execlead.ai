/**
 * Verification Notification Framework™
 * Dormant notification templates — inactive until exec_verified is enabled.
 *
 * Templates define the subject/body structure. Delivery channels (email,
 * in-app, push, enterprise) are prepared but not wired to any provider.
 */

export const NOTIFICATION_CHANNELS = {
  in_app: { label: "In-App", active: false },
  email: { label: "Email", active: false },
  push: { label: "Push", active: false },
  enterprise: { label: "Enterprise Notifications", active: false },
};

export const NOTIFICATION_TEMPLATES = {
  verification_submitted: {
    id: "verification_submitted",
    label: "Verification Submitted",
    channels: ["in_app", "email"],
    subject: "Your EXEC™ Verified application has been submitted",
    body: "Your verification application has been received and is now in the review queue. You will be notified when the review begins.",
    trigger: "application_date set",
  },
  evidence_required: {
    id: "evidence_required",
    label: "Evidence Required",
    channels: ["in_app", "email"],
    subject: "Additional evidence required for your verification",
    body: "Our review team has requested additional evidence to complete your verification. Please visit the Verification Center to upload the required documents.",
    trigger: "reviewer requests evidence",
  },
  verification_approved: {
    id: "verification_approved",
    label: "Verification Approved",
    channels: ["in_app", "email", "enterprise"],
    subject: "You are now EXEC™ Verified",
    body: "Congratulations! Your verification has been approved. Your EXEC™ Verified badge is now active on your profile.",
    trigger: "verification_status → verified",
  },
  verification_rejected: {
    id: "verification_rejected",
    label: "Verification Rejected",
    channels: ["in_app", "email"],
    subject: "Your verification application was not approved",
    body: "Your verification application was not approved at this time. Please review the feedback in the Verification Center and reapply when ready.",
    trigger: "verification_status → rejected",
  },
  verification_expiring: {
    id: "verification_expiring",
    label: "Verification Expiring",
    channels: ["in_app", "email"],
    subject: "Your EXEC™ Verified status expires soon",
    body: "Your verification will expire in {days} days. Please submit a renewal application to maintain your verified status.",
    trigger: "expiration_lifecycle_status → upcoming_renewal_30",
  },
  renewal_reminder: {
    id: "renewal_reminder",
    label: "Renewal Reminder",
    channels: ["in_app", "email"],
    subject: "Reminder: Renew your EXEC™ Verified status",
    body: "This is a reminder that your verification expires in {days} days. Submit your renewal application before the expiration date.",
    trigger: "expiration_lifecycle_status → upcoming_renewal_7",
  },
  renewal_completed: {
    id: "renewal_completed",
    label: "Renewal Completed",
    channels: ["in_app", "email"],
    subject: "Your EXEC™ Verified status has been renewed",
    body: "Your verification has been successfully renewed. Your new expiration date is {expiration_date}.",
    trigger: "last_renewal_date set",
  },
  verification_suspended: {
    id: "verification_suspended",
    label: "Verification Suspended",
    channels: ["in_app", "email", "enterprise"],
    subject: "Your EXEC™ Verified status has been suspended",
    body: "Your verification has been suspended. Please contact support for more information.",
    trigger: "verification_status → suspended",
  },
  reviewer_comment: {
    id: "reviewer_comment",
    label: "Reviewer Comment",
    channels: ["in_app"],
    subject: "New comment on your verification",
    body: "A reviewer has left a comment on your verification application. View it in the Verification Center.",
    trigger: "manual_review_notes updated",
  },
};

/**
 * Returns all templates with their active/inactive status.
 */
export function getAllTemplates() {
  return Object.values(NOTIFICATION_TEMPLATES).map((t) => ({
    ...t,
    channels: t.channels.map((c) => ({ id: c, label: NOTIFICATION_CHANNELS[c].label, active: NOTIFICATION_CHANNELS[c].active })),
  }));
}

/**
 * Renders a template body with variable substitution.
 */
export function renderTemplate(template, variables) {
  if (!template) return "";
  let body = template.body || "";
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    });
  }
  return body;
}