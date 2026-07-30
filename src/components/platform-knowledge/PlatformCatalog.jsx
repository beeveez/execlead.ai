import React, { useState, useMemo } from 'react';
import { SectionShell, SearchBar, Badge, Row, EmptyState } from './PKShared';
import { MODULES } from '@/lib/platformKnowledgeCenter';
import { Boxes, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Executive', 'Intelligence', 'Governance', 'Evidence', 'Security', 'Platform', 'Commercial', 'Enterprise', 'Community'];

export default function PlatformCatalog({ onSelectModule }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MODULES.filter((m) => {
      const matchesCat = category === 'All' || m.category === category;
      const matchesQ = !q || [m.name, m.description, m.purpose, m.category].some((f) => (f || '').toLowerCase().includes(q));
      return matchesCat && matchesQ;
    });
  }, [query, category]);

  return (
    <SectionShell title="Platform Catalog™" subtitle="Master catalog of every module" icon={Boxes}>
      <div className="flex flex-col sm:flex-row gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search modules by name, purpose, description..." />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${category === c ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((m) => (
          <Row key={m.id} onClick={() => onSelectModule?.(m.id)}>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-white">{m.name}</span>
              <Badge color={m.status === 'active' ? '#10b981' : '#f59e0b'}>{m.status}</Badge>
            </div>
            <p className="text-xs text-white/50 mb-2">{m.description}</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge color="#6366f1">{m.category}</Badge>
              <Badge color="#f59e0b">v{m.version}</Badge>
              <Badge color="#64748b">Trust {m.trustScore}</Badge>
              <Badge color="#64748b">Maturity {m.maturity}</Badge>
            </div>
            <div className="text-[10px] text-white/30 mt-2">{m.entities?.length || 0} entities · {m.routes?.length || 0} routes · {m.aiEngines?.length || 0} AI</div>
          </Row>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState text="No modules match your search." />}
      <div className="text-[10px] text-white/30 flex items-center gap-1.5 mt-2">
        <Filter size={10} /> {filtered.length} of {MODULES.length} modules
      </div>
    </SectionShell>
  );
}