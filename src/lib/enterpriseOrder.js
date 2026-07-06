import { base44 } from "@/api/base44Client";
import { generateContractPDF } from "@/lib/contractPdf";
import { processEnterprisePayment } from "@/lib/enterprisePayments";
import { buildWelcomeEmail, buildContractReadyEmail, buildPaymentConfirmationEmail } from "@/lib/enterpriseEmail";
import { sendTransactionalEmail } from "@/lib/emailProvider";
import { logBillingEvent } from "@/lib/payments";

// ============================================================
// ENTERPRISE ORDER-TO-CASH WORKFLOW ENGINE
// Status flow:
//   draft → submitted → accepted → contract_signed →
//   invoice_issued → payment_pending → paid →
//   provisioned → active
// ============================================================

export const WORKFLOW_STAGES = [
  { key: "created", label: "Proposal Created", status: "draft" },
  { key: "submitted", label: "Submitted", status: "submitted" },
  { key: "accepted", label: "Accepted", status: "accepted" },
  { key: "contract_signed", label: "Contract Signed", status: "contract_signed" },
  { key: "invoice_issued", label: "Invoice Issued", status: "invoice_issued" },
  { key: "payment_pending", label: "Payment Pending", status: "payment_pending" },
  { key: "paid", label: "Paid", status: "paid" },
  { key: "provisioned", label: "Organization Provisioned", status: "provisioned" },
  { key: "active", label: "Enterprise Active", status: "active" },
];

export function getWorkflowStage(status) {
  const idx = WORKFLOW_STAGES.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

// ============================================================
// 1. ACCEPT PROPOSAL
// Locks pricing, generates MSA + Subscription Agreement,
// generates invoice, enables customer portal.
// ============================================================

export async function acceptProposal(quote, breakdown, catalog) {
  const now = new Date().toISOString();
  const invoiceNumber = `INV-${quote.proposal_number}-${Date.now().toString().slice(-6)}`;

  // Generate contract PDF (MSA + Subscription Agreement)
  const contractUrl = await generateContractPDF(quote, breakdown, catalog);

  // Create invoice
  const periodStart = new Date().toISOString().split("T")[0];
  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + (quote.contract_length_years || 1));

  let me = null;
  try { me = await base44.auth.me(); } catch (e) {}

  const invoice = await base44.entities.Invoice.create({
    invoice_number: invoiceNumber,
    owner_user_id: me?.id || quote.created_by_id || "",
    organization_name: quote.organization_name,
    amount: quote.grand_total || breakdown.grandTotal,
    currency: quote.currency || "USD",
    status: "pending",
    period_start: periodStart,
    period_end: periodEnd.toISOString().split("T")[0],
    plan: "enterprise",
    billing_cycle: "annual",
  });

  // Update quote — lock pricing, attach contract + invoice, enable portal
  const updated = await base44.entities.CPQQuote.update(quote.id, {
    status: "accepted",
    accepted_at: now,
    accepted_by_name: me?.full_name || me?.email || quote.customer_email,
    contract_url: contractUrl,
    invoice_id: invoice.id,
    invoice_number: invoiceNumber,
    portal_enabled: true,
    payment_status: "pending",
  });

  // Send contract-ready email
  const quoteUrl = `${window.location.origin}/cpq/quote/${quote.id}`;
  await sendTransactionalEmail({
    to: quote.customer_email || me?.email,
    subject: `Contract Ready — ${quote.proposal_number}`,
    html: buildContractReadyEmail({
      name: quote.organization_name,
      proposalNumber: quote.proposal_number,
      contractValue: `${quote.currency} ${(quote.grand_total || 0).toLocaleString()}`,
      validUntil: quote.valid_until,
      contractUrl,
      quoteUrl,
    }),
    emailType: "contract_ready",
    entityId: quote.id,
    entityName: quote.organization_name,
  });

  // Log + notify
  await Promise.allSettled([
    logBillingEvent({
      event_type: "subscription_created",
      status: "success",
      amount: quote.grand_total || 0,
      currency: quote.currency || "USD",
      plan_id: "enterprise",
      billing_cycle: "annual",
      invoice_number: invoiceNumber,
      metadata: { proposal_number: quote.proposal_number, action: "proposal_accepted" },
    }),
    base44.entities.Notification.create({
      type: "subscription",
      title: "Proposal Accepted",
      message: `Your proposal ${quote.proposal_number} has been accepted. Your contract is ready for signature.`,
      icon: "✅",
      action_url: `/cpq/quote/${quote.id}`,
    }),
  ]);

  return { quote: updated, contractUrl, invoiceNumber, invoiceId: invoice.id };
}

