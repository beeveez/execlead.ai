import { base44 } from "@/api/base44Client";

// ============================================================
// PROVIDER ABSTRACTION LAYER
// Initially supports Stripe. Architecture designed for future
// providers: PayPal, GCash, Maya, Apple Pay, Google Pay,
// PayNow, Bank Transfer, Enterprise Invoice.
// ============================================================

export const PAYMENT_PROVIDERS = {
  stripe: { id: "stripe", name: "Stripe", icon: "💳", description: "Visa, Mastercard, Amex", status: "active", supportsRecurring: true, supportsRefunds: true, supportsTax: true },
  paypal: { id: "paypal", name: "PayPal", icon: "🅿️", description: "Pay with PayPal balance", status: "coming_soon", supportsRecurring: true, supportsRefunds: true, supportsTax: true },
  apple: { id: "apple", name: "Apple Pay", icon: "", description: "Pay with Apple Pay", status: "active", supportsRecurring: false, supportsRefunds: true, supportsTax: true },
  google: { id: "google", name: "Google Pay", icon: "G", description: "Pay with Google Pay", status: "active", supportsRecurring: false, supportsRefunds: true, supportsTax: true },
  gcash: { id: "gcash", name: "GCash", icon: "📱", description: "Philippines mobile wallet", status: "coming_soon", supportsRecurring: false, supportsRefunds: false, supportsTax: false },
  maya: { id: "maya", name: "Maya", icon: "💳", description: "Philippines digital wallet", status: "coming_soon", supportsRecurring: false, supportsRefunds: false, supportsTax: false },
  paynow: { id: "paynow", name: "PayNow", icon: "🏦", description: "Singapore instant transfer", status: "coming_soon", supportsRecurring: false, supportsRefunds: false, supportsTax: false },
  bank_transfer: { id: "bank_transfer", name: "Bank Transfer", icon: "🏦", description: "Direct bank transfer", status: "coming_soon", supportsRecurring: false, supportsRefunds: false, supportsTax: false },
  enterprise_invoice: { id: "enterprise_invoice", name: "Enterprise Invoice", icon: "📄", description: "Annual contracts & POs", status: "active", supportsRecurring: true, supportsRefunds: true, supportsTax: true },
};

export const ACTIVE_PROVIDERS = Object.values(PAYMENT_PROVIDERS).filter((p) => p.status === "active");

// ============================================================
// PAYMENT ERROR HANDLING
// ============================================================

export const PAYMENT_ERRORS = {
  CARD_DECLINED: { code: "card_declined", message: "Your card was declined. Please try a different card or contact your bank." },
  EXPIRED_CARD: { code: "expired_card", message: "Your card has expired. Please update your payment method." },
  INSUFFICIENT_FUNDS: { code: "insufficient_funds", message: "Your card has insufficient funds. Please try a different card." },
  PROCESSING_ERROR: { code: "processing_error", message: "An error occurred while processing your payment. Please try again." },
  NETWORK_ERROR: { code: "network_error", message: "Network error. Please check your connection and try again." },
  DUPLICATE_PAYMENT: { code: "duplicate_payment", message: "This payment may have already been processed. Please check your billing history." },
  CANCELLED: { code: "cancelled", message: "Payment was cancelled." },
  PROVIDER_NOT_CONFIGURED: { code: "provider_not_configured", message: "Payment processing is not yet configured. Please contact support." },
  INVALID_COUPON: { code: "invalid_coupon", message: "The coupon code is invalid or has expired." },
};

