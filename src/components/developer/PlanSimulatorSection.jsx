import React, { useState } from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Check, ChevronDown, ChevronUp, FlaskConical, RotateCcw } from "lucide-react";

const PLANS = [
  { id: "free", label: "Free", icon: "🌱", desc: "Starter executive experience" },
  { id: "professional", label: "Professional", icon: "🚀", desc: "Leadership acceleration" },
  { id: "executive", label: "Executive", icon: "👑", desc: "Personal executive development" },
  { id: "enterprise", label: "Enterprise", icon: "🏢", desc: "Organization subscription" },
];

const SUBSCRIPTION_STATUSES = [
  { id: "active", label: "Active", icon: "✅" },
  { id: "trialing", label: "Trial", icon: "⏳" },
  { id: "expired", label: "Expired", icon: "⛔" },
  { id: "canceled", label: "Canceled", icon: "❌" },
];

const REFERRAL_LEVELS = [
  { id: "none", label: "None", icon: "—" },
  { id: "basic", label: "Basic", icon: "🔗" },
  { id: "top_referrer", label: "Top Referrer", icon: "⭐" },
];

const REGIONS = [
  { id: "US", label: "United States (USD)" },
  { id: "CA", label: "Canada (CAD)" },
  { id: "EU", label: "European Union (EUR)" },
  { id: "UK", label: "United Kingdom (GBP)" },
  { id: "AU", label: "Australia (AUD)" },
  { id: "IN", label: "India (INR)" },
];

const ROLES = [
  { id: "executive", label: "Executive" },
  { id: "enterprise", label: "Enterprise" },
];

export default function PlanSimulatorSection() {
  const {
    simulatedPlan, setSimulatedPlan,
    simulatedFounder, setSimulatedFounder,
    simulatedSubscriptionStatus, setSimulatedSubscriptionStatus,
    simulatedReferralLevel, setSimulatedReferralLevel,
    simulatedBetaAccess, setSimulatedBetaAccess,
    simulatedRegion, setSimulatedRegion,
    impersonation, setImpersonation, stopImpersonation,
    clearSimulation, isSimulating,
  } = useDeveloper();
  const { profile } = useSubscription();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const realPlan = profile?.subscription_plan || "free";

  const handlePlanClick = (planId) => {
    setSimulatedPlan(simulatedPlan === planId ? null : planId);
  };

  return (
    <div className="border-t border-white/5">
      <div className="px-4 py-2 border-b border-white/5 flex items-center gap-1.5">
        <FlaskConical size={11} className="text-amber-400" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Plan Simulator</span>
        <span className="text-[9px] text-amber-400/60 ml-auto">(Dev Mode Only)</span>
      </div>

      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          {PLANS.map((p) => {
            const active = simulatedPlan === p.id;
            const isReal = realPlan === p.id && !simulatedPlan;
            return (
              <button
                key={p.id}
                onClick={() => handlePlanClick(p.id)}
                className={`p-2 rounded-lg border text-left transition-all ${active ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{p.icon}</span>
                  {active ? <Check size={11} className="text-indigo-400" /> : isReal ? <span className="text-[8px] text-white/20">actual</span> : null}
                </div>
                <div className={`text-xs font-medium mt-0.5 ${active ? "text-indigo-300" : "text-white/70"}`}>{p.label}</div>
                <div className="text-[9px] text-white/25 truncate">{p.desc}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-white/40 transition-colors"
        >
          <span>Advanced Simulation</span>
          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showAdvanced && (
          <div className="space-y-2.5 pt-1">
            <SimRow label="Founder Status">
              <TriToggle
                value={simulatedFounder}
                options={[{ v: true, l: "Founder" }, { v: false, l: "Non-Founder" }]}
                onChange={setSimulatedFounder}
              />
            </SimRow>

            <SimRow label="Role">
              <div className="flex gap-1">
                {ROLES.map((r) => (
                  <SimChip
                    key={r.id}
                    active={impersonation?.role === r.id}
                    onClick={() => impersonation?.role === r.id ? stopImpersonation() : setImpersonation(r.id, impersonation?.plan || simulatedPlan, r.label)}
                  >
                    {r.label}
                  </SimChip>
                ))}
              </div>
            </SimRow>

            <SimRow label="Subscription Status">
              <div className="flex flex-wrap gap-1">
                {SUBSCRIPTION_STATUSES.map((s) => (
                  <SimChip
                    key={s.id}
                    active={simulatedSubscriptionStatus === s.id}
                    onClick={() => setSimulatedSubscriptionStatus(simulatedSubscriptionStatus === s.id ? null : s.id)}
                  >
                    {s.icon} {s.label}
                  </SimChip>
                ))}
              </div>
            </SimRow>

            <SimRow label="Referral Level">
              <div className="flex flex-wrap gap-1">
                {REFERRAL_LEVELS.map((r) => (
                  <SimChip
                    key={r.id}
                    active={simulatedReferralLevel === r.id}
                    onClick={() => setSimulatedReferralLevel(simulatedReferralLevel === r.id ? null : r.id)}
                  >
                    {r.icon} {r.label}
                  </SimChip>
                ))}
              </div>
            </SimRow>

            <SimRow label="Beta Access">
              <TriToggle
                value={simulatedBetaAccess}
                options={[{ v: true, l: "Beta" }, { v: false, l: "No Beta" }]}
                onChange={setSimulatedBetaAccess}
              />
            </SimRow>

            <SimRow label="Regional Pricing">
              <select
                value={simulatedRegion || ""}
                onChange={(e) => setSimulatedRegion(e.target.value || null)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/70 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="" className="bg-[#0d0d14]">Real region</option>
                {REGIONS.map((r) => <option key={r.id} value={r.id} className="bg-[#0d0d14]">{r.label}</option>)}
              </select>
            </SimRow>
          </div>
        )}

        {isSimulating && (
          <button
            onClick={clearSimulation}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-medium transition-colors"
          >
            <RotateCcw size={12} /> Restore Actual Subscription
          </button>
        )}
      </div>
    </div>
  );
}

function SimRow({ label, children }) {
  return (
    <div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
      {children}
    </div>
  );
}

function SimChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-[11px] transition-all ${active ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

function TriToggle({ value, options, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <SimChip key={String(o.v)} active={value === o.v} onClick={() => onChange(value === o.v ? null : o.v)}>
          {o.l}
        </SimChip>
      ))}
    </div>
  );
}