// ============================================================
// 2. SIGN CONTRACT
// Records electronic signature, advances to contract_signed.
// ============================================================

export async function signContract(quoteId, { name, title, termsAccepted }) {
  const now = new Date().toISOString();
  const updated = await base44.entities.CPQQuote.update(quoteId, {
    status: "contract_signed",
    contract_signed_at: now,
    signature_name: name,
    signature_title: title,
    terms_accepted: termsAccepted,
  });

  // Issue the invoice now that contract is signed
  const quote = await base44.entities.CPQQuote.get(quoteId);
  if (quote.invoice_id) {
    await base44.entities.Invoice.update(quote.invoice_id, { status: "pending" });
  }

  await base44.entities.CPQQuote.update(quoteId, { status: "invoice_issued" });

  await Promise.allSettled([
    logBillingEvent({
      event_type: "subscription_updated",
      status: "success",
      plan_id: "enterprise",
      billing_cycle: "annual",
      metadata: { action: "contract_signed", signed_by: name, title },
    }),
    base44.entities.Notification.create({
      type: "subscription",
      title: "Contract Signed",
      message: `Your enterprise contract has been signed. Invoice ${quote.invoice_number} has been issued.`,
      icon: "📝",
      action_url: `/cpq/quote/${quoteId}`,
    }),
  ]);

  return await base44.entities.CPQQuote.get(quoteId);
}

// ============================================================
// 3. PROCESS PAYMENT
// Delegates to the payment provider abstraction layer.
// ============================================================

export async function processQuotePayment(quote, paymentData) {
  const now = new Date().toISOString();

  // Mark as payment pending
  await base44.entities.CPQQuote.update(quote.id, {
    status: "payment_pending",
    payment_status: "processing",
    payment_method: paymentData.method,
    payment_provider: paymentData.provider || "",
    po_number: paymentData.poNumber || "",
  });

  const result = await processEnterprisePayment({
    quote,
    method: paymentData.method,
    provider: paymentData.provider,
    amount: quote.grand_total || 0,
    currency: quote.currency || "USD",
    poNumber: paymentData.poNumber,
  });

  if (!result.success) {
    await base44.entities.CPQQuote.update(quote.id, {
      status: "invoice_issued",
      payment_status: "failed",
    });
    return result;
  }

  // Mark invoice as paid
  if (quote.invoice_id) {
    await base44.entities.Invoice.update(quote.invoice_id, { status: "paid" });
  }

  const updated = await base44.entities.CPQQuote.update(quote.id, {
    status: "paid",
    payment_status: "paid",
    payment_transaction_id: result.transaction_id,
    paid_at: now,
  });

  // Send payment confirmation email
  let me = null;
  try { me = await base44.auth.me(); } catch (e) {}
  await sendTransactionalEmail({
    to: quote.customer_email || me?.email,
    subject: `Payment Confirmed — ${quote.proposal_number}`,
    html: buildPaymentConfirmationEmail({
      name: quote.organization_name,
      proposalNumber: quote.proposal_number,
      amount: `${quote.currency} ${(quote.grand_total || 0).toLocaleString()}`,
      transactionId: result.transaction_id,
      method: paymentData.method,
      quoteUrl: `${window.location.origin}/cpq/quote/${quote.id}`,
    }),
    emailType: "payment_confirmation",
    entityId: quote.id,
    entityName: quote.organization_name,
  });

  await logBillingEvent({
    event_type: "payment_success",
    status: "success",
    amount: quote.grand_total || 0,
    currency: quote.currency || "USD",
    provider: paymentData.provider || paymentData.method,
    plan_id: "enterprise",
    billing_cycle: "annual",
    transaction_id: result.transaction_id,
    invoice_number: quote.invoice_number,
    metadata: { method: paymentData.method, proposal_number: quote.proposal_number },
  });

  return { success: true, transaction_id: result.transaction_id, quote: updated };
}

// ============================================================
// 4. ACTIVATE ENTERPRISE
// Creates organization, assigns admin, allocates seats,
// enables modules + AI package, sends welcome email.
// ============================================================

