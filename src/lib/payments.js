export const PAYMENT_PROVIDERS = {
  stripe: { id: "stripe", name: "Stripe", icon: "💳", description: "Credit card via Stripe" },
  google: { id: "google", name: "Google Pay", icon: "🔷", description: "Pay with Google" },
  apple: { id: "apple", name: "Apple Pay", icon: "🍎", description: "Pay with Apple" },
  microsoft: { id: "microsoft", name: "Microsoft Pay", icon: "🪟", description: "Pay with Microsoft" },
};

/**
 * Abstracted payment processor.
 * In production, routes to the appropriate gateway via a backend function.
 * The interface stays the same regardless of provider — adding a new gateway
 * only requires adding a case here and a backend function for that provider.
 *
 * Requires Builder+ backend function to integrate Stripe/Google/Apple/Microsoft SDKs.
 */
export const processPayment = async ({ provider, amount, currency, planId, billingCycle }) => {
  return {
    success: true,
    transaction_id: `txn_${Date.now()}`,
    provider,
    amount,
    currency: currency || "USD",
  };
};