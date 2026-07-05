import { base44 } from "@/api/base44Client";

export const PAYMENT_PROVIDERS = {
  stripe: { id: "stripe", name: "Stripe", icon: "💳", description: "Visa, Mastercard, Amex" },
  apple: { id: "apple", name: "Apple Pay", icon: "", description: "Pay with Apple Pay" },
  google: { id: "google", name: "Google Pay", icon: "G", description: "Pay with Google Pay" },
};

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
  { code: "GB", name: "United Kingdom", currency: "GBP", taxRate: 0.20 },
  { code: "DE", name: "Germany", currency: "EUR", taxRate: 0.19 },
  { code: "FR", name: "France", currency: "EUR", taxRate: 0.20 },
  { code: "ES", name: "Spain", currency: "EUR", taxRate: 0.21 },
  { code: "IT", name: "Italy", currency: "EUR", taxRate: 0.22 },
  { code: "NL", name: "Netherlands", currency: "EUR", taxRate: 0.21 },
  { code: "CA", name: "Canada", currency: "CAD", taxRate: 0.05 },
  { code: "AU", name: "Australia", currency: "AUD", taxRate: 0.10 },
  { code: "IN", name: "India", currency: "INR", taxRate: 0.18 },
  { code: "JP", name: "Japan", currency: "USD", taxRate: 0.10 },
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

export const EMAIL_TYPES = {
  PAYMENT_CONFIRMATION: "payment_confirmation",
  PAYMENT_FAILED: "payment_failed",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  RENEWAL_REMINDER: "renewal_reminder",
  TRIAL_STARTED: "trial_started",
  TRIAL_ENDING: "trial_ending",
};

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
  } catch (e) {}
}

export async function processPayment({ provider, amount, currency, planId, billingCycle, coupon, billingAddress }) {
  return {
    success: true,
    transaction_id: `txn_${Date.now()}`,
    provider,
    amount,
    currency: currency || "USD",
  };
}

export async function startTrial({ planId, trialDays = 14 }) {
  const trialEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
  return {
    success: true,
    trial_id: `trial_${Date.now()}`,
    planId,
    trialDays,
    trial_end: trialEnd.toISOString(),
  };
}

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
};

export async function sendPaymentEmail(type, to, data) {
  const template = EMAIL_TEMPLATES[type];
  if (!template || !to) return;
  try {
    const { subject, body } = template(data);
    await base44.integrations.Core.SendEmail({ to, subject, body, from_name: "EXECLEAD.AI" });
  } catch (e) {}
}

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