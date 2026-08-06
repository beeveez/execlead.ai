import React from "react";
import { calculateRoi, applyScenario, SCENARIO_PRESETS, fmtCurrency, fmtPct } from "@/lib/enterpriseRoiEngine";

export default function RoiScenarios({ inputs, assumptions }) {
  const rows = Object.entries(SCENARIO_PRESETS).map(([key, preset]) => {
    const scAssumptions = key === "expected" ? assumptions : applyScenario(assumptions, preset.factor);
    const r = calculateRoi(inputs, scAssumptions);
    return { key, label: preset.label, r };
  });
  const cols = [
    { label: "Annual Value", get: (r) => fmtCurrency(r.annualGrossValue) },
    { label: "Net Impact", get: (r) => fmtCurrency(r.annualNetValue) },
    { label: "3-Year ROI", get: (r) => fmtPct(r.threeYearROI) },
    { label: "Payback", get: (r) => (r.paybackMonths ? `${r.paybackMonths} mo` : "—") },
    { label: "Coverage", get: (r) => `${fmtPct(r.coverageNewPct)}` },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="text-white text-sm font-semibold mb-1">ROI Scenarios™</h3>
      <p className="text-white/45 text-xs mb-4">Adjust assumptions and instantly compare Conservative, Expected, and Optimistic outcomes.</p>
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
              <tr key={row.key} className="border-t border-white/8">
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