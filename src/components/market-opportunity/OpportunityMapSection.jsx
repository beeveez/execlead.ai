import React, { useState } from "react";
import { Target, MapPin, TrendingUp, DollarSign, Building2, Languages } from "lucide-react";
import { SectionCard } from "@/components/user-intelligence/shared";

const METRICS = [
  { id: "opportunityScore", label: "Market Opportunity Score™", icon: Target },
  { id: "enterpriseSubs", label: "Enterprise Potential", icon: Building2 },
  { id: "growthRate", label: "Growth Velocity", icon: TrendingUp },
  { id: "mrr", label: "Revenue Potential", icon: DollarSign },
  { id: "localizationScore", label: "Localization Readiness", icon: Languages },
];

export default function OpportunityMapSection({ data, selectedCountry, setSelectedCountry }) {
  const [metric, setMetric] = useState("opportunityScore");
  const countries = data?.scoredCountries || [];
  const maxValue = Math.max(...countries.map((c) => parseFloat(c[metric]) || 0), 1);

  const getIntensity = (val, tierColor) => {
    if (metric === "opportunityScore") {
      const score = parseFloat(val);
      if (score >= 85) return "#10b981";
      if (score >= 70) return "#06b6d4";
      if (score >= 55) return "#6366f1";
      if (score >= 40) return "#f59e0b";
      return "#ef4444";
    }
    const ratio = parseFloat(val) / maxValue;
    if (ratio > 0.75) return "#10b981";
    if (ratio > 0.5) return "#06b6d4";
    if (ratio > 0.25) return "#6366f1";
    if (ratio > 0) return "#a855f7";
    return "rgba(255,255,255,0.05)";
  };

  const selected = countries.find((c) => c.country === selectedCountry);

  return (
    <SectionCard title="Interactive Opportunity Map — Market Intelligence" icon={Target} action={
      <select value={metric} onChange={(e) => setMetric(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-indigo-500/40">
        {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
      </select>
    }>
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
        {countries.map((c, i) => (
          <div key={i} onClick={() => setSelectedCountry(c.country)} className={`flex items-center gap-2 cursor-pointer group rounded-md p-1.5 transition-colors ${selectedCountry === c.country ? "bg-indigo-500/10" : "hover:bg-white/[0.02]"}`}>
            <div className="w-28 text-xs text-white/60 truncate group-hover:text-white/90">{c.country}</div>
            <div className="flex-1 h-7 bg-white/5 rounded-md overflow-hidden relative">
              <div className="h-full rounded-md transition-all flex items-center pl-2" style={{ width: `${(parseFloat(c[metric]) / maxValue) * 100}%`, backgroundColor: getIntensity(c[metric]), minWidth: "40px" }}>
                <span className="text-[10px] text-white font-medium">{c[metric]}</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: `${c.tierColor}20`, color: c.tierColor }}>T{c.tier}</span>
          </div>
        ))}
      </div>

      {/* Country drill-down with score breakdown */}
      {selected && (
        <div className="mt-4 bg-white/[0.02] border border-indigo-500/20 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-indigo-400" />
            <h4 className="text-sm font-semibold text-white">{selected.country}</h4>
            <span className="text-[10px] text-white/30">{selected.continent} · {selected.region}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${selected.tierColor}20`, color: selected.tierColor }}>Tier {selected.tier} — {selected.tierLabel}</span>
            <button onClick={() => setSelectedCountry(null)} className="ml-auto text-[10px] text-white/30 hover:text-white/60">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl font-bold" style={{ color: selected.tierColor }}>{selected.opportunityScore}</div>
                <div>
                  <div className="text-sm font-medium text-white">{selected.opportunityLabel}</div>
                  <div className="text-[10px] text-white/40">Priority: {selected.priority}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Users" value={selected.users} />
                <MiniStat label="Growth" value={`${selected.growthRate}%`} />
                <MiniStat label="MRR" value={`$${selected.mrr}`} />
                <MiniStat label="Exec %" value={`${selected.execPercent}%`} />
                <MiniStat label="Pro %" value={`${selected.proPercent}%`} />
                <MiniStat label="Enterprise" value={selected.enterpriseSubs} />
              </div>
            </div>
            <div>
              <h5 className="text-[10px] text-white/40 uppercase tracking-wide mb-2">Score Breakdown</h5>
              <div className="space-y-1.5">
                {selected.scoreFactors.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-32 text-[10px] text-white/50">{f.name}</div>
                    <div className="flex-1 h-4 bg-white/5 rounded-md overflow-hidden">
                      <div className="h-full rounded-md" style={{ width: `${f.score}%`, backgroundColor: f.score >= 70 ? "#10b981" : f.score >= 40 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <div className="text-[10px] text-white/40 w-16 text-right">{f.score} ({f.weight}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
      <div className="text-sm font-bold text-white">{value}</div>
      <div className="text-[9px] text-white/40">{label}</div>
    </div>
  );
}