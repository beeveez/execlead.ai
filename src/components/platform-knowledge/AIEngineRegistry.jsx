import React, { useState, useMemo } from 'react';
import { SectionShell, SearchBar, Badge, Row, EmptyState } from './PKShared';
import { AI_ENGINES } from '@/lib/platformKnowledgeCenter';
import { Cpu } from 'lucide-react';

const CONFIDENCE_COLORS = { high: '#10b981', medium: '#f59e0b', low: '#ef4444' };
const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export default function AIEngineRegistry({ onSelectEngine }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return AI_ENGINES.filter((e) => !q || [e.name, e.purpose, e.id].some((f) => (f || '').toLowerCase().includes(q)));
  }, [query]);

  return (
    <SectionShell title="AI Engine Registry™" subtitle="Catalog of every AI capability on the platform" icon={Cpu}>
      <SearchBar value={query} onChange={setQuery} placeholder="Search AI engines by name or purpose..." />
      <div className="space-y-2">
        {filtered.map((e) => {
          const isOpen = expanded === e.id;
          return (
            <div key={e.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : e.id)} className="w-full p-4 text-left">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{e.name}</span>
                  <div className="flex gap-1.5">
                    <Badge color={CONFIDENCE_COLORS[e.confidence]}>{e.confidence}</Badge>
                    <Badge color={RISK_COLORS[e.risk]}>{e.risk} risk</Badge>
                  </div>
                </div>
                <p className="text-xs text-white/50">{e.purpose}</p>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Prompt</div>
                    <div className="text-xs text-white/60 italic bg-white/[0.02] rounded p-2 border border-white/5">"{e.prompt}"</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Inputs</div>
                      <div className="flex flex-wrap gap-1">{e.inputs.map((i) => <Badge key={i} color="#0ea5e9">{i}</Badge>)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Outputs</div>
                      <div className="flex flex-wrap gap-1">{e.outputs.map((o) => <Badge key={o} color="#10b981">{o}</Badge>)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Dependencies</div>
                      <div className="flex flex-wrap gap-1">{e.dependencies.map((d) => <Badge key={d} color="#64748b">{d}</Badge>)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Evidence Sources</div>
                      <div className="flex flex-wrap gap-1">{e.evidenceSources.map((s) => <Badge key={s} color="#f59e0b">{s}</Badge>)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge color="#6366f1">v{e.version}</Badge>
                    {e.policies.map((p) => <Badge key={p} color="#14b8a6">{p}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <EmptyState text="No AI engines match your search." />}
    </SectionShell>
  );
}