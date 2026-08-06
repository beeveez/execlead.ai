import React from "react";
import { Briefcase, Sparkles, TrendingUp, Clock, Layers, Lightbulb } from "lucide-react";
import { fmtCurrency, fmtNum } from "@/lib/enterpriseRoiEngine";

export default function CommercialRecommendation({ rec }) {
  const items = [
    { icon: Layers, label: "Recommended License", value: rec.recommendedLicense },
    { icon: TrendingUp, label: "Estimated ARR", value: fmtCurrency(rec.estimatedARR) },
    { icon: Sparkles, label: "Simulation Credits / yr", value: fmtNum(rec.simulationCredits) },
    { icon: Briefcase, label: "Expansion Opportunity", value: rec.expansionOpportunity },
    { icon: TrendingUp, label: "Upsell Potential", value: rec.upsellPotential },
    { icon: Clock, label: "Recommended Implementation", value: rec.recommendedImplementation },
  ];
  return (
    <div className="rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-5">
      <div className="flex items-center gap-2 mb-1">
        <Briefcase size={15} className="text-accent-orange" />
        <h3 className="text-white text-sm font-semibold">Commercial Recommendation Engine™</h3>
      </div>
      <p className="text-white/45 text-[11px] mb-4">Target: {rec.target}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <it.icon size={13} className="text-accent-orange mb-1.5" />
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{it.label}</div>
            <div className="text-xs font-semibold text-white">{it.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1.5"><Lightbulb size={11} className="text-amber-400" /> Reasoning</div>
        <ul className="space-y-1">
          {rec.reasoning.map((r, i) => (
            <li key={i} className="text-[11px] text-white/60 flex items-start gap-1.5"><span className="text-accent-orange mt-0.5">•</span> {r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}