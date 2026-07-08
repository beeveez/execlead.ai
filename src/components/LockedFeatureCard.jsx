import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight, Crown, Sparkles } from "lucide-react";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useSubscription } from "@/lib/SubscriptionContext";
import { PLANS } from "@/lib/pricingCatalog";
import { calculatePlanPrice } from "@/lib/founderPricingEngine";

/**
 * LockedFeatureCard — founder-aware upgrade prompt.
 *
 * When a Founding Member on the Free plan hits a Professional or
 * Executive feature, this card recognises their Founder status and
 * shows the lifetime 25% discount pricing instead of treating them
 * as a normal Free user.
 *
 * Founder Benefits are permanent but do NOT unlock plan-gated
 * features — the card makes this explicit: the subscription is
 * still required, but the founder discount is auto-applied.
 */
export default function LockedFeatureCard({ featureId, title }) {
  const { getFeature, getUpgradePlan, founderStatus } = useEntitlements();
  const { membership, profile } = useSubscription();

  const feature = getFeature(featureId);
  const upgradePlanId = getUpgradePlan(featureId);
  const planDef = PLANS[upgradePlanId];
  const planLabel = planDef?.name || (upgradePlanId.charAt(0).toUpperCase() + upgradePlanId.slice(1));
  const cycle = profile?.subscription_cycle || "monthly";
  const cycleLabel = cycle === "annual" ? "year" : "month";
  const pricing = calculatePlanPrice(planDef, membership, cycle);

  const isFounder = founderStatus.isFounder;
  const currentPlanLabel = PLANS[profile?.subscription_plan || "free"]?.name || "Free";
  const featureName = title || feature?.name || "This feature";

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-8 pt-8 pb-6 text-center ${isFounder ? "bg-gradient-to-b from-amber-500/10 to-transparent" : ""}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isFounder ? "bg-amber-500/15" : "bg-indigo-500/10"}`}>
            {isFounder ? <Crown className="text-amber-400" size={24} /> : <Lock className="text-indigo-400" size={24} />}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{featureName}</h2>
          <p className="text-white/40 text-sm">
            {isFounder
              ? `${featureName} requires a ${planLabel} or higher subscription.`
              : feature?.description || "This feature requires a subscription upgrade."}
          </p>
        </div>

        {isFounder ? (
          <div className="px-8 pb-8 space-y-4">
            {/* Founder discount notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <p className="text-amber-300/90 text-sm leading-relaxed">
                As a <span className="font-semibold">Founding Member</span>, your lifetime{" "}
                <span className="font-semibold">{founderStatus.discount}% discount</span> will automatically
                be applied when you upgrade.
              </p>
            </div>

            {/* Status grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Current Plan</p>
                <p className="text-white/80 text-sm font-medium">{currentPlanLabel}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Founder Status</p>
                <p className="text-amber-400 text-sm font-medium">Founding Member</p>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="bg-white/[0.03] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/40 text-xs">Original</span>
                <span className="text-white/30 text-sm line-through">
                  ${pricing.originalPrice.toFixed(2)}/{cycleLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Your Price</span>
                <div className="text-right">
                  <span className="text-amber-400 text-lg font-bold">${pricing.finalPrice.toFixed(2)}</span>
                  <span className="text-white/30 text-xs">/{cycleLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-amber-400/80 text-xs font-medium">
                  You save ${pricing.savings.toFixed(2)} · {founderStatus.discount}% lifetime discount
                </span>
              </div>
            </div>

            <Link
              to="/billing"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium px-6 py-3 rounded-xl transition-all"
            >
              <Crown size={16} /> Upgrade with Founder Discount <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="px-8 pb-8 space-y-4">
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-white/30 text-xs uppercase tracking-wider">Available in</p>
              <p className="text-indigo-400 font-semibold">{planLabel} plan</p>
            </div>
            <Link
              to="/billing"
              className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Upgrade to {planLabel} <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}