import React, { useState, useMemo } from 'react';
import { SectionShell, Badge, EmptyState } from '@/components/platform-knowledge/PKShared';
import { getTechnicalDebt } from '@/lib/platformIntelligenceEngine/index';
import { AlertOctagon } from 'lucide-react';

const PRIO_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#64748b' };
const EFFORT_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

const CATEGORIES = [
  'Duplicate logic', 'Complex components', 'Large files', 'Performance bottlenecks',
  'Outdated architecture', 'Missing documentation', 'Unused entities', 'Unused routes',
  'Accessibility issues', 'UI inconsistencies', 'Security improvements', 'AI prompt improvements',
];

export default function TechnicalDebt() {
  const debt = useMemo(() => getTechnicalDebt(), []);
  const [filter, setFilter] = useState('all');
  const [prio, setPrio] = useState('all');

  const filtered = debt.filter((d) => (filter === 'all' || d.category === filter) && (prio === 'all' || d.priority === prio));
  const counts = { high: debt.filter((d) => d.priority === 'high').length, medium: debt.filter((d) => d.priority === 'medium').length, low: debt.filter((d) => d.priority === 'low').length };

  return (
    <SectionShell title="Technical Debt™" subtitle={`Prioritized backlog of ${debt.length} findings across ${CATEGORIES.length} categories`} icon={AlertOctagon}
      actions={
        <div className="flex gap-2">
          <Badge color="#ef4444">{counts.high} high</Badge>
          <Badge color="#f59e0b">{counts.medium} medium</Badge>
          <Badge color="#64748b">{counts.low} low</Badge>
        </div>
      }>
      <div className="flex flex-wrap gap-2 items-center">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40">
          <option value="all" className="bg-[#0a0a0f]">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
        </select>
        <select value={prio} onChange={(e) => setPrio(e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40">
          <option value="all" className="bg-[#0a0a0f]">All priorities</option>
          <option value="high" className="bg-[#0a0a0f]">High</option>
          <option value="medium" className="bg-[#0a0a0f]">Medium</option>
          <option value="low" className="bg-[#0a0a0f]">Low</option>
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState text="No technical debt matches this filter." /> : (
        <div className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge color={PRIO_COLOR[d.priority]}>{d.priority}</Badge>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{d.category}</span>
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{d.title}</div>
                  <div className="text-[11px] text-white/50 leading-snug mb-2">{d.suggestedFix}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-white/40">
                    <div><span className="text-white/30">Severity:</span> <span style={{ color: PRIO_COLOR[d.severity] }}>{d.severity}</span></div>
                    <div><span className="text-white/30">Impact:</span> {d.impact}</div>
                    <div><span className="text-white/30">Effort:</span> <span style={{ color: EFFORT_COLOR[d.effort] }}>{d.effort}</span></div>
                    <div><span className="text-white/30">Est:</span> {d.estimatedTime}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-white/35">
                    <span><span className="text-white/25">Business risk:</span> {d.businessRisk}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}