export function getPaymentError(error) {
  if (!error) return PAYMENT_ERRORS.PROCESSING_ERROR;
  const msg = (error.message || error.toString() || "").toLowerCase();
  if (msg.includes("decline")) return PAYMENT_ERRORS.CARD_DECLINED;
  if (msg.includes("expired")) return PAYMENT_ERRORS.EXPIRED_CARD;
  if (msg.includes("insufficient")) return PAYMENT_ERRORS.INSUFFICIENT_FUNDS;
  if (msg.includes("network") || msg.includes("timeout")) return PAYMENT_ERRORS.NETWORK_ERROR;
  if (msg.includes("cancel")) return PAYMENT_ERRORS.CANCELLED;
  if (msg.includes("duplicate")) return PAYMENT_ERRORS.DUPLICATE_PAYMENT;
  return PAYMENT_ERRORS.PROCESSING_ERROR;
}

// ============================================================
// WEBHOOK EVENT TYPES
// These events should be handled by a backend webhook endpoint
// (requires Builder+). The BillingEvent entity logs all events.
// ============================================================

export const WEBHOOK_EVENTS = {
  PAYMENT_SUCCEEDED: "payment_succeeded",
  PAYMENT_FAILED: "payment_failed",
  SUBSCRIPTION_CREATED: "subscription_created",
  SUBSCRIPTION_UPDATED: "subscription_updated",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  REFUND_PROCESSED: "refund_processed",
  TRIAL_STARTED: "trial_started",
  TRIAL_ENDING: "trial_ending",
  TRIAL_ENDED: "trial_ended",
  INVOICE_PAID: "invoice_paid",
  INVOICE_FAILED: "invoice_failed",
};

// ============================================================
// DEVELOPER UNLIMITED PLAN
// Hidden plan for super admins. Never charged, never loses access.
// ============================================================

export const DEVELOPER_PLAN_ID = "developer_unlimited";

export function isDeveloperUnlimited(profile) {
  return profile?.subscription_plan === DEVELOPER_PLAN_ID;
}

// ============================================================
// CURRENCIES & COUNTRIES
// ============================================================

export const CURRENCIES = {
  USD: { symbol: "$", label: "US Dollar" },
  EUR: { symbol: "€", label: "Euro" },
  GBP: { symbol: "£", label: "British Pound" },
  CAD: { symbol: "C$", label: "Canadian Dollar" },
  AUD: { symbol: "A$", label: "Australian Dollar" },
  INR: { symbol: "₹", label: "Indian Rupee" },
};

export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", taxRate: 0 },
  { code: "GB", name: "United Kingdom", currency: "GBP", taxRate: 0.2 },
  { code: "DE", name: "Germany", currency: "EUR", taxRate: 0.19 },
  { code: "FR", name: "France", currency: "EUR", taxRate: 0.2 },
  { code: "ES", name: "Spain", currency: "EUR", taxRate: 0.21 },
  { code: "IT", name: "Italy", currency: "EUR", taxRate: 0.22 },
  { code: "NL", name: "Netherlands", currency: "EUR", taxRate: 0.21 },
  { code: "CA", name: "Canada", currency: "CAD", taxRate: 0.05 },
  { code: "AU", name: "Australia", currency: "AUD", taxRate: 0.1 },
  { code: "IN", name: "India", currency: "INR", taxRate: 0.18 },
  { code: "JP", name: "Japan", currency: "USD", taxRate: 0.1 },
  { code: "SG", name: "Singapore", currency: "USD", taxRate: 0.08 },
  { code: "AE", name: "United Arab Emirates", currency: "USD", taxRate: 0.05 },
  { code: "BR", name: "Brazil", currency: "USD", taxRate: 0.17 },
  { code: "MX", name: "Mexico", currency: "USD", taxRate: 0.16 },
];

export const TRIAL_DURATIONS = [
  { days: 7, label: "7-Day Trial" },
  { days: 14, label: "14-Day Trial" },
  { days: 30, label: "30-Day Trial" },
];

export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

export function calculateTax(countryCode, amount) {
  if (amount <= 0) return 0;
  const country = getCountry(countryCode);
  return Math.round(amount * country.taxRate * 100) / 100;
}

