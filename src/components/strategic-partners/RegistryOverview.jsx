import React from 'react';
import EcosystemDeploymentPanel from './EcosystemDeploymentPanel';
import EcosystemSummaries from './EcosystemSummaries';
import PartnerPipeline from './PartnerPipeline';
import StrategicPriorities from './StrategicPriorities';
import PartnerTable from './PartnerTable';

export default function RegistryOverview({ partners, analysis, onLoad, onAdd, onImport, onEdit }) {
  if (!partners.length) return <EcosystemDeploymentPanel deployed={0} onLoad={onLoad} onAdd={onAdd} onImport={onImport}/>;
  const health = [['Partner Count', analysis.partnerCount], ['Deployed', analysis.deployed], ['Active', analysis.active], ['Negotiating', analysis.negotiation], ['At Risk', analysis.atRisk], ['Dormant', analysis.dormant]];
  return <div className="space-y-5"><section><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Partner Portfolio</p><div className="mt-3"><PartnerTable partners={partners} onEdit={onEdit}/></div></section><EcosystemSummaries analysis={analysis}/><section className="rounded-xl border border-border bg-card p-5"><h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ecosystem Health</h2><div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{health.map(([label,value])=><div key={label} className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}</div></section><PartnerPipeline funnel={analysis.funnel} onLoad={onLoad}/><StrategicPriorities partners={analysis.priorityPartners}/></div>;
}