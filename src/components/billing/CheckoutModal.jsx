import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { PAYMENT_PROVIDERS, COUNTRIES, calculateTax, calculateDiscount, formatCurrency, processPayment, startTrial, incrementCouponUsage, sendPaymentEmail, EMAIL_TYPES, getPaymentError, logBillingEvent } from "@/lib/payments";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import CouponInput from "@/components/billing/CouponInput";
import PaymentTrust from "@/components/billing/PaymentTrust";
import { Link } from "react-router-dom";
import { X, Loader2, Check, Lock, CreditCard, Sparkles } from "lucide-react";
import { createNotification } from "@/lib/notifications";
import { calculatePlanPrice } from "@/lib/founderPricingEngine";

export default function CheckoutModal({ plan, cycle: initialCycle, profile, membership = null, isFoundingPurchase = false, onClose, onSuccess }) {
  const { getPrice, cycle, setCycle } = usePricingCatalog(initialCycle);
  const { user } = useAuth();
  const [coupon, setCoupon] = useState(null);
  const [provider, setProvider] = useState("stripe");
  const [billingAddress, setBillingAddress] = useState({ name: profile?.full_name || "", email: "", country: "US", address: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("pay");

  const hasTrial = plan.buttonText?.toLowerCase().includes("trial");
  const isEnterprise = plan.enterpriseOnly || plan.customPricing;
  const subtotal = getPrice(plan);
  const founderPricing = calculatePlanPrice(plan, membership, cycle);
  const membershipSavings = founderPricing.savings;
  const afterMembership = founderPricing.finalPrice;
  const discount = calculateDiscount(coupon, afterMembership);
  const taxableAmount = afterMembership - discount;
  const tax = calculateTax(billingAddress.country, taxableAmount);
  const total = taxableAmount + tax;
  const country = COUNTRIES.find((c) => c.code === billingAddress.country);

  const handleCheckout = async () => {
    setError("");
    if (mode === "trial") return handleTrial();
    if (!billingAddress.name.trim() || !billingAddress.email.trim()) {
      setError("Please fill in your billing name and email");
      return;
    }
    setProcessing(true);
    try {
      const result = await processPayment({ provider, amount: total, currency: plan.currency || "USD", planId: plan.id, billingCycle: cycle, coupon, billingAddress });
      if (result.success) {
        await completeSubscription(plan, cycle, total, result.transaction_id);
      }
    } catch (e) {
      const err = getPaymentError(e);
      setError(err.message);
      await logBillingEvent({
        event_type: "payment_failed",
        status: "failed",
        amount: total,
        currency: plan.currency || "USD",
        provider,
        plan_id: plan.id,
        billing_cycle: cycle,
        error_message: err.message,
      });
    }
    setProcessing(false);
  };

  const handleTrial = async () => {
    setProcessing(true);
    setError("");
    try {
      const trialDays = 14;
      const result = await startTrial({ planId: plan.id, trialDays });
      if (result.success) {
        const trialEnd = new Date(result.trial_end);
        await base44.entities.UserProfile.update(profile.id, {
          subscription_plan: plan.id,
          subscription_status: "trialing",
          subscription_cycle: cycle,
        });
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + trialDays);
        await base44.entities.Invoice.create({
          amount: 0, currency: "USD", status: "paid",
          period_start: now.toISOString().split("T")[0],
          period_end: periodEnd.toISOString().split("T")[0],
          plan: plan.id, billing_cycle: cycle,
          invoice_number: `TRIAL-${Date.now()}`,
          owner_user_id: user.id,
        });
        await createNotification({
          type: "subscription", title: "Trial Started",
          message: `Your ${trialDays}-day trial of ${plan.name} has started! Enjoy premium features.`,
          icon: "🎉", action_url: "/dashboard",
          userId: user.id,
        });
        await sendPaymentEmail(EMAIL_TYPES.TRIAL_STARTED, billingAddress.email || profile?.email, {
          name: billingAddress.name, plan: plan.name, trialDays, trialEnd: trialEnd.toLocaleDateString(),
        });
        onSuccess();
      }
    } catch (e) {
      const err = getPaymentError(e);
      setError(err.message);
      await logBillingEvent({
        event_type: "payment_failed",
        status: "failed",
        plan_id: plan.id,
        error_message: err.message,
      });
    }
    setProcessing(false);
  };

  const completeSubscription = async (selectedPlan, billingCycle, amount, transactionId) => {
    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);

    await base44.entities.UserProfile.update(profile.id, {
      subscription_plan: selectedPlan.id,
      subscription_status: "active",
      subscription_cycle: billingCycle,
    });

    await base44.entities.Invoice.create({
      amount, currency: selectedPlan.currency || "USD", status: "paid",
      period_start: now.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
      plan: selectedPlan.id, billing_cycle: billingCycle,
      invoice_number: `INV-${Date.now()}`,
      owner_user_id: user.id,
    });

    await createNotification({
      type: "subscription", title: "Subscription Activated",
      message: `You're now on the ${selectedPlan.name} plan! Enjoy premium features.`,
      icon: "🎉", action_url: "/dashboard",
      userId: user.id,
    });

    if (coupon) await incrementCouponUsage(coupon.id);

    await sendPaymentEmail(EMAIL_TYPES.PAYMENT_CONFIRMATION, billingAddress.email || profile?.email, {
      name: billingAddress.name, amount: formatCurrency(amount, selectedPlan.currency),
      plan: selectedPlan.name, cycle: billingCycle, transactionId,
    });

    // Referral Engine: calculate commission for the referrer (fire-and-forget)
    try {
      await base44.functions.invoke("processReferral", {
        action: "purchase",
        plan: selectedPlan.id,
        amount,
        stripe_charge_id: transactionId,
      });
    } catch (e) {}

    onSuccess();
  };

  if (isEnterprise) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <span className="text-4xl block mb-3">{plan.icon || "🏢"}</span>
          <h3 className="text-white font-bold text-lg mb-2">Enterprise CPQ</h3>
          <p className="text-white/40 text-sm mb-6">Configure your custom enterprise proposal with our data-driven CPQ engine — seats, modules, AI packages, services, multi-year contracts, and multi-currency.</p>
          <Link to="/cpq" onClick={onClose} className="block w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">Configure Proposal</Link>
          <button onClick={onClose} className="mt-3 text-white/30 hover:text-white/60 text-sm">Cancel</button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
            <h3 className="text-lg font-bold text-white">{isFoundingPurchase ? "Founding Member Checkout" : "Checkout"}</h3>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
          </div>

          <div className="p-5 space-y-5">
            {/* Plan Summary */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{plan.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold">{plan.name}</h4>
                    <p className="text-white/40 text-xs">{plan.description}</p>
                  </div>
                </div>
                <span className="text-white font-bold">{membershipSavings > 0 ? (<><span className="text-white/40 line-through text-sm mr-1">{formatCurrency(subtotal, plan.currency)}</span>{formatCurrency(afterMembership, plan.currency)}</>) : formatCurrency(subtotal, plan.currency)}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setCycle("monthly")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${cycle === "monthly" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>Monthly</button>
                <button onClick={() => setCycle("annual")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${cycle === "annual" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>Annual <span className="text-emerald-400">−20%</span></button>
              </div>
            </div>

            {/* Founder Badge */}
            {founderPricing.applied && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <div className="flex-1">
                  <div className="text-amber-400 text-sm font-medium">Founding Member</div>
                  <div className="text-white/40 text-xs">Lifetime Discount Applied — {founderPricing.discount}% off forever{founderPricing.protected ? " · Protected Pricing" : ""}</div>
                </div>
              </div>
            )}

            {/* Coupon */}
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Coupon Code</label>
              <CouponInput planId={plan.id} amount={subtotal} onApply={setCoupon} />
            </div>

            {/* Billing Address */}
            {mode === "pay" && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider block">Billing Address</label>
                <input type="text" placeholder="Full name" value={billingAddress.name} onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" />
                <input type="email" placeholder="Email for receipts" value={billingAddress.email} onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" />
                <select value={billingAddress.country} onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50 transition-all">
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.name} ({c.currency})</option>)}
                </select>
                <input type="text" placeholder="Address (optional)" value={billingAddress.address} onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
            )}

            {/* Payment Method */}
            {mode === "pay" && (
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(PAYMENT_PROVIDERS).map((p) => (
                    <button key={p.id} onClick={() => setProvider(p.id)} className={`flex flex-col items-center gap-1 py-3 rounded-lg text-xs transition-all ${provider === p.id ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                      <span className="text-lg">{p.icon || p.name[0]}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
                {provider === "stripe" && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs text-white/30">
                    <Lock size={12} className="text-emerald-400" />
                    Secure card payment via Stripe. Visa, Mastercard, Amex accepted.
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            {mode === "pay" && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-white/40">Subtotal</span><span className="text-white/70">{formatCurrency(subtotal, plan.currency)}</span></div>
                {membershipSavings > 0 && <div className="flex justify-between text-sm"><span className="text-amber-400 flex items-center gap-1"><span>🏆</span> Founding Member Discount</span><span className="text-amber-400">−{formatCurrency(membershipSavings, plan.currency)}</span></div>}
                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-400">Coupon</span><span className="text-emerald-400">−{formatCurrency(discount, plan.currency)}</span></div>}
                {tax > 0 && <div className="flex justify-between text-sm"><span className="text-white/40">Tax ({(country.taxRate * 100).toFixed(0)}%)</span><span className="text-white/70">{formatCurrency(tax, plan.currency)}</span></div>}
                <div className="border-t border-white/5 pt-2 flex justify-between"><span className="text-white font-medium">Total</span><span className="text-white font-bold">{formatCurrency(total, plan.currency)}</span></div>
              </div>
            )}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            {mode === "pay" && <PaymentTrust />}

            {/* Actions */}
            <div className="space-y-2">
              {hasTrial && (
                <div className="flex gap-2">
                  <button onClick={() => setMode("pay")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "pay" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>Pay Now</button>
                  <button onClick={() => setMode("trial")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "trial" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>Start Trial</button>
                </div>
              )}
              <button onClick={handleCheckout} disabled={processing} className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors">
                {processing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : mode === "trial" ? <><Sparkles size={16} /> Start 14-Day Free Trial</> : <><CreditCard size={16} /> {isFoundingPurchase ? "Become a Founding Member — " : ""}Pay {formatCurrency(total, plan.currency)}</>}
              </button>
              {mode === "trial" && <p className="text-center text-xs text-white/30">No charge for 14 days. Cancel anytime.</p>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}