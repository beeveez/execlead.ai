/**
 * Admissions Email Engine™ v3.1
 *
 * Provider-abstraction layer for admissions email delivery.
 * Supports configurable providers (Gmail, Resend, SendGrid, Postmark,
 * Amazon SES, Mailgun) with 11 email templates and delivery tracking.
 *
 * The actual email sending is handled by the sendAdmissionsEmail
 * backend function, which uses the configured provider.
 */

import { base44 } from "@/api/base44Client";

// ============================================================
// PROVIDER CONFIGURATION
// ============================================================
export const EMAIL_PROVIDERS = {
  gmail: { label: "Gmail", configured: true, connectorType: "gmail" },
  resend: { label: "Resend", configured: false },
  sendgrid: { label: "SendGrid", configured: false },
  postmark: { label: "Postmark", configured: false },
  ses: { label: "Amazon SES", configured: false },
  mailgun: { label: "Mailgun", configured: false },
};

export const ACTIVE_EMAIL_PROVIDER = "gmail";

// ============================================================
// EMAIL DELIVERY STATUS
// ============================================================
export const EMAIL_DELIVERY_STATUS = {
  queued: { label: "Queued", color: "#64748b", badge: "text-slate-400 bg-slate-500/10" },
  sending: { label: "Sending", color: "#3b82f6", badge: "text-blue-400 bg-blue-500/10" },
  delivered: { label: "Delivered", color: "#10b981", badge: "text-emerald-400 bg-emerald-500/10" },
  opened: { label: "Opened", color: "#06b6d4", badge: "text-cyan-400 bg-cyan-500/10" },
  clicked: { label: "Clicked", color: "#8b5cf6", badge: "text-purple-400 bg-purple-500/10" },
  bounced: { label: "Bounced", color: "#f97316", badge: "text-orange-400 bg-orange-500/10" },
  failed: { label: "Failed", color: "#ef4444", badge: "text-red-400 bg-red-500/10" },
  suppressed: { label: "Suppressed", color: "#64748b", badge: "text-slate-400 bg-slate-500/10" },
};

