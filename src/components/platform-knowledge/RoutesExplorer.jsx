import React, { useState, useMemo } from 'react';
import { SectionShell, SearchBar, Badge, Row, EmptyState } from './PKShared';
import { ROUTES } from '@/lib/platformKnowledgeCenter';
import { Route } from 'lucide-react';

const WORKSPACE_COLORS = { public: '#10b981', executive: '#6366f1', enterprise: '#3b82f6', platform: '#a855f7', developer: '#f97316', commercial: '#f59e0b', community: '#ec4899', founding: '#14b8a6' };

export default function RoutesExplorer() {
  const [query, setQuery] = useState('');
  const [workspace, setWorkspace] = useState('All');
  const workspaces = ['All', ...new Set(ROUTES.map((r) => r.workspace))];
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ROUTES.filter((r) => {
      const m = !q || [r.path, r.name, r.purpose].some((f) => (f || '').toLowerCase().includes(q));
      const w = workspace === 'All' || r.workspace === workspace;
      return m && w;
    });
  }, [query, workspace]);

  return (
    <SectionShell title="Routes Explorer™" subtitle="Every route in the application router" icon={Route}>
      <SearchBar value={query} onChange={setQuery} placeholder="Search routes by path, name, or purpose..." />
      <div className="flex gap-1.5 flex-wrap">
        {workspaces.map((w) => (
          <button key={w} onClick={() => setWorkspace(w)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${workspace === w ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
            {w}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {filtered.map((r) => (
          <Row key={r.path}>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs text-indigo-300 font-mono">{r.path}</code>
              <div className="flex gap-1.5 items-center">
                <Badge color={WORKSPACE_COLORS[r.workspace] || '#64748b'}>{r.workspace}</Badge>
                <Badge color="#64748b">{r.owner}</Badge>
              </div>
            </div>
            <div className="text-xs text-white font-medium mt-1">{r.name}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{r.purpose}</div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {r.entities?.slice(0, 4).map((e) => <Badge key={e} color="#f59e0b">{e}</Badge>)}
              {r.aiEngines?.slice(0, 3).map((e) => <Badge key={e} color="#8b5cf6">{e}</Badge>)}
              <Badge color="#64748b">updated {r.lastUpdated}</Badge>
            </div>
          </Row>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState text="No routes match your search." />}
      <div className="text-[10px] text-white/30 mt-2">{filtered.length} of {ROUTES.length} routes</div>
    </SectionShell>
  );
}