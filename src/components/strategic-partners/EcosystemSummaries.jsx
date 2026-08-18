import React from 'react';
import { PARTNER_CATEGORIES } from '@/lib/strategic-partners/partnerConfig';

function Summary({ title, rows }) {
  return <section className="rounded-xl border border-border bg-card p-5"><h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</h2><div className="mt-4 space-y-3">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between text-sm"><span>{label}</span><strong>{value}</strong></div>)}</div></section>;
}

export default function EcosystemSummaries({ analysis }) {
  const coverage = PARTNER_CATEGORIES.map((category) => [category.label, analysis.categoryCounts[category.id] || 0]);
  const priorities = ['P0', 'P1', 'P2'].map((priority) => [`${priority} Strategic Targets`, analysis.priorityCounts[priority] || 0]);
  return <div className="grid gap-4 lg:grid-cols-2"><Summary title="Ecosystem Coverage™" rows={[...coverage, ['Total', analysis.deployed]]}/><Summary title="Priority Summary" rows={[...priorities, ['Total', analysis.deployed]]}/></div>;
}