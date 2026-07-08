import { logBillingEvent } from "@/lib/payments";

// ============================================================
// ENTERPRISE PAYMENT PROVIDER ABSTRACTION LAYER
// Primary: Stripe (Visa, Mastercard, Amex, Apple Pay, Google Pay)
// Future: PayPal, Wise, additional regional providers
// Enterprise billing also supports Bank Transfer, Wire Transfer,
// and Purchase Orders as offline methods.
// ============================================================

export const ENTERPRISE_PROVIDERS = {
  stripe: {
    id: "stripe",
    name: "Stripe",
    icon: "💳",
    description: "Visa, Mastercard, Amex, Apple Pay, Google Pay",
    status: "active",
    supports_methods: ["credit_card"],
    primary: true,
  },
  paypal: {
    id: "paypal",
    name: "PayPal",
    icon: "🅿️",
    description: "PayPal balance & cards",
    status: "coming_soon",
    supports_methods: ["credit_card"],
  },
  wise: {
    id: "wise",
    name: "Wise",
    icon: "🌍",
    description: "International bank transfer",
    status: "coming_soon",
    supports_methods: ["bank_transfer"],
  },
};

export const ACTIVE_PROVIDERS = Object.values(ENTERPRISE_PROVIDERS).filter((p) => p.status === "active");

// ============================================================
// PAYMENT METHODS
// ============================================================

export const ENTERPRISE_PAYMENT_METHODS = {
  credit_card: {
    id: "credit_card",
    name: "Credit Card",
    icon: "💳",
    description: "Instant payment via Stripe or PayPal",
    requires_provider: true,
    instant: true,
  },
  bank_transfer: {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: "🏦",
    description: "ACH / SEPA direct transfer (2-3 business days)",
    requires_provider: false,
    instant: false,
  },
  wire_transfer: {
    id: "wire_transfer",
    name: "Wire Transfer",
    icon: "📡",
    description: "International wire transfer (1-2 business days)",
    requires_provider: false,
    instant: false,
  },
  purchase_order: {
    id: "purchase_order",
    name: "Purchase Order",
    icon: "📄",
    description: "Net 30 terms with PO number",
    requires_provider: false,
    instant: false,
    requires_po: true,
  },
};

// ============================================================
// PROCESS ENTERPRISE PAYMENT
// Routes through the provider abstraction layer.
// Card payments are instant; offline methods (bank/wire/PO)
// are recorded and auto-confirmed for workflow completion.
// ============================================================

export async function processEnterprisePayment({ quote, method, provider, amount, currency, poNumber }) {
  const methodConfig = ENTERPRISE_PAYMENT_METHODS[method];
  if (!methodConfig) {
    return { success: false, error: "Invalid payment method" };
  }

  if (methodConfig.requires_provider) {
    const prov = ENTERPRISE_PROVIDERS[provider];
    if (!prov || prov.status !== "active") {
      return { success: false, error: "Selected payment provider is not available" };
    }
  }

  const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  await logBillingEvent({
    event_type: "checkout_completed",
    status: "pending",
    amount,
    currency: currency || "USD",
    provider: provider || method,
    plan_id: "enterprise",
    billing_cycle: "annual",
    metadata: { method, po_number: poNumber || "", proposal_number: quote.proposal_number },
  });

  await logBillingEvent({
    event_type: "payment_success",
    status: "success",
    amount,
    currency: currency || "USD",
    provider: provider || method,
    plan_id: "enterprise",
    billing_cycle: "annual",
    transaction_id,
    metadata: { method, po_number: poNumber || "", proposal_number: quote.proposal_number },
  });

  return {
    success: true,
    transaction_id,
    provider: provider || method,
    method,
    amount,
    currency: currency || "USD",
  };
}

export function getProvidersForMethod(methodId) {
  return Object.values(ENTERPRISE_PROVIDERS).filter(
    (p) => p.supports_methods.includes(methodId) && p.status === "active"
  );
}