export function formatCurrency(amount, currency = "USD") {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  return `${c.symbol}${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================
// PAYMENT SETTINGS MANAGEMENT
// ============================================================

export async function getPaymentSettings() {
  try {
    const settings = await base44.entities.PaymentSettings.list();
    return settings[0] || null;
  } catch (e) {
    return null;
  }
}

export async function savePaymentSettings(settings) {
  try {
    const existing = await getPaymentSettings();
    if (existing) {
      return await base44.entities.PaymentSettings.update(existing.id, settings);
    }
    return await base44.entities.PaymentSettings.create({ provider: "stripe", ...settings });
  } catch (e) {
    throw e;
  }
}

// ============================================================
// BILLING AUDIT LOG
// All billing events are logged for compliance and debugging.
// ============================================================

export async function logBillingEvent(event) {
  try {
    await base44.entities.BillingEvent.create({
      event_type: event.event_type,
      status: event.status || "success",
      amount: event.amount || 0,
      currency: event.currency || "USD",
      provider: event.provider || "",
      plan_id: event.plan_id || "",
      billing_cycle: event.billing_cycle || "",
      transaction_id: event.transaction_id || "",
      invoice_number: event.invoice_number || "",
      coupon_code: event.coupon_code || "",
      error_message: event.error_message || "",
      metadata: event.metadata ? JSON.stringify(event.metadata) : "",
    });
  } catch (e) {}
}

// ============================================================
// COUPON MANAGEMENT
// ============================================================

export async function validateCoupon(code, planId) {
  if (!code) return { valid: false, error: "Enter a coupon code" };
  try {
    const coupons = await base44.entities.Coupon.filter({ code: code.toUpperCase().trim(), is_active: true });
    const coupon = coupons[0];
    if (!coupon) return { valid: false, error: "Invalid coupon code" };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, error: "This coupon has expired" };
    }
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return { valid: false, error: "This coupon has reached its usage limit" };
    }
    if (coupon.applicable_plans?.length > 0 && !coupon.applicable_plans.includes(planId)) {
      return { valid: false, error: "This coupon is not valid for the selected plan" };
    }
    return { valid: true, coupon };
  } catch (e) {
    return { valid: false, error: "Failed to validate coupon" };
  }
}

export function calculateDiscount(coupon, amount) {
  if (!coupon || amount <= 0) return 0;
  if (coupon.discount_type === "percentage") {
    return Math.round(amount * (coupon.discount_value / 100) * 100) / 100;
  }
  return Math.min(coupon.discount_value, amount);
}

export async function incrementCouponUsage(couponId) {
  try {
    const coupon = await base44.entities.Coupon.get(couponId);
    await base44.entities.Coupon.update(couponId, { used_count: (coupon.used_count || 0) + 1 });
    await logBillingEvent({ event_type: "coupon_applied", status: "success", coupon_code: coupon.code });
  } catch (e) {}
}

// ============================================================
// PAYMENT PROCESSING
// In production with Builder+, this would call a backend function
// that creates a Stripe Checkout Session and returns a redirect URL.
// The backend function would use the secret key from PaymentSettings.
// EXECLEAD.AI never stores credit card information — all card data
// is handled by the payment provider via secure tokens.
// ============================================================

export async function processPayment({ provider, amount, currency, planId, billingCycle, coupon, billingAddress }) {
  const transaction_id = `txn_${Date.now()}`;

  await logBillingEvent({
    event_type: "checkout_completed",
    status: "pending",
    amount,
    currency: currency || "USD",
    provider,
    plan_id: planId,
    billing_cycle: billingCycle,
    coupon_code: coupon?.code || "",
  });

  await logBillingEvent({
    event_type: "payment_success",
    status: "success",
    amount,
    currency: currency || "USD",
    provider,
    plan_id: planId,
    billing_cycle: billingCycle,
    transaction_id,
    coupon_code: coupon?.code || "",
  });

  return {
    success: true,
    transaction_id,
    provider,
    amount,
    currency: currency || "USD",
  };
}

export async function startTrial({ planId, trialDays = 14 }) {
  const trialEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

  await logBillingEvent({
    event_type: "trial_started",
    status: "success",
    plan_id: planId,
    metadata: { trial_days: trialDays, trial_end: trialEnd.toISOString() },
  });

  return {
    success: true,
    trial_id: `trial_${Date.now()}`,
    planId,
    trialDays,
    trial_end: trialEnd.toISOString(),
  };
}

// ============================================================
// SUBSCRIPTION MANAGEMENT
// Supports upgrade (immediate, prorated), downgrade (next cycle),
// cancel, resume, and cycle switching.
// ============================================================

const PLAN_TIER_ORDER = { free: 0, professional: 1, executive: 2, enterprise: 3, developer_unlimited: 4 };

export async function changeSubscription({ profile, newPlan, billingCycle, currentPlan }) {
  const currentTier = PLAN_TIER_ORDER[currentPlan?.id] ?? 0;
  const newTier = PLAN_TIER_ORDER[newPlan.id] ?? 0;
  const isUpgrade = newTier > currentTier;
  const isDowngrade = newTier < currentTier;

  if (isUpgrade) {
    const amount = billingCycle === "annual" ? newPlan.annualPrice : newPlan.monthlyPrice;
    const result = await processPayment({
      provider: "stripe",
      amount,
      currency: newPlan.currency || "USD",
      planId: newPlan.id,
      billingCycle,
    });

    if (result.success) {
      const now = new Date();
      const periodEnd = new Date(now);
      if (billingCycle === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setMonth(periodEnd.getMonth() + 1);

      await base44.entities.UserProfile.update(profile.id, {
        subscription_plan: newPlan.id,
        subscription_status: "active",
        subscription_cycle: billingCycle,
      });

      const invoiceNumber = `INV-${Date.now()}`;
      await base44.entities.Invoice.create({
        amount,
        currency: newPlan.currency || "USD",
        status: "paid",
        period_start: now.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
        plan: newPlan.id,
        billing_cycle: billingCycle,
        invoice_number: invoiceNumber,
      });

      await logBillingEvent({
        event_type: "subscription_updated",
        status: "success",
        amount,
        currency: newPlan.currency || "USD",
        provider: "stripe",
        plan_id: newPlan.id,
        billing_cycle: billingCycle,
        transaction_id: result.transaction_id,
        invoice_number: invoiceNumber,
        metadata: { action: "upgrade", from: currentPlan?.id, to: newPlan.id },
      });

      return { success: true, action: "upgrade", transaction_id: result.transaction_id };
    }
    return { success: false, error: result.error || "Upgrade failed" };
  }

  if (isDowngrade) {
    await base44.entities.UserProfile.update(profile.id, {
      subscription_plan: newPlan.id,
      subscription_status: "active",
      subscription_cycle: billingCycle,
    });

    await logBillingEvent({
      event_type: "subscription_updated",
      status: "success",
      provider: "stripe",
      plan_id: newPlan.id,
      billing_cycle: billingCycle,
      metadata: { action: "downgrade", from: currentPlan?.id, to: newPlan.id, effective: "next_cycle" },
    });

    return { success: true, action: "downgrade", effective: "next_cycle" };
  }

  return { success: false, error: "No change needed" };
}

// ============================================================
// ENTERPRISE BILLING
// Enterprise customers don't purchase directly — they go through
// a sales process: Book Demo, Request Proposal, Contact Sales.
// ============================================================

export async function requestEnterpriseContact(data) {
  try {
    await base44.entities.DemoRequest.create({
      company_name: data.company_name,
      industry: data.industry,
      country: data.country,
      num_employees: data.num_employees,
      num_learners: data.num_learners,
      current_lms: data.current_lms,
      current_leadership_program: data.current_leadership_program,
      business_email: data.business_email,
      phone: data.phone,
      expected_rollout_date: data.expected_rollout_date,
      comments: data.comments,
      status: "new",
    });

    await logBillingEvent({
      event_type: "enterprise_request",
      status: "success",
      metadata: { type: data.contact_type, company: data.company_name },
    });

    return { success: true };
  } catch (e) {
    await logBillingEvent({
      event_type: "enterprise_request",
      status: "failed",
      error_message: e.message,
      metadata: { company: data.company_name },
    });
    return { success: false, error: e.message };
  }
}

// ============================================================
// EMAIL NOTIFICATIONS
// ============================================================

export const EMAIL_TYPES = {
  PAYMENT_CONFIRMATION: "payment_confirmation",
  PAYMENT_FAILED: "payment_failed",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  RENEWAL_REMINDER: "renewal_reminder",
  TRIAL_STARTED: "trial_started",
  TRIAL_ENDING: "trial_ending",
  CPQ_QUOTE_SUBMITTED: "cpq_quote_submitted",
  CPQ_QUOTE_SALES: "cpq_quote_sales",
};

const EMAIL_TEMPLATES = {
  [EMAIL_TYPES.PAYMENT_CONFIRMATION]: (d) => ({
    subject: "Payment Confirmation - EXECLEAD.AI",
    body: `Hi ${d.name || "there"},\n\nYour payment of ${d.amount} has been processed successfully.\n\nPlan: ${d.plan}\nBilling Cycle: ${d.cycle}\nTransaction ID: ${d.transactionId}\n\nThank you for your subscription!\n\nEXECLEAD.AI Team`,
  }),
  [EMAIL_TYPES.PAYMENT_FAILED]: (d) => ({
    subject: "Payment Failed - EXECLEAD.AI",
    body: `Hi ${d.name || "there"},\n\nWe were unable to process your payment of ${d.amount}.\n\nPlease update your payment method to avoid service interruption.\n\nEXECLEAD.AI Team`,
  }),
  [EMAIL_TYPES.SUBSCRIPTION_CANCELED]: (d) => ({
    subject: "Subscription Canceled - EXECLEAD.AI",
    body: `Hi ${d.name || "there"},\n\nYour ${d.plan} subscription has been canceled. You'll retain access until ${d.periodEnd}.\n\nWe hope to see you again soon!\n\nEXECLEAD.AI Team`,
  }),
  [EMAIL_TYPES.SUBSCRIPTION_RENEWED]: (d) => ({
    subject: "Subscription Renewed - EXECLEAD.AI",
    body: `Hi ${d.name || "there"},\n\nYour subscription has been renewed successfully.\n\nPlan: ${d.plan}\nNext billing date: ${d.nextBillingDate}\n\nEXECLEAD.AI Team`,
  }),
  [EMAIL_TYPES.RENEWAL_REMINDER]: (d) => ({
    subject: "Subscription Renewal Reminder - EXECLEAD.AI",
    body: `Hi ${d.name || "there"},\n\nYour subscription will renew on ${d.nextBillingDate}.\n\nAmount: ${d.amount}\nPlan: ${d.plan}\n\nEXECLEAD.AI Team`,
  }),
  [EMAIL_TYPES.TRIAL_STARTED]: (d) => ({
    subject: "Your Trial Has Started - EXECLEAD.AI",
    body: `Hi ${d.name || "there"},\n\nYour ${d.trialDays}-day trial of the ${d.plan} plan has started.\n\nTrial ends on: ${d.trialEnd}\n\nEnjoy exploring all the premium features!\n\nEXECLEAD.AI Team`,
  }),
  [EMAIL_TYPES.TRIAL_ENDING]: (d) => ({
    subject: "Your Trial is Ending Soon - EXECLEAD.AI",
    body: `Hi ${d.name || "there"},\n\nYour trial of the ${d.plan} plan ends on ${d.trialEnd}.\n\nAdd a payment method to continue enjoying premium features.\n\nEXECLEAD.AI Team`,
  }),
  [EMAIL_TYPES.CPQ_QUOTE_SUBMITTED]: (d) => ({
    subject: `Proposal ${d.proposalNumber} - EXECLEAD.AI Enterprise`,
    body: `Hi ${d.name || "there"},\n\nThank you for your interest in EXECLEAD.AI Enterprise.\n\nYour proposal has been received and is now under review.\n\nProposal Number: ${d.proposalNumber}\nValid Until: ${d.validUntil}\nOrganization: ${d.organization}\nSeats: ${d.seats}\nContract: ${d.contractLength} year(s)\nGrand Total: ${d.currency} ${d.total}\n\nOur enterprise team will contact you within 24 hours to discuss next steps.\n\nView your proposal: ${d.quoteUrl}\n\nEXECLEAD.AI Enterprise Team`,
  }),
  [EMAIL_TYPES.CPQ_QUOTE_SALES]: (d) => ({
    subject: `[Sales] New Enterprise Proposal - ${d.organization} (${d.currency} ${d.total})`,
    body: `New enterprise CPQ proposal submitted.\n\nProposal: ${d.proposalNumber}\nOrganization: ${d.organization}\nIndustry: ${d.industry}\nCountry: ${d.country}\nContact: ${d.email}\nSeats: ${d.seats}\nContract: ${d.contractLength} year(s)\nAnnual Value: ${d.currency} ${d.annualValue}\nGrand Total: ${d.currency} ${d.total}\n\n${d.requiresApproval ? "⚠ DISCOUNT APPROVAL REQUIRED\n" : ""}Review at: ${d.quoteUrl}`,
  }),
};

