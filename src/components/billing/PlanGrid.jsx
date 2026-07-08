import React from "react";
import { Link } from "react-router-dom";
import ExpandableFeatureList from "@/components/billing/ExpandableFeatureList";
import { formatCurrency } from "@/lib/payments";
import { calculatePlanPrice } from "@/lib/founderPricingEngine";

export default function PlanGrid({ plans, currentPlan, cycle, getPrice, membership, onSelectPlan }) {
  const currentPlanIndex = plans.findIndex((p) => p.id === currentPlan?.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlan?.id;
        const planIndex = plans.findIndex((p) => p.id === plan.id);
        const isUpgrade = planIndex > currentPlanIndex;
        const isDowngrade = planIndex < currentPlanIndex;
        const founderPricing = calculatePlanPrice(plan, membership, cycle);
        const price = founderPricing.finalPrice;
        const isEnterprise = plan.enterpriseOnly;

        return (
          <div key={plan.id} className={`relative rounded-xl border p-5 transition-all ${isCurrent ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-white/[0.02]"}`}>
            {isCurrent && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-500 rounded-full text-[10px] font-bold text-white">CURRENT</div>}
            {plan.badge && !isCurrent && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-500 rounded-full text-[10px] font-bold text-white">{plan.badge}</div>}
            <div className="text-2xl mb-2">{plan.icon}</div>
            <h3 className="text-white font-bold">{plan.name}</h3>
            <p className="text-white/40 text-xs mb-3">{plan.description}</p>
            <div className="mb-4">
              {isEnterprise ? (
                <span className="text-lg font-bold text-white">Contact Sales</span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">{price === 0 ? "Free" : formatCurrency(price, plan.currency)}</span>
                  {price !== 0 && <span className="text-white/40 text-sm">/{cycle === "monthly" ? "mo" : "yr"}</span>}
                  {founderPricing.applied && <span className="text-sm text-white/30 line-through">{formatCurrency(founderPricing.originalPrice, plan.currency)}</span>}
                </div>
              )}
            </div>
            <div className="mb-5">
              <ExpandableFeatureList features={plan.features} />
            </div>
            {isCurrent ? (
              <div className="w-full py-2.5 rounded-lg text-center text-sm text-white/30 bg-white/5">Current Plan</div>
            ) : isEnterprise ? (
              <Link to="/cpq" className="block w-full py-2.5 rounded-lg text-center text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 transition-colors">Configure Proposal</Link>
            ) : isUpgrade ? (
              <button onClick={() => onSelectPlan(plan)} className="w-full py-2.5 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">Upgrade</button>
            ) : (
              <button onClick={() => onSelectPlan(plan)} className="w-full py-2.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white/50 transition-colors">Switch</button>
            )}
          </div>
        );
      })}
    </div>
  );
}