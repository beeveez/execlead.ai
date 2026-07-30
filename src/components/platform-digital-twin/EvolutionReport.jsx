import React, { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { SectionShell, Badge, StatCard } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';

export default function EvolutionReport() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const r = twin.report;
  const health = [
    { label: 'Architecture Health', value: r.architectureHealth, color: '#6366f1' },
    { label: 'Business Health', value: r.businessHealth, color: '#10b981' },
    { label: 'AI Health', value: r.aiHealth, color: '#ec4899' },
    { label: 'Commercial Health', value: r.commercialHealth, color: '#f59e0b' },
    { label: 'Enterprise Health', value: r.enterpriseHealth, color: '#06b6d4' },
  ];
  return (
    <SectionShell title="Executive Evolution Report™" subtitle="Autonomous recomputation: platform health, risks, opportunities, and strategic actions" icon={FileText}>
      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-4 mb-3">
        <p className="text-sm text-white/80">{r.platformSummary}</p>
        <p className="text-xs text-amber-300 mt-2 font-medium">⭐ {r.overallRecommendation}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
        {health.map((h) => <StatCard key={h.label} label={h.label} value={h.value} color={h.color} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ReportList title="Top Risks" items={r.topRisks} color="rose" />
        <ReportList title="Top Opportunities" items={r.topOpportunities} color="emerald" />
        <ReportList title="Immediate Actions" items={r.immediateActions} color="amber" />
        <ReportList title="Strategic Recommendations" items={r.strategicRecommendations} color="indigo" />
        <ReportList title="Engineering Priorities" items={r.engineeringPriorities} color="violet" />
        <ReportList title="Suggested ADRs" items={r.suggestedADRs} color="slate" />
        <ReportList title="Suggested Refactoring" items={r.suggestedRefactoring} color="amber" />
        <ReportList title="Suggested New Products" items={r.suggestedNewProducts} color="emerald" />
        <ReportList title="Suggested Enterprise Features" items={r.suggestedEnterpriseFeatures} color="indigo" />
        <ReportList title="Suggested Revenue Opportunities" items={r.suggestedRevenueOpportunities} color="amber" />
      </div>
    </SectionShell>
  );
}
function ReportList({ title, items, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2"><Badge color={color}>{items.length}</Badge><h3 className="text-xs font-semibold text-white/70">{title}</h3></div>
      <ul className="space-y-1">{items.length ? items.map((it, i) => <li key={i} className="text-[11px] text-white/50 leading-snug">• {it}</li>) : <li className="text-[11px] text-white/30">None detected.</li>}</ul>
    </div>
  );
}