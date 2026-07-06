import { base44 } from "@/api/base44Client";

// ============================================================
// EMAIL PROVIDER ABSTRACTION LAYER
// Supports: Resend (preferred), SendGrid, Amazon SES
// All providers route through the platform's Core.SendEmail
// transport. When Builder+ backend functions are added, each
// provider would dispatch to its own API endpoint.
// ============================================================

export const EMAIL_PROVIDERS = {
  resend: { id: "resend", name: "Resend", description: "Preferred — modern transactional email API", status: "available" },
  sendgrid: { id: "sendgrid", name: "SendGrid", description: "Twilio SendGrid", status: "available" },
  ses: { id: "ses", name: "Amazon SES", description: "AWS Simple Email Service", status: "available" },
};

let _cachedSettings = null;

export async function getEmailSettings() {
  if (_cachedSettings) return _cachedSettings;
  try {
    const list = await base44.entities.EmailSettings.filter({ is_active: true });
    _cachedSettings = list[0] || null;
  } catch (e) {
    _cachedSettings = null;
  }
  return _cachedSettings;
}

export function clearEmailSettingsCache() {
  _cachedSettings = null;
}

// ============================================================
// SEND TRANSACTIONAL EMAIL
// Checks provider config, sends email, logs every event.
// Never silently fails — returns explicit status.
// ============================================================

export async function sendTransactionalEmail({ to, subject, html, emailType, entityId, entityName }) {
  const settings = await getEmailSettings();

  // No provider configured — do not send, log the event
  if (!settings) {
    await logEmailEvent({
      recipient: to,
      subject,
      delivery_status: "not_configured",
      error_message: "Email provider not configured",
      email_type: emailType,
      entity_id: entityId,
      entity_name: entityName,
      provider: "none",
    });
    return { sent: false, configured: false, error: "Email provider not configured" };
  }

  const provider = settings.provider || "resend";

  try {
    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body: html,
      from_name: settings.from_name || "EXECLEAD.AI",
    });

    await logEmailEvent({
      recipient: to,
      subject,
      delivery_status: "sent",
      error_message: "",
      email_type: emailType,
      entity_id: entityId,
      entity_name: entityName,
      provider,
    });

    return { sent: true, configured: true, provider };
  } catch (e) {
    const errorMsg = e?.message || "Failed to send email";

    await logEmailEvent({
      recipient: to,
      subject,
      delivery_status: "failed",
      error_message: errorMsg,
      email_type: emailType,
      entity_id: entityId,
      entity_name: entityName,
      provider,
    });

    return { sent: false, configured: true, error: errorMsg };
  }
}

async function logEmailEvent(data) {
  try {
    await base44.entities.EmailEvent.create({
      recipient: data.recipient,
      subject: data.subject,
      delivery_status: data.delivery_status,
      error_message: data.error_message,
      email_type: data.email_type || "",
      entity_id: data.entity_id || "",
      entity_name: data.entity_name || "",
      provider: data.provider || "",
    });
  } catch (e) {}
}

// ============================================================
// EMAIL TEMPLATE BUILDERS
// ============================================================

export function buildProposalConfirmationEmail(d) {
  return `<html><body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #0a0a0f; padding: 30px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">EXECLEAD.AI</h1>
      <p style="color: #818cf8; margin: 5px 0 0; font-size: 14px;">Enterprise Proposal Confirmation</p>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 15px;">Hi ${d.name || "there"},</p>
      <p style="color: #555; font-size: 15px;">Thank you for your interest in EXECLEAD.AI Enterprise. Your proposal has been received and is now under review.</p>
      <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="color: #71717a; padding: 6px 0;">Proposal Number:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.proposalNumber}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Organization:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.organization}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Status:</td><td style="font-weight: bold; text-align: right; color: #f59e0b; text-transform: capitalize;">${d.status}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Contract Value:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.contractValue}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Valid Until:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.validUntil}</td></tr>
        </table>
      </div>
      <p style="color: #555; font-size: 15px;">Our enterprise team will contact you within 24 hours to discuss next steps.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${d.viewUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px;">View Proposal</a>
        <a href="${d.downloadUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px;">Download Proposal</a>
        <a href="mailto:sales@execlead.ai" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px;">Contact Sales</a>
      </div>
      <p style="color: #a1a1aa; font-size: 12px; line-height: 1.6;">If the buttons above don't work, copy and paste these links into your browser:<br>View: ${d.viewUrl}<br>Download: ${d.downloadUrl}</p>
    </div>
    <div style="background: #f4f4f5; padding: 20px; text-align: center;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">EXECLEAD.AI — Develop Executive Leaders. Not Interview Candidates.</p>
    </div>
  </div>
</body></html>`;
}

export function buildSalesNotificationEmail(d) {
  return `<html><body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <div style="background: #0a0a0f; padding: 25px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">New Enterprise Proposal</h1>
      <p style="color: #818cf8; margin: 5px 0 0; font-size: 13px;">Sales Notification</p>
    </div>
    <div style="padding: 25px;">
      ${d.requiresApproval ? '<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin-bottom: 15px; color: #92400e; font-size: 14px; font-weight: bold;">⚠ Discount approval required</div>' : ''}
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="color: #71717a; padding: 5px 0;">Proposal:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.proposalNumber}</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Organization:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.organization}</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Industry:</td><td style="text-align: right; color: #333;">${d.industry}</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Country:</td><td style="text-align: right; color: #333;">${d.country}</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Contact:</td><td style="text-align: right; color: #333;">${d.email}</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Seats:</td><td style="text-align: right; color: #333;">${d.seats}</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Contract:</td><td style="text-align: right; color: #333;">${d.contractLength} year(s)</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Annual Value:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.currency} ${d.annualValue}</td></tr>
        <tr><td style="color: #71717a; padding: 5px 0;">Grand Total:</td><td style="font-weight: bold; text-align: right; color: #10b981;">${d.currency} ${d.total}</td></tr>
      </table>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${d.quoteUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Review Proposal</a>
      </div>
    </div>
  </div>
</body></html>`;
}