import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { processPayment, sendPaymentEmail, EMAIL_TYPES, formatCurrency, isDeveloperUnlimited, DEVELOPER_PLAN_ID, logBillingEvent } from "@/lib/payments";
import { useAuth } from "@/lib/AuthContext";
import { CreditCard, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CurrentPlanCard from "@/components/billing/CurrentPlanCard";
import PlanGrid from "@/components/billing/PlanGrid";
import PaymentHistory from "@/components/billing/PaymentHistory";
import CheckoutModal from "@/components/billing/CheckoutModal";
import { useUserMemberships } from "@/hooks/useUserMemberships";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { grantFoundingMembership } from "@/lib/foundingMember";
import { calculatePlanPrice } from "@/lib/founderPricingEngine";
import { createNotification } from "@/lib/notifications";

export default function Billing() {
  const { user } = useAuth();
  const { profile, renewalDate, refreshProfile, membership } = useSubscription();
  const { plans, cycle, setCycle, getPrice, getPlanById } = usePricingCatalog();
  const [invoices, setInvoices] = useState([]);
  const [upgradePlan, setUpgradePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { memberships, bestDiscount, hasProtection, refresh: refreshMemberships } = useUserMemberships(user?.id);
  const { reload: reloadFoundingMember } = useFoundingMember();
  const [isFoundingPurchase, setIsFoundingPurchase] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    const load = async () => {
      try {
        const personalInvoices = await base44.entities.Invoice.filter({ owner_user_id: user.id }, "-created_date", 50);
        setInvoices(personalInvoices);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user?.id, profile?.organization_id]);

  useEffect(() => {
    if (profile?.subscription_cycle) setCycle(profile.subscription_cycle);
  }, [profile?.subscription_cycle]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("founding") === "1") {
      setIsFoundingPurchase(true);
      window.history.replaceState({}, "", "/billing");
    }
  }, []);

  const currentPlan = profile ? (getPlanById(profile.subscription_plan) || getPlanById("free")) : null;

  const handleCheckoutSuccess = async () => {
    setUpgradePlan(null);
    if (isFoundingPurchase && user && profile) {
      await grantFoundingMembership(user, profile);
    }
    const personalInvoices = await base44.entities.Invoice.filter({ owner_user_id: user.id }, "-created_date", 50);
    setInvoices(personalInvoices);
    await refreshProfile();
    if (isFoundingPurchase) {
      setIsFoundingPurchase(false);
      await reloadFoundingMember();
      await refreshMemberships();
    }
  };

  const handleCancel = async () => {
    if (!profile) return;
    try {
      const latestInvoice = invoices[0];
      await base44.entities.UserProfile.update(profile.id, { subscription_status: "canceled", subscription_plan: "free" });
      await logBillingEvent({
        event_type: "subscription_canceled",
        status: "success",
        plan_id: currentPlan?.id,
        metadata: { from: currentPlan?.id, to: "free" },
      });
      await createNotification({
        type: "subscription", title: "Subscription Canceled",
        message: "Your subscription has been canceled. You're now on the Free plan.",
        icon: "⚠️",
        userId: user.id,
      });
      if (latestInvoice) {
        await sendPaymentEmail(EMAIL_TYPES.SUBSCRIPTION_CANCELED, profile.email || "", {
          name: profile.full_name, plan: currentPlan?.name, periodEnd: latestInvoice.period_end,
        });
      }
      await refreshProfile();
    } catch (e) {}
  };

  const handleResume = async () => {
    if (!profile) return;
    try {
      await base44.entities.UserProfile.update(profile.id, { subscription_status: "active" });
      await logBillingEvent({
        event_type: "subscription_resumed",
        status: "success",
        plan_id: currentPlan?.id,
      });
      await createNotification({
        type: "subscription", title: "Subscription Resumed",
        message: "Your subscription has been resumed. Welcome back!",
        icon: "✅",
        userId: user.id,
      });
      await refreshProfile();
    } catch (e) {}
  };

  const handleSwitchCycle = async () => {
    if (!profile || !currentPlan || currentPlan.id === "free") return;
    const newCycle = cycle === "monthly" ? "annual" : "monthly";
    const founderPricing = calculatePlanPrice(currentPlan, membership, newCycle);
    const newPrice = founderPricing.finalPrice;
    try {
      const result = await processPayment({ provider: "stripe", amount: newPrice, currency: currentPlan.currency, planId: currentPlan.id, billingCycle: newCycle });
      if (result.success) {
        await base44.entities.UserProfile.update(profile.id, { subscription_cycle: newCycle });
        const now = new Date();
        const periodEnd = new Date(now);
        if (newCycle === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else periodEnd.setMonth(periodEnd.getMonth() + 1);
        await base44.entities.Invoice.create({
          amount: newPrice, currency: "USD", status: "paid",
          period_start: now.toISOString().split("T")[0],
          period_end: periodEnd.toISOString().split("T")[0],
          plan: currentPlan.id, billing_cycle: newCycle,
          invoice_number: `INV-${Date.now()}`,
          owner_user_id: user.id,
        });
        await createNotification({
          type: "subscription", title: "Billing Cycle Updated",
          message: `You've switched to ${newCycle} billing.`,
          icon: "🔄",
          userId: user.id,
        });
        setCycle(newCycle);
        const refreshed = await base44.entities.Invoice.filter({ owner_user_id: user.id }, "-created_date", 50);
        setInvoices(refreshed);
        await refreshProfile();
      }
    } catch (e) {}
  };

  if (loading || !profile || !currentPlan) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <CreditCard size={12} className="text-emerald-400" /> Personal Billing
        </div>
        <h1 className="text-2xl font-bold text-white">Manage Your Plan</h1>
      </div>

      <CurrentPlanCard
        profile={profile}
        currentPlan={currentPlan}
        cycle={cycle}
        getPrice={getPrice}
        renewalDate={renewalDate}
        membership={membership}
        onCancel={handleCancel}
        onResume={handleResume}
        onSwitchCycle={handleSwitchCycle}
      />

      {bestDiscount > 0 && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">{memberships[0]?.badge?.charAt(0) || "🏆"}</span>
          <div className="flex-1">
            <div className="text-white font-medium text-sm">Membership Discount Active</div>
            <div className="text-white/40 text-xs">{memberships.map(m => m.program_name).join(", ")} — {bestDiscount}% off all plans{hasProtection ? " · Lifetime price protection" : ""}</div>
          </div>
          <span className="text-emerald-400 text-sm font-bold">−{bestDiscount}%</span>
        </div>
      )}

      {isDeveloperUnlimited(profile) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="text-amber-400 font-medium text-sm">Developer Unlimited</div>
            <div className="text-white/40 text-xs">Full platform access · Never charged · Super Admin mode</div>
          </div>
        </div>
      )}

      {!isDeveloperUnlimited(profile) && profile.subscription_plan !== "free" && profile.subscription_status === "active" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <CreditCard size={16} className="text-indigo-400" />
              </div>
              <div>
                <div className="text-white/80 text-sm font-medium">Payment Method</div>
                <div className="text-white/30 text-xs">Managed securely by {currentPlan?.id ? "Stripe" : "provider"} · Card details never stored on EXECLEAD.AI</div>
              </div>
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Update</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setCycle("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "monthly" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Monthly</button>
        <button onClick={() => setCycle("annual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "annual" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Annual <span className="text-emerald-400 text-xs">Save 20%</span></button>
      </div>

      <PlanGrid plans={plans.filter(p => !p.enterpriseOnly)} currentPlan={currentPlan} cycle={cycle} getPrice={getPrice} membership={membership} onSelectPlan={setUpgradePlan} />

      <PaymentHistory invoices={invoices} profile={profile} />

      <AnimatePresence>
        {upgradePlan && (
          <CheckoutModal
            plan={upgradePlan}
            cycle={cycle}
            profile={profile}
            membership={membership}
            isFoundingPurchase={isFoundingPurchase}
            onClose={() => setUpgradePlan(null)}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}