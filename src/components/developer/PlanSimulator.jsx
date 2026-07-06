import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Check } from "lucide-react";

const PLANS = [
  { id: "free", label: "Free", color: "text-white/60", desc: "Basic access" },
  { id: "professional", label: "Professional", color: "text-blue-400", desc: "Full platform" },
  { id: "executive", label: "Executive", color: "text-purple-400", desc: "Advanced features" },
  { id: "enterprise", label: "Enterprise", color: "text-amber-400", desc: "Everything + admin" },
];

export default function PlanSimulator() {
  const { simulatedPlan, setSimulatedPlan } = useDeveloper();
  const { profile } = useSubscription();
  const realPlan = profile?.subscription_plan || "free";

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-1">Subscription Simulator</h2>
      <p className="text-white/30 text-xs mb-4">Simulate any plan tier for testing. Does not change the actual database subscription.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANS.map((p) => {
          const active = simulatedPlan === p.id;
          const isReal = realPlan === p.id && !simulatedPlan;
          return (
            <button
              key={p.id}
              onClick={() => setSimulatedPlan(p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${active ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold text-sm ${p.color}`}>{p.label}</span>
                {active && <Check size={14} className="text-indigo-400" />}
              </div>
              <p className="text-white/30 text-xs">{p.desc}</p>
              {isReal && <p className="text-white/20 text-[10px] mt-1">Actual plan</p>}
            </button>
          );
        })}
      </div>
      {simulatedPlan && (
        <button onClick={() => setSimulatedPlan(simulatedPlan)} className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors">
          Reset to actual plan
        </button>
      )}
    </div>
  );
}