export async function activateEnterprise(quote, breakdown) {
  const now = new Date();
  const contractEnd = new Date(now);
  contractEnd.setFullYear(contractEnd.getFullYear() + (quote.contract_length_years || 1));

  let me = null;
  try { me = await base44.auth.me(); } catch (e) {}

  // Parse config to extract module IDs, AI package, support
  let config = {};
  try { config = JSON.parse(quote.config_json); } catch (e) {}

  // Create Organization
  const org = await base44.entities.Organization.create({
    name: quote.organization_name,
    plan: "enterprise",
    plan_status: "active",
    seats_total: breakdown?.seats || quote.expected_active_users || 10,
    seats_used: 1,
    industry: quote.industry,
    country: quote.country,
    quote_id: quote.id,
    proposal_number: quote.proposal_number,
    ai_package_id: config.aiPackageId || "",
    support_package_id: config.supportPackageId || "",
    enabled_modules: config.moduleIds || [],
    admin_user_id: me?.id || "",
    admin_email: me?.email || quote.customer_email,
    contract_start_date: now.toISOString().split("T")[0],
    contract_end_date: contractEnd.toISOString().split("T")[0],
    renewal_date: contractEnd.toISOString().split("T")[0],
    contract_url: quote.contract_url,
    annual_value: quote.annual_value || 0,
    grand_total: quote.grand_total || 0,
    currency: quote.currency || "USD",
    contract_length_years: quote.contract_length_years || 1,
  });

  // Mark as provisioned
  await base44.entities.CPQQuote.update(quote.id, {
    status: "provisioned",
    organization_id: org.id,
    activated_at: now.toISOString(),
  });

  // Upgrade the user's profile to enterprise
  if (me) {
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          subscription_plan: "enterprise",
          subscription_status: "active",
          subscription_cycle: "annual",
          organization_id: org.id,
        });
      }
    } catch (e) {}
  }

  // Final status: active
  const updated = await base44.entities.CPQQuote.update(quote.id, { status: "active" });

  // Send welcome email
  const portalUrl = `${window.location.origin}/portal/${quote.id}`;
  await sendTransactionalEmail({
    to: quote.customer_email || me?.email,
    subject: `Welcome to EXECLEAD.AI Enterprise — ${quote.organization_name}`,
    html: buildWelcomeEmail({
      name: me?.full_name || quote.organization_name,
      organization: quote.organization_name,
      proposalNumber: quote.proposal_number,
      seats: breakdown?.seats || quote.expected_active_users || 10,
      contractEnd: contractEnd.toLocaleDateString(),
      portalUrl,
    }),
    emailType: "enterprise_welcome",
    entityId: org.id,
    entityName: quote.organization_name,
  });

  await Promise.allSettled([
    logBillingEvent({
      event_type: "subscription_created",
      status: "success",
      amount: quote.grand_total || 0,
      currency: quote.currency || "USD",
      plan_id: "enterprise",
      billing_cycle: "annual",
      metadata: { organization_id: org.id, action: "enterprise_activated" },
    }),
    base44.entities.Notification.create({
      type: "subscription",
      title: "Enterprise Activated 🎉",
      message: `Your enterprise subscription for ${quote.organization_name} is now active. ${breakdown?.seats || 0} seats allocated.`,
      icon: "🎉",
      action_url: `/portal/${quote.id}`,
    }),
  ]);

  return { organization: org, quote: updated };
}

// ============================================================
// 5. REQUEST CHANGES
// Records customer change requests, notifies sales.
// ============================================================

export async function requestChanges(quoteId, notes) {
  const quote = await base44.entities.CPQQuote.get(quoteId);
  const updated = await base44.entities.CPQQuote.update(quoteId, {
    status: "under_review",
    change_request_notes: notes,
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 2);
  await base44.entities.Task.create({
    title: `Revise Proposal ${quote.proposal_number}`,
    description: `${quote.organization_name} requested changes: ${notes}`,
    assignee: "Sales Team",
    status: "open",
    priority: "high",
    due_date: dueDate.toISOString().split("T")[0],
    related_entity_id: quoteId,
    related_entity_type: "cpq_quote",
    task_type: "proposal_revision",
  });

  await base44.entities.Notification.create({
    type: "subscription",
    title: "Change Request Submitted",
    message: `Your change request for ${quote.proposal_number} has been sent to our sales team.`,
    icon: "💬",
    action_url: `/cpq/quote/${quoteId}`,
  });

  return updated;
}

// ============================================================
// 6. SHARE PROPOSAL
// Generates a share token for the proposal.
// ============================================================

export async function shareProposal(quoteId) {
  const token = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  await base44.entities.CPQQuote.update(quoteId, { share_token: token });
  return {
    shareToken: token,
    shareUrl: `${window.location.origin}/cpq/quote/${quoteId}?share=${token}`,
  };
}