// ============================================================
// EMAIL TEMPLATES (11 templates)
// Variables: {{applicant_name}}, {{application_id}}, {{reviewer_name}},
//            {{status}}, {{deadline}}, {{interview_date}}, {{interview_time}},
//            {{interview_type}}, {{meeting_link}}, {{company}}, {{role}}
// ============================================================
export const EMAIL_TEMPLATES = {
  application_received: {
    label: "Application Received",
    subject: "Your EXECLEAD.AI Founding Member Application — {{application_id}}",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#f59e0b;">Application Received</h1><p>Dear {{applicant_name}},</p><p>Thank you for applying to the EXECLEAD.AI Founding Member program. Your application <strong>{{application_id}}</strong> has been received and is now pending review.</p><p>Our admissions team will review your application within 3-5 business days. You will receive updates at each stage of the process.</p><p style="margin-top:24px;padding:16px;background:#1e1e2a;border-radius:8px;"><strong>Application ID:</strong> {{application_id}}<br/><strong>Status:</strong> Submitted</p><p>Best regards,<br/>The EXECLEAD.AI Admissions Team</p></div>`,
    text: "Dear {{applicant_name}},\n\nThank you for applying to the EXECLEAD.AI Founding Member program. Your application {{application_id}} has been received and is now pending review.\n\nOur admissions team will review your application within 3-5 business days.\n\nApplication ID: {{application_id}}\nStatus: Submitted\n\nBest regards,\nThe EXECLEAD.AI Admissions Team",
  },
  email_verification: {
    label: "Email Verification",
    subject: "Verify your email — EXECLEAD.AI",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#06b6d4;">Verify Your Email</h1><p>Dear {{applicant_name}},</p><p>Please verify your email address to activate your Founding Member application.</p><p>Click the verification link below to confirm your email and continue the admissions process.</p><p style="margin-top:24px;"><a href="#" style="background:#06b6d4;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a></p><p>Application ID: {{application_id}}</p></div>`,
    text: "Dear {{applicant_name}},\n\nPlease verify your email address to activate your Founding Member application.\n\nApplication ID: {{application_id}}",
  },
  additional_info_requested: {
    label: "Additional Information Requested",
    subject: "Additional information required — Application {{application_id}}",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#f97316;">Additional Information Required</h1><p>Dear {{applicant_name}},</p><p>Our admissions team has reviewed your application <strong>{{application_id}}</strong> and requires additional information to proceed.</p><p style="margin-top:16px;padding:16px;background:#1e1e2a;border-radius:8px;"><strong>Requested:</strong> {{status}}<br/><strong>Response deadline:</strong> {{deadline}}</p><p>Please log in to your application portal to provide the requested information before the deadline.</p><p>Reviewer: {{reviewer_name}}</p></div>`,
    text: "Dear {{applicant_name}},\n\nOur admissions team requires additional information for your application {{application_id}}.\n\nRequested: {{status}}\nResponse deadline: {{deadline}}\nReviewer: {{reviewer_name}}",
  },
  interview_invitation: {
    label: "Interview Invitation",
    subject: "Interview invitation — EXECLEAD.AI Founding Member",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#8b5cf6;">Interview Invitation</h1><p>Dear {{applicant_name}},</p><p>Congratulations! Your application <strong>{{application_id}}</strong> has been selected for an interview.</p><p style="margin-top:16px;padding:16px;background:#1e1e2a;border-radius:8px;"><strong>Type:</strong> {{interview_type}}<br/><strong>Date:</strong> {{interview_date}}<br/><strong>Time:</strong> {{interview_time}}</p>{{meeting_link}}<p>Reviewer: {{reviewer_name}}</p></div>`,
    text: "Dear {{applicant_name}},\n\nYour application {{application_id}} has been selected for an interview.\n\nType: {{interview_type}}\nDate: {{interview_date}}\nTime: {{interview_time}}\nMeeting Link: {{meeting_link}}\nReviewer: {{reviewer_name}}",
  },
  approved: {
    label: "Application Approved",
    subject: "Congratulations — Your application has been approved",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#10b981;">Application Approved 🎉</h1><p>Dear {{applicant_name}},</p><p>We are thrilled to inform you that your Founding Member application <strong>{{application_id}}</strong> has been <strong style="color:#10b981;">approved</strong>.</p><p>Welcome to the first executive cohort of EXECLEAD.AI. Your Founding Member invitation will follow shortly.</p><p>Reviewer: {{reviewer_name}}</p></div>`,
    text: "Dear {{applicant_name}},\n\nWe are thrilled to inform you that your Founding Member application {{application_id}} has been approved.\n\nWelcome to the first executive cohort of EXECLEAD.AI.\n\nReviewer: {{reviewer_name}}",
  },
  invitation_sent: {
    label: "Invitation Sent",
    subject: "Your Founding Member invitation is ready",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#06b6d4;">Founding Member Invitation</h1><p>Dear {{applicant_name}},</p><p>Your Founding Member invitation is ready! Click the link below to activate your account and join the EXECLEAD.AI platform.</p><p style="margin-top:24px;"><a href="#" style="background:#06b6d4;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Activate Account</a></p><p>Application ID: {{application_id}}</p></div>`,
    text: "Dear {{applicant_name}},\n\nYour Founding Member invitation is ready. Please activate your account to join EXECLEAD.AI.\n\nApplication ID: {{application_id}}",
  },
  activation_instructions: {
    label: "Activation Instructions",
    subject: "Activate your EXECLEAD.AI account",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#10b981;">Welcome to EXECLEAD.AI</h1><p>Dear {{applicant_name}},</p><p>Your account is ready. Complete your profile to start your executive leadership journey.</p><p style="margin-top:24px;"><a href="#" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Complete Profile</a></p></div>`,
    text: "Dear {{applicant_name}},\n\nYour account is ready. Complete your profile to start your executive leadership journey.",
  },
  rejected: {
    label: "Application Rejected",
    subject: "Update on your Founding Member application",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#ef4444;">Application Update</h1><p>Dear {{applicant_name}},</p><p>Thank you for your interest in the EXECLEAD.AI Founding Member program. After careful review, we are unable to proceed with your application <strong>{{application_id}}</strong> at this time.</p><p>We appreciate the time and effort you invested in your application and encourage you to apply again in the future.</p><p>Reviewer: {{reviewer_name}}</p></div>`,
    text: "Dear {{applicant_name}},\n\nThank you for your interest in the EXECLEAD.AI Founding Member program. After careful review, we are unable to proceed with your application {{application_id}} at this time.\n\nReviewer: {{reviewer_name}}",
  },
  waitlisted: {
    label: "Waitlisted",
    subject: "You've been added to the Executive Waitlist",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#f59e0b;">Executive Waitlist</h1><p>Dear {{applicant_name}},</p><p>The Founding Member program has reached capacity. You've been added to our Executive Waitlist and will be notified when spots open.</p></div>`,
    text: "Dear {{applicant_name}},\n\nThe Founding Member program has reached capacity. You've been added to our Executive Waitlist.",
  },
  reminder: {
    label: "Reminder",
    subject: "Reminder — Action required for application {{application_id}}",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#f59e0b;">Action Required</h1><p>Dear {{applicant_name}},</p><p>This is a reminder that action is required on your application <strong>{{application_id}}</strong>.</p><p>Deadline: {{deadline}}</p></div>`,
    text: "Dear {{applicant_name}},\n\nThis is a reminder that action is required on your application {{application_id}}.\n\nDeadline: {{deadline}}",
  },
  graduation: {
    label: "Graduation",
    subject: "Congratulations — You've graduated to General Availability",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e5e7eb;padding:40px;"><h1 style="color:#10b981;">Graduation 🎓</h1><p>Dear {{applicant_name}},</p><p>Congratulations! You've successfully completed the Founding Beta program and graduated to General Availability.</p><p>Thank you for being a Founding Member of EXECLEAD.AI.</p></div>`,
    text: "Dear {{applicant_name}},\n\nCongratulations! You've successfully completed the Founding Beta program and graduated to General Availability.",
  },
};

