import React, { useState, useMemo } from 'react';
import { SectionShell, SearchBar, Badge, Row, EmptyState } from './PKShared';
import { ENTITIES } from '@/lib/platformKnowledgeCenter';
import { Database } from 'lucide-react';

const LAYER_COLORS = { Database: '#f59e0b', Evidence: '#10b981', AI: '#8b5cf6', Governance: '#14b8a6', Security: '#ef4444', Analytics: '#06b6d4', Commercial: '#f97316', Enterprise: '#3b82f6', Community: '#ec4899', Platform: '#a855f7', 'Launch Defense': '#6366f1', 'Decision Lab': '#6366f1' };

export default function DatabaseExplorer() {
  const [query, setQuery] = useState('');
  const [layer, setLayer] = useState('All');
  const layers = ['All', ...new Set(ENTITIES.map((e) => e.layer))];
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ENTITIES.filter((e) => {
      const m = !q || [e.name, e.purpose].some((f) => (f || '').toLowerCase().includes(q));
      const l = layer === 'All' || e.layer === layer;
      return m && l;
    });
  }, [query, layer]);

  return (
    <SectionShell title="Database Explorer™" subtitle="Every entity, its purpose, layer, and security" icon={Database}>
      <div className="flex flex-col sm:flex-row gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search entities by name or purpose..." />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {layers.map((l) => (
          <button key={l} onClick={() => setLayer(l)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${layer === l ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((e) => (
          <Row key={e.name}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-white font-mono">{e.name}</span>
              <Badge color={LAYER_COLORS[e.layer] || '#64748b'}>{e.layer}</Badge>
            </div>
            <p className="text-[10px] text-white/40 mb-2 leading-snug">{e.purpose}</p>
            <div className="flex flex-wrap gap-1">
              <Badge color="#ef4444">{e.security}</Badge>
              <Badge color="#64748b">{e.retention}</Badge>
            </div>
            {e.usedBy?.length > 0 && (
              <div className="text-[9px] text-white/30 mt-1.5">Used by: {e.usedBy.slice(0, 3).join(', ')}{e.usedBy.length > 3 ? ` +${e.usedBy.length - 3}` : ''}</div>
            )}
          </Row>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState text="No entities match your search." />}
      <div className="text-[10px] text-white/30 mt-2">{filtered.length} of {ENTITIES.length} entities</div>
    </SectionShell>
  );
}