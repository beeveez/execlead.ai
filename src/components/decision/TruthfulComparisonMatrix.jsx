import React from 'react';

export default function TruthfulComparisonMatrix({ comparison }) {
  return <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    {comparison.map((option) => {
      const analysis = option.simulation?.explainability || {};
      return <article key={option.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <p className="text-[10px] uppercase tracking-wider text-amber-300">Illustrative Scenario — Not a Prediction</p>
        <h4 className="mt-1 text-sm font-bold text-white">{option.label}</h4>
        <p className="text-xs text-white/40">{option.simulation?.typeMeta?.label}</p>
        <Section title="Advantages" items={[option.simulation?.typeMeta?.description].filter(Boolean)} />
        <Section title="Trade-offs and risks" items={(analysis.riskFactors || []).slice(0, 3).map((item) => item.label)} />
        <Section title="Assumptions" items={(analysis.assumptions || []).slice(0, 3)} />
        <Section title="Unknowns" items={(analysis.missingEvidence || []).slice(0, 3).map((item) => item.label)} />
      </article>;
    })}
  </div>;
}

function Section({ title, items }) {
  return <div className="mt-3"><p className="text-[10px] uppercase tracking-wider text-white/30">{title}</p><ul className="mt-1 space-y-1 text-xs text-white/60">{items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>• Not established from current evidence.</li>}</ul></div>;
}