// ============================================================
// TEMPLATE RENDERING
// ============================================================
export function renderVariables(text, variables = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] ?? match);
}

// ============================================================
// EMAIL SENDING
// ============================================================
export async function sendAdmissionsEmail(application, templateName, variables = {}, customContent = null) {
  const subject = customContent?.subject || (EMAIL_TEMPLATES[templateName] ? renderVariables(EMAIL_TEMPLATES[templateName].subject, variables) : "EXECLEAD.AI Update");
  const htmlBody = customContent?.html || (EMAIL_TEMPLATES[templateName] ? renderVariables(EMAIL_TEMPLATES[templateName].html, variables) : customContent?.text || "");
  const textBody = customContent?.text || (EMAIL_TEMPLATES[templateName] ? renderVariables(EMAIL_TEMPLATES[templateName].text, variables) : "");

  const emailRecord = {
    subject,
    recipient: application.email,
    provider: ACTIVE_EMAIL_PROVIDER,
    template: templateName || "custom",
    sent_at: new Date().toISOString(),
    status: "queued",
    opened: false,
    clicked: false,
    retry_count: 0,
    failure_reason: null,
    message_id: null,
  };

  try {
    emailRecord.status = "sending";
    const response = await base44.functions.invoke("sendAdmissionsEmail", {
      recipient: application.email,
      subject,
      html_body: htmlBody,
      text_body: textBody,
    });
    const result = response.data || response;

    if (result.status === "delivered") {
      emailRecord.status = "delivered";
      emailRecord.message_id = result.message_id;
      emailRecord.sent_at = result.sent_at || emailRecord.sent_at;
    } else {
      emailRecord.status = "failed";
      emailRecord.failure_reason = result.failure_reason || "Unknown delivery error";
      emailRecord.retry_count = 1;
    }
  } catch (err) {
    emailRecord.status = "failed";
    emailRecord.failure_reason = err.message || "Email delivery failed";
    emailRecord.retry_count = 1;
  }

  return emailRecord;
}

// ============================================================
// EMAIL HISTORY PARSING
// ============================================================
export function parseEmailHistory(json) {
  try { return JSON.parse(json || "[]"); } catch { return []; }
}

export function getEmailDeliveryStats(records = []) {
  const allEmails = records.flatMap((r) => parseEmailHistory(r.email_history_json));
  return {
    total: allEmails.length,
    delivered: allEmails.filter((e) => e.status === "delivered").length,
    failed: allEmails.filter((e) => e.status === "failed").length,
    opened: allEmails.filter((e) => e.opened).length,
    clicked: allEmails.filter((e) => e.clicked).length,
    bounced: allEmails.filter((e) => e.status === "bounced").length,
    queued: allEmails.filter((e) => e.status === "queued").length,
  };
}

// ============================================================
// REQUEST INFORMATION REASONS
// ============================================================
export const INFO_REQUEST_REASONS = [
  "Resume Incomplete",
  "Employment Verification Required",
  "LinkedIn Profile Required",
  "Leadership Experience Clarification",
  "Certification Evidence Required",
  "Portfolio Requested",
  "Business Email Verification",
  "Other",
];

export const INTERVIEW_TYPES = [
  { value: "video", label: "Video Call" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "phone", label: "Phone" },
];

export const RESPONSE_DEADLINES = [
  { value: 3, label: "3 Days" },
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 0, label: "Custom Date" },
];