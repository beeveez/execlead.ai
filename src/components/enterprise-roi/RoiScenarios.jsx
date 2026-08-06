import React, { useState } from "react";
import { calculateRoi, applyScenario, SCENARIO_PRESETS, fmtCurrency, fmtPct, fmtNum } from "@/lib/enterpriseRoiEngine";

function confBadge(label) {
  const c = label === "High" ? "text-emerald-400" : label === "Medium" ? "text-amber-400" : "text-rose-400";
  return <span className={c}>{label}</span>;
}

export default function RoiScenarios({ inputs, assumptions }) {
  const [customFactor, setCustomFactor] = useState(1);
  const presets = Object.entries(SCENARIO_PRESETS).map(([key, preset]) => {
    const a = key === "expected" ? assumptions : applyScenario(assumptions, preset.factor);
    return { key, label: preset.label, r: calculateRoi(inputs, a) };
  });
  const custom = { key: "custom", label: "Custom", r: calculateRoi(inputs, applyScenario(assumptions, customFactor)) };
  const rows = [...presets, custom];
  const cols = [
    { label: "Investment", get: (r) => fmtCurrency(r.annualPlatformInvestment) },
    { label: "Est. Value", get: (r) => fmtCurrency(r.annualGrossValue) },
    { label: "ROI", get: (r) => fmtPct(r.threeYearROI) },
    { label: "Payback", get: (r) => (r.paybackPeriod ? `${r.paybackPeriod} mo` : "—") },
    { label: "Confidence", get: (r) => confBadge(r.confidence.label) },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="text-white text-sm font-semibold mb-1">ROI Scenarios™</h3>
      <p className="text-white/45 text-xs mb-4">Compare Conservative, Expected, and Optimistic — plus a customizable scenario you can duplicate and tune.</p>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] text-white/50">Custom multiplier</span>
        <input type="range" min={0.5} max={1.5} step={0.1} value={customFactor} onChange={(e) => setCustomFactor(Number(e.target.value))} className="flex-1 max-w-xs accent-accent-orange" />
        <span className="text-[11px] text-accent-orange font-semibold">{customFactor.toFixed(1)}×</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 text-[10px] uppercase tracking-wider">
              <th className="text-left py-2 pr-4 font-semibold">Scenario</th>
              {cols.map((c) => <th key={c.label} className="text-right py-2 px-2 font-semibold">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={`border-t border-white/8 ${row.key === "custom" ? "bg-accent-orange/[0.04]" : ""}`}>
                <td className="py-2.5 pr-4 text-white/80 font-medium">{row.label}</td>
                {cols.map((c) => <td key={c.label} className="text-right py-2.5 px-2 text-white/70">{c.get(row.r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}