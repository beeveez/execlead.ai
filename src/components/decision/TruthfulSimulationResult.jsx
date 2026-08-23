import React from 'react';
import { Save } from 'lucide-react';

export default function TruthfulSimulationResult({ result, onSave }) {
  const assumptions = result.explainability?.assumptions || [];
  const unknowns = result.explainability?.missingEvidence || [];
  return <div className="space-y-4 rounded-xl border border-indigo-500/10 bg-white/[0.02] p-5">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Illustrative Scenario — Not a Prediction</p><h4 className="mt-1 text-lg font-bold text-white">{result.typeMeta?.label} decision analysis</h4></div>
      {onSave && <button onClick={onSave} className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10"><Save size={12}/> Save</button>}
    </div>
    <div><p className="text-[10px] uppercase tracking-wider text-white/30">AI Interpretation</p><p className="mt-1 text-xs leading-relaxed text-white/60">Use this scenario to examine evidence, assumptions, risks, and trade-offs. It does not predict promotion, salary, readiness gains, or career timing.</p></div>
    <div className="grid gap-3 md:grid-cols-2">
      <List title="Assumptions" items={assumptions.slice(0, 4)} fallback="No assumptions documented." />
      <List title="Unknowns" items={unknowns.slice(0, 4).map((item) => item.label)} fallback="Real-world outcomes remain unknown." />
    </div>
  </div>;
}

function List({ title, items, fallback }) {
  return <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3"><p className="text-[10px] uppercase tracking-wider text-white/30">{title}</p><ul className="mt-2 space-y-1 text-xs text-white/60">{items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>• {fallback}</li>}</ul></div>;
}