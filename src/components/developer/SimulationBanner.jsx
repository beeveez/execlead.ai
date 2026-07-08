import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { RotateCcw } from "lucide-react";

const PLAN_LABELS = {
  free: "Free",
  professional: "Professional",
  executive: "Executive",
  enterprise: "Enterprise",
  developer_unlimited: "Developer Unlimited",
};

const STATUS_LABELS = {
  trialing: "Trial User",
  expired: "Expired Subscription",
  canceled: "Canceled Subscription",
  active: "Active Subscription",
};

const REFERRAL_LABELS = {
  none: "No Referrals",
  basic: "Basic Referrer",
  top_referrer: "Top Referrer",
};

const REGION_LABELS = {
  US: "United States (USD)",
  CA: "Canada (CAD)",
  EU: "European Union (EUR)",
  UK: "United Kingdom (GBP)",
  AU: "Australia (AUD)",
  IN: "India (INR)",
};

export default function SimulationBanner() {
  const { isSimulating, simulation, clearSimulation } = useDeveloper();

  if (!isSimulating) return null;

  const chips = [];
  if (simulation.plan) chips.push(`${PLAN_LABELS[simulation.plan] || simulation.plan} Plan (Simulated)`);
  if (simulation.role) chips.push(`Role: ${simulation.role}`);
  if (simulation.founder !== null) chips.push(simulation.founder ? "Founder Member" : "Non-Founder");
  if (simulation.subscriptionStatus) chips.push(STATUS_LABELS[simulation.subscriptionStatus] || simulation.subscriptionStatus);
  if (simulation.referralLevel) chips.push(REFERRAL_LABELS[simulation.referralLevel] || simulation.referralLevel);
  if (simulation.betaAccess !== null) chips.push(simulation.betaAccess ? "Beta Access" : "No Beta Access");
  if (simulation.region) chips.push(`Region: ${REGION_LABELS[simulation.region] || simulation.region}`);

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-500/20 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
        <span className="text-lg shrink-0">🧪</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-300 font-semibold text-sm">Simulation Mode</span>
            <span className="text-white/20">·</span>
            <span className="text-white/70 text-sm">{chips.join(" · ")}</span>
          </div>
          <p className="text-amber-400/60 text-xs mt-0.5">No billing changes are being made. Stripe, database subscriptions, and entitlements are untouched.</p>
        </div>
        <button
          onClick={clearSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium transition-colors shrink-0"
        >
          <RotateCcw size={12} /> Restore Actual Subscription
        </button>
      </div>
    </div>
  );
}