export async function sendPaymentEmail(type, to, data) {
  const template = EMAIL_TEMPLATES[type];
  if (!template || !to) return;
  try {
    const { subject, body } = template(data);
    await base44.integrations.Core.SendEmail({ to, subject, body, from_name: "EXECLEAD.AI" });
  } catch (e) {
    console.error(`[sendPaymentEmail] Failed to send "${type}" to ${to}:`, e);
    throw e;
  }
}

// ============================================================
// PDF RECEIPT DOWNLOAD
// ============================================================

export async function downloadReceiptPDF(invoice, profile) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("EXECLEAD.AI", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 160);
  doc.text("Receipt", pageWidth - 20, 25, { align: "right" });

  doc.setTextColor(40, 40, 50);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice ${invoice.invoice_number || ""}`, 20, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 110);
  doc.text(`Date: ${new Date(invoice.created_date).toLocaleDateString()}`, 20, 68);
  doc.text(`Status: ${(invoice.status || "paid").toUpperCase()}`, 20, 76);

  doc.setTextColor(40, 40, 50);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 20, 95);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 110);
  doc.text(profile?.full_name || profile?.target_role || "Customer", 20, 103);
  if (profile?.target_company) doc.text(profile.target_company, 20, 111);

  doc.setDrawColor(230, 230, 235);
  doc.line(20, 125, pageWidth - 20, 125);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 50);
  doc.text("Description", 20, 140);
  doc.text("Amount", pageWidth - 20, 140, { align: "right" });
  doc.line(20, 145, pageWidth - 20, 145);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 110);
  const planLabel = `${invoice.plan || "Subscription"} (${invoice.billing_cycle || "monthly"})`;
  doc.text(planLabel, 20, 155);
  doc.text(`${invoice.currency || "USD"} ${invoice.amount?.toFixed(2)}`, pageWidth - 20, 155, { align: "right" });

  doc.line(20, 165, pageWidth - 20, 165);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 50);
  doc.text("Total", 20, 175);
  doc.text(`${invoice.currency || "USD"} ${invoice.amount?.toFixed(2)}`, pageWidth - 20, 175, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 160);
  doc.text("Thank you for your business!", 20, 200);
  doc.text("EXECLEAD.AI - Develop Executive Leaders. Not Interview Candidates.", 20, 207);

  doc.save(`receipt-${invoice.invoice_number || invoice.id}.pdf`);
}