import React from 'react';

const states = [
  ['ACTUAL', 'Verified relationship and commercial records'],
  ['PROJECTED', 'Forecast values, never counted as actual'],
  ['TARGET', 'Strategic target with no partnership implied'],
  ['ARCHITECTURE', 'Designed capability or commercial model'],
];

export default function CommercialIntegrityLegend() {
  return <section className="flex flex-wrap gap-2" aria-label="Commercial integrity value states">{states.map(([state, meaning]) => <div key={state} className="rounded-lg border border-border bg-muted/30 px-3 py-2"><span className="text-[10px] font-bold tracking-wide text-primary">{state}</span><span className="ml-2 text-xs text-muted-foreground">{meaning}</span></div>)}</section>;
}