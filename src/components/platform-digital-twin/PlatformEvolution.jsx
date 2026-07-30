import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SectionShell, Badge } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';

const TYPE_COLOR = { retire: 'rose', merge: 'amber', split: 'violet', commercialize: 'emerald', 'ai-opportunity': 'indigo' };

export default function PlatformEvolution() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const [filter, setFilter] = useState('all');
  const recs = twin.evolution.filter((r) => filter === 'all' || r.type === filter);
  return (
    <SectionShell title="Platform Evolution™" subtitle="AI-driven recommendations to retire, merge, split, and commercialize" icon={Sparkles}
      actions={<select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
        <option value="all">All ({twin.evolution.length})</option>
        {[...new Set(twin.evolution.map((r) => r.type))].map((t) => <option key={t} value={t}>{t}</option>)}
      </select>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {recs.map((r, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Badge color={TYPE_COLOR[r.type] || 'slate'}>{r.type}</Badge><span className="text-sm font-semibold text-white">{r.target}</span></div>
              <Badge color={r.priority === 'High' ? 'rose' : 'slate'}>{r.priority}</Badge>
            </div>
            <p className="text-[11px] text-white/50 leading-snug">{r.reason}</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <Cell label="Value" value={r.businessValue} />
              <Cell label="Cost" value={`${r.engineeringCost}h`} />
              <Cell label="Align" value={r.strategicAlignment} />
              <Cell label="Confidence" value={r.confidence} />
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
function Cell({ label, value }) {
  return <div className="bg-white/[0.02] rounded-lg py-1"><div className="text-[9px] text-white/40 uppercase">{label}</div><div className="text-xs font-bold text-white">{value}</div></div>;
}