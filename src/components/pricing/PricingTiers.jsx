import React from "react";
import { useFounderPricing } from "@/hooks/useFounderPricing";
import { useSubscription } from "@/lib/SubscriptionContext";
import FounderBenefitsSummary from "./FounderBenefitsSummary";
import PlanCard from "./PlanCard";

export default function PricingTiers({ plans, cycle, getPrice, authed }) {
  const { calculatePrice, isFounder, membership } = useFounderPricing();
  const { profile } = useSubscription();
  const visiblePlans = plans.filter(p => p.visible !== false && p.id !== "developer_unlimited");

  return (
    <>
      {isFounder && <FounderBenefitsSummary discount={membership?.discount || 25} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {visiblePlans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            getPrice={getPrice}
            calculatePrice={calculatePrice}
            isFounder={isFounder}
            currentPlanId={profile?.subscription_plan}
            authed={authed}
            index={i}
          />
        ))}
      </div>
    </>
  );
}