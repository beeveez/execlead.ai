import React from "react";
import { formatCurrency } from "@/lib/payments";
import { calculatePlanPrice } from "@/lib/founderPricingEngine";
import { TrendingDown, Lock, Sparkles, Crown } from "lucide-react";

/**
 * Dedicated benefits card for Founding Members.
 * Only renders when the entitlement engine detects a founding_member
 * entitlement — hidden completely for all other users.
 *
 * Uses calculatePlanPrice() as the single source of truth so the
 * breakdown always matches what the user is actually charged.
 */
export default function FoundingMemberBenefitsCard({ currentPlan, membership, cycle }) {
  if (!membership || membership.type !== "founding_member") return null;

  const pricing = calculatePlanPrice(currentPlan, membership, cycle);
  const monthlyPricing = calculatePlanPrice(currentPlan, membership, "monthly");
  const annualPricing = calculatePlanPrice(currentPlan, membership, "annual");

  const benefits = [
    { icon: Crown, label: "Founder Badge", value: membership.number || "Active" },
    { icon: TrendingDown, label: "25% Lifetime Discount", value: "On every payment, forever" },
    { icon: Lock, label: "Lifetime Price Protection", value: "Locked at founding rates" },
    { icon: Sparkles, label: "Early Access", value: "New features first" },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-6 gold-glow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-2xl">
          {membership.icon || "🏆"}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Founding Member Benefits</h3>
          <p className="text-amber-400/60 text-xs">Lifetime entitlement · Active on all plans · Never expires</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {benefits.map((b) => (
          <div key={b.label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <b.icon size={16} className="text-amber-400 mb-1.5" />
            <div className="text-white/80 text-sm font-medium">{b.label}</div>
            <div className="text-white/40 text-xs">{b.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Monthly Savings</div>
          <div className="text-amber-400 font-bold text-lg">{formatCurrency(monthlyPricing.savings, currentPlan.currency)}</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Annual Savings</div>
          <div className="text-amber-400 font-bold text-lg">{formatCurrency(annualPricing.savings, currentPlan.currency)}</div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-2">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Pricing Breakdown ({cycle})</div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Regular Price</span>
          <span className="text-white/70">{formatCurrency(pricing.originalPrice, currentPlan.currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-amber-400">Founder Discount ({pricing.discount}%)</span>
          <span className="text-amber-400">−{formatCurrency(pricing.savings, currentPlan.currency)}</span>
        </div>
        <div className="border-t border-white/5 pt-2 flex justify-between">
          <span className="text-white font-medium">Final Price Charged</span>
          <span className="text-white font-bold">{formatCurrency(pricing.finalPrice, currentPlan.currency)}</span>
        </div>
      </div>
    </div>
  );
}