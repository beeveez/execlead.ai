// ============================================================
// ENTERPRISE EMAIL TEMPLATES
// HTML emails for the Order-to-Cash workflow.
// ============================================================

export function buildContractReadyEmail(d) {
  return `<html><body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #0a0a0f; padding: 30px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">EXECLEAD.AI</h1>
      <p style="color: #818cf8; margin: 5px 0 0; font-size: 14px;">Your Contract is Ready for Signature</p>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 15px;">Hi ${d.name || "there"},</p>
      <p style="color: #555; font-size: 15px;">Your enterprise proposal has been accepted and your Master Service Agreement + Subscription Agreement is ready for electronic signature.</p>
      <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="color: #71717a; padding: 6px 0;">Proposal:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.proposalNumber}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Contract Value:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.contractValue}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Valid Until:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.validUntil}</td></tr>
        </table>
      </div>
      <p style="color: #555; font-size: 15px;">Please review and sign the contract to proceed to payment and activation.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${d.quoteUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px;">Review & Sign Contract</a>
        <a href="${d.contractUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px;">Download Contract PDF</a>
      </div>
      <p style="color: #a1a1aa; font-size: 12px; line-height: 1.6;">If the buttons don't work, copy these links:<br>Review: ${d.quoteUrl}<br>Download: ${d.contractUrl}</p>
    </div>
    <div style="background: #f4f4f5; padding: 20px; text-align: center;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">EXECLEAD.AI — Develop Executive Leaders. Not Interview Candidates.</p>
    </div>
  </div>
</body></html>`;
}

export function buildPaymentConfirmationEmail(d) {
  const methodLabel = {
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
    wire_transfer: "Wire Transfer",
    purchase_order: "Purchase Order",
  }[d.method] || d.method;

  return `<html><body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <div style="background: #0a0a0f; padding: 30px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">EXECLEAD.AI</h1>
      <p style="color: #10b981; margin: 5px 0 0; font-size: 14px;">Payment Confirmed ✓</p>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 15px;">Hi ${d.name || "there"},</p>
      <p style="color: #555; font-size: 15px;">We've received your payment and are now provisioning your enterprise subscription.</p>
      <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="color: #71717a; padding: 6px 0;">Proposal:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.proposalNumber}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Amount:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.amount}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Method:</td><td style="text-align: right; color: #333;">${methodLabel}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Transaction ID:</td><td style="text-align: right; color: #333; font-family: monospace; font-size: 12px;">${d.transactionId}</td></tr>
        </table>
      </div>
      <p style="color: #555; font-size: 15px;">Your organization is being activated. You'll receive a welcome email shortly with your admin portal access.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${d.quoteUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Track Activation Status</a>
      </div>
    </div>
    <div style="background: #f4f4f5; padding: 20px; text-align: center;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">EXECLEAD.AI — Develop Executive Leaders. Not Interview Candidates.</p>
    </div>
  </div>
</body></html>`;
}

export function buildWelcomeEmail(d) {
  return `<html><body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <div style="background: #0a0a0f; padding: 30px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to EXECLEAD.AI Enterprise 🎉</h1>
      <p style="color: #818cf8; margin: 5px 0 0; font-size: 14px;">Your subscription is now active</p>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 15px;">Hi ${d.name || "there"},</p>
      <p style="color: #555; font-size: 15px;">Your enterprise subscription for <strong>${d.organization}</strong> has been fully activated. Here's what's been provisioned for your team:</p>
      <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="color: #71717a; padding: 6px 0;">Organization:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.organization}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Licensed Seats:</td><td style="font-weight: bold; text-align: right; color: #333;">${d.seats}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Contract Renewal:</td><td style="text-align: right; color: #333;">${d.contractEnd}</td></tr>
          <tr><td style="color: #71717a; padding: 6px 0;">Proposal Ref:</td><td style="text-align: right; color: #333;">${d.proposalNumber}</td></tr>
        </table>
      </div>
      <p style="color: #555; font-size: 15px;">As the Enterprise Admin, you can manage seats, invite users, track usage, and configure your organization through the Customer Portal.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${d.portalUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">Access Customer Portal</a>
      </div>
      <p style="color: #a1a1aa; font-size: 12px; line-height: 1.6;">Portal link: ${d.portalUrl}</p>
    </div>
    <div style="background: #f4f4f5; padding: 20px; text-align: center;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">EXECLEAD.AI — Develop Executive Leaders. Not Interview Candidates.</p>
    </div>
  </div>
</body></html>`;
}