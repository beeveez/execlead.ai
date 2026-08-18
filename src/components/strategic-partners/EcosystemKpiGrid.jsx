import React from 'react';
import { STRATEGIC_TARGET_CAPACITY } from '@/lib/strategic-partners/targetCatalog';

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export default function EcosystemKpiGrid({ analysis }) {
  const cards = [
    ['Strategic Targets', STRATEGIC_TARGET_CAPACITY, 'Approved ecosystem capacity'],
    ['Deployed', `${analysis.deployed} / ${STRATEGIC_TARGET_CAPACITY}`, 'Target records loaded'],
    ['Active Partnerships', analysis.active, 'Verified active relationships'],
    ['In Negotiation', analysis.negotiation, 'Recorded negotiations'],
    ['Pipeline Influenced', money(analysis.revenue.pipelineLive), 'ACTUAL only'],
    ['Revenue Influenced', money(analysis.revenue.live), 'ACTUAL only'],
  ];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{cards.map(([label, value, note]) => <div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold text-foreground">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{note}</p></div>)}</div>;
}