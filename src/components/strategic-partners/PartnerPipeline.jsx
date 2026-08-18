import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function PartnerPipeline({ funnel, onLoad }) {
  const total = funnel.reduce((sum, item) => sum + item.count, 0);
  return <section className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Partner Pipeline</h2>{!total && onLoad && <button onClick={onLoad} className="min-h-11 rounded-lg bg-primary px-3 text-xs text-primary-foreground">Load 14 Targets</button>}</div><div className="mt-5 flex gap-2 overflow-x-auto pb-2">{funnel.map((item, index) => <React.Fragment key={item.stage}><div className="min-w-32 rounded-lg border border-border bg-muted/30 p-3 text-center"><p className="text-xl font-bold">{item.count}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.stage}</p></div>{index < funnel.length - 1 && <ChevronRight className="mt-6 shrink-0 text-muted-foreground" size={16}/>}</React.Fragment>)}</div></section>;
}